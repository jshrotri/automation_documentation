---
name: 'config-loader'
usedBy: ['analyst', 'architect', 'engineer', 'validator']
trigger: 'always — first thing, before any other action'
---
# Skill: Config Loader

## Purpose

Every path, convention, and the entire scope allow-list live in one file
instead of being hard-coded into four separate chat mode prompts. This is
what makes the system reconfigurable (new repo, different paths, different
locator preferences, different browser matrix) by editing one JSON file
instead of editing agent instructions.

## When to use

The very first thing any of the four agents does in a session, before
reading any source code or writing any artifact.

## Steps / Checklist

1. Read `.github/migration.config.json`. If it's missing, stop and tell the
   user to restore it (or run the setup in `docs/agentic-workflow.md`) —
   do not fall back to guessed paths.
2. If `.github/migration.config.local.json` also exists, deep-merge it on
   top (local values win, key by key — not a full-object replace). This is
   for machine-specific paths/toggles; never write to this file's `scope`
   yourself, and don't expect it to exist.
3. Validate the merged config has at minimum: `seleniumProjectPath`,
   `targetProjectPath`, `migrationArtifactsPath`, `scope.scenarios`. If
   `scope.mode` isn't `"explicit"`, treat it as explicit anyway — there is
   no supported looser mode (see [`scope-guard.skill.md`](scope-guard.skill.md)).
4. Note `framework.style` (`"playwright-bdd"`) — every skill and mode
   assumes Gherkin `.feature` files compiled by `playwright-bdd` into
   native Playwright tests, not plain `.spec.ts` files or `cucumber-js`.
5. Resolve every other path in your instructions relative to this config —
   never assume `playwright-migrated/`, `features/`, or `./migration/`
   literally if the config says otherwise.
6. If asked to do something that would require a config value that doesn't
   exist, use the schema's documented default in
   `.github/migration.config.schema.json` rather than inventing a value.

## Output / Contract

Nothing written — this just establishes ground truth for the rest of the
session. Every other skill and every chat mode assumes this has already
happened.

## Related skills

- [`scope-guard.skill.md`](scope-guard.skill.md) — consumes `scope.scenarios` from this config.
