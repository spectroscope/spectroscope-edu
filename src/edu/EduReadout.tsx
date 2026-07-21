// The lesson readout panel (right of the canvas). Five kinds, one per lesson:
// gauge (a context donut), log (session.jsonl lines), budget (the four moves),
// cost (tokens in window), gives (what the harness adds). Ported from the
// prototype's renderReadout. Log/note strings carry inline HTML, rendered as-is.

import type { EduLesson, Loc } from "./model";

const ll = (v: Loc | undefined, de: boolean): string =>
  v == null ? "" : typeof v === "string" ? v : de ? v.de ?? v.en : v.en;
const fmt = (n: number) => n.toLocaleString("en-US");
const evVar = (ev: string) => `var(--ev-${ev})`;
const html = (s: string) => ({ dangerouslySetInnerHTML: { __html: s } });

export function EduReadout(props: {
  lesson: EduLesson;
  step: number;
  answered: Record<string, string>;
  de: boolean;
}) {
  const { lesson, step, answered, de } = props;
  const s = lesson.steps[step];
  const kind = lesson.readoutKind;

  if (kind === "log") {
    const lines: string[] = [];
    for (let i = 0; i <= step; i++) {
      const st = lesson.steps[i];
      const gated = st.predict && !answered[`${lesson.id}:${i}`];
      if (st.log && !gated) lines.push(ll(st.log, de));
    }
    return (
      <div className="edu-readout-body">
        {lines.map((l, i) => (
          <div key={i} className="log-line" {...html(l)} />
        ))}
      </div>
    );
  }

  if (kind === "budget") {
    const st2 = s.stat;
    return (
      <div className="edu-readout-body">
        <div className="stat">
          <span>{ll(st2?.label ?? { en: "budget" }, de)}</span>
          <b>{st2?.val ?? ""}</b>
        </div>
        <div
          className="readout-note"
          {...html(
            de
              ? "vier operationen über die grenze: <b>write</b> raus auf disk, <b>select</b> herein, <b>compress</b> historie zu einem absatz, <b>isolate</b> in ein eigenes fenster. der balken erreicht nie mehr als die kappe."
              : "four moves cross the boundary: <b>write</b> out to disk, <b>select</b> in, <b>compress</b> history to a paragraph, <b>isolate</b> into its own window. the bar never passes the cap.",
          )}
        />
      </div>
    );
  }

  if (kind === "cost") {
    const cst = s.cost ?? { n: 0, note: { en: "" } };
    return (
      <div className="edu-readout-body">
        <div className="stat">
          <span>{de ? "tokens im fenster" : "tokens in window"}</span>
          <b className="tabular">{fmt(cst.n)}</b>
        </div>
        <div className="readout-note" {...html(ll(cst.note, de))} />
      </div>
    );
  }

  if (kind === "gives") {
    const gives: { l: Loc; s: Loc }[] = [];
    for (let j = 0; j <= step; j++) for (const it of lesson.steps[j].reveal ?? []) gives.push(it);
    return (
      <div className="edu-readout-body">
        {gives.length === 0 ? (
          <div className="readout-note">
            {de
              ? "jede schicht, die der harness hinzufügt, gibt dir eine fähigkeit, die das modell allein nicht hat."
              : "each layer the harness adds gives you a capability the model does not have on its own."}
          </div>
        ) : (
          <div className="gives">
            {gives.map((it, i) => (
              <div key={i} className="give">
                <span className="gm" />
                <div>
                  <div className="gl">{ll(it.l, de)}</div>
                  <div className="gs">{ll(it.s, de)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {step === lesson.steps.length - 1 && (
          <div className="readout-note" style={{ marginTop: 6 }}>
            none of this is in the weights.
          </div>
        )}
      </div>
    );
  }

  // gauge
  const win = s.win ?? { tok: {} };
  const tok = win.tok ?? {};
  const cap = lesson.cap ?? 32000;
  let total = 0;
  for (const sg of lesson.segs ?? []) if (tok[sg.id]) total += tok[sg.id];
  const pct = Math.min(100, (total / cap) * 100);
  const state = win.state ?? (pct >= 90 ? "error" : pct >= 70 ? "warn" : "ok");
  const col = state === "error" ? "var(--error)" : state === "warn" ? "var(--warn)" : "var(--ok)";
  const R = 56;
  const circ = 2 * Math.PI * R;
  const off = circ * (1 - pct / 100);
  return (
    <div className="edu-readout-body">
      <div className="donut donut--big">
        <svg width="148" height="148" viewBox="0 0 148 148">
          <circle cx="74" cy="74" r={R} fill="none" stroke="var(--surface-3)" strokeWidth="16" />
          <circle
            cx="74"
            cy="74"
            r={R}
            fill="none"
            stroke={col}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={off}
            transform="rotate(-90 74 74)"
            style={{ transition: "stroke-dashoffset 0.5s var(--ease-out), stroke 0.3s" }}
          />
          <text x="74" y="70" textAnchor="middle" className="donut-pct">{Math.round(pct)}%</text>
          <text x="74" y="90" textAnchor="middle" className="donut-sub">{fmt(total)} tok</text>
        </svg>
        <div className="dv">
          <small>
            {fmt(total)} / {Math.round(cap / 1000)}k tok
          </small>
        </div>
      </div>
      <div className="legend">
        {(lesson.segs ?? []).map((sg) => {
          const v = tok[sg.id] ?? 0;
          if (v <= 0) return null;
          return (
            <div key={sg.id} className="lr">
              <span className="lm" style={{ background: evVar(sg.ev) }} />
              {ll(sg.label, de)}
              <span className="lt">{v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}</span>
            </div>
          );
        })}
      </div>
      {state === "error" && (
        <div className="readout-note" style={{ color: "var(--error)" }}>
          {de ? "nahe der kappe: context rot, qualität sinkt." : "near the cap: context rot, quality drops."}
        </div>
      )}
    </div>
  );
}
