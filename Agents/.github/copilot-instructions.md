# QE Migration System — Shared Copilot Context

This file is loaded automatically into every GitHub Copilot Chat request in
this workspace (VS Code setting
`github.copilot.chat.codeGeneration.useInstructionFiles`, on by default in
recent builds). It is the shared memory across the four custom chat modes
that make up this project's agentic migration system.

## Mission

Migrate an existing **Selenium + Java + Cucumber (BDD)** UI test suite to
**Playwright + TypeScript, via [`playwright-bdd`](https://github.com/vitalets/playwright-bdd)**,
one explicitly-requested Cucumber **scenario** at a time, using four
specialized Copilot chat modes that hand work to each other through files
on disk:

1. **Analyst** → `requirements.md`
2. **Architect** → `plan.md`
3. **Engineer** → `.feature` file, step definitions, page objects, `dev-log.md`
4. **Validator** → `test-report.md`

See [`docs/agentic-workflow.md`](../docs/agentic-workflow.md) for the full
pipeline, and [`.github/skills/README.md`](skills/README.md) for the
reusable capability modules ("skills") each agent draws on.

## Why playwright-bdd

`playwright-bdd` compiles `.feature` files and Given/When/Then step
definitions into real Playwright test files. That keeps the Gherkin
scenario format your Java suite already uses — and whatever
business/QA-stakeholder readability it provides — while execution runs on
Playwright's own test runner: native parallel workers, auto-retries, trace
viewer, HTML reporter. It's the closest structural match to Cucumber-JVM
(separate `.feature` files and step definitions, not everything flattened
into one `.spec.ts`) while gaining Playwright's tooling instead of
fighting it. See the "BDD or not" note in
[`docs/agentic-workflow.md`](../docs/agentic-workflow.md) if you want the
fuller trade-off discussion later.

## Single source of truth: `.github/migration.config.json`

**Every path, convention, and the scope allow-list live in this one file**
(schema: `.github/migration.config.schema.json`), not hard-coded into
chat mode prompts. To reconfigure this system for a different repo, a
different target project location, different locator preferences, or a
different browser matrix — **edit this file**, not the chat modes or
skills. A `.github/migration.config.local.json` (gitignored, see
`.example` template) can override it per-machine without touching the
shared config.

Every chat mode reads this file first, via
[`skills/config-loader.skill.md`](skills/config-loader.skill.md).

## Scope is explicit and agent-enforced, at scenario granularity

`migration.config.json`'s `scope.scenarios` is the **only** list of
scenarios these agents may act on — each entry is a
`{ slug, featureFile, scenario, status }` tuple, where `scenario` is an
exact Scenario/Scenario Outline name or `"*"` for every scenario in that
file. Only the **Analyst** adds to it (when you explicitly hand it a
feature file + scenario — that's what "providing" a scenario means here).
Architect, Engineer, and Validator read the whole codebase freely for
context — including other scenarios in the same `.feature` file, since
`Background` and shared step definitions require that — but refuse to
plan, implement, or report on anything not in that list. See
[`skills/scope-guard.skill.md`](skills/scope-guard.skill.md). This is what
makes it safe to point this system at a large, unfamiliar Cucumber
codebase: it will look around, but it will only ever touch what you named.

## Portable by design

This whole `.github/` folder (chat modes, prompts, skills, config) plus
`docs/` and `migration/` is meant to be copied straight into an existing
Selenium/Java/Cucumber repository, alongside the real source — set
`seleniumProjectPath` to `"."` in that case. On first use in a new/
unmapped repo, run the **Architect**'s `/map-codebase` prompt
([`skills/codebase-structure-mapping.skill.md`](skills/codebase-structure-mapping.skill.md))
to generate `docs/project-structure.md` — feature-file organization, step
definition packages, World/DI setup, hooks, tag taxonomy — before planning
any migration. It's a read-only documentation pass, exempt from the scope
restriction above precisely because it never writes migration output.

## `targetProjectPath`: three supported states

1. **Doesn't exist yet** — the Engineer scaffolds a full `playwright-bdd`
   project from scratch (see
   [`skills/target-project-bootstrap.skill.md`](skills/target-project-bootstrap.skill.md)).
2. **An existing Playwright project you already have** — your own repo, a
   monorepo package, whatever. The Architect reads its real structure
   (does it already use `playwright-bdd`? what's the directory layout?
   what tooling is already configured?) and **adapts `conventions.*` to
   match it** rather than imposing this system's defaults — see
   [`skills/target-project-discovery.skill.md`](skills/target-project-discovery.skill.md).
   If that project doesn't already use `playwright-bdd`, the Architect
   asks you, once, whether to add it or migrate as plain Playwright tests
   instead (see
   [`skills/plain-playwright-fallback.skill.md`](skills/plain-playwright-fallback.skill.md)).
3. **The bundled `playwright-migrated/` scaffold** — just a pre-built
   instance of case 2.

## Target project conventions

The authoritative values are in `migration.config.json`'s `conventions`,
`seleniumSource`, and `testing` blocks (feature/step/support directory
names, locator preference order, hard-sleep policy, Cucumber-Expression
vs. regex style, flake-check repeats, browser matrix). The rationale and
detailed how-to for each are in
[`skills/playwright-bdd-implementation-patterns.skill.md`](skills/playwright-bdd-implementation-patterns.skill.md)
and
[`docs/selenium-to-playwright-mapping.md`](../docs/selenium-to-playwright-mapping.md) —
read those rather than expecting this file to restate them; this file
stays intentionally thin so it doesn't drift out of sync with the skills
that actually govern behavior.

## Tool names in the chat mode files

The `tools:` lists in `.github/chatmodes/*.chatmode.md` use the tool ids
current as of late 2025 VS Code builds (`codebase`, `editFiles`,
`runCommands`, `runTasks`, `terminal`, `testFailure`, `problems`, `search`,
`usages`, `fetch`). If your VS Code/Copilot version names these
differently, open the mode file's tool picker in the Chat view and
re-select the closest equivalents — the instructions and skills are what
matter, the tool ids are just capability grants.
