// A tiny hash router so the three views get their own URL and the browser back
// button navigates WITHIN the app (simulator/edu -> home) instead of leaving it.
// Hash-based on purpose: it needs no server rewrite, works with Vite's base:"./"
// and Cloudflare static assets, and every change pushes a history entry.
//
//   home       -> /            (no hash)
//   simulator  -> /#simulator
//   edu        -> /#edu

import { useSyncExternalStore } from "react";

export type Nav = "edu" | "simulator";
export type View = "home" | Nav;

function current(): View {
  const h = (typeof location === "undefined" ? "" : location.hash).replace(/^#\/?/, "");
  return h === "edu" || h === "simulator" ? h : "home";
}

function subscribe(cb: () => void): () => void {
  window.addEventListener("hashchange", cb);
  window.addEventListener("popstate", cb);
  return () => {
    window.removeEventListener("hashchange", cb);
    window.removeEventListener("popstate", cb);
  };
}

/** The current view, derived from the URL hash — the single source of truth. */
export function useView(): View {
  return useSyncExternalStore(subscribe, current, () => "home");
}

/** Navigate to a view by changing the URL (which pushes a history entry). */
export function navigate(v: View): void {
  if (current() === v) return;
  if (v === "home") {
    // Drop the hash for a clean "/" home, keep a history entry, then notify
    // (pushState fires no event of its own).
    history.pushState(null, "", location.pathname + location.search);
    window.dispatchEvent(new PopStateEvent("popstate"));
  } else {
    location.hash = v; // pushes a history entry AND fires hashchange
  }
}
