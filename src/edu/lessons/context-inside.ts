// Lesson 2: inside the context window (a gauge driven off a real run).
//
// Scenario mode: a real debugging turn, folded through the simulator's own
// engine, whose context_info / read_file / compaction events drive the gauge
// instead of hand-authored literals. The agent assembles a small fixed base,
// reads a large log (the big tool-results jump), grows its history over a couple
// of turns, drifts into context rot near the cap, then compacts and answers on a
// window that breathes again. Each teaching step mirrors that fill in win.tok, so
// the readout donut and the agent card's real context bars stay in step, and the
// seven segments plus the 32k cap match the labels a learner then meets in the
// simulator. The beat is base vs. growing, then rot, compaction, breathe, and a
// hand-off to lesson 4's four moves.

import type { ScenarioLesson } from "../model";

// The seven honest segments of the window, in gauge order. The gauge legend and
// the agent card's real context bars share these exact labels.
const SEG_LABELS = {
  system: { en: "system prompt", de: "system-prompt" },
  claude: { en: "project instructions", de: "projekt-regeln" },
  tools: { en: "tool definitions", de: "tool-definitionen" },
  skills: { en: "skills index", de: "skills-index" },
  history: { en: "conversation history", de: "gesprächsverlauf" },
  results: { en: "tool results", de: "tool-resultate" },
  turn: { en: "your current turn", de: "deine eingabe" },
};
type SegId = keyof typeof SEG_LABELS;
const SEG_ORDER: readonly SegId[] = ["system", "claude", "tools", "skills", "history", "results", "turn"];

// The window at each beat, in tokens. These same maps feed win.tok on the
// teaching steps, so the donut can never drift from the run it reads.
const T = {
  base: { system: 900, claude: 700, tools: 800, skills: 500 },
  turn: { system: 900, claude: 700, tools: 800, skills: 500, turn: 300, history: 1400 },
  read: { system: 900, claude: 700, tools: 800, skills: 500, turn: 300, history: 1900, results: 5200 },
  grow: { system: 900, claude: 700, tools: 800, skills: 500, turn: 300, history: 11000, results: 5200 },
  rot: { system: 900, claude: 700, tools: 800, skills: 500, turn: 300, history: 22000, results: 5200 },
  breathe: { system: 900, claude: 700, tools: 800, skills: 500, turn: 300, history: 2100, results: 1200 },
};

// Build a real context_info snapshot from a token map (chars = estTokens * 4), so
// the agent card's bars land byte-for-byte where the donut lands.
function ctx(tok: Partial<Record<SegId, number>>) {
  return {
    context: {
      parts: SEG_ORDER.filter((id) => (tok[id] ?? 0) > 0).map((id) => {
        const n = tok[id] ?? 0;
        return { label: SEG_LABELS[id], chars: n * 4, estTokens: n };
      }),
    },
  };
}

