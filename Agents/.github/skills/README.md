# Skills

A **skill** is a self-contained knowledge/procedure module that one or more
chat modes read before doing a specific kind of work — the same idea as a
runbook, factored out of the chat mode files so it can be reused,
versioned, and improved independently of any single agent's instructions.

Chat modes don't load skills automatically (Copilot custom chat modes have
no such primitive) — each `.chatmode.md` has a **## Skills** section near
the top that names exactly which skill files to read and when. To use a
skill in an agent it isn't already wired into, add its filename to that
agent's Skills section — nothing else needs to change.

## The four agents

| Agent | Chat mode file | Role |
|---|---|---|
| **Analyst** | `analyst.chatmode.md` | Reads a Cucumber scenario + its Java step definitions, clarifies ambiguity, writes `requirements.md`. Only agent that can add a scenario to scope. |
| **Architect** | `architect.chatmode.md` | Designs the `playwright-bdd` implementation, maximizes step/page-object reuse, writes `plan.md`. Can map an unfamiliar Selenium repo or an existing Playwright target project's structure on demand. |
| **Engineer** | `engineer.chatmode.md` | Implements `plan.md` into `.feature` files, step definitions, and page objects, writes `dev-log.md`. |
| **Validator** | `validator.chatmode.md` | Runs the migrated scenario, checks flake/regressions, writes `test-report.md`, routes failures. |

## Registry

| Skill | Used by | Trigger |
|---|---|---|
| [`scope-guard.skill.md`](scope-guard.skill.md) | all four | always, before acting |
| [`config-loader.skill.md`](config-loader.skill.md) | all four | always, first thing |
| [`artifact-contract.skill.md`](artifact-contract.skill.md) | all four | always |
| [`blocked-escalation.skill.md`](blocked-escalation.skill.md) | all four | when stuck |
| [`project-memory.skill.md`](project-memory.skill.md) | Architect, Engineer, Validator | always — cross-session memory of what exists and what's changed |
| [`gherkin-scenario-analysis.skill.md`](gherkin-scenario-analysis.skill.md) | Analyst | always |
| [`ambiguity-detection.skill.md`](ambiguity-detection.skill.md) | Analyst, Architect | always |
| [`codebase-structure-mapping.skill.md`](codebase-structure-mapping.skill.md) | Architect | on-demand (`/map-codebase`, or structure doc missing/stale) — **source** side |
| [`target-project-discovery.skill.md`](target-project-discovery.skill.md) | Architect, Engineer | on-demand (`targetProjectPath` is an **existing** Playwright project, structure doc missing/stale) — **target** side |
| [`plain-playwright-fallback.skill.md`](plain-playwright-fallback.skill.md) | Architect, Engineer, Validator | on-demand (`framework.style` is `"plain-playwright"`) |
| [`step-definition-consolidation.skill.md`](step-definition-consolidation.skill.md) | Architect, Engineer | always — the main efficiency lever |
| [`page-object-consolidation.skill.md`](page-object-consolidation.skill.md) | Architect | always |
| [`design-patterns-and-solid.skill.md`](design-patterns-and-solid.skill.md) | Architect, Engineer | always — every non-trivial structural choice needs a stated reason |
| [`playwright-best-practices.skill.md`](playwright-best-practices.skill.md) | Architect, Engineer | always — test isolation, locators, auth reuse, directory structure, anti-patterns |
| [`tag-and-outline-handling.skill.md`](tag-and-outline-handling.skill.md) | Architect, Validator | when tags/`Scenario Outline` present |
| [`migration-sequencing.skill.md`](migration-sequencing.skill.md) | Architect | when scope has >1 pending scenario |
| [`risk-assessment.skill.md`](risk-assessment.skill.md) | Architect | always |
| [`playwright-bdd-implementation-patterns.skill.md`](playwright-bdd-implementation-patterns.skill.md) | Engineer | always |
| [`target-project-bootstrap.skill.md`](target-project-bootstrap.skill.md) | Engineer | on-demand (`targetProjectPath` has no `package.json` yet) |
| [`code-quality-checklist.skill.md`](code-quality-checklist.skill.md) | Engineer | before every handoff |
| [`flake-detection.skill.md`](flake-detection.skill.md) | Validator | always |
| [`defect-triage.skill.md`](defect-triage.skill.md) | Validator | on failure |
| [`regression-safety-net.skill.md`](regression-safety-net.skill.md) | Validator | when `testing.runFullRegressionOnEachMigration` is true, or a shared step/page object changed |

## Adding a new skill

1. Copy [`_template.skill.md`](_template.skill.md) to `<name>.skill.md`.
2. Fill in Purpose / When to use / Steps / Output.
3. Add a row to the registry table above.
4. Add the filename to the **## Skills** section of whichever
   `.chatmode.md` file(s) should use it.

No code changes, no schema changes — skills are plain markdown the agent
reads with its normal file tools.

## Changing an existing skill

Edit the `.skill.md` file directly. Every chat mode reads it fresh each
session, so changes take effect immediately without touching the chat mode
files themselves — this is the main lever for tuning agent behavior
without digging through four mode files.
