// A hand-authored, theme-aware SVG of the simulator console — a clickable
// preview on the home landing that drops you into the simulator to steer it.
// Compact (it sits side by side with the edu guide); inline so every fill reads a
// token and adapts to the [data-design] theme. Color lives ONLY on spectral marks.

import { useLang } from "./state/lang";
import type { Nav } from "./App";

const TOOLS = ["read", "write", "run"];

export function SimGuide(props: { onEnter: (view: Nav) => void }) {
  const lang = useLang();
  return (
    <button type="button" className="edu-home-sim" onClick={() => props.onEnter("simulator")}>
      <svg className="edu-home-sim-svg" viewBox="0 0 400 248" role="img" aria-hidden="true">
        <rect x="1" y="1" width="398" height="246" rx="14" fill="var(--surface)" stroke="var(--border)" />

        {/* ---- the "now" band over the map ---- */}
        <rect x="20" y="16" width="360" height="26" rx="8" fill="var(--surface-2)" stroke="var(--border)" />
        <circle cx="36" cy="29" r="3.5" fill="var(--accent)" />
        <text className="sg-lbl" x="48" y="33">{lang === "de" ? "das modell denkt" : "the model is thinking"}</text>

        <text className="sg-eyebrow" x="22" y="64">◆ {lang === "de" ? "agentensystem" : "agent system"}</text>

        {/* active rail agent -> llm, with the coral packet */}
        <path d="M172 118 C 210 118, 242 118, 268 118" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
        <circle cx="216" cy="118" r="8" fill="var(--accent)" opacity="0.26" />
        <circle cx="216" cy="118" r="4" fill="var(--accent)" />

        {/* agent card (active = accent outline) */}
        <rect x="22" y="74" width="150" height="92" rx="11" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.3" />
        <rect x="34" y="86" width="3" height="13" rx="1.5" fill="var(--ev-tool)" />
        <text className="sg-node" x="46" y="97">agent</text>
        <circle cx="158" cy="90" r="3" fill="var(--ok)" />
        <rect x="34" y="106" width="126" height="17" rx="5" fill="none" stroke="var(--border)" />
        <text className="sg-sub" x="41" y="118">loop · plans · runs</text>
        <rect x="34" y="127" width="126" height="17" rx="5" fill="none" stroke="var(--border)" />
        <rect x="41" y="132" width="7" height="7" rx="1.5" fill="none" stroke="var(--text-dim)" />
        <text className="sg-sub" x="53" y="139">permission gate</text>
        {TOOLS.map((t, i) => (
          <g key={t}>
            <rect x={34 + i * 43} y="148" width="39" height="15" rx="4" fill="none" stroke="var(--border)" />
            <text className="sg-cell" x={34 + i * 43 + 19.5} y="159" textAnchor="middle">{t}</text>
          </g>
        ))}

        {/* llm card — clean streaming lines, not a barcode; remote is the default */}
        <rect x="268" y="80" width="112" height="78" rx="11" fill="var(--surface-2)" stroke="var(--border)" />
        <rect x="282" y="98" width="44" height="3" rx="1.5" fill="var(--text-faint)" />
        <rect x="282" y="106" width="30" height="3" rx="1.5" fill="var(--text-faint)" />
        <rect x="282" y="114" width="38" height="3" rx="1.5" fill="var(--text-faint)" />
        <text className="sg-node" x="324" y="137" textAnchor="middle">llm</text>
        <text className="sg-cell" x="324" y="150" textAnchor="middle">claude · remote</text>

        {/* os band (no net) */}
        <text className="sg-eyebrow" x="22" y="188">◆ {lang === "de" ? "betriebssystem" : "operating system"}</text>
        <rect x="22" y="196" width="238" height="40" rx="10" fill="var(--surface-2)" stroke="var(--border)" />
        {/* disk */}
        <circle cx="52" cy="216" r="9" fill="none" stroke="var(--border-strong)" />
        <circle cx="52" cy="216" r="2" fill="var(--border-strong)" />
        <line x1="52" y1="216" x2="59" y2="210" stroke="var(--border-strong)" />
        <text className="sg-cell" x="70" y="219">disk</text>
        {/* shell */}
        <text className="sg-glyph" x="128" y="221">›_</text>
        <text className="sg-cell" x="150" y="219">shell</text>
        {/* mcp-client (a small server grid) */}
        <rect x="204" y="208" width="16" height="16" rx="2" fill="none" stroke="var(--border-strong)" />
        <line x1="204" y1="213" x2="220" y2="213" stroke="var(--border-strong)" />
        <line x1="204" y1="218" x2="220" y2="218" stroke="var(--border-strong)" />
        <text className="sg-cell" x="228" y="219">mcp</text>
      </svg>

      <span className="edu-home-sim-cap">
        <span className="edu-home-sim-title">
          <span className="edu-home-sim-play" aria-hidden="true">▸</span>
          <strong>{lang === "de" ? "der simulator" : "the simulator"}</strong>
        </span>
        <span className="edu-home-sim-desc">
          {lang === "de"
            ? "steuere einen gescripteten agenten-lauf: schritt, abspielen, zurückspulen. klick öffnet ihn."
            : "steer a scripted agent run: step, play, scrub back. click to open it."}
        </span>
      </span>
    </button>
  );
}
