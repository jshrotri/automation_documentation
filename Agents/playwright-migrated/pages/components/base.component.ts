import { Locator, Page } from '@playwright/test';

/**
 * Base class for shared UI components (a header, nav, a modal) that
 * appear on more than one page.
 *
 * Design rationale (see .github/skills/design-patterns-and-solid.skill.md):
 * - Pattern: Composite — compose a component into every page object that
 *   has one, instead of duplicating its locators/methods per page (DRY),
 *   and instead of letting a single page object grow to cover content
 *   that isn't really "its own" (Single Responsibility).
 * - A component is scoped to a root `Locator`, not the whole `page` —
 *   its internal queries stay correctly bounded even if the same
 *   structural pattern (e.g. a card) repeats multiple times on one page.
 *
 * Usage: a page object instantiates a component as a field, passing the
 * component's root locator, e.g.:
 *
 *   class DashboardPage extends BasePage {
 *     readonly header = new HeaderComponent(this.page, this.page.getByRole('banner'));
 *   }
 */
export abstract class BaseComponent {
  constructor(
    protected readonly page: Page,
    protected readonly root: Locator,
  ) {}
}
