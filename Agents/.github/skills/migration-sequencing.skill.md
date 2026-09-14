---
name: 'migration-sequencing'
usedBy: ['architect']
trigger: 'on-demand: scope.scenarios has more than one pending/planned entry'
---
# Skill: Migration Sequencing

## Purpose

When several scenarios are in scope at once, planning them in a sensible
order avoids reimplementing the same step definitions and page objects
several times over.

## When to use

Before writing `plan.md` for a scenario, if `scope.scenarios` has other
entries with status `pending` or `planned` that share step definitions,
page objects, a `Background`, or hooks/World state with the one you're
planning now.

## Steps / Checklist

1. Group in-scope pending scenarios by shared step-definition/page-object
   dependency (using `<docsPath>/project-structure.md` and each
   scenario's `requirements.md` Source section).
2. Recommend planning (and implementing) the scenario that establishes the
   most shared infrastructure first, so later plans in the same group can
   say "reuse X" instead of "create X" — apply
   [`step-definition-consolidation.skill.md`](step-definition-consolidation.skill.md)
   and [`page-object-consolidation.skill.md`](page-object-consolidation.skill.md)
   consistently across the group.
3. Never plan or implement anything for a scenario outside
   `scope.scenarios` just because it would "complete" a group — sequencing
   only reorders work that's already in scope (see
   [`scope-guard.skill.md`](scope-guard.skill.md)).
4. Record the recommended order and rationale at the top of each affected
   `plan.md` ("Planned after `<other-slug>` because both reuse the `Given
   I am logged in as {string}` step and `LoginPage`") so the Engineer
   understands why files it touches may already exist.

## Output / Contract

A stated migration order across the pending group, and cross-references
between their `plan.md` files where infrastructure is shared.

## Related skills

- [`step-definition-consolidation.skill.md`](step-definition-consolidation.skill.md)
- [`page-object-consolidation.skill.md`](page-object-consolidation.skill.md)
- [`scope-guard.skill.md`](scope-guard.skill.md)
