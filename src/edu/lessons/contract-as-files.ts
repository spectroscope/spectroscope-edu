// Lesson 9 — the spec survives the session.
//
// Scenario mode: a real run, but a special one, the COLD BOOT of a fresh session.
// The prior session died and took its context window with it. This run starts
// knowing nothing, then reconstructs its whole state by reading the spine off
// disk: CLAUDE.md (the rules), the frozen spec (immutable REQ-IDs), session.jsonl
// (where the last run stopped). Only then does it think, and pick the work back
// up. The durable-memory counterpart to lesson 2's ephemeral window and the far
// side of lesson 5's write. The readout is the boot log accumulating in the new
// session.jsonl.

import type { ScenarioLesson } from "../model";

export const contractAsFiles: ScenarioLesson = {
  id: "contract-as-files",
  mode: "scenario",
  difficulty: "deep",
  readoutKind: "log",
  model: "qwen3.5",
  title: { en: "the spec survives the session", de: "die spec überlebt die session" },
  blurb: {
    en: "a session dies and the context window goes with it. watch a fresh session boot and rebuild its whole state from three files on disk: the rules, the frozen spec, the run log. only files survive.",
    de: "eine session stirbt und das kontextfenster geht mit ihr. sieh einer frischen session beim booten zu, wie sie ihren ganzen zustand aus drei dateien auf disk wieder aufbaut: die regeln, die eingefrorene spec, das lauf-log. nur dateien überleben.",
  },
  readout: { en: "session.jsonl", de: "session.jsonl" },
  dsl: {
    id: "contract-as-files",
    name: { en: "the spec survives the session", de: "die spec überlebt die session" },
    prompt: {
      en: "Fresh session, the context window is empty. Pick the work back up.",
      de: "Frische session, das kontextfenster ist leer. Nimm die arbeit wieder auf.",
    },
    provider: "ollama",
    system: {
      en: "You are a coding agent resuming a project. On a cold start you know nothing that is not on disk. Rebuild your state from the files before you act.",
      de: "Du bist ein Coding-Agent, der ein Projekt wieder aufnimmt. Bei einem Kaltstart weißt du nichts, was nicht auf disk liegt. Bau deinen Zustand aus den Dateien wieder auf, bevor du handelst.",
    },
    steps: [
      {
        think: {
          en: "Cold start: my window is empty, I remember nothing from before. Before I touch anything I read the three files that hold the state: the rules, the spec, the log.",
          de: "Kaltstart: mein Fenster ist leer, ich erinnere nichts von vorher. Bevor ich irgendetwas anfasse, lese ich die drei Dateien, die den Zustand halten: die Regeln, die Spec, das Log.",
        },
      },
      {
        read: "CLAUDE.md",
        result: {
          en: "# project rules · build: npm run gate · commit after every block · docs/SPEC.md is frozen",
          de: "# projekt-regeln · build: npm run gate · nach jedem block committen · docs/SPEC.md ist eingefroren",
        },
      },
      {
        read: "docs/SPEC.md",
        result: {
          en: "REQ-1 auth header  DONE · REQ-2 retry on 503  DONE · REQ-3 backoff cap  OPEN",
          de: "REQ-1 auth-header  DONE · REQ-2 retry bei 503  DONE · REQ-3 backoff-limit  OFFEN",
        },
      },
      {
        read: "session.jsonl",
        result: {
          en: "…write_file src/http/retry.ts · run_end end_turn  (the last thing the old session did)",
          de: "…write_file src/http/retry.ts · run_end end_turn  (das letzte, was die alte session tat)",
        },
      },
      {
        think: {
          en: "State rebuilt from three files: the rules, REQ-1 and REQ-2 done, REQ-3 still open, and the log shows the retry write already landed. The plan is back, I can continue.",
          de: "Zustand aus drei Dateien wiederhergestellt: die Regeln, REQ-1 und REQ-2 fertig, REQ-3 noch offen, und das Log zeigt: der Retry-Write ist schon erfolgt. Der Plan ist zurück, ich kann weitermachen.",
        },
      },
      {
        say: {
          en: "Resuming: REQ-1 and REQ-2 are done and on disk. Next is REQ-3, the backoff cap. Nothing was lost across the restart, because it all lived in files.",
          de: "Ich mache weiter: REQ-1 und REQ-2 sind fertig und auf disk. Als nächstes REQ-3, das Backoff-Limit. Über den Neustart ging nichts verloren, weil alles in Dateien lag.",
        },
      },
    ],
  },
  steps: [
    {
      advance: { until: "context_info" },
      cap: {
        en: "the last session ended and the process died. now a <span class='k'>fresh session boots</span>. the window is assembled from scratch: system prompt, tools, your new message. none of the old turns are here. so ask first: <span class='k'>after the restart, what does the agent still know?</span>",
        de: "die letzte session endete und der prozess starb. jetzt <span class='k'>bootet eine frische session</span>. das fenster wird von grund auf gebaut: system-prompt, tools, deine neue nachricht. keine der alten runden ist hier. also frag zuerst: <span class='k'>was weiß der agent nach dem neustart noch?</span>",
      },
      predict: {
        q: { en: "what survived?", de: "was überlebte?" },
        correct: "disk",
        options: [
          { l: { en: "everything from last time", de: "alles von letztem mal" }, verdict: "everything" },
          { l: { en: "only what is on disk", de: "nur was auf disk liegt" }, verdict: "disk" },
          { l: { en: "nothing at all", de: "gar nichts" }, verdict: "nothing" },
        ],
        reveal: {
          en: "<span class='k'>only what is on disk</span>: the context window is wiped on restart. CLAUDE.md, the spec and session.jsonl survive because they are files. everything the model held in the window is gone.",
          de: "<span class='k'>nur was auf disk liegt</span>: das kontextfenster wird beim neustart gelöscht. CLAUDE.md, die spec und session.jsonl überleben, weil sie dateien sind. alles, was das modell im fenster hielt, ist weg.",
        },
      },
      log: { en: "<b>boot</b> · fresh window · only files survive", de: "<b>boot</b> · frisches fenster · nur dateien überleben" },
    },
    {
      advance: { until: "tool_result" },
      cap: {
        en: "knowing nothing, the agent does the only thing it can: it <span class='k'>reads the spine</span>, the handful of files that carry the state. first <span class='k'>CLAUDE.md</span>: the project rules, how to build, how to commit.",
        de: "da es nichts weiß, tut der agent das einzige, was es kann: es <span class='k'>liest das rückgrat</span>, die handvoll dateien, die den zustand tragen. zuerst <span class='k'>CLAUDE.md</span>: die projekt-regeln, wie gebaut, wie committet wird.",
      },
      log: { en: "read_file <b>CLAUDE.md</b> · project rules recovered", de: "read_file <b>CLAUDE.md</b> · projekt-regeln wiederhergestellt" },
    },
    {
      advance: { until: "tool_result" },
      cap: {
        en: "then the <span class='k'>spec</span>. its <span class='k'>REQ-IDs are immutable</span>: REQ-1 and REQ-2 done, REQ-3 still open. the spec is frozen on disk, so it means the same thing to every session that reads it.",
        de: "dann die <span class='k'>spec</span>. ihre <span class='k'>REQ-IDs sind unveränderlich</span>: REQ-1 und REQ-2 fertig, REQ-3 noch offen. die spec liegt eingefroren auf disk, also bedeutet sie für jede session, die sie liest, dasselbe.",
      },
      log: { en: "read_file <b>docs/SPEC.md</b> · REQ-1..3 · frozen ids", de: "read_file <b>docs/SPEC.md</b> · REQ-1..3 · eingefrorene ids" },
    },
    {
      advance: { until: "tool_result" },
      cap: {
        en: "last, <span class='k'>session.jsonl</span>, the append-only flight recorder from lesson 1. its final lines show <span class='k'>where the old run stopped</span>: the retry write already landed on disk.",
        de: "zuletzt <span class='k'>session.jsonl</span>, der append-only flugschreiber aus lektion 1. seine letzten zeilen zeigen, <span class='k'>wo der alte lauf stoppte</span>: der retry-write liegt schon auf disk.",
      },
      log: { en: "read_file <b>session.jsonl</b> · last line = where i stopped", de: "read_file <b>session.jsonl</b> · letzte zeile = wo ich stoppte" },
    },
    {
      advance: { until: "thinking_delta" },
      cap: {
        en: "three files, and the <span class='k'>plan is back</span>: the rules, the frozen spec, the last durable change. none of it came from memory. the agent reconstructed its whole state <span class='k'>from disk</span>.",
        de: "drei dateien, und der <span class='k'>plan ist zurück</span>: die regeln, die eingefrorene spec, die letzte dauerhafte änderung. nichts davon kam aus dem gedächtnis. der agent hat seinen ganzen zustand <span class='k'>von disk</span> rekonstruiert.",
      },
      log: { en: "state rebuilt · <b>from disk, not memory</b>", de: "zustand wiederhergestellt · <b>von disk, nicht aus dem gedächtnis</b>" },
    },
    {
      advance: "rest",
      cap: {
        en: "so it <span class='k'>picks the work back up</span> at REQ-3, exactly where the last session left off. this is the far side of lesson 5's <span class='k'>write</span>: what you write to disk is what survives the session. the window is ephemeral; the files are the memory.",
        de: "also <span class='k'>nimmt es die arbeit wieder auf</span> bei REQ-3, genau da, wo die letzte session aufhörte. das ist die andere seite von lektion 5s <span class='k'>write</span>: was du auf disk schreibst, überlebt die session. das fenster ist flüchtig; die dateien sind das gedächtnis.",
      },
      log: { en: "resume at <b>REQ-3</b> · the spec survived the session", de: "weiter bei <b>REQ-3</b> · die spec überlebte die session" },
    },
  ],
};
