// Lesson mcp: tools from another process.
//
// Scenario mode: a real turn, folded through the simulator's own engine, whose
// mcp__ tool calls light the mcp chain in the OS band exactly as the simulator
// draws it. The user asks about an old decision; the answer lives in a separate
// notes app the harness knows nothing about. The model reaches for an mcp tool,
// the mcp client lights, the SAME permission gate holds it, the allowed call
// rides out through the network stack to the external notes server, and the
// server's result folds back into the window like any local tool result. A
// second call shows the protocol is standard: any server plugs into the same
// chain. The readout is the growing session.jsonl. The beat is reach out, gate,
// ride the chain, fold back, reuse, and control back to you.

import type { ScenarioLesson } from "../model";

export const mcp: ScenarioLesson = {
  id: "mcp",
  mode: "scenario",
  difficulty: "core",
  readoutKind: "log",
  model: "qwen3.5",
  title: { en: "mcp: tools from another process", de: "mcp: tools aus einem anderen prozess" },
  blurb: {
    en: "a tool the agent calls does not have to live in the harness. watch an mcp call ride out to a separate server process, pass the same gate, and fold its result back: one standard protocol, any server.",
    de: "ein tool, das der agent aufruft, muss nicht im harness leben. sieh zu, wie ein mcp-call zu einem separaten server-prozess hinausreist, dasselbe gate passiert und sein resultat zurückfaltet: ein standard-protokoll, jeder server.",
  },
  readout: { en: "session.jsonl", de: "session.jsonl" },
  dsl: {
    id: "mcp",
    name: { en: "mcp: tools from another process", de: "mcp: tools aus einem anderen prozess" },
    prompt: {
      en: "What was the root cause we found for the flaky nightly build last month? Check my notes.",
      de: "Was war die Ursache, die wir letzten Monat für den wackligen Nightly-Build gefunden haben? Sieh in meinen Notizen nach.",
    },
    provider: "ollama",
    system: {
      en: "You are an assistant with access to the user's notes over mcp. Cite what you find.",
      de: "Du bist ein Assistent mit Zugriff auf die Notizen des Nutzers über mcp. Belege, was du findest.",
    },
    steps: [
      {
        think: {
          en: "The answer is in your notes, and those live in a separate notes app, not on my own disk. I will ask its mcp server over the protocol.",
          de: "Die Antwort steckt in deinen Notizen, und die leben in einer separaten Notizen-App, nicht auf meiner eigenen Disk. Ich frage ihren mcp-Server über das Protokoll.",
        },
      },
      {
        mcp: "notes__search_notes",
        input: { query: "flaky nightly build root cause" },
        gate: "allow",
        result: {
          en: "3 notes matched: '2026-06 nightly build', 'postgres :5432 clash', 'ci flakiness log'",
          de: "3 Notizen gefunden: '2026-06 Nightly-Build', 'Postgres :5432 Konflikt', 'CI-Flakiness-Log'",
        },
      },
      {
        think: {
          en: "The top hit looks right. Let me open the full note and read the exact conclusion.",
          de: "Der oberste Treffer sieht richtig aus. Ich öffne die ganze Notiz und lese die genaue Schlussfolgerung.",
        },
      },
      {
        mcp: "notes__get_note",
        input: { id: "2026-06-nightly-build" },
        gate: "allow",
        result: {
          en: "Root cause: a leftover postgres container still held :5432, so the integration step timed out. Fix: wait for the port before binding.",
          de: "Ursache: ein übrig gebliebener Postgres-Container hielt noch :5432, also lief der Integrations-Schritt in den Timeout. Fix: auf den Port warten, bevor gebunden wird.",
        },
      },
      {
        say: {
          en: "From your notes: the flaky nightly build was a leftover postgres container holding port 5432, so the integration step timed out. The fix was to wait for the port to free before binding.",
          de: "Aus deinen Notizen: der wacklige Nightly-Build war ein übrig gebliebener Postgres-Container, der Port 5432 hielt, also lief der Integrations-Schritt in den Timeout. Der Fix war, auf das Freiwerden des Ports zu warten, bevor gebunden wird.",
        },
      },
    ],
  },
  steps: [
    {
      advance: { until: "thinking_delta" },
      cap: {
        en: "you ask about an old decision. the answer is in <span class='k'>your notes</span>, a separate app the harness knows nothing about. the model cannot read that off its own disk, so it reaches for a different kind of tool.",
        de: "du fragst nach einer alten entscheidung. die antwort steckt in <span class='k'>deinen notizen</span>, einer separaten app, von der der harness nichts weiß. das modell kann die nicht von seiner eigenen disk lesen, also greift es zu einer anderen art von tool.",
      },
      log: {
        en: "<b>reason</b> · the notes live in a separate app",
        de: "<b>reason</b> · die notizen leben in einer separaten app",
      },
    },
    {
      advance: { until: "tool_call" },
      activeEdges: ["e-agent-osmcp"],
      cap: {
        en: "the model emits <span class='k'>notes__search_notes</span>. this tool does not live in the harness: it lives in a <span class='k'>separate server process</span>. the harness holds only an <span class='k'>mcp client</span>, and that client lights up in the os band.",
        de: "das modell gibt <span class='k'>notes__search_notes</span> aus. dieses tool lebt nicht im harness: es lebt in einem <span class='k'>separaten server-prozess</span>. der harness hält nur einen <span class='k'>mcp-client</span>, und der leuchtet im os-band auf.",
      },
      log: {
        en: "model → <b>tool_use</b> · mcp__notes__search_notes",
        de: "modell → <b>tool_use</b> · mcp__notes__search_notes",
      },
    },
    {
      advance: { until: "permission_request" },
      activeEdges: ["e-agent-osmcp"],
      cap: {
        en: "remote does not mean unguarded. the call hits the <span class='k'>same permission gate</span> as any local tool and the loop stops: allow, ask, or deny? there is no side door for mcp.",
        de: "remote heißt nicht ungeschützt. der call trifft dasselbe <span class='k'>permission-gate</span> wie jedes lokale tool und die loop hält an: erlauben, fragen, ablehnen? es gibt keine hintertür für mcp.",
      },
      log: {
        en: "gate → <b>pending</b> · mcp__notes__search_notes",
        de: "gate → <b>pending</b> · mcp__notes__search_notes",
      },
    },
    {
      advance: { until: "permission_decision" },
      activeEdges: ["e-agent-osmcp", "e-osmcp-osnet"],
      cap: {
        en: "reading your notes is safe, so the gate <span class='a'>allows</span> it. now the call <span class='k'>rides the chain</span>: mcp client, out through the network stack, to the external notes server. the whole chain is lit end to end.",
        de: "deine notizen zu lesen ist harmlos, also <span class='a'>erlaubt</span> das gate es. jetzt <span class='k'>reitet der call die kette</span>: mcp-client, hinaus durch den netz-stack, zum externen notizen-server. die ganze kette leuchtet von ende zu ende.",
      },
      log: {
        en: "gate → <span class='a'>allow</span> · call rides out to the notes server",
        de: "gate → <span class='a'>erlaubt</span> · call reist hinaus zum notizen-server",
      },
    },
    {
      advance: { until: "tool_result" },
      cap: {
        en: "the <span class='k'>external server</span> runs the search in its own process and hands back a result. it <span class='k'>folds into the window</span> as an observation, byte for byte like a local tool result. the harness never had to know what a note is.",
        de: "der <span class='k'>externe server</span> führt die suche in seinem eigenen prozess aus und gibt ein resultat zurück. es <span class='k'>faltet sich ins fenster</span> als beobachtung, byte für byte wie ein lokales tool-resultat. der harness musste nie wissen, was eine notiz ist.",
      },
      log: {
        en: "mcp result → <span class='g'>3 notes matched</span> · folded back",
        de: "mcp-resultat → <span class='g'>3 notizen gefunden</span> · zurückgefaltet",
      },
    },
    {
      advance: { until: "thinking_delta" },
      cap: {
        en: "the model reads the three hits and picks the top one. it decides to <span class='k'>open the full note</span>, so it will make a second call over the same protocol.",
        de: "das modell liest die drei treffer und wählt den obersten. es entscheidet, die <span class='k'>ganze notiz zu öffnen</span>, macht also einen zweiten aufruf über dasselbe protokoll.",
      },
      log: {
        en: "<b>reason</b> · open the full note",
        de: "<b>reason</b> · die ganze notiz öffnen",
      },
    },
    {
      advance: { until: "tool_call" },
      activeEdges: ["e-agent-osmcp", "e-osmcp-osnet"],
      cap: {
        en: "<span class='k'>notes__get_note</span> lights the same chain again. mcp is a <span class='k'>standard protocol</span>, so any server plugs in the same way: your notes today, a database, a browser, or a ticket system tomorrow, all through one client.",
        de: "<span class='k'>notes__get_note</span> lässt dieselbe kette erneut leuchten. mcp ist ein <span class='k'>standard-protokoll</span>, also klinkt sich jeder server gleich ein: heute deine notizen, morgen eine datenbank, ein browser oder ein ticket-system, alles über einen client.",
      },
      log: {
        en: "model → <b>tool_use</b> · mcp__notes__get_note",
        de: "modell → <b>tool_use</b> · mcp__notes__get_note",
      },
    },
    {
      advance: { until: "tool_result" },
      cap: {
        en: "same gate, <span class='a'>allowed</span> again, and the server returns the note body. two round trips to another process, and every step is already appended to <span class='k'>session.jsonl</span> on disk.",
        de: "dasselbe gate, wieder <span class='a'>erlaubt</span>, und der server gibt den notiz-text zurück. zwei rundreisen zu einem anderen prozess, und jeder schritt ist schon an <span class='k'>session.jsonl</span> auf der disk angehängt.",
      },
      log: {
        en: "gate → <span class='a'>allow</span> · mcp result → <span class='g'>note body back</span>",
        de: "gate → <span class='a'>erlaubt</span> · mcp-resultat → <span class='g'>notiz-text zurück</span>",
      },
    },
    {
      advance: "rest",
      cap: {
        en: "the model answers you from notes it never held locally. it emits <span class='k'>end_turn</span> and control returns to <span class='k'>you</span>. the whole mcp round trip is on disk, replayable line by line.",
        de: "das modell antwortet dir aus notizen, die es lokal nie hatte. es gibt <span class='k'>end_turn</span> aus und die kontrolle geht an <span class='k'>dich</span> zurück. die ganze mcp-rundreise liegt auf der disk, zeile für zeile abspielbar.",
      },
      log: {
        en: "<b>end_turn</b> · control returns to you",
        de: "<b>end_turn</b> · kontrolle geht an dich zurück",
      },
    },
  ],
};
