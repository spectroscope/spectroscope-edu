// Lesson 8 — a hook is a guarantee.
//
// Reveal mode: build the write path a tool call travels, then show that the gate
// is not the first thing it meets. Between the model and the disk sits a hook, a
// PreToolUse checkpoint the harness runs at a fixed point, every time, with no
// model judgement. This is the contrast to lesson 4's permission gate: the gate
// can pause and ask a human; a hook cannot, it just fires. One benign write is
// reformatted and passed on to the gate; one write to a secret path is blocked at
// the hook and never reaches the gate at all. Thesis: a prompt requests; a hook
// guarantees. The readout is the growing hook log.

import type { RevealLesson } from "../model";

// --- sim-card data (the shapes lab/flowmap/nodes reads) -----------------------
const modelData = { active: false, local: true, provider: "ollama", model: "qwen3.5", think: [], answer: [] };
const gateData = {
  active: false,
  error: false,
  focus: "gate",
  activity: { text: "the gate", color: "var(--text-dim)" },
  gate: "none",
  gateNote: "",
  gateColor: "var(--border-strong)",
  activeTool: null,
  ctxParts: null,
  ctxTotals: null,
  prompt: "",
  systemPrompt: null,
  tool: null,
};
const os = (kind: string, extra: Record<string, unknown> = {}) => ({ kind, active: false, ...extra });

