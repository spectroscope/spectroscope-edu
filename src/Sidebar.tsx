// The app's own sidebar: a clickable brand mark (returns to the home landing),
// the edu | simulator segment switch, a context list (scenarios in simulator, the
// lessons in edu), and a footer with the shared theme + language toggles. A FRESH
// component — it does not import spectro-web's Sidebar. Everything here is local
// state + the lifted/edu stores.

import { SCENARIOS } from "./scenario/registry";
import { loc } from "./scenario/dsl";
import { useLang } from "./state/lang";
import { useDesignPrefs } from "./state/designPrefs";
import { ThemeLangControls } from "./ThemeLangControls";
import { LESSONS, PLANNED, type Loc } from "./edu/lessons";
import { useEduProgress } from "./edu/eduStore";
import type { Nav } from "./App";

export function Sidebar(props: {
  nav: Nav;
  onNav: (n: Nav) => void;
  onHome: () => void;
  scenarioId: string;
  onSelectScenario: (id: string) => void;
  eduLessonId: string;
  onSelectLesson: (id: string) => void;
}) {
  const lang = useLang();
  const { prefs } = useDesignPrefs();
  const progress = useEduProgress();
  const dark = prefs.design === "spectroscope";
  const mark = dark ? "/brand/logo-icon.svg" : "/brand/logo-icon-light.svg";
  const llt = (v: Loc): string => (typeof v === "string" ? v : lang === "de" ? v.de ?? v.en : v.en);

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
            {LESSONS.map((l, i) => {
              const on = l.id === props.eduLessonId;
              const done = !!progress.completed[l.id];
              return (
                <button
                  key={l.id}
                  type="button"
                  className={`edu-row${on ? " edu-row--on" : ""}`}
                  onClick={() => props.onSelectLesson(l.id)}
                >
                  <span className={`dot ${done ? "ok" : on ? "accent" : "faint"}`} />
                  <span className="edu-row-body">
                    <span className="edu-row-title">{llt(l.title)}</span>
                    <span className="edu-row-meta">
                      {done ? (lang === "de" ? "abgeschlossen" : "complete") : (lang === "de" ? "lektion " : "lesson ") + (i + 1)}
                      {" · "}
                      {l.difficulty}
                    </span>
                  </span>
                </button>
              );
            })}
            {PLANNED.map((p, i) => (
              <div key={`p${i}`} className="edu-row edu-row--soon">
                <span className="dot faint" />
                <span className="edu-row-body">
                  <span className="edu-row-title">{llt(p.title)}</span>
                </span>
                <span className="edu-soon-chip">{lang === "de" ? "geplant" : "planned"}</span>
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
