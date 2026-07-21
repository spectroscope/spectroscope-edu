// EduView — the lesson workspace. Header + the teaching canvas (EduFlow: the
// simulator's own cards) + the readout rail + a controller (caption, optional
// predict-then-reveal, transport). Every frame is precomputed from the lesson via
// ./frames, so stepping is a pure index into { nodes, edges }. Progress persists
// through eduStore (spectroscope:edu); a finished lesson reopens at step 0.

import { useCallback, useEffect, useMemo, useState } from "react";
import { EduFlow } from "./EduFlow";
import { EduReadout } from "./EduReadout";
import { lessonFrames } from "./frames";
import { LESSONS } from "./lessons";
import { useLang } from "../state/lang";
import { eduLastStep, markComplete, setLastStep, useEduProgress } from "./eduStore";
import type { EduLesson, Loc } from "./model";

const ll = (v: Loc | undefined, de: boolean): string =>
  v == null ? "" : typeof v === "string" ? v : de ? v.de ?? v.en : v.en;
const html = (s: string) => ({ dangerouslySetInnerHTML: { __html: s } });

const DEFAULT_READOUT: Record<string, { en: string; de: string }> = {
  log: { en: "session.jsonl", de: "session.jsonl" },
  budget: { en: "budget", de: "budget" },
  cost: { en: "context cost", de: "kontext-kosten" },
  gives: { en: "what the harness gives you", de: "was der harness dir gibt" },
  gauge: { en: "context gauge", de: "kontext-anzeige" },
  none: { en: "", de: "" },
};

export function EduView({ lessonId }: { lessonId: string }) {
  const lang = useLang();
  const de = lang === "de";
  useEduProgress(); // subscribe so the completion flag re-renders

  const lesson: EduLesson = useMemo(() => LESSONS.find((l) => l.id === lessonId) ?? LESSONS[0], [lessonId]);
  const frames = useMemo(() => lessonFrames(lesson, lang), [lesson, lang]);
  const n = lesson.steps.length;

  const [step, setStep] = useState(() => {
    const s = eduLastStep(lesson.id);
    return s >= n ? 0 : s;
  });
  const [answered, setAnswered] = useState<Record<string, string>>({});
  const [playing, setPlaying] = useState(false);

  // Reset when the lesson changes.
  useEffect(() => {
    const s = eduLastStep(lesson.id);
    setStep(s >= lesson.steps.length ? 0 : s);
    setAnswered({});
    setPlaying(false);
  }, [lesson.id, lesson.steps.length]);

  // Persist progress; mark complete on the last step.
  useEffect(() => {
    setLastStep(lesson.id, step);
    if (step === n - 1) markComplete(lesson.id);
  }, [step, lesson.id, n]);

  // Defensive clamp: EduView is keyed by lessonId (App.tsx) so it remounts with a
  // fresh, in-range step per lesson, but guard the read anyway so a stale index can
  // never index past a shorter lesson's steps mid-render.
  const cur = lesson.steps[step] ?? lesson.steps[lesson.steps.length - 1];
  const predict = cur.predict;
  const key = `${lesson.id}:${step}`;
  const answeredHere = answered[key];
  const gated = Boolean(predict) && !answeredHere;

  const next = useCallback(() => {
    setPlaying(false);
    setStep((s) => Math.min(n - 1, s + 1));
  }, [n]);
  const prev = useCallback(() => {
    setPlaying(false);
    setStep((s) => Math.max(0, s - 1));
  }, []);

  // Keyboard: ←/→ step, space play/pause.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === " " && el?.tagName !== "BUTTON") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [next, prev]);

  // Autoplay (setTimeout, never rAF — the embedded preview pane stalls rAF).
  useEffect(() => {
    if (!playing) return;
    if (step >= n - 1 || gated) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setStep((s) => Math.min(n - 1, s + 1)), 2200);
    return () => clearTimeout(id);
  }, [playing, step, n, gated]);

  const frame = frames[step] ?? frames[frames.length - 1];
  const layoutKey = `${lesson.id}:${frame?.provider ?? ""}`;
  const captionText = predict && answeredHere ? ll(predict.reveal, de) : ll(cur.cap, de);
  const readoutLabel = ll(lesson.readout, de) || (DEFAULT_READOUT[lesson.readoutKind]?.[lang] ?? "");
  const complete = step === n - 1;

  const answer = (verdict: string) => {
    if (answeredHere) return;
    setAnswered((a) => ({ ...a, [key]: verdict }));
    setPlaying(false);
  };

  return (
    <section className="edu-view" aria-label="edu lesson">
      <header className="edu-lesson-head">
        <p className="eyebrow">{(de ? "lerneinheit · " : "learning unit · ") + lesson.difficulty}</p>
        <h1>{ll(lesson.title, de)}</h1>
        <p className="edu-blurb">{ll(lesson.blurb, de)}</p>
      </header>

      <div className={`edu-lesson-stage${lesson.readoutKind === "none" ? " no-readout" : ""}`}>
        <div className="edu-map">
          <EduFlow nodes={frame?.nodes ?? []} edges={frame?.edges ?? []} fitSignal={step} layoutKey={layoutKey} />
        </div>
        {lesson.readoutKind !== "none" && (
          <aside className="edu-readout">
            <div className="edu-readout-head">
              <span className="eyebrow">{readoutLabel}</span>
            </div>
            <EduReadout lesson={lesson} step={step} answered={answered} de={de} />
          </aside>
        )}
      </div>

      <div className="edu-controller">
        <div className="caption" {...html(captionText)} />

        {predict && (
          <div className="predict show">
            <span className="pq">{answeredHere ? (de ? "urteil" : "verdict") : ll(predict.q, de)}</span>
            {predict.options.map((o) => {
              const cls = answeredHere
                ? o.verdict === predict.correct
                  ? "reveal"
                  : o.verdict === answeredHere
                    ? "wrong"
                    : ""
                : "";
              return (
                <button
                  key={o.verdict}
                  type="button"
                  className={cls || undefined}
                  disabled={Boolean(answeredHere)}
                  onClick={() => answer(o.verdict)}
                >
                  {ll(o.l, de)}
                </button>
              );
            })}
          </div>
        )}

        <div className="edu-ctrl-row">
          <div className="edu-ctrl-btns">
            <button type="button" onClick={() => setStep(0)} disabled={step === 0} title={de ? "zurücksetzen" : "reset"}>
              ⟲
            </button>
            <button type="button" onClick={prev} disabled={step === 0} title={de ? "zurück" : "previous"}>
              ‹
            </button>
            <button type="button" className="play" onClick={() => setPlaying((p) => !p)} disabled={complete} title={playing ? "pause" : "play"}>
              {playing ? "❚❚" : "▸"}
            </button>
            <button type="button" onClick={next} disabled={complete} title={de ? "weiter" : "next"}>
              ›
            </button>
          </div>
          <div className="edu-scrub">
            <input
              type="range"
              min={0}
              max={n - 1}
              step={1}
              value={step}
              aria-label="step"
              onChange={(e) => {
                setPlaying(false);
                setStep(Number(e.target.value));
              }}
            />
            <span className="counter tabular">{(de ? "schritt " : "step ") + (step + 1) + " / " + n}</span>
          </div>
          {complete && <span className="done-flag">✓ {de ? "abgeschlossen" : "complete"}</span>}
        </div>
      </div>
    </section>
  );
}
