---
category: phase
status: active
mode: system
tier: working
last-reviewed: YYYY-MM-DD
read-when: "the first board — work it before anything else; deleted at close, when the three-mode loop begins"
---

# Kickoff — bootstrap this project (ACTIVE)

**This is the bootstrap phase — it runs once, before the three-mode loop** (`CONTRIBUTING.md → The Kickoff`). It ships already open; you don't open it, you work it. It's the one phase that *writes* the strategy shelf instead of orienting against it, and the one time all ground is open (system + product), because it's creating the ground the touch bands later protect. Treat it as a guided conversation — answer the prompts and let the system explain its options as you go.

**Full step-by-step: the root `KICKOFF.md`** (one home, many references — this board is the checklist, not the guide). Each item below maps to a KICKOFF.md step.

## Items

- [ ] **Answer the seeded Open Questions** (`planning/Open Questions & Assumptions Log.md`) — who's the user, what's out of scope, the smallest thesis-proving thing, the riskiest assumption. Each answer becomes a decision, a strategy edit, or a queued phase; then delete the question.
- [ ] **Fill the strategy shelf** — `strategy/Vision.md` (bedrock) + `Scope & Constraints.md`; flip both `status: draft → active` and set their `summary:`.
- [ ] **Choose the stack** — fill CLAUDE.md's `## Stack` + `## Design & Code Conventions` blocks.
- [ ] **Name the project** (web projects) — set `PROJECT_NAME` + `PROJECT_DESCRIPTION` in `lib/project.ts`. One edit renames the browser tab, the `/system` header wordmark, and the generated link-preview image.
- [ ] **Make the design system yours** (web projects) — re-skin the tokens in `app/globals.css`; the styleguide re-derives on the next build. Token *names* are load-bearing; *values* are yours.
- [ ] **Set the ROADMAP + queue the first product phase** — the Goal line, Where We Are, and one queued row with a one-line thesis and a seed in `planning/queued/`.
- [ ] **Log the kickoff decisions** in `decisions.md` (the stack choice, the vision as first drafted).

## Close items

- [ ] **Hand off for verification** — present the filled shelf (Vision + Scope `active`, ROADMAP set, first product phase queued) for the PO's read.
- [ ] `last-reviewed` stamped on every doc filled/reviewed during kickoff.
- [ ] **Replace README.md with your project's own** — the template's pitch + quickstart have done their job.
- [ ] **Delete KICKOFF.md** — its durable notes already live in their homes (`implementation/system-surface.md`, `app/globals.css`, your CLAUDE.md Stack block). The template leaves no onboarding behind.
- [ ] **Distill + delete this board**, then open the first product phase from the roadmap. The three-mode loop starts here.
