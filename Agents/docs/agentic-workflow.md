# Agentic Migration Workflow (GitHub Copilot / VS Code)

This system runs entirely inside **GitHub Copilot Chat in VS Code**, using
four **custom chat modes** — not Claude, not an external orchestrator.
Copilot's custom chat modes are user-selected and don't call each other
automatically, so the "multi-agent" behavior comes from three things
working together:

1. A **file-based handoff contract** — each agent reads the file(s) the
   previous agent produced and writes its own before telling you which
   agent to switch to next (see `.github/skills/artifact-contract.skill.md`).
2. A **skills layer** — reusable, independently-editable knowledge/
   procedure modules under `.github/skills/` that the agents read before
   acting, instead of each agent's instructions duplicating (and drifting
   out of sync with) the same logic.
3. A **single config file** — `.github/migration.config.json` — holding
   every path, convention, and the scope allow-list, so behavior changes
   by editing data, not prompts.

```
 ┌──────────┐   requirements.md   ┌───────────┐   plan.md   ┌──────────┐   dev-log.md   ┌───────────┐
 │ Analyst  │ ──────────────────► │ Architect │ ──────────► │ Engineer │ ──────────────► │ Validator │
 └──────────┘                     └─────┬─────┘             └────┬─────┘                 └─────┬─────┘
      ▲                                 │ questions-for-planner.md ▲                             │
      │                                 └───────────────────────────┘                            │
      │                        defects.md (design gap)                                            │
      └────────────────────────────────────────────────────────────────────────────────────────────┘
                                    defects.md (implementation bug) → back to Engineer
```

Every arrow in this diagram is a file on disk, checked by both sides
against `.github/migration.config.json`'s `scope.scenarios` before either
side acts on it — see **Scope guard** below.

## The four agents

| Agent | Chat mode | Does | Never does |
|---|---|---|---|
| **Analyst** | `analyst.chatmode.md` | Reads a `.feature` scenario + resolves its Java step definitions, clarifies ambiguity, writes `requirements.md`. Only agent that adds to scope. | Design or code. |
| **Architect** | `architect.chatmode.md` | Designs the `playwright-bdd` implementation, maximizes step/page-object reuse, applies SOLID and a justified design-pattern choice for every non-trivial structure, writes `plan.md`. Maps an unfamiliar Selenium repo or an existing Playwright target project's structure on demand, adapting conventions to match. | Write `.ts`/`.feature` code. |
| **Engineer** | `engineer.chatmode.md` | Bootstraps `targetProjectPath` from scratch if it doesn't exist yet, then implements `plan.md`: `.feature` file, step definitions, page objects — matching the plan's design rationale, not reshaping it. Registers new reusable components in `docs/component-registry.md`. Writes `dev-log.md`. | Invent design decisions the plan didn't cover. |
| **Validator** | `validator.chatmode.md` | Runs the scenario, checks flake/regressions, validates against `requirements.md`, writes `test-report.md`. Appends to `migration/CHANGELOG.md` on a pass. | Edit step definitions/page objects/feature files. |

## One-time setup

1. **VS Code + GitHub Copilot Chat extension**, a recent build that
   supports custom chat modes and prompt files (2025+). If your Chat view
   has no mode dropdown next to "Ask/Edit/Agent", update the extension.
2. Confirm custom chat modes are discovered: Chat view → mode dropdown →
   you should see **Analyst**, **Architect**, **Engineer**, **Validator**.
   VS Code auto-discovers `.github/chatmodes/*.chatmode.md` and
   `.github/prompts/*.prompt.md` in the workspace root by default; if
   they don't show up, check Settings for `chat.promptFiles`/"custom chat
   modes" or `chat.modeFilesLocations`/`chat.promptFilesLocations`.
3. Open `.github/migration.config.json` and set `seleniumProjectPath` and
   `seleniumSource.featuresDir`/`stepDefsDir` (see **Dropping this into an
   existing project** below), and `targetProjectPath` — the bundled
   `playwright-migrated/` scaffold, an existing Playwright project you
   already have (see **Pointing at an existing Playwright target project**
   below), or a fresh path that doesn't exist yet. The file has a
   `$schema` reference, so VS Code will validate and autocomplete it as
   you edit.
