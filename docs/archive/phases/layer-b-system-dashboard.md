---
category: phase
status: archived
mode: system
tier: working
last-reviewed: 2026-07-20
opened: 2026-07-20
closed: 2026-07-20
read-when: "researching how the /system dashboard was ported into the template"
---

# System Work — Layer B: the `/system` dashboard port

> **Shipped 2026-07-20.** Ported the derived-never-authored `/system` dashboard into the template: the doc parsers (`lib/system.ts`, `lib/styleguide.ts`), the drift alarms (`lib/derivation.ts`), and the Next.js pages (`app/system/**`), on a hand-authored web host with a fresh starter design system (`app/globals.css`, 271 tokens). Every page renders from the Layer-A docs with **zero drift alarms** on the empty template, in light + dark, and a clean production build (45 routes).

**Thesis:** The template had the methodology (Layer A) but no rendered surface. This phase made the state of the work legible at a glance — derived, never authored — while recalibrating the drift invariants to **presence-not-count** so a fresh project boots clean instead of screaming.

**Load-bearing calls** → `decisions.md` (2026-07-20): the port + `§B4` recalibration · the starter design system (Doggo's token contract, a fresh palette) · the starter component set (over Doggo's product demos) · no unlock gate + README folder-guides excluded from the registry.

**Spec:** `implementation/system-surface.md` (the dashboard's law, IA, and page→source map).
