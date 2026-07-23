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
    kickoff.md                the bootstrap board — ships OPEN; work it first, then delete
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

## First run — the kickoff phase (ships already open)

The kickoff is the **bootstrap** — the one-time phase that runs *before* the three-mode loop (`docs/CONTRIBUTING.md → The Kickoff`). It ships **already open** as `docs/phases/kickoff.md`, so you don't open it — you work it, and it shows up as the active board on `/system`. It's a guided conversation: answer the prompts, and the system explains its options as you go. The board is the checklist; the steps below are the how and why. Then:

1. **Answer the seeded Open Questions** (`planning/Open Questions & Assumptions Log.md`). They're the fresh-project prompts: who's the user, what's out of scope, the smallest thesis-proving thing, the riskiest assumption. Each answer becomes a decision, a strategy-doc edit, or a queued phase — then delete the question.
2. **Fill `strategy/Vision.md`** (bedrock) and **`Scope & Constraints.md`**. Flip both `status: draft → active` and set their `summary:`. Delete the prompt blocks as you answer them.
3. **Choose the stack** and fill CLAUDE.md's `## Stack` + `## Design & Code Conventions` blocks (the stack-neutral reuse-first principles already live in CONTRIBUTING).

   > **⚠ The template's own stack is NOT a default.** This repo arrives as a Next.js app only because the `/system` dashboard needed a host to be built in. That is a decision about the *dashboard*, not about *your product*. Choose the product's stack from the project's goals, the team's abilities, and **current** tooling and hosting costs — capabilities and prices change fast, so do a fresh check (web search) rather than relying on the assistant's training-data priors or on what this template happens to ship with. If the right product stack isn't Next.js, that's fine: the dashboard can live beside it as its own small app, or the product can live in its own directory or repo. Adopting Next.js *because it was already here* is the failure mode this note exists to prevent — if it IS the right choice, the kickoff should be able to say why in one sentence that isn't "it came with the template."
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

It boots with **zero drift alarms** against the empty template, so you watch the surface fill in as you do the kickoff. The starter design system lives in `app/globals.css` (edit those tokens to make it yours — the token *names* are load-bearing, the *values* are yours); `app/system/` + `lib/system.ts` + `lib/styleguide.ts` are the parsers and pages — see `docs/implementation/system-surface.md` for the law (derived, never authored) and the page→source map.

> **⚠ `/system` ships with no auth — add some before you deploy it publicly.** It's noindexed, but `noindex` stops search engines, not people. Every page renders your strategy, roadmap, open questions, and decisions. Local dev is fine as-is; a public deploy needs real protection (middleware, your host's password protection, or a private deployment). Details: `docs/implementation/system-surface.md` → What this is.

The methodology works without the web app too — the docs are the source of truth. For a **non-web project**, delete `app/`, `components/`, `lib/`, and the web config files; keep `docs/` + `CLAUDE.md`.

## The one rule that makes this work

**Derived, never authored, and prune on resolve.** The docs are the truth; the dashboard renders them; finished things *leave* (removed or compressed to a pointer), they don't accumulate behind banners. If you keep that discipline, the system stays legible instead of bloating — which is the entire point.
