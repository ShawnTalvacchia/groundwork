# Project Instructions

Read this before every session. These rules override defaults. **This is a fresh template** — fill the `_(fill at kickoff)_` blocks in your first session (see `KICKOFF.md`).

## The Work Model — phases, modes, rituals

Canonical rules + glossary: `docs/CONTRIBUTING.md` → "The Work Model." Live picture: **`/system`** (derived from `docs/` every commit — never hand-maintained).

- **A phase is any chunk of work run through the rituals; its mode — product · system · side — sets ritual weight + focus, template, orient set, and touch bands.** Every phase opens a board in `docs/phases/` from its mode's template (`mode: product | system | side`) and closes it in the same arc; one phase per **session** (chat) is a strong default, not a law. **Close = distill + delete:** decisions → `docs/decisions.md`, behavior → feature docs, tracker rows moved, board deleted; product phases leave a compact record in `docs/archive/phases/`. Concurrency: one open board per mode; commits are mode-pure and name their board.
- **The queue = the ROADMAP's What's Next** — upcoming planned work of any mode, one mode-tagged list; every row carries a **seed** (`docs/planning/queued/`) where context accumulates. A staging area, never a gate: urgent work opens a board directly. **Trackers hold candidates, not queued work** — an item that bloats or clusters promotes into a phase.
- **Orient, then edit — the touch bands gate pens, not eyes.** Every mode's opening ritual reads its core set whole (product: the full strategy shelf) and actively aligns to the emphasized set; reading is never gated. Bands: **home ground** (edit freely), **careful** (deliberate, flagged), **gated** (another mode's ground — suggest, don't edit). Orientation is **align or challenge** — work pressing on a settled commitment raises a structured challenge; sometimes it should win. (The one-time **kickoff** bootstrap is the exception — all ground is open, because it's *creating* the shelf the bands protect; see `docs/CONTRIBUTING.md → The Kickoff`.)
- **Product phase:** carries a thesis; usually queue-born. After the build commits, the **walkthrough** is a main chunk of the phase — a collaborative point-by-point review WITH the user (`docs/phases/<name>-walkthrough.md`). Before closing: show the user the Closing Checklist.
- **System phase:** governance docs are its home ground (this file, CONTRIBUTING, ROADMAP structure, `/system` code). Always done with the user; closes with a light in-chat verification handoff.
- **Side phase:** tracker-born — a **sweep** of several punch/question/FC items on a light board. Home ground: the code it changes + **its own tracker rows**. Grows a thesis → stop, it's product-shaped. Closes with an in-chat verification handoff. Default for "resume a paused phase?" is **no — ask first.**

## Workflow Rules

1. **Work from the current phase board** in `docs/phases/`. Check it before starting.
2. **Read referenced docs** before starting a task. Update them if anything changed.
3. **Doc frontmatter:** every doc has `status`, `tier`, `last-reviewed`, `read-when`. Bump `last-reviewed` only when you **review** a doc, never on a mechanical touch.
4. **No feature sprawl.** If it's not on the phase board, don't build it without discussion.
5. **Phase close = doc review.** See `docs/CONTRIBUTING.md` → Closing a Phase.
6. **Push back, don't just comply.** When there's a better approach, make the case — lead with a recommendation, not a menu.

## Stack

_(fill at kickoff — framework, language, styling, backend, dev-server command, test/lint/build commands. **Do NOT inherit the template's Next.js stack by default** — it hosts the `/system` dashboard, nothing more. Choose from the project's goals and a FRESH check of current tooling/hosting options and costs; state the reason for the choice in `decisions.md`. See KICKOFF.md step 3.)_

## Design & Code Conventions

_(fill at kickoff — the stack-neutral reuse-first + flag-new principles live in `docs/CONTRIBUTING.md` → Design & Code Conventions; add the concrete rules here: styling system, tokens, naming, accessibility baseline, any hard gates)_

## Key Docs

| Doc | What it covers |
|-----|---------------|
| `docs/ROADMAP.md` | The compass — where we are, the queue, the horizon. Never a changelog |
| `docs/decisions.md` | Institutional memory — dated What/Why/Where decisions, newest first |
| `docs/CONTRIBUTING.md` | The Work Model, phase lifecycle, doc conventions, hygiene |
| `docs/implementation/system-surface.md` | The `/system` dashboard's spec — derived-never-authored law, IA, page→source map |
| `docs/implementation/shipping.md` | Naming across every surface, where the record lives, gate config, renaming later |
| `docs/strategy/Vision.md` | _(fill at kickoff — the bedrock thesis)_ |
| `docs/strategy/Scope & Constraints.md` | _(fill at kickoff — in/out of scope, hard constraints, non-goals)_ |
| `docs/planning/Open Questions & Assumptions Log.md` | Unresolved questions affecting upcoming work |
| `docs/planning/Future Considerations.md` | Known directions waiting for a trigger |

## Where We Are

_(fill at kickoff — this replaces the template's placeholder. Compass: `docs/ROADMAP.md`. Live picture: `/system`. History: `docs/decisions.md` + `docs/archive/phases/`.)_

## Strategic Context

_(fill at kickoff — the project's guiding thesis and priorities. Full strategy in `docs/strategy/`.)_

## Core Principles

_(fill at kickoff — foundational rules that shape decisions across the project. Implementation details live in their home docs, not here.)_
