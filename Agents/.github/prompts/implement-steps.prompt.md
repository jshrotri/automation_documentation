---
mode: 'engineer'
description: 'Implement the approved plan.md for a scenario into a real .feature file, playwright-bdd step definitions, and page objects.'
---
Implement the plan for slug:
${input:slug:The kebab-case slug, e.g. login--successful-login-with-valid-credentials}

First confirm `${input:slug}` is present in `.github/migration.config.json`
`scope.scenarios` (per the `scope-guard` skill).

Read `migration/${input:slug}/plan.md` and implement it in the target
project exactly, following your Engineer role: write the `.feature` file,
implement/reuse step definitions and page objects, type-check, run
`bddgen` and check for ambiguous-step warnings, smoke-run the scenario, log
decisions and any deviations to `migration/${input:slug}/dev-log.md`, then
run through the `code-quality-checklist` skill before telling me you're
done. If the plan is missing something you need, stop and write
`migration/${input:slug}/questions-for-planner.md` instead of guessing.
