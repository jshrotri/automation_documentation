---
name: 'codebase-structure-mapping'
usedBy: ['architect']
trigger: 'on-demand: first time in a new Selenium/Cucumber repo, or when docs/project-structure.md is missing/stale, or via the /map-codebase prompt'
---
# Skill: Codebase Structure Mapping

## Purpose

When this system is dropped into an existing, possibly large and unfamiliar
Selenium/Java/Cucumber project, re-discovering its structure from scratch
every time a new scenario comes up wastes effort and produces inconsistent
plans. This skill runs once (and again whenever the source repo changes
meaningfully) to produce durable documentation of the project's shape, so
every later Architect run starts from an already-mapped repo instead of
re-exploring it.

**This is a read-and-document skill, not a migration skill.** It is
explicitly exempt from [`scope-guard.skill.md`](scope-guard.skill.md)'s
write restriction in one specific sense: it may read the *entire*
feature-file and step-definition tree, including scenarios nobody has
asked to migrate, because understanding shared step reuse and World/hook
setup requires seeing the whole picture. It must never, as a side effect,
produce a `plan.md`, `.feature` file, code, or any migration artifact for
a scenario that isn't in `scope.scenarios`. Its only output is descriptive
documentation.

## When to use

- The first time Architect mode runs in a repo (check: does
  `<docsPath>/project-structure.md` exist? If not, run this first, before
  planning anything).
- When the user explicitly runs `/map-codebase`.
- When a plan run notices the existing structure doc is stale (references
  files/classes that no longer exist, or a new feature area isn't
  covered) — refresh it rather than plan against outdated assumptions.

## Steps / Checklist

1. **Map the feature-file layout**: how `.feature` files are organized
   (`seleniumSource.featuresDir`) — by feature area, by team, flat — and
   the naming convention in use.
2. **Map the step-definition layer**: package structure under
   `seleniumSource.stepDefsDir`, which classes hold widely-reused steps
   (a `CommonSteps`/`NavigationSteps`) vs. feature-specific ones, and
   whether the project favors Cucumber Expressions or regex.
3. **Identify the World/DI mechanism**: PicoContainer (Cucumber-JVM
   default), Spring, or Guice — and what shared state (driver, auth
   context, created test data) it injects across step classes per
   scenario.
4. **Inventory hooks**: `@Before`/`@After`, tag-scoped ones, and what
   global setup/teardown (driver lifecycle, screenshot-on-failure,
   Extent/Allure-cucumber reporting) they perform.
5. **Inventory the Page Object layer** underneath the steps: base page
   class(es), the pattern used (`PageFactory` `@FindBy`, manual
   `findElement`, a fluent wrapper).
6. **Inventory tag taxonomy**: every distinct tag in use across feature
   files and what it's understood to mean for CI/execution (cross-check
   `seleniumSource.hooksDir` and any CI config for tag-based filtering).
7. **Inventory test data conventions**: `Examples` tables, `DataTable`
   steps, external CSV/JSON/properties fixtures, builder/factory classes.
8. **Note CI/execution setup** if visible (Jenkinsfile, GitHub Actions
   workflow, Maven/Gradle profile) — what triggers runs, with what
   tag-expression filtering and parallelism.
9. **Flag anti-patterns worth knowing up front**: widespread
   `Thread.sleep`, static mutable state leaking between scenarios, heavy
   reliance on execution order, near-duplicate step definitions with
   slightly different wording (a strong signal future migrations should
   consolidate rather than mirror).
10. Write/update `<docsPath>/project-structure.md` with the above,
    organized so an Architect (or a new team member) can find "what step
    already implements X" or "how is test data usually supplied" in under
    a minute. For a large project, split into
    `<docsPath>/project-structure/<area>.md` files linked from an index.

## Output / Contract

`<docsPath>/project-structure.md` (or an index + per-area files). Purely
descriptive — no migration decisions, no code. Re-read by every subsequent
Architect run instead of re-scanning the whole repo from zero.

## Related skills

- [`scope-guard.skill.md`](scope-guard.skill.md) — the boundary this skill stays inside of.
- [`step-definition-consolidation.skill.md`](step-definition-consolidation.skill.md) and [`page-object-consolidation.skill.md`](page-object-consolidation.skill.md) — use this doc to decide reuse vs. new.
