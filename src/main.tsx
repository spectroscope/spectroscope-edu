// Entry point. Deliberately WITHOUT React.StrictMode: the stepper is a global
// store driven by effects (loadReplay/step); a dev double-mount would double-run
// them. The app is backend-free — no socket, so nothing here connects anywhere.

import { createRoot } from "react-dom/client";
import { App } from "./App";
import { initDesign } from "./state/designPrefs";
import "./tokens.css";
import "./fonts.css";
import "./app.css";
import "./designs.css";

// Apply the saved skin before first render (the index.html guard already did it
// for the initial paint; this keeps the store authoritative across HMR reloads).
initDesign();

createRoot(document.getElementById("root")!).render(<App />);
