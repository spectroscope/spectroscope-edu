// Lesson 4 — the gate decides.
//
// Reveal mode: predict-then-reveal on the SAME agent hub + operating-system band
// the simulator draws. The model proposes one tool call per step; the gate on the
// agent card holds it (pending), the tool chip lights, and the matching OS card
// lights up to show the blast radius the call reaches for: a read touches the disk
// read-only, a write arms the disk-write pill, curl piped into a shell reaches the
// net and the shell at once. You guess the verdict (allow, ask, deny) before the
// harness reveals it. Three calls of rising blast radius, then the summary: the
// gate is the one write path, every verdict logged as an observation. The readout
// is the growing gate log, each line withheld until you answer.

import type { RevealLesson } from "../model";

// --- sim-card data (the shapes lab/flowmap/nodes reads) -----------------------
const agentData = {
  active: false,
  error: false,
  focus: "agent",
  activity: { text: "the one write path", color: "var(--text-dim)" },
  gate: "none",
  gateNote: "",
  gateColor: "var(--border-strong)",
  activeTool: null,
  ctxParts: null,
  ctxTotals: null,
  prompt: "",
  systemPrompt: "you are a coding agent working in this repo.",
  tool: null,
};
const os = (kind: string, extra: Record<string, unknown> = {}) => ({ kind, active: false, ...extra });

// A gate holding a proposed call: pending (amber), the tool chip lit, the call
// inspectable in the context disclosure. Verdict stays withheld for the predict.
const proposing = (tool: string, tCall: { name: string; input: unknown }) => ({
  gate: "pending",
  gateColor: "var(--warn)",
  gateNote: "deciding",
  focus: "gate",
  activity: { text: "gate: deciding", color: "var(--warn)" },
  activeTool: tool,
  tool: tCall,
});