4. `cd <targetProjectPath> && npm install && npx playwright install` —
   only needed if `targetProjectPath` already has a scaffolded project
   (the bundled `playwright-migrated/`, or your own existing one). If it
   doesn't exist yet, skip this: the **Engineer** agent scaffolds it
   automatically the first time it implements a scenario (see
   `.github/skills/target-project-bootstrap.skill.md`), including running
   this install for you.

## Dropping this into an existing Selenium/Cucumber project

Full step-by-step checklist (copy commands, config fields to set, a worked
example scenario migrated through all four agents, troubleshooting table):
see **[`onboarding-existing-project.md`](onboarding-existing-project.md)**.

Short version: copy `.github/`, `docs/`, and `migration/` into your real
repo's root (merge `.github/` if it already has Copilot config), set
`seleniumProjectPath: "."` and point `seleniumSource.featuresDir`/
`stepDefsDir`/`hooksDir` at your real paths, then run **Architect** mode's
`/map-codebase` once before migrating anything — it reads the whole repo
(exempt from the scope restriction, since it only ever produces
documentation) and writes `docs/project-structure.md`, which is what lets
step/page-object reuse actually work from scenario #1 instead of the
Architect guessing at your conventions cold.

## Pointing at an existing Playwright target project

`targetProjectPath` doesn't have to be empty or the bundled
`playwright-migrated/` scaffold — set it to a Playwright project you
already have (your own repo, a monorepo package, anything with
`@playwright/test` in its `package.json`) and the Architect reads it
before planning anything, the same way it reads the Selenium source.

The first time the Architect plans a scenario against that path, it runs
[`skills/target-project-discovery.skill.md`](../.github/skills/target-project-discovery.skill.md):
detects whether `playwright-bdd` is already there, reads the real
`playwright.config.ts`, directory layout, existing Page Objects/fixtures,
and lint/format tooling, then **updates `conventions.*` in
`migration.config.json` to match what's actually there** and writes
`docs/target-project-structure.md`. It also seeds `docs/component-registry.md`
with everything it found, so step/page-object reuse covers your
pre-existing code from the very first migrated scenario, not just what
this system adds afterward.

If that project doesn't already use `playwright-bdd`, the Architect asks
you once, in chat, whether to add it (coexists fine alongside existing
`.spec.ts` files) or to migrate scenarios as plain Playwright tests
matching the existing style instead
([`skills/plain-playwright-fallback.skill.md`](../.github/skills/plain-playwright-fallback.skill.md) —
each Gherkin step becomes a `test.step()` call, so the traceability back
to the original scenario isn't lost even without Gherkin itself). This is
recorded as `framework.style` and isn't something to change casually once
scenarios are implemented against it.

## Scope guard: only what you explicitly provide gets migrated

`migration.config.json`'s `scope.scenarios` is the single allow-list, at
**scenario** granularity — a `.feature` file having 20 scenarios doesn't
mean all 20 are in scope just because one is. **Only Analyst mode adds to
it** — when you hand it a feature file + scenario name via
`/migrate-scenario` (or `/add-scenarios` for several at once), that's what
"providing a scenario" means here. Architect, Engineer, and Validator will
refuse to create or edit any artifact for a slug that isn't already in
this list, even one they notice while reading a `Background` or a shared
step definition for context. If you want another scenario migrated, say
so explicitly.

Each entry's `status` field (`pending` → `requirements-complete` →
`planned` → `implemented` → `passed`/`failed`/`blocked`) doubles as an
at-a-glance progress dashboard.

## Running the pipeline for one scenario

1. **Analyst** — run `/migrate-scenario` with the feature file + scenario
   name. This registers it in scope and writes
   `migration/<slug>/requirements.md`. Answer its clarifying questions.
2. **Architect** — run `/plan-migration` with the slug → `plan.md`. If
   requirements are incomplete, it sends you back to step 1.
