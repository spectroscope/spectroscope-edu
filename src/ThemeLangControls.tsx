// The theme + language toggles, shared by the sidebar footer and the home nav
// so there is one source for both. Three brand themes (spectroscope | paper |
// white), english | german. Reads the lifted stores directly.

import { setLang, useLang } from "./state/lang";
import { applyAndSaveDesign, useDesignPrefs } from "./state/designPrefs";
import type { DesignId } from "./state/designPrefs";

const THEMES: { id: DesignId; label: string }[] = [
  { id: "spectroscope", label: "spectroscope" },
  { id: "paper", label: "paper" },
  { id: "still", label: "white" },
];

export function ThemeLangControls() {
  const lang = useLang();
  const { prefs } = useDesignPrefs();
  return (
    <>
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
    </>
  );
}
