// The app shell. The view (home | edu | simulator) is driven by the URL hash
// (state/route.ts), so each has its own address and the browser back button
// returns to home instead of leaving the app. At the root the app opens on a
// dev-portal home landing; from there you enter the simulator or edu, which
// render inside the sidebar shell. A global keymap (?) lists the shortcuts.

import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { SimView } from "./SimView";
import { EduView } from "./edu/EduView";
import { EduHome } from "./EduHome";
import { Keymap } from "./Keymap";
import { ErrorBoundary } from "./ErrorBoundary";
import { useLang } from "./state/lang";
import { navigate, useView } from "./state/route";
import { SCENARIOS } from "./scenario/registry";
import { LESSONS } from "./edu/lessons";

export type { Nav, View } from "./state/route";

/** True while the user is typing, so shortcuts do not steal their keystrokes. */
function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (el === null) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function App() {
  const view = useView();
  const lang = useLang();
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const [eduLessonId, setEduLessonId] = useState<string>(LESSONS[0].id);
  const [keymapOpen, setKeymapOpen] = useState(false);

  // Global shortcuts: ? (or ß, the same physical key without Shift on a German
  // layout) toggles the keymap, Esc closes it, h goes home.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setKeymapOpen(false);
        return;
      }
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "?" || e.key === "ß") {
        e.preventDefault();
        setKeymapOpen((o) => !o);
      } else if (e.key === "h") {
        navigate("home");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // The first time the user actually enters a VIEW (simulator or edu, not the home
  // landing where an overlay would feel out of place), show the keymap once so the
  // shortcuts are discovered, then remember it so it never auto-opens again.
  useEffect(() => {
    if (view === "home") return;
    try {
      if (!localStorage.getItem("spectroscope:keymapSeen")) {
        setKeymapOpen(true);
        localStorage.setItem("spectroscope:keymapSeen", "1");
      }
    } catch {
      /* localStorage unavailable (private mode) — just skip the one-time intro */
    }
  }, [view]);

  return (
    <>
      {view === "home" ? (
        <EduHome onEnter={navigate} onOpenKeymap={() => setKeymapOpen(true)} />
      ) : (
        <div className="edu-app">
          <Sidebar
            nav={view}
            onNav={navigate}
            onHome={() => navigate("home")}
            scenarioId={scenarioId}
            onSelectScenario={(id) => {
              setScenarioId(id);
              navigate("simulator");
            }}
            eduLessonId={eduLessonId}
            onSelectLesson={(id) => {
              setEduLessonId(id);
              navigate("edu");
            }}
          />
          <main className="edu-stage">
            {view === "simulator" ? (
              <ErrorBoundary key={`sim-${scenarioId}`} lang={lang}>
                <SimView scenarioId={scenarioId} onOpenKeymap={() => setKeymapOpen(true)} />
              </ErrorBoundary>
            ) : (
              <ErrorBoundary key={`edu-${eduLessonId}`} lang={lang}>
                <EduView key={eduLessonId} lessonId={eduLessonId} onOpenKeymap={() => setKeymapOpen(true)} />
              </ErrorBoundary>
            )}
          </main>
        </div>
      )}
      <Keymap open={keymapOpen} onClose={() => setKeymapOpen(false)} />
    </>
  );
}
