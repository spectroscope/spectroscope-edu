// Lesson: a real feature, many turns.
//
// Scenario mode: a longer, richer sibling of the loop lesson, folded through the
// simulator's own engine. The agent ships a whole small feature (a --json flag on
// a CLI) instead of answering one question: it plans, orients by listing the dir,
// reads the code before editing, writes the change, runs the tests (they FAIL for
// real), reads the test to learn what green requires, writes a precise fix, re-runs
// (PASS), then hardens with a regression test and runs once more (PASS). Every step
// is small and verified; a failure is just the next input; the loop keeps closing;
// the context grows and session.jsonl accumulates the whole trail. The point is
// that agency is sustaining the loop over a task, not one clever answer. Control
// returns to the user at the end. The readout is the growing session.jsonl.

import type { ScenarioLesson } from "../model";

export const multiStep: ScenarioLesson = {
  id: "multistep",
  mode: "scenario",
  difficulty: "deep",
  readoutKind: "log",
  model: "qwen3.5",
  title: { en: "a real feature, many turns", de: "ein echtes feature, viele runden" },
  blurb: {
    en: "one clever answer is not agency. shipping a whole feature is: plan, read, edit, test, read the failure, fix, re-run, harden. watch the loop close again and again while session.jsonl fills up.",
    de: "eine geniale antwort ist keine handlungsfähigkeit. ein ganzes feature zu liefern schon: planen, lesen, ändern, testen, den fehler lesen, fixen, erneut laufen lassen, abhärten. sieh zu, wie die loop sich immer wieder schließt, während session.jsonl sich füllt.",
  },
  readout: { en: "session.jsonl", de: "session.jsonl" },
  dsl: {
    id: "multistep",
    name: { en: "a real feature, many turns", de: "ein echtes feature, viele runden" },
    prompt: {
      en: "Add a --json flag to the `stats` CLI so it can print machine-readable output.",
      de: "Füge dem `stats`-CLI ein --json-Flag hinzu, damit es maschinenlesbar ausgeben kann.",
    },
    provider: "ollama",
    system: {
      en: "You are a coding agent. Work in small, verified steps: read before you edit, and run the tests after every change.",
      de: "Du bist ein Coding-Agent. Arbeite in kleinen, geprüften Schritten: lies, bevor du änderst, und lass nach jeder Änderung die Tests laufen.",
    },
    steps: [
      {
        think: {
          en: "Let me treat this as a small project, not a one-line edit. Plan: read the parser and the stats command, add the flag, then let the tests tell me if the output shape is right.",
          de: "Ich behandle das als kleines Projekt, nicht als Einzeiler. Plan: Parser und stats-Befehl lesen, das Flag hinzufügen, dann die Tests entscheiden lassen, ob die Ausgabe-Struktur stimmt.",
        },
      },
      { list: "src/cli/", result: "stats.ts  args.ts  format.ts  index.ts" },
      {
        read: "src/cli/args.ts",
        result: {
          en: "parses --verbose and --limit; unknown flags throw",
          de: "parst --verbose und --limit; unbekannte Flags werfen einen Fehler",
        },
      },
      {
        read: "src/cli/stats.ts",
        result: {
          en: "collects the counts, calls formatTable(rows), prints the table",
          de: "sammelt die Zahlen, ruft formatTable(rows) auf, druckt die Tabelle",
        },
      },
      {
        think: {
          en: "So I add --json to the allowed flags in the parser, and branch stats to print the rows as JSON when it is set.",
          de: "Also ergänze ich --json bei den erlaubten Flags im Parser und lasse stats die Zeilen als JSON drucken, wenn es gesetzt ist.",
        },
      },
      { write: "src/cli/args.ts", result: "ok, wrote 1 file" },
      { write: "src/cli/stats.ts", result: "ok, wrote 1 file" },
      {
        run: "npm test -- stats",
        gate: "allow",
        error: true,
        result: {
          en: "FAIL: --json prints [object Object] (expected valid JSON), 1 failing",
          de: "FAIL: --json druckt [object Object] (gültiges JSON erwartet), 1 fehlgeschlagen",
        },
      },
      {
        think: {
          en: "Right: I handed the row objects straight to console.log, so they stringify as [object Object]. I need JSON.stringify, and the test wants a trailing newline.",
          de: "Klar: ich habe die Zeilen-Objekte direkt an console.log gegeben, also werden sie als [object Object] ausgegeben. Ich brauche JSON.stringify, und der Test will einen abschließenden Zeilenumbruch.",
        },
      },
      {
        read: "test/stats.test.ts",
        result: {
          en: "expects JSON.parse(stdout) to deep-equal the rows, and stdout to end with a newline",
          de: "erwartet, dass JSON.parse(stdout) den Zeilen entspricht und stdout mit einem Zeilenumbruch endet",
        },
      },
      { write: "src/cli/stats.ts", result: "ok, wrote 1 file" },
      { run: "npm test -- stats", gate: "allow", result: { en: "PASS 8 of 8", de: "PASS 8 von 8" } },
      {
        think: {
          en: "Green, but the flag is only tested on one dataset. I will harden it: add a regression test for the empty case, then run the suite again.",
          de: "Grün, aber das Flag ist nur an einem Datensatz getestet. Ich härte es ab: ein Regressionstest für den leeren Fall, dann die Suite erneut laufen lassen.",
        },
      },
      { write: "test/stats.test.ts", result: "ok, wrote 1 file" },
      { run: "npm test -- stats", gate: "allow", result: { en: "PASS 9 of 9", de: "PASS 9 von 9" } },
      {
        say: {
          en: "Done. --json now prints parseable JSON with a trailing newline, covered by a new regression test. All 9 stats tests pass.",
          de: "Fertig. --json druckt jetzt parsebares JSON mit abschließendem Zeilenumbruch, abgedeckt durch einen neuen Regressionstest. Alle 9 stats-Tests sind grün.",
        },
      },
    ],
  },
  steps: [
    {
      advance: { until: "context_info" },
      cap: {
        en: "adding a flag is not one edit, it is a whole small project. first the harness <span class='k'>assembles the window</span>: system prompt, repo rules, tool defs, the task. the model has a feature to build, not a sentence to write.",
        de: "ein flag hinzuzufügen ist nicht eine änderung, sondern ein ganzes kleines projekt. zuerst <span class='k'>baut der harness das fenster zusammen</span>: system-prompt, repo-regeln, tool-defs, die aufgabe. das modell hat ein feature zu bauen, keinen satz zu schreiben.",
      },
      log: { en: "<b>assemble</b> · a feature to build, not one answer", de: "<b>assemble</b> · ein feature zu bauen, nicht eine antwort" },
    },
    {
      advance: { until: "tool_result" },
      cap: {
        en: "real agency starts by <span class='k'>looking, not leaping</span>. the model does not guess the file layout; it lists the cli directory to see what it is working with. the disk station lights, read-only.",
        de: "echte handlungsfähigkeit beginnt mit <span class='k'>schauen, nicht springen</span>. das modell rät das datei-layout nicht; es listet den cli-ordner, um zu sehen, womit es arbeitet. die disk-station leuchtet, nur lesend.",
      },
      log: { en: "list_dir <b>src/cli/</b> · orient before you touch anything", de: "list_dir <b>src/cli/</b> · orientieren, bevor du etwas anfässt" },
    },
    {
      advance: { until: "tool_result", nth: 2 },
      cap: {
        en: "before changing anything, it <span class='k'>reads the code it will edit</span>: the arg parser and the stats command. now it knows the shape, unknown flags throw, and stats prints a formatted table.",
        de: "bevor es etwas ändert, <span class='k'>liest es den code, den es bearbeiten wird</span>: den arg-parser und den stats-befehl. jetzt kennt es die struktur, unbekannte flags werfen einen fehler, und stats druckt eine formatierte tabelle.",
      },
      log: { en: "read_file <b>args.ts</b> · <b>stats.ts</b> · learn the shape first", de: "read_file <b>args.ts</b> · <b>stats.ts</b> · erst die struktur lernen" },
    },
    {
      advance: { until: "tool_result", nth: 2 },
      cap: {
        en: "now it edits: it adds <span class='k'>--json</span> to the allowed flags and a branch in stats that prints json when the flag is set. two small writes, and these are the <span class='k'>durable change</span> on disk.",
        de: "jetzt bearbeitet es: es ergänzt <span class='k'>--json</span> bei den erlaubten flags und einen zweig in stats, der json druckt, wenn das flag gesetzt ist. zwei kleine writes, und das sind die <span class='k'>dauerhafte änderung</span> auf disk.",
      },
      log: { en: "write_file <b>args.ts</b> · <b>stats.ts</b> · the durable change", de: "write_file <b>args.ts</b> · <b>stats.ts</b> · die dauerhafte änderung" },
    },
    {
      advance: { until: "tool_result" },
      cap: {
        en: "it does not assume the edit worked. it <span class='k'>runs the tests</span>, the gate <span class='a'>allows</span> it (running tests is safe), and reality pushes back: <span class='r'>FAIL, --json prints [object Object]</span>. a failure is not the end of the run, it is the next input.",
        de: "es nimmt nicht an, dass die änderung geklappt hat. es <span class='k'>lässt die tests laufen</span>, das gate <span class='a'>erlaubt</span> es (tests laufen zu lassen ist harmlos), und die realität meldet zurück: <span class='r'>FAIL, --json druckt [object Object]</span>. ein fehler ist nicht das ende des laufs, sondern der nächste input.",
      },
      log: { en: "exec → <span class='r'>FAIL</span> --json prints [object Object]", de: "exec → <span class='r'>FAIL</span> --json druckt [object Object]" },
    },
    {
      advance: { until: "tool_result" },
      cap: {
        en: "the loop <span class='k'>closes and runs again</span> with the failure in hand. instead of guessing, it reads the test to learn exactly what green requires: parseable json that ends in a newline.",
        de: "die loop <span class='k'>schließt und läuft erneut</span>, den fehler in der hand. statt zu raten, liest es den test, um genau zu erfahren, was grün verlangt: parsebares json, das mit einem zeilenumbruch endet.",
      },
      log: { en: "read_file <b>stats.test.ts</b> · what does green actually require?", de: "read_file <b>stats.test.ts</b> · was verlangt grün wirklich?" },
    },
    {
      advance: { until: "tool_result" },
      cap: {
        en: "now the fix is precise, not a shot in the dark: it had passed the row objects straight to the log, so it <span class='k'>writes JSON.stringify plus the newline</span> the test asks for. small, targeted, and about to be verified.",
        de: "jetzt ist der fix präzise, kein schuss ins blaue: es hatte die zeilen-objekte direkt in den log gegeben, also <span class='k'>schreibt es JSON.stringify plus den zeilenumbruch</span>, den der test verlangt. klein, gezielt, und gleich überprüft.",
      },
      log: { en: "write_file <b>stats.ts</b> · JSON.stringify + newline", de: "write_file <b>stats.ts</b> · JSON.stringify + zeilenumbruch" },
    },
    {
      advance: { until: "tool_result" },
      cap: {
        en: "same test, run again. this time reality agrees: <span class='g'>PASS 8 of 8</span>. the step only counts as done when the check passes, <span class='k'>not when the model feels finished</span>.",
        de: "derselbe test, erneut ausgeführt. diesmal stimmt die realität zu: <span class='g'>PASS 8 von 8</span>. der schritt gilt erst als erledigt, wenn die prüfung besteht, <span class='k'>nicht wenn das modell sich fertig fühlt</span>.",
      },
      log: { en: "exec → <span class='g'>PASS 8 of 8</span>", de: "exec → <span class='g'>PASS 8 von 8</span>" },
    },
    {
      advance: { until: "tool_result", nth: 2 },
      cap: {
        en: "green is not the same as done. it <span class='k'>hardens the feature</span>: adds a regression test for the empty-dataset case, then re-runs. <span class='g'>PASS 9 of 9</span>, and the new test locks the behaviour in for next time.",
        de: "grün ist nicht dasselbe wie fertig. es <span class='k'>härtet das feature ab</span>: ergänzt einen regressionstest für den fall leerer daten, dann erneut ausführen. <span class='g'>PASS 9 von 9</span>, und der neue test hält das verhalten fürs nächste mal fest.",
      },
      log: { en: "write_file <b>stats.test.ts</b> · exec → <span class='g'>PASS 9 of 9</span>", de: "write_file <b>stats.test.ts</b> · exec → <span class='g'>PASS 9 von 9</span>" },
    },
    {
      advance: "rest",
      cap: {
        en: "the feature is built and verified, so the model emits <span class='k'>end_turn</span> and control returns to <span class='k'>you</span>. no single step was clever; the agency was in <span class='k'>sustaining the loop</span>, and the whole trail is on disk in session.jsonl, replayable line by line.",
        de: "das feature ist gebaut und geprüft, also gibt das modell <span class='k'>end_turn</span> aus und die kontrolle geht an <span class='k'>dich</span> zurück. kein einzelner schritt war genial; die handlungsfähigkeit lag darin, <span class='k'>die loop durchzuhalten</span>, und die ganze spur liegt in session.jsonl auf disk, zeile für zeile abspielbar.",
      },
      log: { en: "<b>end_turn</b> · 9 tool calls, one feature, control back to you", de: "<b>end_turn</b> · 9 tool-calls, ein feature, kontrolle zurück an dich" },
    },
  ],
};
