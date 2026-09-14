---
name: 'risk-assessment'
usedBy: ['architect']
trigger: 'always'
---
# Skill: Risk Assessment

## Purpose

Playwright's stricter auto-waiting and web-first assertions frequently
surface real bugs a loose Selenium wait was silently tolerating, and
`playwright-bdd`'s default-parallel execution model surfaces shared-state
assumptions Cucumber-JVM's typically-sequential runs never exposed. Called
out up front in `plan.md`, this saves the Engineer and Validator from
mistaking a newly-surfaced real issue for a migration mistake.

## When to use

Always, while writing `plan.md`'s Risks & Mitigations section.

## Steps / Checklist

1. For every wait/sleep replaced per
   `docs/selenium-to-playwright-mapping.md`, ask: could Playwright's
   stricter actionability checks now fail where Selenium's looser wait
   passed? If plausible, note it with an expected symptom.
2. Flag any element identified only by XPath/CSS (no accessible role/
   label/testid) as a maintenance risk, even if the locator itself is
   unavoidable for now.
3. Flag any test-order/shared-state coupling carried over from
   `requirements.md`'s Non-Functional Requirements — state explicitly
   whether the plan preserves it (and how, e.g. disabling
   `fullyParallel` for this spec) or breaks it (and why that's safe).
4. Flag `Scenario Outline` rows or a `Background` that assumed sequential
   execution — see
   [`tag-and-outline-handling.skill.md`](tag-and-outline-handling.skill.md)
   for the specific handling.
5. Flag any reused step definition/Page Object change that could affect
   other already-migrated scenarios (hands off to
   [`regression-safety-net.skill.md`](regression-safety-net.skill.md) for
   the Validator to act on).
6. Flag any step-wording consolidation decision from
   [`step-definition-consolidation.skill.md`](step-definition-consolidation.skill.md)
   that changed a scenario's original Gherkin phrasing — call out that the
   Analyst approved the equivalence, so it isn't mistaken for scope creep.
7. Don't pad this section with generic disclaimers — every entry should be
   specific enough that the Validator knows exactly what to look for.

## Output / Contract

`plan.md`'s Risks & Mitigations section: concrete, falsifiable
predictions, not boilerplate caution.

## Related skills

- [`page-object-consolidation.skill.md`](page-object-consolidation.skill.md)
- [`design-patterns-and-solid.skill.md`](design-patterns-and-solid.skill.md)
- [`tag-and-outline-handling.skill.md`](tag-and-outline-handling.skill.md)
- [`regression-safety-net.skill.md`](regression-safety-net.skill.md)
