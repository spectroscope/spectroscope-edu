// The home landing — a small dev-portal-style start screen the app opens on.
// Explains what edu is and lets you enter the simulator or the lessons. No
// backend, theme-aware, tokens only; color lives only on the spectral card
// ticks. Copy is bilingual and lowercase, per the house voice.

import { useLang } from "./state/lang";
import { useDesignPrefs } from "./state/designPrefs";
import { ThemeLangControls } from "./ThemeLangControls";
import { SimGuide } from "./SimGuide";
import { EduGuide } from "./EduGuide";
import { ICON, type IconName } from "./Keymap";
import type { Nav } from "./App";

type Loc = { en: string; de: string };
const t = (v: Loc, lang: "en" | "de") => v[lang];

// A game-style teaser of the keymap, right on the landing: each chip pairs a
// physical keycap with the same infographic icon the full ? overlay uses. The
// whole card opens the overlay — the shortcuts are discoverable, not buried.
const KEYMAP_TEASER: { keys: string[]; icon: IconName; label: Loc }[] = [
  { keys: ["→"], icon: "step", label: { en: "step", de: "schritt" } },
  { keys: ["←"], icon: "back", label: { en: "back", de: "zurück" } },
  { keys: ["space"], icon: "play", label: { en: "play", de: "abspielen" } },
  { keys: ["j"], icon: "jsonl", label: { en: "jsonl", de: "jsonl" } },
  { keys: ["t"], icon: "trace", label: { en: "trace", de: "trace" } },
  { keys: ["m"], icon: "flip", label: { en: "local / remote", de: "lokal / remote" } },
  { keys: ["h"], icon: "home", label: { en: "home", de: "start" } },
  { keys: ["?"], icon: "keys", label: { en: "all keys", de: "alle tasten" } },
];

interface Feature {
  tick: string; // a spectral event color var — color only on the marks
  title: Loc;
  body: Loc;
}

const FEATURES: Feature[] = [
  {
    tick: "var(--ev-tool)",
    title: { en: "backend-free simulator", de: "backend-freier simulator" },
    body: {
      en: "watch a scripted agent run on a live system map: the loop, the permission gate, tools, the os band, a local or remote llm, parallel subagents. step it, play it, scrub back.",
      de: "sieh einem gescripteten agenten-lauf auf einer lebenden system-map zu: die schleife, das permission-gate, tools, das os-band, ein lokales oder remotes llm, parallele subagenten. schrittweise, abspielen, zurückspulen.",
    },
  },
  {
    tick: "var(--ev-token)",
    title: { en: "trace + jsonl, side by side", de: "trace + jsonl, nebeneinander" },
    body: {
      en: "open the side panels to read the same run two more ways: the raw jsonl event stream and the causal trace. both step in lockstep with the map.",
      de: "öffne die seiten-panels und lies denselben lauf auf zwei weitere arten: den rohen jsonl-event-strom und den kausalen trace. beide laufen im gleichschritt mit der map.",
    },
  },
  {
    tick: "var(--ev-subagent)",
    title: { en: "the provider flip", de: "der provider-flip" },
    body: {
      en: "flip the model from local to remote and watch the llm card cross the network boundary. same run, honest topology.",
      de: "schalte das modell von lokal auf remote und sieh die llm-karte die netzgrenze überqueren. gleicher lauf, ehrliche topologie.",
    },
  },
  {
    tick: "var(--ev-reasoning)",
    title: { en: "seven lessons", de: "sieben lektionen" },
    body: {
      en: "short, interactive lessons that build an agent up part by part: the context window, the loop, the gate, orchestrated fan-out. native canvases are on the way.",
      de: "kurze, interaktive lektionen, die einen agenten teil für teil aufbauen: das kontextfenster, die schleife, das gate, orchestriertes fan-out. native canvases sind unterwegs.",
    },
  },
  {
    tick: "var(--ev-gate)",
    title: { en: "runs from static files", de: "läuft aus statischen dateien" },
    body: {
      en: "three brand themes, english or german, and no server anywhere. it all runs from static files, local-first, like the product itself.",
      de: "drei marken-themes, englisch oder deutsch, und nirgends ein server. alles läuft aus statischen dateien, local-first, wie das produkt selbst.",
    },
  },
];

