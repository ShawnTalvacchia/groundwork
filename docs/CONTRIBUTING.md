---
category: meta
status: active
tier: commitments
last-reviewed: YYYY-MM-DD
tags: [rules, workflow, conventions]
read-when: "always — read before any working session"
---

# Contributing Rules

Rules for humans and agents working in this repo. Read before building. This is the **methodology template** — the machinery is complete; the project-specific parts (stack, design conventions, strategy) are yours to fill at kickoff (see `KICKOFF.md`).

---

## The Work Model — every phase runs in one of three modes

<!-- PARSED by lib/system.ts (getWorkModel) -> /system/method + the hub. Changing this section's SHAPE
     (the three '### Mode N · Name — tagline' headings, the bold 'Purpose/Home ground/Careful/Gated/During' labels, the numbered ritual lists) breaks that page silently - the /system drift banner will name it.
     Check /system after editing. Spec: docs/implementation/system-surface.md -->

**A phase is any chunk of work run through the rituals; its mode — product · system · side — sets the ritual's weight and focus.** A phase lives as a board while open, and one phase per session (chat) is the strong default, not a law — a phase survives a force-ended chat. The mode answers three questions: where the work comes from, what it reads to orient, and what it's comfortable editing. Can't name the mode? Stop and decide before touching anything — no phase is ritual-free.

**Rules shared by all modes:**

- **Phase = board while open.** A phase opens its board from its mode's template (`_product-template.md` · `_system-template.md` · `_side-template.md`) and closes it in the same arc — usually the same sitting. Boards are always `tier: working` while open; at close they are **distilled and deleted** — extraction first (decisions → `decisions.md`, behavior → feature docs, tracker rows moved), then the file goes; git history is the deep record. Product phases additionally leave a compact record for the timeline.
- **The queue is the ROADMAP's What's Next — upcoming planned work of any mode, one mode-tagged list.** Every queued row carries a **seed** (`planning/queued/`, badged by its `mode:`) accumulating context until the phase opens. The queue is a staging area, never a gate: something serious can skip it — write the board and kick off directly.
- **Trackers hold candidates, not queued work.** A tracker note that bloats, or a cluster of connected notes, promotes into a phase — the rows leave the trackers and the board gets a cohesive chunk. Tracker work needed sooner than later gets a seed and/or a board, depending on how soon it'll be picked up.
- **Reading is never gated — the touch bands gate pens, not eyes.** Every opening ritual has a bounded orient step (read the mode's core set whole; actively align to the emphasized set), and any doc may be pulled freely mid-build. Orientation is **align or challenge**: new work pressing on an old commitment isn't drift to suppress — it's a structured challenge to raise (§ Doc Tiers), and sometimes the challenge should win. That pressure is how new directions, features, and strategy are born.
- **Concurrency — one open board per mode.** One product and (when needed) one system board may be open simultaneously; never two boards of the same mode. Side phases run alongside either.
- **Commits are mode-pure.** A commit serves exactly one board and names it in the message. Never mix product and system changes in one commit.
- Boards work the main working tree — parallelism is *between* phases, not within one. (Spawned side tasks are the exception: they run in worktrees, per Mode 3.)
- **Routing ("where does this go?"):** ≤30 min isolated fix → punch list, swept later · focused work, no strategy → side phase · structural thesis or cross-surface coupling → product phase · workflow/doc/dashboard work → system phase · strategic and unresolved → Open Questions · known direction, no trigger yet → Future Considerations.
- The active board(s) render live at `/system` (Work → Active board), badged by mode.

### Mode 1 · Product — building the product

**Purpose:** Chunked product work toward the app's goals, carrying a thesis (the structural change it delivers). Usually born from the queue; may open directly when something serious earns it. The product ships through this mode, so its rituals are the deepest.

**Home ground:** product code, feature docs.

**Careful:** strategy docs and ROADMAP content — updated deliberately when the work bears on them (a ratified walkthrough decision, or a structured challenge when new work presses on an old commitment), never in passing.

**Gated:** the governance docs — CLAUDE.md, this file, ROADMAP *structure*, the `/system` code. Not forbidden: suggest the edit, and it lands through a system phase.

**Opening ritual:**

1. Open the board from `_product-template.md` (`mode: product`) with its thesis stated; fold the phase's **seed** (`planning/queued/`) into the board and delete it, and **remove the phase's row from the ROADMAP in the same step** — the queue is future-only, and the active board at `/system` is the open phase's pointer (a row left behind double-counts in the queued list). Update the ROADMAP's Where-We-Are current-phase line instead.
2. Orient — run the **Opening Checklist** (§ Opening a Product Phase): Ring 1 reads the strategy shelf whole, Ring 2 actively aligns to the docs this phase answers to; align or challenge.
3. Confirm thesis + scope with the user — no task moves to in-progress before this.

**During:** work only from the board; decide-and-flag; keep the walkthrough doc current as you build (§ During a Phase).

**Closing ritual:**

1. The collaborative **Walkthrough** — every O/V point passed with the PO, point by point (§ Walkthrough).
2. The **Closing Checklist** (§ Closing a Phase) — decisions propagated to home docs and the load-bearing ones lifted to `decisions.md`, feature docs updated, trackers pruned, ROADMAP re-oriented.
3. **Distill + delete** — a compact record replaces the board and walkthrough.

### Mode 2 · System — tending the system

**Purpose:** Meta-work on the docs, workflow, and `/system` surface themselves — restructuring a tracker, rewriting these rules, reorganizing the doc tree, dashboard changes. Product-**agnostic** by definition, and the **inverse of a side phase**: the governance docs are its home ground. It must never settle product strategy in passing — if a strategic question surfaces mid-phase, it goes to Open Questions, not decided.

**Home ground:** CLAUDE.md, this file, ROADMAP structure, the trackers' formats, the templates, the doc tree, and the system surface's code (`lib/system.ts`, `app/system/`).

**Careful:** `decisions.md`'s prior entries (amend with a new dated entry, never rewrite history), and mechanical ripples into product-facing docs when a governance change lands (repoint the refs; don't touch their content).

