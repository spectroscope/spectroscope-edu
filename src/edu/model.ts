// The edu lesson model — v2, unified on the simulator's rendering world.
//
// A lesson drives the SAME cards the simulator draws (agent / os band / llm / ext
// / subagent / zones from lab/flowmap/nodes) plus a few edu-only abstraction cards
// (skills, hooks, the loop) for concepts the live map has no node for. Every
// lesson resolves, per step, to a plain { nodes, edges } frame (see ./frames) that
// renders through one locked-down React Flow host (./EduFlow).
//
// Two drive modes:
//  - "scenario": the lesson IS an agent run. It carries a scenario `dsl`; we
//    compile(dsl, lang) -> RunEvent[] and fold it with the sim's own pure folds,
//    so the map, the network boundary, the gate and the subagents are the exact
//    same machinery the simulator replays. Each teaching step advances the event
//    cursor (see EduStep.advance).
//  - "reveal": a structural build-up (e.g. the anatomy) that is not a run. It
//    declares a catalog of nodes/edges and each step shows/《highlights》a subset.
//
// The readout feeds (win / stat / cost / reveal / log) and the predict contract
// are byte-identical to the shipped EduReadout, and the eduStore progress contract
// (localStorage "spectroscope:edu", { completed, lastStep }) is preserved.

import type { Dsl } from "../scenario/dsl";
import type { RunEvent } from "../events";

export type Loc = string | { en: string; de?: string };

// The one colour world learners carry into the simulator's Spectrum/Trace.
export type EvKind = "token" | "tool" | "gate" | "subagent" | "lifecycle" | "reasoning";

// ---------------------------------------------------------------------------
// Readout (right rail) — contracts unchanged from the shipped EduReadout.
// ---------------------------------------------------------------------------
export type ReadoutKind = "log" | "budget" | "cost" | "gives" | "gauge" | "none";

export interface EduSeg {
  id: string;
  label: Loc;
  ev: EvKind;
  base?: boolean;
}

export interface EduOption {
  l: Loc;
  verdict: string;
}
export interface EduPredict {
  q: Loc;
  correct: string;
  options: EduOption[];
  reveal: Loc;
}

// ---------------------------------------------------------------------------
// edu abstraction card — for harness parts the live map has no node for
// (skills / hooks / the loop / session.jsonl-as-concept). Rendered by EduCard
// in the sim's visual language; the left tick colour follows `kind`.
// ---------------------------------------------------------------------------
export type CardKind = "human" | "model" | "harness" | "gate" | "log" | "token" | "sub" | "skill";
export interface EduCardData {
  kind: CardKind;
  eyebrow?: string;
  title: Loc;
  sub?: Loc;
  /** click-to-inspect rows (reveal-on-click). */
  detail?: Loc[];
  /** progressive-disclosure body (loads/《expands》on match). */
  body?: { n: string; t: Loc }[];
  /** a workspace file listing (durable state on disk); isNew highlights a fresh write. */
  files?: { name: string; isNew?: boolean }[];
  expanded?: boolean;
  active?: boolean;
  [k: string]: unknown;
}

// ---------------------------------------------------------------------------
// reveal-mode catalog: a node is either a sim card (type from the sim's
// nodeTypes, data = that card's data shape) or an edu card (type "eduCard").
// Positions live in the sim's world coordinates.
// ---------------------------------------------------------------------------
export interface RevealNode {
  id: string;
  /** sim node type ("agent"|"os"|"llm"|"ext"|"subagent"|"user"|"zone") or "eduCard". */
  type: string;
  x: number;
  y: number;
  /** zones need an explicit size. */
  w?: number;
  h?: number;
  data: Record<string, unknown>;
}
export interface RevealEdge {
  id: string;
  source: string;
  target: string;
  /** handle ids on the sim cards: side letter + s(ource)/t(arget), e.g. "rs","lt","bs","tt". */
  sh?: string;
  th?: string;
  net?: boolean;
  dim?: boolean;
}

// ---------------------------------------------------------------------------
// A teaching step. Readout fields are shared across modes; the map directive
// differs by mode.
// ---------------------------------------------------------------------------
export interface EduStep {
  cap: Loc;
  predict?: EduPredict;
  /** optional "what is happening now" line for the status bar (reveal lessons;
   *  scenario lessons derive it from the folded scene). */
  now?: Loc;

  // readout feeds (identical to the shipped EduReadout contracts)
  win?: { tok: Record<string, number>; state?: "ok" | "warn" | "error" };
  stat?: { label: Loc; val: string };
  cost?: { n: number; note: Loc };
  reveal?: { l: Loc; s: Loc }[];
  log?: Loc;

  // scenario mode — how far to fold the compiled event stream for THIS step,
  // always measured FORWARD from the previous step's cursor (every marker
  // advances):
  //  number         : advance the cursor by exactly N more events
  //  "rest"         : fold everything remaining (use on the last step)
  //  { until, nth } : advance to just past the nth (default 1) NEXT event of
  //                   `until` after the current cursor. Successive
  //                   { until: "tool_call" } steps each land on the next
  //                   tool_call; use nth>1 to skip an intervening occurrence.
  advance?: number | "rest" | { until: RunEvent["type"]; nth?: number };
  /** flip the network boundary for this step (local ⇄ remote). */
  provider?: string;

  // reveal mode — the visible/highlighted subset this step.
  show?: string[];
  showEdges?: string[];
  activeNodes?: string[];
  activeEdges?: string[];
  /** per-node data patch (e.g. { pdf: { expanded: true } }). */
  patch?: Record<string, Record<string, unknown>>;
}

export interface EduLessonBase {
  id: string;
  difficulty: "intro" | "core" | "deep";
  title: Loc;
  blurb: Loc;
  readoutKind: ReadoutKind;
  /** readout panel label. */
  readout?: Loc;
  /** gauge cap (tokens) + segments, when readoutKind === "gauge". */
  cap?: number;
  segs?: EduSeg[];
  steps: EduStep[];
}

export interface ScenarioLesson extends EduLessonBase {
  mode: "scenario";
  dsl: Dsl;
  /** model name shown in the llm card. */
  model?: string;
  systemPrompt?: string;
}
export interface RevealLesson extends EduLessonBase {
  mode: "reveal";
  nodes: Record<string, RevealNode>;
  edges: Record<string, RevealEdge>;
}
export type EduLesson = ScenarioLesson | RevealLesson;

export interface Planned {
  title: Loc;
  chip: Loc;
}
