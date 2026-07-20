"use client";

/**
 * ThemeToggle — three-way appearance control: Light / Dark / System.
 *
 * `System` follows the OS `prefers-color-scheme` and updates live (via
 * `<ThemeWatcher>`); Light / Dark pin an explicit theme. Writes the
 * *preference* to `localStorage['theme-pref']` and applies the resolved
 * `data-theme` to <html> (see `lib/theme.ts`); the pre-paint script in
 * `app/layout.tsx` mirrors the resolution to avoid a flash.
 *
 * Rendered as a compact segmented control (`TabBar` + `tab-bar--compact`) —
 * one bar, three segments — rather than separate pills. Re-syncs across
 * instances via the `theme-changed` event.
 */

import { useEffect, useState } from "react";
import { TabBar } from "@/components/ui/TabBar";
import {
  readThemePref,
  applyThemePref,
  THEME_CHANGED_EVENT,
  type ThemePref,
} from "@/lib/theme";

const OPTIONS = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "system", label: "System" },
];

export function ThemeToggle({ className }: { className?: string }) {
  const [pref, setPref] = useState<ThemePref>("light");

  useEffect(() => {
    const read = () => setPref(readThemePref());
    read();
    // Sync when the preference changes anywhere (sibling instances / watcher).
    window.addEventListener(THEME_CHANGED_EVENT, read);
    return () => window.removeEventListener(THEME_CHANGED_EVENT, read);
  }, []);

  const choose = (key: string) => {
    const p = key as ThemePref;
    applyThemePref(p);
    setPref(p);
  };

  return (
    <TabBar
      tabs={OPTIONS}
      activeKey={pref}
      onChange={choose}
      className={`tab-bar--compact${className ? ` ${className}` : ""}`}
    />
  );
}