export const gate: RevealLesson = {
  id: "gate",
  mode: "reveal",
  difficulty: "core",
  readoutKind: "log",
  title: { en: "the gate decides", de: "das gate entscheidet" },
  blurb: {
    en: "every tool call passes one gate: allow, ask, or deny. read the blast radius on the operating-system band, then guess each verdict before the harness reveals it. the gate is the one write path.",
    de: "jeder tool-call passiert ein gate: erlauben, fragen oder ablehnen. lies den blast-radius am betriebssystem-band ab, dann rate jedes urteil, bevor der harness es zeigt. das gate ist der eine schreibpfad.",
  },
  readout: { en: "gate log", de: "gate-log" },
  nodes: {
    "z-mac": { id: "z-mac", type: "zone", x: 0, y: 12, w: 1180, h: 660, data: { variant: "mac", label: "your mac" } },
    "z-os": { id: "z-os", type: "zone", x: 70, y: 432, w: 880, h: 200, data: { variant: "os", label: "operating system" } },
    agent: { id: "agent", type: "agent", x: 440, y: 110, data: agentData },
    "os-disk": { id: "os-disk", type: "os", x: 200, y: 490, data: os("disk", { disk: "idle", file: null }) },
    "os-shell": { id: "os-shell", type: "os", x: 440, y: 490, data: os("shell", { command: null }) },
    "os-net": { id: "os-net", type: "os", x: 690, y: 490, data: os("net") },
  },
  edges: {
    e_agent_disk: { id: "e_agent_disk", source: "agent", target: "os-disk", sh: "bs", th: "tt" },
    e_agent_shell: { id: "e_agent_shell", source: "agent", target: "os-shell", sh: "bs", th: "tt" },
    e_agent_net: { id: "e_agent_net", source: "agent", target: "os-net", sh: "bs", th: "tt" },
  },
  steps: [
    // 1 — read_file config.json → allow (no blast radius: the disk lights read-only).
    {
      show: ["z-mac", "z-os", "agent", "os-disk", "os-shell", "os-net"],
      showEdges: ["e_agent_disk", "e_agent_shell", "e_agent_net"],
      activeNodes: ["agent", "os-disk"],
      activeEdges: ["e_agent_disk"],
      patch: {
        agent: proposing("read_file", { name: "read_file", input: { path: "config.json" } }),
        "os-disk": { disk: "read", file: "config.json" },
      },
      cap: {
        en: "the model proposes <span class='k'>read_file config.json</span>. before it runs, the gate stops it. your call: allow, ask, or deny?",
        de: "das modell schlägt <span class='k'>read_file config.json</span> vor. bevor es läuft, stoppt das gate. deine entscheidung: erlauben, fragen, ablehnen?",
      },
      predict: {
        q: { en: "verdict?", de: "urteil?" },
        correct: "allow",
        options: [
          { l: { en: "allow", de: "erlauben" }, verdict: "allow" },
          { l: { en: "ask", de: "fragen" }, verdict: "ask" },
          { l: { en: "deny", de: "ablehnen" }, verdict: "deny" },
        ],
        reveal: {
          en: "<span class='k'>allow</span>: a read has no blast radius. read-only calls run without ever stopping you.",
          de: "<span class='k'>erlauben</span>: ein read hat keinen blast-radius. nur-lese-calls laufen, ohne dich je zu stoppen.",
        },
      },
      log: {
        en: "read_file config.json → <span class='a'>allow</span>",
        de: "read_file config.json → <span class='a'>erlaubt</span>",
      },
    },
    // 2 — write_file src/auth.ts → ask (a write arms the disk-write pill).
    {
      show: ["z-mac", "z-os", "agent", "os-disk", "os-shell", "os-net"],
      showEdges: ["e_agent_disk", "e_agent_shell", "e_agent_net"],
      activeNodes: ["agent", "os-disk"],
      activeEdges: ["e_agent_disk"],
      patch: {
        agent: proposing("write_file", { name: "write_file", input: { path: "src/auth.ts" } }),
        "os-disk": { disk: "write", file: "src/auth.ts" },
      },
      cap: {
        en: "now it proposes <span class='k'>write_file src/auth.ts</span>, a change to your files. allow, ask, or deny?",
        de: "jetzt schlägt es <span class='k'>write_file src/auth.ts</span> vor, eine änderung an deinen dateien. erlauben, fragen, ablehnen?",
      },
      predict: {
        q: { en: "verdict?", de: "urteil?" },
        correct: "ask",
        options: [
          { l: { en: "allow", de: "erlauben" }, verdict: "allow" },
          { l: { en: "ask", de: "fragen" }, verdict: "ask" },
          { l: { en: "deny", de: "ablehnen" }, verdict: "deny" },
        ],
        reveal: {
          en: "<span class='k'>ask</span>: a write changes your files, so by default the harness pauses for your sign-off. a denial would be logged as an observation too.",
          de: "<span class='k'>fragen</span>: ein write ändert deine dateien, also pausiert der harness standardmäßig für deine freigabe. auch ein nein käme als beobachtung ins log.",
        },
      },
      log: {
        en: "write_file src/auth.ts → <span class='a'>ask</span> · you sign off",
        de: "write_file src/auth.ts → <span class='a'>fragen</span> · du gibst frei",
      },
    },
    // 3 — run_command curl x.sh | sh → deny (reaches net + shell at once).
    {
      show: ["z-mac", "z-os", "agent", "os-disk", "os-shell", "os-net"],
      showEdges: ["e_agent_disk", "e_agent_shell", "e_agent_net"],
      activeNodes: ["agent", "os-shell", "os-net"],
      activeEdges: ["e_agent_shell", "e_agent_net"],
      patch: {
        agent: proposing("run_command", { name: "run_command", input: { command: "curl x.sh | sh" } }),
        "os-shell": { command: "curl x.sh | sh" },
      },
      cap: {
        en: "and now <span class='k'>run_command: curl x.sh | sh</span>, network straight into a shell. allow, ask, or deny?",
        de: "und jetzt <span class='k'>run_command: curl x.sh | sh</span>, netz direkt in eine shell. erlauben, fragen, ablehnen?",
      },
      predict: {
        q: { en: "verdict?", de: "urteil?" },
        correct: "deny",
        options: [
          { l: { en: "allow", de: "erlauben" }, verdict: "allow" },
          { l: { en: "ask", de: "fragen" }, verdict: "ask" },
          { l: { en: "deny", de: "ablehnen" }, verdict: "deny" },
        ],
        reveal: {
          en: "<span class='k'>deny</span>: piping the network straight into a shell is outside the allowlist. the call never runs; the denial is fed back as an observation the model must handle.",
          de: "<span class='k'>ablehnen</span>: das netz direkt in eine shell zu pipen liegt außerhalb der allowlist. der call läuft nie; das nein wird als beobachtung zurückgespeist, die das modell verarbeiten muss.",
        },
      },
      log: {
        en: "run_command curl x.sh | sh → <span class='r'>deny</span>",
        de: "run_command curl x.sh | sh → <span class='r'>abgelehnt</span>",
      },
    },
    // 4 — summary (no predict): the one write path, sorted by blast radius.
    {
      show: ["z-mac", "z-os", "agent", "os-disk", "os-shell", "os-net"],
      showEdges: ["e_agent_disk", "e_agent_shell", "e_agent_net"],
      cap: {
        en: "the gate is the <span class='k'>one write path</span>: allow, ask, deny, sorted by blast radius. every verdict is logged as an observation, so the whole decision trail is replayable.",
        de: "das gate ist der <span class='k'>eine schreibpfad</span>: erlauben, fragen, ablehnen, nach blast-radius. jedes urteil landet als beobachtung im log, die ganze entscheidungs-spur ist also abspielbar.",
      },
      log: {
        en: "3 decisions logged · <b>replayable</b>",
        de: "3 entscheidungen geloggt · <b>abspielbar</b>",
      },
    },
  ],
};
