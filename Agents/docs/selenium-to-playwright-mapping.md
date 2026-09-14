# Selenium/Java/Cucumber → Playwright/TypeScript (playwright-bdd) Mapping Reference

Reference for the **Architect** and **Engineer** agents. Extend this file
whenever a plan encounters a construct not yet listed here.

## BDD / Cucumber structure

Gherkin itself is tool-agnostic — `Feature`, `Background`, `Scenario`,
`Scenario Outline` + `Examples`, `Rule`, tags, `DocString`s, and
`DataTable`s all carry over to the migrated `.feature` file **unchanged**.
What changes is the glue underneath.

| Cucumber-JVM (Java) | playwright-bdd (TypeScript) | Notes |
|---|---|---|
| `@Given("^I log in as (.*)$")` (regex) | `Given('I log in as {string}', async ({ page }, username) => {...})` | Prefer Cucumber Expressions (`{string}`, `{int}`, `{word}`) — closer to what most Cucumber-JVM projects already use if they've moved off raw regex, more readable, less error-prone to write. Set via `conventions.stepDefinitionStyle`. |
| `@When`, `@Then` | `When(...)`, `Then(...)` from `const { Given, When, Then } = createBdd();` | One `createBdd()` call per step file is enough — it's not a per-scenario object. |
| World object (PicoContainer/Spring/Guice-injected shared state per scenario) | a custom **Playwright fixture**, merged into `createBdd()`'s fixture type, under `conventions.supportDir` | This is the most important conceptual translation in a BDD migration. Playwright's fixture system already provides per-test (per-scenario) isolated, typed, composable state — it's a direct structural replacement for Cucumber's DI-scoped World, not just an analogy. Never fall back to module-level mutable variables as a substitute; that leaks across parallel workers. |
| `@Before` / `@After` (optionally tag-scoped: `@Before("@needsAuth")`) | `Before(...)` / `After(...)` from `playwright-bdd`, same tag-expression targeting | Put these in `conventions.supportDir`, not scattered across step files. |
| Step reuse via classpath glue discovery | Step reuse via exact Cucumber Expression match across all files under `conventions.stepsDir` | See `step-definition-consolidation` skill — this is the main efficiency lever in the whole migration. |
| Tags (`@smoke`, `@regression`, custom) | Same Gherkin tag syntax; filtered via `bddgen --tags "@smoke and not @wip"` | Cucumber tag-expression syntax is preserved almost exactly. |
| `Scenario Outline` + `Examples` | Same Gherkin; `playwright-bdd`'s `bddgen` expands **each `Examples` row into its own generated Playwright test** | This is a genuine upgrade: rows run independently and in parallel by default, instead of the often-sequential execution typical of Cucumber-JVM runners. Flag in `plan.md` if the Java suite relied on rows sharing state sequentially — that assumption breaks under parallel execution unless the spec disables it. |
| `DataTable` step parameter | `DataTable` object passed to the step function (`.raw()`, `.rows()`, `.hashes()`) | Near-identical API surface to Cucumber-JVM's `DataTable`. |
| `DocString` step parameter | Passed as a plain string argument to the step function | No translation needed. |
| Cucumber HTML/JSON report (or Extent/Allure-cucumber) | Playwright's built-in HTML reporter (each Gherkin step shows as a `test.step()` in the trace/report automatically), or `playwright-bdd`'s Cucumber-format report output if stakeholders need to keep an existing "living documentation" dashboard | Note in `requirements.md` if a specific report format is a hard stakeholder requirement — it affects `playwright.config.ts`'s `reporter` array. |
| `bddgen` / running scenarios | `npx bddgen && npx playwright test` (or `--grep`/`--tags` for a single scenario) | `bddgen` compiles `.feature` + step files into real Playwright test files before every run — always run it, and always check its output for ambiguous/duplicate step warnings. |

## Locators

| Selenium Java | Playwright TS | Notes |
|---|---|---|
| `driver.findElement(By.id("x"))` | `page.locator('#x')` or `page.getByTestId('x')` | Prefer role/testid locators over raw CSS/id when the DOM supports it. |
| `By.name("x")` | `page.locator('[name="x"]')` | |
| `By.cssSelector(...)` | `page.locator(...)` | Same selector syntax works directly. |
| `By.xpath(...)` | `page.locator('xpath=...')` | Keep only if no better role/label/testid locator exists — flag in `dev-log.md`. |
| `By.linkText("Submit")` | `page.getByRole('link', { name: 'Submit' })` | |
| `@FindBy(id = "x")` (PageFactory) | class field: `readonly locator: Locator` set in constructor | No PageFactory init step needed — Playwright locators are lazy. |
| `driver.findElements(...)` (list) | `page.locator(...)` + `.nth(i)` / `.all()` / `.count()` | |

## Waiting

| Selenium Java | Playwright TS | Notes |
|---|---|---|
| `new WebDriverWait(driver, d).until(ExpectedConditions.visibilityOf(...))` | `await expect(locator).toBeVisible()` | Playwright auto-waits before actions; explicit `expect` waits are for assertions. |
| `ExpectedConditions.elementToBeClickable(...)` | just `await locator.click()` | Playwright's actionability checks (visible, stable, enabled, receives events) happen automatically before click. |
| `Thread.sleep(n)` | **remove** — replace with the specific condition being waited for (`toBeVisible`, `toHaveText`, `toHaveURL`, a `waitForResponse`, etc.) | Flag any case where the real condition isn't recoverable — that's an Analyst question, not something to paper over with `waitForTimeout`. |
| `driver.manage().timeouts().implicitlyWait(...)` | not needed | Playwright has no implicit wait config; auto-waiting replaces it. |

## Actions

