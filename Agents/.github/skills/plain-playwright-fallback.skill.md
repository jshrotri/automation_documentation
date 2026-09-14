---
name: 'plain-playwright-fallback'
usedBy: ['architect', 'engineer', 'validator']
trigger: 'on-demand: migration.config.json framework.style is "plain-playwright"'
---
# Skill: Plain Playwright Fallback

## Purpose

Set by [`target-project-discovery.skill.md`](target-project-discovery.skill.md)
when the user is pointed at an existing plain Playwright project (no
Gherkin) and chooses not to introduce `playwright-bdd`. Everything else
about this pipeline still applies — scope guard, requirements gathering
against the Java/Cucumber source, SOLID design, reuse-before-create,
Playwright best practices — only the **shape of the generated test**
changes: no `.feature` file, no step definitions, no `bddgen`.

## When to use

Whenever `framework.style` is `"plain-playwright"`. Check this once per
session (via `config-loader`) rather than assuming — most migrations in
this system are still BDD by default.

## Steps / Checklist

**Architect** (`plan.md`):
- Target Files section names a single `<slug>.spec.ts` under
  `conventions.testDir` (not a `.feature` + step files).
- Step & Page Object Design still lists which Page Objects/fixtures are
  reused vs. new — that discipline doesn't change.
- Note explicitly in the plan: "no `.feature` file — plain Playwright
  test, framework.style=plain-playwright."

**Engineer** (implementation):
- Write one `test()` per scenario (or one per `Examples` row for a
  Scenario Outline — same per-row independence as the BDD path, just
  written as a small loop or `test.describe` block over the data instead
  of relying on `bddgen`'s auto-expansion).
- Translate each Gherkin step from `requirements.md` into a
  `test.step('<the original Gherkin step text>', async () => { ... })`
  call, in order. This preserves the readable, traceable step-by-step
  structure Gherkin gave you — Playwright's trace viewer and HTML report
  show each `test.step()` exactly the way they'd show a BDD step, so
  nothing about scenario readability is actually lost.
- Every other standard still applies unchanged: locators, no manual
  waits, storage-state auth reuse, Page Object reuse via
  `step-definition-consolidation`'s spirit (check `docs/component-registry.md`
  for reusable Page Objects — there's no "step" layer to reuse here, only
  Page Objects and fixtures).
- No `bddgen` step — skip directly to `npx tsc --noEmit` and
  `npx playwright test --grep "<scenario name>"`.
- Register any new Page Object/fixture in `docs/component-registry.md` as
  usual; there's simply no "Step Definitions" table entry to add.

**Validator**:
- Run `npx playwright test --grep "<scenario name>"` directly — no
  `bddgen` in the command.
- Everything else (flake-check repeats, acceptance-criteria cross-check,
  regression safety net) is unchanged.

## Output / Contract

A `<slug>.spec.ts` file whose `test.step()` calls read as the original
Gherkin scenario, so the traceability back to the Java/Cucumber source
that `requirements.md` established isn't lost just because the target
project doesn't use BDD.

## Related skills

- [`target-project-discovery.skill.md`](target-project-discovery.skill.md)
- [`playwright-best-practices.skill.md`](playwright-best-practices.skill.md)
- [`step-definition-consolidation.skill.md`](step-definition-consolidation.skill.md) / [`page-object-consolidation.skill.md`](page-object-consolidation.skill.md) — page-object reuse still applies; step-definition reuse doesn't (no step layer).