export const contextInside: ScenarioLesson = {
  id: "context-inside",
  mode: "scenario",
  difficulty: "deep",
  readoutKind: "gauge",
  model: "qwen3.5",
  title: { en: "inside the context window", de: "im kontextfenster" },
  blurb: {
    en: "the window is not abstract: it is a concrete stack of segments, each costing tokens, rebuilt every single turn. watch it fill, rot, and get compacted.",
    de: "das fenster ist nicht abstrakt: es ist ein konkreter stapel aus segmenten, jedes kostet tokens, jede runde neu gebaut. sieh zu, wie es sich füllt, verrottet und kompaktiert wird.",
  },
  readout: { en: "context gauge", de: "kontext-anzeige" },
  cap: 32000,
  segs: [
    { id: "system", label: SEG_LABELS.system, ev: "lifecycle", base: true },
    { id: "claude", label: SEG_LABELS.claude, ev: "lifecycle", base: true },
    { id: "tools", label: SEG_LABELS.tools, ev: "tool", base: true },
    { id: "skills", label: SEG_LABELS.skills, ev: "tool", base: true },
    { id: "history", label: SEG_LABELS.history, ev: "reasoning" },
    { id: "results", label: SEG_LABELS.results, ev: "token" },
    { id: "turn", label: SEG_LABELS.turn, ev: "subagent" },
  ],
  dsl: {
    id: "context-inside",
    name: { en: "inside the context window", de: "im kontextfenster" },
    prompt: {
      en: "The nightly build has been flaky for weeks. Read the logs and tell me the root cause.",
      de: "Der Nightly-Build ist seit Wochen wacklig. Lies die Logs und nenn mir die Ursache.",
    },
    provider: "ollama",
    system: {
      en: "You are a debugging agent. Read carefully before you conclude.",
      de: "Du bist ein Debugging-Agent. Lies sorgfältig, bevor du schlussfolgerst.",
    },
    steps: [
      {
        think: {
          en: "Before I even read the prompt, the harness has already assembled the fixed base of the window: the system prompt, the project rules, the tool definitions, the skills index.",
          de: "Bevor ich den Prompt überhaupt lese, hat der Harness die feste Basis des Fensters schon zusammengebaut: System-Prompt, Projekt-Regeln, Tool-Definitionen, Skills-Index.",
        },
      },
      ctx(T.base),
      {
        think: {
          en: "You asked about the flaky build. Your turn and my reply are now part of the history, and the history only grows from here.",
          de: "Du hast nach dem wackligen Build gefragt. Deine Eingabe und meine Antwort sind jetzt Teil des Verlaufs, und der Verlauf wächst ab hier nur noch.",
        },
      },
      ctx(T.turn),
      {
        read: "logs/nightly-build.log",
        result: {
          en: "[00:04:12] step 'integration' timed out after 600s ... 4200 more lines ... EADDRINUSE :5432 (postgres already bound)",
          de: "[00:04:12] Schritt 'integration' nach 600s abgelaufen ... 4200 weitere Zeilen ... EADDRINUSE :5432 (Postgres bereits belegt)",
        },
      },
      ctx(T.read),
      {
        think: {
          en: "Reading further back through the run: the same port clash shows up across many past nights, and every one of those turns is re-sent to me every single time.",
          de: "Ich lese weiter im Verlauf des Laufs zurück: derselbe Port-Konflikt taucht über viele frühere Nächte auf, und jede dieser Runden wird mir jedes Mal neu mitgeschickt.",
        },
      },
      ctx(T.grow),
      ctx(T.rot),
      { compact: { removedTurns: 20, summaryChars: 1600 } },
      ctx(T.breathe),
      {
        say: {
          en: "Root cause: the integration step starts postgres on :5432 while a leftover container still holds the port, so it times out. The fix is to wait for the port to free up before binding.",
          de: "Ursache: der Integrations-Schritt startet Postgres auf :5432, während ein übrig gebliebener Container den Port noch hält, also läuft er in den Timeout. Der Fix ist, auf das Freiwerden des Ports zu warten, bevor gebunden wird.",
        },
      },
    ],
  },
  steps: [
    {
      advance: { until: "context_info", nth: 2 },
      win: { tok: T.base },
      cap: {
        en: "before you type a single word, <span class='k'>this is already loaded</span>, the fixed base, read into the window every turn: system prompt, project rules, tool defs, the skills index.",
        de: "bevor du ein einziges wort tippst, ist <span class='k'>das schon geladen</span>, die feste basis, jede runde ins fenster gelesen: system-prompt, projekt-regeln, tool-defs, skills-index.",
      },
    },
    {
      advance: { until: "context_info" },
      win: { tok: T.turn },
      cap: {
        en: "you ask something. your <span class='k'>turn</span> and the model's reply append to the <span class='k'>history</span>, and history is the part that keeps growing.",
        de: "du fragst etwas. deine <span class='k'>eingabe</span> und die antwort des modells landen im <span class='k'>verlauf</span>, und der verlauf ist der teil, der immer weiter wächst.",
      },
    },
    {
      advance: { until: "context_info" },
      win: { tok: T.read },
      cap: {
        en: "the model reads a file. its bytes land in <span class='k'>tool results</span>, usually the biggest single jump. one careless <span class='k'>read_file</span> can cost more than the whole base.",
        de: "das modell liest eine datei. ihre bytes landen in <span class='k'>tool-resultate</span>, meist der größte einzelsprung. ein sorgloses <span class='k'>read_file</span> kostet mehr als die ganze basis.",
      },
    },
    {
      advance: { until: "context_info" },
      win: { tok: T.grow },
      cap: {
        en: "turn after turn, <span class='k'>history grows</span>. over a long session it becomes the dominant cost: every past exchange is re-sent, every single turn.",
        de: "runde um runde <span class='k'>wächst der verlauf</span>. über eine lange session wird er zum dominanten posten: jeder frühere austausch wird neu mitgeschickt, jede runde.",
      },
    },
    {
      advance: { until: "context_info" },
      win: { tok: T.rot, state: "error" },
      cap: {
        en: "as the window fills toward the cap, quality quietly degrades: <span class='k'>context rot</span>. the model starts to miss things at the far end of a bloated window.",
        de: "füllt sich das fenster zur kappe, sinkt die qualität leise: <span class='k'>context rot</span>. das modell übersieht dinge am fernen ende eines überladenen fensters.",
      },
    },
    {
      advance: { until: "context_info", nth: 2 },
      win: { tok: T.breathe },
      cap: {
        en: "the harness <span class='k'>compacts</span>: twenty turns of history collapse to one paragraph, stale results drop. the gist is kept, the tokens are freed, the window breathes again.",
        de: "der harness <span class='k'>kompaktiert</span>: zwanzig runden verlauf schrumpfen auf einen absatz, alte resultate fallen weg. der kern bleibt, die tokens werden frei, das fenster atmet wieder.",
      },
    },
    {
      advance: "rest",
      win: { tok: T.breathe },
      cap: {
        en: "the <span class='k'>fixed base never leaves</span>; only the growing parts are managed. that is the whole job, and the four moves (write, select, compress, isolate) are how you do it.",
        de: "die <span class='k'>feste basis bleibt immer</span>; nur die wachsenden teile werden gemanagt. das ist die ganze aufgabe, und die vier operationen (write, select, compress, isolate) sind das werkzeug dafür.",
      },
    },
  ],
};
