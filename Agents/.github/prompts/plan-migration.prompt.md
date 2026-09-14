---
mode: 'architect'
description: 'Design the playwright-bdd implementation plan for a scenario whose requirements.md is already complete.'
---
Create (or update) the implementation plan for slug:
${input:slug:The kebab-case slug, e.g. login--successful-login-with-valid-credentials}

First confirm `${input:slug}` is present in `.github/migration.config.json`
`scope.scenarios` (per the `scope-guard` skill) — if it isn't, stop and
tell me to run `/migrate-scenario` first instead of planning it anyway.

Read `migration/${input:slug}/requirements.md` and the existing target
project structure (running `codebase-structure-mapping` first if
`docs/project-structure.md` is missing/stale), apply
`step-definition-consolidation` and `page-object-consolidation` before
proposing anything new, then produce `migration/${input:slug}/plan.md`
following your Architect role exactly. If `requirements.md` is missing or
has unresolved open questions, stop and tell me to run Analyst mode first
instead of guessing.