3. **Engineer** — run `/implement-steps` with the slug → `.feature` file +
   step definitions/page objects + `dev-log.md`. If blocked, it writes
   `questions-for-planner.md` — go to **Architect**, resolve, return here.
4. **Validator** — run `/validate-scenario` with the slug →
   `test-report.md`. On failure it writes `defects.md`, triaged to tell
   you whether to return to **Engineer** (bug), **Architect** (design
   gap), or **Analyst** (requirements/Gherkin-wording gap).
5. Repeat from the step it sends you back to until `test-report.md` signs
   off clean with no flakiness.

## Design discipline: SOLID and justified patterns, not decoration

Every structural choice the Architect makes — a new Page Object, a
component class, a fixture, a Factory/Builder/Strategy — gets a **Design
Rationale** entry in `plan.md`: the problem it solves, an alternative that
was considered and rejected, which SOLID principle it serves, and the
trade-off it costs. The Engineer checks its own work against that
rationale before handoff (`dev-log.md`'s Design Pattern Adherence
section), and a design smell found later (a page object outgrowing its
one page, a step reaching past its Page Object into raw locators) routes
back to the Architect as a defect, not something to patch around.

The point isn't to sprinkle named patterns everywhere — plenty of code
should stay plain. See
[`.github/skills/design-patterns-and-solid.skill.md`](../.github/skills/design-patterns-and-solid.skill.md)
for the full pattern catalog, the SOLID mapping specific to this
Page-Object/BDD architecture, and the anti-patterns (a ported Singleton
driver, God Page Objects, deep inheritance) to actively avoid rather than
carry over from the Java suite.

## Playwright engineering standards, mechanically enforced where possible

Every scaffolded target project ships with the tooling to enforce
Playwright's own best practices, not just prose describing them:
`eslint.config.mjs` runs `eslint-plugin-playwright`'s recommended rules —
`npm run lint` is a real handoff gate in
[`code-quality-checklist.skill.md`](../.github/skills/code-quality-checklist.skill.md),
catching things like a committed `test.only`/`test.skip` or
`page.waitForTimeout()` automatically instead of relying on review.

