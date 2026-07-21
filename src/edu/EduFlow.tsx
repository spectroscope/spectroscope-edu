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
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "@xyflow/react";
import { t } from "../i18n/i18n";
import { useLang } from "../state/lang";
import { edgeTypes } from "../lab/flowmap/PacketEdge";
import { eduNodeTypes } from "./EduNodes";
import "@xyflow/react/dist/style.css";
import "../lab/flowmap/flowmap.css";

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
    const id = setTimeout(() => rfRef.current?.fitView({ padding: 0.16 }), 0);
    return () => clearTimeout(id);
  }, [props.fitSignal, props.nodes]);

  return (
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
        fitViewOptions={{ padding: 0.16 }}
        minZoom={0.3}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: "rail" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={26} size={1.4} color="var(--border-strong)" />
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
  );
}
