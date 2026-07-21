// Lesson: the agent draws.
//
// Scenario mode: a real single-agent turn, folded through the simulator's own
// engine, that shows a MULTIMODAL action riding the same machinery as the plain
// text tools. The agent first reaches for an ordinary tool (read_file returns
// text), then calls generate_image with a prompt: the harness runs the image
// backend, the gate stops it exactly as it would a write, and the result comes
// back not as text but as an ARTIFACT, a thumbnail the agent card draws in its
// generate_image panel. The learner watches the contrast (text result vs. image
// artifact) and sees that read/write/run and generate_image share one loop, one
// gate, one log, before control returns to the user. The readout is the growing
// session.jsonl.
//
// Rendering note: the generate_image panel + thumbnail render while the call is
// in flight, i.e. from the tool_call up to (not including) the tool_result, when
// detail.tool["main"] is still set, hence the KEY teaching beats land on the
// tool_call, the gate pause and the allow, all before the result is folded.

import type { ScenarioLesson } from "../model";

export const imageGen: ScenarioLesson = {
  id: "imagegen",
  mode: "scenario",
  difficulty: "core",
  readoutKind: "log",
  model: "qwen3.5",
  title: { en: "the agent draws", de: "der agent zeichnet" },
  blurb: {
    en: "read, write and run are the basics; the harness can add richer actions on the same footing. watch the model ask for an image by prompt, pass the same gate, and get back an artifact instead of text.",
    de: "lesen, schreiben und ausführen sind die basis; der harness kann reichere aktionen gleichberechtigt ergänzen. sieh zu, wie das modell per prompt ein bild anfordert, dasselbe gate passiert und statt text ein artefakt zurückbekommt.",
  },
  readout: { en: "session.jsonl", de: "session.jsonl" },
  dsl: {
    id: "imagegen",
    name: { en: "the agent draws", de: "der agent zeichnet" },
    prompt: {
      en: "Add a diagram of our auth retry flow to the docs.",
      de: "Füge ein Diagramm unseres Auth-Retry-Flows zur Doku hinzu.",
    },
    provider: "ollama",
    system: {
      en: "You are a coding agent. You can read and write files, run commands, and generate images.",
      de: "Du bist ein Coding-Agent. Du kannst Dateien lesen und schreiben, Befehle ausführen und Bilder erzeugen.",
    },
    steps: [
      {
        think: {
          en: "I'll read the retry logic first so the diagram matches the real flow.",
          de: "Ich lese zuerst die Retry-Logik, damit das Diagramm zum echten Flow passt.",
        },
      },
      {
        read: "src/retry.ts",
        result: {
          en: "async function withRetry(req){ try req; on 401 refresh token; retry once; else throw }",
          de: "async function withRetry(req){ try req; bei 401 Token erneuern; einmal wiederholen; sonst werfen }",
        },
      },
      {
        think: {
          en: "I could describe this in prose, but a diagram is clearer. I'll generate one.",
          de: "Ich könnte das in Prosa beschreiben, aber ein Diagramm ist klarer. Ich erzeuge eins.",
        },
      },
      {
        tool: "generate_image",
        input: { prompt: "a clean flowchart of the auth retry loop: request, 401, refresh token, retry once, then success or throw" },
        gate: "allow",
        result: {
          en: "image generated: retry-flow.png (1024x768)",
          de: "Bild erzeugt: retry-flow.png (1024x768)",
        },
      },
      {
        say: {
          en: "Done. I read the retry logic and generated a flowchart of it: request, then on a 401 refresh the token and retry once, else throw. The image is retry-flow.png, ready to drop into the docs.",
          de: "Fertig. Ich habe die Retry-Logik gelesen und ein Flussdiagramm davon erzeugt: Request, bei 401 Token erneuern und einmal wiederholen, sonst werfen. Das Bild ist retry-flow.png, bereit für die Doku.",
        },
      },
    ],
  },
  steps: [
    {
      advance: { until: "context_info" },
      cap: {
        en: "every turn the harness <span class='k'>assembles the window</span> and hands it to the model, together with the toolbox. read, write and run are the basics, but the harness can add <span class='k'>richer actions</span> on the same footing.",
        de: "jede runde <span class='k'>baut der harness das fenster zusammen</span> und reicht es dem modell, samt werkzeugkasten. lesen, schreiben und ausführen sind die basis, aber der harness kann <span class='k'>reichere aktionen</span> gleichberechtigt ergänzen.",
      },
      log: {
        en: "<b>assemble</b> · window + toolbox handed to the model",
        de: "<b>assemble</b> · fenster + werkzeugkasten ans modell",
      },
    },
    {
      advance: { until: "tool_call" },
      cap: {
        en: "first the model reaches for an <span class='k'>ordinary tool</span>: read_file. it names the tool, the harness runs it. tools like this take text in and give <span class='k'>text</span> back.",
        de: "zuerst greift das modell zu einem <span class='k'>gewöhnlichen tool</span>: read_file. es nennt das tool, der harness führt es aus. solche tools nehmen text und geben <span class='k'>text</span> zurück.",
      },
      log: {
        en: "model → <b>tool_use</b> · read_file <b>src/retry.ts</b>",
        de: "modell → <b>tool_use</b> · read_file <b>src/retry.ts</b>",
      },
    },
    {
      advance: { until: "tool_result" },
      cap: {
        en: "the harness runs it and reality comes back as <span class='k'>text</span>: the file contents land in the window. this is the shape of every read, write and run result, plain characters.",
        de: "der harness führt es aus und die realität kommt als <span class='k'>text</span> zurück: der dateiinhalt landet im fenster. so sieht jedes ergebnis von lesen, schreiben, ausführen aus, reine zeichen.",
      },
      log: {
        en: "exec → read_file returns <b>text</b> · into the window",
        de: "exec → read_file gibt <b>text</b> zurück · ins fenster",
      },
    },
    {
      advance: { until: "tool_call" },
      cap: {
        en: "now the model wants a picture, not prose. it calls <span class='k'>generate_image</span> and passes a <span class='k'>prompt</span> that describes what to draw. this is a richer action the harness adds beyond read, write and run, and it plugs into the exact same loop. the panel draws the thumbnail it is asking for.",
        de: "jetzt will das modell ein bild, keine prosa. es ruft <span class='k'>generate_image</span> auf und übergibt einen <span class='k'>prompt</span>, der beschreibt, was zu zeichnen ist. das ist eine reichere aktion, die der harness über lesen, schreiben, ausführen hinaus ergänzt, und sie klinkt sich in genau dieselbe loop ein. das panel zeichnet die vorschau, die es anfordert.",
      },
      log: {
        en: "model → <b>tool_use</b> · generate_image(prompt)",
        de: "modell → <b>tool_use</b> · generate_image(prompt)",
      },
    },
    {
      advance: { until: "permission_request" },
      cap: {
        en: "before anything runs, the <span class='k'>gate</span> stops it, exactly as it would for a write or a shell command. a multimodal action is not special: it passes the <span class='k'>same gate</span> as every other tool.",
        de: "bevor irgendetwas läuft, hält das <span class='k'>gate</span> es an, genau wie bei einem write oder shell-befehl. eine multimodale aktion ist nichts besonderes: sie passiert das <span class='k'>gleiche gate</span> wie jedes andere tool.",
      },
      log: {
        en: "gate → <b>pending</b> · generate_image",
        de: "gate → <b>pending</b> · generate_image",
      },
    },
    {
      advance: { until: "permission_decision" },
      cap: {
        en: "generating an image is safe, so the gate <span class='a'>allows</span> it. the request leaves your mac over http to the image backend, and the verdict is logged like any other decision.",
        de: "ein bild zu erzeugen ist harmlos, also <span class='a'>erlaubt</span> es das gate. der request verlässt deinen mac per http zum bild-backend, und das urteil wird geloggt wie jede andere entscheidung.",
      },
      log: {
        en: "gate → <span class='a'>allow</span> · logged",
        de: "gate → <span class='a'>erlaubt</span> · geloggt",
      },
    },
    {
      advance: { until: "tool_result" },
      cap: {
        en: "the result is not text this time: it is an <span class='k'>artifact</span>, a thumbnail image. the harness captures it and it <span class='k'>becomes part of the turn</span>, an observation the model can now refer to.",
        de: "das ergebnis ist diesmal kein text: es ist ein <span class='k'>artefakt</span>, ein vorschaubild. der harness fängt es ein und es <span class='k'>wird teil der runde</span>, eine beobachtung, auf die sich das modell jetzt beziehen kann.",
      },
      log: {
        en: "exec → <b>image artifact</b> returned · part of the turn",
        de: "exec → <b>bild-artefakt</b> zurück · teil der runde",
      },
    },
    {
      advance: { until: "text_delta" },
      cap: {
        en: "compare the two outputs of this turn: a plain answer is just <span class='k'>text</span>, while this turn also produced an <span class='k'>image artifact</span>. the model now writes its closing words and points at the picture it made.",
        de: "vergleich die zwei ausgaben dieser runde: eine schlichte antwort ist nur <span class='k'>text</span>, während diese runde zusätzlich ein <span class='k'>bild-artefakt</span> erzeugt hat. das modell schreibt jetzt seine schlussworte und verweist auf das bild, das es gemacht hat.",
      },
      log: {
        en: "model → <b>text</b> · answer references the image",
        de: "modell → <b>text</b> · antwort verweist auf das bild",
      },
    },
    {
      advance: "rest",
      cap: {
        en: "the model emits <span class='k'>end_turn</span> and control returns to <span class='k'>you</span>. text tools and multimodal actions share one loop, one gate, one log: the whole turn, image call and artifact included, sits in session.jsonl, replayable line by line.",
        de: "das modell gibt <span class='k'>end_turn</span> aus und die kontrolle geht an <span class='k'>dich</span> zurück. text-tools und multimodale aktionen teilen eine loop, ein gate, ein log: die ganze runde, mitsamt bild-call und artefakt, liegt in session.jsonl, zeile für zeile abspielbar.",
      },
      log: {
        en: "<b>end_turn</b> · control returns to you",
        de: "<b>end_turn</b> · kontrolle geht an dich zurück",
      },
    },
  ],
};
