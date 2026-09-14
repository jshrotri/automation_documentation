---
name: 'gherkin-scenario-analysis'
usedBy: ['analyst']
trigger: 'always'
---
# Skill: Gherkin Scenario Analysis

## Purpose

In Cucumber, a scenario's real behavior lives in three places at once: the
`.feature` file's Gherkin text, the Java step definition matched to each
step by text/expression (not by import — glue is discovered on the
classpath), and any hooks/World state that run around it. Missing any one
of these produces a `requirements.md` that looks complete but silently
drops behavior.

## When to use

Every time a new scenario is handed to the Analyst, before writing
anything to `requirements.md`.

## Steps / Checklist

1. **Read the `.feature` file's `Background`** (if any) — it runs before
   every scenario in the file, so it's part of this scenario's real setup
   even though it isn't written inside the `Scenario:` block.
2. **Resolve every step against its step definition.** Search
   `seleniumSource.stepDefsDir` for the Java method whose
   `@Given`/`@When`/`@Then` Cucumber Expression or regex matches the
   step's exact text — don't assume the "obviously named" step file has
   it; step reuse means the match can live in a completely different
   feature area's step class (e.g. a login step reused from
   `CommonSteps.java`). Record the actual class + method for each step in
   `requirements.md`'s Source section.
3. **Follow parameter capture.** A step like
   `@Given("I log in as {string}")` binds the Gherkin value into the Java
   method parameter — note the parameter's type and any validation/
   transformation it does before use.
4. **Resolve Page Object calls one level deep** from inside each step
   definition, same as you would for a plain Selenium test — note which
   fields, waits, and validations the step actually triggers.
5. **Find the World/shared-context setup**: Cucumber-JVM typically injects
   a shared object (via PicoContainer, Spring, or Guice) across step
   definition classes for the duration of one scenario. Identify what
   state it carries (a `driver`, a created-user id, an auth token) and
   whether the scenario depends on state a *hook* — not a step — put there.
6. **Trace `@Before`/`@After` hooks** that apply to this scenario,
   including tag-scoped ones (`@Before("@needsAuth")`) — check the
   scenario's own tags against every hook's tag expression.
7. **Handle `Scenario Outline` + `Examples`**: record every row's values
   verbatim in `requirements.md` — each row becomes its own migrated test
   case under `playwright-bdd`, so an incomplete Examples table silently
   under-migrates coverage.
8. **Record tags** on the scenario and feature (`@smoke`, `@regression`,
   custom ones) — their *meaning* (what CI job runs them, what they imply
   about environment/data) may not be recoverable from code alone; that's
   a candidate for [`ambiguity-detection.skill.md`](ambiguity-detection.skill.md)
   if genuinely undocumented.
9. **Check for cross-scenario coupling**: static/shared state outside the
   World, or a scenario that only passes given a specific execution order.
   Flag explicitly — this is a red flag Playwright's default parallel
   execution will expose immediately if not accounted for in the plan.

## Output / Contract

Feeds `requirements.md`'s Source (feature file + step definition
mapping), Functional Requirements, and Non-Functional Requirements
sections. Every claim should be traceable to a specific `.feature` line or
Java method you actually read — not inferred from a step's wording alone.

## Related skills

- [`ambiguity-detection.skill.md`](ambiguity-detection.skill.md) — what to do when step 6/8/9 above hit a genuine dead end.
- [`codebase-structure-mapping.skill.md`](codebase-structure-mapping.skill.md) — if the step-definition packages/World/hooks aren't already documented, this produces that documentation so future analyses are faster.
- [`step-definition-consolidation.skill.md`](step-definition-consolidation.skill.md) — the Architect's use of the step-definition mapping you record here.
