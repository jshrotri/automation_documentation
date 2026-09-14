---
name: 'ambiguity-detection'
usedBy: ['analyst', 'architect']
trigger: 'always'
---
# Skill: Ambiguity Detection

## Purpose

A shared bar for "ask vs. infer" so the Analyst doesn't interrogate the
user over things the code already answers, and doesn't silently guess on
things that actually matter.

## When to use

While analyzing a scenario (Analyst) or while designing against
`requirements.md` (Architect, for gaps requirements-writing should have
caught).

## Steps / Checklist — ask a (batched) question when you hit:

- A wait/sleep whose intent genuinely can't be recovered from surrounding
  code or comments.
- An assertion that's weaker than what the flow implies it should check —
  ask whether to preserve the original's (possibly loose) behavior
  exactly, or tighten it.
- A test-data source (a `Scenario Outline`'s `Examples`, a
  `DataTable`, or a Java constant) that looks environment-specific or
  dependent on external/mutable state.
- Execution-order dependence on another scenario, or on state left behind
  by a hook that doesn't reset between scenarios.
- A tag (`@smoke`, `@wip`, a custom one) whose meaning for this project —
  what CI job runs it, what environment/data it implies — isn't
  discoverable from the repo.
- A custom World/DI-provided object whose exact contract isn't recoverable
  from the code you have access to (e.g. it comes from a separate internal
  library not in this repo).
- No stated browser/environment/CI matrix anywhere discoverable.
- Whether infra concerns (CI config, Cucumber HTML/JSON reporting
  dashboards stakeholders currently read) need a Playwright-side
  equivalent or are out of scope for this pass.

## Steps / Checklist — do NOT ask, just extract/state it, when:

- The Java step definition or Gherkin text answers it unambiguously (even
  if verbose to trace).
- It's a straightforward Cucumber-JVM→playwright-bdd mapping already
  covered in `docs/selenium-to-playwright-mapping.md`.
- It's a naming/file-placement or step-reuse decision — that's the
  Architect's call, not a question for the user at requirements stage.

## Output / Contract

Every question actually asked, and the user's answer, goes into
`requirements.md`'s "Open Questions & Answers" table — this is the audit
trail Architect and Validator rely on later, so don't resolve something
verbally in chat without also recording it there.

## Related skills

- [`gherkin-scenario-analysis.skill.md`](gherkin-scenario-analysis.skill.md)
