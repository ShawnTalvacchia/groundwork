import type { Metadata } from "next";
import { getDriftAlarms } from "@/lib/derivation";
import { SystemNav, SystemSubtabs } from "./nav";
import { DriftBanner } from "./ui";
import "./system.css";

// The knowledge-system surface: derived from docs/ at build time, never
// hand-maintained (docs/implementation/system-surface.md). Noindexed, and
// absent from the product nav.

export const metadata: Metadata = {
  title: "System",
  robots: { index: false, follow: false },
};

export default function SystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="sys-layout">
      {/* Header + both tab rows stick as one block; the body scrolls under.
          Wrapping them (rather than sticking the subtabs at a hard-coded
          offset) keeps it correct as the header's type scales. */}
      <div className="sys-chrome">
        <SystemNav />
        {/* Full-bleed band: the rule spans the viewport, the tabs stay on the
            content column. */}
        <SystemSubtabs />
      </div>
      <main className="sys-main">
        {/* Absent when every parser invariant holds — presence IS the alarm.
            One insertion point (not per-page) so no page can be missed. */}
        <DriftBanner alarms={getDriftAlarms()} />
        {children}
      </main>
    </div>
  );
}
