// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

/**
 * Flat ESLint config (ESLint 9+). This is the mechanical enforcement half
 * of .github/skills/playwright-best-practices.skill.md — the
 * playwright-plugin recommended rules catch the automatable anti-patterns
 * (page.waitForTimeout, test.only/test.skip left in committed code,
 * missing awaits, etc.) so `npm run lint` is a real gate, not a
 * suggestion. If the installed plugin version exports its flat config
 * under a different key than `playwright.configs['flat/recommended']`,
 * adjust to match — check the installed version's own docs.
 */
export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    plugins: { playwright },
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
  prettier,
  {
    ignores: [
      '.features-gen/**',
      'playwright-report/**',
      'test-results/**',
      'node_modules/**',
      'playwright/.auth/**',
    ],
  },
);
