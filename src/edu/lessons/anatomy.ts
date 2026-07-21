// Lesson 1 — anatomy of an agent.
//
// Reveal mode: a raw model, wrapped layer by layer into a working agent, on the
// SAME system map the simulator draws. Start with just the llm card (the raw
// model); each step reveals another harness layer — the agent hub (context +
// loop + gate + tools), the operating-system band it acts on, session.jsonl on
// disk, the return of control, and the extensions (skills / hooks / mcp /
// subagents). Every card is inspectable (click ＋ inspect). Thesis: none of this
// is in the weights. The readout accumulates "what the harness gives you".

import type { RevealLesson } from "../model";

// --- sim-card data (the shapes lab/flowmap/nodes reads) -----------------------
const agentData = {
  active: false,
  error: false,
  focus: "agent",
  activity: { text: "the loop", color: "var(--text-dim)" },
  gate: "none",
  gateNote: "",
  gateColor: "var(--border-strong)",
  activeTool: null,
  ctxParts: [
    { label: "system prompt", chars: 900, estTokens: 225 },
    { label: "CLAUDE.md", chars: 700, estTokens: 175 },
    { label: "tool defs", chars: 800, estTokens: 200 },
    { label: "history", chars: 4200, estTokens: 1050 },
  ],
  ctxTotals: { messages: 6, estimatedTokens: 1650, threshold: 100000 },
  prompt: "",
  systemPrompt: "you are a coding agent working in this repo.",
  tool: null,
};
const llmData = { active: false, local: true, provider: "ollama", model: "qwen3.5", think: [], answer: [] };
const os = (kind: string, extra: Record<string, unknown> = {}) => ({ kind, active: false, ...extra });
const sub = {
  id: "explore",
  label: null,
  task: "explore the failing module",
  state: "working",
  stateLabel: "working",
  stateColor: "var(--warn)",
  lastStatus: "reading",
  activity: { text: "own window", color: "var(--ev-subagent)" },
  focus: "agent",
  active: false,
  think: "",
};

