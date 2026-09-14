---
mode: 'validator'
description: 'Run and validate the migrated scenario against its requirements.md, including flake and regression checks.'
---
Validate the migration for slug:
${input:slug:The kebab-case slug, e.g. login--successful-login-with-valid-credentials}

First confirm `${input:slug}` is present in `.github/migration.config.json`
`scope.scenarios` (per the `scope-guard` skill).

Run `bddgen` then the migrated scenario, flake-check per the
`flake-detection` skill (repeats from `testing.flakeCheckRepeats`, every
`Examples` row if it's a Scenario Outline — see `tag-and-outline-handling`),
apply `regression-safety-net` if it's triggered, cross-check every
acceptance criterion in `migration/${input:slug}/requirements.md`, and
write `migration/${input:slug}/test-report.md` following your Validator
role. On failure, triage per `defect-triage`, write
`migration/${input:slug}/defects.md`, and tell me exactly which mode to
switch back to.
