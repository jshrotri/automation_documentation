---
name: 'regression-safety-net'
usedBy: ['validator']
trigger: 'on-demand: testing.runFullRegressionOnEachMigration is true, or Architect flagged a shared step definition/page object change in plan.md'
---
# Skill: Regression Safety Net

## Purpose

Reusing step definitions/Page Objects across migrated scenarios (per
[`step-definition-consolidation.skill.md`](step-definition-consolidation.skill.md)
and
[`page-object-consolidation.skill.md`](page-object-consolidation.skill.md))
means a change made for one scenario can break another that already
passed — and in a BDD suite, one shared step can back a dozen scenarios,
so the blast radius of a step-definition edit is often wider than a single
Page Object edit would be.

## When to use

- `testing.runFullRegressionOnEachMigration` is `true` in config, or
- The current slug's `plan.md` Risks & Mitigations flagged a change to a
  step definition or Page Object other already-`passed` scenarios depend
  on.

## Steps / Checklist

1. Identify which other `scope.scenarios` entries have `status: "passed"`
   and share the touched step definition/Page Object (cross-reference
   their `plan.md` Step & Page Object Design sections).
2. Run those scenarios alongside the new one, by tag or by name
   (`bddgen` + `playwright test --grep "..."`).
3. If an affected scenario now fails, do not fix it yourself — write it up
   in `defects.md` for **that** scenario's slug too, triaged per
   [`defect-triage.skill.md`](defect-triage.skill.md), and flag it clearly
   as a regression caused by this migration's shared-code change.
4. If `testing.runFullRegressionOnEachMigration` is `true`, run the entire
   generated suite instead of just the identified subset, on a cadence the
   team is willing to wait for (this is opt-in in config precisely because
   it doesn't scale forever — reconsider turning it off if the suite gets
   large and CI time matters more than exhaustive per-migration safety).

## Output / Contract

`test-report.md` notes which regression scope was checked (targeted
subset vs. full suite) and the result. Any regression found gets its own
`defects.md` entry under the affected slug, not buried inside the new
slug's report.

## Related skills

- [`step-definition-consolidation.skill.md`](step-definition-consolidation.skill.md)
- [`page-object-consolidation.skill.md`](page-object-consolidation.skill.md)
- [`defect-triage.skill.md`](defect-triage.skill.md)
