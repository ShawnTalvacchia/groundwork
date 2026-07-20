---
category: meta
status: active
tier: commitments
last-reviewed: YYYY-MM-DD
read-when: "phase close (lift load-bearing walkthrough decisions here), retrospectives"
---

# Decisions log

The long-term institutional memory: dated design + product decisions, newest first. Each entry answers **What** we decided, **Why** (alternatives considered), and **Where** it shows up.

How this fits the pipeline: walkthrough docs capture decisions during a phase (append-only "Decisions surfaced" sections). At phase close, the **load-bearing** entries get lifted here so they survive the archive. Off-phase decisions (PO calls, system work) land here directly. Don't log every call — only ones that would surprise a reader six months out, or that future-us might reopen.

## Format

```
## YYYY-MM-DD · Short title

**What:** One sentence stating the decision.
**Why:** 1-3 sentences on reasoning. Name the alternatives considered.
**Where:** Files / surfaces / docs affected.
```

## Entries

<!-- PARSED by lib/system.ts (getDecisions) -> /system/decisions + the Structure overview. Changing this section's SHAPE
     (the '## YYYY-MM-DD · Title' headings and bold What/Why/Where fields) breaks that page silently - the /system drift banner will name it.
     Check /system after editing. Spec: docs/implementation/system-surface.md -->

## 2026-07-20 · Light boards report real progress

**What:** `getActiveBoards` now counts a light board's `## Items` checkboxes toward its done/total when it has no `## Workstream` sections, so system/side/kickoff boards show real progress (e.g. Kickoff "0/6") instead of "0/0". The closing checklist (`## Close…`) is excluded.
**Why:** Only heavy (product) boards had workstreams, so every light board read "0/0 tasks" even with a full item list — misleading on the Work surface. Excluding the closing checklist mirrors heavy boards, whose Closing Checklist doesn't count toward build progress, so "progress" always means the work, not the close ritual.
**Where:** `lib/system.ts` (`getActiveBoards`); spec updated in `implementation/system-surface.md` (Active board row).

## 2026-07-20 · The kickoff is the bootstrap, not a fourth mode

**What:** Recognized the kickoff as a one-time **bootstrap** that runs before the three-mode loop — documented in prose (`CONTRIBUTING.md → The Kickoff` + a Glossary term), shipped as a pre-opened `phases/kickoff.md` board (`mode: system`, flagged bootstrap) carrying the fill-out-the-project checklist. **Not** encoded as a fourth mode.
**Why:** The kickoff breaks the two traits every mode shares — it runs once (modes recur) and it *writes* the strategy shelf instead of orienting against it (there's nothing to read yet). It also opens all ground (system + product), the one exception to the touch bands, because it's *creating* the ground the bands protect. A real fourth mode was rejected: it permanently enlarges the model (parser + `modes===3` invariant + badges) for a once-per-project event, violating "leave the rule-set the same size or smaller." Splitting into system+product phases was rejected too: you can't run a product phase to serve a vision you're authoring (chicken-and-egg). Shipping the board pre-opened (vs a queued row) matches "urgent work opens a board directly" and gives the adopter immediate direction on first boot.
**Where:** `docs/CONTRIBUTING.md` (The Kickoff section + Glossary), `docs/phases/kickoff.md` (the shipped board), `CLAUDE.md` (touch-band exception), `KICKOFF.md` (First run reframed to the shipped-open board). No parser or invariant changes — `getWorkModel` still parses exactly three modes.

## 2026-07-20 · Layer B: the `/system` dashboard, ported into the template

**What:** Ported Doggo's derived-never-authored `/system` dashboard (the doc parsers, the Next.js pages, the styleguide) into the template so it renders live from the Layer-A docs, and **recalibrated the drift invariants to presence-not-count** so a fresh project boots with zero alarms.
**Why:** The template shipped the methodology (Layer A) but no rendered surface. Doggo's stock invariants assume a mature repo (≥10 archived phases, ≥30 docs, ≥5 decisions, non-zero trackers) and would fire on every empty list day one — the exact opposite of "renders cleanly." Recalibration keeps the *shape* checks (a populated list with a malformed row still alarms) while dropping the count floors. Alternative considered: loosen the styleguide invariants too — rejected, because we ship a real starter design system that meets them (it's a selling point, not a stub).
**Where:** `lib/derivation.ts` (the recalibrated invariants + a calibration note), `lib/system.ts` (README-skip robustness), all of `app/system/**`, `lib/{system,styleguide,theme}.ts`. Spec: `implementation/system-surface.md` → Drift alarms.

## 2026-07-20 · Starter design system — Doggo's token contract, a fresh palette

**What:** Authored `app/globals.css` as a clean starter design system: it keeps Doggo's **token names** (the `@theme` utility namespace + semantic layer the ported pages reference) but uses a fresh neutral + indigo palette, and drops Doggo's product-specific token families (volunteer/violet, dog radius, sidebar/nav layout, walkthrough chrome).
**Why:** The ported `app/system` pages and `system.css` reference hundreds of Tailwind utilities derived from Doggo's token namespace (`text-fg-primary`, `bg-surface-top`, `rounded-panel`, `gap-md`…), so the *names* are load-bearing — an arbitrary design system would leave the dashboard unstyled. The *values* are free, so the palette is a neutral starting point the adopter re-skins, not Doggo's brand. Meets the styleguide parser thresholds (271 tokens, ≥12 root / ≥8 theme sections, the `SEMANTIC TOKENS — Surface` + `Font Size` sections) so the styleguide renders complete on first boot.
**Where:** `app/globals.css`; the parser contract it satisfies is `lib/styleguide.ts` + the `getStyleguide` invariants in `lib/derivation.ts`.

## 2026-07-20 · Starter component set instead of Doggo's product demos

**What:** Replaced the one product-coupled file (`components-demos.tsx`, which imported ~17 Doggo components) with a basic starter set — `Button` · `Input` · `Toggle` · `Badge` plus the ported `TabBar` · `ThemeToggle` · `PillToggle` — and relaxed the component-inventory invariant to presence-not-three-dirs.
**Why:** The styleguide's Components page demos live components (the derived principle in component form). Doggo's demos can't port (product coupling); shadcn's parallel `--background/--primary` theme would fight the token-driven styleguide. A small set styled from the template's own semantic tokens is the honest "basic design system skeleton" the PO asked for — a starting point, re-themes for dark for free. The inventory invariant no longer demands `ui · overlays · layout` all be non-empty; the adopter grows overlays/layout.
**Where:** `components/ui/*`, `app/system/styleguide/components/*`, the `getComponentInventory` invariant in `lib/derivation.ts`.

## 2026-07-20 · No unlock gate; README folder-guides excluded from the registry

**What:** Dropped Doggo's password gate (`proxy.ts`) — `/system` is open in local dev, kept `noindex`. Separately, `README.md` folder guides are now excluded from the doc-registry walk and the archived-phase walk.
**Why:** A template shouldn't ship a placeholder password; the adopter adds real auth at deploy. The folder READMEs (navigation scaffolding, no frontmatter) would otherwise trip the `getAllDocs` frontmatter checks and render a phantom timeline entry from `archive/phases/README.md` — excluding them is the spec-honest fix (a README is a folder guide, not a parsed knowledge doc).
**Where:** gate: omitted (no `proxy.ts`); `app/system/layout.tsx` keeps `robots: noindex`. README-skip: `lib/system.ts` (`walk` + `getArchivedPhases`).
