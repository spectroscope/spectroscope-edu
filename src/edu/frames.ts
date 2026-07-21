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
import { advanceScene, initialScene, isLocalProvider, type Scene } from "../lab/labScene";
import { deriveDetail, sceneToFlow } from "../lab/flowmap/sceneToFlow";
import type { EduLesson, EduStep, Loc, RevealEdge, RevealLesson, RevealNode, ScenarioLesson } from "./model";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Frame {
  nodes: Node[];
  edges: Edge[];
  /** applied events at this step (scenario mode) — for a live jsonl readout. */
  applied: RunEvent[];
  /** the provider in force this step — drives the local/remote layout key. */
  provider: string;
  /** a short "what is happening right now" line for the status bar over the map. */
  now: Loc;
  /** the lesson's STABLE camera rect — the union of every card across every step,
   *  so EduFlow can fit the frame once and never reframe as steps reveal cards.
   *  Identical on every frame of a lesson. */
  bbox: Rect;
}

// Card footprints (unscaled px) so the stable rect can be computed with no DOM —
// generous, since the rect only feeds fitBounds (padding absorbs the slack). A
// node with an explicit style width uses the larger of the two.
const FOOTPRINT: Record<string, { w: number; h: number }> = {
  user: { w: 480, h: 210 },
  agent: { w: 560, h: 500 },
  llm: { w: 460, h: 340 },
  os: { w: 210, h: 170 },
  subagent: { w: 330, h: 190 },
  ext: { w: 200, h: 130 },
  eduCard: { w: 320, h: 240 },
};

/** Bounding rect of a set of flow nodes, using each node's footprint (zones carry
 *  their real width/height in style). Pure — the whole point is a DOM-free camera. */
export function frameExtent(nodes: Node[]): Rect {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of nodes) {
    const x = n.position.x;
    const y = n.position.y;
    const styleW = (n.style as { width?: number } | undefined)?.width;
    const styleH = (n.style as { height?: number } | undefined)?.height;
    let w: number, h: number;
    if (n.type === "zone") {
      w = typeof styleW === "number" ? styleW : 200;
      h = typeof styleH === "number" ? styleH : 120;
    } else {
      const f = FOOTPRINT[n.type ?? ""] ?? { w: 320, h: 200 };
      w = typeof styleW === "number" ? Math.max(styleW, f.w) : f.w;
      h = f.h;
    }
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + w > maxX) maxX = x + w;
    if (y + h > maxY) maxY = y + h;
  }
  if (!Number.isFinite(minX)) return { x: 0, y: 0, width: 200, height: 120 };
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// Derive the live status line from the folded scene (what the packet is doing).
function nowLabel(scene: Scene): { en: string; de: string } {
  if (scene.gate === "pending") return { en: "the permission gate is deciding", de: "das permission-gate entscheidet" };
  const file = scene.activeFile ? ` ${scene.activeFile}` : "";
  switch (scene.focus) {
    case "llm":
      return { en: "the model is thinking", de: "das modell denkt" };
    case "disk":
      return scene.disk === "write"
        ? { en: `writing${file} to disk`, de: `schreibt${file} auf die disk` }
        : { en: `reading${file} from disk`, de: `liest${file} von der disk` };
    case "cmd":
      return { en: `running: ${scene.activeCommand ?? "a command"}`, de: `führt aus: ${scene.activeCommand ?? "einen befehl"}` };
    case "mcp":
      return { en: `calling mcp${scene.activeMcp ? `: ${scene.activeMcp}` : ""}`, de: `mcp-aufruf${scene.activeMcp ? `: ${scene.activeMcp}` : ""}` };
    case "gate":
      return { en: "at the permission gate", de: "am permission-gate" };
    case "user":
      return { en: "done · control is with you", de: "fertig · die kontrolle ist bei dir" };
    case "agent":
    default:
      return scene.subagents.length
        ? { en: `orchestrating ${scene.subagents.length} workers`, de: `orchestriert ${scene.subagents.length} worker` }
        : { en: "the harness is working", de: "der harness arbeitet" };
  }
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

  return {
    nodes,
    edges,
    applied: [],
    provider: "ollama",
    now: step.now ?? { en: "building the agent", de: "den agenten bauen" },
    bbox: frameExtent(nodes),
  };
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
  const applieds = cursors.map((c) => events.slice(0, c));
  const scenes = applieds.map(foldScene);
  // The lesson's max subagent count reserves a fixed slot per worker across steps.
  const subSlots = scenes.reduce((m, s) => Math.max(m, s.subagents.length), 0);

  const frames: Frame[] = lesson.steps.map((step, i) => {
    const applied = applieds[i];
    const scene = scenes[i];
    const detail = deriveDetail(applied);
    const provider = step.provider ?? lesson.dsl.provider ?? "ollama";
    const local = isLocalProvider(provider);
    const flow = sceneToFlow(scene, detail, {
      local,
      provider,
      model: lesson.model ?? "",
      systemPrompt: lesson.systemPrompt,
      lang,
      declutter: true,
      subSlots,
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
    return { nodes: flow.nodes, edges: flow.edges, applied, provider, now: nowLabel(scene), bbox: { x: 0, y: 0, width: 0, height: 0 } };
  });

  // One STABLE rect for the whole lesson: the union of every card across every
  // step (subagent slots are already fixed), so the camera fits once and holds.
  const bbox = frameExtent(frames.flatMap((f) => f.nodes));
  for (const f of frames) f.bbox = bbox;
  return frames;
}

/** Every frame of a lesson, in step order. */
export function lessonFrames(lesson: EduLesson, lang: Lang): Frame[] {
  if (lesson.mode === "scenario") return scenarioFrames(lesson, lang);
  // reveal: the stable rect spans the FULL authored catalog (every node the lesson
  // can ever show), so the camera never reframes as later steps reveal more cards.
  const bbox = frameExtent(Object.values(lesson.nodes).map((spec) => revealNode(spec, false)));
  return lesson.steps.map((s) => ({ ...revealFrame(lesson, s), bbox }));
}
