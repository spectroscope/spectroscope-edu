// Lesson 7 — serial vs. orchestrated (fan-out).
//
// Scenario mode: the simulator's own fan-out, done for real. One agent could
// run the three PR checks in sequence, sharing a single window. Instead the
// orchestrator decomposes the review and spawns one worker per area (bugs,
// performance, security), each in its own isolated context. The learner steps
// from the serial baseline, watches three worker windows run in parallel, sees
// the results merge back, and lands on the fleet they can then watch live in the
// Spectrum tab. The readout is the growing orchestration log.

import type { ScenarioLesson } from "../model";

export const fleet: ScenarioLesson = {
  id: "fleet",
  mode: "scenario",
  difficulty: "deep",
  readoutKind: "log",
  model: "qwen3.5",
  title: { en: "serial vs. orchestrated", de: "seriell vs. orchestriert" },
  blurb: {
    en: "one agent runs subtasks in sequence in a single window. for independent work the harness fans out to workers, each with its own isolated context, the fleet you watch in the Spectrum tab.",
    de: "ein agent führt teilaufgaben nacheinander in einem fenster aus. für unabhängige arbeit fächert der harness zu workern auf, jeder mit eigenem, isoliertem kontext, die flotte, die du im Spectrum-tab beobachtest.",
  },
  readout: { en: "orchestration log", de: "orchestrierungs-log" },
  dsl: {
    id: "fleet",
    name: { en: "serial vs. orchestrated", de: "seriell vs. orchestriert" },
    prompt: {
      en: "Review the open PR thoroughly: bugs, performance, and security. Run the checks in parallel, then summarize by priority.",
      de: "Prüfe den offenen PR gründlich: Bugs, Performance und Sicherheit. Führe die Checks parallel aus, dann fasse nach Priorität zusammen.",
    },
    provider: "ollama",
    system: {
      en: "You are a review orchestrator. Split independent work across isolated workers, then merge.",
      de: "Du bist ein Review-Orchestrator. Verteile unabhängige Arbeit auf isolierte Worker und führe sie dann zusammen.",
    },
    steps: [
      {
        think: {
          en: "The three checks are independent, so I fan out one worker per area instead of grinding through them in one window.",
          de: "Die drei Checks sind unabhängig, also fächere ich einen Worker je Bereich auf, statt sie in einem Fenster abzuarbeiten.",
        },
      },
      {
        fanout: {
          label: "review",
          tool: "review",
          agents: [
            {
              id: "bugs",
              task: { en: "Find bugs in the diff", de: "Finde Bugs im Diff" },
              steps: [
                { think: { en: "I check the null handling and the loop bounds.", de: "Ich prüfe die Null-Behandlung und die Schleifengrenzen." } },
                { status: { en: "checking null handling", de: "prüfe Null-Behandlung" } },
                { say: { en: "## bugs\n- off-by-one in the pager.", de: "## Bugs\n- Off-by-one im Pager." } },
              ],
            },
            {
              id: "perf",
              task: { en: "Check performance", de: "Prüfe Performance" },
              steps: [
                { think: { en: "I look for N+1 queries on the hot path.", de: "Ich suche N+1-Queries auf dem heißen Pfad." } },
                { status: { en: "profiling the queries", de: "profile die Queries" } },
                { say: { en: "## performance\n- N+1 in ListRepo.findAll().", de: "## Performance\n- N+1 in ListRepo.findAll()." } },
              ],
            },
            {
              id: "security",
              task: { en: "Check security", de: "Prüfe Sicherheit" },
              steps: [
                { think: { en: "I check for injection and leaked secrets.", de: "Ich prüfe auf Injection und geleakte Secrets." } },
                { status: { en: "checking injection", de: "prüfe Injection" } },
                { say: { en: "## security\n- SQL concat, an injection hole.", de: "## Sicherheit\n- SQL-Concat, ein Injection-Loch." } },
              ],
            },
          ],
        },
      },
      {
        say: {
          en: "Summary by priority: one critical security hole (SQL injection), one bug (off-by-one), one performance issue (N+1). Fix security first.",
          de: "Zusammenfassung nach Priorität: ein kritisches Sicherheitsloch (SQL-Injection), ein Bug (Off-by-one), ein Performance-Problem (N+1). Sicherheit zuerst.",
        },
      },
    ],
  },
  steps: [
    {
      advance: { until: "thinking_delta" },
      cap: {
        en: "one agent, <span class='k'>one window</span>: it could run the checks in sequence, bugs then performance then security, all sharing the same context. simple, but the one window fills fast and each check drags the last one's clutter along.",
        de: "ein agent, <span class='k'>ein fenster</span>: es könnte die checks nacheinander laufen, bugs dann performance dann security, alle im selben kontext. einfach, aber das eine fenster füllt sich schnell und jeder check schleppt den ballast des vorigen mit.",
      },
      log: { en: "main agent · <b>serial</b> plan", de: "haupt-agent · <b>serieller</b> plan" },
    },
    {
      advance: { until: "agent_spawn", nth: 3 },
      cap: {
        en: "the checks are <span class='k'>independent</span>, so the harness fans out. the orchestrator decomposes the review and <span class='k'>spawns one worker per area</span>, bugs, performance, security, side by side.",
        de: "die checks sind <span class='k'>unabhängig</span>, also fächert der harness auf. der orchestrator zerlegt das review und <span class='k'>startet einen worker je bereich</span>, bugs, performance, security, nebeneinander.",
      },
      log: { en: "spawn · <b>bugs · perf · security</b>", de: "spawn · <b>bugs · perf · security</b>" },
    },
    {
      advance: { until: "text_delta", nth: 3 },
      cap: {
        en: "each worker runs in its <span class='k'>own context window</span>, fully isolated. they think, report status, and finish at the same time. the messy exploration never pollutes the main window, and the <span class='k'>workers never see each other</span>.",
        de: "jeder worker läuft in seinem <span class='k'>eigenen kontextfenster</span>, vollständig isoliert. sie denken, melden status und werden gleichzeitig fertig. die unruhige exploration verschmutzt nie das hauptfenster, und die <span class='k'>worker sehen sich nie gegenseitig</span>.",
      },
      log: { en: "3 windows · <b>isolated</b> · parallel", de: "3 fenster · <b>isoliert</b> · parallel" },
    },
    {
      advance: { until: "tool_result" },
      cap: {
        en: "the workers report back and the orchestrator <span class='k'>merges the results</span> into the main window. only the answers cross the boundary, not the scratch work each worker generated.",
        de: "die worker melden zurück und der orchestrator <span class='k'>führt die resultate</span> ins hauptfenster zusammen. nur die antworten überqueren die grenze, nicht die kladde, die jeder worker erzeugt hat.",
      },
      log: { en: "merge · <b>3 reviews</b> → main window", de: "merge · <b>3 reviews</b> → hauptfenster" },
    },
    {
      advance: "rest",
      cap: {
        en: "the main agent delivers the merged summary and the run closes. this is the <span class='k'>fleet</span> you watch live in the Spectrum tab: every agent a spectral line, every window its own. orchestration is just another harness function.",
        de: "der haupt-agent liefert die zusammengeführte zusammenfassung und der lauf schließt. das ist die <span class='k'>flotte</span>, die du im Spectrum-tab live beobachtest: jeder agent eine spektrallinie, jedes fenster für sich. orchestrierung ist einfach eine weitere harness-funktion.",
      },
      log: { en: "fleet · <b>4 agents</b> · watch in Spectrum", de: "flotte · <b>4 agenten</b> · im Spectrum sehen" },
    },
  ],
};
