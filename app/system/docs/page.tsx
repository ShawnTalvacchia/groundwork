import Link from "next/link";
import { getAllDocs, getTiers, TIER_META, type Tier } from "@/lib/system";
import { MdInline, PageIntro, StalePill } from "../ui";

// Tiers + doc map, merged (IA v2): every live doc grouped by tier — most
// guarded first — with its folder and freshness per row. One page answers
// both "what's settled?" and "what exists?".

const DISPLAY_ORDER: Tier[] = ["bedrock", "commitments", "working", "surface"];

export default function DocsPage() {
  const docs = getAllDocs();
  const tiers = getTiers();
  const stale = docs.filter((d) => d.staleDays !== null);

  return (
    <>
      <PageIntro
        title="Docs"
        count={docs.length}
        blurb="Every live doc, grouped by how guarded it is against change. Nothing starts settled — docs sink by surviving; reopening a settled one takes a structured challenge. Amber marks docs past their tier's check-up backstop. The archive (150+ docs) is deliberately absent — reach it through the timeline."
      />
      {stale.length > 0 && (
        <section className="flex flex-col gap-sm">
          <h2 className="text-lg font-semibold text-fg-primary">Possibly stale</h2>
          <p className="text-xs text-fg-tertiary max-w-[48ch]">
            Past their tier&apos;s review heuristic — a signal to review, not an obligation.
          </p>
          <ul className="flex flex-col">
            {stale.map((d) => (
              <li key={d.relPath}>
                <Link
                  href={`/system/docs/${d.relPath}`}
                  className="sys-row-link flex items-center justify-between gap-md py-sm"
                >
                  <span className="text-sm text-fg-primary">{d.title}</span>
                  <StalePill staleDays={d.staleDays} lastReviewed={d.lastReviewed} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {DISPLAY_ORDER.map((tier) => {
        const tierDocs = docs.filter((d) => d.tier === tier);
        return (
          <section key={tier} className="flex flex-col gap-sm">
            <div className="flex items-baseline gap-md">
              <h2 className="text-lg font-semibold text-fg-primary">{TIER_META[tier].label}</h2>
              <span className="text-xs text-fg-tertiary">
                <MdInline text={tiers.find((t) => t.key === tier)?.toChange ?? ""} />
              </span>
            </div>
            <ul className="flex flex-col">
              {tierDocs.map((d) => (
                <li key={d.relPath}>
                  <Link
                    href={`/system/docs/${d.relPath}`}
                    className="sys-row-link flex items-center justify-between gap-md py-sm"
                  >
                    <span className="flex items-baseline gap-sm min-w-0">
                      <span className="text-sm text-fg-primary truncate">{d.title}</span>
                      <span className="text-2xs text-fg-tertiary whitespace-nowrap">
                        {d.relPath.split("/").slice(0, -1).join("/") || "docs"}
                        {d.status && d.status !== "active" ? ` · ${d.status}` : ""}
                      </span>
                    </span>
                    <StalePill staleDays={d.staleDays} lastReviewed={d.lastReviewed} />
                  </Link>
                </li>
              ))}
              {tierDocs.length === 0 && <li className="text-xs text-fg-tertiary py-sm">Nothing at this tier.</li>}
            </ul>
          </section>
        );
      })}
      {docs.some((d) => !d.tier) && (
        <section className="flex flex-col gap-sm">
          <h2 className="text-lg font-semibold text-fg-primary">Untiered</h2>
          <ul className="flex flex-col">
            {docs
              .filter((d) => !d.tier)
              .map((d) => (
                <li key={d.relPath} className="text-sm text-fg-secondary py-sm">
                  {d.relPath}
                </li>
              ))}
          </ul>
        </section>
      )}
    </>
  );
}
