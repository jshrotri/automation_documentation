# Requirements — `<slug>`

_Written by: Analyst_

## Source

- Feature file: `<path under seleniumSource.featuresDir>`
- Scenario: `<exact Scenario/Scenario Outline name, or "*" for the whole file>`
- Tags: `<@smoke, @regression, ...>`
- Step definitions resolved (Java class + method, one row per Gherkin step):

  | Gherkin step | Java step definition |
  |---|---|
  | `Given ...` | `com.example.steps.XyzSteps#methodName` |

- `Background` steps (if any) this scenario inherits from the feature file:
- Hooks that apply (name, tag scope):

## Scope

What this scenario actually verifies, in plain language.

## Functional Requirements

- Step-by-step: `Background` → scenario steps → assertions, extracted from
  the Gherkin text and the step definitions it resolves to.

## Scenario Outline / Examples

_(delete this section if not applicable)_

| Example row | Values |
|---|---|
| 1 | |

## Non-Functional Requirements / Constraints

- Browser/environment matrix:
- Test data source and shape:
- Timing/retry/flake tolerances:
- Ordering/shared-state dependencies on other scenarios (should be none —
  flag if found, especially anything Playwright's parallel-by-default
  execution would break):
- Tag semantics (what CI job/environment each tag implies, if not obvious):

## Open Questions & Answers

| # | Question | Answer |
|---|---|---|
| 1 | | |

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Out of Scope

Anything explicitly not carried over in this migration pass, and why —
including other scenarios in the same feature file that are *not*
included here.
