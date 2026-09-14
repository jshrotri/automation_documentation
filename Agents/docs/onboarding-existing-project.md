# Using this system on an existing Selenium + Java + Cucumber project

A direct, follow-along walkthrough for applying this agentic migration
system to a real Selenium/Cucumber repository you already have. Everything
here is **additive** — no step touches your existing Java source, feature
files, or build config. Do it on a branch anyway, as hygiene, not because
anything here is destructive.

If you haven't read them yet, [`agentic-workflow.md`](agentic-workflow.md)
covers the pipeline design and [`selenium-to-playwright-mapping.md`](selenium-to-playwright-mapping.md)
covers the API/pattern translation reference. This doc is just the "what
do I actually type" checklist.

---

## 0. What you're adding

Three or four new folders at your repo root, copied from this system:

```
.github/               chat modes, prompts, skills, config — new
docs/                  mapping reference + generated project-structure.md/component-registry.md — new
migration/             per-scenario artifacts + CHANGELOG.md — new
playwright-migrated/   the new Playwright/TypeScript project — new, optional (see step 3)
```

Nothing under `src/`, `pom.xml`/`build.gradle`, your `.feature` files, or
your CI config is modified by anything in this checklist.

`playwright-migrated/` is genuinely optional to copy — if you'd rather the
target project land somewhere else, or get created fresh, skip copying it
and see step 3: the Engineer agent scaffolds one automatically the first
time it needs to implement into a path with no `package.json` yet.

## 1. Copy the system into your repo

**Windows (PowerShell):**

```powershell
$src = "D:\Projects\Personal\QE_MigrationSystem"
$dst = "C:\path\to\your-selenium-repo"

robocopy "$src\.github"             "$dst\.github"             /E
robocopy "$src\docs"                "$dst\docs"                /E
robocopy "$src\migration"           "$dst\migration"           /E
robocopy "$src\playwright-migrated" "$dst\playwright-migrated" /E   # optional — see step 3
```

**macOS/Linux:**

```bash
src=/path/to/QE_MigrationSystem
dst=/path/to/your-selenium-repo

cp -r "$src/.github"             "$dst/"
cp -r "$src/docs"                "$dst/"
cp -r "$src/migration"           "$dst/"
cp -r "$src/playwright-migrated" "$dst/"   # optional — see step 3
```

**If your repo already has a `.github/` folder** (CI workflows, an
existing `copilot-instructions.md`): don't overwrite wholesale. Copy in
`chatmodes/`, `skills/`, `prompts/`, `migration.config.json`,
`migration.config.schema.json`, and `migration.config.local.json.example`
alongside what's already there, and merge `copilot-instructions.md` by
hand if one already exists — keep their content, append this system's
sections.

## 2. Point the config at your real project

Open `.github/migration.config.json` (it's schema-validated, so VS Code
will autocomplete/flag typos as you edit) and set:

```json
{
  "seleniumProjectPath": ".",
  "targetProjectPath": "./playwright-migrated",
  "seleniumSource": {
    "featuresDir": "src/test/resources/features",
    "stepDefsDir": "src/test/java/com/yourorg/steps",
    "hooksDir": "src/test/java/com/yourorg/hooks"
  }
}
```

- `seleniumProjectPath: "."` — because you dropped this straight into the
  repo. Leave `scope.scenarios` as `[]`; you'll populate it via the
  Analyst agent, never by hand.
- `seleniumSource.*` — point these at your actual Maven/Gradle source
  layout. If features/steps live in non-standard locations, that's fine —
  just reflect reality here.
- `targetProjectPath` — keep the bundled `playwright-migrated/` as a
  sibling folder in the *same* repo (simplest: one PR surface, one place
  to `cd` into), or point it at a separate Playwright repo if you'd rather
  keep them decoupled. Nothing else in the system cares which you pick.

## 3. Set up the target project — three options

**Option A: you copied `playwright-migrated/`.** Just install it once:

```bash
cd playwright-migrated
npm install
npx playwright install
cp .env.example .env   # then fill in BASE_URL and any credentials needed
```

