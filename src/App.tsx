// The app shell. A left sidebar carries a two-way segment switch (edu |
// simulator) — the exact idiom of spectro-web's sessions|fleets nav, but a
// FRESH component (this app owns its own Sidebar; it never imports spectro-web's,
// which the product's Fleet Manager work is rewriting). The stage renders the
// simulator (default) or the edu placeholder. There is no backend and no router:
// view state is local, and the simulator rides the stepper replay seam.

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { SimView } from "./SimView";
import { EduView } from "./EduView";
import { SCENARIOS } from "./scenario/registry";

export type Nav = "edu" | "simulator";

export function App() {
  const [nav, setNav] = useState<Nav>("simulator");
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);

  return (
    <div className="edu-app">
      <Sidebar
        nav={nav}
        onNav={setNav}
        scenarioId={scenarioId}
        onSelectScenario={(id) => {
          setScenarioId(id);
          setNav("simulator");
        }}
      />
      <main className="edu-stage">
        {nav === "simulator" ? <SimView scenarioId={scenarioId} /> : <EduView />}
      </main>
    </div>
  );
}
