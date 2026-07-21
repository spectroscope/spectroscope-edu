// EduFlow — the teaching canvas. A locked-down twin of the Lab's FlowMap: it
// renders a precomputed { nodes, edges } frame (from ./frames) with the exact
// same nodeTypes/edgeTypes/background/legend as the simulator, so the cards,
// glyphs, disclosures and animated rail packets a learner sees in a lesson are
// the ones they meet in the live map. A teaching figure, not a whiteboard:
// nodes are not draggable; the learner pans/zooms to explore.

import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "@xyflow/react";
import { t } from "../i18n/i18n";
import { useLang } from "../state/lang";
import { edgeTypes } from "../lab/flowmap/PacketEdge";
import { ExpandAllContext } from "../lab/flowmap/expandContext";
import { eduNodeTypes } from "./EduNodes";
import type { Rect as CameraRect } from "./frames";
import "@xyflow/react/dist/style.css";
import "../lab/flowmap/flowmap.css";

// Fit floor: a rich teaching map is not fit-all to tiny — it fits to a readable
// zoom and the learner pans for the rest (how a node-graph tool behaves).
const FIT = { padding: 0.18, minZoom: 0.62, maxZoom: 1 } as const;
// Screen-px bands reserved for the floating overlays so no card hides behind them:
// the "now" status bar hovers over the top, the legend + zoom controls over the
// bottom-left. The content is centered in the band that remains.
const RESERVE_TOP = 96;
const RESERVE_BOTTOM = 60;
const RESERVE_SIDE = 40;

/** Fit the lesson's STABLE rect (node-independent) into the pane, centered in the
 *  band left between the top/bottom overlays. A manual viewport (not fitBounds) so
 *  the reserved bands are asymmetric and the cards read as big as the space allows.
 *  Node-independent → the camera never moves as steps reveal or resize cards. */
function fitTo(inst: ReactFlowInstance<Node, Edge>, bbox: CameraRect | undefined, W: number, H: number) {
  if (!bbox || bbox.width <= 0 || bbox.height <= 0 || W <= 0 || H <= 0) {
    inst.fitView(FIT);
    return;
  }
  const availW = Math.max(60, W - 2 * RESERVE_SIDE);
  const availH = Math.max(60, H - RESERVE_TOP - RESERVE_BOTTOM);
  const zoom = Math.min(1.6, Math.max(0.3, Math.min(availW / bbox.width, availH / bbox.height)));
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;
  inst.setViewport({
    x: RESERVE_SIDE + availW / 2 - cx * zoom,
    y: RESERVE_TOP + availH / 2 - cy * zoom,
    zoom,
  });
}

// A collision check: with the cards expanded by default, an authored position can
// leave two cards overlapping. This reads the REAL measured card sizes after
// layout and nudges any overlapping pair apart along its shortest axis (a few
// passes until stable) — so nothing is ever "placed where something already is".
// Zones are containers and stay put; only real cards move.
const PAD = 26;
interface Rect { id: string; x: number; y: number; w: number; h: number; zone: boolean }

// Read the TRUE rendered card rects from the DOM (offsetWidth/Height are unscaled;
// the node transform is the flow position). This is reliable where the node's
// measured dimensions in the store may not be populated yet.
function readRects(): Rect[] {
  return [...document.querySelectorAll<HTMLElement>(".react-flow__node")]
    .map((el) => {
      const m = el.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
      return {
        id: el.getAttribute("data-id") ?? "",
        x: m ? parseFloat(m[1]) : 0,
        y: m ? parseFloat(m[2]) : 0,
        w: el.offsetWidth,
        h: el.offsetHeight,
        zone: el.className.includes("__node-zone"),
      };
    })
    .filter((r) => r.id !== "" && r.w > 0);
}

// Nudge overlapping cards apart along the shortest axis (zones are containers and
// stay put). Returns the moved positions, or null if nothing overlapped.
function resolveOverlaps(rects: Rect[]): Record<string, { x: number; y: number }> | null {
  const m = rects.filter((r) => !r.zone).map((r) => ({ ...r }));
  const start = new Map(m.map((r) => [r.id, { x: r.x, y: r.y }]));
  for (let iter = 0; iter < 12; iter++) {
    let any = false;
    for (let i = 0; i < m.length; i++) {
      for (let j = i + 1; j < m.length; j++) {
        const a = m[i];
        const b = m[j];
        const oX = Math.min(a.x + a.w + PAD - b.x, b.x + b.w + PAD - a.x);
        const oY = Math.min(a.y + a.h + PAD - b.y, b.y + b.h + PAD - a.y);
        if (oX <= 0 || oY <= 0) continue;
        // Always push the RIGHT-most / LOWER card further right / down — never up or
        // left. On a teaching map the topmost card (the agent) must stay anchored;
        // flinging it up would hide its header behind the "now" bar and off-screen.
        if (oX < oY) {
          if (a.x <= b.x) b.x += oX;
          else a.x += oX;
        } else {
          if (a.y <= b.y) b.y += oY;
          else a.y += oY;
        }
        any = true;
      }
    }
    if (!any) break;
  }
  const moves: Record<string, { x: number; y: number }> = {};
  for (const r of m) {
    const s = start.get(r.id)!;
    if (Math.abs(s.x - r.x) > 0.5 || Math.abs(s.y - r.y) > 0.5) moves[r.id] = { x: r.x, y: r.y };
  }
  return Object.keys(moves).length ? moves : null;
}