export const anatomy: RevealLesson = {
  id: "anatomy",
  mode: "reveal",
  difficulty: "deep",
  readoutKind: "gives",
  title: { en: "anatomy of an agent", de: "anatomie eines agenten" },
  blurb: {
    en: "a raw model only reads and writes text. watch it become a working agent one harness layer at a time, on the same map you meet in the simulator, then click any part to inspect it.",
    de: "ein rohes modell liest und schreibt nur text. sieh zu, wie es schicht für schicht zum arbeitenden agenten wird, auf derselben karte, die dir im simulator begegnet, dann klick jede komponente an.",
  },
  readout: { en: "what the harness gives you", de: "was der harness dir gibt" },
  nodes: {
    "z-mac": { id: "z-mac", type: "zone", x: 0, y: 12, w: 1180, h: 680, data: { variant: "mac", label: "your mac" } },
    "z-os": { id: "z-os", type: "zone", x: 60, y: 430, w: 800, h: 230, data: { variant: "os", label: "operating system" } },
    user: { id: "user", type: "user", x: 52, y: 150, data: { active: false, prompt: "fix the failing auth test" } },
    llm: { id: "llm", type: "llm", x: 792, y: 96, data: llmData },
    agent: { id: "agent", type: "agent", x: 300, y: 70, data: agentData },
    "os-disk": { id: "os-disk", type: "os", x: 110, y: 486, data: os("disk", { disk: "idle", file: "session.jsonl" }) },
    "os-shell": { id: "os-shell", type: "os", x: 300, y: 486, data: os("shell", { command: null }) },
    "os-mcp": { id: "os-mcp", type: "os", x: 490, y: 486, data: os("mcp", { mcp: null, tool: null }) },
    "os-net": { id: "os-net", type: "os", x: 680, y: 486, data: os("net") },
    "sub-explore": { id: "sub-explore", type: "subagent", x: 560, y: 92, data: sub },
    skills: {
      id: "skills",
      type: "eduCard",
      x: 906,
      y: 470,
      w: 176,
      data: {
        kind: "skill",
        eyebrow: "extension",
        title: { en: "skills", de: "skills" },
        sub: { en: "loaded on match", de: "lädt bei treffer" },
        detail: [
          { en: "saved instructions, loaded on match", de: "gespeicherte anweisungen, bei treffer geladen" },
          { en: "name + description always on (~100 tok)", de: "name + beschreibung immer an (~100 tok)" },
          { en: "the full body loads only when it matches", de: "der volle body lädt nur bei treffer" },
        ],
      },
    },
    hooks: {
      id: "hooks",
      type: "eduCard",
      x: 906,
      y: 566,
      w: 176,
      data: {
        kind: "harness",
        eyebrow: "extension",
        title: { en: "hooks", de: "hooks" },
        sub: { en: "fixed checkpoints", de: "feste checkpoints" },
        detail: [
          { en: "deterministic checkpoints in the loop", de: "deterministische checkpoints in der loop" },
          { en: "run at fixed points, every time", de: "laufen an festen punkten, jedes mal" },
          { en: "a prompt requests; a hook guarantees", de: "ein prompt bittet; ein hook garantiert" },
        ],
      },
    },
  },
  edges: {
    e_agent_llm: { id: "e_agent_llm", source: "agent", target: "llm", sh: "rs", th: "lt" },
    e_user_agent: { id: "e_user_agent", source: "user", target: "agent", sh: "rs", th: "lt" },
    e_agent_disk: { id: "e_agent_disk", source: "agent", target: "os-disk", sh: "bs", th: "tt" },
    e_agent_shell: { id: "e_agent_shell", source: "agent", target: "os-shell", sh: "bs", th: "tt" },
    e_agent_mcp: { id: "e_agent_mcp", source: "agent", target: "os-mcp", sh: "bs", th: "tt" },
    e_agent_net: { id: "e_agent_net", source: "agent", target: "os-net", sh: "bs", th: "tt" },
    e_agent_sub: { id: "e_agent_sub", source: "agent", target: "sub-explore", sh: "rs", th: "lt" },
    e_skills: { id: "e_skills", source: "skills", target: "agent", sh: "ls", th: "rt", dim: true },
    e_hooks: { id: "e_hooks", source: "hooks", target: "agent", sh: "ls", th: "rt", dim: true },
  },
  steps: [
    {
      show: ["llm"],
      activeNodes: ["llm"],
      cap: {
        en: "at the core sits <span class='k'>the model</span>. it reads text and writes text, that is all. it is stateless, it remembers nothing between calls, and on its own it cannot run a single thing.",
        de: "im kern sitzt <span class='k'>das modell</span>. es liest text und schreibt text, mehr nicht. es ist zustandslos, merkt sich zwischen aufrufen nichts, und kann allein keine einzige sache ausführen.",
      },
    },
    {
      show: ["z-mac", "user", "agent", "llm", "e_user_agent", "e_agent_llm"],
      activeNodes: ["agent"],
      activeEdges: ["e_agent_llm"],
      cap: {
        en: "the <span class='k'>harness</span> wraps it. every turn it <span class='k'>assembles the context window</span> (system prompt, project rules, tool defs, history) and hands that bundle to the model. click the agent to inspect what it sees.",
        de: "der <span class='k'>harness</span> hüllt es ein. jede runde <span class='k'>baut er das kontextfenster zusammen</span> (system-prompt, projekt-regeln, tool-defs, verlauf) und reicht dem modell dieses bündel. klick den agenten an, um zu sehen, was er sieht.",
      },
      reveal: [{ l: { en: "context discipline", de: "kontext-disziplin" }, s: { en: "assembly · just-in-time loading · compaction", de: "zusammenbau · bedarfsladen · compaction" } }],
    },
    {
      show: ["z-mac", "z-os", "user", "agent", "llm", "os-disk", "os-shell", "os-mcp", "os-net", "e_user_agent", "e_agent_llm", "e_agent_disk", "e_agent_shell", "e_agent_mcp", "e_agent_net"],
      activeNodes: ["os-disk", "os-shell", "os-mcp", "os-net"],
      activeEdges: ["e_agent_shell"],
      cap: {
        en: "the model can now <span class='k'>call tools</span> that act on a real <span class='k'>operating system</span>: read and write disk, run shell commands, reach connected systems over mcp, touch the network. the model names a tool; the harness runs it.",
        de: "das modell kann jetzt <span class='k'>tools aufrufen</span>, die auf ein echtes <span class='k'>betriebssystem</span> wirken: disk lesen und schreiben, shell-befehle ausführen, angebundene systeme über mcp erreichen, ins netz greifen. das modell nennt ein tool; der harness führt es aus.",
      },
      reveal: [{ l: { en: "tool access", de: "tool-zugriff" }, s: { en: "a registry: validate, execute, feed back", de: "eine registry: prüfen, ausführen, zurückspeisen" } }],
    },
    {
      show: ["z-mac", "z-os", "user", "agent", "llm", "os-disk", "os-shell", "os-mcp", "os-net", "e_user_agent", "e_agent_llm", "e_agent_disk", "e_agent_shell", "e_agent_mcp", "e_agent_net"],
      activeNodes: ["agent"],
      cap: {
        en: "but nothing side-effecting runs until it passes the <span class='k'>permission gate</span> on the agent: allow, ask, or deny, sorted by blast radius. it is the one write path, and a denial is an observation too.",
        de: "aber nichts mit nebenwirkung läuft, bevor es das <span class='k'>permission-gate</span> am agenten passiert: erlauben, fragen, ablehnen, nach blast-radius. es ist der eine schreibpfad, und auch ein nein ist eine beobachtung.",
      },
      reveal: [{ l: { en: "guardrails", de: "leitplanken" }, s: { en: "permissions · sandboxing · deny rules", de: "permissions · sandboxing · deny-regeln" } }],
    },
    {
      show: ["z-mac", "z-os", "user", "agent", "llm", "os-disk", "os-shell", "os-mcp", "os-net", "e_user_agent", "e_agent_llm", "e_agent_disk", "e_agent_shell", "e_agent_mcp", "e_agent_net"],
      activeNodes: ["agent", "llm"],
      activeEdges: ["e_agent_llm"],
      cap: {
        en: "the harness runs all of this in <span class='k'>a loop</span>: assemble, decide, gate, execute, observe, repeat, about twelve lines of code, until the model emits end_turn. MAX_TURNS is the hard brake.",
        de: "der harness führt all das in <span class='k'>einer loop</span> aus: zusammenbauen, entscheiden, gate, ausführen, beobachten, wiederholen, etwa zwölf zeilen code, bis das modell end_turn ausgibt. MAX_TURNS ist die notbremse.",
      },
      reveal: [{ l: { en: "persistence", de: "persistenz" }, s: { en: "state survives turns, sessions, restarts", de: "zustand überlebt runden, sessions, neustarts" } }],
    },
    {
      show: ["z-mac", "z-os", "user", "agent", "llm", "os-disk", "os-shell", "os-mcp", "os-net", "e_user_agent", "e_agent_llm", "e_agent_disk", "e_agent_shell", "e_agent_mcp", "e_agent_net"],
      activeNodes: ["os-disk"],
      activeEdges: ["e_agent_disk"],
      cap: {
        en: "every step is appended to <span class='k'>session.jsonl</span> on disk: the flight recorder. append-only, replayable, auditable. the whole run lives on disk, not in the chat, which is why the simulator can replay it line by line.",
        de: "jeder schritt wird an <span class='k'>session.jsonl</span> auf der disk angehängt: der flugschreiber. append-only, abspielbar, prüfbar. der ganze lauf liegt auf disk, nicht im chat, deshalb kann der simulator ihn zeile für zeile abspielen.",
      },
      reveal: [{ l: { en: "audit trail", de: "audit-spur" }, s: { en: "append-only JSONL, replayable history", de: "append-only JSONL, abspielbare historie" } }],
    },
    {
      show: ["z-mac", "z-os", "user", "agent", "llm", "os-disk", "os-shell", "os-mcp", "os-net", "e_user_agent", "e_agent_llm", "e_agent_disk", "e_agent_shell", "e_agent_mcp", "e_agent_net"],
      activeNodes: ["user"],
      activeEdges: ["e_user_agent"],
      cap: {
        en: "when the model emits <span class='k'>end_turn</span>, the loop closes and control returns to <span class='k'>you</span>. you set the goal; the harness carries the discipline in between.",
        de: "gibt das modell <span class='k'>end_turn</span> aus, schließt die loop und die kontrolle geht an <span class='k'>dich</span> zurück. du setzt das ziel; der harness trägt die disziplin dazwischen.",
      },
      reveal: [{ l: { en: "model routing", de: "model-routing" }, s: { en: "cheap for narrow steps, strong for judgement", de: "günstig für enge schritte, stark fürs urteil" } }],
    },
    {
      show: ["z-mac", "z-os", "user", "agent", "llm", "os-disk", "os-shell", "os-mcp", "os-net", "sub-explore", "skills", "hooks", "e_user_agent", "e_agent_llm", "e_agent_disk", "e_agent_shell", "e_agent_mcp", "e_agent_net", "e_agent_sub", "e_skills", "e_hooks"],
      activeNodes: ["skills", "hooks", "sub-explore", "os-mcp"],
      activeEdges: ["e_agent_sub"],
      cap: {
        en: "and it is <span class='k'>extensible</span>: skills (saved instructions), hooks (fixed checkpoints), mcp (connected systems), subagents (isolated helpers with their own window). each one plugs into the same loop.",
        de: "und es ist <span class='k'>erweiterbar</span>: skills (gespeicherte anweisungen), hooks (feste checkpoints), mcp (angebundene systeme), subagenten (isolierte helfer mit eigenem fenster). jedes klinkt sich in dieselbe loop ein.",
      },
      reveal: [{ l: { en: "delegation", de: "delegation" }, s: { en: "subagents, teams, isolated windows", de: "subagenten, teams, isolierte fenster" } }],
    },
    {
      show: ["z-mac", "z-os", "user", "agent", "llm", "os-disk", "os-shell", "os-mcp", "os-net", "sub-explore", "skills", "hooks", "e_user_agent", "e_agent_llm", "e_agent_disk", "e_agent_shell", "e_agent_mcp", "e_agent_net", "e_agent_sub", "e_skills", "e_hooks"],
      cap: {
        en: "none of this is in the model's <span class='k'>weights</span>. all of it is engineering <span class='k'>around</span> the model, and that engineering is the harness. click any card to inspect it, then meet the same cards live in the simulator.",
        de: "nichts davon steckt in den <span class='k'>gewichten</span> des modells. alles ist engineering <span class='k'>um</span> das modell herum, und dieses engineering ist der harness. klick jede karte an, dann triff dieselben karten live im simulator.",
      },
    },
  ],
};
