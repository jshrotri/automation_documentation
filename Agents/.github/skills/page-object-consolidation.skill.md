---
name: 'page-object-consolidation'
usedBy: ['architect']
trigger: 'always'
---
# Skill: Page Object Consolidation

## Purpose

Without an explicit reuse check, every migrated scenario tends to grow its
own slightly-different `LoginPage`. This skill makes "check for an existing
page object before designing a new one" a deliberate step instead of
something that only happens if the Architect happens to remember — the
layer directly underneath [`step-definition-consolidation.skill.md`](step-definition-consolidation.skill.md).

## When to use

Every time the Architect designs `plan.md`'s Step & Page Object Design
section, for whichever pages/components the scenario's steps touch.

## Steps / Checklist

1. Check `docs/component-registry.md` (`project-memory`) first for
   existing Page Object classes — if `targetProjectPath` was an existing
   Playwright project, this registry was seeded with its pre-existing
   Page Objects by `target-project-discovery.skill.md`, so this check
   covers those too. Fall back to listing files under
   `<targetProjectPath>/<conventions.pageObjectDir>/` directly only if the
   registry looks incomplete or stale.
2. For each page/component a step in this scenario touches, check whether
   an existing class already models it.
   - **Exact match** (same page, same elements needed) → reuse as-is, plan
     references it, no new file.
   - **Partial match** (same page, missing a locator/method) → plan
     extends the existing class with the additional method(s)/locator(s);
     do not fork a parallel class for the same page.
   - **No match** → plan a new class, named and placed consistently with
     the existing ones (check `<docsPath>/project-structure.md` — or the
     original Java Page Object layer — for the naming convention already
     in use).
3. If reuse requires a change that could affect other already-migrated
   scenarios using that page object, call this out explicitly in
   `plan.md`'s Risks & Mitigations, and note which other specs should be
   re-run by the Validator as a result (feeds
   [`regression-safety-net.skill.md`](regression-safety-net.skill.md)).

## Output / Contract

`plan.md`'s Step & Page Object Design section states, for each page
object touched, whether it's new/extended/reused-unchanged — the Engineer
should never have to make that call itself mid-implementation.

## Related skills

- [`step-definition-consolidation.skill.md`](step-definition-consolidation.skill.md)
- [`design-patterns-and-solid.skill.md`](design-patterns-and-solid.skill.md) — reuse is also where Single Responsibility gets violated first (a "partial match" stretched into a page object covering two pages is a God Object in the making); apply that skill's reasoning when a reuse decision isn't clean.
- [`project-memory.skill.md`](project-memory.skill.md) — the registry this skill checks first, and that the Engineer updates the moment a genuinely new page object is added.
- [`codebase-structure-mapping.skill.md`](codebase-structure-mapping.skill.md)
- [`migration-sequencing.skill.md`](migration-sequencing.skill.md)
