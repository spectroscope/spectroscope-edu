// The simulator: a scripted agent-harness run on the FlowMap "system map", with
// step/play/back transport — all backend-free. The drive seam is exactly
// spectro-web's replay path: compile(scenario, lang) -> RunEvent[] ->
// stepper.loadReplay. The stepper folds each event through the same reducer +
// Petri marking + scene the live Lab uses, so Step advances the map one station
// at a time. Spectrum + Trace dock here as bottom sub-views in P1.

import { useEffect, useMemo, useState } from "react";
import { compile } from "./scenario/compile";
import { SCENARIOS } from "./scenario/registry";
import { loc } from "./scenario/dsl";
import { useLang } from "./state/lang";
import { loadReplay, step, useStepper } from "./state/stepper";
import { isLocalProvider } from "./lab/labScene";
import { FlowMap } from "./lab/FlowMap";
import { LabControls, LabHint } from "./lab/LabControls";

export function SimView(props: { scenarioId: string }) {
  const lang = useLang();
  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.id === props.scenarioId) ?? SCENARIOS[0],
    [props.scenarioId],
  );

  // "remote" = run the model beyond the network boundary. It only drives the
  // map layout (the LLM card crosses the boundary), never the event stream —
  // exactly like the Lab, where provider comes from the header, not the run.
  const [remote, setRemote] = useState(false);

  // Compile the scenario and drive the stepper. Recompiles on language change
  // (the DSL is bilingual); resets the provider flip to the scenario's default.
  useEffect(() => {
    loadReplay(scenario.id, compile(scenario, lang));
    setRemote(!isLocalProvider(scenario.provider));
  }, [scenario, lang]);

  const st = useStepper();

  // Flow auto-play: a timer drains the queue at the chosen pace. An empty queue
  // makes step() a no-op. (Mirrors spectro-web's LabView.)
  useEffect(() => {
    if (st.mode !== "flow") return;
    const id = setInterval(() => step(), st.intervalMs);
    return () => clearInterval(id);
  }, [st.mode, st.intervalMs]);

  const provider = remote ? "anthropic" : "ollama";
  const model = remote ? "claude-opus" : "qwen3.5:27b";

  return (
    <section className="sim-view" aria-label="simulator">
      <header className="sim-head">
        <h1 className="sim-title">{loc(scenario.name, lang)}</h1>
        <p className="sim-prompt mono" title={loc(scenario.prompt, lang)}>
          {loc(scenario.prompt, lang)}
        </p>
        <button
          type="button"
          className={`fx-switch sim-flip${remote ? " fx-switch--on" : ""}`}
          role="switch"
          aria-checked={remote}
          onClick={() => setRemote((r) => !r)}
          title={
            lang === "de"
              ? "LLM lokal (Ollama, auf deinem Mac) oder remote (jenseits der Netzgrenze)"
              : "run the model locally (Ollama, on your mac) or remotely (beyond the network boundary)"
          }
        >
          <span className="fx-switch-label">
            {remote ? (lang === "de" ? "remote llm" : "remote llm") : lang === "de" ? "lokales llm" : "local llm"}
          </span>
          <span className="fx-switch-track" aria-hidden="true">
            <span className="fx-switch-knob" />
          </span>
        </button>
      </header>

      <LabControls running={false} />
      <FlowMap scene={st.scene} applied={st.applied} provider={provider} model={model} />
      <LabHint />
    </section>
  );
}
