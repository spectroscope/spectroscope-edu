// edu progress — a tiny external store (house useSyncExternalStore pattern),
// persisted to localStorage under spectroscope:edu. Tracks which lessons are
// complete and the last step reached in each, so a lesson reopens where you left.

import { useSyncExternalStore } from "react";

export interface EduProgress {
  completed: Record<string, boolean>;
  lastStep: Record<string, number>;
}

const KEY = "spectroscope:edu";

function read(): EduProgress {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
    const p = raw ? JSON.parse(raw) : null;
    if (p && typeof p === "object") {
      return { completed: p.completed ?? {}, lastStep: p.lastStep ?? {} };
    }
  } catch {
    /* blocked or malformed — start fresh */
  }
  return { completed: {}, lastStep: {} };
}

let state: EduProgress = read();
const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}
function persist(): void {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function setLastStep(id: string, step: number): void {
  if (state.lastStep[id] === step) return;
  state = { ...state, lastStep: { ...state.lastStep, [id]: step } };
  persist();
  emit();
}

export function markComplete(id: string): void {
  if (state.completed[id]) return;
  state = { ...state, completed: { ...state.completed, [id]: true } };
  persist();
  emit();
}

/** Read the stored step for a lesson without subscribing. */
export function eduLastStep(id: string): number {
  return state.lastStep[id] ?? 0;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useEduProgress(): EduProgress {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
