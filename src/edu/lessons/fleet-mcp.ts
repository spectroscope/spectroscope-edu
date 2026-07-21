// Lesson 8: a fleet that reaches out (orchestration + external tools).
//
// Scenario mode: the fan-out from lesson 7, now with external reach. A release
// orchestrator must clear three third-party dependencies against a live advisory
// database before shipping. Each lookup returns a large record, so instead of
// grinding all three through one window the main agent spawns one worker per
// dependency (max 3). Each worker calls an mcp server from INSIDE ITS OWN context
// window, so the bulky external payloads never pollute the main window; then it
// distils its record down to a short verdict and merges just that back. The
// learner steps from the plan, through the spawn, the isolated worker windows,
// one worker's gated call out to the server, the payload landing in the worker's
// own window, the parallel finish, the merge, and lands on the main agent's
// summary with control back to the user. The readout is the growing orchestration
// log. Teaches isolation and external reach together.

import type { ScenarioLesson } from "../model";

export const fleetMcp: ScenarioLesson = {
  id: "fleetmcp",
  mode: "scenario",
  difficulty: "deep",
  readoutKind: "log",
  model: "qwen3.5",
  title: { en: "a fleet that reaches out", de: "eine flotte, die nach außen greift" },
  blurb: {
    en: "orchestration plus external tools: the main agent fans out to isolated workers, each one calls an mcp server from inside its own window, so the big external payloads never touch the main window. only the verdicts merge back.",
    de: "orchestrierung plus externe werkzeuge: der haupt-agent fächert zu isolierten workern auf, jeder ruft einen mcp-server aus seinem eigenen fenster, sodass die großen externen nutzlasten das hauptfenster nie berühren. nur die urteile fließen zurück.",
  },
  readout: { en: "orchestration log", de: "orchestrierungs-log" },
  dsl: {
    id: "fleetmcp",
    name: { en: "a fleet that reaches out", de: "eine flotte, die nach außen greift" },
    prompt: {
      en: "We ship tonight. Check our three critical dependencies (axios, jsonwebtoken, left-pad) against the live advisory database and tell me if any are unsafe to ship.",
      de: "Wir liefern heute Nacht aus. Prüfe unsere drei kritischen Abhängigkeiten (axios, jsonwebtoken, left-pad) gegen die Live-Advisory-Datenbank und sag mir, ob eine nicht auslieferbar ist.",
    },
    provider: "ollama",
    system: {
      en: "You are a release orchestrator. Fan external lookups out to isolated workers, then merge only their verdicts.",
      de: "Du bist ein Release-Orchestrator. Fächere externe Abfragen auf isolierte Worker auf und führe dann nur ihre Urteile zusammen.",
    },
    steps: [
      {
        think: {
          en: "The three advisory lookups are independent and each returns a large record. I fan out one worker per dependency so those external payloads stay out of my window.",
          de: "Die drei Advisory-Abfragen sind unabhängig und jede liefert einen großen Datensatz. Ich fächere einen Worker je Abhängigkeit auf, damit diese externen Nutzlasten aus meinem Fenster bleiben.",
        },
      },
      {
        fanout: {
          label: "advisory-check",
          tool: "advisory-check",
          agents: [
            {
              id: "axios",
              task: { en: "Check axios against the advisory database", de: "Prüfe axios gegen die Advisory-Datenbank" },
              steps: [
                { think: { en: "I query the advisory server for axios and read what comes back.", de: "Ich frage den Advisory-Server zu axios ab und lese, was zurückkommt." } },
                {
                  mcp: "advisorydb__lookup",
                  input: { package: "axios" },
                  gate: "allow",
                  result: {
                    en: "axios@1.6.2: 3 past advisories, all patched. no known unpatched advisory affects this version. 240 lines of advisory history omitted.",
                    de: "axios@1.6.2: 3 frühere Advisories, alle gepatcht. keine bekannte ungepatchte Advisory betrifft diese Version. 240 Zeilen Advisory-Historie ausgelassen.",
                  },
                },
                { say: { en: "## axios\n- clean: no unpatched advisory for 1.6.2.", de: "## axios\n- sauber: keine ungepatchte Advisory für 1.6.2." } },
              ],
            },
            {
              id: "jwt",
              task: { en: "Check jsonwebtoken against the advisory database", de: "Prüfe jsonwebtoken gegen die Advisory-Datenbank" },
              steps: [
                { think: { en: "I look up jsonwebtoken and check the version we pin.", de: "Ich schlage jsonwebtoken nach und prüfe die Version, die wir pinnen." } },
                {
                  mcp: "advisorydb__lookup",
                  input: { package: "jsonwebtoken" },
                  gate: "allow",
                  result: {
                    en: "jsonwebtoken@8.5.1: CVE-2022-23529, insecure default in verify(), fixed in 9.0.0. severity high. 180 lines of advisory detail omitted.",
                    de: "jsonwebtoken@8.5.1: CVE-2022-23529, unsicherer Default in verify(), behoben in 9.0.0. Schweregrad hoch. 180 Zeilen Advisory-Details ausgelassen.",
                  },
                },
                { say: { en: "## jsonwebtoken\n- CVE-2022-23529 (high), upgrade to >=9.0.0.", de: "## jsonwebtoken\n- CVE-2022-23529 (hoch), upgrade auf >=9.0.0." } },
              ],
            },
            {
              id: "leftpad",
              task: { en: "Check left-pad against the advisory database", de: "Prüfe left-pad gegen die Advisory-Datenbank" },
              steps: [
                { think: { en: "I query left-pad, then note its maintenance state too.", de: "Ich frage left-pad ab und notiere auch seinen Wartungsstand." } },
                {
                  mcp: "advisorydb__lookup",
                  input: { package: "left-pad" },
                  gate: "allow",
                  result: {
                    en: "left-pad@1.3.0: 0 advisories. package unmaintained since 2018. 60 lines of registry metadata omitted.",
                    de: "left-pad@1.3.0: 0 Advisories. Paket seit 2018 nicht gewartet. 60 Zeilen Registry-Metadaten ausgelassen.",
                  },
                },
                { say: { en: "## left-pad\n- clean: no advisories (note: unmaintained).", de: "## left-pad\n- sauber: keine Advisories (Hinweis: nicht gewartet)." } },
              ],
            },
          ],
        },
      },
      {
        say: {
          en: "Release check: jsonwebtoken@8.5.1 is unsafe to ship (CVE-2022-23529, high), upgrade to >=9.0.0 first. axios and left-pad are clean. Block the release until the jwt bump lands.",
          de: "Release-Check: jsonwebtoken@8.5.1 ist nicht auslieferbar (CVE-2022-23529, hoch), zuerst auf >=9.0.0 upgraden. axios und left-pad sind sauber. Release blockieren, bis der jwt-Bump drin ist.",
        },
      },
    ],
  },
  steps: [
    {
      advance: { until: "thinking_delta" },
      cap: {
        en: "the main agent has one job before it fans out: it needs three <span class='k'>external lookups</span>, one per dependency, and each advisory record is large. run them in one window and the raw payloads would <span class='k'>crowd out</span> everything else. so it plans to isolate them.",
        de: "der haupt-agent hat vor dem auffächern eine aufgabe: er braucht drei <span class='k'>externe abfragen</span>, eine je abhängigkeit, und jeder advisory-datensatz ist groß. liefe das in einem fenster, würden die rohdaten alles andere <span class='k'>verdrängen</span>. also plant er, sie zu isolieren.",
      },
      log: { en: "main agent · <b>3 external lookups</b> planned", de: "haupt-agent · <b>3 externe abfragen</b> geplant" },
    },
    {
      advance: { until: "agent_spawn", nth: 3 },
      cap: {
        en: "the lookups are <span class='k'>independent</span>, so the harness fans out. the main agent <span class='k'>spawns one worker per dependency</span>, axios, jsonwebtoken, left-pad, up to three side by side. each is a full agent with its own empty window.",
        de: "die abfragen sind <span class='k'>unabhängig</span>, also fächert der harness auf. der haupt-agent <span class='k'>startet einen worker je abhängigkeit</span>, axios, jsonwebtoken, left-pad, bis zu drei nebeneinander. jeder ist ein voller agent mit eigenem, leerem fenster.",
      },
      log: { en: "spawn · <b>axios · jsonwebtoken · left-pad</b>", de: "spawn · <b>axios · jsonwebtoken · left-pad</b>" },
    },
    {
      advance: { until: "thinking_delta", nth: 3 },
      cap: {
        en: "each worker plans <span class='k'>inside its own context window</span>, and the windows are sealed off from each other. one worker's scratch work is invisible to the next, and none of it touches the main window. that isolation is the whole point of the fan-out.",
        de: "jeder worker plant <span class='k'>in seinem eigenen kontextfenster</span>, und die fenster sind voneinander abgeschottet. die kladde eines workers ist für den nächsten unsichtbar, und nichts davon berührt das hauptfenster. diese isolation ist der ganze sinn des auffächerns.",
      },
      log: { en: "3 windows · <b>isolated</b> · thinking", de: "3 fenster · <b>isoliert</b> · denken" },
    },
    {
      advance: { until: "tool_call" },
      cap: {
        en: "now a worker <span class='k'>reaches outside the machine</span>. it calls an <span class='k'>mcp server</span>, the advisory database, through the mcp client and the network stack. the call leaves the local box: this is the external tool the worker cannot answer from memory.",
        de: "jetzt <span class='k'>greift ein worker über die maschine hinaus</span>. er ruft einen <span class='k'>mcp-server</span> auf, die advisory-datenbank, über den mcp-client und den netz-stack. der aufruf verlässt die lokale kiste: das ist das externe werkzeug, das der worker nicht aus dem gedächtnis beantworten kann.",
      },
      log: { en: "worker <b>axios</b> → mcp__advisorydb__lookup", de: "worker <b>axios</b> → mcp__advisorydb__lookup" },
    },
    {
      advance: { until: "permission_decision" },
      cap: {
        en: "an external call still passes the <span class='k'>gate</span>, even from inside a worker. reaching a server off the machine is exactly the kind of side effect the gate exists to check. it <span class='a'>allows</span> the lookup, and the decision is logged.",
        de: "ein externer aufruf passiert trotzdem das <span class='k'>gate</span>, auch aus einem worker heraus. einen server außerhalb der maschine zu erreichen ist genau die art nebenwirkung, für die das gate da ist. es <span class='a'>erlaubt</span> die abfrage, und die entscheidung wird geloggt.",
      },
      log: { en: "gate → <span class='a'>allow</span> · external lookup", de: "gate → <span class='a'>erlaubt</span> · externe abfrage" },
    },
    {
      advance: { until: "tool_result" },
      cap: {
        en: "the server answers, and the <span class='k'>large advisory record lands in the worker's own window</span>, not the main one. all that raw external data sits where it was fetched. the main agent never has to carry it.",
        de: "der server antwortet, und der <span class='k'>große advisory-datensatz landet im eigenen fenster des workers</span>, nicht im hauptfenster. all diese externen rohdaten liegen dort, wo sie geholt wurden. der haupt-agent muss sie nie tragen.",
      },
      log: { en: "worker <b>axios</b> · payload in its own window", de: "worker <b>axios</b> · nutzlast im eigenen fenster" },
    },
    {
      advance: { until: "text_delta", nth: 3 },
      cap: {
        en: "the other two workers run the same pattern <span class='k'>in parallel</span>, each hitting the server from its own sealed window. they finish, and each <span class='k'>distils its record down to a short verdict</span>: axios clean, jsonwebtoken flags a CVE, left-pad clean.",
        de: "die anderen zwei worker fahren dasselbe muster <span class='k'>parallel</span>, jeder trifft den server aus seinem eigenen abgeschotteten fenster. sie werden fertig, und jeder <span class='k'>destilliert seinen datensatz auf ein kurzes urteil</span>: axios sauber, jsonwebtoken meldet ein CVE, left-pad sauber.",
      },
      log: { en: "3 verdicts · <b>1 CVE found</b>", de: "3 urteile · <b>1 CVE gefunden</b>" },
    },
    {
      advance: { until: "tool_result" },
      cap: {
        en: "the workers report back and only the <span class='k'>verdicts cross the boundary</span> into the main window. the bulky advisory records stay behind in the worker windows and are discarded with them. the main agent receives three short lines, not three raw dumps.",
        de: "die worker melden zurück, und nur die <span class='k'>urteile überqueren die grenze</span> ins hauptfenster. die sperrigen advisory-datensätze bleiben in den worker-fenstern zurück und werden mit ihnen verworfen. der haupt-agent bekommt drei kurze zeilen, keine drei rohdaten-dumps.",
      },
      log: { en: "merge · <b>3 verdicts</b> → main window", de: "merge · <b>3 urteile</b> → hauptfenster" },
    },
    {
      advance: "rest",
      cap: {
        en: "the main agent <span class='k'>summarizes</span> the merged verdicts and hands control back to <span class='k'>you</span>: jsonwebtoken is <span class='r'>unsafe to ship</span>, upgrade it first. orchestration reached out to external tools, kept every large payload isolated, and returned only what mattered.",
        de: "der haupt-agent <span class='k'>fasst</span> die zusammengeführten urteile zusammen und gibt die kontrolle an <span class='k'>dich</span> zurück: jsonwebtoken ist <span class='r'>nicht auslieferbar</span>, zuerst upgraden. die orchestrierung griff auf externe werkzeuge zu, hielt jede große nutzlast isoliert und lieferte nur das zurück, was zählte.",
      },
      log: { en: "done · <b>ship blocked</b> · control returns to you", de: "fertig · <b>release blockiert</b> · kontrolle geht an dich zurück" },
    },
  ],
};
