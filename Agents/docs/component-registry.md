# Component Registry

Live index of every reusable step definition, page object, fixture, and
hook that exists in the target project. This is the Architect's and
Engineer's **first stop** for reuse checks — read this before scanning
`steps/`/`pages/` directly. Kept current in real time: the Engineer adds a
row the moment it creates something new, in the same session, not as a
later cleanup pass. See
[`.github/skills/project-memory.skill.md`](../.github/skills/project-memory.skill.md).

If this file and the actual files on disk ever disagree, disk wins — fix
the registry entry as part of whatever work you're doing when you notice
the drift, and note it in that scenario's `dev-log.md`.

## Step Definitions

| Gherkin step (Cucumber Expression) | File | What it does | Introduced by |
|---|---|---|---|
| _(none yet)_ | | | |

## Page Objects

| Class | File | Models | Introduced by |
|---|---|---|---|
| `BasePage` | `pages/base.page.ts` | Shared `goto()` — every page object extends this. | scaffold |

## Fixtures & Hooks

| Name | File | Purpose | Introduced by |
|---|---|---|---|
| _(none yet — `steps/support/fixtures.ts` and `steps/support/hooks.ts` are scaffolded but empty)_ | | | |