**Option B: you didn't copy it, or want it created fresh elsewhere.**
Nothing to do here — leave `targetProjectPath` pointing at wherever you
want it (it doesn't need to exist yet). The first time you run
`/implement-steps` in **Engineer** mode, it checks for a `package.json` at
that path; finding none, it scaffolds the whole project itself —
`package.json` with `playwright-bdd`, `playwright.config.ts` wired to
`defineBddConfig`, `tsconfig.json`, ESLint (`eslint-plugin-playwright`) and
Prettier configs, `.env.example`, the `features/`/`steps/`/`pages/`/
`pages/components/`/`utils/`/`setup/` folder structure, `.gitignore` — then
runs `npm install` and `npx playwright install` for you before
implementing the scenario. Set
`bootstrap.autoCreateTargetProject: false` in `migration.config.json` if
you'd rather it stop and ask instead of scaffolding automatically.

**Option C: you already have a Playwright project (your own repo, a
monorepo package, anything with `@playwright/test` in `package.json`) and
want migrated scenarios to land there.** Just point `targetProjectPath` at
it — nothing to copy, nothing to pre-configure. The first time the
**Architect** plans a scenario against that path, it runs
`target-project-discovery` automatically: reads the real
`playwright.config.ts`, directory layout, existing Page Objects/fixtures,
and lint/format tooling, then **updates `conventions.*` in
`migration.config.json` to match what's actually there** (it will tell you
exactly what it changed) and writes `docs/target-project-structure.md`. It
also seeds `docs/component-registry.md` with everything it found, so reuse
covers your pre-existing Page Objects/steps from the very first migrated
scenario.

If your existing project doesn't already use `playwright-bdd`, the
Architect asks you once, in chat, whether to add it (it coexists fine
alongside your existing `.spec.ts` files) or to migrate scenarios as plain
Playwright tests matching your project's existing style instead — each
Gherkin step becomes a `test.step()` call, so you don't lose the
step-by-step traceability back to the original scenario even without
Gherkin. Answer honestly based on whether anyone outside engineering
actually reads your `.feature` files; this gets recorded as
`framework.style` and isn't something to flip mid-migration.

## 4. Open in VS Code, confirm the agents show up

Open the repo root in VS Code with GitHub Copilot Chat installed. Click
the mode dropdown in the Chat view — you should see **Analyst**,
**Architect**, **Engineer**, **Validator** alongside the built-in
Ask/Edit/Agent modes.

If they're not there: your Copilot Chat extension build is too old for
custom chat modes/prompt files, or `chat.promptFiles`/custom-chat-modes
needs enabling under VS Code Settings.

## 5. One-time: map your real codebase

Switch to **Architect** mode and run:

```
/map-codebase
```

It reads your whole `src/test/...` tree — feature-file layout, step
definition packages, whatever DI framework (PicoContainer/Spring/Guice)
wires your Cucumber World, hooks, tag taxonomy, the Page Object layer —
and writes `docs/project-structure.md`. This is a **read-only
documentation pass**: it doesn't add anything to migration scope and
doesn't migrate anything, even though it reads scenarios you haven't asked
for. It's what lets step/page-object reuse actually work starting from
scenario #1 instead of the Architect guessing at your conventions cold.
Worth doing even for a small suite — it's a few minutes, once, and you can
re-run it later if the doc goes stale.

## 6. Migrate your first scenario, end to end

Pick one real scenario. Example:

```gherkin
# src/test/resources/features/login.feature
Feature: Login

  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I log in as "standard_user"
    Then I should see the dashboard
```

Walk it through all four agents in order:

1. **Analyst** mode → run:
   ```
   /migrate-scenario
   ```
   Give it `src/test/resources/features/login.feature` and the scenario
   name `Successful login with valid credentials`. This registers the
   scenario in `scope.scenarios` — the *only* way anything becomes
   authorized; other scenarios in that same file stay untouched unless you
   name them too. It resolves each Gherkin step against your real Java
   step definitions, asks you anything genuinely ambiguous, and writes
   `migration/login--successful-login-with-valid-credentials/requirements.md`.

2. **Architect** mode → run:
   ```
   /plan-migration
   ```
   with that slug. Designs the `.feature`/step/page-object layout, checks
   for reusable steps/page objects (first scenario, so mostly new),
   applies SOLID reasoning to any new structure, writes `plan.md`
   (including the Design Rationale table).

