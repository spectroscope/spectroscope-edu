// Lesson 3 — one turn through the machine (the harness loop).
//
// Scenario mode: a real single-agent run, folded through the simulator's own
// engine. A coding turn that runs the auth test (it fails for real), reads the
// client, writes the fix, reruns (it passes), then ends the turn. The learner
// steps station by station and watches the OS band light up, the gate go
// pending → allowed, and reality (a FAIL, then a PASS) feed back into the loop.
// The readout is the growing session.jsonl.

import type { ScenarioLesson } from "../model";

export const loop: ScenarioLesson = {
  id: "loop",
  mode: "scenario",
  difficulty: "core",
  readoutKind: "log",
  model: "qwen3.5",
  title: { en: "one turn through the machine", de: "eine runde durch die maschine" },
  blurb: {
    en: "the model emits one thing; the harness runs every step and feeds reality back. watch a real turn: assemble, decide, gate, execute, observe, repeat.",
    de: "das modell gibt genau eine sache aus; der harness führt jeden schritt aus und speist die realität zurück. sieh einer echten runde zu: zusammenbauen, entscheiden, gate, ausführen, beobachten, wiederholen.",
  },
  readout: { en: "session.jsonl", de: "session.jsonl" },
  dsl: {
    id: "loop",
    name: { en: "one turn through the machine", de: "eine runde durch die maschine" },
    prompt: {
      en: "The auth integration test is failing. Find why and fix it.",
      de: "Der Auth-Integrationstest schlägt fehl. Finde die Ursache und behebe sie.",
    },
    provider: "ollama",
    system: {
      en: "You are a coding agent. Work in small steps and run the tests.",
      de: "Du bist ein Coding-Agent. Arbeite in kleinen Schritten und lass die Tests laufen.",
    },
    steps: [
      { think: { en: "First, run the auth test and read the actual failure.", de: "Zuerst den Auth-Test laufen lassen und den echten Fehler lesen." } },
      { run: "npm test -- auth", gate: "allow", error: true, result: { en: "FAIL: expected 200, got 401 (1 failing)", de: "FAIL: erwartet 200, bekam 401 (1 fehlgeschlagen)" } },
      { think: { en: "401 means the request has no auth header. Let me read the http client.", de: "401 heißt: der Request hat keinen Auth-Header. Ich lese den HTTP-Client." } },
      { read: "src/http/client.ts", result: { en: "export function request(url){ return fetch(url) }  // no Authorization header", de: "export function request(url){ return fetch(url) }  // kein Authorization-Header" } },
      { write: "src/http/client.ts", result: "ok, wrote 1 file" },
      { run: "npm test -- auth", gate: "allow", result: { en: "PASS 12 of 12", de: "PASS 12 von 12" } },
      { say: { en: "Fixed: the client never sent the Authorization header. All 12 auth tests pass.", de: "Behoben: der Client schickte nie den Authorization-Header. Alle 12 Auth-Tests sind grün." } },
    ],
  },
  steps: [
    {
      advance: { until: "context_info" },
      cap: {
        en: "the harness <span class='k'>assembles the window</span>: system prompt, project rules, tool defs, the history. that bundle is handed to the model. it has not decided anything yet.",
        de: "der harness <span class='k'>baut das fenster zusammen</span>: system-prompt, projekt-regeln, tool-defs, verlauf. dieses bündel geht an das modell. es hat noch nichts entschieden.",
      },
      log: { en: "<b>assemble</b> · system + rules + tools + history", de: "<b>assemble</b> · system + regeln + tools + verlauf" },
    },
    {
      advance: { until: "tool_call" },
      cap: {
        en: "the model reads the window and <span class='k'>emits one thing</span>. here it is a tool call, not an answer: <span class='k'>run the auth test</span>. the shell station lights up.",
        de: "das modell liest das fenster und <span class='k'>gibt genau eine sache aus</span>. hier ein tool-call, keine antwort: <span class='k'>auth-test laufen lassen</span>. die shell-station leuchtet auf.",
      },
      log: { en: "model → <b>tool_use</b> · run_command <b>npm test -- auth</b>", de: "modell → <b>tool_use</b> · run_command <b>npm test -- auth</b>" },
    },
    {
      advance: { until: "permission_request" },
      cap: {
        en: "before the command runs, the <span class='k'>gate</span> stops the loop and asks: allow, ask, or deny? nothing side-effecting crosses without a decision.",
        de: "bevor der befehl läuft, hält das <span class='k'>gate</span> die loop an und fragt: erlauben, fragen, ablehnen? nichts mit nebenwirkung passiert ohne entscheidung.",
      },
      log: { en: "gate → <b>pending</b> · run_command", de: "gate → <b>pending</b> · run_command" },
    },
    {
      advance: { until: "permission_decision" },
      cap: {
        en: "running the test suite is safe, so the gate <span class='a'>allows</span> it. the verdict is logged as an observation, whichever way it goes.",
        de: "die test-suite laufen zu lassen ist harmlos, also <span class='a'>erlaubt</span> das gate es. das urteil wird als beobachtung geloggt, egal wie es ausfällt.",
      },
      log: { en: "gate → <span class='a'>allow</span> · logged", de: "gate → <span class='a'>erlaubt</span> · geloggt" },
    },
    {
      advance: { until: "tool_result" },
      cap: {
        en: "the harness <span class='k'>runs the tool for real</span> and captures reality. permission is not success: <span class='r'>FAIL, expected 200, got 401</span>.",
        de: "der harness <span class='k'>führt das tool echt aus</span> und fängt die realität ein. erlaubnis ist kein erfolg: <span class='r'>FAIL, erwartet 200, bekam 401</span>.",
      },
      log: { en: "exec → <span class='r'>FAIL</span> expected 200, got 401", de: "exec → <span class='r'>FAIL</span> erwartet 200, bekam 401" },
    },
    {
      advance: { until: "tool_call" },
      cap: {
        en: "the failure <span class='k'>becomes the next input</span>. the loop closes and runs again, and now the model can correct: it reads the http client off disk.",
        de: "der fehler <span class='k'>wird zum nächsten input</span>. die loop schließt und läuft erneut, jetzt kann das modell korrigieren: es liest den http-client von der disk.",
      },
      log: { en: "observation appended · read_file <b>client.ts</b>", de: "beobachtung angehängt · read_file <b>client.ts</b>" },
    },
    {
      advance: { until: "tool_call" },
      cap: {
        en: "it found the bug: no Authorization header. the model <span class='k'>writes the fix</span> to disk, the one durable change in this whole turn.",
        de: "es hat den bug gefunden: kein Authorization-Header. das modell <span class='k'>schreibt den fix</span> auf die disk, die eine dauerhafte änderung in dieser ganzen runde.",
      },
      log: { en: "write_file <b>client.ts</b> · the durable change", de: "write_file <b>client.ts</b> · die dauerhafte änderung" },
    },
    {
      advance: { until: "tool_result", nth: 2 },
      cap: {
        en: "it reruns the same test. the gate allows, the harness executes, and this time reality agrees: <span class='g'>PASS 12 of 12</span>.",
        de: "es lässt denselben test erneut laufen. das gate erlaubt, der harness führt aus, und diesmal stimmt die realität zu: <span class='g'>PASS 12 von 12</span>.",
      },
      log: { en: "exec → <span class='g'>PASS 12 of 12</span>", de: "exec → <span class='g'>PASS 12 von 12</span>" },
    },
    {
      advance: "rest",
      cap: {
        en: "with the tests green the model emits <span class='k'>end_turn</span>. the loop closes and control returns to <span class='k'>you</span>. the whole turn is on disk in session.jsonl, replayable line by line.",
        de: "mit grünen tests gibt das modell <span class='k'>end_turn</span> aus. die loop schließt und die kontrolle geht an <span class='k'>dich</span> zurück. die ganze runde liegt in session.jsonl auf disk, zeile für zeile abspielbar.",
      },
      log: { en: "<b>end_turn</b> · control returns to you", de: "<b>end_turn</b> · kontrolle geht an dich zurück" },
    },
  ],
};
