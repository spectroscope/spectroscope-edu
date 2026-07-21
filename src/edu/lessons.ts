// The edu lesson catalog — a near-verbatim port of the verified vanilla
// prototype (konzept/edu-prototype/index.html), the diff oracle. Each lesson is
// a set of absolutely-positioned nodes + edges + a sequence of steps that drive
// visibility, highlight, data patches and a readout. Captions/logs carry inline
// HTML spans (.k = accent term, .a/.g/.r = allow/pass/deny) rendered as-is.

export type Loc = string | { en: string; de?: string };
export type NodeKind =
  | "human" | "model" | "harness" | "gate" | "log" | "token" | "sub" | "skill" | "stack";
export type EvKind = "token" | "tool" | "gate" | "subagent" | "lifecycle" | "reasoning";

export interface EduNode {
  x: number; y: number; w: number; h: number;
  kind: NodeKind;
  eyebrow?: string;
  title: Loc;
  sub?: Loc;
  detail?: Loc[]; // click-to-inspect rows
  body?: { n: string; t: Loc }[]; // skill body (progressive disclosure)
  stack?: boolean; // the context-window gauge
  budget?: boolean; // the 32-cell token budget grid
}
export interface EduEdge { id: string; from: string; to: string; label?: string; dashed?: boolean }
export interface EduSeg { id: string; label: Loc; ev: EvKind; base?: boolean }
export interface EduOption { l: Loc; verdict: string }
export interface EduPredict { q: Loc; correct: string; options: EduOption[]; reveal: Loc }
export interface EduStep {
  show: string[];
  edges: string[];
  active?: { nodes?: string[]; edges?: string[] };
  applied?: string[];
  data?: Record<string, { filled?: number; expanded?: boolean; call?: string }>;
  win?: { tok: Record<string, number>; state?: "ok" | "warn" | "error" };
  cap: Loc;
  log?: Loc;
  reveal?: { l: Loc; s: Loc }[];
  stat?: { label: Loc; val: string };
  cost?: { n: number; note: Loc };
  predict?: EduPredict;
  max?: string;
}
export interface EduLesson {
  id: string;
  difficulty: "intro" | "core" | "deep";
  readoutKind: "log" | "budget" | "cost" | "gives" | "gauge";
  title: Loc;
  blurb: Loc;
  readout: Loc;
  cap?: number;
  segs?: EduSeg[];
  nodes: Record<string, EduNode>;
  edges: EduEdge[];
  steps: EduStep[];
}
export interface Planned { title: Loc; chip: Loc }

