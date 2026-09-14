import { Page } from '@playwright/test';

/**
 * Base class for all migrated Page Objects.
 *
 * Design rationale (see .github/skills/design-patterns-and-solid.skill.md):
 * - Pattern: Page Object as Facade — each subclass hides a page's
 *   locators/waits/actions behind an intention-revealing API, so step
 *   definitions depend on "what the page does," never on how its DOM is
 *   structured (Dependency Inversion).
 * - One subclass = one page or one reusable component (Single
 *   Responsibility). A page needing another page's data/actions composes
 *   that page object in, it does not grow to cover both.
 * - Extend this base for the shared `goto` concern only. Prefer
 *   composition (a shared component class instantiated as a field) over
 *   deepening this inheritance chain — see the Anti-patterns section in
 *   the skill above before adding a second level of subclassing.
 *
 * Convention (see ../../.github/copilot-instructions.md): locators are
 * declared as readonly properties initialized in the constructor, using
 * getByRole/getByLabel/getByTestId/getByText wherever the DOM supports it.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }
}