/** Runs inside <ReactFlow>; after the cards render it reads their real sizes and
 *  nudges any overlap apart. It does NOT re-fit: the camera is pinned to the
 *  lesson's stable rect, and the nudge only separates two cards inside it. Because
 *  EduFlow preserves positions across steps, a nudge sticks — it never re-runs and
 *  jitters step after step. */
function CollisionResolver({ trigger }: { trigger: unknown }) {
  const rf = useReactFlow();
  useEffect(() => {
    const run = () => {
      const moves = resolveOverlaps(readRects());
      if (moves) rf.setNodes((ns) => ns.map((n) => (moves[n.id] ? { ...n, position: moves[n.id] } : n)));
    };
    const t = setTimeout(run, 140);
    return () => clearTimeout(t);
  }, [trigger, rf]);
  return null;
}

export function EduFlow(props: {
  nodes: Node[];
  edges: Edge[];
  /** the lesson's STABLE camera rect (from ./frames) — same on every step. */
  bbox?: CameraRect;
  /** bump to re-fit when the container resizes (readout toggled). */
  fitSignal?: number;
  /** remount the canvas when the layout world changes (local ⇄ remote flip). */
  layoutKey?: string;
}) {
  const lang = useLang();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const rfRef = useRef<ReactFlowInstance<Node, Edge> | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Fit the stable rect into the CURRENT pane size (reads the wrapper's own box, so
  // the reserved overlay bands are in the same px space as the fit).
  const bbox = props.bbox;
  const fitNow = useCallback(() => {
    const inst = rfRef.current;
    const el = wrapRef.current;
    if (inst && el) fitTo(inst, bbox, el.clientWidth, el.clientHeight);
  }, [bbox]);

  // Teaching frames are authoritative for WHICH cards and WHAT data, but positions
  // are STICKY: a node that persists across a step keeps the position it already
  // has (its authored slot, or a slot the collision resolver nudged it to), so a
  // step never snaps cards back and re-nudges them. Only brand-new cards (a worker
  // that just spawned) take their authored position. This is the anti-jitter core.
  useEffect(() => {
    setNodes((prev) => {
      const posById = new Map(prev.map((n) => [n.id, n.position]));
      return props.nodes.map((n) => {
        const held = posById.get(n.id);
        return held ? { ...n, position: held } : n;
      });
    });
    setEdges(props.edges);
  }, [props.nodes, props.edges, setNodes, setEdges]);

  // Fit ONCE per lesson (and on container resize) to the stable rect — NOT per
  // step. The rect is node-independent, so revealing cards never moves the camera.
  // One-shot fit (no `duration`): an animated fit runs an rAF loop the embedded
  // preview pane stalls. bbox is referentially stable across a lesson's frames.
  useEffect(() => {
    const id = setTimeout(fitNow, 0);
    return () => clearTimeout(id);
  }, [props.layoutKey, props.fitSignal, fitNow]);

  // Recenter on a window resize (the only in-lesson container change).
  useEffect(() => {
    const onResize = () => fitNow();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [fitNow]);

  return (
    <ExpandAllContext.Provider value={true}>
    <div className="lab-flowmap edu-flowmap" ref={wrapRef} onContextMenu={(e) => e.preventDefault()}>
      <ReactFlow
        key={props.layoutKey ?? "edu"}
        className="pf-flow"
        onInit={(inst) => {
          rfRef.current = inst;
          fitNow();
        }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={eduNodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={[1, 2]}
        minZoom={0.3}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: "rail" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={26} size={1.4} color="var(--border-strong)" />
        <CollisionResolver trigger={props.nodes} />
        <Controls showInteractive={false} />
        <Panel position="bottom-left">
          <div className="pf-legend">
            <span>
              <i className="on" />
              {t(lang, "map.legend.activeRail")}
            </span>
            <span>
              <i />
              {t(lang, "map.legend.inside")}
            </span>
            <span>
              <i className="net" />
              {t(lang, "map.legend.out")}
            </span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
    </ExpandAllContext.Provider>
  );
}