**Gated:** product features, seeded content, strategy doc *content*. Not forbidden: suggest it, and it lands through a product phase.

**Opening ritual:**

1. **Name the friction** this phase fixes, and agree the scope with the user — system work is always done *with* the user, never solo.
2. **Open a board** from `_system-template.md` (`mode: system`) sized to the friction — a few lines for a small fix, workstreams for a build. Max one open; may run alongside a product phase, but never opens mid-walkthrough (doc churn collides with phase edits).
3. Orient: read the governance docs whole (CLAUDE.md, this file, `implementation/system-surface.md`), then **check `decisions.md` and the doc tiers** for prior settled calls the work touches — reopening one is a structured challenge (§ Doc Tiers), not a silent rewrite.

**During:** keep it lean — a system pass should leave the rule-set the same size or smaller, not bigger. Log decisions in `decisions.md` **as they're made** (this mode writes there directly; there's no walkthrough to lift from).

**Closing ritual:**

1. **Hand off for verification.** Before deleting anything, present the phase's durable output for the PO's final read — the artifact that outlives the board: the `decisions.md` entries, the surface/build state (`/system` renders, drift alarms silent), and anything worth a second look. The board isn't deleted until the PO confirms. (System work has no walkthrough — this light in-chat handoff is its verification moment, the analog of a product phase's Closing-Checklist gate.)
2. Every non-obvious call landed in `decisions.md` (challenges logged win or lose).
3. `implementation/system-surface.md` and/or this file updated in the same change, if the system's behavior changed.
4. `last-reviewed` bumped on every doc **reviewed** — not the ones only mechanically touched (§ Doc Tiers → Stamping `last-reviewed`).
5. Lands as its **own commit** (or PR), described as system work — mode-pure.
6. **Board deleted** (git is the record; `decisions.md` carries the calls). A build-scale system phase that shipped something durable leaves a compact record in `archive/phases/`, like a product phase.

### Mode 3 · Side — working the trackers

**Purpose:** Tracker-born work that runs alongside other phases — sweeping punch items, exploring an open question, **research** (a side-phase kind, not a fourth mode), or a verification pass. A side phase usually pulls **several** tracker items (a sweep), not one — single ≤30-min items wait in the punch list until a sweep collects them. Its board is light: the pulled items, checked off as they land.

**Home ground:** the code it changes, and **its own tracker rows** (moving them is the close).

**Careful:** the feature docs describing the code it changed — updated at close, `last-reviewed` bumped.

**Gated:** governance docs, other boards, strategy, tracker *restructuring* (moving your own rows ≠ reformatting the file), and resuming a paused phase (default answer: no — ask first). Not forbidden: surface it, and the user routes it to the right mode.

**Opening ritual:**

