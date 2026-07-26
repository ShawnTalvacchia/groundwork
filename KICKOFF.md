# Kickoff — launching a project from this template

This repo is a **project operating system**, not a codebase: a work model (phases · modes · rituals), doc tiers, planning trackers, and a `/system` dashboard derived from the docs. The machinery is complete. Your first session fills in the project.

**The one rule that makes it work: derived, never authored — and prune on resolve.** The docs are the truth; the dashboard renders them; finished things *leave* (removed, or compressed to a pointer). Keep that discipline and the system stays legible instead of bloating — which is the entire point.

**It's built for agent-assisted work.** `CLAUDE.md` is the standing briefing a coding agent (Claude Code or similar) reads every session — "session" in these docs means one chat. Everything is plain markdown, so it all works by hand too; the rituals just assume an agent doing the mechanical parts while you make the calls.

## What's here

```
README.md                     the front door — replaced with your project's own at kickoff close
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

   > **⚠ The template's own stack is NOT a default.** This repo arrives as a Next.js app only because the `/system` dashboard needed a host. That's a decision about the *dashboard*, not about your product.
   >
   > Choose the product's stack from the project's goals and a **fresh check** of current tooling and hosting costs — they change fast, so check the web rather than trusting an assistant's training-data priors or what this repo ships with. If the right stack isn't Next.js, fine: the dashboard lives beside it as its own small app.
   >
   > The test: the kickoff can say why the stack is right in one sentence that isn't "it came with the template."
4. **Make it yours** (web projects). Two edits, both one-and-done:
   - **Name it** — set `PROJECT_NAME` + `PROJECT_DESCRIPTION` in `lib/project.ts` (they ship as obvious placeholders). That one edit renames the browser tab, the `/system` header wordmark, the front door at `/`, and the generated link-preview image. The header carries the *project's* name on purpose: "System" is already the first tab, so a wordmark saying "System" is a label repeated, not a place named.
   - **Re-skin** — edit the tokens in `app/globals.css`; the styleguide re-derives on the next build. Token *names* are load-bearing (the dashboard's utilities come from them); token *values* are yours.

   The starter favicon (`app/icon.svg`) and link preview (`app/opengraph-image.tsx`) pick up the new name automatically — they're generic, not broken, so replacing them with real artwork is punch-list work, not kickoff work.
5. **Set the ROADMAP** — the Goal line, Where We Are, and queue your **first product phase** with a one-line thesis + a seed in `planning/queued/`.
6. **Log the kickoff decisions** in `decisions.md` (the stack choice, the vision as first drafted).
7. **Close the kickoff** with the verification handoff (present the filled shelf for a read), then work the board's close items — they replace the README with your project's own and **delete this file** — and open your first product phase from the roadmap.

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
