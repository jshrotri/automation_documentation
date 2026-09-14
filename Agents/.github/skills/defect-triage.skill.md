---
name: 'defect-triage'
usedBy: ['validator']
trigger: 'on failure'
---
# Skill: Defect Triage

## Purpose

A consistent rule for "who fixes this" so failures don't bounce between
Engineer and Architect without making progress.

## When to use

Any time a migrated scenario fails validation (a real failure or a flaky
result per [`flake-detection.skill.md`](flake-detection.skill.md)).

## Steps / Checklist — route to Engineer when:

- The locator doesn't match the current DOM (typo, wrong role/name).
- A wait/assertion is missing or racing (implementation didn't fully apply
  [`playwright-bdd-implementation-patterns.skill.md`](playwright-bdd-implementation-patterns.skill.md)).
- The failure only reproduces because the implementation deviated from
  `plan.md` without justification (check `dev-log.md`'s Deviations
  section), or because a shared fixture leaked state between parallel
  `Examples` rows.
- `bddgen` reports an ambiguous/duplicate step that implementation should
  have caught per [`code-quality-checklist.skill.md`](code-quality-checklist.skill.md).

## Steps / Checklist — route to Architect when:

- The implementation faithfully followed `plan.md`, but the plan's design
  doesn't match real app behavior (wrong page object scope, missing
  fixture, an assumption about shared state or execution order that
  doesn't hold under Playwright's parallel-by-default model).
- A risk flagged in `plan.md`'s Risks & Mitigations materialized exactly as
  predicted — confirms the risk was real, and the mitigation needs
  revising.
- A step-wording consolidation decision (from
  [`step-definition-consolidation.skill.md`](step-definition-consolidation.skill.md))
  turns out to have merged two steps that weren't actually equivalent.
- A design smell surfaces during investigation (a page object handling
  more than its own page, a fixture bundling unrelated capabilities, a
  reused step/page object whose contract turned out to be Liskov-
  incompatible with how this scenario needed it) — even if it isn't the
  direct cause of the failure, flag it against
  [`design-patterns-and-solid.skill.md`](design-patterns-and-solid.skill.md)
  so the Architect can correct the design before more scenarios build on
  top of it.

## Steps / Checklist — route to Analyst when:

- The scenario does what `requirements.md` asked, but what it asked for is
  wrong or incomplete relative to the actual Cucumber/Java behavior (a
  missed acceptance criterion, a misunderstood assertion, an
  `Examples` row transcribed incorrectly, a tag's meaning misread).

## Output / Contract

`defects.md` states the routing decision explicitly, with the evidence
(trace/screenshot/error text) that justifies it — not just "send to
Engineer" with no reasoning, so whichever agent picks it up can act
immediately instead of re-diagnosing.

## Related skills

- [`flake-detection.skill.md`](flake-detection.skill.md)
- [`blocked-escalation.skill.md`](blocked-escalation.skill.md)
