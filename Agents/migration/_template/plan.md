# Implementation Plan — `<slug>`

_Written by: Architect. Source: `requirements.md`._

## Target Files

- `.feature`: `playwright-migrated/features/<...>.feature`
- Step definitions — new vs. reused, one row per Gherkin step:

  | Gherkin step | New / Reused / Extended | File |
  |---|---|---|
  | `Given ...` | | `playwright-migrated/steps/<...>.ts` |

- Page objects — new vs. reused (see `page-object-consolidation` skill):
- Fixtures/hooks touched: `playwright-migrated/steps/support/{fixtures,hooks}.ts`
- Test data: `playwright-migrated/utils/<...>.ts`

## Step & Page Object Design

- What's reused from the existing target project vs. newly created, and
  why (per `step-definition-consolidation` and `page-object-consolidation`).
- Any step-wording consolidation decision (near-duplicate Gherkin text
  treated as equivalent) — note that it was Analyst-approved.

## Design Rationale

_(see `design-patterns-and-solid` skill — one entry per non-trivial
structural choice; skip trivial one-off page objects/steps that don't need
a rationale)_

| # | Pattern (or "none — plain code") | Problem it solves | Alternative(s) considered | SOLID principle(s) served | Trade-off |
|---|---|---|---|---|---|
| 1 | | | | | |

## Tag & Outline Handling

_(delete if not applicable — see `tag-and-outline-handling` skill)_

- Tags carried over:
- `Examples` table carried over verbatim: yes/no
- `fullyParallel` needs disabling for this spec: yes/no, why

## Test Data Strategy

## Migration Steps

1.
2.

## Risks & Mitigations

- Behavior Playwright's stricter waiting/assertions or parallel-by-default
  execution might newly surface, and how the Engineer/Validator should
  treat it.

## Open Questions for Engineer

_(left empty — filled by Engineer via `questions-for-planner.md` if they
get blocked, then answered here)_
