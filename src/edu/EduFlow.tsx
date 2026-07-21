// EduFlow — the teaching canvas. A locked-down twin of the Lab's FlowMap: it
// renders a precomputed { nodes, edges } frame (from ./frames) with the exact
// same nodeTypes/edgeTypes/background/legend as the simulator, so the cards,
// glyphs, disclosures and animated rail packets a learner sees in a lesson are
// the ones they meet in the live map. A teaching figure, not a whiteboard:
// nodes are not draggable; the learner pans/zooms to explore.

import { useEffect, useRef } from "react";
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
import "@xyflow/react/dist/style.css";
import "../lab/flowmap/flowmap.css";

// Fit floor: a rich teaching map is not fit-all to tiny — it fits to a readable
// zoom and the learner pans for the rest (how a node-graph tool behaves).
const FIT = { padding: 0.18, minZoom: 0.62, maxZoom: 1 } as const;

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
  for (let iter = 0; iter < 10; iter++) {
    let any = false;
    for (let i = 0; i < m.length; i++) {
      for (let j = i + 1; j < m.length; j++) {
        const a = m[i];
        const b = m[j];
        const oX = Math.min(a.x + a.w + PAD - b.x, b.x + b.w + PAD - a.x);
        const oY = Math.min(a.y + a.h + PAD - b.y, b.y + b.h + PAD - a.y);
        if (oX <= 0 || oY <= 0) continue;
        if (oX < oY) b.x += b.x >= a.x ? oX : -oX;
        else b.y += b.y >= a.y ? oY : -oY;
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
 *  nudges any overlap apart, then re-fits. */
function CollisionResolver({ trigger }: { trigger: unknown }) {
  const rf = useReactFlow();
  useEffect(() => {
    const run = () => {
      const moves = resolveOverlaps(readRects());
      if (moves) {
        rf.setNodes((ns) => ns.map((n) => (moves[n.id] ? { ...n, position: moves[n.id] } : n)));
        setTimeout(() => rf.fitView(FIT), 40);
      }
    };
    const t = setTimeout(run, 140);
    return () => clearTimeout(t);
  }, [trigger, rf]);
  return null;
}

export function EduFlow(props: {
  nodes: Node[];
  edges: Edge[];
  /** bump to re-fit when the container resizes (readout toggled, step change). */
  fitSignal?: number;
  /** remount the canvas when the layout world changes (local ⇄ remote flip). */
  layoutKey?: string;
}) {
  const lang = useLang();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const rfRef = useRef<ReactFlowInstance<Node, Edge> | null>(null);

  // Teaching frames are authoritative: replace nodes/edges wholesale each step
  // (no drag positions to preserve — nodes are locked).
  useEffect(() => {
    setNodes(props.nodes);
    setEdges(props.edges);
  }, [props.nodes, props.edges, setNodes, setEdges]);

  // Re-fit on step change / container resize. One-shot fit (no `duration`): an
  // animated fit runs an rAF loop the embedded preview pane stalls.
  useEffect(() => {
    const id = setTimeout(() => rfRef.current?.fitView(FIT), 0);
    return () => clearTimeout(id);
  }, [props.fitSignal, props.nodes]);

  return (
    <ExpandAllContext.Provider value={true}>
    <div className="lab-flowmap edu-flowmap" onContextMenu={(e) => e.preventDefault()}>
      <ReactFlow
        key={props.layoutKey ?? "edu"}
        className="pf-flow"
        onInit={(inst) => {
          rfRef.current = inst;
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
        fitView
        fitViewOptions={FIT}
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
