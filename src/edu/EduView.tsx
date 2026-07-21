// The edu lesson host — a native port of the vanilla prototype's engine. A lesson
// is fixed-position nodes + edges in a 980x540 world (pan/zoom), stepped through a
// sequence that drives visibility, highlight, data patches, a readout and a
// predict-then-reveal. Captions/logs carry inline HTML, rendered as-is.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { LESSONS, type EduLesson, type EduNode, type EduStep, type Loc } from "./lessons";
import { useLang } from "../state/lang";
import { eduLastStep, markComplete, setLastStep } from "./eduStore";
import { EduReadout } from "./EduReadout";

const WORLD_W = 980;
const WORLD_H = 540;
const MIN_K = 0.35;
const MAX_K = 2.6;
const DEFINED_EV = new Set(["token", "tool", "gate", "subagent", "lifecycle", "reasoning"]);

const ll = (v: Loc | undefined, de: boolean): string =>
  v == null ? "" : typeof v === "string" ? v : de ? v.de ?? v.en : v.en;
const fmt = (n: number) => n.toLocaleString("en-US");
const evVar = (ev: string) => `var(--ev-${ev})`;
const html = (s: string) => ({ dangerouslySetInnerHTML: { __html: s } });

type Rect = { x: number; y: number; w: number; h: number };
type Pt = { x: number; y: number };

function anchorFor(a: Rect, b: Rect): { p1: Pt; p2: Pt; side: string } {
  const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
  const bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  const dx = bc.x - ac.x;
  const dy = bc.y - ac.y;
  const side = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "r" : "l") : dy > 0 ? "b" : "t";
  const pt = (r: Rect, s: string): Pt =>
    s === "r" ? { x: r.x + r.w, y: r.y + r.h / 2 }
    : s === "l" ? { x: r.x, y: r.y + r.h / 2 }
    : s === "t" ? { x: r.x + r.w / 2, y: r.y }
    : { x: r.x + r.w / 2, y: r.y + r.h };
  const opp: Record<string, string> = { r: "l", l: "r", t: "b", b: "t" };
  return { p1: pt(a, side), p2: pt(b, opp[side]), side };
}
function pathD(a: Rect, b: Rect): { d: string; mid: Pt } {
  const { p1, p2, side } = anchorFor(a, b);
  const k = 0.42 * Math.hypot(p2.x - p1.x, p2.y - p1.y);
  let c1: Pt, c2: Pt;
  if (side === "r") { c1 = { x: p1.x + k, y: p1.y }; c2 = { x: p2.x - k, y: p2.y }; }
  else if (side === "l") { c1 = { x: p1.x - k, y: p1.y }; c2 = { x: p2.x + k, y: p2.y }; }
  else if (side === "b") { c1 = { x: p1.x, y: p1.y + k }; c2 = { x: p2.x, y: p2.y - k }; }
  else { c1 = { x: p1.x, y: p1.y - k }; c2 = { x: p2.x, y: p2.y + k }; }
  return { d: `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`, mid: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 } };
}
function edgeColor(lesson: EduLesson, fromId: string, toId: string): string | null {
  const from = lesson.nodes[fromId];
  const to = lesson.nodes[toId];
  if (!from || !to) return null;
  const kind = to.kind === "token" || to.kind === "stack" ? from.kind : to.kind;
  return DEFINED_EV.has(kind) ? `var(--ev-${kind})` : null;
}

