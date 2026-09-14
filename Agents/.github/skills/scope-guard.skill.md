---
name: 'scope-guard'
usedBy: ['analyst', 'architect', 'engineer', 'validator']
trigger: 'always — before starting work on any specific scenario'
---
# Skill: Scope Guard

## Purpose

This is the hard boundary that keeps the system from "helpfully" migrating
scenarios nobody asked for. A Cucumber project makes this especially easy
to get wrong: a single `.feature` file typically holds many scenarios, and
a single step definition file backs scenarios across many feature files —
so agents will constantly be reading things adjacent to, but out of, scope.
This skill is what stops that visibility from turning into unrequested
work.

**Reading is unrestricted. Writing migration output is not.** Any agent may
read as much of the Selenium/Cucumber project as it needs — other
scenarios in the same feature file, other feature files using the same
step definitions, shared hooks/World setup — to understand context (see
[`codebase-structure-mapping.skill.md`](codebase-structure-mapping.skill.md)).
No agent may produce `requirements.md`, `plan.md`, a `.feature` file, step
definitions/page objects, or a `test-report.md` for a scenario that isn't
on the allow-list.

## When to use

Before `analyst` starts analyzing a given scenario, before `architect`
starts planning a slug, before `engineer` starts implementing a slug,
before `validator` starts running/reporting a slug. Every single time,
even the tenth time in a session — don't rely on memory of an earlier
check.

## Steps / Checklist

1. Read `scope.scenarios` from the merged config (see
   [`config-loader.skill.md`](config-loader.skill.md)). Each entry is a
   `{ slug, featureFile, scenario, status }` tuple — `scenario` is either
   an exact Scenario/Scenario Outline name or `"*"` meaning every scenario
   currently in that file.
2. **If you are the Analyst** and the user just handed you a new
   feature-file + scenario (or `"*"`) with no matching entry: this is the
   one and only case where scope may grow. Add an entry to
   `.github/migration.config.json` yourself (edit the JSON directly,
   preserve everything else in the file), then proceed. This is what
   "providing" a scenario *means* in this system — an explicit hand-off
   from the user into this file.
3. **If you are Architect, Engineer, or Validator** and asked to act on a
   slug with no matching entry in `scope.scenarios` — or a scenario you
   noticed while reading around the codebase, that the user didn't
   actually ask about — **stop, do not create or edit any artifact for
   it**, and tell the user:

   > `<feature file / scenario name>` isn't in the migration scope
   > (`.github/migration.config.json` → `scope.scenarios`). Switch to
   > **Analyst** mode and hand it that scenario explicitly if you want it
   > migrated.

4. This applies even to scenarios in the **same `.feature` file** as one
   in scope. Being asked to migrate `Scenario: Successful login` does not
   authorize migrating `Scenario: Login with invalid password` from the
   same file, even though you'll read the whole file for `Background` and
   context. It also applies to other scenarios that happen to reuse the
   exact same step definitions you're already touching — reusing what you
   learn is fine and encouraged (see
   [`step-definition-consolidation.skill.md`](step-definition-consolidation.skill.md)),
   writing their migration artifacts is not.
5. Keep each in-scope entry's `status` field current as it moves through
   the pipeline (`pending` → `requirements-complete` → `planned` →
   `implemented` → `passed`/`failed`/`blocked`) so the config file itself
   is always an accurate at-a-glance dashboard of migration progress.

## Output / Contract

- Analyst: may add exactly one new `scope.scenarios` entry per newly
  provided feature-file+scenario, with `status: "pending"`.
- All four agents: update the `status` field of the entry they're working
  on as they finish their stage.
- No agent removes another agent's entry or edits `featureFile`/`scenario`
  after creation (if it's wrong, ask the user; don't silently "fix" the
  scope record).

## Related skills

- [`config-loader.skill.md`](config-loader.skill.md)
- [`codebase-structure-mapping.skill.md`](codebase-structure-mapping.skill.md) — the sanctioned way to get broad repo context without violating scope.
- [`step-definition-consolidation.skill.md`](step-definition-consolidation.skill.md) — the sanctioned way to reuse what other (out-of-scope) scenarios already implement.
