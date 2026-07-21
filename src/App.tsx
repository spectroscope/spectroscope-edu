// The app shell. At the root the app opens on a small dev-portal-style HOME
// landing (explanation + features + two entry points); from there you enter the
// simulator or edu, which render inside the sidebar shell. The brand mark in the
// sidebar returns to home. There is no backend and no router — view state is
// local, and the simulator rides the stepper replay seam.

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { SimView } from "./SimView";
import { EduView } from "./EduView";
import { EduHome } from "./EduHome";
import { SCENARIOS } from "./scenario/registry";

export type Nav = "edu" | "simulator";
export type View = "home" | Nav;

export function App() {
  const [view, setView] = useState<View>("home");
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);

  if (view === "home") {
    return <EduHome onEnter={setView} />;
  }

  return (
    <div className="edu-app">
      <Sidebar
        nav={view}
        onNav={setView}
        onHome={() => setView("home")}
        scenarioId={scenarioId}
        onSelectScenario={(id) => {
          setScenarioId(id);
          setView("simulator");
        }}
      />
      <main className="edu-stage">
        {view === "simulator" ? <SimView scenarioId={scenarioId} /> : <EduView />}
      </main>
    </div>
  );
}
