// Lesson 6 — thin until it matches (progressive disclosure).
//
// Reveal mode: the skills index as a token-economy problem. Four skills sit in
// the context as just a name and a description, about 100 tokens each, read
// every single turn. A task arrives and the harness matches it against each
// description; the learner guesses which one fires; the matched skill (pdf-forms)
// expands to its full body, the four real steps, about 1,400 tokens, loaded only
// now. The siblings stay thin, so only the match paid full price. The cost
// readout jumps 400 -> 1,700 to make the price of that one expansion visible.
// Thesis: progressive disclosure is a token-economy move, not a feature flag.

import type { RevealLesson } from "../model";

// --- edu-card data (the sim has no skills card, so these are eduCards) --------
const skill = (title: { en: string; de: string }, extra: Record<string, unknown> = {}) => ({
  kind: "skill",
  eyebrow: "skill",
  title,
  sub: { en: "~100 tok", de: "~100 tok" },
  ...extra,
});

// pdf-forms carries its full body: the four real steps that load only on a match.
const pdfBody = [
  { n: "1", t: { en: "find AcroForm fields", de: "AcroForm-felder finden" } },
  { n: "2", t: { en: "map answer to field", de: "antwort auf feld mappen" } },
  { n: "3", t: { en: "fill, flatten, write", de: "füllen, flatten, schreiben" } },
  { n: "4", t: { en: "verify each field", de: "jedes feld prüfen" } },
];

export const progressiveDisclosure: RevealLesson = {
  id: "progressive-disclosure",
  mode: "reveal",
  difficulty: "deep",
  readoutKind: "cost",
  title: { en: "thin until it matches", de: "dünn bis es passt" },
  blurb: {
    en: "skills sit as a name and a description, ~100 tokens each, read every turn. the full body loads only when the task matches.",
    de: "skills liegen als name und beschreibung da, ~100 tokens je, jede runde gelesen. der volle body lädt nur, wenn die aufgabe passt.",
  },
  readout: { en: "context cost", de: "kontext-kosten" },
  nodes: {
    task: {
      id: "task",
      type: "eduCard",
      x: 110,
      y: 290,
      w: 230,
      data: {
        kind: "human",
        eyebrow: "incoming task",
        title: { en: "“fill out this PDF”", de: "„füll dieses PDF aus“" },
      },
    },
    commit: { id: "commit", type: "eduCard", x: 600, y: 120, w: 210, data: skill({ en: "commit-msg", de: "commit-msg" }) },
    pdf: { id: "pdf", type: "eduCard", x: 600, y: 410, w: 220, data: skill({ en: "pdf-forms", de: "pdf-forms" }, { body: pdfBody }) },
    sql: { id: "sql", type: "eduCard", x: 880, y: 120, w: 200, data: skill({ en: "sql-review", de: "sql-review" }) },
    change: { id: "change", type: "eduCard", x: 880, y: 410, w: 200, data: skill({ en: "changelog", de: "changelog" }) },
  },
  edges: {
    e_task_commit: { id: "e_task_commit", source: "task", target: "commit", sh: "rs", th: "lt" },
    e_task_pdf: { id: "e_task_pdf", source: "task", target: "pdf", sh: "rs", th: "lt" },
    e_task_sql: { id: "e_task_sql", source: "task", target: "sql", sh: "rs", th: "lt" },
    e_task_change: { id: "e_task_change", source: "task", target: "change", sh: "rs", th: "lt" },
  },
  steps: [
    {
      show: ["commit", "pdf", "sql", "change"],
      cost: { n: 400, note: { en: "4 skills · ~100 tok each", de: "4 skills · ~100 tok je" } },
      cap: {
        en: "<span class='k'>at rest</span>: every skill is just a name + description, about 100 tokens, read into context every turn. cheap enough to keep them all on.",
        de: "<span class='k'>in ruhe</span>: jeder skill ist nur name + beschreibung, etwa 100 tokens, jede runde in den kontext gelesen. billig genug, alle anzulassen.",
      },
    },
    {
      show: ["task", "commit", "pdf", "sql", "change"],
      showEdges: ["e_task_commit", "e_task_pdf", "e_task_sql", "e_task_change"],
      activeNodes: ["task"],
      activeEdges: ["e_task_commit", "e_task_pdf", "e_task_sql", "e_task_change"],
      cost: { n: 400, note: { en: "still 4 × ~100 tok", de: "immer noch 4 × ~100 tok" } },
      cap: {
        en: "a task arrives: <span class='k'>“fill out this PDF”</span>. the harness matches it against each description. which one fires?",
        de: "eine aufgabe kommt: <span class='k'>„füll dieses PDF aus“</span>. der harness gleicht sie mit jeder beschreibung ab. welcher feuert?",
      },
      predict: {
        q: { en: "which skill fires?", de: "welcher skill feuert?" },
        correct: "pdf",
        options: [
          { l: { en: "commit-msg", de: "commit-msg" }, verdict: "commit" },
          { l: { en: "pdf-forms", de: "pdf-forms" }, verdict: "pdf" },
          { l: { en: "sql-review", de: "sql-review" }, verdict: "sql" },
          { l: { en: "changelog", de: "changelog" }, verdict: "change" },
        ],
        reveal: {
          en: "<span class='k'>pdf-forms</span> fires: its description is the one that matches “fill out a PDF”. the other three never match, so their bodies stay closed.",
          de: "<span class='k'>pdf-forms</span> feuert: seine beschreibung ist die, die zu „füll ein PDF aus“ passt. die anderen drei passen nie, also bleiben ihre bodies zu.",
        },
      },
    },
    {
      show: ["task", "commit", "pdf", "sql", "change"],
      showEdges: ["e_task_pdf"],
      activeNodes: ["pdf"],
      activeEdges: ["e_task_pdf"],
      patch: { pdf: { expanded: true } },
      cost: { n: 1700, note: { en: "3 × ~100 + pdf-forms full body ~1,400", de: "3 × ~100 + pdf-forms voller body ~1.400" } },
      cap: {
        en: "one description hits. <span class='k'>pdf-forms expands to its full body</span>, the four real steps, ~1,400 tokens, loaded only now.",
        de: "eine beschreibung trifft. <span class='k'>pdf-forms klappt auf seinen vollen body auf</span>, die vier echten schritte, ~1.400 tokens, erst jetzt geladen.",
      },
    },
    {
      show: ["task", "commit", "pdf", "sql", "change"],
      showEdges: ["e_task_pdf"],
      activeNodes: ["commit", "sql", "change"],
      patch: { pdf: { expanded: true } },
      cost: { n: 1700, note: { en: "only the matched skill paid full price", de: "nur der getroffene skill zahlte vollen preis" } },
      cap: {
        en: "the <span class='k'>siblings stay thin</span>. the cost of the full body is paid <span class='k'>only on the match</span>. progressive disclosure is a token-economy move, not a feature flag.",
        de: "die <span class='k'>geschwister bleiben dünn</span>. die kosten des vollen body werden <span class='k'>nur beim treffer</span> bezahlt. progressive disclosure ist eine token-ökonomie, kein feature-flag.",
      },
    },
  ],
};