What isn't mechanically checkable is still a deliberate standard the
Architect and Engineer apply every scenario: test isolation (fixtures, not
shared/global state), locators over ElementHandles, authenticate-once via
Playwright's storage-state pattern instead of a UI login in every
scenario (the single biggest speed win when migrating off Selenium — see
`docs/selenium-to-playwright-mapping.md`'s "Authentication" section), and
a directory structure that scales by feature area rather than flattening
everything into one folder. Full detail:
[`.github/skills/playwright-best-practices.skill.md`](../.github/skills/playwright-best-practices.skill.md).

## Migrating multiple scenarios efficiently

Register each one via `/migrate-scenario` or `/add-scenarios` (one
`requirements.md` per scenario — don't merge unrelated ones, even from the
same feature file). The Architect's `migration-sequencing` skill then
groups pending scenarios by shared step definitions/page objects and
recommends an order, so shared infrastructure gets built once — the
`step-definition-consolidation` skill (Gherkin's whole premise is step
reuse) and `page-object-consolidation` skill are the two biggest levers
for making later scenarios in a batch migrate noticeably faster than the
first.

## Extending or reconfiguring the system

- **Change a path, a convention, the browser matrix, flake-check repeats**:
  edit `.github/migration.config.json` (or a personal
  `migration.config.local.json` override). No prompt or mode file needs to
  change.
- **Change how an agent behaves**: edit the relevant `.skill.md` file under
  `.github/skills/` — every agent re-reads skills fresh each session.
- **Add new agent behavior entirely**: add a new `.skill.md` (copy
  `.github/skills/_template.skill.md`), list it in
  `.github/skills/README.md`'s registry, and add its filename to the
  relevant chat mode's `## Skills` section.
- **Add a new slash-command entry point**: add a `.prompt.md` under
  `.github/prompts/` with `mode:` set to the chat mode it should run in.

## Is BDD/Cucumber still the right call for Playwright? (and why playwright-bdd)

Short answer: **keep it if real people outside engineering read or write
your `.feature` files; otherwise plain Playwright Test is usually less
overhead.** Three options were on the table for this system:

- **`playwright-bdd`** (what this system uses) — compiles Gherkin +
  Cucumber-Expression steps into native Playwright tests. Keeps the
  business-readable format your Java suite already has, and you gain
  Playwright's own parallel runner, retries, trace viewer, and reporter
  instead of losing them to a separate test framework. This is the best
  option *if you're keeping Gherkin at all* — it has essentially no
  downside relative to plain `cucumber-js` for a team already invested in
  feature files.
- **`cucumber-js`** — the "purist" match to Cucumber-JVM's own runner and
  philosophy, but it runs on Cucumber's own test runner rather than
  Playwright's, so you lose native parallelism/trace-viewer/HTML-report
  integration unless you wire it up yourself. More setup for less payoff
  than `playwright-bdd` in nearly every case where Playwright is the
  target.
- **Plain Playwright Test** (`test()` + `test.step()`, no Gherkin layer at
  all) — the option worth genuinely considering if your Cucumber layer
  today is mostly internal (QA/dev-only step definitions with no real
  business/product/manual-QA readership), because `test.step()` already
  gives readable, hierarchical step names in the HTML report and trace
  viewer without a translation layer, glue-code indirection, or
  step-matching ambiguity to manage. Stronger end-to-end TypeScript typing
  too, since there's no string-matched step boundary breaking type
  inference between Gherkin text and its implementation.

If it turns out Gherkin in this codebase is BDD in name only, dropping it
is a legitimate pivot. `framework.style: "plain-playwright"` +
[`plain-playwright-fallback.skill.md`](../.github/skills/plain-playwright-fallback.skill.md)
support this directly — it's what gets set automatically when
`target-project-discovery` finds an existing plain Playwright project and
you opt not to add `playwright-bdd` to it (see **Pointing at an existing
Playwright target project** above). It's still an architecture decision,
not a casual toggle — every scenario planned against one style keeps that
shape, so decide it deliberately, once, rather than flipping it mid-batch.

## Directory reference

- `.github/migration.config.json` (+ `.schema.json`, `.local.json.example`) — the single source of truth for paths, conventions, and scope.
- `.github/copilot-instructions.md` — shared context loaded into every agent.
- `.github/chatmodes/{analyst,architect,engineer,validator}.chatmode.md` — the four agent definitions (thin — they point at skills for detail).
- `.github/skills/*.skill.md` — the reusable capability modules; see `.github/skills/README.md`.
- `.github/prompts/*.prompt.md` — slash-command entry points into each agent.
- `docs/selenium-to-playwright-mapping.md` — Cucumber/Selenium→playwright-bdd/Playwright API/pattern cheat sheet.
- `docs/project-structure.md` — generated by `/map-codebase`; describes the Selenium/Cucumber source repo.
- `docs/target-project-structure.md` — generated by `target-project-discovery.skill.md` when `targetProjectPath` is an existing Playwright project; describes its real structure and the `framework.style` decision.
- `docs/component-registry.md` — living index of reusable step definitions/page objects/fixtures, kept current by the Engineer (see `.github/skills/project-memory.skill.md`) and seeded from a pre-existing target project by `target-project-discovery.skill.md`.
- `migration/<slug>/` — per-scenario artifacts.
- `migration/CHANGELOG.md` — append-only chronological log, one entry per scenario the Validator signs off as passed.
- `playwright-migrated/` — the bundled target project, or point `targetProjectPath` at a fresh location and let the Engineer scaffold it automatically (`.github/skills/target-project-bootstrap.skill.md`):
  - `features/`, `steps/` (+ `steps/support/` for fixtures/hooks) — mirror each other by feature area.
  - `pages/` (+ `pages/components/` for shared composite pieces), `utils/`, `setup/auth.setup.ts` (storage-state auth reuse, disabled by default).
  - `eslint.config.mjs`, `.prettierrc.json`, `.env.example` — the mechanically-enforced half of `.github/skills/playwright-best-practices.skill.md`.
