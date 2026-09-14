import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Config for scenarios migrated from the Selenium/Java/Cucumber suite.
 * See docs/agentic-workflow.md, docs/selenium-to-playwright-mapping.md,
 * and .github/skills/playwright-best-practices.skill.md in the repo root
 * for how the migration agents use this project.
 *
 * defineBddConfig compiles features/**\/*.feature + steps/**\/*.ts into
 * real Playwright test files under the returned testDir (.features-gen/
 * by default) every time `bddgen` runs — always run `bddgen` before
 * `playwright test` (the npm scripts already do this).
 */
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'steps/**/*.ts',
});

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    // TODO: point this at the application under test once known.
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Authentication reuse (Playwright best practice — see
    // playwright-best-practices.skill.md, Standard 4): once a scenario
    // needs to be logged in, uncomment this "setup" project and add
    // `storageState: 'playwright/.auth/user.json'` plus
    // `dependencies: ['setup']` to whichever browser projects below need
    // an authenticated session, instead of logging in via the UI in every
    // scenario.
    //
    // { name: 'setup', testMatch: /auth\.setup\.ts/ },

    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
