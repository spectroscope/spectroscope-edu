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
        en: "the window is a <span class='k'>fixed budget</span>: 6 of 32 units in use, and the cap never moves. there are only four ways to move tokens across its edge, <span class='k'>select</span>, <span class='k'>compress</span>, <span class='k'>isolate</span>, <span class='k'>write</span>, and not one of them enlarges the window. watch each spend the same budget.",
        de: "das fenster ist ein <span class='k'>festes budget</span>: 6 von 32 einheiten belegt, und die kappe bewegt sich nie. es gibt nur vier wege, tokens über seine kante zu bewegen, <span class='k'>select</span>, <span class='k'>compress</span>, <span class='k'>isolate</span>, <span class='k'>write</span>, und keiner vergrößert das fenster. sieh zu, wie jeder dasselbe budget ausgibt.",
      },
      stat: { label: { en: "budget", de: "budget" }, val: "6 / 32" },
    },
    {
      advance: { until: "tool_call" },
      cap: {
        en: "<span class='k'>select</span> is the move IN: pull in only what the task turns on. the agent reads the one file, <b>src/auth/session.ts</b>, not the whole tree. paying for signal costs budget, so it climbs, but every byte was chosen.",
        de: "<span class='k'>select</span> ist die bewegung HINEIN: zieh nur herein, worum sich die aufgabe dreht. der agent liest die eine datei, <b>src/auth/session.ts</b>, nicht den ganzen baum. für signal zu zahlen kostet budget, es steigt also, aber jedes byte war gewählt.",
      },
      stat: { label: { en: "budget", de: "budget" }, val: "22 / 32" },
    },
    {
      advance: { until: "compaction" },
      cap: {
        en: "<span class='k'>compress</span> reclaims space WITHOUT losing the thread: the harness folds ten old turns into one paragraph. the gist stays, the raw tokens are freed, and the budget falls from 22 back to 13. this is what keeps a long task from rotting.",
        de: "<span class='k'>compress</span> gewinnt platz zurück, OHNE den faden zu verlieren: der harness faltet zehn alte runden in einen absatz. der kern bleibt, die rohen tokens werden frei, und das budget fällt von 22 zurück auf 13. das ist es, was eine lange aufgabe vor dem verrotten bewahrt.",
      },
      stat: { label: { en: "budget", de: "budget" }, val: "13 / 32" },
    },
    {
      advance: { until: "agent_spawn" },
      cap: {
        en: "<span class='k'>isolate</span> spends the mess somewhere else. the noisy sub-task goes to a <span class='k'>subagent</span> with its <span class='k'>own</span> window. it will read, guess and backtrack over there, and none of that ever lands in this window. this budget holds at 13.",
        de: "<span class='k'>isolate</span> gibt das durcheinander woanders aus. die unruhige teilaufgabe geht an einen <span class='k'>subagenten</span> mit <span class='k'>eigenem</span> fenster. er wird dort drüben lesen, raten und zurückgehen, und nichts davon landet je in diesem fenster. dieses budget bleibt bei 13.",
      },
      stat: { label: { en: "budget", de: "budget" }, val: "13 / 32" },
    },
    {
      advance: { until: "agent_message" },
      cap: {
        en: "the subagent finishes and <span class='k'>merges back just its answer</span>, twelve callers, not the exploration it took to find them. isolation is the point: you get the distilled result at a fixed cost, and the scratch work is discarded with its window.",
        de: "der subagent ist fertig und <span class='k'>führt nur seine antwort zurück</span>, zwölf aufrufer, nicht die exploration, die ihn dorthin brachte. genau darum geht es bei isolation: du bekommst das destillierte ergebnis zu festen kosten, und die kladde wird mit ihrem fenster verworfen.",
      },
      stat: { label: { en: "budget", de: "budget" }, val: "13 / 32" },
    },
    {
      advance: { until: "tool_call" },
      cap: {
        en: "<span class='k'>write</span> is the move OUT: move a durable decision off the window and onto disk. the agent writes it to <b>CLAUDE.md</b>, where it outlives this session and every future turn can read it back. the window shrinks again, to 9.",
        de: "<span class='k'>write</span> ist die bewegung HINAUS: schieb eine dauerhafte entscheidung aus dem fenster auf die disk. der agent schreibt sie in <b>CLAUDE.md</b>, wo sie diese session überlebt und jede zukünftige runde sie zurücklesen kann. das fenster schrumpft wieder, auf 9.",
      },
      stat: { label: { en: "budget", de: "budget" }, val: "9 / 32" },
    },
    {
      advance: "rest",
      cap: {
        en: "four moves, and the <span class='k'>budget never passed its cap</span>. select in, compress down, isolate away, write out: that is the whole discipline of context, a fixed window spent on signal, not noise. the durable change is on disk, and control returns to <span class='k'>you</span>.",
        de: "vier operationen, und das <span class='k'>budget überschritt nie seine kappe</span>. select rein, compress runter, isolate weg, write raus: das ist die ganze disziplin des kontexts, ein festes fenster, ausgegeben für signal, nicht rauschen. die dauerhafte änderung liegt auf der disk, und die kontrolle geht an <span class='k'>dich</span> zurück.",
      },
      stat: { label: { en: "budget", de: "budget" }, val: "9 / 32" },
    },
  ],
};