1. **Open a light board** from `_side-template.md` (`mode: side`) listing the tracker items pulled — e.g. "Sweep — P87 · P88 · P92" or "Explore §5". Orient: read each pulled item's refs and the feature docs of what it touches before acting.
2. **Check file-level overlap with the active phases' in-flight edits.** If they collide: defer the item, let the other phase settle those files first, or brief the session on the concurrent changes. (A side sweep and an open product phase editing the same file is the failure mode this prevents.)
3. **Spawned tasks only:** declare the files it expects to touch in the spawn prompt (Files: list) so the user can spot overlap before spawning.

**During:** stay on the pulled items. Meaningful new scope → surface it, don't expand silently. If an item grows a thesis or cross-surface coupling → stop; it's product-shaped — propose resuming a paused phase, opening a new one, or deferring the rest; the user picks.

**Closing ritual:**

1. **Hand off for verification** *(in-session closes; spawned/worktree tasks use the PR as the gate).* Before deleting anything, present the phase's durable output for the PO's check, shaped to what it produced: **code / UI work** → each changed surface as a pointer, `who's looking → /url → what to expect`; **research** → the doc's `summary:` + its load-bearing findings to sanity-check, and the tracker/question it answers. Plus the tracker rows being moved, and anything flagged. The board isn't deleted until the PO confirms. (No walkthrough doc — side work is quick; this is its in-chat verification moment.)
2. Feature docs whose described behavior changed → updated; `last-reviewed` bumped on those (§ Doc Tiers → Stamping `last-reviewed`).
3. **Its tracker rows moved in the same PR** — punch rows removed, §N markers updated, FCs promoted/removed; research lands its doc in `strategy/research/` (frontmatter + `summary:`) and updates the spawning marker. Nothing ends without its trackers moving.
4. One focused, mode-pure commit; **board deleted** (the moved rows + the commit are the record). **Spawned/worktree tasks additionally:** rebase onto current `main` before completing (conflicts are the side phase's problem, not the merger's — stale-vs-main work doesn't land), push a remote branch, open a PR as the merge surface.

---

## The Kickoff — the bootstrap before the loop

<!-- Prose only — NOT parsed by lib/system.ts (deliberately not a fourth mode; getWorkModel still parses exactly the three '### Mode N' headings above). The kickoff is the one-time ignition, not part of the recurring cycle. -->

The three modes govern the **recurring** work cycle. The **kickoff is the ignition that runs once, before the cycle begins** — the bootstrap that turns an empty template into a project. It is deliberately *not* a fourth mode, because it breaks the two traits every mode shares:

- **Modes recur; the kickoff happens exactly once, ever.**
- **Modes orient against the existing shelf; the kickoff has nothing to read — its job is to *write* the shelf** every later phase will align to (or challenge).

Two more things make it an outlier, and they're features:

- **It's interview-shaped.** It pulls the project out of the user — the seeded Open Questions are its prompts — and explains the system + its options as it goes, rather than building from a brief.
- **All ground is open — the one exception to the touch bands.** It makes both system choices (stack, CLAUDE.md, ROADMAP structure) *and* product choices (Vision, Scope, the first thesis), because it's *creating* the ground the bands later protect. You can't gate strategy content from a phase whose whole job is to author it, and you can't run a product phase to serve a vision that doesn't exist yet — the chicken-and-egg is exactly why the kickoff sits outside the three modes.

**How it ships and runs:** the template ships with the kickoff board **already open** at `phases/kickoff.md` (it's never re-run, so there's no template mold). Its board carries `mode: system` for the badge — it's meta-setup, done with the user — flagged as the bootstrap. Work it as a guided conversation; the step-by-step lives in the root `KICKOFF.md` (one home, many references — the board points there). At close it is **distilled + deleted** like any board, and the three-mode loop begins: from here on, every phase runs in one of the three modes and the touch bands apply as written.

---

## Glossary

<!-- PARSED by lib/system.ts (getGlossary) -> /system/glossary + the hub. Changing this section's SHAPE
     (the '- **Term** — definition' bullet form) breaks that page silently - the /system drift banner will name it.
     Check /system after editing. Spec: docs/implementation/system-surface.md -->

The system's terms, defined once. Used consistently everywhere — docs, boards, the `/system` surface (which renders these definitions from this section).

- **Phase** — the work unit: any chunk of work run through the rituals, in exactly one mode. Opens as a board, closes by distill + delete.
- **Session** — one chat. One phase per session is the strong default, not a law: a phase survives a force-ended chat, and a fresh session picking its board back up is continuation, not error-recovery.
- **Mode** — a phase's flavor: Product (building the product), System (tending the system itself), or Side (working the trackers). The mode sets the ritual's weight and focus, the board's template, the orient set, and the touch bands.
- **Kickoff** — the one-time bootstrap that runs before the three-mode loop: it writes the strategy shelf (rather than orienting against it) and opens all ground because it's creating everything. Not a fourth mode — the ignition. See "The Kickoff" above.
- **Board** — a phase's worklist and running record while open, in `phases/`, created from its mode's template. Scale varies by mode: product boards are heavy (workstreams + a walkthrough sibling); side boards are light (the tracker items pulled in); system boards fit the friction. Always `tier: working` while open; distilled and deleted at close — product phases leave a compact record.
- **Seed** — a queued phase's accumulation space, one file in `planning/queued/` for any mode: a pitch, dated notes, candidate scope, refs — never tasks. Folds into the board at phase open and is deleted.
- **Queue** — the ROADMAP's What's Next: upcoming planned work of any mode, one mode-tagged list, every row carrying a seed. A staging area, never a gate — urgent work opens a board directly.
- **Ritual** — a mode's defined opening steps (orient + touch-check included), during-rules, and closing steps. No phase is ritual-free.
- **Touch bands** — a mode's three editing tiers: **home ground** (edit freely, per the board), **careful** (update deliberately when the work bears on it, never in passing), **gated** (another mode's ground — suggest, don't edit). Bands gate pens, not eyes: reading is never gated.
- **Walkthrough** — a product phase's collaborative review doc: "Open for your call" + "Worth verifying" points, passed one by one with the PO before the phase can close.
- **Tracker** — one of the three standing lists holding *candidates* — quick, lean task notes waiting between phases: the punch list (P##), the Open Questions log (§N), and Future Considerations (FC##). Phases pull items at open (a side phase usually pulls several — a sweep) and move the rows at close.
- **Tier** — a doc's review cadence: bedrock · commitments · working · surface. Docs sink toward bedrock by surviving; reopening a settled one takes a structured challenge.
- **The law** — "derived, never authored": every `/system` page renders from the docs at build time. To change a page, change its source doc; if they disagree, the docs win.

---

## Product Lifecycle (Mode 1's rituals, in full)

The detailed rituals behind Mode 1 above. Every product phase follows this lifecycle. **Do not skip steps.**

**Template:** New product phases start from `phases/_product-template.md`, which includes embedded opening and closing checklists. The checklists are part of the board — they get marked done alongside the tasks.

### Opening a Product Phase

Before writing any code for a new phase, complete the **Opening Checklist** on the phase board:

1. **Ring 1 — read the strategy shelf whole.** The evergreen strategy docs (`strategy/` root) plus CLAUDE.md and the Work Model. They're few, reading is fast, and this is exactly the set the Careful band lets a product phase touch — a phase can only carefully-edit what it oriented on. Reading the vision here IS bedrock's check-up (it has no staleness clock because it gets read at every open); state on the board, in one line, how this phase serves it. **Align or challenge:** if the work presses on a commitment — or on bedrock — don't quietly bend the work to the doc or the doc to the work; raise a structured challenge (§ Doc Tiers). Sometimes the challenge should win: new ideas pressing on old ones is how new directions, features, and strategy are born.
2. **Read the phase board** in `phases/`. Understand every task and its references.
3. **Ring 2 — active alignment.** The docs this phase is *answerable to*, read as instruction rather than background: every doc the board references, every doc whose `read-when` matches this phase's subject, and any domain gate the project defines (a subject area that always requires reading a specific doc first). Everything else stays a free pull mid-build — reading is never gated.
4. **Review Open Questions** (`planning/Open Questions & Assumptions Log.md`) — your phase's **area**, not all of them. Resolve or flag before building.
5. **Audit for conflicts.** Compare what the phase proposes against what's currently built. Raise anything that contradicts existing code, strategy docs, or feature docs. Don't assume the phase board is correct — it may have been written before recent changes.
6. **Re-check anything flagged stale.** If a referenced doc is past its tier's threshold (§ Doc Tiers — 90d commitments, 30d working), review it now and stamp `last-reviewed`.
7. **Scan the Punch List and Future Considerations.** Check if any open items overlap the new phase's scope — adopt them into the board or note the overlap. If this phase **fires a Future Consideration's trigger**, promote that FC onto the board now rather than building blind to it.
8. **Confirm scope.** If the phase has tasks that feel like they belong in a different phase, or if scope has grown, discuss before starting.

**Enforcement:** Run the checklist from here — the board does **not** copy it (that duplication is what drifts). What the board's *Open notes* records is what the checklist surfaced: the one-line statement of how the phase serves the vision, conflicts found, docs re-checked, scope calls made. No note, no start.

### During a Phase

- Work only on tasks from the **current phase board**.
- **Decide-and-flag — bias toward action.** Make reasonable design and implementation calls during the build instead of stopping at every fork to ask. Two things still get raised mid-build:
  - **(a) True blockers** — you can't take the next step and can't unblock yourself.
  - **(b) Scope or strategy shifts** — anything that contradicts the phase board, expands what the phase ships, affects another phase, or touches a paused phase.

  Everything else — design choices, copy variants, structural picks where multiple answers are reasonable — gets MADE during the build and surfaced as an **"Open for your call"** item on the phase walkthrough. The reviewer ratifies or redirects there. "No feature sprawl" still applies: if the call would EXPAND scope, that's a scope shift and gets raised.
- When you finish a task, update the phase board status immediately.
- If you change a feature, update its **feature doc** in `features/`.
- If you make a significant decision, record it in the relevant feature doc under a "Decisions" section.
- **If a code change makes an active walkthrough item's description inaccurate, update the walkthrough item in the same edit.** Stale walkthrough text is worse than no walkthrough — verifiers look for behaviour that's no longer there (see `phases/_walkthrough-template.md` → "Drift rules").

### Walkthrough (the review stage)

**The walkthrough is a main stage of the phase, not a step inside closing.** Once the build is committed, the phase enters a collaborative review: the PO and the agent go through the walkthrough doc **together, point by point.** This is where the bulk of the design refinement happens — building gets a surface ~80% there; the walkthrough gets it right. **Expect many iterations.** Budget for it; don't rush toward close.

How it runs:

- **The agent prepares the walkthrough doc as it builds** (`phases/<name>-walkthrough.md`, from `_walkthrough-template.md`) — "Open for your call" (O) items, "Worth verifying" (V) items, and an append-only Decisions log. It is ready for review when the build is committed; it is **not** authored from scratch at close.
- **Every checkable item names where to look + what to expect, and holds exactly one check.** Each O/V item carries the exact URL/view + a one-line expected result. If an item bundles two surfaces or behaviours, split it into two.
- **The PO drives the review with the agent.** Each O/V point is passed or sent back. Resolved O items get checked + a one-line pointer (full rationale lands in the Decisions log — don't duplicate).
- **The phase is not ready to close until every O and V point has passed** and the Decisions log reflects what actually shipped.

Closing comes *after* the walkthrough passes, and **consumes** it — the Decisions log is the propagation worklist.

### Closing a Phase

These steps are the **canonical closing process — the single source of truth.** Work through them in order. The phase board does **not** repeat them; it carries only **phase-specific** close items under its "Close notes" section. Do not copy these steps onto the board — that duplication is what drifts.

1. **Confirm the walkthrough passed.** Every O and V point checked, acceptance criteria holding against the running app.
2. **Sweep the walkthrough's "Decisions surfaced" section.** A plain log — process each entry in order: update the named home doc per the `→` annotation, then check it off in the phase board's Closing Checklist. **The walkthrough cannot be archived until every entry has been propagated.** **Then lift the load-bearing subset into `decisions.md`** (What/Why/Where, newest first) — only entries that would surprise a reader in six months or that future-us might reopen.
3. **Update all affected feature docs.** Scan for anything else the phase changed (component patterns, edge cases, copy conventions). The feature docs must reflect the new reality.
4. **Update the Open Questions log.** Close any questions this phase resolved — and **compress each resolved item to a one-line pointer at its home doc.** Add any new questions that emerged.
5. **Update ROADMAP.md — re-orient forward.** The phase's row already left the roadmap at open; refresh the Where-We-Are current-phase line. Then update the forward view *informed by what this phase built and revealed*. Keep it strictly **future-focused** — never log *what shipped*. The Roadmap tracks objectives and what's next, not history.
6. **Review CLAUDE.md.** If the phase changed navigation, key components, or project structure, update the project instructions.
7. **Review the running trackers — Punch List and Future Considerations.** Check completed punch-list items since the last close for doc impact. Then **prune Future Considerations**: every FC this phase **shipped** is removed; every FC **partly** shipped is rewritten to lead with the remaining open work; every FC whose **trigger fired** is confirmed promoted out.
8. **Distill and delete.** Write a **compact record** (~15 lines: frontmatter with `status: archived` + dates, the thesis, the what-shipped close banner, a pointer to its `decisions.md` entries) at `docs/archive/phases/<name>.md`, then **delete the full board and walkthrough files**. Precondition: step 2 fully done.
9. **Trim pass.** Skim the Roadmap, CLAUDE.md, and touched docs. Cut anything stale, redundant, or duplicated.
9a. **Structural audit.** Run these checks — any hits get fixed before phase close:
   - `grep -rl "status: archived\|status: complete" docs/phases/` should return nothing but the `_*-template.md` molds (never) and legitimately paused phases. Anything else — delete it; the archive copy exists.
   - Compare filenames in `docs/phases/` vs `docs/archive/phases/`. Any overlap means a cleanup was skipped — delete the live copy.
   - Scan docs in `strategy/`, `features/`, `implementation/` with `last-reviewed` older than 21 days. Review or bump.
10. **Strategic review.** The most important step. Stop building and think. Read the Open Questions log, the Roadmap, the relevant strategy docs, and the next phase's scope. Then present a brief covering: **what changed** (how the work shifts understanding), **open questions worth resolving now**, **alternatives and challenges** (overbuilding? underbuilding? simpler paths?), **research suggestions**, and **next phase readiness**. This isn't a checkbox — it's a thinking mode.

**Enforcement:** The closing checklist items must all be checked off before a new phase can be opened.

---

## The Planning Trackers

<!-- PARSED by lib/system.ts (getTrackerModel) -> /system/trackers. Changing this section's SHAPE
     (the tracker table columns, the 'How work flows' bullets, the bold 'Shared rule' lede) breaks that page silently - the /system drift banner will name it.
     Check /system after editing. Spec: docs/implementation/system-surface.md -->

Three running lists in `planning/` hold **candidates** — quick, lean task notes that aren't on a board or in the queue. Each is a different **stance** on not-yet-done work — keep an item in the one that matches its stance, and move it when the stance changes. Phases pull from them at open; side phases usually sweep several at once. Keep the notes lean: an item that bloats, or a cluster of connected items, is a phase trying to be born — pull it out.

| Tracker | Holds | Unit | Default exit |
|---------|-------|------|-------------|
| `punch-list.md` | Known small fixes (≤30 min) | the fix | **Removed** when fixed — the commit is the record |
| `Open Questions & Assumptions Log.md` | Unanswered questions blocking future work | the question | **Compressed** to a one-line pointer when resolved |
| `Future Considerations.md` | Known directions waiting for a trigger | the trigger | **Removed** when shipped (archive is the record), or **promoted** when the trigger fires |

**How work flows between them and into phases:**

- An **Open Question** resolves → it becomes a **Future Consideration** (direction now known, trigger pending), a **punch-list** item (small fix), a **phase** (coordinated work), or just a decision recorded in its home doc.
- A **Future Consideration**'s trigger fires → it **promotes out** to the punch list, a phase board, or feature scope.
- A **punch-list** item grows past ~30 min or sprouts an open design call → it **promotes** to a phase board (or to Open Questions if the open part is a question).
- Any of them, once it's multi-task with real design thinking → opens a **phase** (the rows leave the tracker; the board gets the cohesive chunk).
- Any of them, needed **sooner than later** → gets a **seed** on the queue, or opens a board directly, depending on how soon it'll be picked up.

**Seeds (`planning/queued/`) — the fourth stance, one file per queued phase, any mode.** A seed is *committed work accumulating context*: the ROADMAP row stays compass-weight (1–2 sentences), and the seed holds the growing plan — a pitch, dated **Notes & finds** (any mode may append a note when something relevant surfaces), candidate scope, refs — plus a `mode:` in its frontmatter that badges the roadmap card. **Never tasks or workstreams** — a task list in a seed is a shadow board; if you're writing one, open the phase. Distinct from a Future Consideration (an FC is a *maybe* waiting on a trigger; a seed's phase is already on the queue). **Every queued ROADMAP row carries a seed** — a bare one keeps the template's full section structure even where sections hold little. The row's refs live in the seed, not the ROADMAP (one home, many references). At phase open the seed feeds the board and is **deleted**; it never outlives the queue.

**Shared rule — prune on resolve.** None of these is an archive. When an item is done it *leaves* — removed, or compressed to a pointer at its home doc / phase archive. Reassessment is ritualized at phase open (scan for overlap + fired triggers) and phase close (prune shipped, compress resolved). Don't let finished items accumulate behind banners or strikethroughs — that bloat is the thing these rules exist to prevent.

---

## Doc Tiers & Review Physics

<!-- PARSED by lib/system.ts (getTiers + getTierPhysics) -> /system/tiers + doc staleness flags. Changing this section's SHAPE
     (the tier table's columns (Stale-after drives the flags) and the bold physics paragraph labels) breaks that page silently - the /system drift banner will name it.
     Check /system after editing. Spec: docs/implementation/system-surface.md -->

**A doc's tier says how guarded it is** — what it takes to change it, and nothing else. Tier follows from what the doc is about, not from a rank to climb: most docs sit where their subject puts them (a punch list is surface by nature, the vision is bedrock by nature). Movement happens, but it's the exception — see Sinking, below.

| Tier | What lives there | To change it | When to re-check | Stale after |
|------|-----------------|--------------|------------------|-------------|
| **bedrock** | The settled vision (`strategy/Vision.md`) | Structured challenge — logged whether it succeeds or fails | Every phase open — reading it *is* the check | — |
| **commitments** | Strategy models, implementation references, feature docs, this file, `decisions.md`, ROADMAP | Deliberate — it's a promise, so changing it is a decision and lands in `decisions.md` | At phase boundaries, or when building contradicts it | 90 days |
| **working** | Active boards, docs mid-revision, Open Questions, Future Considerations | Freely — that's what the tier is for | Constantly, by being used | 30 days |
| **surface** | Punch list, derived pages | Freely; if it's derived, change its source instead | Never — it churns by nature | — |

**Read is not review.** Bedrock is the *most-read* tier and the *least-changed* one — a foundation's whole job is to be the thing every session aligns to. Guarded means hard to change, never rarely consulted. But reading is *how* a doc earns a re-check: you read the vision at a phase open, and if it no longer matches the world, that mismatch is what a structured challenge is for. When to read is set by each doc's `read-when` and its mode's opening ritual, not by tier.

**Stamping `last-reviewed`.** It records when someone last confirmed the doc is *accurate* — not when its bytes last changed. A material edit bumps it, and so does a deliberate check that finds nothing to change (the purest case). A mechanical edit — a ref repoint, a rename, a typo, a link fix — does **not**: you fixed a token, you didn't read the doc.

**No clock on bedrock.** A vision untouched for 200 days is a foundation holding, not rot; flagging it would nag us to churn the one thing that shouldn't churn. Bedrock has no timer because it has something better: it is read at every phase open, so a foundation that stopped matching the world gets caught by use, not by a calendar.

**Sinking (down, toward foundational):** nothing *starts* at bedrock — docs earn their way down by surviving contact. A working draft that gets built against and holds becomes a commitment; a commitment that holds across phases can sink to bedrock. A sink is recorded in `decisions.md` with a date and what it survived.

**Structured challenge (reopening a settled tier):** requires three things stated up front — the *reason*, *what has changed* since it settled, and *the proposed revision*. Challenges are logged in `decisions.md` **whether they succeed or fail**. This applies to everything settled, including this system itself. Two guarantees: if we're re-debating something settled without new information, name the tier and move on; if we keep hitting the same wall against a settled thing, the wall *is* "what changed" — challenge it.

Tiers govern **docs**, not coding rules — hard gates (if your project defines any) are rules, not tiers. The tier board renders live at `/system/tiers` with staleness flags; staleness is a signal to review, not an obligation.

---

## Workflow Rules

### No feature sprawl
- If it's not on the phase board, don't build it without discussion.
- UI tweaks and bug fixes during a phase are fine, but new features require a phase home.

### Task references
- Every task should reference the docs it depends on.
- Before starting a task, **read the referenced docs**. After finishing, **update them if anything changed**.

### Frontmatter maintenance
- Every doc has YAML frontmatter: `status`, `tier`, `last-reviewed`, `read-when` (plus `category`/`tags` where the family uses them).
- **`read-when`** answers *when is this doc relevant to what I'm doing?* — the condition that should pull it open. It is a **read** condition, not a review schedule: a session's opening ritual reads the docs whose `read-when` matches the work.
- Update `last-reviewed` when you **review** a doc — a material edit, or a deliberate check that finds nothing to change. Not on mechanical touches.
- Valid statuses: `active` (living doc), `draft` (in progress), `archived`.
- `tier`: `bedrock | commitments | working | surface` — see "Doc Tiers & Review Physics."
- **Strategy docs** add `summary:` — the one-line thesis rendered on `/system/strategy`.
- **Feature docs** add: `feature-status: imagined | staged | built`, `feature-kind: product | demo` (if the project has a demo layer), `area:` (funnel/domain stage, product features only), `routes:` (comma-separated).
- **Boards and seeds** add `mode: product | system | side` (see "The Work Model").
- These fields are load-bearing: `/system` renders from them (derived, never authored — `implementation/system-surface.md`). A wrong field is a wrong dashboard.

---

## Design & Code Conventions

> **Project-specific — fill at kickoff.** The stack-neutral *principles* below are part of the system and stay; the concrete rules (framework, styling, tokens, naming) are yours to define once the stack is chosen. See `KICKOFF.md`.

### Reuse-first (check before building new)

**Before building ANY new component, abstraction, or pattern, search for an existing one to reuse or consolidate with.** The burden is on the builder to find the existing thing, not on the reviewer to point it out. Do the reuse pass first and **state the result before building** — "the existing thing is X" or "nothing matches, because…". Prefer extending a shared thing (an opt-in prop) over a new one.

### New = flagged, not silent

When nothing fits and new is genuinely warranted, surface it before creating — what you searched, why nothing fits, the proposed shape. Never introduce a parallel variant / abstraction silently.

### _(Project-specific conventions go here — styling system, tokens, naming, accessibility baseline, dead-code discipline, hard gates.)_

---

## Doc Structure

| Folder | What goes here |
|--------|---------------|
| `strategy/` | Product direction, user models, scope. Research **inputs** live in `strategy/research/` — kept separate from the evergreen strategy docs. |
| `planning/` | Cross-phase running lists that feed scheduling: `Open Questions & Assumptions Log.md`, `Future Considerations.md`, `punch-list.md`, and `queued/` (one seed per queued ROADMAP row) |
| `features/` | Feature specs — what's built, key decisions, future plans |
| `implementation/` | Technical references, coding standards, component catalog |
| `phases/` | Active boards (any mode) + walkthroughs, plus the `_product-template.md` / `_system-template.md` / `_side-template.md` / `_walkthrough-template.md` molds. Closed boards are distilled + deleted; product phases leave a compact record in the archive. |
| `archive/` | Completed/superseded docs kept for reference |
| root | Meta docs (this file, ROADMAP, `decisions.md`, CLAUDE.md) |

**Meeting notes and prep live outside the repo.** They're ephemeral *input*, not project knowledge — whatever a meeting settles lands in `decisions.md`, a strategy doc, or a tracker. `docs/` holds what the project knows, not the conversations it came from.

---

## Doc Hygiene Rules

These prevent the documentation from bloating over time. **Treat these as seriously as the code rules.**

### One home, many references

Every piece of information has exactly one home doc. Other docs reference it — they don't repeat it.

| Information type | Home doc | Other docs should... |
|-----------------|----------|---------------------|
| Product decisions, strategy | `strategy/` docs | Reference: "See strategy/Vision.md" |
| What a feature does, how it works | `features/` doc for that feature | Reference: "See features/<name>.md" |
| Phase-specific tasks | Phase board in `phases/` | Not appear in the Roadmap or feature docs |
| Open questions | `Open Questions & Assumptions Log.md` | Not be duplicated in strategy or feature docs |
| Build history, what was shipped | `archive/phases/` | Not be summarized in the Roadmap |
| Why a rule exists, when it was ratified | `decisions.md` | **State the rule, not its provenance.** No "(ratified <date>)" in a doc's own prose |

**The test:** If you're writing something and it already exists elsewhere, write a reference instead. If you can't point to where it lives, then this is the home — write it here and reference it from elsewhere.

### The Roadmap is a compass, not a changelog

The Roadmap tracks: where we're going, what phase we're in, what's coming next, key strategic considerations. It does NOT track: what was built in previous phases (that's `archive/`), detailed task lists (that's phase boards), or current state assessments.

When closing a phase, do NOT add a completion summary to the Roadmap. Take the finished phase off the forward list and archive its board — that IS the record. Let what the phase revealed *re-orient* the forward view, but express it as direction, never as a log of what's done.

### When adding new information

1. **Does a home doc already exist for this?** → Add it there, reference from elsewhere.
2. **Am I duplicating something?** → Stop. Write a reference instead.
3. **Am I adding tasks to a strategy doc?** → Tasks belong in phase boards.
4. **Am I making a doc longer?** → Could I make it shorter instead?

### Periodic cleanup

At every phase close: **trim pass** (cut stale/redundant/duplicated), **challenge the product** (flag anything overcomplicated or inconsistent with the vision), **question the docs** (are we maintaining docs nobody reads? documented twice? could two merge?).
