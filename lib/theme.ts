/**
 * Theme preference model — three-way: light / dark / **system**.
 *
 * `system` follows the OS `prefers-color-scheme` and updates live when the OS
 * flips (handled by `<ThemeWatcher>`). The stored value is the *preference*
 * (not the resolved theme); `resolveTheme` turns it into the actual
 * `data-theme` applied to <html>. The pre-paint script in `app/layout.tsx`
 * mirrors this resolution so there's no flash before hydration.
 *
 * Default is LIGHT (not system): the app opens in its designed light look,
 * with `system` available as an opt-in.
 */

export type ThemePref = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "theme-pref";
/** Fired on <window> whenever the preference changes, so every mounted
 *  ThemeToggle instance + the global ThemeWatcher re-sync. */
export const THEME_CHANGED_EVENT = "theme-changed";

const SYSTEM_DARK = "(prefers-color-scheme: dark)";

/** Read the stored preference, defaulting to `light`. */
export function readThemePref(): ThemePref {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    // ignore — private browsing
  }
  return "light";
}

/** Resolve a preference to the concrete theme to apply. */
export function resolveTheme(pref: ThemePref): "light" | "dark" {
  if (pref === "system") {
    return window.matchMedia(SYSTEM_DARK).matches ? "dark" : "light";
  }
  return pref;
}

/** Persist the preference, apply the resolved theme to <html>, and broadcast
 *  the change so sibling instances + the watcher re-sync. */
export function applyThemePref(pref: ThemePref): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // ignore — private browsing
  }
  document.documentElement.setAttribute("data-theme", resolveTheme(pref));
  window.dispatchEvent(new CustomEvent(THEME_CHANGED_EVENT));
}