export function EduHome(props: { onEnter: (view: Nav) => void; onOpenKeymap: () => void }) {
  const lang = useLang();
  const { prefs } = useDesignPrefs();
  const dark = prefs.design === "spectroscope";
  const mark = dark ? "/brand/logo-icon.svg" : "/brand/logo-icon-light.svg";

  return (
    <div className="edu-home">
      <nav className="edu-home-nav">
        <span className="edu-home-brand">
          <img className="edu-brand-mark" src={mark} alt="" />
          <span className="edu-brand-name">spectroscope</span>
          <span className="edu-brand-sub">edu</span>
        </span>
        <a className="edu-home-mainlink" href="https://spectroscope.ai/">
          {t({ en: "main site", de: "hauptseite" }, lang)} &#8599;
        </a>
        <div className="edu-home-controls">
          <ThemeLangControls />
          <button
            type="button"
            className="sim-keys"
            onClick={props.onOpenKeymap}
            title={lang === "de" ? "Tastaturkürzel (? oder ß)" : "keyboard shortcuts (? or ß)"}
            aria-label={lang === "de" ? "Tastaturkürzel" : "keyboard shortcuts"}
          >
            ?
          </button>
        </div>
      </nav>

      <div className="edu-home-wrap">
        <header className="edu-home-hero">
          <div className="edu-hero-brand">
            <img className="edu-hero-mark" src={mark} alt="" />
            <span className="edu-hero-name">spectroscope</span>
            <span className="edu-hero-sub">edu</span>
          </div>
          <p className="eyebrow sand">{t({ en: "the edu portal · learn what you're watching", de: "das edu-portal · verstehe, was du beobachtest" }, lang)}</p>
          <h1>{t({ en: "how an agent actually works", de: "wie ein agent wirklich arbeitet" }, lang)}</h1>
          <p className="edu-home-lede">
            {t(
              {
                en: "this is the edu portal, the teaching companion to spectroscope, the agent orchestrator you can watch. here you learn what the lines mean: step through a scripted agent run with no backend, or work through the lessons. nothing to install.",
                de: "das ist das edu-portal, der lern-begleiter zu spectroscope, dem agent-orchestrator, den man beobachten kann. hier lernst du, was die linien bedeuten: geh einen gescripteten agenten-lauf ohne backend durch oder arbeite die lektionen durch. nichts zu installieren.",
              },
              lang,
            )}
          </p>
        </header>

        {/* the two previews ARE the calls to action — each carries a click arrow */}
        <div className="edu-home-guides">
          <SimGuide onEnter={props.onEnter} />
          <EduGuide onEnter={props.onEnter} />
        </div>

        <section className="edu-home-keymap" aria-label={t({ en: "keyboard shortcuts", de: "tastenbelegung" }, lang)}>
          <button
            type="button"
            className="km-card"
            onClick={props.onOpenKeymap}
            title={t({ en: "open the full keymap (?)", de: "volle keymap öffnen (?)" }, lang)}
          >
            <span className="km-card-head">
              <span className="km-card-title">
                <span className="km-card-ico">{ICON.keys}</span>
                {t({ en: "keyboard shortcuts", de: "tastenbelegung" }, lang)}
              </span>
              <span className="km-card-hint">{t({ en: "press ? anytime", de: "drück ? jederzeit" }, lang)}</span>
            </span>
            <span className="km-card-grid">
              {KEYMAP_TEASER.map((r) => (
                <span key={r.label.en} className="km-chip">
                  <span className="km-chip-ico">{ICON[r.icon]}</span>
                  <span className="km-chip-keys">
                    {r.keys.map((k, i) => (
                      <kbd key={i} className="km-key">{k}</kbd>
                    ))}
                  </span>
                  <span className="km-chip-label">{t(r.label, lang)}</span>
                </span>
              ))}
            </span>
          </button>
        </section>

        <section className="edu-home-features" aria-label={t({ en: "features", de: "features" }, lang)}>
          {FEATURES.map((f) => (
            <article key={f.title.en} className="edu-home-card">
              <h2>
                <i style={{ background: f.tick }} aria-hidden="true" />
                {t(f.title, lang)}
              </h2>
              <p>{t(f.body, lang)}</p>
            </article>
          ))}
        </section>

        <footer className="edu-home-foot">
          {t(
            {
              en: "a teaching companion to spectroscope. open source, mit, local-first.",
              de: "ein lern-begleiter zu spectroscope. open source, mit, local-first.",
            },
            lang,
          )}
        </footer>
      </div>
    </div>
  );
}
