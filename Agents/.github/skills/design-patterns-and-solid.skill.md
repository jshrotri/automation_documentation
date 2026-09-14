---
name: 'design-patterns-and-solid'
usedBy: ['architect', 'engineer']
trigger: 'always'
---
# Skill: Design Patterns & SOLID

## Purpose

A Page Object Model migration is easy to get structurally wrong in ways
that only surface after a dozen scenarios are built on top of it — a page
object that grows into a God Object, a fixture that becomes an
everything-bag, a locator strategy copy-pasted instead of abstracted. This
skill makes structural design a **deliberate, justified decision** rather
than something that emerges by accident from whatever the first scenario
happened to need.

**The requirement isn't "use design patterns."** It's: for every
non-trivial structural choice, state the problem, the pattern applied (if
any — plenty of code should just be simple, direct code), why it beats the
alternatives you considered, and which SOLID principle it serves. A
pattern applied without being able to answer "why this, why not simpler"
is a smell, not a strength — see **Anti-patterns and overuse** below.

## When to use

**Architect**: while designing `plan.md`'s Step & Page Object Design and
Design Rationale sections, for every new class/fixture/abstraction the
plan introduces (not for a trivial one-locator, one-method page object —
that doesn't need a rationale, it needs to just be written).

**Engineer**: while implementing, to verify the code actually embodies the
pattern and SOLID principle the plan claims, and to flag it (via
`blocked-escalation`) rather than silently improvise if a documented
design turns out not to fit the real DOM/app structure.

## SOLID, applied to this codebase specifically

- **Single Responsibility** — one Page Object models one page or one
  reusable component (a shared header/nav becomes its own component
  class, composed into pages, not copy-pasted into each). One step
  definition orchestrates one behavior by calling into page objects; it
  doesn't itself contain multi-step UI logic. One fixture provides one
  cohesive piece of shared state/capability. A class doing more than one
  of these things is a design smell — split it.
- **Open/Closed** — a page object should be extensible (new locators, new
  methods, composed-in components) without editing the internals of
  methods other already-migrated scenarios depend on. Adding scenario N's
  need shouldn't risk scenario 1 through N-1.
- **Liskov Substitution** — if page objects share a base class (e.g., a
  `Modal` base extended by `ConfirmModal`/`ErrorModal`), every subclass
  must honor the base's contract (same method meaning, no narrower
  preconditions or surprising side effects) so code written against the
  base type works with any subclass unmodified.
- **Interface Segregation** — fixtures and page objects should expose only
  what callers actually need. Don't merge unrelated capabilities into one
  monolithic fixture (`allFixtures` with 20 unrelated properties) just
  because it's convenient to define once — split by cohesion
  (`authFixtures`, `seedDataFixtures`) so a step depending on one doesn't
  carry the others.
- **Dependency Inversion** — step definitions depend on Page Object
  abstractions injected via Playwright's fixture system, never on raw
  locator chains or app internals constructed inline. High-level
  orchestration (the step) shouldn't know how the low-level interaction
  (the page object) is implemented, only what it does.

## Pattern catalog for this domain

Apply a pattern **because it solves a stated problem**, not because it's
available. For each one used, `plan.md` states the trigger condition below
was actually met.

| Pattern | Use when | Why (the reasoning to record) |
|---|---|---|
| **Page Object (Facade)** | Always, for any page/component the scenario touches. | Hides locator/wait/action detail behind an intention-revealing API — the baseline SRP + encapsulation move for this whole architecture. |
| **Component objects (Composite)** | A UI fragment (header, nav, a shared modal) appears on multiple pages. | Composing a `HeaderComponent` into every page that has one avoids duplicating its locators/methods per page (DRY) and keeps each page object's responsibility to just its own content. |
| **Fixture-based Dependency Injection** | Any shared state/capability a step needs beyond `page` itself (auth session, seeded data). | Playwright's fixture system is a structural replacement for the Cucumber World's DI container — steps receive what they need already constructed, rather than reaching for globals or constructing dependencies inline (Dependency Inversion). |
| **Factory function/class** | Constructing a page object or test-data object requires non-trivial setup (environment-conditional config, composed sub-objects) beyond a plain constructor call. | Centralizes the "how to build one of these correctly" decision in one place instead of repeating setup logic at every call site. Skip this for a page object that's just `new LoginPage(page)` — that's already simple enough. |
| **Builder** | Test data has many optional fields or must be constructed via a readable step-by-step API (mirrors a Java test-data Builder the source project likely already has). | Readable, incremental construction beats a constructor with ten positional/optional parameters; also makes `Examples`-table-driven data easier to assemble consistently. |
| **Strategy** | Genuinely interchangeable behavior exists (e.g., seed test data via UI vs. via API for speed; locator strategy fallback order). | Makes the interchangeable behavior swappable without an `if/else` scattered across call sites; only worth it when there's a real second implementation, not a speculative one. |
| **Adapter** | A step/fixture needs to call an external system (a REST API for test-data seeding, a third-party SDK). | Keeps step definitions depending on a stable, project-owned interface instead of a third-party shape that can change under you — Dependency Inversion applied at the system boundary. |

## Anti-patterns and overuse — actively avoid

- **Singleton driver/session** — a common Selenium-Java carry-over. Do
  **not** port it. Playwright's per-test fixture isolation already solves
  the problem Singleton was working around, and a Singleton actively
  breaks Playwright's parallel-by-default execution (shared mutable state
  across workers). If you see this in the Java source, it's a mapping to
  "just use fixtures," not something to reproduce.
- **God Page Object** — a page object modeling several pages "for
  convenience." Split it; this is exactly what
  [`page-object-consolidation.skill.md`](page-object-consolidation.skill.md)'s
  reuse check should have caught by comparing against a real single-page
  scope.
- **Deep inheritance chains** — prefer composition (component objects)
  over a `LoginPage extends AuthPage extends BasePage extends ...` chain
  more than one or two levels deep. Composition is easier to reason about
  and avoids Liskov violations from an ill-fitting base contract.
- **Pattern for pattern's sake** — if you can't state the specific problem
  a Factory/Strategy/Builder solves here, don't add it. A plain function
  or a direct constructor call is not a design failure; unnecessary
  indirection is. This is as much a part of "best design" as applying a
  pattern correctly is.

## Output / Contract

`plan.md`'s **Design Rationale** section, one entry per non-trivial
structural choice:

```
Pattern: <name, or "none — plain class/function">
Problem: <what would go wrong without it>
Alternatives considered: <at least one, and why it was rejected>
SOLID principle(s) served: <S/O/L/I/D>
Trade-off: <what this costs — complexity, indirection, extra files>
```

`dev-log.md`'s **Design Pattern Adherence** section confirms the
implementation actually matches this rationale, or explains (and escalates
per [`blocked-escalation.skill.md`](blocked-escalation.skill.md)) if the
real code didn't fit the planned structure.

## Related skills

- [`page-object-consolidation.skill.md`](page-object-consolidation.skill.md)
- [`step-definition-consolidation.skill.md`](step-definition-consolidation.skill.md)
- [`risk-assessment.skill.md`](risk-assessment.skill.md)
- [`playwright-bdd-implementation-patterns.skill.md`](playwright-bdd-implementation-patterns.skill.md)
