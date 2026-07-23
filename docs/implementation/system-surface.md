---
category: implementation
status: active
tier: working
last-reviewed: YYYY-MM-DD
read-when: "/system surface changes — new page, IA change, doc-format change"
---

# The System Surface (`/system`)

## What this is

`/system` is the project's knowledge system rendered as a reference layer inside the app — noindexed and absent from the product nav. It exists so the state of the work is legible at a glance while the docs stay the single source of truth.

Because the site deploys from pushes, the surface updates with every commit: push → rebuild → the pages re-read `docs/`.

> **⚠ There is no auth gate — add one before deploying publicly.** The template ships `/system` **open**, protected only by `robots: noindex` (`app/system/layout.tsx`), which stops indexing but not access. Every page here renders your strategy shelf, roadmap, open questions, and decisions log. `noindex` is not access control: anyone with the URL can read all of it. Deploying to a public host without adding real auth (middleware, platform password protection, or an access-controlled deployment) publishes the project's entire internal record. A placeholder password isn't shipped on purpose — the adopter picks the mechanism their host and threat model call for.

> **This doc is the spec; the code is in the repo.** The dashboard ships with the template — `lib/system.ts`, `lib/derivation.ts`, `lib/styleguide.ts`, `app/system/*`, and the starter `app/globals.css`. Run it with `npm run dev` and open `/system`. This spec is the contract the parsed docs uphold, and the parser markers in those docs (`<!-- PARSED by … -->`) point back here.

## The law: derived, never authored

Every page renders from the markdown in `docs/` at build time — frontmatter, statuses, tiers, list items. Nothing on the surface is hand-maintained; **to change a page, change its source doc.** A visual layer that can drift is a second thing to review, which is the exact failure this system exists to prevent. If the surface disagrees with the docs, the docs win — the build is stale.

The parsers adapt to the docs' existing formats. The formats never bend to the parsers — the identifier schemes (`P##`, `§N`, `FC##`, the mode headings) are load-bearing across docs, code comments, and memory.

## Shape: hub and spoke

A fixed header carries the main tabs — **System** + three groups (Work · Structure · Method) as segmented pills. Each group's pages render as subtabs in the body. The header and subtab row stick as one block; the body scrolls under.

**Tabs vs drill-ins.** A subtab is for a surface worth *exploring*; anything you merely *consult* is a card on the group's overview with the full page one click away. **Cap: four subtabs per group.** A tab never ejects you from the surface — bring content *in* rather than linking out.

## The three groups

- **Work** — *what's being done and what's waiting*: the active board(s) badged by mode, the roadmap, and the three trackers.
- **Structure** — the shape of the project: the feature registry, the strategy shelf, the docs index (by tier + freshness), the shipped timeline, the decisions log, and the styleguide.
- **Method** — *how we work*, rendered rather than linked: the phase arc, the three modes with their full rituals, the trackers model, the tier physics, and the glossary. The rulebook docs (CONTRIBUTING, CLAUDE.md) appear only as source notes at the foot of the page they back.

## Page → source mapping

| Page | Renders from |
|------|--------------|
| Overview | counts from every list + the Glossary + `ROADMAP.md` Where We Are + doc freshness |
| Active board(s) | `docs/phases/*.md` (templates excluded) — the board in full under a mode badge + progress. Heavy boards derive it from each `## Workstream` section's Status-cell task rows + legacy checkboxes; light boards (no workstreams) count their `## Items` checkboxes directly, excluding the closing checklist |
| Roadmap | `ROADMAP.md` (Where We Are, the queue table — any mode, horizon) + `planning/queued/*.md` seeds (`getQueuedSeeds` — frontmatter + lede feed the cards, `mode:` badges each; the whole card links to its seed; the invariant is bidirectional and mode-agnostic — an orphaned seed or a seedless row trips the drift banner) |
| Questions | `planning/Open Questions & Assumptions Log.md` (`## N. Topic` → `### Question?` with Area/Opened/Priority/Thinking/Resolves-when; everything in the file is open — resolved is deleted) |
| Punch list | `planning/punch-list.md` (the `P##` table) |
| Future | `planning/Future Considerations.md` (`FC##` sections, Trigger/Context/Effort fields) |
| Docs | `tier:` frontmatter across live docs + per-tier staleness heuristics (working >30d, commitments >90d) |
| Features | `docs/features/*.md` frontmatter (`feature-status`, `feature-kind`, `area`, `routes`) |
| Strategy | `docs/strategy/**` frontmatter (`summary` one-liners; grouped by tier + subfolder) |
| Timeline | `docs/archive/phases/*.md` (walkthroughs skipped) — month-grouped, newest first |
| Decisions | `docs/decisions.md` (`## date · title` entries, What/Why/Where) |
| Method → How we work | `CONTRIBUTING.md § The Work Model` — parsed: lede, shared rules, per-mode purpose / touch bands / numbered rituals |
| Method → Trackers | `CONTRIBUTING.md § The Planning Trackers` |
| Method → Tiers | `CONTRIBUTING.md § Doc Tiers & Review Physics` |
| Method → Glossary | `CONTRIBUTING.md § Glossary` |
| `/system/docs/<path>` | any single doc rendered whole (archive + `_`-prefixed templates included); relative `.md` links resolve in place, `#fragments` land on GitHub-style heading ids stamped on h2–h4 |
| Styleguide | `app/globals.css`, parsed by `lib/styleguide.ts` — light + dark side by side, token health checks per build |

## Drift alarms

**The doc formats are parser API, and format drift fails silently** — a parser handed an unexpected shape returns empty or partial, and the page renders hollow with no signal. Three defenses:

- **Invariants, not zero-checks** — `lib/derivation.ts` asserts each parser's promised shape (3 modes with all fields, 4 known tiers with live thresholds, every question carrying area + resolves-when, frontmatter coverage …). Non-zero-but-wrong parses are the worst class; zero-checks alone miss them.
- **The surface self-reports** — any failing invariant renders an amber band on every `/system` page, naming the parser, the source doc, and the problem. **Warn, never fail:** a drifted doc format must not block a deploy.
- **Markers at the source** — each parsed section opens with an HTML comment naming its parser, its page, and the shape that must hold.

A firing alarm means the **doc** drifted from spec — fix the doc, or change spec + parser deliberately, never one without the other.

> **Calibration: presence-not-count.** The invariants are tuned so a fresh project — empty trackers, no archive, no decisions, an empty queue — boots with **zero alarms**. What still fires is real drift: a populated list with a malformed row (a question missing its area, an FC missing its trigger, a doc missing its tier), the Work Model / tiers / glossary shape, the seed↔queued-row bidirectional match, and the styleguide's own completeness (the starter `globals.css` meets its thresholds: ≥200 tokens, the `SEMANTIC TOKENS — Surface` + `Font Size` sections, ≥1 shared component dir). As the project fills in, the surface stays honest without ever nagging an empty list. A mature repo may want count floors (e.g. "≥N archived phases, ≥N decisions") — adding them back is a deliberate re-tightening, logged in `decisions.md`.
