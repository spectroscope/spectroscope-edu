// A hand-authored, theme-aware SVG of the simulator console — a clickable
// preview on the home landing that drops you straight into the simulator to
// steer it. Inline (not a static file) so every fill reads a token and it
// adapts to the [data-design] theme; color lives ONLY on the spectral marks.

import { useLang } from "./state/lang";
import type { Nav } from "./App";

// the five event colors, as the jsonl "stream" on the left rail
const STREAM = ["--ev-lifecycle", "--ev-token", "--ev-tool", "--ev-gate", "--ev-reasoning", "--ev-subagent"];

export function SimGuide(props: { onEnter: (view: Nav) => void }) {
  const lang = useLang();
  return (
    <button type="button" className="edu-home-sim" onClick={() => props.onEnter("simulator")}>
      <svg className="edu-home-sim-svg" viewBox="0 0 760 300" role="img" aria-hidden="true">
        {/* window frame */}
        <rect x="1" y="1" width="758" height="298" rx="16" fill="var(--surface)" stroke="var(--border)" />

        {/* ---- left rail: jsonl (the colored event stream) ---- */}
        <line x1="46" y1="1" x2="46" y2="299" stroke="var(--border)" />
        <text className="sg-rail" x="23" y="150" transform="rotate(-90 23 150)">jsonl</text>
        {STREAM.map((c, i) => (
          <rect key={c} x="14" y={196 + i * 12} width="18" height="4" rx="1" fill={`var(${c})`} />
        ))}

        {/* ---- right rail: trace ---- */}
        <line x1="714" y1="1" x2="714" y2="299" stroke="var(--border)" />
        <text className="sg-rail" x="737" y="150" transform="rotate(90 737 150)">trace</text>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x="728" y={116 + i * 14} width="18" height="4" rx="1" fill="var(--border-strong)" />
        ))}

        {/* ---- transport bar ---- */}
        <rect x="64" y="18" width="28" height="26" rx="7" fill="none" stroke="var(--border-strong)" />
        <text className="sg-glyph" x="78" y="36">‹</text>
        <rect x="98" y="18" width="82" height="26" rx="7" fill="var(--accent-soft)" stroke="var(--accent-glow)" />
        <text className="sg-btn" x="112" y="35">step</text>
        <text className="sg-btn" x="164" y="35" fill="var(--accent)">▸</text>
        <text className="sg-lbl" x="196" y="35">flow</text>
        <rect x="228" y="26" width="26" height="12" rx="6" fill="var(--surface-3)" stroke="var(--border-strong)" />
        <circle cx="235" cy="32" r="4" fill="var(--text-faint)" />
        <text className="sg-count" x="700" y="35" textAnchor="end">26 ▸</text>

        {/* ---- map ---- */}
        <text className="sg-eyebrow" x="72" y="76">◆ agent system · your mac</text>

        {/* active rail agent -> llm, with the coral packet */}
        <path d="M320 150 C 400 150, 470 150, 540 150" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
        <circle cx="408" cy="150" r="9" fill="var(--accent)" opacity="0.28" />
        <circle cx="408" cy="150" r="4.5" fill="var(--accent)" />

        {/* links agent -> os band */}
        <path d="M200 214 C 200 236, 210 240, 236 250" fill="none" stroke="var(--border-strong)" />
        <path d="M250 214 C 250 236, 300 244, 320 250" fill="none" stroke="var(--border-strong)" />

        {/* agent card (active = amber outline) */}
        <rect x="120" y="90" width="200" height="124" rx="12" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.4" />
        <rect x="132" y="104" width="3" height="16" rx="1.5" fill="var(--ev-tool)" />
        <text className="sg-node" x="144" y="117">agent</text>
        <circle cx="306" cy="112" r="3" fill="var(--ok)" />
        <rect x="132" y="130" width="176" height="20" rx="6" fill="none" stroke="var(--border)" />
        <text className="sg-sub" x="140" y="143">loop · plans · calls tools · reads results</text>
        <rect x="132" y="156" width="176" height="20" rx="6" fill="none" stroke="var(--border)" />
        <rect x="140" y="162" width="7" height="8" rx="1.5" fill="none" stroke="var(--text-dim)" />
        <text className="sg-sub" x="152" y="169">permission gate</text>
        {["read", "write", "list", "run"].map((t, i) => (
          <g key={t}>
            <rect x={132 + i * 44} y="184" width="40" height="18" rx="5" fill="none" stroke="var(--border)" />
            <text className="sg-cell" x={132 + i * 44 + 20} y="196" textAnchor="middle">{t}</text>
          </g>
        ))}

        {/* subagent card (a worker forked off) */}
        <rect x="332" y="104" width="96" height="52" rx="8" fill="var(--surface)" stroke="var(--border-strong)" strokeDasharray="3 3" />
        <rect x="342" y="116" width="3" height="12" rx="1.5" fill="var(--ev-subagent)" />
        <text className="sg-node sg-node--sm" x="352" y="126">worker-1</text>
        <text className="sg-cell" x="342" y="144">plans · writes</text>

        {/* llm card */}
        <rect x="540" y="104" width="150" height="92" rx="12" fill="var(--surface-2)" stroke="var(--border)" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x={556 + i * 11} y="118" width="2.4" height={i % 2 ? 14 : 9} rx="1" fill="var(--text-faint)" />
        ))}
        <text className="sg-node" x="615" y="162" textAnchor="middle">llm</text>
        <text className="sg-cell" x="615" y="178" textAnchor="middle">qwen · local</text>

        {/* os band */}
        <text className="sg-eyebrow" x="132" y="238">◆ operating system</text>
        <rect x="120" y="246" width="300" height="42" rx="10" fill="var(--surface-2)" stroke="var(--border)" />
        {/* disk */}
        <circle cx="152" cy="267" r="10" fill="none" stroke="var(--border-strong)" />
        <circle cx="152" cy="267" r="2" fill="var(--border-strong)" />
        <line x1="152" y1="267" x2="160" y2="261" stroke="var(--border-strong)" />
        <text className="sg-cell" x="170" y="270">disk</text>
        {/* shell */}
        <text className="sg-glyph" x="240" y="272">›_</text>
        <text className="sg-cell" x="262" y="270">shell</text>
        {/* net */}
        <circle cx="344" cy="267" r="9" fill="none" stroke="var(--border-strong)" />
        <line x1="335" y1="267" x2="353" y2="267" stroke="var(--border-strong)" />
        <path d="M344 258 C 349 262, 349 272, 344 276 C 339 272, 339 262, 344 258" fill="none" stroke="var(--border-strong)" />
        <text className="sg-cell" x="360" y="270">net</text>
      </svg>

      <span className="edu-home-sim-cap">
        <span className="edu-home-sim-play" aria-hidden="true">▸</span>
        <span>
          <strong>{lang === "de" ? "der simulator" : "the simulator"}</strong>
          {lang === "de"
            ? " — steuere einen gescripteten agenten-lauf: schritt, abspielen, zurück. klick öffnet ihn."
            : " — steer a scripted agent run: step, play, back. click to open it."}
        </span>
      </span>
    </button>
  );
}
