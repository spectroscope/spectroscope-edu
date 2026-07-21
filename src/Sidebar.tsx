// The app's own sidebar: brand mark, the edu | simulator segment switch, a
// context list (scenarios in simulator, a preview of the lessons in edu), and a
// footer with the theme + language toggles. A FRESH component — it does not
// import spectro-web's Sidebar (the product's Fleet Manager work is rewriting
// that one). Backend-free: everything here is local state + the lifted stores.

import { SCENARIOS } from "./scenario/registry";
import { loc, type Localized } from "./scenario/dsl";
import { setLang, useLang } from "./state/lang";
import { applyAndSaveDesign, useDesignPrefs } from "./state/designPrefs";
import type { DesignId } from "./state/designPrefs";
import type { Nav } from "./App";

// The seven lessons (native React-Flow port lands in P2). Shown here as a
// preview so the shell reads honestly before the lessons exist.
const LESSON_TITLES: Localized[] = [
  { en: "anatomy of an agent", de: "aufbau eines agenten" },
  { en: "inside the context window", de: "im kontextfenster" },
  { en: "one turn through the machine", de: "eine runde durch die maschine" },
  { en: "the gate decides", de: "das gate entscheidet" },
  { en: "the four moves on the window", de: "die vier züge am fenster" },
  { en: "thin until it matches", de: "dünn bis es passt" },
  { en: "serial vs. orchestrated", de: "seriell vs. orchestriert" },
];

const THEMES: { id: DesignId; label: string }[] = [
  { id: "spectroscope", label: "spectroscope" },
  { id: "paper", label: "paper" },
];

export function Sidebar(props: {
  nav: Nav;
  onNav: (n: Nav) => void;
  scenarioId: string;
  onSelectScenario: (id: string) => void;
}) {
  const lang = useLang();
  const { prefs } = useDesignPrefs();
  const dark = prefs.design === "spectroscope";
  const mark = dark ? "/brand/logo-icon.svg" : "/brand/logo-icon-light.svg";

  return (
    <nav className="edu-sidebar" aria-label="spectroscope edu">
      <div className="edu-brand">
        <img className="edu-brand-mark" src={mark} alt="" />
        <span className="edu-brand-name">spectroscope</span>
        <span className="edu-brand-sub">edu</span>
      </div>

      <div className="edu-seg" role="tablist" aria-label={lang === "de" ? "Bereich" : "section"}>
        {(["edu", "simulator"] as const).map((seg) => (
          <button
            key={seg}
            type="button"
            role="tab"
            aria-selected={props.nav === seg}
            className={`edu-seg-btn${props.nav === seg ? " edu-seg-btn--on" : ""}`}
            onClick={() => props.onNav(seg)}
          >
            {seg}
          </button>
        ))}
      </div>

      {props.nav === "simulator" ? (
        <>
          <p className="edu-list-label eyebrow">{lang === "de" ? "Szenarien" : "scenarios"}</p>
          <div className="edu-list">
            {SCENARIOS.map((s) => {
              const on = s.id === props.scenarioId;
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`edu-row${on ? " edu-row--on" : ""}`}
                  onClick={() => props.onSelectScenario(s.id)}
                >
                  <span className={`dot ${on ? "accent" : "faint"}`} />
                  <span className="edu-row-body">
                    <span className="edu-row-title">{loc(s.name, lang)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <p className="edu-list-label eyebrow">{lang === "de" ? "Lektionen" : "lessons"}</p>
          <div className="edu-list">
            {LESSON_TITLES.map((title, i) => (
              <div key={i} className="edu-row edu-row--soon">
                <span className="dot faint" />
                <span className="edu-row-body">
                  <span className="edu-row-title">{loc(title, lang)}</span>
                </span>
                <span className="edu-soon-chip">{lang === "de" ? "bald" : "soon"}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="edu-foot">
        <div className="edu-toggle" role="group" aria-label={lang === "de" ? "Design" : "theme"}>
          {THEMES.map((th) => (
            <button
              key={th.id}
              type="button"
              className={`edu-toggle-opt${prefs.design === th.id ? " edu-toggle-opt--on" : ""}`}
              onClick={() => applyAndSaveDesign({ design: th.id })}
            >
              {th.label}
            </button>
          ))}
        </div>
        <span className="edu-foot-spacer" />
        <div className="edu-toggle" role="group" aria-label="language">
          {(["en", "de"] as const).map((lg) => (
            <button
              key={lg}
              type="button"
              className={`edu-toggle-opt${lang === lg ? " edu-toggle-opt--on" : ""}`}
              onClick={() => setLang(lg)}
            >
              {lg}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
