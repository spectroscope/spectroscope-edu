// The app's own sidebar: a clickable brand mark (returns to the home landing),
// the edu | simulator segment switch, a context list (scenarios in simulator, a
// preview of the lessons in edu), and a footer with the shared theme + language
// toggles. A FRESH component — it does not import spectro-web's Sidebar (the
// product's Fleet Manager work is rewriting that one). Backend-free: everything
// here is local state + the lifted stores.

import { SCENARIOS } from "./scenario/registry";
import { loc, type Localized } from "./scenario/dsl";
import { useLang } from "./state/lang";
import { useDesignPrefs } from "./state/designPrefs";
import { ThemeLangControls } from "./ThemeLangControls";
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

export function Sidebar(props: {
  nav: Nav;
  onNav: (n: Nav) => void;
  onHome: () => void;
  scenarioId: string;
  onSelectScenario: (id: string) => void;
}) {
  const lang = useLang();
  const { prefs } = useDesignPrefs();
  const dark = prefs.design === "spectroscope";
  const mark = dark ? "/brand/logo-icon.svg" : "/brand/logo-icon-light.svg";

  return (
    <nav className="edu-sidebar" aria-label="spectroscope edu">
      <button
        type="button"
        className="edu-brand"
        onClick={props.onHome}
        title={lang === "de" ? "zur Startseite" : "back to home"}
      >
        <img className="edu-brand-mark" src={mark} alt="" />
        <span className="edu-brand-name">spectroscope</span>
        <span className="edu-brand-sub">edu</span>
      </button>

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
        <ThemeLangControls />
      </div>
    </nav>
  );
}
