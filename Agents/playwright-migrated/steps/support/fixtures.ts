import { test as base } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

/**
 * The World-equivalent for this project. Cucumber-JVM injects a shared,
 * per-scenario object (via PicoContainer/Spring/Guice) across step
 * definition classes; Playwright's fixture system is the direct
 * structural replacement — each fixture below is created fresh per
 * scenario and torn down automatically, the same lifecycle a Cucumber
 * World has.
 *
 * Add one property per piece of shared state migrated scenarios actually
 * need beyond `page` itself (an authenticated session, a created test
 * user's id, ...). Do not use module-level mutable variables as a
 * substitute — that leaks across parallel workers/scenarios.
 *
 * Example shape for future use:
 *
 * type Fixtures = { authenticatedPage: Page };
 * export const test = base.extend<Fixtures>({
 *   authenticatedPage: async ({ page }, use) => {
 *     // log in once, then hand the authenticated page to the steps
 *     await use(page);
 *   },
 * });
 */
export const test = base;

export const { Given, When, Then } = createBdd(test);
