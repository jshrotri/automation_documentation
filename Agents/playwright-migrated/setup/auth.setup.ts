import { test as setup } from '@playwright/test';

/**
 * Playwright best practice: authenticate once, reuse the storage state
 * across every test that needs to be logged in, instead of performing a
 * UI login in every scenario's Background/Given step (see
 * .github/skills/playwright-best-practices.skill.md, Standard 4).
 *
 * This intentionally bypasses playwright-bdd — it's infrastructure setup,
 * not a business scenario, so it stays a plain Playwright test rather
 * than a Gherkin one. It is disabled by default (not wired into
 * playwright.config.ts's projects) since not every application needs
 * this; enable it — see the commented-out "setup" project in
 * playwright.config.ts — once a scenario actually requires an
 * authenticated session.
 */
const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // TODO: replace with the real login flow once the application under
  // test is known — this should mirror whatever the Java suite's login
  // Background/hook currently does. Credentials come from env vars
  // (see .env.example), never hardcoded here.
  //
  // await page.goto('/login');
  // await page.getByLabel('Username').fill(process.env.TEST_USERNAME!);
  // await page.getByLabel('Password').fill(process.env.TEST_PASSWORD!);
  // await page.getByRole('button', { name: 'Log in' }).click();
  // await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.context().storageState({ path: authFile });
});
