---
name: 'step-definition-consolidation'
usedBy: ['architect', 'engineer']
trigger: 'always'
---
# Skill: Step Definition Consolidation

## Purpose

This is the single biggest efficiency lever in a Cucumber migration.
Gherkin's whole premise is step reuse — `Given I am logged in as
"{string}"` is shared across dozens of scenarios in the Java suite. If
every migrated scenario regenerates its own step implementations instead
of reusing what's already in the TypeScript step library, the migration
gets slower with every scenario instead of faster, and you end up with
`playwright-bdd` "ambiguous step" errors from near-duplicate definitions.

## When to use

- **Architect**: for every Gherkin step in the scenario being planned,
  before deciding to write a new step definition.
- **Engineer**: re-checked at implementation time, since another scenario
  may have landed a matching step since the plan was written.

## Steps / Checklist

1. Check `docs/component-registry.md` (`project-memory`) first — it's a
   faster, curated list of existing step definitions than scanning the
   file tree. If `targetProjectPath` was an existing Playwright/
   `playwright-bdd` project, this registry was seeded with its pre-existing
   steps by `target-project-discovery.skill.md`, so this check covers
   those too, not just ones this system added. Fall back to listing files
   under `<targetProjectPath>/<conventions.stepsDir>` directly only if the
   registry looks incomplete or stale for what you need.
2. For each Gherkin step text in the current scenario, check for an
   **exact Cucumber Expression match** already implemented.
   - **Exact match** → reuse as-is. Do not implement a second definition
     for the same step text — `playwright-bdd`/Cucumber will treat it as
     an ambiguous match and fail.
   - **Near match** (same intent, slightly different wording — e.g. `I log
     in as {string}` vs `I login with username {string}`) → this is a
     judgment call: either (a) reuse the existing step and, with the
     Analyst's sign-off, treat the new scenario's Gherkin wording as
     equivalent going forward, or (b) implement a second, deliberately
     distinct step if the wording difference reflects a real behavioral
     difference. Record which you chose and why in `plan.md`/`dev-log.md`
     — don't silently pick one.
   - **No match** → implement a new step definition, placed consistently
     with the existing step file organization (mirror
     `docs/project-structure.md`'s account of how the Java step classes
     were organized, adapted to `<conventions.stepsDir>`).
3. Prefer `conventions.stepDefinitionStyle` (`cucumber-expressions` by
   default) for any new step — `{string}`, `{int}`, `{word}` map almost
   directly from the equivalent Cucumber-JVM annotation, minimizing
   translation effort and keeping the step readable.
4. After implementation, run `bddgen` (or the project's step-definition
   lint) and check for "duplicate/ambiguous step" warnings — that's the
   mechanical proof consolidation actually worked, not just a design
   intention.
5. If a step you're reusing needs a small extension (an optional
   parameter, a new assertion variant), extend the existing function
   rather than forking a parallel one with a near-identical name.

## Output / Contract

`plan.md`'s Step & Page Object Design section states, for every Gherkin
step in the scenario, whether it's reused-unchanged / reused-with-Analyst-
approved-wording / new — the Engineer should never have to make that call
itself mid-implementation.

## Related skills

- [`page-object-consolidation.skill.md`](page-object-consolidation.skill.md) — the equivalent discipline one layer down, for the Page Objects steps call into.
- [`design-patterns-and-solid.skill.md`](design-patterns-and-solid.skill.md) — a step definition should stay a thin orchestrator (Single Responsibility, Dependency Inversion onto Page Objects); if reuse pressure is pushing UI logic into the step itself, that's the signal to consult it.
- [`project-memory.skill.md`](project-memory.skill.md) — the registry this skill checks first, and that the Engineer updates the moment a genuinely new step is added.
- [`codebase-structure-mapping.skill.md`](codebase-structure-mapping.skill.md)
