// Lesson: a skill is knowledge on demand.
//
// Reveal mode: how a skill hands the model expertise it did not have, without
// touching a single weight. Start with the bare model (a generalist) and the
// agent hub that assembles its context. Reveal the skills registry: several
// skills installed, only their names and one-line descriptions ever loaded.
// Open one to show it is just a folder (SKILL.md plus resources). Then a task
// arrives, the learner predicts which skill matches, the match loads the full
// SKILL.md into the context window, and that text rides the same window to the
// model. Close on the point: the weights never moved (loaded is not trained),
// and an idle skill costs almost nothing, so dozens can wait for free. The
// readout accumulates "what a skill gives you".

import type { RevealLesson } from "../model";

// --- sim-card data (the shapes lab/flowmap/nodes reads) -----------------------
const baseCtx = [
  { label: "system prompt", chars: 900, estTokens: 225 },
  { label: "CLAUDE.md", chars: 700, estTokens: 175 },
  { label: "tool defs", chars: 800, estTokens: 200 },
  { label: "history", chars: 2400, estTokens: 600 },
];
const agentData = {
  active: false,
  error: false,
  focus: "agent",
  activity: { text: "assembles the context window", color: "var(--text-dim)" },
  gate: "none",
  gateNote: "",
  gateColor: "var(--border-strong)",
  activeTool: null,
  ctxParts: baseCtx,
  ctxTotals: { messages: 6, estimatedTokens: 1200, threshold: 100000 },
  prompt: "",
  systemPrompt: "you are a coding agent working in this repo.",
  tool: null,
};
const llmData = { active: false, local: true, provider: "ollama", model: "qwen3.5", think: [], answer: [] };

// The context window AFTER the skill loads: the SKILL.md is just one more part.
const skillCtxPatch = {
  ctxParts: [...baseCtx, { label: "pdf skill · SKILL.md", chars: 1600, estTokens: 400 }],
  ctxTotals: { messages: 7, estimatedTokens: 1600, threshold: 100000 },
};
// The registry with the matched skill lit; docx / xlsx / brand-voice stay idle.
const registryMatched = {
  files: [{ name: "pdf", isNew: true }, { name: "docx" }, { name: "xlsx" }, { name: "brand-voice" }],
};
// The matched skill with its full body disclosed (loaded into the context).
const skillOpen = { expanded: true };

