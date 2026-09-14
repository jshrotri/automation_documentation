---
name: 'tag-and-outline-handling'
usedBy: ['architect', 'validator']
trigger: 'always when the scenario has tags and/or is a Scenario Outline'
---
# Skill: Tag & Outline Handling

## Purpose

`Scenario Outline`/`Examples` and Gherkin tags carry real execution
semantics that are easy to flatten away by accident during migration —
this skill keeps both intact and turns the Outline expansion into a
genuine parallelism upgrade over typical Cucumber-JVM execution.

## When to use

**Architect**: designing `plan.md` for any scenario that is a
`Scenario Outline` or carries tags. **Validator**: validating one.

## Steps / Checklist — Scenario Outline / Examples

1. Preserve the `Scenario Outline` and its full `Examples` table verbatim
   in the migrated `.feature` file — every row from `requirements.md`
   must be present; don't collapse rows that look redundant.
2. Know that `playwright-bdd` expands each `Examples` row into its own
   generated Playwright test at `bddgen` time — this means each row runs
   as an independent, parallelizable test, not a sequential loop the way
   many Cucumber-JVM runners execute them. Call this out in `plan.md` as a
   real behavioral upgrade (faster feedback), but also flag it as a risk
   if the Java suite relied on rows running in sequence with shared state
   between them — Playwright's parallel-by-default execution will break
   that assumption unless the plan explicitly disables parallelism for
   this spec.
3. The Validator must check **every** generated row-test individually
   (see [`flake-detection.skill.md`](flake-detection.skill.md)), not just
   confirm the Outline "passed" in aggregate.

## Steps / Checklist — Tags

1. Preserve every tag on the scenario/feature in the migrated `.feature`
   file, matching the taxonomy documented in
   `docs/project-structure.md` (or ask the Analyst to confirm meaning if
   it's still undocumented — see
   [`ambiguity-detection.skill.md`](ambiguity-detection.skill.md)).
2. `playwright-bdd`'s `bddgen` supports the same Cucumber tag-expression
   syntax (`--tags "@smoke and not @wip"`) for filtering which scenarios
   get compiled/run — use this so the Validator can run exactly the
   in-scope scenario by tag instead of the whole feature file, and so CI
   tag-based suites (smoke, regression) keep working post-migration.
3. If a tag drove a Java-side `@Before`/`@After` hook, the equivalent
   `playwright-bdd` `Before`/`After` hook must be tag-scoped the same way —
   don't let it become unconditional (running for every scenario) or
   silently dropped.

## Output / Contract

`plan.md` states the full Examples table and tag list to carry over, plus
whether this spec needs `fullyParallel` disabled. `test-report.md`
confirms every row/tag combination was actually exercised.

## Related skills

- [`flake-detection.skill.md`](flake-detection.skill.md)
- [`risk-assessment.skill.md`](risk-assessment.skill.md)
