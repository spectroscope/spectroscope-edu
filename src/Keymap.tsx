// The keymap overlay — a small modal that lists the keyboard shortcuts. Opened
// with `?` (or the ? button in the simulator header), closed with Esc, the ×,
// or a click on the backdrop. Bilingual, tokens only.

import { useLang } from "./state/lang";

type Loc = { en: string; de: string };
interface Row {
  keys: string[];
  label: Loc;
}
interface Group {
  title: Loc;
  rows: Row[];
}

const GROUPS: Group[] = [
  {
    title: { en: "navigation", de: "navigation" },
    rows: [
      { keys: ["h"], label: { en: "home", de: "startseite" } },
      { keys: ["←", "back"], label: { en: "browser back: one view back", de: "zurück-taste: eine ansicht zurück" } },
      { keys: ["?"], label: { en: "toggle this keymap", de: "diese keymap ein/aus" } },
      { keys: ["esc"], label: { en: "close", de: "schließen" } },
    ],
  },
  {
    title: { en: "simulator", de: "simulator" },
    rows: [
      { keys: ["space", "→"], label: { en: "step forward", de: "schritt vor" } },
      { keys: ["←"], label: { en: "step back", de: "schritt zurück" } },
      { keys: ["f"], label: { en: "toggle flow (auto-play)", de: "flow (auto-play) ein/aus" } },
      { keys: ["r"], label: { en: "reset to step 0", de: "zurück auf schritt 0" } },
      { keys: ["j"], label: { en: "toggle the jsonl panel", de: "jsonl-panel ein/aus" } },
      { keys: ["t"], label: { en: "toggle the trace panel", de: "trace-panel ein/aus" } },
      { keys: ["m"], label: { en: "flip the model local / remote", de: "modell lokal / remote" } },
    ],
  },
];

export function Keymap(props: { open: boolean; onClose: () => void }) {
  const lang = useLang();
  if (!props.open) return null;
  return (
    <div className="km-backdrop" onClick={props.onClose} role="presentation">
      <div
        className="km-panel"
        role="dialog"
        aria-modal="true"
        aria-label={lang === "de" ? "Tastaturkürzel" : "keyboard shortcuts"}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="km-head">
          <span className="eyebrow sand">{lang === "de" ? "keymap" : "keymap"}</span>
          <button type="button" className="km-close" onClick={props.onClose} aria-label={lang === "de" ? "schließen" : "close"}>
            ×
          </button>
        </div>
        <div className="km-groups">
          {GROUPS.map((g) => (
            <div key={g.title.en} className="km-group">
              <p className="km-group-title">{g.title[lang]}</p>
              <ul className="km-rows">
                {g.rows.map((r) => (
                  <li key={r.label.en} className="km-row">
                    <span className="km-keys">
                      {r.keys.map((k, i) => (
                        <kbd key={i} className="km-key">{k}</kbd>
                      ))}
                    </span>
                    <span className="km-label">{r.label[lang]}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="km-foot">
          {lang === "de"
            ? "kürzel gelten nicht, während du in ein feld tippst."
            : "shortcuts pause while you type in a field."}
        </p>
      </div>
    </div>
  );
}
