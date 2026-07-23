import Link from "next/link";
import type { ReactNode } from "react";
import type { Tier } from "@/lib/system";
import { TIER_META } from "@/lib/system";
import type { DriftAlarm } from "@/lib/derivation";

/* Shared server-side UI for /system. Presentation only — no content. */

/** The surface self-reporting parser drift (lib/derivation.ts). Rendered by
 *  the layout on every /system page; absent when every invariant holds, so
 *  its mere presence is the alarm. */
export function DriftBanner({ alarms }: { alarms: DriftAlarm[] }) {
  if (alarms.length === 0) return null;
  return (
    <div className="flex flex-col gap-sm rounded-panel border border-warning bg-warning-light px-lg py-md">
      <p className="text-sm font-semibold text-fg-primary">
        Derivation drift — {alarms.length} parser invariant{alarms.length === 1 ? "" : "s"} failing
      </p>
      <p className="text-xs text-fg-secondary max-w-[72ch]">
        A parsed doc's format no longer matches what its parser expects, so a page below is rendering
        empty or partial. Fix the doc to spec — formats never bend to the parsers. See{" "}
        <Link href="/system/docs/implementation/system-surface.md" className="underline underline-offset-2">
          system-surface.md → Drift alarms
        </Link>
        .
      </p>
      <ul className="flex flex-col gap-xs">
        {alarms.map((a, i) => (
          <li key={i} className="text-2xs font-mono text-fg-secondary">
            {a.parser} · {a.source} — {a.problem}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PageIntro({ title, count, blurb }: { title: string; count?: number; blurb: string }) {
  return (
    <header className="flex flex-col gap-sm">
      <h1 className="text-2xl font-semibold text-fg-primary">
        {title}
        {count !== undefined && <span className="ml-sm text-lg font-normal text-fg-tertiary">{count}</span>}
      </h1>
      <p className="text-sm text-fg-secondary max-w-[60ch]">{blurb}</p>
    </header>
  );
}

export function Tile({
  href,
  label,
  value,
  detail,
}: {
  href: string;
  label: string;
  value: ReactNode;
  detail?: string;
}) {
  // Numbers get the big stat treatment; text values sit a step smaller.
  const valueSize = typeof value === "number" ? "text-2xl" : "text-lg";
  return (
    <Link href={href} className="sys-tile">
      <span className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">{label}</span>
      <span
        className={`${valueSize} font-semibold text-fg-primary leading-tight truncate`}
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </span>
      {detail && <span className="text-xs text-fg-tertiary leading-snug">{detail}</span>}
    </Link>
  );
}

export function TierPill({ tier }: { tier: Tier | null }) {
  if (!tier) return <span className="sys-pill">untiered</span>;
  return <span className={`sys-pill sys-pill-tier-${tier}`}>{TIER_META[tier].label}</span>;
}

export function StalePill({ staleDays, lastReviewed }: { staleDays: number | null; lastReviewed: string | null }) {
  if (staleDays !== null) {
    return <span className="sys-pill sys-pill-stale">reviewed {lastReviewed ?? "?"}</span>;
  }
  return <span className="text-xs text-fg-tertiary tabular-nums">{lastReviewed ?? "—"}</span>;
}

export function IdTag({ id }: { id: string }) {
  return <span className="sys-id">{id}</span>;
}

/** Standard "where this page comes from" footer — every list page carries one,
 *  reinforcing the derived-never-authored law. */
export function SourceNote({ href, path, note }: { href: string; path: string; note?: string }) {
  return (
    <p className="text-xs text-fg-tertiary">
      Source:{" "}
      <Link href={href} className="underline underline-offset-2">
        {path}
      </Link>
      {note && <> — {note}</>}
    </p>
  );
}

/* Minimal inline-markdown renderer for list surfaces: bold, italics, code,
   strikethrough; links render as their text. Bold/italic content is parsed
   recursively so nested forms like **`code`** render cleanly. Block rendering
   (doc detail) uses react-markdown instead. */
export function MdInline({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|~~[^~]+~~|\[\[[^\]]+\]\]|\[[^\]]+\]\([^)]*\))/g;
  let last = 0;
  let m;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**"))
      nodes.push(
        <strong key={key++}>
          <MdInline text={tok.slice(2, -2)} />
        </strong>
      );
    else if (tok.startsWith("~~"))
      nodes.push(
        <s key={key++}>
          <MdInline text={tok.slice(2, -2)} />
        </s>
      );
    else if (tok.startsWith("`")) nodes.push(<code key={key++} className="sys-code">{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("[[")) nodes.push(tok.slice(2, -2).split("|").pop());
    else if (tok.startsWith("[")) {
      // Markdown links render as real links: doc-relative `.md` targets (an
      // optional #fragment kept) resolve through the doc reader; absolute
      // paths pass through; anything else stays plain text. Hrefs here are
      // resolved against the docs ROOT — the parsed sources (CONTRIBUTING,
      // ROADMAP, decisions.md) all live there.
      const label = tok.slice(1, tok.indexOf("]"));
      const href = tok.slice(tok.indexOf("](") + 2, -1);
      const [file, hash] = href.split("#");
      const inner = <MdInline text={label} />;
      if (/^https?:\/\//.test(href))
        nodes.push(
          <a key={key++} href={href} target="_blank" rel="noreferrer" className="underline underline-offset-2">
            {inner}
          </a>
        );
      else if (href.startsWith("/"))
        nodes.push(
          <Link key={key++} href={href} className="underline underline-offset-2">
            {inner}
          </Link>
        );
      else if (file.endsWith(".md"))
        nodes.push(
          <Link
            key={key++}
            href={`/system/docs/${file}${hash ? `#${hash}` : ""}`}
            className="underline underline-offset-2"
          >
            {inner}
          </Link>
        );
      else nodes.push(<span key={key++}>{inner}</span>);
    }
    else
      nodes.push(
        <em key={key++}>
          <MdInline text={tok.slice(1, -1)} />
        </em>
      );
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}
