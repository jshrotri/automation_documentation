---
name: 'playwright-best-practices'
usedBy: ['architect', 'engineer']
trigger: 'always'
---
# Skill: Playwright Best Practices

## Purpose

A migration is only as good as the habits it establishes early — the
first few scenarios set the template every later one copies. This skill
is the canonical set of Playwright engineering standards this system
holds every migrated scenario to, sourced from Playwright's own
documented best practices, adapted to this project's `playwright-bdd`
architecture. Where a rule is mechanically checkable, it's enforced by
ESLint (`eslint-plugin-playwright`) as part of the bootstrap scaffold —
not just written down and hoped for.

## When to use

**Architect**: while designing `plan.md` — test isolation, auth strategy,
and directory placement are structural decisions, not implementation
details, and get harder to fix the later they're caught.

**Engineer**: while implementing, and again as part of
[`code-quality-checklist.skill.md`](code-quality-checklist.skill.md)
before every handoff.

## Standards

1. **Test isolation.** Each scenario gets its own fresh browser context —
   never share mutable state across scenarios via module-level variables
   or a manually-managed singleton `page`. This is already enforced
   structurally by using Playwright fixtures as the Cucumber-World
   replacement (see
   [`playwright-bdd-implementation-patterns.skill.md`](playwright-bdd-implementation-patterns.skill.md)),
   but watch for it creeping back in via a "convenient" shared helper.
2. **Locators, not ElementHandles or raw selectors strings passed around.**
   Follow `conventions.locatorPreference` in order
   (`getByRole`/`getByLabel`/`getByTestId`/`getByText` before CSS/XPath).
   A locator re-queries the DOM on every action, which is what makes
   Playwright's auto-waiting work at all — caching an `ElementHandle`
   defeats that.
3. **No manual waits.** `page.waitForTimeout()` is disallowed by default
   (`conventions.hardSleepPolicy`). Auto-retrying `expect()` and
   locator-action actionability checks replace every
   `Thread.sleep`/`WebDriverWait` from the Java source — see
   `docs/selenium-to-playwright-mapping.md`.
4. **Authenticate once, reuse the session.** If a scenario needs to be
   logged in, don't perform a UI login in every scenario's
   `Background`/`Given`. Use Playwright's storage-state pattern: a plain
   (non-BDD) `setup/auth.setup.ts` test logs in once and saves
   `playwright/.auth/user.json`; browser projects that need auth declare
   `dependencies: ['setup']` and `use: { storageState: 'playwright/.auth/user.json' }`.
   This is deliberately **not** a Gherkin step — it's infrastructure, not
   a business scenario, so it's fine for it to bypass BDD entirely. See
   the scaffolded `setup/auth.setup.ts` and the commented-out `setup`
   project in `playwright.config.ts`.
5. **Environment config lives in `.env`, never hardcoded.** `baseURL` and
   any credentials/secrets come from environment variables
   (`testing.baseUrlEnvVar`, loaded via `dotenv` in `playwright.config.ts`).
   `.env` is gitignored; `.env.example` documents what's expected. Never
   commit a real credential, even a test one, as a literal string in a
   step definition or fixture.
6. **Don't test third-party systems you don't control.** If the Java
   suite worked around a flaky external dependency (a payment gateway
   sandbox, a third-party auth provider) with long waits/retries, prefer
   `page.route()` to mock that boundary rather than porting the flakiness
   — but only when `requirements.md` doesn't require true end-to-end
   behavior through it (this mirrors the "network interception" call-out
   in `docs/selenium-to-playwright-mapping.md`).
7. **Nothing gets committed with `.only`/`.skip`/`page.pause()`.** These
   are debugging tools, not something that survives a handoff to the
   Validator — `eslint-plugin-playwright`'s `no-focused-test` and
   `no-skipped-test` rules catch this mechanically.
8. **One config, one source of truth.** All browser/device matrix,
   retries, workers, and reporters live in `playwright.config.ts`, driven
   by `testing.*` config values — never a second ad-hoc config or a
   scenario that overrides these inline.
9. **Artifacts only on failure.** `trace: 'on-first-retry'`,
   `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'` — already
   scaffolded. Don't crank these to "always on" for convenience; it slows
   every run and bloats CI storage for no benefit once traces-on-failure
   already give full debugging detail.
