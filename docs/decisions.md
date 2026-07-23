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

_(No decisions logged yet — the kickoff logs the first ones. Newest first; the count on `/system` is derived from the entries below.)_
