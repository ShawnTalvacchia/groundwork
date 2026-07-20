# Kickoff — launching a project from this template

This repo is a **project operating system**, not a codebase: a work model (phases · modes · rituals), doc tiers, planning trackers, and a spec for a derived `/system` dashboard. The machinery is complete. Your first session fills in the project.

## What's here

```
CLAUDE.md                     project instructions (Work Model summary + kickoff stubs)
docs/
  CONTRIBUTING.md             the full Work Model, tiers, trackers, hygiene — the rulebook
  ROADMAP.md                  the queue (empty — you fill it)
  decisions.md                institutional memory (empty)
  strategy/
    Vision.md                 BEDROCK stub — the thesis; fill first
    Scope & Constraints.md    in/out of scope, non-goals
  planning/
    Open Questions & …Log.md  SEEDED with kickoff questions — answer these
    punch-list.md             empty
    Future Considerations.md  empty
    queued/_seed-template.md   one seed per queued phase
  phases/
    _product-template.md      the four board molds
    _system-template.md
    _side-template.md
    _walkthrough-template.md
  implementation/
    system-surface.md         the /system dashboard spec (its law + page→source map)
app/, components/, lib/        the live /system dashboard — Next.js + the doc parsers
app/globals.css                the starter design system (edit these tokens to re-skin)
package.json, *.config.*       the web host (Next.js, Tailwind v4)
```

## First run — a guided kickoff (open it as a **system phase**)

The kickoff is itself a phase. Open a **system** board (`_system-template.md`) — friction: "the strategy shelf is empty; fill it and queue the first work." Then:

1. **Answer the seeded Open Questions** (`planning/Open Questions & Assumptions Log.md`). They're the fresh-project prompts: who's the user, what's out of scope, the smallest thesis-proving thing, the riskiest assumption. Each answer becomes a decision, a strategy-doc edit, or a queued phase — then delete the question.
2. **Fill `strategy/Vision.md`** (bedrock) and **`Scope & Constraints.md`**. Flip both `status: draft → active` and set their `summary:`. Delete the prompt blocks as you answer them.
3. **Choose the stack** and fill CLAUDE.md's `## Stack` + `## Design & Code Conventions` blocks (the stack-neutral reuse-first principles already live in CONTRIBUTING).
4. **Set the ROADMAP** — the Goal line, Where We Are, and queue your **first product phase** with a one-line thesis + a seed in `planning/queued/`.
5. **Log the kickoff decisions** in `decisions.md` (the stack choice, the vision as first drafted).
6. **Close the system phase** with the verification handoff (present the filled shelf for a read), then open your first product phase from the roadmap.

After that, work the normal loop: queue → open a phase from its mode's template → orient (align or challenge) → build → (product) walkthrough → close (distill + delete). The whole loop is in `docs/CONTRIBUTING.md`.

## The `/system` dashboard (ships with the template)

The live derived dashboard is already built — a **Next.js/React** app that renders every `/system` page from the docs in `docs/` at build time. Run it:

```
npm install
npm run dev        # → http://localhost:3000/system
```

It boots with **zero drift alarms** against the empty template, so you watch the surface fill in as you do the kickoff. The starter design system lives in `app/globals.css` (edit those tokens to make it yours); `app/system/` + `lib/system.ts` + `lib/styleguide.ts` are the parsers and pages — see `docs/implementation/system-surface.md` for the law (derived, never authored) and the page→source map.

The methodology works without the web app too — the docs are the source of truth. For a **non-web project**, delete `app/`, `components/`, `lib/`, and the web config files; keep `docs/` + `CLAUDE.md`.

## The one rule that makes this work

**Derived, never authored, and prune on resolve.** The docs are the truth; the dashboard renders them; finished things *leave* (removed or compressed to a pointer), they don't accumulate behind banners. If you keep that discipline, the system stays legible instead of bloating — which is the entire point.
