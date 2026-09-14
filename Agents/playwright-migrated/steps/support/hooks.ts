import { createBdd } from 'playwright-bdd';

/**
 * Before/After hooks, migrated 1:1 from the Java suite's tag-scoped
 * @Before/@After annotations. Keep hooks here rather than scattered
 * across individual step files, so the full setup/teardown picture for
 * any tag is visible in one place.
 *
 * Example shape for future use:
 *
 * const { Before, After } = createBdd();
 * Before('@needsAuth', async ({ page }) => {
 *   // equivalent of a Java @Before("@needsAuth") hook
 * });
 */
export const { Before, After } = createBdd();
