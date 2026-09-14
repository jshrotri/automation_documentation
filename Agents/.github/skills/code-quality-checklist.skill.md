---
name: 'code-quality-checklist'
usedBy: ['engineer']
trigger: 'before every handoff to Validator'
---
# Skill: Code Quality Checklist

## Purpose

A fixed self-review gate so "implementation complete" means the same thing
every time, regardless of how the implementation session went.

## When to use

Immediately before telling the user to switch to Validator mode.

## Steps / Checklist

- [ ] `npx tsc --noEmit` in `<targetProjectPath>` passes with zero errors.
- [ ] `npm run lint` passes with zero errors — `eslint-plugin-playwright`'s
      recommended rules are the mechanical gate for
      [`playwright-best-practices.skill.md`](playwright-best-practices.skill.md)'s
      Anti-patterns table (no `.only`/`.skip`, no `waitForTimeout`, etc.).
      This is a real gate, not conditional on whether lint "happens to be"
      configured — the bootstrap scaffold always configures it.
- [ ] No `page.pause()` left in committed code.
- [ ] If the scenario needs an authenticated session, it uses the
      storage-state reuse pattern (`setup/auth.setup.ts` +
      `dependencies: ['setup']`), not a UI login repeated in a step.
- [ ] `bddgen` runs clean — **no ambiguous/duplicate step warnings**. This
      is the mechanical proof that
      [`step-definition-consolidation.skill.md`](step-definition-consolidation.skill.md)
      was actually applied, not just intended. (N/A under
      [`plain-playwright-fallback.skill.md`](plain-playwright-fallback.skill.md)
      — no generation step in that mode.)
- [ ] Smoke run of the new scenario (by name or tag,
      `--project=chromium`) passes at least once.
- [ ] Every acceptance criterion listed in `requirements.md` is exercised by
      an assertion in the scenario's step chain — go down the list item by
      item, don't eyeball it.
- [ ] Every `Examples` row (if a `Scenario Outline`) is present in the
      `.feature` file exactly as `requirements.md` recorded it.
- [ ] No `page.waitForTimeout()` without a logged justification (see
      [`playwright-bdd-implementation-patterns.skill.md`](playwright-bdd-implementation-patterns.skill.md)).
- [ ] No locator inlined in a step definition that should live on a Page
      Object.
- [ ] No module-level mutable state used as a World substitute — shared
      state goes through a fixture.
- [ ] Every row in `plan.md`'s Design Rationale is reflected in
      `dev-log.md`'s Design Pattern Adherence table — matched or explained
      (see
      [`design-patterns-and-solid.skill.md`](design-patterns-and-solid.skill.md)).
- [ ] SOLID spot-check: no page object modeling more than one page/
      component (SRP); no step/fixture reaching past its own Page Object
      abstraction into raw locators or app internals (Dependency
      Inversion); no fixture bundling unrelated capabilities a step didn't
      ask for (Interface Segregation).
- [ ] `dev-log.md` lists every file changed and every judgment call made.
- [ ] Every genuinely new step/page-object/fixture/hook created this
      session has a row in `docs/component-registry.md` (see
      [`project-memory.skill.md`](project-memory.skill.md)) — not deferred,
      not forgotten.
- [ ] If this session bootstrapped `targetProjectPath` from scratch (see
      [`target-project-bootstrap.skill.md`](target-project-bootstrap.skill.md)),
      confirm `npm install` and `npx playwright install` both completed
      without errors.
- [ ] If `targetProjectPath` was an **existing** project, confirm the
      Architect's `target-project-discovery` pass actually happened
      (`docs/target-project-structure.md` exists) before this
      implementation started — implementing against an unread existing
      project is the one thing this checklist can't fix after the fact.
- [ ] `.github/migration.config.json`'s entry for this slug has
      `status: "implemented"`.
- [ ] Nothing was written for any slug not in `scope.scenarios` (spot-check
      the changed-files list against the scope entry you were given).

## Output / Contract

A go/no-go before handoff — if any box can't be checked honestly, keep
working (or escalate per
[`blocked-escalation.skill.md`](blocked-escalation.skill.md)) rather than
handing an incomplete implementation to the Validator.

## Related skills

- [`playwright-bdd-implementation-patterns.skill.md`](playwright-bdd-implementation-patterns.skill.md)
- [`playwright-best-practices.skill.md`](playwright-best-practices.skill.md)
- [`design-patterns-and-solid.skill.md`](design-patterns-and-solid.skill.md)
- [`project-memory.skill.md`](project-memory.skill.md)
- [`target-project-bootstrap.skill.md`](target-project-bootstrap.skill.md)
- [`target-project-discovery.skill.md`](target-project-discovery.skill.md)
- [`plain-playwright-fallback.skill.md`](plain-playwright-fallback.skill.md)
- [`scope-guard.skill.md`](scope-guard.skill.md)