10. **Directory structure mirrors feature areas, not a flat dump.** Once a
    second feature area exists, `features/` and `steps/` should each gain
    matching subfolders (e.g. `features/auth/`, `steps/auth/`) — see
    **Directory structure** below. `pages/` splits into full pages vs.
    `pages/components/` for shared composite pieces (header, nav, a modal)
    — see the Composite entry in
    [`design-patterns-and-solid.skill.md`](design-patterns-and-solid.skill.md).
11. **Lint is a real gate, not a suggestion.** `npm run lint` runs
    `eslint-plugin-playwright`'s recommended rule set — part of
    `code-quality-checklist.skill.md`, not optional.

## Directory structure

```
playwright-migrated/
  .env.example              # documents required env vars; .env itself is gitignored
  eslint.config.mjs         # eslint-plugin-playwright + typescript-eslint, flat config
  .prettierrc.json
  playwright.config.ts
  tsconfig.json
  setup/
    auth.setup.ts           # plain Playwright test — logs in once, saves storage state
  playwright/.auth/         # gitignored — storageState JSON lands here at runtime
  features/
    <feature-area>/*.feature   # subfolder per feature area once there's more than one
  steps/
    <feature-area>/*.steps.ts  # mirrors features/ 1:1
    support/
      fixtures.ts            # World-equivalent Playwright fixtures
      hooks.ts                # Before/After, tag-scoped like their Java source
  pages/
    <Page>.page.ts
    components/
      <Component>.component.ts   # shared pieces composed into pages
  utils/
    test-data.ts
```

## Anti-patterns to eliminate — mechanically where possible

| Anti-pattern | Why it's bad | Standard instead |
|---|---|---|
| `page.waitForTimeout(n)` | Flaky and slow — waits a fixed time regardless of actual readiness. | Auto-retrying `expect()`/locator actionability. `eslint-plugin-playwright`'s `no-wait-for-timeout` catches this. |
| CSS/XPath chains tied to DOM structure (`div > div:nth-child(3) > span`) | Breaks on any markup change unrelated to behavior. | `getByRole`/`getByLabel`/`getByTestId` per `conventions.locatorPreference`. |
| Logging in via the UI in every scenario | Slow, and multiplies flakiness risk across the whole suite. | Storage-state reuse via `setup/auth.setup.ts` (see Standard 4). |
| Shared/global `page` or module-level mutable state across scenarios | Breaks under Playwright's parallel-by-default execution — state leaks between workers. | Fixtures, scoped per test (already the World-replacement pattern). |
| `test.only`/`test.skip`/`page.pause()` left in committed code | Silently disables coverage or blocks CI. | ESLint `no-focused-test`/`no-skipped-test`; checklist gate. |
| A single scenario asserting many unrelated things | Hard to isolate failure cause; violates one-scenario-one-behavior. | Already structurally avoided by Gherkin's one-scenario-per-behavior shape — don't undermine it by cramming extra assertions into an unrelated step. |
| Hardcoded absolute URLs or credentials in step definitions | Breaks across environments; leaks secrets into version control. | `.env` + `testing.baseUrlEnvVar` (Standard 5). |
| `try/catch` swallowing an assertion failure | Hides real bugs — the scenario reports green when it shouldn't. | Let assertions throw. Use `expect.soft()` only when a failure is genuinely meant to be non-blocking, and say why in `dev-log.md`. |

## Output / Contract

`plan.md` states the auth strategy (storage-state reuse or none needed) and
directory placement per the structure above. `dev-log.md` and
`code-quality-checklist.skill.md` confirm no anti-pattern from the table
survived to handoff. `npm run lint` passing is the mechanical proof for
the subset ESLint can catch.

## Related skills

- [`playwright-bdd-implementation-patterns.skill.md`](playwright-bdd-implementation-patterns.skill.md)
- [`design-patterns-and-solid.skill.md`](design-patterns-and-solid.skill.md)
- [`target-project-bootstrap.skill.md`](target-project-bootstrap.skill.md) — scaffolds this structure and tooling from nothing.
- [`code-quality-checklist.skill.md`](code-quality-checklist.skill.md)