| Selenium Java | Playwright TS |
|---|---|
| `element.click()` | `await locator.click()` |
| `element.sendKeys("x")` | `await locator.fill("x")` (or `.type()` only if literal keystroke timing/events matter) |
| `element.clear()` | `await locator.clear()` |
| `new Select(element).selectByVisibleText("x")` | `await locator.selectOption({ label: 'x' })` |
| `element.isDisplayed()` | `await locator.isVisible()` (prefer `expect(locator).toBeVisible()` in assertions) |
| `Actions` (hover, drag) | `await locator.hover()`, `await locator.dragTo(target)` |
| switching frames (`driver.switchTo().frame(...)`) | `page.frameLocator('iframe-selector')` |
| switching windows/tabs | `context.waitForEvent('page')` |
| alerts (`driver.switchTo().alert()`) | `page.on('dialog', dialog => ...)` registered before the triggering action |

## Assertions

| Selenium + JUnit/TestNG/Hamcrest | Playwright TS |
|---|---|
| `Assert.assertEquals(actual, expected)` | `expect(actual).toBe(expected)` |
| `Assert.assertTrue(element.isDisplayed())` | `await expect(locator).toBeVisible()` |
| `assertThat(text, containsString("x"))` | `await expect(locator).toContainText('x')` |
| manual polling loops for eventual consistency | web-first `expect(locator).toHaveText(...)` (auto-retries until timeout) |

## Driver / browser management

| Selenium Java | Playwright TS |
|---|---|
| `WebDriverManager.chromedriver().setup()` | not needed — `npx playwright install` manages browser binaries. |
| `new ChromeOptions()` / `RemoteWebDriver` (Grid) | `playwright.config.ts` `use: { ... }` and `projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]`; for remote/grid execution use Playwright's own parallel workers or a cloud provider's Playwright-compatible endpoint. |
| `driver.quit()` in hooks | not needed — Playwright's `page`/`context` fixtures are torn down automatically per scenario. |

## Authentication: the biggest speed win in this migration

Selenium suites very commonly log in through the UI in every single test
(often inside a `@Before` hook), because `WebDriver` has no clean
first-class way to persist and reuse a session across independently-run
tests. **Don't port that pattern.** Playwright has a first-class
storage-state mechanism built exactly for this: a plain (non-BDD)
`setup/auth.setup.ts` test logs in once and saves cookies/local storage to
`playwright/.auth/user.json`; every browser project that needs an
authenticated session declares `dependencies: ['setup']` and
`use: { storageState: 'playwright/.auth/user.json' }`, and every scenario
in that project starts already logged in — no repeated UI login step, no
repeated flake risk from the login flow itself.

This is scaffolded (disabled by default) at `setup/auth.setup.ts` and the
commented-out `setup` project in `playwright.config.ts`. See
[`design-patterns-and-solid.skill.md`](../.github/skills/design-patterns-and-solid.skill.md)/
[`playwright-best-practices.skill.md`](../.github/skills/playwright-best-practices.skill.md)
for the full rationale — the Architect decides per scenario whether it
needs this, during planning.

## Design patterns carried over from Java — keep, replace, or drop

Selenium/Cucumber-JVM codebases lean on a few recognizable design patterns.
Migrating them isn't automatic — some map directly, one is an
anti-pattern worth leaving behind. See
[`design-patterns-and-solid.skill.md`](../.github/skills/design-patterns-and-solid.skill.md)
for the full reasoning framework; this table is just the Java-specific
starting point.

| Java pattern | Verdict | Why |
|---|---|---|
| `PageFactory` + `@FindBy` (a Factory pattern for element initialization) | Replace | Playwright locators are lazy — there's no equivalent initialization step to factor out. The Page Object class itself (constructor-initialized `Locator` fields) already does the job; don't reintroduce a factory layer that solved a problem Playwright doesn't have. |
| Singleton `WebDriver`/session manager | **Drop — do not port** | This is the one to actively leave behind. It exists in Java to work around expensive driver setup and thread-shared browser instances; Playwright's per-test fixture isolation already solves that, and a ported Singleton actively breaks parallel-by-default execution (shared mutable state across workers). |
| Cucumber World via PicoContainer/Spring/Guice DI | Replace with Playwright fixtures | Structurally the same idea (per-scenario injected shared state) — Playwright's fixture system is the direct TypeScript equivalent, not just an analogy. |
| A Java test-data `Builder` class | Keep, port as a TS Builder or factory function | Same problem (readable, incremental construction of complex data), same solution — see the Builder entry in `design-patterns-and-solid.skill.md`'s pattern catalog. |
| Step definition classes grouped by feature area, with a shared `CommonSteps` for cross-cutting steps | Keep the same organizing principle | Mirror it in `conventions.stepsDir`'s file layout — this is exactly what `step-definition-consolidation.skill.md` expects to find already working. |

## New capabilities worth flagging (not required, but often a good call-out in `plan.md`)

- **Network interception/mocking**: `page.route(...)` — scenarios that
  worked around slow/flaky backends with waits can sometimes be made
  faster and more deterministic by mocking the relevant response instead.
  Only suggest this if `requirements.md` doesn't require true end-to-end
  network behavior.
- **Trace Viewer**: `npx playwright show-trace` gives a full DOM/network/
  console timeline per scenario run, with each Gherkin step visible as its
  own entry — mention it in `test-report.md` when reporting failures
  instead of describing steps manually.
- **API testing shortcuts**: `request` fixture for any setup/teardown the
  Java suite did through direct HTTP calls or DB seeding scripts (often
  hidden inside a `@Before` hook).
- **Per-`Examples`-row parallelism**: called out above, but worth
  repeating — this is a free performance win over typical Cucumber-JVM
  execution, not something that needs to be engineered.
