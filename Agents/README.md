# QE Migration System

An agentic system, built entirely on **GitHub Copilot custom chat modes in
VS Code**, that migrates a Selenium + Java + Cucumber (BDD) UI test suite
to Playwright + TypeScript (via
[`playwright-bdd`](https://github.com/vitalets/playwright-bdd)) — one
**explicitly requested Cucumber scenario** at a time — through four named
agents:

1. **Analyst** — reads a `.feature` scenario and resolves it against its
   Java step definitions, asks clarifying questions where genuinely
   ambiguous, writes `requirements.md`. The only agent that may add a
   scenario to migration scope.
2. **Architect** — designs the `playwright-bdd` implementation (step
   definitions, page objects, migration order), aggressively reuses
   existing steps/page objects, writes `plan.md`. Can also map an
   unfamiliar Cucumber project's structure into `docs/project-structure.md`,
   or — if `targetProjectPath` is an **existing** Playwright project —
   read and adapt to its real structure into `docs/target-project-structure.md`,
   on demand, without migrating anything.
3. **Engineer** — scaffolds the Playwright/`playwright-bdd` project from
   scratch if one doesn't exist yet, implements the plan into a real
   `.feature` file, step definitions, and page objects, asks the Architect
   (not the user) when the plan is unclear, writes `dev-log.md`.
4. **Validator** — runs the migrated scenario, checks for flake and
   regressions across shared steps, validates against the original
   requirements, writes `test-report.md`, routes failures to the right
   agent.

This is **not** a Claude Code / Claude-agent system — it's built for
GitHub Copilot Chat in VS Code, using its custom chat modes and prompt
files. See [`docs/agentic-workflow.md`](docs/agentic-workflow.md) for the
full design rationale, step-by-step usage, and a fuller discussion of
whether BDD/Gherkin is the right call at all (short version below).

## Already have a Selenium + Cucumber project? Start here

**[`docs/onboarding-existing-project.md`](docs/onboarding-existing-project.md)**
is a direct, copy-paste checklist for dropping this system into a real
repo you already have: exact copy commands, which config fields to set,
one full worked example scenario walked through all four agents, and a
troubleshooting table. Nothing in it touches your existing Java source —
it only adds the folders listed under **Layout** below.

## Is BDD/Cucumber the right choice for Playwright?

**Keep it if non-engineers actually read/write your `.feature` files;
otherwise plain Playwright Test usually has less overhead.** Given you're
migrating from Selenium+Cucumber, this system defaults to
**`playwright-bdd`**: it compiles your existing `.feature` files and
Given/When/Then steps into real Playwright tests, so Gherkin stays intact
while execution gets Playwright's native parallel runner, retries, trace
viewer, and HTML reporter — strictly better than porting to `cucumber-js`,
which runs on its own test runner and loses that native integration. If
it turns out your Gherkin layer is BDD in name only (no real business/QA
readership), dropping it for plain `test()`/`test.step()` is worth
revisiting later — see the full trade-off writeup in
[`docs/agentic-workflow.md`](docs/agentic-workflow.md#is-bddcucumber-still-the-right-call-for-playwright-and-why-playwright-bdd).

## What makes this robust

- **One config file, `.github/migration.config.json`**, is the single
  source of truth for paths, coding conventions, browser matrix, and — most
  importantly — the **scope allow-list**, tracked at individual **scenario**
  granularity (not just feature-file). Change behavior by editing this
  file (schema-validated in VS Code), not by editing agent prompts.
- **Hard scope guard**: agents may read as much of your codebase as they
  need for context — other scenarios in the same feature file, shared step
  definitions across features — but will only plan/implement/test a
  scenario that's explicitly registered in `scope.scenarios`. They never
  self-expand a migration batch.
- **A skills layer** (`.github/skills/*.skill.md`) factors detailed
  procedures out of the four chat mode files: Gherkin/step-definition
  analysis, ambiguity heuristics, step-definition and page-object reuse,
  tag/`Scenario Outline` handling, risk assessment, flake detection,
  defect triage, regression safety net, and more. See
  [`.github/skills/README.md`](.github/skills/README.md).
- **Portable**: designed to be copied straight into an existing Selenium/
  Cucumber repository. A one-time `/map-codebase` pass documents that
  repo's real structure (feature-file layout, step packages, World/DI
  setup, tags) so every later migration plans against known conventions
  instead of re-discovering them.
- **Efficient by construction**: the biggest cost in a Cucumber migration
  is reimplementing the same shared steps over and over — the
  `step-definition-consolidation` and `page-object-consolidation` skills
  make reuse-before-create a mandatory check, not a nice-to-have, so each
  additional migrated scenario in a batch gets cheaper, not more expensive.
- **Justified design, not decorated design**: the Architect can't hand off
  a plan with an unexplained abstraction. Every non-trivial Page Object,
  fixture, or pattern (Factory/Builder/Strategy/Adapter/Composite) gets a
  recorded reason — the problem it solves, the alternative considered, the
  SOLID principle it serves — in `plan.md`'s Design Rationale, and the
  Engineer verifies the code actually matches it before handoff. See
  [`.github/skills/design-patterns-and-solid.skill.md`](.github/skills/design-patterns-and-solid.skill.md),
  which also calls out Java-heritage anti-patterns (a ported Singleton
  driver, God Page Objects) to leave behind rather than migrate.
- **Cross-session memory, not just per-scenario logs**: `migration/<slug>/`
  is complete history for one scenario, but two more files carry memory
  *across* scenarios and chat sessions —
  [`docs/component-registry.md`](docs/component-registry.md) (everything
  reusable that exists, updated the moment the Engineer creates something
  new) and [`migration/CHANGELOG.md`](migration/CHANGELOG.md)
  (chronological history, one entry per scenario the Validator signs off).
  No agent has to re-scan the whole target project or re-read every past
  `dev-log.md` to know what's already there. See
  [`.github/skills/project-memory.skill.md`](.github/skills/project-memory.skill.md).
- **No Playwright project? It creates one. Already have one? It reads it.**
  If `targetProjectPath` has no `package.json` yet, the Engineer scaffolds
  a complete `playwright-bdd` project — correct `playwright.config.ts`,
  `tsconfig.json`, folder structure, dependencies — and runs the installs,
  before implementing the first scenario
  ([`.github/skills/target-project-bootstrap.skill.md`](.github/skills/target-project-bootstrap.skill.md)).
  If it's an **existing** Playwright project instead, the Architect reads
  its real structure and tooling first and **adapts `conventions.*` to
  match it** — rather than imposing this system's own folder layout —
  seeding `docs/component-registry.md` with what's already there so reuse
  covers your pre-existing code from scenario #1
  ([`.github/skills/target-project-discovery.skill.md`](.github/skills/target-project-discovery.skill.md)).
  If that project isn't BDD yet, it asks once whether to add
  `playwright-bdd` or migrate as plain Playwright tests instead
  ([`.github/skills/plain-playwright-fallback.skill.md`](.github/skills/plain-playwright-fallback.skill.md)).
- **Playwright best practices, mechanically enforced where possible**:
  every scaffolded project ships `eslint-plugin-playwright` wired up as a
  real handoff gate (`npm run lint`), not a suggestion — it catches a
  committed `test.only`, a `page.waitForTimeout()`, and other anti-
  patterns automatically. What isn't mechanically checkable (test
  isolation via fixtures, locators over ElementHandles, authenticate-once
  via storage-state reuse instead of a UI login in every scenario — the
  single biggest speed win off Selenium — and a directory structure that
  scales by feature area) is a standard the Architect/Engineer apply every
  scenario. See
  [`.github/skills/playwright-best-practices.skill.md`](.github/skills/playwright-best-practices.skill.md).

## Quick start

_Migrating an existing Selenium+Cucumber repo? Use
[`docs/onboarding-existing-project.md`](docs/onboarding-existing-project.md)
instead — it has copy commands and a worked example. The steps below are
the condensed version._

1. Open this folder in VS Code with GitHub Copilot Chat installed
   (2025+ build, so custom chat modes/prompt files are supported).
2. Edit `.github/migration.config.json`: set `seleniumProjectPath` and
   `seleniumSource.featuresDir`/`stepDefsDir` to your Cucumber suite's
   real locations (`seleniumProjectPath: "."` if you've dropped this
   system directly into that repo).
3. Set `targetProjectPath`: the bundled `playwright-migrated/` (then
   `cd playwright-migrated && npm install && npx playwright install`),
   **your own existing Playwright project** (nothing to install — the
   Architect reads and adapts to it automatically the first time it
   plans), or a fresh path that doesn't exist yet (the Engineer scaffolds
   and installs it automatically on first use).
