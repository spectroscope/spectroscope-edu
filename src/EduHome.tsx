// The home landing — a small dev-portal-style start screen the app opens on.
// Explains what edu is and lets you enter the simulator or the lessons. No
// backend, theme-aware, tokens only; color lives only on the spectral card
// ticks. Copy is bilingual and lowercase, per the house voice.

import { useLang } from "./state/lang";
import { useDesignPrefs } from "./state/designPrefs";
import { ThemeLangControls } from "./ThemeLangControls";
import { SimGuide } from "./SimGuide";
import type { Nav } from "./App";

type Loc = { en: string; de: string };
const t = (v: Loc, lang: "en" | "de") => v[lang];

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

export function EduHome(props: { onEnter: (view: Nav) => void }) {
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
        <div className="edu-home-controls">
          <ThemeLangControls />
        </div>
      </nav>

      <div className="edu-home-wrap">
        <header className="edu-home-hero">
          <p className="eyebrow sand">{t({ en: "learn what you're watching", de: "verstehe, was du beobachtest" }, lang)}</p>
          <h1>{t({ en: "how an agent actually works", de: "wie ein agent wirklich arbeitet" }, lang)}</h1>
          <p className="edu-home-lede">
            {t(
              {
                en: "spectroscope is the agent orchestrator you can watch. this is where you learn what the lines mean. step through a scripted agent run with no backend, or work through the lessons. nothing to install.",
                de: "spectroscope ist der agent-orchestrator, den man beobachten kann. hier lernst du, was die linien bedeuten. geh einen gescripteten agenten-lauf ohne backend durch oder arbeite die lektionen durch. nichts zu installieren.",
              },
              lang,
            )}
          </p>
          <div className="edu-home-cta">
            <button type="button" className="soft-primary" onClick={() => props.onEnter("simulator")}>
              {t({ en: "open the simulator", de: "simulator öffnen" }, lang)}
            </button>
            <button type="button" className="ghost" onClick={() => props.onEnter("edu")}>
              {t({ en: "browse edu", de: "edu ansehen" }, lang)}
            </button>
          </div>
        </header>

        <SimGuide onEnter={props.onEnter} />

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
