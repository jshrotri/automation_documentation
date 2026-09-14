---
name: 'target-project-bootstrap'
usedBy: ['engineer']
trigger: 'on-demand: targetProjectPath has no package.json (no Playwright/playwright-bdd project exists there yet)'
---
# Skill: Target Project Bootstrap

## Purpose

So the Engineer never blocks — or worse, hand-rolls an inconsistent
one-off setup — just because nobody scaffolded `targetProjectPath` yet.
This skill is the exact, repeatable procedure for creating a correctly
configured `playwright-bdd` project from nothing, so the first scenario
you ever migrate produces the same project shape as the hundredth.

## When to use

At the start of any Engineer session, before step 2 of the normal
implementation process (see `engineer.chatmode.md`): check whether
`<targetProjectPath>/package.json` exists.

- **It exists** → skip this skill entirely, proceed with normal
  implementation.
- **It doesn't exist** and `bootstrap.autoCreateTargetProject` is `true`
  (the default) → run this skill once, then continue with normal
  implementation in the same session.
- **It doesn't exist** and `bootstrap.autoCreateTargetProject` is `false`
  → stop and tell the user to scaffold `targetProjectPath` themselves (or
  flip the config flag), per
  [`blocked-escalation.skill.md`](blocked-escalation.skill.md). Don't
  silently create it against an explicit opt-out.

## Steps / Checklist

Create these files under `<targetProjectPath>`, using
`bootstrap.playwrightVersion`/`playwrightBddVersion`/`typescriptVersion`
from config for the dependency versions:

1. **`package.json`** — devDependencies `@playwright/test`,
   `playwright-bdd`, `typescript`, `@types/node`, `dotenv`, `eslint`,
   `@eslint/js`, `typescript-eslint`, `eslint-plugin-playwright`,
   `eslint-config-prettier`, `prettier`; scripts:
   - `"bddgen": "bddgen"`
   - `"test": "bddgen && playwright test"`
   - `"test:headed": "bddgen && playwright test --headed"`
   - `"test:ui": "bddgen && playwright test --ui"`
   - `"report": "playwright show-report"`
   - `"typecheck": "tsc --noEmit"`
   - `"lint": "eslint ."`
   - `"lint:fix": "eslint . --fix"`
   - `"format": "prettier --write ."`
   - `"format:check": "prettier --check ."`
2. **`tsconfig.json`** — target ES2022, strict mode, `noUnusedLocals`/
   `noUnusedParameters` on, path aliases for `@pages/*`, `@steps/*`,
   `@utils/*`, `include` covering `<conventions.stepsDir>`,
   `<conventions.pageObjectDir>`, `<conventions.testDataDir>`,
   `<conventions.setupDir>`, and `playwright.config.ts`; `exclude` the
   `bddgen` output directory (default `.features-gen`).
3. **`playwright.config.ts`** — load `dotenv` at the top; `defineBddConfig({
   features: '<conventions.featuresDir>/**/*.feature', steps:
   '<conventions.stepsDir>/**/*.ts' })` feeding `testDir`; `fullyParallel:
   true`; `retries`/`workers` conditional on `process.env.CI`; `reporter`
   with at least `html` + `list`; `use.baseURL` from
   `testing.baseUrlEnvVar` (with a placeholder default and a `// TODO`
   comment to point it at the real app); `trace: 'on-first-retry'`,
   `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`;
   `projects` for each entry in `testing.browsers`, plus a commented-out
   `setup` project + storage-state wiring example pointing at
   `<conventions.setupDir>/auth.setup.ts` (see
   [`playwright-best-practices.skill.md`](playwright-best-practices.skill.md)'s
   authentication-reuse standard — leave it commented until a scenario
   actually needs auth).
4. **`eslint.config.mjs`** — flat config: `@eslint/js` recommended +
   `typescript-eslint` recommended + `eslint-plugin-playwright`'s
   recommended flat config, applied to `**/*.ts`; ignore the `bddgen`
   output dir, `playwright-report/`, `test-results/`, `node_modules/`.
5. **`.prettierrc.json`** and **`.prettierignore`** (mirror the ESLint
   ignore list).
6. **`.env.example`** — documents `testing.baseUrlEnvVar` (default
   `BASE_URL`) with a placeholder value and a comment that a real `.env`
   is gitignored and never committed.
7. **`.gitignore`** — `node_modules/`, `test-results/`,
   `playwright-report/`, `blob-report/`, `playwright/.cache/`, the
   `bddgen` output dir, `playwright/.auth/`, `.env`.
8. Folder structure:
   - `<conventions.featuresDir>/` (empty, `.gitkeep`).
   - `<conventions.stepsDir>/support/fixtures.ts` (the World-equivalent —
     `export const test = base;` plus `export const { Given, When, Then } =
     createBdd(test);`, with the same doc-comment explaining the Cucumber
     World → Playwright fixture mapping).
   - `<conventions.stepsDir>/support/hooks.ts`
     (`export const { Before, After } = createBdd();`).
   - `<conventions.pageObjectDir>/base.page.ts` (the `BasePage` abstract
     class with `goto()`, documenting the Facade/SRP rationale per
     [`design-patterns-and-solid.skill.md`](design-patterns-and-solid.skill.md)).
   - `<conventions.componentsDir>/base.component.ts` (the `BaseComponent`
     abstract class scoped to a root `Locator`, documenting the Composite
     rationale for shared header/nav/modal pieces).
   - `<conventions.testDataDir>/test-data.ts` (empty placeholder with a
     doc comment).
   - `<conventions.setupDir>/auth.setup.ts` (a plain, non-BDD Playwright
     test skeleton implementing the storage-state authentication pattern,
     with the real login steps left as `// TODO` since the actual app
     isn't known yet — see
     [`playwright-best-practices.skill.md`](playwright-best-practices.skill.md)).
9. **`README.md`** — brief usage notes (setup, running tests, linting,
   structure), so the scaffold is self-documenting for anyone who opens
   the folder without this system's context.
10. Run `npm install` then `npx playwright install` in `targetProjectPath`
    (via the terminal tool) and confirm both succeed before proceeding —
    don't start implementing the scenario against a project whose install
    step failed.
11. Initialize `<docsPath>/component-registry.md` and
    `<migrationArtifactsPath>/CHANGELOG.md` from their templates if they
    don't exist yet either (see
    [`project-memory.skill.md`](project-memory.skill.md)) — a freshly
    bootstrapped target project should start with working memory files,
    not force the next session to notice they're missing.

This exact file set already exists as a working reference at this
system's own `playwright-migrated/` — reproduce that shape, don't
improvise a variant.

## Output / Contract

A `targetProjectPath` that type-checks, has Playwright browsers installed,
and is structurally identical to what every other project bootstrapped by
this skill looks like — so nothing downstream (skills, other agents, a
human reviewer) has to special-case "this one was set up differently."

## Related skills

- [`playwright-bdd-implementation-patterns.skill.md`](playwright-bdd-implementation-patterns.skill.md)
- [`playwright-best-practices.skill.md`](playwright-best-practices.skill.md)
- [`design-patterns-and-solid.skill.md`](design-patterns-and-solid.skill.md)
- [`project-memory.skill.md`](project-memory.skill.md)
- [`blocked-escalation.skill.md`](blocked-escalation.skill.md)
