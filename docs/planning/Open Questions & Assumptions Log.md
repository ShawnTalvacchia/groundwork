---
status: active
tier: working
last-reviewed: YYYY-MM-DD
read-when: "before each phase (your area's questions) — resolve or flag"
---

# Open Questions & Assumptions Log

<!-- PARSED by lib/system.ts (getOpenQuestions) -> /system/questions. Changing this section's SHAPE
     (the '## N. Topic' sections with '### Question?' entries carrying **Area:** / **Opened:** / **Priority:** / **Thinking:** / **Resolves when:**) breaks that page silently - the /system drift banner will name it. Everything here is OPEN — resolved questions are DELETED, not marked. Spec: docs/implementation/system-surface.md -->

Unresolved questions and working assumptions that affect upcoming work. One of three planning trackers — see `CONTRIBUTING.md` → "The Planning Trackers." **Everything in this file is open** — when a question resolves, it's deleted (compressed to a one-line pointer at its home doc), so the count never lies.

**These starter questions are the kickoff prompts** — the fresh-project version of "what do we need to decide?" Answer them in the kickoff (each resolution becomes a decision, a strategy-doc edit, or a queued phase), then delete them and add your own.

---

## 1. Who is this for?

### Who is the primary user, and what job are they hiring the product to do?

**Area:** strategy · **Opened:** YYYY-MM-DD · **Priority:** high
**Thinking:** The whole system orients around the strategy shelf; the shelf is empty until this is answered. Name the primary user narrowly enough that a phase can serve them.
**Resolves when:** `strategy/Vision.md` states the user + the core job.

---

## 2. Scope

### What is explicitly OUT of scope for the first milestone?

**Area:** scope · **Opened:** YYYY-MM-DD · **Priority:** high
**Thinking:** Non-goals prevent sprawl more effectively than goals. Name what you're deliberately NOT building.
**Resolves when:** `strategy/Scope & Constraints.md` lists the non-goals.

### What's the smallest thing that would prove the core thesis?

**Area:** scope · **Opened:** YYYY-MM-DD · **Priority:** high
**Thinking:** This becomes the first product phase's thesis. MVP vs later is the first real prioritization.
**Resolves when:** the first phase is queued with a one-line thesis.

---

## 3. Risk

### What is the riskiest assumption — the one that, if wrong, changes everything?

**Area:** strategy · **Opened:** YYYY-MM-DD · **Priority:** medium
**Thinking:** Surface it early so phases can be sequenced to test it sooner rather than later.
**Resolves when:** the assumption is either validated or converted into a Future Consideration with a trigger.
