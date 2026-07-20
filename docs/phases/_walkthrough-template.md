---
status: active
tier: working
last-reviewed: YYYY-MM-DD
read-when: "Update as items are walked, edit as scope adjusts"
---

# Phase Name — Walkthrough

Verification checklist for the Phase Name phase. **Concise by design** — three priority categories instead of an exhaustive per-workstream checklist. Trust that automated checks + visual sanity passes ran during the build; surface only what's worth the reader's judgment, what risks regression, and what they should glance at to confirm the phase thesis lands.

**How to use:** run the app, walk top-to-bottom (categories ordered by "needs your eyeballs most" → "least"). `[ ]` not yet walked · `[x]` walked, no issues. The Decisions log at the bottom is a plain append-only log.

<!-- Optional context block — phase-specific seed data, dates that matter, etc. Keep it terse. Drop entirely if not needed. -->

---

## Open for your call

Decisions the author made that warrant a second look — direction, not bug-hunt. These are the calls made during the build instead of stopping to ask — surfaced so the reviewer can ratify or redirect (see `CONTRIBUTING.md` → "During a Phase" → decide-and-flag). Each one describes a real call the author made that someone else might land differently, and tells the reader the quickest path to see it in context.

Identifier prefix: **`O`** (O1, O2, ...).

- [ ] **O1. {One-line framing of the call.}** Why it could go another way. ({who's looking} → `/url` to see it.)
- [ ] **O2. ...**

---

## Worth verifying

Interaction nuance, complex state, round-trips, anything author-confidence is genuinely uncertain about. Each item describes a behavior the reader needs to drive themselves — an automated check or a static screenshot wouldn't have caught it.

**Every check names where to look and what to expect.** Give each item the exact URL/view + a one-line *Expect:*. A check the reader can't locate is not a check. Add a *who's-looking* qualifier only when who's looking changes what's shown (an edit/self surface, a permission-gated view, a viewer-specific default); omit it when the surface looks the same to everyone.

**One check per item — split freely.** If an item bundles two surfaces or two behaviours, that's two items. No penalty for many small, clearly-pointed items; the penalty is a fat item that buries three checks behind one URL.

Identifier prefix: **`V`**. Group a workstream's checks under a `### V1 — {workstream}` sub-heading and **number each `V1.1`, `V1.2`, …**.

### V1 — {workstream}

- [ ] **V1.1 {What this one check proves.}** `{/exact/url}` → {the one action}. *Expect:* {the single observable result}.
- [ ] **V1.2 {The next distinct check — its own item, its own URL.}** ...

---

## Surfaces to glance _(usually skip)_

**Only include when V can't naturally exercise a shipped surface** — a styleguide render, a static seeded view, a print/export view, a CSS-only state no behavioral test reaches. Driving a V item already lands the reviewer on the surface, so a separate glance pass is almost always redundant. Most phases have 0 G items. If this section ends up empty, delete it before shipping.

Identifier prefix: **`G`** (G1, G2, ...).

- [ ] **G1.** {who's looking} → `/url` — one-line description of what should be there.

---

## Decisions surfaced during walkthrough

A running **log** (not a checklist) of decisions, design changes, or rationale that surfaced during walkthrough discussion. **Append as you walk.** Each entry carries a `→ target-doc.md` annotation indicating where the decision needs to land. The phase-close sweep processes each entry by propagating it to the named home doc; the entries themselves stay in the archived walkthrough as the historical record.

Format:
```
- **{Decision in one line.}** {Optional one-line context.} → `features/foo.md`
- **{Implementation-only change.}** {What/why.} → no feature-doc update needed
```

<!--
================================================================================
Authoring conventions — read before writing or expanding this walkthrough.
================================================================================

THE THREE CATEGORIES — what belongs where:

  Open for your call — calls the author made where another reasonable person
    would land differently. Lead with the call itself. Zero of these is fine:
    "No open calls — everything landed per spec."

  Worth verifying — behaviors that need a human at the keyboard. Multi-step
    round-trips, interaction nuance, gates that depend on viewer context.
    NOT for things that work-or-don't at a glance.

  Surfaces to glance (usually skip) — only shipped surfaces V can't exercise.
    If it overlaps any V item, delete it.

ANTI-PATTERNS the structure exists to fight:

  1. Listing every viewer × surface permutation. If verifying X once implies it
     works everywhere (same code path), list it once.
  2. Spelling out what another item exercises in passing.
  3. Pure-visual checks dressed up as verification. Either it's fine (don't list
     it) or it isn't (fix it, don't ask the reader to flag it).
  4. Decisions buried in workstream items — promote to the Decisions log, shrink
     the item to "verify X behaves correctly."
  5. Stale items after mid-build refactors — edit the item in the same change.
  6. Bundled or unpointed checks — one check per item; every item carries an
     exact URL + a one-line Expect. Two surfaces = two items.

DRIFT RULES — the two failure modes this template fights at phase-close:

  1. Code change → update the walkthrough item in the SAME edit. Stale
     walkthrough text is worse than no walkthrough.
  2. Decisions are current-state, not an event log. If a logged decision gets
     superseded, EDIT the existing entry — don't append alongside the stale one.
     The signal you got this wrong: at close, one surface has multiple Decisions
     entries with contradictory descriptions.
-->
