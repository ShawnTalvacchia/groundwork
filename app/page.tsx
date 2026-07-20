import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// The template ships with no product yet — the root page is a thin front door
// to the /system dashboard (the derived knowledge surface). Replace this with
// your app's real landing page once the first product phase ships.

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-page flex-col justify-center gap-xl px-xl py-3xl">
      <div className="flex flex-col gap-md">
        <p className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">
          Project OS template
        </p>
        <h1 className="text-4xl font-bold text-fg-primary">System Template</h1>
        <p className="max-w-prose text-base text-fg-secondary">
          A methodology template with a{" "}
          <span className="font-semibold text-fg-primary">derived, never-authored</span> knowledge
          dashboard. Everything on the dashboard renders from the markdown in{" "}
          <code className="sys-code">docs/</code> at build time — to change a page, change its source
          doc.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-md">
        <Link
          href="/system"
          className="inline-flex items-center rounded-panel bg-brand-main px-lg py-md text-sm font-semibold text-fg-white transition-colors hover:bg-brand-strong"
        >
          Open the /system dashboard →
        </Link>
        <ThemeToggle />
      </div>
      <p className="max-w-prose text-xs text-fg-tertiary">
        New here? Read <code className="sys-code">KICKOFF.md</code> — it walks the first session:
        open a system phase, fill the strategy shelf, then queue the first product phase.
      </p>
    </main>
  );
}
