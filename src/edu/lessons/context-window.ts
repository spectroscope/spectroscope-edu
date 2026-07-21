// Lesson 5: the four moves on the window.
//
// Scenario mode: a real run, folded through the simulator's own engine. A coding
// agent on a long refactor demonstrates the four context moves as actual actions
// on the map, not abstract cells: SELECT is a read_file pulling only the one file
// it needs (the disk read lights up), COMPRESS is a real compaction, ISOLATE is a
// spawn of one subagent that runs in its own window, and WRITE is a write_file to
// CLAUDE.md on disk. The readout tracks the budget step by step (6 -> 22 -> 13 ->
// 13 -> 9), and the whole point is that it never once passes its cap.

import type { ScenarioLesson } from "../model";

export const contextWindow: ScenarioLesson = {
  id: "context-window",
  mode: "scenario",
  difficulty: "core",
  readoutKind: "budget",
  model: "qwen3.5",
  title: { en: "the four moves on the window", de: "die vier operationen am fenster" },
  blurb: {
    en: "four operations move tokens across the window boundary, but the budget never grows. you spend it on signal, not noise.",
    de: "vier operationen bewegen tokens über die fenstergrenze, aber das budget wächst nie. du gibst es für signal aus, nicht für rauschen.",
  },
  readout: { en: "the four moves", de: "die vier operationen" },
  dsl: {
    id: "context-window",
    name: { en: "the four moves on the window", de: "die vier operationen am fenster" },
    prompt: {
      en: "The auth refactor has been running a while and the window is filling. Keep going, and keep your context lean.",
      de: "Der Auth-Refactor läuft schon eine Weile und das Fenster füllt sich. Mach weiter und halte deinen Kontext schlank.",
    },
    provider: "ollama",
    system: {
      en: "You are a coding agent on a long task. Pull in only what you need, compact history when it grows, delegate messy exploration to a subagent, and write durable decisions to disk.",
      de: "Du bist ein Coding-Agent an einer langen Aufgabe. Zieh nur herein, was du brauchst, kompaktiere den Verlauf wenn er wächst, delegiere unruhige Exploration an einen Subagenten und schreib dauerhafte Entscheidungen auf die Disk.",
    },
    steps: [
      { think: { en: "I do not need the whole tree. I will pull in only the one file the task turns on: the session module.", de: "Ich brauche nicht den ganzen Baum. Ich ziehe nur die eine datei herein, um die sich die aufgabe dreht: das Session-Modul." } },
      { read: "src/auth/session.ts", result: { en: "export function session(req){ /* ...40 lines... */ }  // the token lifecycle lives here", de: "export function session(req){ /* ...40 zeilen... */ }  // hier lebt der token-lebenszyklus" } },
      { think: { en: "History has grown long. Before it starts to rot, compact the old turns down to a paragraph.", de: "Der Verlauf ist lang geworden. Bevor er zu verrotten beginnt, kompaktiere die alten runden auf einen absatz." } },
      { compact: { removedTurns: 10, summaryChars: 1200 } },
      { think: { en: "The caller graph is messy. I will explore it in a subagent, so its scratch work never touches this window.", de: "Der Aufrufer-Graph ist unruhig. Ich erkunde ihn in einem Subagenten, damit seine kladde dieses fenster nie berührt." } },
      {
        spawn: "explorer",
        label: "delegate",
        task: { en: "Trace every caller of session() and report just the list, nothing else.", de: "Verfolge jeden Aufrufer von session() und melde nur die liste, sonst nichts." },
        steps: [
          { think: { en: "walking the import graph in my own window; none of this lands upstream.", de: "ich laufe den import-graph in meinem eigenen fenster ab; nichts davon landet stromaufwärts." } },
          { say: { en: "12 callers, all under src/auth. list attached.", de: "12 aufrufer, alle unter src/auth. liste anbei." } },
        ],
      },
      { think: { en: "Merged: only the list came back, not the exploration. Now record the decision so it outlives this session.", de: "Zusammengeführt: nur die liste kam zurück, nicht die exploration. Jetzt halte ich die entscheidung fest, damit sie diese session überlebt." } },
      { write: "CLAUDE.md", result: { en: "ok, wrote 1 file", de: "ok, 1 datei geschrieben" } },
      { say: { en: "Context stayed lean: one file in, history compacted, exploration isolated, decision on disk.", de: "Der Kontext blieb schlank: eine datei rein, verlauf kompaktiert, exploration isoliert, entscheidung auf disk." } },
    ],
  },
  steps: [
    {
      advance: { until: "context_info" },
      cap: {
        en: "before any move, a <span class='k'>fixed budget</span>: 6 of 32 units of the window in use. every move below spends this same budget, and not one of them enlarges it.",
        de: "vor jeder operation ein <span class='k'>festes budget</span>: 6 von 32 einheiten des fensters belegt. jede operation unten gibt dasselbe budget aus, und keine einzige vergrößert es.",
      },
      stat: { label: { en: "budget", de: "budget" }, val: "6 / 32" },
    },
    {
      advance: { until: "tool_call" },
      cap: {
        en: "<span class='k'>select</span> (move 2): the agent reads only the one file the task needs, <b>src/auth/session.ts</b>, straight off the disk card. those bytes fill the window toward the cap.",
        de: "<span class='k'>select</span> (operation 2): der agent liest nur die eine datei, die die aufgabe braucht, <b>src/auth/session.ts</b>, direkt von der disk-karte. diese bytes füllen das fenster zur kappe.",
      },
      stat: { label: { en: "budget", de: "budget" }, val: "22 / 32" },
    },
    {
      advance: { until: "compaction" },
      cap: {
        en: "<span class='k'>compress</span> (move 3): history has grown, so the harness compacts it. ten turns collapse to one paragraph, the gist kept, the tokens freed. the budget drops.",
        de: "<span class='k'>compress</span> (operation 3): der verlauf ist gewachsen, also kompaktiert der harness ihn. zehn runden schrumpfen auf einen absatz, der kern bleibt, die tokens werden frei. das budget sinkt.",
      },
      stat: { label: { en: "budget", de: "budget" }, val: "13 / 32" },
    },
    {
      advance: { until: "agent_spawn" },
      cap: {
        en: "<span class='k'>isolate</span> (move 4): a messy sub-task goes to a <span class='k'>subagent</span> with its <span class='k'>own</span> window. it explores over there; its tokens never touch this budget, which holds at 13.",
        de: "<span class='k'>isolate</span> (operation 4): eine unruhige teilaufgabe geht an einen <span class='k'>subagenten</span> mit <span class='k'>eigenem</span> fenster. er erkundet dort drüben; seine tokens berühren dieses budget nie, das bei 13 bleibt.",
      },
      stat: { label: { en: "budget", de: "budget" }, val: "13 / 32" },
    },
    {
      advance: { until: "tool_call" },
      cap: {
        en: "<span class='k'>write</span> (move 1): the subagent merged back just its answer, not its scratch. the agent writes the decision to <b>CLAUDE.md</b> on disk, where it survives the session. the budget drops again.",
        de: "<span class='k'>write</span> (operation 1): der subagent führte nur seine antwort zurück, nicht seine kladde. der agent schreibt die entscheidung in <b>CLAUDE.md</b> auf die disk, wo sie die session überlebt. das budget sinkt erneut.",
      },
      stat: { label: { en: "budget", de: "budget" }, val: "9 / 32" },
    },
    {
      advance: "rest",
      cap: {
        en: "four moves, and the <span class='k'>budget never passed its cap</span>. that is the whole discipline: a fixed window spent on signal, not noise. the durable change is on disk, and control returns to <span class='k'>you</span>.",
        de: "vier operationen, und das <span class='k'>budget überschritt nie seine kappe</span>. das ist die ganze disziplin: ein festes fenster, ausgegeben für signal, nicht rauschen. die dauerhafte änderung liegt auf der disk, und die kontrolle geht an <span class='k'>dich</span> zurück.",
      },
      stat: { label: { en: "budget", de: "budget" }, val: "9 / 32" },
    },
  ],
};
