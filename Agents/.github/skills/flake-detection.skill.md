---
name: 'flake-detection'
usedBy: ['validator']
trigger: 'always'
---
# Skill: Flake Detection

## Purpose

A migrated scenario that "passes" once but fails intermittently is worse
than one that fails consistently — it erodes trust in the whole suite.
This skill makes stability an explicit, measured gate rather than a
one-off run.

## When to use

Every validation pass, before signing off `test-report.md`.

## Steps / Checklist

1. Run `bddgen` (skip if `framework.style` is `"plain-playwright"` — see
   `plain-playwright-fallback.skill.md`) then the scenario (by name or tag)
   `testing.flakeCheckRepeats` times (config default: 3), using
   `--repeat-each=<n>` (or equivalent), across every browser in
   `testing.browsers`.
2. If the scenario is a `Scenario Outline`, repeat **each generated row**
   this many times, not just one row as a proxy for all of them — per
   [`tag-and-outline-handling.skill.md`](tag-and-outline-handling.skill.md),
   each row is its own independent Playwright test.
3. All runs must pass identically. A single failure among the repeats
   means **fail the sign-off**, even if the majority passed — record it as
   "flaky", not "passing with one anomaly".
4. For a flaky result, capture the trace/screenshot from the failing run
   and look for a timing pattern (only fails cold-cache, only on
   `webkit`, only when run in parallel with a sibling `Examples` row) —
   put that observation in `defects.md`.
5. Distinguish flake caused by the migrated code (race condition, missing
   wait, a shared-fixture leaking state between parallel rows) from flake
   caused by the environment/app under test itself. Both get reported,
   but only the former routes back to Engineer — the latter routes to
   Architect to decide whether `requirements.md` needs a tolerance noted,
   or whether this spec needs `fullyParallel` disabled.

## Output / Contract

`test-report.md`'s Flake Check section with actual repeat counts and
per-browser (and per-Examples-row, if applicable) results — never "looks
stable" without numbers behind it.

## Related skills

- [`defect-triage.skill.md`](defect-triage.skill.md)
- [`tag-and-outline-handling.skill.md`](tag-and-outline-handling.skill.md)