export const skill: RevealLesson = {
  id: "skill",
  mode: "reveal",
  difficulty: "core",
  readoutKind: "gives",
  title: { en: "a skill is knowledge on demand", de: "ein skill ist wissen auf abruf" },
  blurb: {
    en: "a skill is a folder the harness loads only when the task matches: a SKILL.md plus resources. its instructions flow into the context window on demand, so the model gains expertise without any change to its weights, and skills it never loads cost nothing.",
    de: "ein skill ist ein ordner, den der harness nur bei passender aufgabe lädt: eine SKILL.md plus ressourcen. seine anweisungen fließen bei bedarf ins kontextfenster, das modell gewinnt expertise ohne jede änderung an seinen gewichten, und nie geladene skills kosten nichts.",
  },
  readout: { en: "what a skill gives you", de: "was ein skill dir gibt" },
  nodes: {
    "z-mac": { id: "z-mac", type: "zone", x: 0, y: 0, w: 1660, h: 900, data: { variant: "mac", label: "your mac" } },
    user: { id: "user", type: "user", x: 40, y: 300, data: { active: false, prompt: "fill out this onboarding pdf and flatten it" } },
    agent: { id: "agent", type: "agent", x: 420, y: 40, data: agentData },
    llm: { id: "llm", type: "llm", x: 1140, y: 80, data: llmData },
    registry: {
      id: "registry",
      type: "eduCard",
      x: 420,
      y: 600,
      w: 300,
      data: {
        kind: "skill",
        eyebrow: "registry",
        title: { en: "skills available", de: "skills verfügbar" },
        sub: { en: "four installed · only name + description loaded", de: "vier installiert · nur name + beschreibung geladen" },
        files: [{ name: "pdf" }, { name: "docx" }, { name: "xlsx" }, { name: "brand-voice" }],
      },
    },
    "skill-pdf": {
      id: "skill-pdf",
      type: "eduCard",
      x: 900,
      y: 560,
      w: 300,
      data: {
        kind: "skill",
        eyebrow: "a skill = a folder",
        title: { en: "pdf", de: "pdf" },
        sub: { en: "loads on match", de: "lädt bei treffer" },
        files: [
          { name: "SKILL.md" },
          { name: "references/forms.md" },
          { name: "scripts/fill_form.py" },
          { name: "examples/" },
        ],
        detail: [
          { en: "a folder on disk: a SKILL.md plus resources", de: "ein ordner auf disk: eine SKILL.md plus ressourcen" },
          { en: "only name and description load until a task matches", de: "nur name und beschreibung laden, bis eine aufgabe passt" },
          { en: "the full body loads on demand, then steers the model", de: "der volle body lädt bei bedarf, dann steuert er das modell" },
        ],
        body: [
          { n: "1", t: { en: "to fill a pdf form, first list its fields: fill_form.py --list.", de: "um ein pdf-formular auszufüllen, liste zuerst seine felder: fill_form.py --list." } },
          { n: "2", t: { en: "map each field to a value, then write it back with --data and --flatten.", de: "ordne jedem feld einen wert zu, dann schreib zurück mit --data und --flatten." } },
          { n: "3", t: { en: "verify: re-read the output and confirm every field rendered.", de: "prüfe: lies die ausgabe erneut und bestätige, dass jedes feld gesetzt ist." } },
        ],
        expanded: false,
      },
    },
    "skill-idle": {
      id: "skill-idle",
      type: "eduCard",
      x: 1260,
      y: 600,
      w: 260,
      data: {
        kind: "skill",
        eyebrow: "idle",
        title: { en: "docx", de: "docx" },
        sub: { en: "not matched · body stays on disk", de: "kein treffer · body bleibt auf disk" },
        detail: [
          { en: "only its one-line description is loaded", de: "nur seine einzeilige beschreibung ist geladen" },
          { en: "no instructions in the context, near-zero cost", de: "keine anweisungen im kontext, kosten fast null" },
          { en: "it would load the same way if a docx task arrived", de: "es würde genauso laden, käme eine docx-aufgabe" },
        ],
      },
    },
  },
  edges: {
    e_user_agent: { id: "e_user_agent", source: "user", target: "agent", sh: "rs", th: "lt" },
    e_agent_llm: { id: "e_agent_llm", source: "agent", target: "llm", sh: "rs", th: "lt" },
    e_registry_pdf: { id: "e_registry_pdf", source: "registry", target: "skill-pdf", sh: "rs", th: "lt" },
    e_skill_agent: { id: "e_skill_agent", source: "skill-pdf", target: "agent", sh: "ts", th: "bt" },
    e_idle_agent: { id: "e_idle_agent", source: "skill-idle", target: "agent", sh: "ts", th: "bt", dim: true },
  },
  steps: [
    // 1 : the generalist model.
    {
      show: ["z-mac", "user", "agent", "llm"],
      showEdges: ["e_user_agent", "e_agent_llm"],
      activeNodes: ["llm"],
      now: { en: "the model on its own", de: "das modell für sich" },
      cap: {
        en: "the model is a <span class='k'>generalist</span>. it knows a great deal in general, but the exact procedure your task needs is not baked into its <span class='k'>weights</span>. a skill is how you hand it that expertise, on demand.",
        de: "das modell ist ein <span class='k'>generalist</span>. es weiß im allgemeinen sehr viel, aber die genaue prozedur, die deine aufgabe braucht, steckt nicht in seinen <span class='k'>gewichten</span>. ein skill ist, wie du ihm genau diese expertise reichst, bei bedarf.",
      },
      reveal: [{ l: { en: "a generalist", de: "ein generalist" }, s: { en: "broad knowledge, no project procedure in the weights", de: "breites wissen, keine projekt-prozedur in den gewichten" } }],
    },
    // 2 : the registry: names + descriptions only.
    {
      show: ["z-mac", "user", "agent", "llm", "registry"],
      showEdges: ["e_user_agent", "e_agent_llm"],
      activeNodes: ["registry"],
      now: { en: "the skills registry", de: "die skills-registry" },
      cap: {
        en: "the harness keeps a <span class='k'>registry</span> of installed skills. each one is a folder on disk, and only its <span class='k'>name and one-line description</span> are always loaded, a few tokens each. the bodies stay on disk.",
        de: "der harness führt eine <span class='k'>registry</span> der installierten skills. jeder ist ein ordner auf disk, und nur <span class='k'>name und einzeilige beschreibung</span> sind immer geladen, ein paar tokens je. die bodies bleiben auf disk.",
      },
      reveal: [{ l: { en: "the registry", de: "die registry" }, s: { en: "many skills, only names and descriptions loaded", de: "viele skills, nur namen und beschreibungen geladen" } }],
    },
    // 3 : a skill is a folder (body still on disk).
    {
      show: ["z-mac", "user", "agent", "llm", "registry", "skill-pdf"],
      showEdges: ["e_user_agent", "e_agent_llm"],
      activeNodes: ["skill-pdf"],
      now: { en: "a skill is a folder", de: "ein skill ist ein ordner" },
      cap: {
        en: "open one up. a <span class='k'>skill is just a folder</span>: a SKILL.md plus its resources, scripts, references, templates. right now the body is still on disk, not in the context the model sees.",
        de: "klapp einen auf. ein <span class='k'>skill ist nur ein ordner</span>: eine SKILL.md plus ressourcen, skripte, referenzen, vorlagen. gerade liegt der body noch auf disk, nicht im kontext, den das modell sieht.",
      },
      reveal: [{ l: { en: "a folder", de: "ein ordner" }, s: { en: "a SKILL.md plus scripts, references, templates", de: "eine SKILL.md plus skripte, referenzen, vorlagen" } }],
    },
    // 4 : predict: which skill matches this task?
    {
      show: ["z-mac", "user", "agent", "llm", "registry", "skill-pdf"],
      showEdges: ["e_user_agent", "e_agent_llm"],
      activeNodes: ["registry", "user"],
      now: { en: "matching the task", de: "die aufgabe abgleichen" },
      cap: {
        en: "a task comes in: <span class='k'>fill out this pdf form and flatten it</span>. the harness compares it against every skill's description. your call: which skill matches?",
        de: "eine aufgabe kommt rein: <span class='k'>füll dieses pdf-formular aus und flatten es</span>. der harness vergleicht sie mit der beschreibung jedes skills. deine entscheidung: welcher skill passt?",
      },
      predict: {
        q: { en: "which skill loads?", de: "welcher skill lädt?" },
        correct: "pdf",
        options: [
          { l: { en: "pdf", de: "pdf" }, verdict: "pdf" },
          { l: { en: "docx", de: "docx" }, verdict: "docx" },
          { l: { en: "brand-voice", de: "brand-voice" }, verdict: "brand" },
        ],
        reveal: {
          en: "<span class='g'>pdf</span>: its description is the closest match to a pdf-form task. the others stay idle. matching runs on the short description, which is exactly why every skill keeps one.",
          de: "<span class='g'>pdf</span>: seine beschreibung passt am besten zu einer pdf-formular-aufgabe. die anderen bleiben idle. der abgleich läuft über die kurzbeschreibung, genau dafür hat jeder skill eine.",
        },
      },
      reveal: [{ l: { en: "matching", de: "abgleich" }, s: { en: "the task is compared to each skill's description", de: "die aufgabe wird mit jeder skill-beschreibung verglichen" } }],
    },
    // 5 : the match loads the full SKILL.md.
    {
      show: ["z-mac", "user", "agent", "llm", "registry", "skill-pdf"],
      showEdges: ["e_user_agent", "e_agent_llm", "e_registry_pdf"],
      activeNodes: ["registry", "skill-pdf"],
      activeEdges: ["e_registry_pdf"],
      patch: { registry: registryMatched, "skill-pdf": skillOpen },
      now: { en: "loading on match", de: "laden bei treffer" },
      cap: {
        en: "on the match, the harness loads the full <span class='k'>SKILL.md</span> into the <span class='k'>context window</span>. the instructions are now in front of the model, three concrete steps it did not have a moment ago.",
        de: "beim treffer lädt der harness die volle <span class='k'>SKILL.md</span> ins <span class='k'>kontextfenster</span>. die anweisungen stehen jetzt vor dem modell, drei konkrete schritte, die es eben noch nicht hatte.",
      },
      reveal: [{ l: { en: "loaded on match", de: "geladen bei treffer" }, s: { en: "the full SKILL.md enters the context window", de: "die volle SKILL.md kommt ins kontextfenster" } }],
    },
    // 6 : the instructions become part of the context sent to the llm.
    {
      show: ["z-mac", "user", "agent", "llm", "registry", "skill-pdf"],
      showEdges: ["e_user_agent", "e_agent_llm", "e_registry_pdf", "e_skill_agent"],
      activeNodes: ["agent"],
      activeEdges: ["e_skill_agent", "e_agent_llm"],
      patch: { registry: registryMatched, "skill-pdf": skillOpen, agent: skillCtxPatch },
      now: { en: "into the context window", de: "ins kontextfenster" },
      cap: {
        en: "the skill's text becomes <span class='k'>just another part of the assembled context</span>, no different from the system prompt or the history. it rides the same window to the model. click the agent to see it sitting in the context.",
        de: "der skill-text wird <span class='k'>einfach ein weiterer teil des zusammengebauten kontexts</span>, nicht anders als system-prompt oder verlauf. er fährt im selben fenster zum modell. klick den agenten an, um ihn im kontext zu sehen.",
      },
      reveal: [{ l: { en: "knowledge on demand", de: "wissen auf abruf" }, s: { en: "the instructions ride the same context window", de: "die anweisungen fahren im selben kontextfenster" } }],
    },
    // 7 : the weights never change.
    {
      show: ["z-mac", "user", "agent", "llm", "registry", "skill-pdf"],
      showEdges: ["e_user_agent", "e_agent_llm", "e_registry_pdf", "e_skill_agent"],
      activeNodes: ["llm"],
      patch: { registry: registryMatched, "skill-pdf": skillOpen, agent: skillCtxPatch },
      now: { en: "the weights never change", de: "die gewichte ändern sich nie" },
      cap: {
        en: "and here is the point: the model just gained a procedure it did not have, and <span class='k'>not one weight moved</span>. skills are knowledge on demand, not training. delete the folder and the expertise is gone; the model is a generalist again.",
        de: "und das ist der punkt: das modell hat gerade eine prozedur bekommen, die es nicht hatte, und <span class='k'>kein einziges gewicht hat sich bewegt</span>. skills sind wissen auf abruf, kein training. lösch den ordner und die expertise ist weg; das modell ist wieder generalist.",
      },
      reveal: [{ l: { en: "weights unchanged", de: "gewichte unverändert" }, s: { en: "expertise added without any training", de: "expertise ergänzt ohne jedes training" } }],
    },
    // 8 : loaded versus idle.
    {
      show: ["z-mac", "user", "agent", "llm", "registry", "skill-pdf", "skill-idle"],
      showEdges: ["e_user_agent", "e_agent_llm", "e_registry_pdf", "e_skill_agent", "e_idle_agent"],
      activeNodes: ["skill-pdf", "skill-idle"],
      patch: { registry: registryMatched, "skill-pdf": skillOpen, agent: skillCtxPatch },
      now: { en: "loaded versus idle", de: "geladen gegen idle" },
      cap: {
        en: "contrast the two. <span class='k'>pdf is loaded</span>: its body is in the context, spending tokens, steering the model. <span class='k'>docx is idle</span>: only its one-line description is loaded, so it costs almost nothing until a docx task arrives.",
        de: "vergleich die zwei. <span class='k'>pdf ist geladen</span>: sein body liegt im kontext, kostet tokens, steuert das modell. <span class='k'>docx ist idle</span>: nur seine einzeilige beschreibung ist geladen, es kostet also fast nichts, bis eine docx-aufgabe kommt.",
      },
      reveal: [{ l: { en: "loaded vs idle", de: "geladen gegen idle" }, s: { en: "one body in the context, the rest near-zero", de: "ein body im kontext, der rest fast null" } }],
    },
    // 9 : progressive disclosure (summary).
    {
      show: ["z-mac", "user", "agent", "llm", "registry", "skill-pdf", "skill-idle"],
      showEdges: ["e_user_agent", "e_agent_llm", "e_registry_pdf", "e_skill_agent", "e_idle_agent"],
      activeNodes: ["registry"],
      patch: { registry: registryMatched, "skill-pdf": skillOpen, agent: skillCtxPatch },
      now: { en: "knowledge on demand", de: "wissen auf abruf" },
      cap: {
        en: "this is <span class='k'>progressive disclosure</span>: dozens of skills can sit in the registry, and you pay the full token price only for the one that matches. unused skills cost nothing. same model, more competence, loaded exactly when the task calls for it.",
        de: "das ist <span class='k'>progressive disclosure</span>: dutzende skills können in der registry liegen, und den vollen token-preis zahlst du nur für den einen, der passt. ungenutzte skills kosten nichts. dasselbe modell, mehr kompetenz, geladen genau dann, wenn die aufgabe es verlangt.",
      },
      reveal: [{ l: { en: "progressive disclosure", de: "progressive disclosure" }, s: { en: "pay only for the skill that matches", de: "zahl nur für den skill, der passt" } }],
    },
  ],
};
