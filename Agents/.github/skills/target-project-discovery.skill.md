---
name: 'target-project-discovery'
usedBy: ['architect', 'engineer']
trigger: 'on-demand: targetProjectPath already has a package.json with @playwright/test as a dependency, and docs/target-project-structure.md is missing or stale'
---
# Skill: Target Project Discovery

## Purpose

`targetProjectPath` isn't always empty. Pointing this system at a
**pre-existing Playwright project** — one your team already built, with
its own conventions, its own folder layout, maybe its own Page Objects
and fixtures already in place — is a legitimate, expected setup, not an
edge case. This skill is what stops the Engineer from steamrolling that
project with this system's default `features/`/`steps/`/`pages/` shape
and starts it reading and matching what's actually there.

**This is the target-side counterpart to
[`codebase-structure-mapping.skill.md`](codebase-structure-mapping.skill.md)**,
which does the same job for the Selenium/Cucumber source. Same rule
applies here: read-only/documentation, exempt from
[`scope-guard.skill.md`](scope-guard.skill.md)'s write restriction because
it never migrates anything — it only produces `docs/target-project-structure.md`
and seeds `docs/component-registry.md` with what already exists.

## When to use

The **Architect**, at the start of planning the first scenario in a
session, checks: does `<targetProjectPath>/package.json` exist and depend
on `@playwright/test`? If yes, and `docs/target-project-structure.md`
doesn't exist yet (or looks stale against the real project), run this
skill before writing `plan.md`. Re-run it later if the target project's
structure changes meaningfully outside this system (someone reorganizes
it by hand).

If `<targetProjectPath>/package.json` doesn't exist at all, this skill
doesn't apply — use
[`target-project-bootstrap.skill.md`](target-project-bootstrap.skill.md)
instead.

## Steps / Checklist

1. **Detect whether `playwright-bdd` is already a dependency.**
   - **Yes** → this project is already BDD-shaped. Proceed to step 2 and
     keep `framework.style: "playwright-bdd"`.
   - **No** → this is a plain Playwright project (no Gherkin). Tell the
     user, in chat, explicitly:

     > `<targetProjectPath>` doesn't use `playwright-bdd` yet. Two ways to
     > proceed:
     > **(a)** add `playwright-bdd` alongside the existing tests — it
     > coexists fine, generating its own test files into a separate
     > directory without touching what's already there. Migrated
     > scenarios keep their `.feature`/Given-When-Then form.
     > **(b)** migrate scenarios as plain Playwright tests
     > (`test()`/`test.step()`) matching this project's existing style, no
     > Gherkin layer at all.
     >
     > Which do you want?

     Record the answer as `framework.style` in
     `.github/migration.config.json` (`"playwright-bdd"` or
     `"plain-playwright"`). Don't guess — this is an architecture decision
     for the user, not the Architect, and it's expensive to reverse once
     scenarios are implemented against it. If they choose (b), the rest of
     this pipeline still applies except implementation shape — see
     [`plain-playwright-fallback.skill.md`](plain-playwright-fallback.skill.md).
2. **Read `playwright.config.ts`**: existing `testDir`, `projects`
   (browser/device matrix), `reporter`, `use.baseURL` (and whether it's
   env-driven already), `retries`/`workers`/CI conditionals, any existing
   `dependencies`/`storageState` auth wiring.
3. **Read `package.json`**: existing scripts (what does `npm test` already
   do?), existing lint/format tooling (don't add a second, conflicting
   ESLint/Prettier config if one already exists — extend or defer to it).
4. **Map the existing directory structure**: where do test files live
   (`tests/`, `e2e/`, `src/tests/`, something else)? Is there an existing
   Page Object layer, and if so, what's its naming/placement convention?
   Existing fixtures? A `.env`/config pattern already in use? An existing
   `playwright/.auth/` storage-state setup?
5. **Update `conventions.*` in `.github/migration.config.json` to match
   reality** — `pageObjectDir`, `componentsDir`, `featuresDir`/`stepsDir`/
   `supportDir` (if BDD) or `testDir`/`specFileSuffix` (if plain), `setupDir`,
   `testDataDir` — so every other skill's file-placement guidance
   automatically targets the right folders instead of this system's
   defaults. State clearly, in chat, exactly which config values you
   changed and why.
6. **Seed `docs/component-registry.md`** (see
   [`project-memory.skill.md`](project-memory.skill.md)) with everything
   already discoverable: existing Page Objects, existing fixtures/hooks,
   and — if `playwright-bdd` was already present — existing step
   definitions. This is what makes
   [`step-definition-consolidation.skill.md`](step-definition-consolidation.skill.md)/
   [`page-object-consolidation.skill.md`](page-object-consolidation.skill.md)
   correctly reuse pre-existing code from the very first migrated
   scenario, not just code this system added later.
7. Write `docs/target-project-structure.md`: directory layout, naming
   conventions observed, existing tooling (lint/format/CI), the
   auth/env pattern in use, and the `framework.style` decision with its
   rationale.
8. Confirm `npm run typecheck` (or the closest equivalent script the
   project already defines) succeeds against the unmodified project before
   handing off — this is a smoke check that the discovery didn't
   misread something.

## Output / Contract

`docs/target-project-structure.md` (descriptive only), an updated
`conventions.*` block in `.github/migration.config.json` reflecting the
real project, and a seeded `docs/component-registry.md`. No migration
artifact, no scenario code — this skill never advances any slug's
`status`.

## Related skills

- [`codebase-structure-mapping.skill.md`](codebase-structure-mapping.skill.md) — the source-side equivalent.
- [`target-project-bootstrap.skill.md`](target-project-bootstrap.skill.md) — the counterpart for when no project exists yet.
- [`plain-playwright-fallback.skill.md`](plain-playwright-fallback.skill.md) — what changes if the user chooses not to add BDD.
- [`project-memory.skill.md`](project-memory.skill.md)
