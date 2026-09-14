---
name: 'playwright-bdd-implementation-patterns'
usedBy: ['engineer']
trigger: 'always'
---
# Skill: Playwright-BDD Implementation Patterns

## Purpose

Keeps generated `.feature` files, step definitions, and page objects
idiomatic and consistent across every migrated scenario, instead of each
implementation session reinventing style choices.

## When to use

While implementing any part of `plan.md`.

## Steps / Checklist

1. **`.feature` files** (`conventions.featuresDir`): Gherkin syntax is
   unchanged from the Java project — copy the scenario's `Scenario`/
   `Scenario Outline`/`Examples`/`Background`/tags verbatim from
   `requirements.md`. Don't paraphrase wording that wasn't explicitly
   approved via `step-definition-consolidation`.
2. **Step definitions** (`conventions.stepsDir`): use `createBdd()` from
   `playwright-bdd` per file:
   ```ts
   import { createBdd } from 'playwright-bdd';
   const { Given, When, Then } = createBdd();

   Given('I log in as {string}', async ({ page }, username: string) => {
     await new LoginPage(page).loginAs(username);
   });
   ```
   Prefer `conventions.stepDefinitionStyle` (`cucumber-expressions` by
   default: `{string}`, `{int}`, `{word}`) — these map almost directly
   from the equivalent Cucumber-JVM annotation.
3. **Keep steps thin.** A step definition orchestrates; it does not
   contain locators or multi-step UI logic directly — that belongs on a
   Page Object, called from the step. This mirrors good Cucumber-JVM
   practice, keeps steps reusable across scenarios, and is the Single
   Responsibility / Dependency Inversion split
   [`design-patterns-and-solid.skill.md`](design-patterns-and-solid.skill.md)
   requires: the step depends on the Page Object's abstraction, not on how
   it's implemented.
4. **World-equivalent shared state**: Cucumber-JVM's DI-injected World
   becomes Playwright's own fixture system. Any state a scenario's steps
   need to share (beyond `page` itself) is a custom fixture under
   `conventions.supportDir`, merged into `createBdd()`'s fixture type —
   never a module-level mutable variable (that leaks across parallel
   workers and scenarios, a common and hard-to-diagnose bug class in
   hand-rolled Cucumber-JS ports). Keep each fixture cohesive (Interface
   Segregation) rather than one bag of unrelated state.
5. **Hooks**: `Before`/`After` from `playwright-bdd`, tag-scoped exactly
   like their Java source (`Before('@needsAuth', async ({page}) => {...})`).
   Put them in `conventions.supportDir`, not scattered across step files.
6. **Locators**: follow `conventions.locatorPreference` in order on the
   Page Object; never inline a locator inside a step definition.
7. **No `page.waitForTimeout()`** unless `conventions.hardSleepPolicy` is
   `"allowed-with-justification"` **and** the justification is logged in
   `dev-log.md`. Treat the temptation to add one as a sign the real wait
   condition wasn't identified — escalate per
   [`blocked-escalation.skill.md`](blocked-escalation.skill.md) instead of
   silently adding it.
8. **Assertions** are `expect()` from `@playwright/test`, web-first — never
   manual polling loops.
9. **Strict TypeScript**: no `any` without a comment explaining why it's
   unavoidable, no unused imports/locals.

## Output / Contract

A `.feature` file, step definitions, and page objects under
`<targetProjectPath>` that a reviewer familiar with these patterns can
read without extra explanation, plus a `dev-log.md` entry for every
judgment call (see
[`code-quality-checklist.skill.md`](code-quality-checklist.skill.md) for
the pre-handoff self-review).

## Related skills

- [`step-definition-consolidation.skill.md`](step-definition-consolidation.skill.md)
- [`design-patterns-and-solid.skill.md`](design-patterns-and-solid.skill.md)
- [`code-quality-checklist.skill.md`](code-quality-checklist.skill.md)
- [`blocked-escalation.skill.md`](blocked-escalation.skill.md)