export const hookGate: RevealLesson = {
  id: "hook-gate",
  mode: "reveal",
  difficulty: "core",
  readoutKind: "log",
  title: { en: "a hook is a guarantee", de: "ein hook ist eine garantie" },
  blurb: {
    en: "the permission gate asks a human; a hook does not. a hook is a deterministic checkpoint that fires at a fixed point in the loop, every time, and it runs before the gate ever sees the call. watch one write cross both.",
    de: "das permission-gate fragt einen menschen; ein hook nicht. ein hook ist ein deterministischer checkpoint, der an einem festen punkt in der loop feuert, jedes mal, und er läuft, bevor das gate den call überhaupt sieht. sieh einem write zu, wie er beide passiert.",
  },
  readout: { en: "hook log", de: "hook-log" },
  nodes: {
    "z-mac": { id: "z-mac", type: "zone", x: 0, y: 12, w: 1180, h: 680, data: { variant: "mac", label: "your mac" } },
    "z-os": { id: "z-os", type: "zone", x: 700, y: 452, w: 340, h: 220, data: { variant: "os", label: "operating system" } },
    model: { id: "model", type: "llm", x: 70, y: 150, data: modelData },
    hook: {
      id: "hook",
      type: "eduCard",
      x: 404,
      y: 172,
      w: 200,
      data: {
        kind: "harness",
        eyebrow: "checkpoint",
        title: { en: "hook", de: "hook" },
        sub: { en: "PreToolUse, runs every time", de: "PreToolUse, läuft jedes mal" },
        detail: [
          { en: "a deterministic checkpoint in the loop", de: "ein deterministischer checkpoint in der loop" },
          { en: "runs at a fixed point, every time, no model judgement", de: "läuft an einem festen punkt, jedes mal, ohne modell-urteil" },
          { en: "it can reformat, inject, or block a call before the gate sees it", de: "kann einen call umformatieren, ergänzen oder blocken, bevor das gate ihn sieht" },
          { en: "a prompt requests; a hook guarantees", de: "ein prompt bittet; ein hook garantiert" },
        ],
      },
    },
    agent: { id: "agent", type: "agent", x: 724, y: 110, data: gateData },
    "os-disk": { id: "os-disk", type: "os", x: 788, y: 496, data: os("disk", { disk: "idle", file: "auth.ts" }) },
  },
  edges: {
    e_model_gate: { id: "e_model_gate", source: "model", target: "agent", sh: "rs", th: "lt" },
    e_model_hook: { id: "e_model_hook", source: "model", target: "hook", sh: "rs", th: "lt" },
    e_hook_gate: { id: "e_hook_gate", source: "hook", target: "agent", sh: "rs", th: "lt" },
    e_gate_disk: { id: "e_gate_disk", source: "agent", target: "os-disk", sh: "bs", th: "tt" },
  },
  steps: [
    {
      show: ["z-mac", "z-os", "model", "agent", "os-disk"],
      showEdges: ["e_model_gate", "e_gate_disk"],
      activeNodes: ["model"],
      activeEdges: ["e_model_gate"],
      cap: {
        en: "you know this write path from the gate lesson: the model proposes a call, the <span class='k'>permission gate</span> decides, the disk executes. here the model emits <span class='k'>write_file src/auth.ts</span>.",
        de: "diesen schreibpfad kennst du aus der gate-lektion: das modell schlägt einen call vor, das <span class='k'>permission-gate</span> entscheidet, die disk führt aus. hier gibt das modell <span class='k'>write_file src/auth.ts</span> aus.",
      },
      log: { en: "model → <b>tool_use</b> · write_file src/auth.ts", de: "modell → <b>tool_use</b> · write_file src/auth.ts" },
    },
    {
      show: ["z-mac", "z-os", "model", "hook", "agent", "os-disk"],
      showEdges: ["e_model_hook", "e_hook_gate", "e_gate_disk"],
      activeNodes: ["hook"],
      activeEdges: ["e_model_hook"],
      cap: {
        en: "but the gate is not the first thing the call meets. the harness runs a <span class='k'>hook</span> before it: a <span class='k'>PreToolUse</span> checkpoint. it is not the model and not you, it is a script the harness runs at a fixed point, every single time.",
        de: "aber das gate ist nicht das erste, was der call trifft. der harness führt davor einen <span class='k'>hook</span> aus: einen <span class='k'>PreToolUse</span>-checkpoint. das ist nicht das modell und nicht du, sondern ein skript, das der harness an einem festen punkt ausführt, jedes einzelne mal.",
      },
      log: { en: "<b>PreToolUse</b> hook · fires before the gate", de: "<b>PreToolUse</b>-hook · feuert vor dem gate" },
    },
    {
      show: ["z-mac", "z-os", "model", "hook", "agent", "os-disk"],
      showEdges: ["e_model_hook", "e_hook_gate", "e_gate_disk"],
      activeNodes: ["hook"],
      activeEdges: ["e_hook_gate"],
      patch: { hook: { sub: { en: "reformat, then pass", de: "umformatieren, dann durchlassen" } } },
      cap: {
        en: "the hook fires and does its <span class='k'>deterministic</span> job on this write: it reformats the file and injects a header, then passes the cleaned call on. no judgement, no asking, the same action every run.",
        de: "der hook feuert und macht seine <span class='k'>deterministische</span> arbeit an diesem write: er formatiert die datei um und ergänzt einen header, dann reicht er den bereinigten call weiter. kein urteil, kein nachfragen, dieselbe aktion in jedem lauf.",
      },
      log: { en: "hook → reformat + inject, then <span class='g'>pass</span>", de: "hook → umformatieren + ergänzen, dann <span class='g'>durchlassen</span>" },
    },
    {
      show: ["z-mac", "z-os", "model", "hook", "agent", "os-disk"],
      showEdges: ["e_model_hook", "e_hook_gate", "e_gate_disk"],
      activeNodes: ["agent", "os-disk"],
      activeEdges: ["e_gate_disk"],
      patch: {
        agent: { gate: "allowed", gateColor: "var(--ok)", tool: { name: "write_file", input: { path: "src/auth.ts", note: "reformatted by the hook" } } },
        "os-disk": { disk: "write", file: "src/auth.ts" },
      },
      cap: {
        en: "only now does the call reach the <span class='k'>gate</span>, and here is the contrast: the gate can pause and <span class='k'>ask you</span>. you sign off, the gate <span class='a'>allows</span> it, and the write lands on <span class='k'>disk</span>.",
        de: "erst jetzt erreicht der call das <span class='k'>gate</span>, und hier ist der kontrast: das gate kann anhalten und <span class='k'>dich fragen</span>. du gibst frei, das gate <span class='a'>erlaubt</span> es, und der write landet auf der <span class='k'>disk</span>.",
      },
      log: { en: "gate → <span class='a'>allow</span> · write_file <b>lands on disk</b>", de: "gate → <span class='a'>erlaubt</span> · write_file <b>landet auf disk</b>" },
    },
    {
      show: ["z-mac", "z-os", "model", "hook", "agent", "os-disk"],
      showEdges: ["e_model_hook"],
      activeNodes: ["hook"],
      activeEdges: ["e_model_hook"],
      patch: { hook: { sub: { en: "block: .env is a protected path", de: "block: .env ist ein geschützter pfad" } } },
      cap: {
        en: "a new call arrives: <span class='k'>write_file .env</span>, the file that holds your secrets. the same hook fires first, before the gate. your call:",
        de: "ein neuer call kommt: <span class='k'>write_file .env</span>, die datei mit deinen secrets. derselbe hook feuert zuerst, vor dem gate. deine entscheidung:",
      },
      predict: {
        q: { en: "will this write reach the gate?", de: "erreicht dieser write das gate?" },
        correct: "blocked",
        options: [
          { l: { en: "yes, the gate decides", de: "ja, das gate entscheidet" }, verdict: "reach" },
          { l: { en: "no, the hook blocks it", de: "nein, der hook blockt ihn" }, verdict: "blocked" },
        ],
        reveal: {
          en: "<span class='r'>blocked</span>: the hook has a fixed rule, no writes to <span class='k'>.env</span>, and it fires before the gate is ever consulted. the gate never sees this call. deterministic, every run, no human asked.",
          de: "<span class='r'>geblockt</span>: der hook hat eine feste regel, keine writes auf <span class='k'>.env</span>, und feuert, bevor das gate überhaupt gefragt wird. das gate sieht diesen call nie. deterministisch, in jedem lauf, ohne dass jemand gefragt wird.",
        },
      },
      log: { en: "hook → <span class='r'>block</span> · .env never reaches the gate", de: "hook → <span class='r'>block</span> · .env erreicht das gate nie" },
    },
    {
      show: ["z-mac", "z-os", "model", "hook", "agent", "os-disk"],
      showEdges: ["e_model_hook", "e_hook_gate", "e_gate_disk"],
      cap: {
        en: "two checkpoints sit on one write path. a <span class='k'>prompt</span> could ask the model to avoid secrets, but it only requests, the model might still try. the <span class='k'>hook</span> removes the choice: it always fires, the same way. <span class='k'>a prompt requests; a hook guarantees.</span>",
        de: "zwei checkpoints liegen auf einem schreibpfad. ein <span class='k'>prompt</span> könnte das modell bitten, secrets zu meiden, aber er bittet nur, das modell könnte es trotzdem versuchen. der <span class='k'>hook</span> nimmt die wahl weg: er feuert immer, auf dieselbe weise. <span class='k'>ein prompt bittet; ein hook garantiert.</span>",
      },
      log: { en: "write path · <b>hook guarantees</b> · gate decides", de: "schreibpfad · <b>hook garantiert</b> · gate entscheidet" },
    },
  ],
};
