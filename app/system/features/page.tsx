import Link from "next/link";
import { getAllDocs, type SystemDoc } from "@/lib/system";
import { PageIntro } from "../ui";

// The product map: the funnel areas in thesis order, the identity backbone
// beneath, the demo layer last. Area assignment comes from each feature doc's
// `area:` frontmatter — this page only knows the funnel's shape.

const FUNNEL = [
  { area: "community", label: "Community", tagline: "Meets build trust" },
  { area: "trust", label: "Trust", tagline: "Trust enables care" },
  { area: "care", label: "Care", tagline: "Care is booked and tracked" },
  { area: "shelter", label: "Shelter", tagline: "Help a Dog" },
];

function FeatureCard({ f, compact }: { f: SystemDoc; compact?: boolean }) {
  return (
    <Link href={`/system/docs/${f.relPath}`} className="sys-tile">
      <span className="text-sm font-semibold text-fg-primary">{f.title}</span>
      {f.featureStatus && (
        <span className="flex">
          <span className="sys-pill">{f.featureStatus}</span>
        </span>
      )}
      {f.routes.length > 0 && (
        <span className="flex flex-wrap gap-xs">
          {f.routes.map((r) => (
            <code key={r} className="sys-code">
              {r}
            </code>
          ))}
        </span>
      )}
      {!compact && f.readWhen && (
        <span className="text-2xs text-fg-tertiary leading-snug">Read when: {f.readWhen}</span>
      )}
    </Link>
  );
}

export default function FeaturesPage() {
  const features = getAllDocs().filter((d) => d.dir === "features");
  const product = features.filter((f) => f.featureKind !== "demo");
  const identity = product.filter((f) => f.area === "identity");
  const unmapped = product.filter((f) => !f.area);
  const demo = features.filter((f) => f.featureKind === "demo");

  return (
    <>
      <PageIntro
        title="Features"
        count={features.length}
        blurb="The feature registry as a product map: the funnel in thesis order, the identity backbone beneath it, the demo layer last. One current-state spec per capability, updated in the same PR as work that changes it. Status: imagined · staged · built."
      />
      <section className="flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <h2 className="text-lg font-semibold text-fg-primary">The funnel</h2>
          <p className="text-xs text-fg-tertiary">
            Community → Trust → Care → Shelter — every door leads to a network of people who know each
            other and each other&apos;s dogs.
          </p>
        </div>
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          {FUNNEL.map((stage) => (
            <div key={stage.area} className="flex flex-col gap-sm">
              <div className="flex flex-col">
                <span className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">
                  {stage.label}
                </span>
                <span className="text-2xs text-fg-tertiary">{stage.tagline}</span>
              </div>
              {product
                .filter((f) => f.area === stage.area)
                .map((f) => (
                  <FeatureCard key={f.relPath} f={f} compact />
                ))}
            </div>
          ))}
        </div>
      </section>
      {identity.length > 0 && (
        <section className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <h2 className="text-lg font-semibold text-fg-primary">The backbone</h2>
            <p className="text-xs text-fg-tertiary">
              Identity spans every stage — everyone starts the same way; Carer is a dial, not a
              separate signup.
            </p>
          </div>
          {identity.map((f) => (
            <FeatureCard key={f.relPath} f={f} />
          ))}
        </section>
      )}
      {unmapped.length > 0 && (
        <section className="flex flex-col gap-md">
          <h2 className="text-lg font-semibold text-fg-primary">Unmapped</h2>
          {unmapped.map((f) => (
            <FeatureCard key={f.relPath} f={f} />
          ))}
        </section>
      )}
      <section className="flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <h2 className="text-lg font-semibold text-fg-primary">Demo layer</h2>
          <p className="text-xs text-fg-tertiary">
            The prototype&apos;s own affordances — the launcher, persona switching, guided walkthroughs.
            Not shipping product features.
          </p>
        </div>
        {demo.map((f) => (
          <FeatureCard key={f.relPath} f={f} />
        ))}
      </section>
    </>
  );
}