export const LESSONS: EduLesson[] = [

  /* ============ 1 · anatomy of an agent (build the harness) ============ */
  {
    id:"anatomy", difficulty:"deep", readoutKind:"gives",
    title:{en:"anatomy of an agent",de:"anatomie eines agenten"},
    blurb:{en:"a raw model only reads and writes text. watch it become a working agent one harness layer at a time — then click any part to inspect it.",
           de:"ein rohes modell liest und schreibt nur text. sieh zu, wie es schicht für schicht zum arbeitenden agenten wird — dann klick jede komponente an."},
    readout:{en:"what the harness gives you",de:"was der harness dir gibt"},
    nodes:{
      human:{x:392,y:16,w:196,h:40,kind:"human",eyebrow:"you",title:{en:"the operator",de:"die operator:in"},sub:{en:"sets the goal, holds control",de:"setzt das ziel, hält kontrolle"}},
      model:{x:392,y:138,w:196,h:78,kind:"model",eyebrow:"the model",title:{en:"reads text · writes text",de:"liest text · schreibt text"},
             detail:["stateless — remembers nothing between calls","cannot run anything — only emits text","the raw thinking. everything else is the harness"]},
      ctx:{x:70,y:132,w:196,h:64,kind:"harness",eyebrow:"harness",title:{en:"context assembly",de:"kontext-zusammenbau"},
           detail:["gathers what the model sees each turn","system prompt · CLAUDE.md · skills index","tool defs · history · last tool results"]},
      tools:{x:714,y:132,w:196,h:64,kind:"harness",eyebrow:"harness",title:{en:"tool registry",de:"tool-registry"},
             detail:["read_file · write_file · list_dir · run_command","validate → execute → feed the result back","the model names a tool; the harness runs it"]},
      gate:{x:714,y:262,w:196,h:60,kind:"gate",eyebrow:"harness · security",title:{en:"permission gate",de:"permission-gate"},
            detail:["allow · ask · deny — the one write path","a denial is an observation too","the blast radius the model can touch"]},
      loop:{x:420,y:262,w:150,h:50,kind:"harness",eyebrow:"the engine",title:{en:"the loop · ~12 lines",de:"die loop · ~12 zeilen"},
            detail:["assemble → decide → gate → execute → observe","repeats until the model emits end_turn","MAX_TURNS is the hard brake"]},
      log:{x:70,y:280,w:196,h:58,kind:"log",eyebrow:"harness",title:{en:"session.jsonl",de:"session.jsonl"},
           detail:["append-only flight recorder","every station writes a line","replayable · auditable · the whole run on disk"]},
      skills:{x:150,y:452,w:158,h:56,kind:"skill",eyebrow:"extension",title:{en:"skills",de:"skills"},
              detail:["saved instructions, loaded on match","name+description always on (~100 tok)","full body loads only when it matches"]},
      hooks:{x:326,y:452,w:150,h:56,kind:"harness",eyebrow:"extension",title:{en:"hooks",de:"hooks"},
             detail:["deterministic checkpoints in the loop","run at fixed points, every time","a prompt requests; a hook guarantees"]},
      mcp:{x:496,y:452,w:150,h:56,kind:"sub",eyebrow:"extension",title:{en:"MCP",de:"MCP"},
           detail:["connected systems behind a protocol","tickets · databases · browsers","external tools, used as if local"]},
      subs:{x:668,y:452,w:182,h:56,kind:"sub",eyebrow:"extension",title:{en:"subagents",de:"subagenten"},
            detail:["isolated helper agents","their own context window","delegate a messy sub-task, merge the result"]}
    },
    edges:[
      {id:"assemble",from:"ctx",to:"model",label:"assemble"},
      {id:"call",from:"model",to:"gate",label:"tool call"},
      {id:"exec",from:"gate",to:"tools",label:"allow"},
      {id:"return",from:"tools",to:"ctx",label:"result → next input"},
      {id:"end",from:"model",to:"human",label:"end_turn"},
      {id:"sp1",from:"ctx",to:"log",dashed:true},
      {id:"sp2",from:"gate",to:"log",dashed:true},
      {id:"pg_sk",from:"skills",to:"ctx",dashed:true},
      {id:"pg_hk",from:"hooks",to:"loop",dashed:true},
      {id:"pg_mc",from:"mcp",to:"tools",dashed:true},
      {id:"pg_su",from:"subs",to:"model",dashed:true}
    ],
    steps:[
      {show:["human","model"],edges:[],active:{nodes:["model"]},
       cap:{en:"at the core: <span class='k'>the model</span>. it reads text and writes text — that is all. it is stateless, and on its own it cannot run a single thing.",
            de:"im kern: <span class='k'>das modell</span>. es liest text und schreibt text — mehr nicht. es ist zustandslos und kann allein nichts ausführen."},
       reveal:[]},
      {show:["human","model","ctx"],edges:["assemble"],active:{nodes:["ctx"],edges:["assemble"]},
       cap:{en:"the harness <span class='k'>assembles what the model sees</span> each turn: system prompt, your files, the skills index, history, the last results. that bundle is the context window.",
            de:"der harness <span class='k'>baut zusammen, was das modell sieht</span> — jede runde: system-prompt, deine dateien, skills-index, verlauf, letzte resultate. dieses bündel ist das kontextfenster."},
       reveal:[{l:{en:"context discipline",de:"kontext-disziplin"},s:{en:"assembly · just-in-time loading · compaction",de:"zusammenbau · bedarfsladen · compaction"}}]},
      {show:["human","model","ctx","gate","tools"],edges:["assemble","call","exec"],active:{nodes:["tools"],edges:["call","exec"]},applied:["assemble"],
       cap:{en:"it hands the model <span class='k'>tools it can actually call</span> — and routes every call through a <span class='k'>permission gate</span>: allow, ask, deny. nothing writes without a decision.",
            de:"es gibt dem modell <span class='k'>tools, die es wirklich aufrufen kann</span> — und lenkt jeden call durch ein <span class='k'>permission-gate</span>: erlauben, fragen, ablehnen. nichts schreibt ohne entscheidung."},
       reveal:[{l:{en:"tool access",de:"tool-zugriff"},s:{en:"a registry: validate, execute, feed back",de:"eine registry: prüfen, ausführen, zurückspeisen"}},{l:{en:"guardrails",de:"leitplanken"},s:{en:"permissions · sandboxing · deny rules",de:"permissions · sandboxing · deny-regeln"}}]},
      {show:["human","model","ctx","gate","tools","loop"],edges:["assemble","call","exec","return"],active:{nodes:["loop"],edges:["return"]},applied:["assemble","call","exec"],
       cap:{en:"it runs this in <span class='k'>a loop</span>: assemble → decide → gate → execute → feed the result back. about twelve lines of code, repeated until the model says it is done.",
            de:"es führt das in <span class='k'>einer loop</span> aus: zusammenbauen → entscheiden → gate → ausführen → resultat zurück. etwa zwölf zeilen code, wiederholt bis das modell fertig meldet."},
       reveal:[{l:{en:"persistence",de:"persistenz"},s:{en:"state survives turns, sessions, restarts",de:"zustand überlebt runden, sessions, neustarts"}}]},
      {show:["human","model","ctx","gate","tools","loop","log"],edges:["assemble","call","exec","return","sp1","sp2"],active:{nodes:["log"],edges:["sp1","sp2"]},applied:["assemble","call","exec","return"],
       cap:{en:"every step is appended to <span class='k'>session.jsonl</span> — the flight recorder. append-only, replayable, auditable. the whole run lives on disk, not in the chat.",
            de:"jeder schritt wird an <span class='k'>session.jsonl</span> angehängt — der flugschreiber. append-only, abspielbar, prüfbar. der ganze lauf liegt auf disk, nicht im chat."},
       reveal:[{l:{en:"audit trail",de:"audit-spur"},s:{en:"append-only JSONL, replayable history",de:"append-only JSONL, abspielbare historie"}}]},
      {show:["human","model","ctx","gate","tools","loop","log"],edges:["assemble","call","exec","return","sp1","sp2","end"],active:{nodes:["human"],edges:["end"]},applied:["assemble","call","exec","return","sp1","sp2"],
       cap:{en:"when the model emits <span class='k'>end_turn</span>, the loop closes and control returns to <span class='k'>you</span>. you set the goal; the harness carries the discipline in between.",
            de:"gibt das modell <span class='k'>end_turn</span> aus, schließt die loop und die kontrolle geht an <span class='k'>dich</span> zurück. du setzt das ziel; der harness trägt die disziplin dazwischen."},
       reveal:[{l:{en:"model routing",de:"model-routing"},s:{en:"cheap for narrow steps, strong for judgement",de:"günstig für enge schritte, stark fürs urteil"}}]},
      {show:["human","model","ctx","gate","tools","loop","log","skills","hooks","mcp","subs"],edges:["assemble","call","exec","return","sp1","sp2","end","pg_sk","pg_hk","pg_mc","pg_su"],active:{nodes:["skills","hooks","mcp","subs"],edges:["pg_sk","pg_hk","pg_mc","pg_su"]},applied:["assemble","call","exec","return","sp1","sp2","end"],
       cap:{en:"and it is <span class='k'>extensible</span>: skills (saved instructions), hooks (fixed checkpoints), MCP (connected systems), subagents (isolated helpers) — each plugs into the loop.",
            de:"und es ist <span class='k'>erweiterbar</span>: skills (gespeicherte anweisungen), hooks (feste checkpoints), MCP (angebundene systeme), subagenten (isolierte helfer) — jedes klinkt sich in die loop ein."},
       reveal:[{l:{en:"delegation",de:"delegation"},s:{en:"subagents, teams, isolated worktrees",de:"subagenten, teams, isolierte worktrees"}}]},
      {show:["human","model","ctx","gate","tools","loop","log","skills","hooks","mcp","subs"],edges:["assemble","call","exec","return","sp1","sp2","end","pg_sk","pg_hk","pg_mc","pg_su"],active:{},applied:["assemble","call","exec","return","sp1","sp2","end"],
       cap:{en:"none of this is in the model's <span class='k'>weights</span>. all of it is engineering <span class='k'>around</span> the model — and that engineering is the harness. click any part to inspect it.",
            de:"nichts davon steckt in den <span class='k'>gewichten</span> des modells. alles ist engineering <span class='k'>um</span> das modell herum — und dieses engineering ist der harness. klick jede komponente an."},
       reveal:[]}
    ]
  },

  /* ============ 2 · inside the context window (composition) ============ */
  {
    id:"context-inside", difficulty:"deep", readoutKind:"gauge",
    title:{en:"inside the context window",de:"im kontextfenster"},
    blurb:{en:"the window is not abstract — it is a concrete stack of segments, each costing tokens, rebuilt every single turn. watch it fill, rot, and get compacted.",
           de:"das fenster ist nicht abstrakt — es ist ein konkreter stapel aus segmenten, jedes kostet tokens, jede runde neu gebaut. sieh zu, wie es sich füllt, verrottet und kompaktiert wird."},
    readout:{en:"context gauge",de:"kontext-anzeige"},
    cap:32000,
    segs:[
      {id:"system",label:{en:"system prompt",de:"system-prompt"},ev:"lifecycle",base:true},
      {id:"claude",label:{en:"project instructions",de:"projekt-regeln"},ev:"lifecycle",base:true},
      {id:"tools",label:{en:"tool definitions",de:"tool-definitionen"},ev:"tool",base:true},
      {id:"skills",label:{en:"skills index",de:"skills-index"},ev:"tool",base:true},
      {id:"history",label:{en:"conversation history",de:"gesprächsverlauf"},ev:"reasoning"},
      {id:"results",label:{en:"tool results",de:"tool-resultate"},ev:"token"},
      {id:"turn",label:{en:"your current turn",de:"deine eingabe"},ev:"subagent"}
    ],
    nodes:{
      window:{x:64,y:66,w:372,h:60,kind:"stack",stack:true,title:{en:"the context window",de:"das kontextfenster"}},
      you:{x:560,y:70,w:190,h:58,kind:"human",eyebrow:"append",title:{en:"you ask a question",de:"du stellst eine frage"},sub:{en:"turn + reply → history",de:"eingabe + antwort → verlauf"}},
      file:{x:560,y:180,w:190,h:58,kind:"harness",eyebrow:"read",title:{en:"read a large file",de:"große datei lesen"},sub:{en:"bytes → tool results",de:"bytes → tool-resultate"}},
      compact:{x:560,y:298,w:190,h:60,kind:"harness",eyebrow:"the harness moves",title:{en:"compaction",de:"compaction"},sub:{en:"20 turns → 1 paragraph",de:"20 runden → 1 absatz"}}
    },
    edges:[
      {id:"e_turn",from:"you",to:"window",label:"append"},
      {id:"e_read",from:"file",to:"window",label:"dump bytes"},
      {id:"e_comp",from:"compact",to:"window",label:"compress"}
    ],
    steps:[
      {show:["window"],edges:[],active:{nodes:["window"]},
       win:{tok:{system:900,claude:700,tools:800,skills:500}},
       cap:{en:"before you type a single word, <span class='k'>this is already loaded</span> — the fixed base, read into the window every turn: system prompt, project rules, tool defs, the skills index.",
            de:"bevor du ein einziges wort tippst, ist <span class='k'>das schon geladen</span> — die feste basis, jede runde ins fenster gelesen: system-prompt, projekt-regeln, tool-defs, skills-index."}},
      {show:["window","you"],edges:["e_turn"],active:{nodes:["you"],edges:["e_turn"]},
       win:{tok:{system:900,claude:700,tools:800,skills:500,turn:300,history:1400}},
       cap:{en:"you ask something. your <span class='k'>turn</span> and the model's reply append to the <span class='k'>history</span> — and history is the part that keeps growing.",
            de:"du fragst etwas. deine <span class='k'>eingabe</span> und die antwort des modells landen im <span class='k'>verlauf</span> — und der verlauf ist der teil, der immer weiter wächst."}},
      {show:["window","you","file"],edges:["e_turn","e_read"],active:{nodes:["file"],edges:["e_read"]},applied:["e_turn"],
       win:{tok:{system:900,claude:700,tools:800,skills:500,turn:300,history:1900,results:5200}},
       cap:{en:"the model reads a file. its bytes land in <span class='k'>tool results</span> — usually the biggest single jump. one careless <span class='k'>read_file</span> can cost more than the whole base.",
            de:"das modell liest eine datei. ihre bytes landen in <span class='k'>tool-resultate</span> — meist der größte einzelsprung. ein sorgloses <span class='k'>read_file</span> kostet mehr als die ganze basis."}},
      {show:["window","you","file"],edges:["e_turn","e_read"],active:{nodes:["window"]},applied:["e_turn","e_read"],
       win:{tok:{system:900,claude:700,tools:800,skills:500,turn:300,history:11000,results:5200}},
       cap:{en:"turn after turn, <span class='k'>history grows</span>. over a long session it becomes the dominant cost — every past exchange is re-sent, every single turn.",
            de:"runde um runde <span class='k'>wächst der verlauf</span>. über eine lange session wird er zum dominanten posten — jeder frühere austausch wird neu mitgeschickt, jede runde."}},
      {show:["window","you","file"],edges:["e_turn","e_read"],active:{nodes:["window"]},applied:["e_turn","e_read"],
       win:{tok:{system:900,claude:700,tools:800,skills:500,turn:300,history:22000,results:5200},state:"error"},
       cap:{en:"as the window fills toward the cap, quality quietly degrades — <span class='k'>context rot</span>. the model starts to miss things at the far end of a bloated window.",
            de:"füllt sich das fenster zur kappe, sinkt die qualität leise — <span class='k'>context rot</span>. das modell übersieht dinge am fernen ende eines überladenen fensters."}},
      {show:["window","you","file","compact"],edges:["e_turn","e_read","e_comp"],active:{nodes:["compact"],edges:["e_comp"]},applied:["e_turn","e_read"],
       win:{tok:{system:900,claude:700,tools:800,skills:500,turn:300,history:2100,results:1200}},
       cap:{en:"the harness <span class='k'>compacts</span>: twenty turns of history collapse to one paragraph, stale results drop. the gist is kept, the tokens are freed, the window breathes again.",
            de:"der harness <span class='k'>kompaktiert</span>: zwanzig runden verlauf schrumpfen auf einen absatz, alte resultate fallen weg. der kern bleibt, die tokens werden frei, das fenster atmet wieder."}},
      {show:["window","you","file","compact"],edges:["e_turn","e_read","e_comp"],active:{},applied:["e_turn","e_read","e_comp"],
       win:{tok:{system:900,claude:700,tools:800,skills:500,turn:300,history:2100,results:1200}},
       cap:{en:"the <span class='k'>fixed base never leaves</span>; only the growing parts are managed. that is the whole job — and the four moves (write, select, compress, isolate) are how you do it.",
            de:"die <span class='k'>feste basis bleibt immer</span>; nur die wachsenden teile werden gemanagt. das ist die ganze aufgabe — und die vier operationen (write, select, compress, isolate) sind das werkzeug dafür."}}
    ]
  },

  /* ============ 3 · the harness loop ============ */
  {
    id:"loop", difficulty:"core", readoutKind:"log",
    title:{en:"one turn through the machine",de:"eine runde durch die maschine"},
    blurb:{en:"the model emits one thing; the harness runs every step and feeds reality back. six stations, one turn.",
           de:"das modell gibt genau eine sache aus; der harness führt jeden schritt aus und speist die realität zurück. sechs stationen, eine runde."},
    readout:{en:"session.jsonl",de:"session.jsonl"},
    nodes:{
      ctx:{x:70,y:70,w:196,h:60,kind:"harness",eyebrow:"harness",title:{en:"context assembly",de:"kontext zusammenbauen"},sub:{en:"system · history · results",de:"system · verlauf · resultate"}},
      model:{x:392,y:44,w:196,h:60,kind:"model",eyebrow:"the model",title:{en:"model · decides",de:"modell · entscheidet"},sub:{en:"emits text or a tool call",de:"gibt text oder tool-call aus"}},
      sw:{x:714,y:70,w:196,h:60,kind:"harness",eyebrow:"harness",title:{en:"stop_reason switch",de:"stop_reason-weiche"},sub:{en:"routes the decision",de:"lenkt die entscheidung"}},
      gate:{x:714,y:334,w:196,h:60,kind:"gate",eyebrow:"harness · security",title:{en:"permission gate",de:"permission-gate"},sub:{en:"allow · ask · deny",de:"erlauben · fragen · ablehnen"}},
      tools:{x:392,y:400,w:196,h:60,kind:"harness",eyebrow:"harness",title:{en:"tool registry · execute",de:"tool-registry · ausführen"},sub:{en:"runs it for real",de:"führt es echt aus"}},
      obs:{x:70,y:334,w:196,h:60,kind:"harness",eyebrow:"harness",title:{en:"observation appended",de:"beobachtung angehängt"},sub:{en:"result → next input",de:"resultat → nächster input"}},
      human:{x:726,y:200,w:170,h:44,kind:"human",eyebrow:"you",title:{en:"human",de:"mensch"},sub:{en:"regains control on end_turn",de:"übernimmt bei end_turn"}},
      max:{x:74,y:206,w:180,h:40,kind:"harness",eyebrow:"hard brake",title:{en:"MAX_TURNS",de:"MAX_TURNS"},sub:{en:"3 / 50",de:"3 / 50"}}
    },
    edges:[
      {id:"e1",from:"ctx",to:"model"},{id:"e2",from:"model",to:"sw"},
      {id:"e3",from:"sw",to:"gate",label:"tool_use"},{id:"e4",from:"gate",to:"tools"},
      {id:"e5",from:"tools",to:"obs"},{id:"e6",from:"obs",to:"ctx",label:"loop closes"},
      {id:"e7",from:"sw",to:"human",label:"end_turn"}
    ],
    steps:[
      {show:["ctx","max"],edges:[],active:{nodes:["ctx"]},
       cap:{en:"the harness <span class='k'>assembles the window</span>: system prompt, history, the last tool result. the model has not run yet.",de:"der harness <span class='k'>baut das fenster zusammen</span>: system-prompt, verlauf, letztes tool-resultat. das modell lief noch nicht."},
       log:{en:"<b>assemble</b> · system + history + results",de:"<b>assemble</b> · system + verlauf + resultate"}},
      {show:["ctx","model","max"],edges:["e1"],active:{nodes:["model"],edges:["e1"]},
       cap:{en:"the model reads it and <span class='k'>emits one thing</span> — here a tool call: <span class='k'>run the tests</span>.",de:"das modell liest es und <span class='k'>gibt genau eine sache aus</span> — hier ein tool-call: <span class='k'>tests laufen lassen</span>."},
       log:{en:"model → tool_use · <b>npm test -- auth</b>",de:"modell → tool_use · <b>npm test -- auth</b>"}},
      {show:["ctx","model","sw","human","max"],edges:["e1","e2"],active:{nodes:["sw"],edges:["e2"]},applied:["e1"],
       cap:{en:"the switch reads <span class='k'>stop_reason</span>: <span class='k'>tool_use</span> routes back into the harness — <span class='k'>end_turn</span> would hand control to you.",de:"die weiche liest <span class='k'>stop_reason</span>: <span class='k'>tool_use</span> geht zurück in den harness — <span class='k'>end_turn</span> gäbe dir die kontrolle."},
       log:{en:"stop_reason = <b>tool_use</b>",de:"stop_reason = <b>tool_use</b>"}},
      {show:["ctx","model","sw","gate","human","max"],edges:["e1","e2","e3"],active:{nodes:["gate"],edges:["e3"]},applied:["e1","e2"],
       cap:{en:"the <span class='k'>gate</span> checks the call: allow, ask, or deny. a denial is an observation too — nothing crosses without a decision.",de:"das <span class='k'>gate</span> prüft den call: erlauben, fragen, ablehnen. auch ein nein ist eine beobachtung — nichts passiert ohne entscheidung."},
       log:{en:"gate → <span class='a'>allow</span> (read-only)",de:"gate → <span class='a'>erlaubt</span> (nur lesen)"}},
      {show:["ctx","model","sw","gate","tools","human","max"],edges:["e1","e2","e3","e4"],active:{nodes:["tools"],edges:["e4"]},applied:["e1","e2","e3"],
       cap:{en:"the harness <span class='k'>runs the tool for real</span> and captures reality: <span class='k'>FAIL — expected 200, got 401</span>.",de:"der harness <span class='k'>führt das tool echt aus</span> und fängt die realität ein: <span class='k'>FAIL — erwartet 200, bekam 401</span>."},
       log:{en:"exec → <span class='r'>FAIL</span> expected 200, got 401",de:"exec → <span class='r'>FAIL</span> erwartet 200, bekam 401"}},
      {show:["ctx","model","sw","gate","tools","obs","human","max"],edges:["e1","e2","e3","e4","e5","e6"],active:{nodes:["obs"],edges:["e5","e6"]},applied:["e1","e2","e3","e4"],max:"4 / 50",
       cap:{en:"the result <span class='k'>becomes the next input</span>; MAX_TURNS ticks; the loop closes and runs again — now the model can correct.",de:"das resultat <span class='k'>wird zum nächsten input</span>; MAX_TURNS zählt hoch; die runde schließt und läuft erneut — jetzt kann das modell korrigieren."},
       log:{en:"observation appended · <b>turn 4</b>",de:"beobachtung angehängt · <b>runde 4</b>"}},
      {show:["ctx","model","sw","gate","tools","obs","human","max"],edges:["e1","e2","e3","e4","e5","e6","e7"],active:{nodes:["human"],edges:["e7"]},applied:["e1","e2","e3","e4","e5","e6"],max:"7 / 50",
       cap:{en:"three turns later the fix lands green; the model emits <span class='k'>end_turn</span>, the loop closes, and control returns to <span class='k'>you</span>.",de:"drei runden später wird der fix grün; das modell gibt <span class='k'>end_turn</span> aus, die runde schließt, die kontrolle geht an <span class='k'>dich</span> zurück."},
       log:{en:"exec → <span class='g'>PASS 12 of 12</span> · <b>end_turn</b>",de:"exec → <span class='g'>PASS 12 von 12</span> · <b>end_turn</b>"}}
    ]
  },

  /* ============ · the gate decides (predict-then-reveal) ============ */
  {
    id:"gate", difficulty:"core", readoutKind:"log",
    title:{en:"the gate decides",de:"das gate entscheidet"},
    blurb:{en:"every tool call passes one gate — allow, ask, or deny. guess each verdict before the harness reveals it. the gate is the one write path.",
           de:"jeder tool-call passiert ein gate — erlauben, fragen oder ablehnen. rate jedes urteil, bevor der harness es zeigt. das gate ist der eine schreibpfad."},
    readout:{en:"gate log",de:"gate-log"},
    nodes:{
      model:{x:60,y:228,w:200,h:74,kind:"model",eyebrow:"the model",title:{en:"proposes a call",de:"schlägt einen call vor"},sub:{en:"—",de:"—"}},
      gate:{x:400,y:222,w:196,h:86,kind:"gate",eyebrow:"harness · security",title:{en:"permission gate",de:"permission-gate"},sub:{en:"allow · ask · deny",de:"erlauben · fragen · ablehnen"}},
      ws:{x:736,y:228,w:184,h:74,kind:"harness",eyebrow:"the blast radius",title:{en:"your files · shell",de:"deine dateien · shell"},sub:{en:"what a write can touch",de:"was ein write berührt"}}
    },
    edges:[{id:"g1",from:"model",to:"gate",label:"proposed"},{id:"g2",from:"gate",to:"ws",label:"if allowed"}],
    steps:[
      {show:["model","gate","ws"],edges:["g1","g2"],active:{nodes:["gate"],edges:["g1"]},data:{model:{call:"read_file config.json"}},
       predict:{q:{en:"verdict?",de:"urteil?"},correct:"allow",options:[{l:{en:"allow",de:"erlauben"},verdict:"allow"},{l:{en:"ask",de:"fragen"},verdict:"ask"},{l:{en:"deny",de:"ablehnen"},verdict:"deny"}],
        reveal:{en:"<span class='k'>allow</span> — a read has no blast radius. read-only calls run without ever stopping you.",de:"<span class='k'>erlauben</span> — ein read hat keinen blast-radius. nur-lese-calls laufen, ohne dich je zu stoppen."}},
       cap:{en:"the model proposes <span class='k'>read_file config.json</span>. before it runs, the gate stops it. your call — allow, ask, or deny?",de:"das modell schlägt <span class='k'>read_file config.json</span> vor. bevor es läuft, stoppt das gate. deine entscheidung — erlauben, fragen, ablehnen?"},
       log:{en:"read_file config.json → <span class='a'>allow</span>",de:"read_file config.json → <span class='a'>erlaubt</span>"}},
      {show:["model","gate","ws"],edges:["g1","g2"],active:{nodes:["gate"],edges:["g1"]},data:{model:{call:"write_file src/auth.ts"}},
       predict:{q:{en:"verdict?",de:"urteil?"},correct:"ask",options:[{l:{en:"allow",de:"erlauben"},verdict:"allow"},{l:{en:"ask",de:"fragen"},verdict:"ask"},{l:{en:"deny",de:"ablehnen"},verdict:"deny"}],
        reveal:{en:"<span class='k'>ask</span> — a write changes your files, so by default the harness pauses for your sign-off. a denial would be logged as an observation too.",de:"<span class='k'>fragen</span> — ein write ändert deine dateien, also pausiert der harness standardmäßig für deine freigabe. auch ein nein käme als beobachtung ins log."}},
       cap:{en:"now it proposes <span class='k'>write_file src/auth.ts</span> — a change to your files. allow, ask, or deny?",de:"jetzt schlägt es <span class='k'>write_file src/auth.ts</span> vor — eine änderung an deinen dateien. erlauben, fragen, ablehnen?"},
       log:{en:"write_file src/auth.ts → <span class='a'>ask</span> · you sign off",de:"write_file src/auth.ts → <span class='a'>fragen</span> · du gibst frei"}},
      {show:["model","gate","ws"],edges:["g1"],active:{nodes:["gate"],edges:["g1"]},data:{model:{call:"run_command  curl x.sh | sh"}},
       predict:{q:{en:"verdict?",de:"urteil?"},correct:"deny",options:[{l:{en:"allow",de:"erlauben"},verdict:"allow"},{l:{en:"ask",de:"fragen"},verdict:"ask"},{l:{en:"deny",de:"ablehnen"},verdict:"deny"}],
        reveal:{en:"<span class='k'>deny</span> — piping the network straight into a shell is outside the allowlist. the call never runs; the denial is fed back as an observation the model must handle.",de:"<span class='k'>ablehnen</span> — das netz direkt in eine shell zu pipen liegt außerhalb der allowlist. der call läuft nie; das nein wird als beobachtung zurückgespeist, die das modell verarbeiten muss."}},
       cap:{en:"and now <span class='k'>run_command: curl x.sh | sh</span> — network straight into a shell. allow, ask, or deny?",de:"und jetzt <span class='k'>run_command: curl x.sh | sh</span> — netz direkt in eine shell. erlauben, fragen, ablehnen?"},
       log:{en:"run_command curl x.sh | sh → <span class='r'>deny</span>",de:"run_command curl x.sh | sh → <span class='r'>abgelehnt</span>"}},
      {show:["model","gate","ws"],edges:["g1","g2"],active:{},applied:["g1","g2"],
       cap:{en:"the gate is the <span class='k'>one write path</span>: allow, ask, deny — sorted by blast radius. every verdict is logged as an observation, so the whole decision trail is replayable.",de:"das gate ist der <span class='k'>eine schreibpfad</span>: erlauben, fragen, ablehnen — nach blast-radius. jedes urteil landet als beobachtung im log, die ganze entscheidungs-spur ist also abspielbar."},
       log:{en:"3 decisions logged · <b>replayable</b>",de:"3 entscheidungen geloggt · <b>abspielbar</b>"}}
    ]
  },

  /* ============ 4 · the four moves on the window ============ */
  {
    id:"context-window", difficulty:"core", readoutKind:"budget",
    title:{en:"the four moves on the window",de:"die vier operationen am fenster"},
    blurb:{en:"four operations move tokens across the window boundary — but the budget never grows. you spend it on signal, not noise.",
           de:"vier operationen bewegen tokens über die fenstergrenze — aber das budget wächst nie. du gibst es für signal aus, nicht für rauschen."},
    readout:{en:"the four moves",de:"die vier operationen"},
    nodes:{
      window:{x:372,y:196,w:236,h:150,kind:"token",title:{en:"fixed budget",de:"festes budget"},budget:true,eyebrow:"the context window"},
      sources:{x:60,y:236,w:184,h:66,kind:"harness",eyebrow:"select",title:{en:"sources",de:"quellen"},sub:{en:"files · skills",de:"dateien · skills"}},
      disk:{x:390,y:44,w:200,h:60,kind:"harness",eyebrow:"write",title:{en:"disk",de:"disk"},sub:{en:"CLAUDE.md · memory",de:"CLAUDE.md · memory"}},
      history:{x:366,y:440,w:248,h:58,kind:"harness",eyebrow:"compress",title:{en:"history 10 turns → 1 paragraph",de:"verlauf 10 runden → 1 absatz"}},
      sub:{x:724,y:220,w:196,h:80,kind:"sub",eyebrow:"isolate",title:{en:"subagent",de:"subagent"},sub:{en:"its own window",de:"eigenes fenster"}}
    },
    edges:[
      {id:"select",from:"sources",to:"window",label:"2 select"},{id:"write",from:"window",to:"disk",label:"1 write"},
      {id:"compress",from:"history",to:"window",label:"3 compress"},{id:"isolate",from:"window",to:"sub",label:"4 isolate"}
    ],
    steps:[
      {show:["window"],edges:[],active:{nodes:["window"]},data:{window:{filled:6}},
       cap:{en:"a <span class='k'>fixed budget</span> — here 6 of 32 cells used. every move below spends this budget; none of them enlarge it.",de:"ein <span class='k'>festes budget</span> — hier 6 von 32 zellen belegt. jede operation gibt dieses budget aus; keine vergrößert es."},stat:{label:{en:"budget",de:"budget"},val:"6 / 32"}},
      {show:["window","sources"],edges:["select"],active:{nodes:["sources"],edges:["select"]},data:{window:{filled:22}},
       cap:{en:"<span class='k'>SELECT</span>: only the files and skills the task needs, pulled in on demand. the bar fills toward the cap.",de:"<span class='k'>SELECT</span>: nur die dateien und skills, die die aufgabe braucht — bei bedarf hereingezogen. der balken füllt sich zur kappe."},stat:{label:{en:"budget",de:"budget"},val:"22 / 32"}},
      {show:["window","sources","history"],edges:["select","compress"],active:{nodes:["history"],edges:["compress"]},applied:["select"],data:{window:{filled:13}},
       cap:{en:"<span class='k'>COMPRESS</span>: ten turns of history collapse to one paragraph — the gist kept, the tokens freed.",de:"<span class='k'>COMPRESS</span>: zehn runden verlauf schrumpfen auf einen absatz — der kern bleibt, die tokens werden frei."},stat:{label:{en:"budget",de:"budget"},val:"13 / 32"}},
      {show:["window","sources","history","sub"],edges:["select","compress","isolate"],active:{nodes:["sub"],edges:["isolate"]},applied:["select","compress"],data:{window:{filled:13}},
       cap:{en:"<span class='k'>ISOLATE</span>: a messy sub-task gets its <span class='k'>own</span> window — its tokens never touch this one.",de:"<span class='k'>ISOLATE</span>: eine unruhige teilaufgabe bekommt ihr <span class='k'>eigenes</span> fenster — ihre tokens berühren dieses nie."},stat:{label:{en:"budget",de:"budget"},val:"13 / 32"}},
      {show:["window","sources","history","sub","disk"],edges:["select","compress","isolate","write"],active:{nodes:["disk"],edges:["write"]},applied:["select","compress","isolate"],data:{window:{filled:9}},
       cap:{en:"<span class='k'>WRITE</span>: durable state offloads to disk (it survives the session). the budget <span class='k'>never exceeded its cap</span> — that is the whole discipline.",de:"<span class='k'>WRITE</span>: dauerhafter zustand wird auf disk ausgelagert (überlebt die session). das budget <span class='k'>überschritt nie seine kappe</span> — das ist die ganze disziplin."},stat:{label:{en:"budget",de:"budget"},val:"9 / 32"}}
    ]
  },

  /* ============ 5 · progressive disclosure ============ */
  {
    id:"progressive-disclosure", difficulty:"deep", readoutKind:"cost",
    title:{en:"thin until it matches",de:"dünn bis es passt"},
    blurb:{en:"skills sit as a name and a description, ~100 tokens each, read every turn. the full body loads only when the task matches.",
           de:"skills liegen als name und beschreibung da, ~100 tokens je, jede runde gelesen. der volle body lädt nur, wenn die aufgabe passt."},
    readout:{en:"context cost",de:"kontext-kosten"},
    nodes:{
      task:{x:60,y:238,w:200,h:78,kind:"human",eyebrow:"incoming task",title:{en:"“fill out this PDF”",de:"„füll dieses PDF aus“"}},
      commit:{x:330,y:96,w:150,h:64,kind:"skill",eyebrow:"skill",title:{en:"commit-msg",de:"commit-msg"},sub:{en:"~100 tok",de:"~100 tok"}},
      pdf:{x:496,y:96,w:168,h:64,kind:"skill",eyebrow:"skill",title:{en:"pdf-forms",de:"pdf-forms"},sub:{en:"~100 tok",de:"~100 tok"},
           body:[{n:"1",t:{en:"find AcroForm fields",de:"AcroForm-felder finden"}},{n:"2",t:{en:"map answer to field",de:"antwort auf feld mappen"}},{n:"3",t:{en:"fill, flatten, write",de:"füllen, flatten, schreiben"}},{n:"4",t:{en:"verify each field",de:"jedes feld prüfen"}}]},
      sql:{x:680,y:96,w:150,h:64,kind:"skill",eyebrow:"skill",title:{en:"sql-review",de:"sql-review"},sub:{en:"~100 tok",de:"~100 tok"}},
      change:{x:680,y:200,w:150,h:64,kind:"skill",eyebrow:"skill",title:{en:"changelog",de:"changelog"},sub:{en:"~100 tok",de:"~100 tok"}}
    },
    edges:[{id:"match",from:"task",to:"pdf",label:"description matches"}],
    steps:[
      {show:["commit","pdf","sql","change"],edges:[],active:{},
       cap:{en:"<span class='k'>at rest</span>: every skill is just a name + description — about 100 tokens, read into context every turn. cheap enough to keep them all on.",de:"<span class='k'>in ruhe</span>: jeder skill ist nur name + beschreibung — etwa 100 tokens, jede runde in den kontext gelesen. billig genug, alle anzulassen."},cost:{n:400,note:{en:"4 skills · ~100 tok each",de:"4 skills · ~100 tok je"}}},
      {show:["task","commit","pdf","sql","change"],edges:["match"],active:{nodes:["task"],edges:["match"]},
       cap:{en:"a task arrives: <span class='k'>“fill out this PDF”</span>. the harness matches it against each description.",de:"eine aufgabe kommt: <span class='k'>„füll dieses PDF aus“</span>. der harness gleicht sie mit jeder beschreibung ab."},cost:{n:400,note:{en:"still 4 × ~100 tok",de:"immer noch 4 × ~100 tok"}}},
      {show:["task","commit","pdf","sql","change"],edges:["match"],active:{nodes:["pdf"],edges:["match"]},applied:["match"],data:{pdf:{expanded:true}},
       cap:{en:"one description hits. <span class='k'>pdf-forms expands to its full body</span> — the four real steps, ~1,400 tokens — loaded only now.",de:"eine beschreibung trifft. <span class='k'>pdf-forms klappt auf seinen vollen body auf</span> — die vier echten schritte, ~1.400 tokens — erst jetzt geladen."},cost:{n:1700,note:{en:"3 × ~100 + pdf-forms full body ~1,400",de:"3 × ~100 + pdf-forms voller body ~1.400"}}},
      {show:["task","commit","pdf","sql","change"],edges:["match"],active:{nodes:["pdf"]},applied:["match"],data:{pdf:{expanded:true}},
       cap:{en:"the <span class='k'>siblings stay thin</span>. the cost of the full body is paid <span class='k'>only on the match</span> — progressive disclosure is a token-economy move, not a feature flag.",de:"die <span class='k'>geschwister bleiben dünn</span>. die kosten des vollen body werden <span class='k'>nur beim treffer</span> bezahlt — progressive disclosure ist eine token-ökonomie, kein feature-flag."},cost:{n:1700,note:{en:"only the matched skill paid full price",de:"nur der getroffene skill zahlte vollen preis"}}}
    ]
  },

  /* ============ · serial vs. orchestrated (fan-out) ============ */
  {
    id:"fleet", difficulty:"deep", readoutKind:"log",
    title:{en:"serial vs. orchestrated",de:"seriell vs. orchestriert"},
    blurb:{en:"one agent runs subtasks in sequence in a single window. for independent work the harness fans out to workers, each with its own isolated context — the fleet you watch in the Spectrum tab.",
           de:"ein agent führt teilaufgaben nacheinander in einem fenster aus. für unabhängige arbeit fächert der harness zu workern auf, jeder mit eigenem, isoliertem kontext — die flotte, die du im Spectrum-tab beobachtest."},
    readout:{en:"orchestration log",de:"orchestrierungs-log"},
    nodes:{
      orch:{x:392,y:60,w:196,h:64,kind:"model",eyebrow:"the orchestrator",title:{en:"orchestrator",de:"orchestrator"},sub:{en:"decompose · dispatch · merge",de:"zerlegen · verteilen · mergen"}},
      w1:{x:70,y:280,w:196,h:76,kind:"sub",eyebrow:"worker · own window",title:{en:"research",de:"recherche"},sub:{en:"isolated context",de:"isolierter kontext"}},
      w2:{x:392,y:280,w:196,h:76,kind:"sub",eyebrow:"worker · own window",title:{en:"draft",de:"entwurf"},sub:{en:"isolated context",de:"isolierter kontext"}},
      w3:{x:714,y:280,w:196,h:76,kind:"sub",eyebrow:"worker · own window",title:{en:"review",de:"review"},sub:{en:"isolated context",de:"isolierter kontext"}},
      merge:{x:392,y:456,w:196,h:56,kind:"harness",eyebrow:"back on the main window",title:{en:"merge results",de:"resultate zusammenführen"}}
    },
    edges:[
      {id:"s1",from:"orch",to:"w1",label:"spawn"},{id:"s2",from:"orch",to:"w2",label:"spawn"},{id:"s3",from:"orch",to:"w3",label:"spawn"},
      {id:"m1",from:"w1",to:"merge"},{id:"m2",from:"w2",to:"merge"},{id:"m3",from:"w3",to:"merge"}
    ],
    steps:[
      {show:["orch"],edges:[],active:{nodes:["orch"]},
       cap:{en:"one agent, <span class='k'>one window</span>: it can run subtasks in sequence — research, then draft, then review — all sharing the same context. simple, but the window fills fast.",de:"ein agent, <span class='k'>ein fenster</span>: es kann teilaufgaben nacheinander laufen — recherche, dann entwurf, dann review — alle im selben kontext. einfach, aber das fenster füllt sich schnell."},
       log:{en:"main agent · <b>serial</b> plan",de:"haupt-agent · <b>serieller</b> plan"}},
      {show:["orch","w1","w2","w3"],edges:["s1","s2","s3"],active:{nodes:["orch"],edges:["s1","s2","s3"]},
       cap:{en:"for <span class='k'>independent</span> subtasks the harness fans out: the orchestrator <span class='k'>spawns workers</span>, one per subtask, in parallel.",de:"für <span class='k'>unabhängige</span> teilaufgaben fächert der harness auf: der orchestrator <span class='k'>startet worker</span>, einen je teilaufgabe, parallel."},
       log:{en:"spawn · research · draft · review",de:"spawn · recherche · entwurf · review"}},
      {show:["orch","w1","w2","w3"],edges:["s1","s2","s3"],active:{nodes:["w1","w2","w3"]},applied:["s1","s2","s3"],
       cap:{en:"each worker runs in its <span class='k'>own context window</span> — fully isolated. the messy exploration never pollutes the main window, and the workers never see each other.",de:"jeder worker läuft in seinem <span class='k'>eigenen kontextfenster</span> — vollständig isoliert. die unruhige exploration verschmutzt nie das hauptfenster, und die worker sehen sich nie gegenseitig."},
       log:{en:"3 windows · <b>isolated</b> · parallel",de:"3 fenster · <b>isoliert</b> · parallel"}},
      {show:["orch","w1","w2","w3","merge"],edges:["s1","s2","s3","m1","m2","m3"],active:{nodes:["merge"],edges:["m1","m2","m3"]},applied:["s1","s2","s3"],
       cap:{en:"the workers report back; the orchestrator <span class='k'>merges the results</span> into the main window — only the answers cross the boundary, not the scratch work.",de:"die worker melden zurück; der orchestrator <span class='k'>fügt die resultate</span> ins hauptfenster zusammen — nur die antworten überqueren die grenze, nicht die kladde."},
       log:{en:"merge · 3 results → main window",de:"merge · 3 resultate → hauptfenster"}},
      {show:["orch","w1","w2","w3","merge"],edges:["s1","s2","s3","m1","m2","m3"],active:{},applied:["s1","s2","s3","m1","m2","m3"],
       cap:{en:"this is the <span class='k'>fleet</span> you watch live in the Spectrum tab — every agent a spectral line, every window its own. orchestration is just another harness function.",de:"das ist die <span class='k'>flotte</span>, die du im Spectrum-tab live beobachtest — jeder agent eine spektrallinie, jedes fenster für sich. orchestrierung ist einfach eine weitere harness-funktion."},
       log:{en:"fleet · <b>4 agents</b> · watch in Spectrum",de:"flotte · <b>4 agenten</b> · im Spectrum sehen"}}
    ]
  }
  ];

export const PLANNED: Planned[] = [
    {title:{en:"a hook is a guarantee",de:"ein hook ist eine garantie"},chip:{en:"hooks",de:"hooks"}},
    {title:{en:"the spec survives the session",de:"die spec überlebt die session"},chip:{en:"spec",de:"spec"}}
  ];