/** The inner content of a node, by kind + the current step's data patch. */
function NodeInner(props: {
  node: EduNode;
  patch?: { filled?: number; call?: string };
  win?: EduStep["win"];
  lesson: EduLesson;
  de: boolean;
}) {
  const { node, patch, win, lesson, de } = props;

  if (node.stack) {
    const tok = win?.tok ?? {};
    const cap = lesson.cap ?? 32000;
    let total = 0;
    for (const sg of lesson.segs ?? []) if (tok[sg.id]) total += tok[sg.id];
    const pct = Math.min(100, (total / cap) * 100);
    const state = win?.state ?? (pct >= 90 ? "error" : pct >= 70 ? "warn" : "ok");
    return (
      <>
        <div className="cs-head">
          <div className="cs-title">{ll(node.title, de)}</div>
          <div className={`cs-gauge${state === "ok" ? "" : " " + state}`}>
            <i style={{ width: pct + "%" }} />
          </div>
          <div className="cs-total">
            <span className="cs-now">{fmt(total)} tok</span>
            <span className={`st ${state}`}>
              {state === "error" ? "context rot" : state === "warn" ? (de ? "füllt sich" : "filling") : "cap " + Math.round(cap / 1000) + "k"}
            </span>
          </div>
        </div>
        <div className="cs-rows">
          {(lesson.segs ?? []).map((sg) => {
            const v = tok[sg.id] ?? 0;
            if (v <= 0 && !sg.base) return null;
            return (
              <div key={sg.id} className={`seg-row${sg.base ? " base" : " hot"}`}>
                <span className="seg-lbl">{ll(sg.label, de)}</span>
                <span className="seg-bar">
                  <i style={{ width: (v / cap) * 100 + "%", background: evVar(sg.ev) }} />
                </span>
                <span className="seg-tok">{v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}</span>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  const sub = patch?.call ?? (node.sub != null ? ll(node.sub, de) : "");
  return (
    <>
      {node.eyebrow && <div className="n-eyebrow">{node.eyebrow}</div>}
      <div className="n-title">{ll(node.title, de)}</div>
      {node.budget && (
        <div className="budget">
          <div className="budget-cells">
            {Array.from({ length: 32 }, (_, c) => (
              <span key={c} className={`cell${c < (patch?.filled ?? 0) ? " on" : ""}`} />
            ))}
          </div>
          <div className="budget-meta">
            <span>{(patch?.filled ?? 0)} / 32</span>
            <span>cap</span>
          </div>
        </div>
      )}
      {node.body && (
        <div className="skill-body">
          {node.body.map((st, i) => (
            <div key={i} className="skill-step">
              <b>{st.n}</b>
              {ll(st.t, de)}
            </div>
          ))}
          <div className="skill-cost">full body ≈ 1,400 tok</div>
        </div>
      )}
      {!node.budget && !node.body && sub && <div className="n-sub">{sub}</div>}
      {node.detail && (
        <>
          <div className="node-hint">＋ {de ? "inspizieren" : "inspect"}</div>
          <div className="node-detail">
            {node.detail.map((d, i) => (
              <div key={i} className="dl">
                {ll(d, de)}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

export function EduView(props: { lessonId: string }) {
  const { lessonId } = props;
  const lang = useLang();
  const de = lang === "de";
  const lesson = LESSONS.find((l) => l.id === lessonId) ?? LESSONS[0];
  const nSteps = lesson.steps.length;

  const [step, setStep] = useState(() => {
    const st = eduLastStep(lessonId);
    return st >= (LESSONS.find((l) => l.id === lessonId) ?? LESSONS[0]).steps.length ? 0 : st;
  });
  const [answered, setAnswered] = useState<Record<string, string>>({});
  const [inspected, setInspected] = useState<Record<string, boolean>>({});
  const [playing, setPlaying] = useState(false);

  // Reset per lesson.
  useEffect(() => {
    const st = eduLastStep(lessonId);
    setStep(st >= nSteps ? 0 : st);
    setAnswered({});
    setInspected({});
    setPlaying(false);
  }, [lessonId, nSteps]);

  // Persist progress.
  useEffect(() => {
    setLastStep(lessonId, step);
    if (step === nSteps - 1) markComplete(lessonId);
  }, [step, lessonId, nSteps]);

  // Auto-play.
  useEffect(() => {
    if (!playing) return;
    if (step >= nSteps - 1) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setStep((s) => Math.min(nSteps - 1, s + 1)), 2000);
    return () => clearTimeout(id);
  }, [playing, step, nSteps]);

  // Keyboard: arrows step, space plays. (h/?/esc stay global.)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      const onButton = el?.tagName === "BUTTON";
      if (e.key === "ArrowRight") {
        setPlaying(false);
        setStep((s) => Math.min(nSteps - 1, s + 1));
      } else if (e.key === "ArrowLeft") {
        setPlaying(false);
        setStep((s) => Math.max(0, s - 1));
      } else if (e.key === " " && !onButton) {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nSteps]);

  const s = lesson.steps[step];

  // ---- measure node rects (world coords) so edges anchor to real geometry ----
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [rects, setRects] = useState<Record<string, Rect>>({});
  useLayoutEffect(() => {
    const r: Record<string, Rect> = {};
    for (const id of Object.keys(lesson.nodes)) {
      const el = nodeRefs.current[id];
      if (el && el.style.display !== "none") {
        r[id] = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
      }
    }
    setRects(r);
  }, [lesson, step, de, inspected]);

  // ---- pan & zoom ----
  const wrapRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const pan = useRef<{ on: boolean; sx: number; sy: number; vx: number; vy: number }>({ on: false, sx: 0, sy: 0, vx: 0, vy: 0 });

  const fitView = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const availW = wrap.clientWidth;
    const availH = wrap.clientHeight;
    let k = Math.min((availW - 48) / WORLD_W, (availH - 48) / WORLD_H, 1);
    if (!isFinite(k) || k <= 0) k = 1;
    setView({ k, x: Math.max(0, (availW - WORLD_W * k) / 2), y: Math.max(0, (availH - WORLD_H * k) / 2) });
  }, []);
  useEffect(() => {
    fitView();
  }, [lessonId, fitView]);
  useEffect(() => {
    const on = () => fitView();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [fitView]);

  const zoomAt = useCallback((cx: number, cy: number, factor: number) => {
    setView((v) => {
      const nk = Math.min(MAX_K, Math.max(MIN_K, v.k * factor));
      if (nk === v.k) return v;
      const wx = (cx - v.x) / v.k;
      const wy = (cy - v.y) / v.k;
      return { k: nk, x: cx - wx * nk, y: cy - wy * nk };
    });
  }, []);

  // native non-passive wheel so we can preventDefault the page scroll
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = wrap.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.1 : 1 / 1.1);
    };
    wrap.addEventListener("wheel", onWheel, { passive: false });
    return () => wrap.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (t.closest(".edu-node") || t.closest(".edu-zoom")) return;
    pan.current = { on: true, sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pan.current.on) return;
    setView((v) => ({ ...v, x: pan.current.vx + (e.clientX - pan.current.sx), y: pan.current.vy + (e.clientY - pan.current.sy) }));
  };
  const endPan = () => {
    pan.current.on = false;
  };

  // ---- step actions ----
  const go = (n: number) => setStep(Math.max(0, Math.min(nSteps - 1, n)));
  const next = () => {
    setPlaying(false);
    go(step + 1);
  };
  const prev = () => {
    setPlaying(false);
    go(step - 1);
  };
  const reset = () => {
    setPlaying(false);
    go(0);
  };

  const capKey = `${lesson.id}:${step}`;
  const caption = s.predict && answered[capKey] ? ll(s.predict.reveal, de) : ll(s.cap, de);

  return (
    <section className="edu-view" aria-label="edu lesson">
      <header className="edu-lesson-head">
        <p className="eyebrow">
          {(de ? "lerneinheit · " : "learning unit · ") + lesson.difficulty}
        </p>
        <h1>{ll(lesson.title, de)}</h1>
        <p className="edu-blurb">{ll(lesson.blurb, de)}</p>
      </header>

      <div className="edu-lesson-stage">
        <div
          className="edu-canvas"
          ref={wrapRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPan}
          onPointerCancel={endPan}
        >
          <div className="edu-world" style={{ transform: `translate(${view.x}px,${view.y}px) scale(${view.k})` }}>
            <svg className="edu-edges" viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} aria-hidden="true">
              {s.edges.map((eid) => {
                const ed = lesson.edges.find((e) => e.id === eid);
                if (!ed) return null;
                const a = rects[ed.from];
                const b = rects[ed.to];
                if (!a || !b) return null;
                const pd = pathD(a, b);
                const active = !!s.active?.edges?.includes(eid);
                const applied = !!s.applied?.includes(eid);
                const cls = `edge${ed.dashed ? " is-dashed" : active ? " is-active" : applied ? " is-applied" : ""}`;
                const stroke = active && !ed.dashed ? edgeColor(lesson, ed.from, ed.to) : null;
                return (
                  <g key={eid}>
                    <path d={pd.d} className={cls} style={stroke ? { stroke } : undefined} />
                    {ed.label && !ed.dashed && (
                      <text x={pd.mid.x} y={pd.mid.y - 6} textAnchor="middle" className={`edge-label${active ? " hot" : ""}`}>
                        {ed.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {Object.entries(lesson.nodes).map(([id, node]) => {
              const visible = s.show.includes(id);
              const active = visible && !!s.active?.nodes?.includes(id);
              const patch = s.data?.[id];
              const expanded = node.detail ? !!inspected[id] : !!patch?.expanded;
              return (
                <div
                  key={id}
                  ref={(el) => {
                    nodeRefs.current[id] = el;
                  }}
                  className={`edu-node k-${node.kind}${node.detail ? " has-detail" : ""}${active ? " is-active" : ""}${expanded ? " expanded" : ""}`}
                  style={{ left: node.x, top: node.y, width: node.w, display: visible ? "flex" : "none" }}
                  onClick={node.detail ? () => setInspected((m) => ({ ...m, [id]: !m[id] })) : undefined}
                >
                  <NodeInner node={node} patch={patch} win={s.win} lesson={lesson} de={de} />
                  <div className={`ring${active ? " pulse" : ""}`} />
                </div>
              );
            })}
          </div>

          <div className="edu-zoom">
            <button type="button" onClick={() => zoomAt((wrapRef.current?.clientWidth ?? 0) / 2, (wrapRef.current?.clientHeight ?? 0) / 2, 1.25)} aria-label="zoom in">+</button>
            <button type="button" onClick={() => zoomAt((wrapRef.current?.clientWidth ?? 0) / 2, (wrapRef.current?.clientHeight ?? 0) / 2, 1 / 1.25)} aria-label="zoom out">−</button>
            <button type="button" onClick={fitView} aria-label="fit to view">⤢</button>
          </div>
          <span className="edu-zoom-hint mono">{de ? "scrollen = zoom · ziehen = pan" : "scroll to zoom · drag to pan"}</span>
        </div>

        <aside className="edu-readout">
          <div className="edu-readout-head">
            <span className="eyebrow">{ll(lesson.readout, de)}</span>
          </div>
          <EduReadout lesson={lesson} step={step} answered={answered} de={de} />
        </aside>
      </div>

      <div className="edu-controller">
        <div className="caption" {...html(caption)} />
        {s.predict && (
          <div className="predict show">
            <span className="pq">{answered[capKey] ? (de ? "urteil" : "verdict") : ll(s.predict.q, de)}</span>
            {s.predict.options.map((o) => {
              const ans = answered[capKey];
              const cls = ans
                ? o.verdict === s.predict!.correct
                  ? " reveal"
                  : o.verdict === ans
                    ? " wrong"
                    : ""
                : "";
              return (
                <button
                  key={o.verdict}
                  type="button"
                  className={cls.trim() || undefined}
                  disabled={!!ans}
                  onClick={() => setAnswered((m) => ({ ...m, [capKey]: o.verdict }))}
                >
                  {ll(o.l, de)}
                </button>
              );
            })}
          </div>
        )}
        <div className="edu-ctrl-row">
          <div className="edu-ctrl-btns">
            <button type="button" onClick={reset} disabled={step === 0} aria-label={de ? "zurücksetzen" : "reset"} title={de ? "zurücksetzen" : "reset"}>
              ⟲
            </button>
            <button type="button" onClick={prev} disabled={step === 0} aria-label={de ? "zurück" : "previous"} title={de ? "zurück" : "previous"}>
              ‹
            </button>
            <button type="button" className="play" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "pause" : "play"} title={playing ? "pause" : "play"}>
              {playing ? "❚❚" : "▸"}
            </button>
            <button type="button" onClick={next} disabled={step === nSteps - 1} aria-label={de ? "weiter" : "next"} title={de ? "weiter" : "next"}>
              ›
            </button>
          </div>
          <div className="edu-scrub">
            <input
              type="range"
              min={0}
              max={nSteps - 1}
              value={step}
              step={1}
              aria-label="step"
              onChange={(e) => {
                setPlaying(false);
                go(Number(e.target.value));
              }}
            />
            <span className="counter tabular">
              {(de ? "schritt " : "step ") + (step + 1) + " / " + nSteps}
            </span>
          </div>
          {step === nSteps - 1 && <span className="done-flag">✓ {de ? "abgeschlossen" : "complete"}</span>}
        </div>
      </div>
    </section>
  );
}
