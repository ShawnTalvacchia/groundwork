import Link from "next/link";
import { BookOpenText, Hammer, TreeStructure } from "@phosphor-icons/react/dist/ssr";
import {
  getActiveBoards,
  getAllDocs,
  getArchivedPhases,
  getDecisions,
  getFutureItems,
  getGlossary,
  getOpenQuestions,
  getPunchItems,
  getRoadmap,
  getTrackerModel,
  getWorkModel,
  TIER_ORDER,
} from "@/lib/system";
import { Tile } from "./ui";

function Cluster({
  title,
  href,
  icon,
  purpose,
  children,
}: {
  title: string;
  href: string;
  icon: React.ReactNode;
  purpose: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-md">
      <div className="flex flex-col gap-xs">
        <Link href={href} className="flex items-center gap-sm no-underline">
          <span className="text-fg-tertiary">{icon}</span>
          <h2 className="text-xl font-semibold text-fg-primary">{title}</h2>
        </Link>
        <p className="text-sm text-fg-tertiary">{purpose}</p>
      </div>
      <div className="sys-tile-grid">{children}</div>
    </section>
  );
}

export default function SystemOverview() {
  const docs = getAllDocs();
  const questions = getOpenQuestions();
  const punch = getPunchItems();
  const future = getFutureItems();
  const decisions = getDecisions();
  const roadmap = getRoadmap();
  const boards = getActiveBoards();
  const archived = getArchivedPhases();
  const glossary = getGlossary();
  const { modes } = getWorkModel();
  const { trackers } = getTrackerModel();

  const openItems = questions.reduce((n, t) => n + t.questions.length, 0);
  const features = docs.filter((d) => d.featureStatus);
  const strategyDocs = docs.filter((d) => d.dir === "strategy");
  const tierCounts = TIER_ORDER.map((t) => `${docs.filter((d) => d.tier === t).length} ${t}`).join(" · ");

  return (
    <>
      <p className="text-sm text-fg-secondary max-w-[64ch]">
        The work, the strategy, and the rules — rendered from <code className="sys-code">docs/</code>{" "}
        on every commit.
      </p>

      <Cluster
        title="Work"
        href="/system/work"
        icon={<Hammer size={20} weight="light" />}
        purpose="What's moving — the active board and the queues that feed it."
      >
        {boards.length === 0 ? (
          <Link href="/system/phase" className="sys-tile sys-tile-wide">
            <span className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">
              Active board
            </span>
            <span className="flex items-baseline gap-md">
              <span className="text-2xl font-semibold text-fg-primary">Between boards</span>
              <span className="text-xs text-fg-tertiary">{roadmap.phases.length} phases queued</span>
            </span>
          </Link>
        ) : (
          boards.map((b) => (
            <Link key={b.slug} href="/system/phase" className="sys-tile sys-tile-wide">
              <span className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">
                Active board · {modes.find((m) => m.key === b.mode)?.label ?? b.mode}
              </span>
              <span className="flex items-baseline gap-md">
                <span className="text-2xl font-semibold text-fg-primary">{b.title.split(" — ")[0]}</span>
                <span className="text-xs text-fg-tertiary tabular-nums">
                  {b.done}/{b.total} tasks
                </span>
              </span>
            </Link>
          ))
        )}
        <Tile href="/system/roadmap" label="Roadmap" value={roadmap.phases.length} detail="phases queued" />
        <Tile
          href="/system/questions"
          label="Open questions"
          value={openItems}
          detail={`across ${questions.length} topics (§)`}
        />
        <Tile href="/system/punch-list" label="Punch list" value={punch.length} detail="small fixes waiting" />
        <Tile href="/system/future" label="Future" value={future.length} detail="parked until a trigger fires" />
      </Cluster>

      <Cluster
        title="Structure"
        href="/system/structure"
        icon={<TreeStructure size={20} weight="light" />}
        purpose="What the project is made of — features, strategy, the docs, the shipped record."
      >
        <Tile
          href="/system/features"
          label="Features"
          value={features.length}
          detail={`${features.filter((d) => d.featureKind !== "demo").length} product · ${features.filter((d) => d.featureKind === "demo").length} demo layer`}
        />
        <Tile
          href="/system/strategy"
          label="Strategy"
          value={strategyDocs.length}
          detail="models · drafts · kits · research"
        />
        <Tile href="/system/docs" label="Docs" value={docs.length} detail={tierCounts} />
        <Tile href="/system/timeline" label="Timeline" value={archived.length} detail="closed phases on record" />
        <Tile
          href="/system/decisions"
          label="Decisions"
          value={decisions.length}
          detail={`logged · latest ${decisions[0]?.date ?? "—"}`}
        />
      </Cluster>

      <Cluster
        title="Method"
        href="/system/method"
        icon={<BookOpenText size={20} weight="light" />}
        purpose="How we work — the modes and rituals every phase runs by."
      >
        <Tile href="/system/method" label="How we work" value={modes.length} detail="modes · each with its rituals" />
        <Tile href="/system/trackers" label="Trackers" value={trackers.length} detail="lists that feed the boards" />
        <Tile href="/system/tiers" label="Tiers" value={4} detail="review cadences · sinking · challenge" />
        <Tile href="/system/glossary" label="Glossary" value={glossary.length} detail="terms, defined once" />
      </Cluster>

    </>
  );
}
