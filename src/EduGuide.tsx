// A hand-authored, theme-aware SVG of an edu lesson — the sibling of SimGuide on
// the home landing, clickable into the lessons. Shows the signature interactive
// visual (the context-window ring + the segment readout a learner scrubs). Color
// lives ONLY on the spectral marks; text is neutral, tokens only.

import { useLang } from "./state/lang";
import type { Nav } from "./App";

// the context window's segments, as the little readout beside the ring
const SEGMENTS: { c: string; w: number }[] = [
  { c: "--ev-lifecycle", w: 34 }, // system prompt
  { c: "--ev-tool", w: 52 }, // tool defs
  { c: "--ev-token", w: 96 }, // history (the one that grows)
  { c: "--ev-reasoning", w: 40 }, // your turn
];

// a 58%-filled ring: circumference = 2·π·46 ≈ 289, so 58% ≈ 168
const R = 46;
const CIRC = 2 * Math.PI * R;
const FILL = Math.round(CIRC * 0.58);

export function EduGuide(props: { onEnter: (view: Nav) => void }) {
  const lang = useLang();
  return (
    <button type="button" className="edu-home-sim" onClick={() => props.onEnter("edu")}>
      <svg className="edu-home-sim-svg" viewBox="0 0 400 248" role="img" aria-hidden="true">
        <rect x="1" y="1" width="398" height="246" rx="14" fill="var(--surface)" stroke="var(--border)" />

        {/* ---- the "now" band, matching the simulator ---- */}
        <rect x="20" y="16" width="360" height="26" rx="8" fill="var(--surface-2)" stroke="var(--border)" />
        <circle cx="36" cy="29" r="3.5" fill="var(--accent)" />
        <text className="sg-lbl" x="48" y="33">{lang === "de" ? "das fenster füllt sich" : "the window is filling"}</text>

        <text className="sg-eyebrow" x="22" y="64">◆ {lang === "de" ? "lektion · kontextfenster" : "lesson · context window"}</text>

        {/* the big context ring */}
        <circle cx="98" cy="150" r={R} fill="none" stroke="var(--border-strong)" strokeWidth="13" />
        <circle
          cx="98"
          cy="150"
          r={R}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={`${FILL} ${CIRC}`}
          transform="rotate(-90 98 150)"
        />
        <text className="sg-donut-pct" x="98" y="150" textAnchor="middle">58%</text>
        <text className="sg-cell" x="98" y="167" textAnchor="middle">18k / 32k</text>

        {/* the segment readout beside it */}
        <text className="sg-eyebrow" x="196" y="100">{lang === "de" ? "kontext an das llm" : "context to the llm"}</text>
        {SEGMENTS.map((s, i) => (
          <g key={i}>
            <rect x="196" y={112 + i * 20} width="8" height="8" rx="2" fill={`var(${s.c})`} />
            <rect x="212" y={113 + i * 20} width="150" height="6" rx="3" fill="var(--surface-3)" />
            <rect x="212" y={113 + i * 20} width={s.w} height="6" rx="3" fill="var(--text-faint)" />
          </g>
        ))}

        {/* a mini scrub, matching the simulator's transport */}
        <line x1="22" y1="222" x2="332" y2="222" stroke="var(--surface-3)" strokeWidth="4" strokeLinecap="round" />
        <line x1="22" y1="222" x2="200" y2="222" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="200" cy="222" r="6" fill="var(--accent)" />
        <text className="sg-count" x="378" y="226" textAnchor="end">5 / 7</text>
      </svg>

      <span className="edu-home-sim-cap">
        <span className="edu-home-sim-title">
          <span className="edu-home-sim-play" aria-hidden="true">▸</span>
          <strong>{lang === "de" ? "die lektionen" : "the lessons"}</strong>
        </span>
        <span className="edu-home-sim-desc">
          {lang === "de"
            ? "bau einen agenten teil für teil auf, interaktiv: kontextfenster, schleife, gate, fan-out. klick öffnet edu."
            : "build an agent up part by part, interactive: the context window, the loop, the gate, fan-out. click to open edu."}
        </span>
      </span>
    </button>
  );
}
