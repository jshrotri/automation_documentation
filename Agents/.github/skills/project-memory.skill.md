---
name: 'project-memory'
usedBy: ['architect', 'engineer', 'validator']
trigger: 'always'
---
# Skill: Project Memory

## Purpose

Each `migration/<slug>/` folder is complete history for *one* scenario,
but nothing so far gave an agent a fast way to answer "what already exists
in the target project" or "what's happened across this migration so far"
without either re-scanning the whole `targetProjectPath` tree or reading
every past `dev-log.md` one by one. That's wasted work in every session,
and it gets worse the more scenarios are migrated — exactly backwards from
what [`step-definition-consolidation.skill.md`](step-definition-consolidation.skill.md)
and [`page-object-consolidation.skill.md`](page-object-consolidation.skill.md)
are trying to achieve. This skill is the fix: two small, cheap-to-read
files that carry memory forward across chat sessions.

- **`memory.componentRegistryPath`** (default `docs/component-registry.md`)
  — a living index of *what exists*: every step definition, page object,
  fixture, and hook, kept current in real time. Answers "is there already
  something I can reuse?" in one file read.
- **`memory.changelogPath`** (default `migration/CHANGELOG.md`) — an
  append-only chronological log of *what happened and why*: one entry per
  scenario, written the moment it's validated. Answers "what's the history
  here?" without opening N folders.

## When to use

**Architect** (always): read the component registry before
`step-definition-consolidation`/`page-object-consolidation` do their
file-tree scan — treat the registry as the fast path and the tree scan as
the fallback/verification if the registry looks incomplete or stale.

**Engineer** (always): the moment you create a new step definition, page
object, fixture, or hook — not deferred to end-of-session — add its row to
the component registry. If you *reuse* an existing one, no registry change
is needed (nothing new exists), just note the reuse in `dev-log.md` as
usual. If you discover the registry disagrees with what's actually on
disk, fix the entry now, as part of this session's work.

**Validator** (on sign-off only): the moment a scenario's `test-report.md`
is signed off `passed`, append one entry to the changelog using the format
documented at the top of that file. This is a deliberate single-writer
rule — only a validated, passing change becomes part of the permanent
record; work still in flight doesn't clutter the changelog with entries
that might get reworked.

## Steps / Checklist

1. Resolve `memory.componentRegistryPath` and `memory.changelogPath` from
   config (`config-loader`) — don't assume the default paths if the config
   overrides them.
2. **Architect**: read the registry first. If a step/page-object you need
   isn't listed, fall back to scanning `<conventions.stepsDir>`/
   `<conventions.pageObjectDir>` directly (the registry can lag by one
   in-flight session) before concluding nothing exists.
3. **Engineer**: after implementing, for every genuinely new component
   (not a reuse), add exactly one row with: the Gherkin step text or class
   name, its file path, a one-line description of what it does, and the
   slug that introduced it.
4. **Validator**: after sign-off, append one changelog entry per the
   template — don't batch multiple scenarios into one entry, and don't
   edit any entry already written.
5. Both memory files are **plain, append/update-in-place markdown** — no
   agent should reformat or reorganize them beyond adding rows/entries; if
   a file genuinely needs restructuring (it's grown unwieldy), that's a
   deliberate decision to flag to the user, not something to do silently
   mid-scenario.

## Output / Contract

- `docs/component-registry.md`: always reflects the current state of
  `targetProjectPath`'s reusable building blocks — updated in the same
  session the component is created, never as a deferred cleanup.
- `migration/CHANGELOG.md`: append-only, one entry per scenario, written
  only by the Validator on a `passed` sign-off.

## Related skills

- [`step-definition-consolidation.skill.md`](step-definition-consolidation.skill.md)
- [`page-object-consolidation.skill.md`](page-object-consolidation.skill.md)
- [`artifact-contract.skill.md`](artifact-contract.skill.md) — the per-scenario equivalent this skill complements, not replaces.