4. If this is a new/unfamiliar repo, switch to **Architect** mode and run
   `/map-codebase` first.
5. Switch to **Analyst** mode and run `/migrate-scenario`, pointing it at
   one `.feature` file + scenario name.
6. Follow the handoff instructions each agent gives you (→ **Architect** →
   **Engineer** → **Validator**) until `test-report.md` signs off.

## Layout

```
.github/
  migration.config.json          # single source of truth: paths, conventions, scope allow-list
  migration.config.schema.json   # JSON Schema for editor validation/autocomplete
  migration.config.local.json.example  # per-machine override template (gitignored when copied)
  copilot-instructions.md        # shared context loaded into every chat mode
  chatmodes/                     # Analyst, Architect, Engineer, Validator
  skills/                        # reusable capability modules the agents read (see skills/README.md)
  prompts/                       # slash-command entry points (/migrate-scenario, /map-codebase, ...)
docs/
  agentic-workflow.md               # pipeline design, setup, usage, extension guide, BDD trade-off discussion
  onboarding-existing-project.md    # copy-paste checklist for dropping this into a real repo you already have
  selenium-to-playwright-mapping.md # Cucumber/Selenium → playwright-bdd/Playwright cheat sheet
  project-structure.md              # generated by /map-codebase (not present until you run it) — Selenium source
  target-project-structure.md       # generated when targetProjectPath is an existing Playwright project
  component-registry.md             # living index of reusable steps/page objects — kept current by the Engineer
migration/
  _template/                # copy per scenario: requirements/plan/dev-log/test-report
  <slug>/                   # created per migrated scenario
  CHANGELOG.md              # append-only history, one entry per scenario the Validator passes
playwright-migrated/        # bundled playwright-bdd target project — or let the Engineer scaffold one elsewhere
  features/, steps/         # mirror each other by feature area (steps/support/ = fixtures + hooks)
  pages/, pages/components/ # Page Object Model + shared composite components
  setup/auth.setup.ts       # storage-state auth reuse (disabled by default)
  eslint.config.mjs, .prettierrc.json, .env.example   # mechanically enforced best practices
```

## Status

Tooling scaffold is complete and ready to use. `scope.scenarios` starts
empty — nothing gets migrated until you run `/migrate-scenario` on a real
`.feature` file.
