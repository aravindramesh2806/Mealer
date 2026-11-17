import type { AppState } from "../data/types";

// Everything lives on the user's device. No server, no account.
const KEY = "mealer:v1";

export const emptyState = (): AppState => ({ version: 1, profile: null, customDishes: [], plans: {} });

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as AppState;
    if (parsed?.version !== 1) return emptyState();
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked (private mode). The app still works for this visit.
  }
}

export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function importState(text: string): AppState | null {
  try {
    const parsed = JSON.parse(text) as AppState;
    return parsed?.version === 1 ? { ...emptyState(), ...parsed } : null;
  } catch {
    return null;
  }
}
