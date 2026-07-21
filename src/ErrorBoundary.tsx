// A render-error boundary. If a view throws, the boundary shows a small, calm
// fallback INSTEAD of white-screening the whole app — the sidebar and the rest of
// the shell stay alive. Reset it by switching views (it is keyed by view id in
// App.tsx) or with the "try again" button.

import { Component, type ReactNode } from "react";
import type { Lang } from "./i18n/i18n";

export class ErrorBoundary extends Component<
  { children: ReactNode; lang: Lang; onReset?: () => void },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    // Keep it in the console for debugging; the UI stays up.
    console.error("[ErrorBoundary] a view threw:", error);
  }
  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    const de = this.props.lang === "de";
    if (this.state.error) {
      return (
        <div className="err-boundary">
          <div className="err-card">
            <div className="eyebrow sand">{de ? "etwas ist schiefgelaufen" : "something went wrong"}</div>
            <h2>{de ? "diese ansicht hatte einen fehler" : "this view hit an error"}</h2>
            <p>
              {de
                ? "der rest der app läuft weiter. probier es erneut, wähl eine andere lektion, oder lade die seite neu."
                : "the rest of the app is fine. try again, pick another lesson, or reload the page."}
            </p>
            <pre className="err-msg">{String(this.state.error?.message ?? this.state.error)}</pre>
            <button type="button" className="err-retry" onClick={this.reset}>
              {de ? "erneut versuchen" : "try again"}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
