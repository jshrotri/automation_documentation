# playwright-migrated

Target project for the Selenium/Java/Cucumber → Playwright/TypeScript
migration, built on **[playwright-bdd](https://github.com/vitalets/playwright-bdd)**:
`.feature` files and Given/When/Then step definitions compile into real
Playwright tests, so Gherkin stays intact for readability while execution
gets Playwright's native parallel runner, retries, trace viewer, and HTML
reporter. This is where the **Engineer** and **Validator** agents read/
write — see [`../docs/agentic-workflow.md`](../docs/agentic-workflow.md)
for the full pipeline and
[`../.github/skills/playwright-best-practices.skill.md`](../.github/skills/playwright-best-practices.skill.md)
for the engineering standards this project holds to.

## Setup

```bash
npm install
npx playwright install
cp .env.example .env   # then fill in real values
```

## Running tests

```bash
npm test                 # bddgen + headless, all browsers
npm run test:headed      # bddgen + headed
npm run test:ui          # bddgen + Playwright's UI mode
npm run bddgen           # just compile .feature/steps without running
npm run report           # open the last HTML report
npm run typecheck        # tsc --noEmit
npm run lint             # eslint-plugin-playwright's recommended rules
npm run lint:fix
npm run format            # prettier --write
npm run format:check
```

Run a single scenario or tag directly:

```bash
npx bddgen && npx playwright test --grep "Successful login"
npx bddgen --tags "@smoke and not @wip" && npx playwright test
```

`BASE_URL` (and any other env vars) come from `.env` — see `.env.example`.
`playwright.config.ts` loads it via `dotenv`.

## Structure

- `features/` — `.feature` files. Once there's more than one feature area,
  split into subfolders (`features/auth/`, `features/checkout/`, ...)
  mirroring the Java suite's grouping — don't flat-dump everything.
- `steps/` — step definitions (`createBdd()`-based), organized to mirror
  `features/` 1:1 (see `docs/project-structure.md`).
- `steps/support/fixtures.ts` — the World-equivalent: shared per-scenario
  state as Playwright fixtures.
- `steps/support/hooks.ts` — `Before`/`After` hooks, tag-scoped like their
  Java source.
- `setup/auth.setup.ts` — plain (non-BDD) Playwright test implementing the
  storage-state authentication-reuse pattern; disabled by default, see the
  commented-out `setup` project in `playwright.config.ts`.
- `pages/` — Page Object Model classes, one per page.
- `pages/components/` — shared composite components (header, nav, a
  modal) composed into page objects, not duplicated per page.
- `utils/` — test data and helpers.
- `.features-gen/` (gitignored) — `bddgen`'s generated Playwright test
  files; never hand-edit this, it's regenerated on every run.
- `playwright/.auth/` (gitignored) — storage-state JSON written by
  `setup/auth.setup.ts` at runtime, if enabled.

## Code quality

`eslint.config.mjs` runs `eslint-plugin-playwright`'s recommended rules —
this is a real CI/handoff gate (`npm run lint`), not optional, and is what
mechanically catches the anti-patterns listed in
[`playwright-best-practices.skill.md`](../.github/skills/playwright-best-practices.skill.md)
(`page.waitForTimeout`, a committed `test.only`/`test.skip`, etc.).
`.prettierrc.json` keeps formatting consistent; run `npm run format`
before committing if your editor doesn't already format on save.

Do not hand-write files here casually — this project is built up by the
**Engineer** agent from `migration/<slug>/plan.md`, so that every change
has a traceable requirements → plan → implementation → test-report chain.
