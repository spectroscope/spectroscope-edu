// Lesson 10: the extensions compose.
//
// Reveal mode: the payoff lesson. The gate lesson, the hook lesson and the
// skills card each taught one extension alone. Here all three plug into ONE
// agent at once, on the same system map the simulator draws, and a single run
// fires each in turn: a skill loads on match and adds instructions; an mcp tool
// reaches a server outside your mac; a hook fires as a guaranteed checkpoint on
// the write path. The thesis is composition, not any one part: extensions do not
// replace the loop, they hook into it, and the permission gate still governs
// every write. The crux is the contrast a learner can only see once the three
// sit together, a skill suggests, a hook guarantees. Hook and skill are edu
// abstraction cards; mcp reuses the real mcp-client + the external server across
// the boundary. The readout is the growing composition log.

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
  ctxParts: null,
  ctxTotals: null,
  prompt: "",
  systemPrompt: "you are a coding agent working in this repo.",
  tool: null,
};
const llmData = { active: false, local: true, provider: "ollama", model: "qwen3.5", think: [], answer: [] };
const os = (kind: string, extra: Record<string, unknown> = {}) => ({ kind, active: false, ...extra });

export const compose: RevealLesson = {
  id: "compose",
  mode: "reveal",
  difficulty: "deep",
  readoutKind: "log",
  title: { en: "the extensions compose", de: "die erweiterungen spielen zusammen" },
  blurb: {
    en: "a hook, a skill and an mcp tool are not three separate features. they plug into the same loop around the same agent, and a single run fires each in turn. watch them compose, and watch the gate still govern every write.",
    de: "ein hook, ein skill und ein mcp-tool sind nicht drei getrennte features. sie klinken sich in dieselbe loop um denselben agenten ein, und ein einziger lauf feuert jedes der reihe nach. sieh zu, wie sie zusammenspielen, und wie das gate weiter jeden write regiert.",
  },
  readout: { en: "composition log", de: "zusammenspiel-log" },
  nodes: {
    "z-mac": { id: "z-mac", type: "zone", x: 0, y: 0, w: 1700, h: 1000, data: { variant: "mac", label: "your mac" } },
    "z-os": { id: "z-os", type: "zone", x: 60, y: 700, w: 1060, h: 280, data: { variant: "os", label: "operating system" } },
    "z-outside": { id: "z-outside", type: "zone", x: 1460, y: 40, w: 400, h: 920, data: { variant: "outside", label: "outside" } },
    "z-boundary": { id: "z-boundary", type: "zone", x: 1424, y: 40, w: 20, h: 920, data: { variant: "boundary", label: "boundary" } },
    user: { id: "user", type: "user", x: 40, y: 120, data: { active: false, prompt: "the http client keeps flaking on 401s. fix it." } },
    skill: {
      id: "skill",
      type: "eduCard",
      x: 60,
      y: 440,
      w: 200,
      data: {
        kind: "skill",
        eyebrow: "extension",
        title: { en: "skill", de: "skill" },
        sub: { en: "loaded on match", de: "lädt bei treffer" },
        detail: [
          { en: "saved instructions, loaded when the prompt matches", de: "gespeicherte anweisungen, geladen wenn der prompt trifft" },
          { en: "name + description stay always on (~100 tok)", de: "name + beschreibung bleiben immer an (~100 tok)" },
          { en: "the full body loads only on match, then adds instructions", de: "der volle body lädt nur bei treffer, dann ergänzt er anweisungen" },
        ],
        body: [
          { n: "1", t: { en: "use the project's retry helper", de: "nutz den retry-helfer des projekts" } },
          { n: "2", t: { en: "never write to .env", de: "schreib nie in .env" } },
        ],
      },
    },
    agent: { id: "agent", type: "agent", x: 480, y: 120, data: agentData },
    hook: {
      id: "hook",
      type: "eduCard",
      x: 560,
      y: 520,
      w: 200,
      data: {
        kind: "harness",
        eyebrow: "extension",
        title: { en: "hook", de: "hook" },
        sub: { en: "fires every time", de: "feuert jedes mal" },
        detail: [
          { en: "a deterministic checkpoint in the loop", de: "ein deterministischer checkpoint in der loop" },
          { en: "runs at a fixed point, every time, no model judgement", de: "läuft an einem festen punkt, jedes mal, ohne modell-urteil" },
          { en: "it can reformat, inject, or block a call before the gate sees it", de: "kann einen call umformatieren, ergänzen oder blocken, bevor das gate ihn sieht" },
        ],
      },
    },
    llm: { id: "llm", type: "llm", x: 960, y: 120, data: llmData },
    "os-mcp": { id: "os-mcp", type: "os", x: 140, y: 760, data: os("mcp", { mcp: null, tool: null }) },
    "os-net": { id: "os-net", type: "os", x: 460, y: 760, data: os("net") },
    "os-disk": { id: "os-disk", type: "os", x: 780, y: 760, data: os("disk", { disk: "idle", file: "src/http/client.ts" }) },
    mcpserver: { id: "mcpserver", type: "ext", x: 1520, y: 720, data: { kind: "mcpserver", active: false, mcp: null } },
  },
  edges: {
    e_user_agent: { id: "e_user_agent", source: "user", target: "agent", sh: "rs", th: "lt" },
    e_skill_agent: { id: "e_skill_agent", source: "skill", target: "agent", sh: "rs", th: "lt", dim: true },
    e_agent_llm: { id: "e_agent_llm", source: "agent", target: "llm", sh: "rs", th: "lt" },
    e_agent_hook: { id: "e_agent_hook", source: "agent", target: "hook", sh: "bs", th: "tt" },
    e_hook_disk: { id: "e_hook_disk", source: "hook", target: "os-disk", sh: "bs", th: "tt" },
    e_agent_mcp: { id: "e_agent_mcp", source: "agent", target: "os-mcp", sh: "bs", th: "tt" },
    e_mcp_net: { id: "e_mcp_net", source: "os-mcp", target: "os-net", sh: "rs", th: "lt" },
    e_net_server: { id: "e_net_server", source: "os-net", target: "mcpserver", sh: "rs", th: "lt", net: true },
  },
  steps: [
    // 1: the whole board: one agent, three extensions wired in, none firing yet.
    {
      show: ["z-mac", "z-os", "z-outside", "z-boundary", "user", "skill", "agent", "hook", "llm", "os-mcp", "os-net", "os-disk", "mcpserver"],
      showEdges: ["e_user_agent", "e_skill_agent", "e_agent_llm", "e_agent_hook", "e_hook_disk", "e_agent_mcp", "e_mcp_net", "e_net_server"],
      now: { en: "three extensions, one loop", de: "drei erweiterungen, eine loop" },
      cap: {
        en: "one agent, one loop, and three ways to extend it. a <span class='k'>hook</span> is a guaranteed checkpoint, a <span class='k'>skill</span> loads on match and adds instructions, an <span class='k'>mcp</span> tool reaches a server outside your mac. all three plug into the same loop around the same agent. click any card to inspect it.",
        de: "ein agent, eine loop, und drei wege, sie zu erweitern. ein <span class='k'>hook</span> ist ein garantierter checkpoint, ein <span class='k'>skill</span> lädt bei treffer und ergänzt anweisungen, ein <span class='k'>mcp</span>-tool erreicht einen server außerhalb deines mac. alle drei klinken sich in dieselbe loop um denselben agenten ein. klick jede karte an, um sie zu untersuchen.",
      },
      log: { en: "one agent · three extensions wired in", de: "ein agent · drei erweiterungen eingeklinkt" },
    },
    // 2: the run starts: the loop is the same loop, the extensions only hook in.
    {
      show: ["z-mac", "user", "agent", "llm"],
      showEdges: ["e_user_agent", "e_agent_llm"],
      activeNodes: ["agent"],
      activeEdges: ["e_user_agent"],
      now: { en: "the run begins", de: "der lauf beginnt" },
      cap: {
        en: "you send a prompt: fix the flaky http client. the harness <span class='k'>assembles the window</span> and hands it to the model. this is the same loop from every lesson. the extensions do not replace it, they hook into it.",
        de: "du schickst einen prompt: reparier den wackligen http-client. der harness <span class='k'>baut das fenster zusammen</span> und reicht es dem modell. das ist dieselbe loop aus jeder lektion. die erweiterungen ersetzen sie nicht, sie klinken sich ein.",
      },
      log: { en: "run starts · assemble the window", de: "lauf startet · fenster zusammenbauen" },
    },
    // 3: extension one: a skill loads on match and adds instructions to context.
    {
      show: ["z-mac", "user", "skill", "agent", "llm"],
      showEdges: ["e_user_agent", "e_skill_agent", "e_agent_llm"],
      activeNodes: ["skill", "agent"],
      activeEdges: ["e_skill_agent"],
      patch: { skill: { expanded: true } },
      now: { en: "a skill loads on match", de: "ein skill lädt bei treffer" },
      cap: {
        en: "the prompt matches a <span class='k'>skill</span>. until now only its name and description were loaded; now the full body loads and <span class='k'>adds instructions</span> to the window: use the project's retry helper, never touch .env. a skill is loaded knowledge, not a new power.",
        de: "der prompt trifft einen <span class='k'>skill</span>. bisher waren nur name und beschreibung geladen; jetzt lädt der volle body und <span class='k'>ergänzt anweisungen</span> im fenster: nutz den retry-helfer des projekts, fass .env nie an. ein skill ist geladenes wissen, keine neue fähigkeit.",
      },
      log: { en: "skill matched → body loaded, instructions added", de: "skill getroffen → body geladen, anweisungen ergänzt" },
    },
    // 4: extension two: an mcp tool reaches a server across the boundary.
    {
      show: ["z-mac", "z-os", "z-outside", "z-boundary", "agent", "llm", "os-mcp", "os-net", "mcpserver"],
      showEdges: ["e_agent_mcp", "e_mcp_net", "e_net_server"],
      activeNodes: ["agent", "os-mcp", "os-net", "mcpserver"],
      activeEdges: ["e_agent_mcp", "e_mcp_net", "e_net_server"],
      patch: {
        "os-mcp": { active: true, mcp: "docs-server", tool: { name: "mcp__docs__search", input: { q: "retry policy" } } },
        mcpserver: { active: true, mcp: "docs-server" },
      },
      now: { en: "an mcp tool reaches outside", de: "ein mcp-tool reicht nach draußen" },
      cap: {
        en: "the model needs facts it does not have, so it calls an <span class='k'>mcp</span> tool. the call rides the mcp-client out through the network and <span class='k'>crosses the boundary</span> of your mac to an external server, which answers with the current retry policy. mcp is reach, not a local action.",
        de: "dem modell fehlen fakten, also ruft es ein <span class='k'>mcp</span>-tool auf. der call reitet über den mcp-client hinaus durchs netz und <span class='k'>überquert die grenze</span> deines mac zu einem externen server, der mit der aktuellen retry-policy antwortet. mcp ist reichweite, keine lokale aktion.",
      },
      log: { en: "mcp → docs-server (outside your mac)", de: "mcp → docs-server (außerhalb deines mac)" },
    },
    // 5: extension three: a hook fires on the write path before anything runs.
    {
      show: ["z-mac", "z-os", "agent", "hook", "os-disk"],
      showEdges: ["e_agent_hook", "e_hook_disk"],
      activeNodes: ["hook"],
      activeEdges: ["e_agent_hook"],
      patch: { hook: { sub: { en: "reformat, then pass", de: "umformatieren, dann durchlassen" } } },
      now: { en: "a hook fires before the write", de: "ein hook feuert vor dem write" },
      cap: {
        en: "now the model proposes a <span class='k'>write</span> to the http client. before the write reaches anything, a <span class='k'>hook</span> fires: a PreToolUse checkpoint the harness runs at a fixed point, every time. here it reformats the file and injects a header, then passes the call on. no model judgement, the same action every run.",
        de: "jetzt schlägt das modell einen <span class='k'>write</span> am http-client vor. bevor der write irgendwohin gelangt, feuert ein <span class='k'>hook</span>: ein PreToolUse-checkpoint, den der harness an einem festen punkt ausführt, jedes mal. hier formatiert er die datei um und ergänzt einen header, dann reicht er den call weiter. kein modell-urteil, dieselbe aktion in jedem lauf.",
      },
      log: { en: "hook fires → reformat + inject, then <span class='g'>pass</span>", de: "hook feuert → umformatieren + ergänzen, dann <span class='g'>durchlassen</span>" },
    },
    // 6: the gate still governs: the hook does not bypass it, the write lands.
    {
      show: ["z-mac", "z-os", "agent", "hook", "os-disk"],
      showEdges: ["e_agent_hook", "e_hook_disk"],
      activeNodes: ["agent", "os-disk"],
      activeEdges: ["e_hook_disk"],
      patch: {
        agent: { gate: "allowed", gateColor: "var(--ok)", tool: { name: "write_file", input: { path: "src/http/client.ts", note: "reformatted by the hook" } } },
        "os-disk": { disk: "write", file: "src/http/client.ts" },
      },
      now: { en: "the gate still governs the write", de: "das gate regiert weiter den write" },
      cap: {
        en: "only after the hook does the call reach the <span class='k'>gate</span>. this is the point: extensions do not bypass the gate, it still governs the one write path. it <span class='a'>allows</span> the reformatted write, and it lands on <span class='k'>disk</span>.",
        de: "erst nach dem hook erreicht der call das <span class='k'>gate</span>. das ist der punkt: erweiterungen umgehen das gate nicht, es regiert weiter den einen schreibpfad. es <span class='a'>erlaubt</span> den umformatierten write, und er landet auf der <span class='k'>disk</span>.",
      },
      log: { en: "gate → <span class='a'>allow</span> · write_file <b>lands on disk</b>", de: "gate → <span class='a'>erlaubt</span> · write_file <b>landet auf disk</b>" },
    },
    // 7: predict: skill suggests, hook guarantees. the .env write is blocked.
    {
      show: ["z-mac", "z-os", "skill", "agent", "hook", "os-disk"],
      showEdges: ["e_agent_hook", "e_skill_agent"],
      activeNodes: ["hook"],
      activeEdges: ["e_agent_hook"],
      patch: { hook: { sub: { en: "block: .env is a protected path", de: "block: .env ist ein geschützter pfad" } } },
      now: { en: "the hook blocks a secret write", de: "der hook blockt einen secret-write" },
      cap: {
        en: "a later step goes wrong: the model ignores the skill's instruction and proposes <span class='k'>write_file .env</span>, the file with your secrets. the skill only asked it not to. what actually stops the write?",
        de: "ein späterer schritt geht schief: das modell ignoriert die anweisung des skills und schlägt <span class='k'>write_file .env</span> vor, die datei mit deinen secrets. der skill hat nur darum gebeten. was hält den write wirklich auf?",
      },
      predict: {
        q: { en: "what stops the .env write?", de: "was stoppt den .env-write?" },
        correct: "hook",
        options: [
          { l: { en: "the skill's instruction", de: "die anweisung des skills" }, verdict: "skill" },
          { l: { en: "the hook blocks it", de: "der hook blockt ihn" }, verdict: "hook" },
          { l: { en: "nothing, it writes", de: "nichts, es schreibt" }, verdict: "none" },
        ],
        reveal: {
          en: "<span class='k'>the hook blocks it</span>. the skill only added a suggestion the model can ignore. the hook has a fixed rule, no writes to .env, and it fires before the gate is ever consulted. <span class='k'>a skill suggests; a hook guarantees.</span>",
          de: "<span class='k'>der hook blockt ihn</span>. der skill hat nur eine bitte ergänzt, die das modell ignorieren kann. der hook hat eine feste regel, keine writes auf .env, und feuert, bevor das gate überhaupt gefragt wird. <span class='k'>ein skill bittet; ein hook garantiert.</span>",
        },
      },
      log: { en: "hook → <span class='r'>block</span> · .env never reaches the gate", de: "hook → <span class='r'>block</span> · .env erreicht das gate nie" },
    },
    // 8: the composition, side by side: three roles on one loop, gate over all.
    {
      show: ["z-mac", "z-os", "z-outside", "z-boundary", "user", "skill", "agent", "hook", "llm", "os-mcp", "os-net", "os-disk", "mcpserver"],
      showEdges: ["e_user_agent", "e_skill_agent", "e_agent_llm", "e_agent_hook", "e_hook_disk", "e_agent_mcp", "e_mcp_net", "e_net_server"],
      now: { en: "three roles, one loop", de: "drei rollen, eine loop" },
      cap: {
        en: "three extensions, three different jobs on the same loop. a <span class='k'>skill</span> loads on match and suggests. an <span class='k'>mcp</span> tool reaches a server outside your mac. a <span class='k'>hook</span> is a deterministic checkpoint that always fires. and through all of it, the <span class='k'>gate</span> still governs every write.",
        de: "drei erweiterungen, drei verschiedene aufgaben auf derselben loop. ein <span class='k'>skill</span> lädt bei treffer und schlägt vor. ein <span class='k'>mcp</span>-tool erreicht einen server außerhalb deines mac. ein <span class='k'>hook</span> ist ein deterministischer checkpoint, der immer feuert. und bei alledem regiert weiter das <span class='k'>gate</span> jeden write.",
      },
      log: { en: "skill suggests · mcp reaches out · hook guarantees", de: "skill schlägt vor · mcp reicht hinaus · hook garantiert" },
    },
    // 9: the loop closes; the same cards wait live in the simulator.
    {
      show: ["z-mac", "z-os", "z-outside", "z-boundary", "user", "skill", "agent", "hook", "llm", "os-mcp", "os-net", "os-disk", "mcpserver"],
      showEdges: ["e_user_agent", "e_skill_agent", "e_agent_llm", "e_agent_hook", "e_hook_disk", "e_agent_mcp", "e_mcp_net", "e_net_server"],
      activeNodes: ["user"],
      activeEdges: ["e_user_agent"],
      now: { en: "control returns to you", de: "kontrolle geht an dich zurück" },
      cap: {
        en: "the loop closes and control returns to <span class='k'>you</span>. none of these three live in the model's weights; each is engineering around the model, composing in one loop. you will meet the same cards, the mcp-client and the server outside, live in the simulator.",
        de: "die loop schließt und die kontrolle geht an <span class='k'>dich</span> zurück. keine der drei steckt in den gewichten des modells; jede ist engineering um das modell herum, das in einer loop zusammenspielt. du triffst dieselben karten, den mcp-client und den server draußen, live im simulator.",
      },
      log: { en: "control returns to you · three extensions, one loop", de: "kontrolle geht an dich zurück · drei erweiterungen, eine loop" },
    },
  ],
};
