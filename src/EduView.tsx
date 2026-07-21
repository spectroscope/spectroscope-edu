// The edu stage. In P2 this hosts the seven lessons, rebuilt natively on React
// Flow (the vanilla prototype at konzept/edu-prototype is the diff oracle). For
// P0 it is an honest placeholder that points at the working simulator.

import { useLang } from "./state/lang";

export function EduView() {
  const lang = useLang();
  return (
    <section className="edu-placeholder" aria-label="edu">
      <div className="edu-placeholder-card">
        <p className="eyebrow sand">edu</p>
        <h1>{lang === "de" ? "die lektionen entstehen" : "the lessons are on their way"}</h1>
        <p>
          {lang === "de"
            ? "sieben interaktive lektionen landen hier, nativ in react flow neu gebaut. bis dahin: öffne den simulator und sieh einem gescripteten agenten-lauf schritt für schritt zu."
            : "seven interactive lessons land here, rebuilt natively on react flow. until then, open the simulator and watch a scripted agent run step by step."}
        </p>
      </div>
    </section>
  );
}