3. **Engineer** mode → run:
   ```
   /implement-steps
   ```
   Bootstraps `playwright-migrated/` first if it doesn't exist yet (see
   step 3 above), then writes the real `.feature` file, step definitions,
   and page object, runs `bddgen` + type-check + a smoke run, logs
   everything to `dev-log.md`, and adds a row to
   `docs/component-registry.md` for each new step/page object it created
   (so the *next* scenario's Architect run can reuse them instead of
   rebuilding).

4. **Validator** mode → run:
   ```
   /validate-scenario
   ```
   Runs the scenario for real across your configured browsers with
   flake-check repeats, cross-checks every acceptance criterion, signs off
   `test-report.md`, and — only on a pass — appends one entry to
   `migration/CHANGELOG.md`.

If any step says it's blocked (a `questions-for-planner.md` or
`defects.md` appears), it will tell you exactly which mode to switch back
to — follow that instruction rather than improvising.

## 7. Scale up

Repeat step 6 for each additional scenario, or register several at once
from **Analyst** mode with:

```
/add-scenarios
```

Migrations after the first get noticeably cheaper — the Architect's
step-definition and page-object reuse checks mean shared steps (e.g.
`Given I am logged in as {string}`) and shared page objects get reused
across scenarios instead of rebuilt each time.

## 8. Tracking progress and cross-session memory

Three places to look, depending on what you need:

- **`.github/migration.config.json`'s `scope.scenarios[].status`** — the
  live per-scenario dashboard: `pending` → `requirements-complete` →
  `planned` → `implemented` → `passed`/`failed`/`blocked`. Open the file
  any time; there's no rendered view beyond the raw JSON yet.
- **`migration/CHANGELOG.md`** — chronological history: what was migrated,
  when, and why, one entry per scenario the Validator signed off. This is
  what to read for "what's happened in this migration so far" without
  opening every `migration/<slug>/` folder individually.
- **`docs/component-registry.md`** — what already exists to reuse: every
  step definition, page object, fixture, and hook, kept current in real
  time by the Engineer. This is what makes later scenarios cheaper than
  earlier ones — the Architect checks it before deciding anything needs to
  be built from scratch.

Neither memory file is something you maintain by hand — the agents keep
them current as part of their normal process (see
`.github/skills/project-memory.skill.md`).

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| No Analyst/Architect/Engineer/Validator in the mode dropdown | Copilot Chat extension too old, or `.github/chatmodes/*.chatmode.md` not being auto-discovered — check `chat.promptFiles`/`chat.modeFilesLocations` in Settings. |
| An agent says a scenario "isn't in scope" | Expected behavior — only Analyst mode (via `/migrate-scenario` or `/add-scenarios`) can add to `scope.scenarios`. Run that first. |
| `bddgen` reports ambiguous/duplicate steps | Two step definitions match the same Gherkin text — see `.github/skills/step-definition-consolidation.skill.md`; this is what the Engineer's pre-handoff checklist is supposed to catch before you ever see it. |
| Architect keeps re-discovering the same project structure | `docs/project-structure.md` is missing or wasn't generated — run `/map-codebase` in Architect mode. |
| Engineer refuses to implement, asks you to scaffold the target project yourself | `bootstrap.autoCreateTargetProject` is set to `false` in `migration.config.json` — either flip it to `true`, or scaffold `targetProjectPath` manually (copy `playwright-migrated/`'s structure). |
| Later scenarios aren't reusing earlier steps/page objects | `docs/component-registry.md` may be missing or wasn't updated — check it was created during bootstrap/first implementation, and that `dev-log.md` for prior scenarios lists registry updates. |
| Engineer implements against your existing project but ignores its real folder layout | The Architect skipped `target-project-discovery` — check whether `docs/target-project-structure.md` exists. If not, switch to **Architect** mode and let it run (it should trigger automatically the first time it plans against an existing project; if it didn't, `targetProjectPath` may not have `@playwright/test` in its `package.json` yet, or the check was skipped in a resumed session). |
| Agents write `.feature`/step files into a plain Playwright project that doesn't use Gherkin | `framework.style` is still `"playwright-bdd"` when it should be `"plain-playwright"` — this gets set by `target-project-discovery` after asking you; if you weren't asked, that discovery pass didn't run (see previous row). |
