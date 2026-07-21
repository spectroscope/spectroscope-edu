// frames — turn a lesson + step into a plain React Flow { nodes, edges } frame.
//
// This is the whole "one rendering world" seam: scenario lessons fold their
// compiled event stream with the simulator's own pure functions and map the
// folded scene through sceneToFlow (identical to FlowMap); reveal lessons
// assemble the visible sim/edu cards directly. Both yield { nodes, edges } that
// EduFlow renders with the sim's nodeTypes/edgeTypes. Pure + deterministic → the
// whole builder is unit-testable with no DOM.

import type { Node, Edge } from "@xyflow/react";
import type { RunEvent } from "../events";
import type { Lang } from "../i18n/i18n";
import { compile } from "../scenario/compile";
import { advanceScene, initialScene, isLocalProvider } from "../lab/labScene";
import { deriveDetail, sceneToFlow } from "../lab/flowmap/sceneToFlow";
import type { EduLesson, EduStep, RevealEdge, RevealLesson, RevealNode, ScenarioLesson } from "./model";

export interface Frame {
  nodes: Node[];
  edges: Edge[];
  /** applied events at this step (scenario mode) — for a live jsonl readout. */
  applied: RunEvent[];
  /** the provider in force this step — drives the local/remote layout key. */
  provider: string;
}

const railEdge = (e: RevealEdge, active: boolean): Edge => ({
  id: e.id,
  source: e.source,
  target: e.target,
  sourceHandle: e.sh ?? "rs",
  targetHandle: e.th ?? "lt",
  type: "rail",
  data: { active, net: e.net ?? false, err: false, dim: e.dim ?? false, flow: active },
  zIndex: active ? 1001 : 1,
});

function revealNode(n: RevealNode, active: boolean, patch?: Record<string, unknown>): Node {
  const data = { ...n.data, ...patch, active: active || Boolean(n.data.active) };
  if (n.type === "zone") {
    return {
      id: n.id,
      type: "zone",
      position: { x: n.x, y: n.y },
      data,
      draggable: false,
      selectable: false,
      zIndex: (n.data.variant as string) === "boundary" ? 1 : 0,
      style: { width: n.w ?? 200, height: n.h ?? 120 },
    };
  }
  return {
    id: n.id,
    type: n.type,
    position: { x: n.x, y: n.y },
    data,
    zIndex: 10,
    ...(n.w ? { style: { width: n.w } } : {}),
  };
}

/** One reveal-mode step -> frame. */
export function revealFrame(lesson: RevealLesson, step: EduStep): Frame {
  const show = step.show ?? [];
  const activeNodes = new Set(step.activeNodes ?? []);
  const nodes: Node[] = show
    .map((id) => {
      const spec = lesson.nodes[id];
      if (!spec) return null;
      return revealNode(spec, activeNodes.has(id), step.patch?.[id]);
    })
    .filter((n): n is Node => n !== null);

  const showEdges = step.showEdges ?? [];
  const activeEdges = new Set(step.activeEdges ?? []);
  const edges: Edge[] = showEdges
    .map((id) => {
      const spec = lesson.edges[id];
      if (!spec) return null;
      return railEdge(spec, activeEdges.has(id));
    })
    .filter((e): e is Edge => e !== null);

  return { nodes, edges, applied: [], provider: "ollama" };
}

const foldScene = (events: RunEvent[]) => events.reduce(advanceScene, initialScene());

/** Resolve each step's absolute event cursor (applied length) from its `advance`. */
export function scenarioCursors(steps: EduStep[], events: RunEvent[]): number[] {
  let cursor = 0;
  return steps.map((s) => {
    const adv = s.advance ?? 0;
    if (adv === "rest") {
      cursor = events.length;
    } else if (typeof adv === "number") {
      cursor = Math.min(events.length, cursor + adv);
    } else {
      // { until, nth }: fold forward to just past the nth matching event.
      const nth = adv.nth ?? 1;
      let seen = 0;
      let idx = cursor;
      for (; idx < events.length; idx++) {
        if (events[idx].type === adv.until && ++seen === nth) {
          idx++;
          break;
        }
      }
      cursor = idx;
    }
    return cursor;
  });
}

/** All scenario-mode frames for a lesson (compile once, fold per step). */
export function scenarioFrames(lesson: ScenarioLesson, lang: Lang): Frame[] {
  const events = compile(lesson.dsl, lang);
  const cursors = scenarioCursors(lesson.steps, events);
  return lesson.steps.map((step, i) => {
    const applied = events.slice(0, cursors[i]);
    const scene = foldScene(applied);
    const detail = deriveDetail(applied);
    const provider = step.provider ?? lesson.dsl.provider ?? "ollama";
    const local = isLocalProvider(provider);
    const flow = sceneToFlow(scene, detail, {
      local,
      provider,
      model: lesson.model ?? "",
      systemPrompt: lesson.systemPrompt,
      lang,
    });
    // Optional teaching override: force specific rails to light this step.
    if (step.activeEdges && step.activeEdges.length) {
      const on = new Set(step.activeEdges);
      for (const e of flow.edges) {
        if (on.has(e.id)) {
          e.data = { ...(e.data as object), active: true, flow: true };
          e.zIndex = 1001;
        }
      }
    }
    return { nodes: flow.nodes, edges: flow.edges, applied, provider };
  });
}

/** Every frame of a lesson, in step order. */
export function lessonFrames(lesson: EduLesson, lang: Lang): Frame[] {
  return lesson.mode === "scenario"
    ? scenarioFrames(lesson, lang)
    : lesson.steps.map((s) => revealFrame(lesson, s));
}
