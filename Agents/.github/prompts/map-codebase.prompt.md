---
mode: 'architect'
description: 'Map an existing Selenium/Java/Cucumber project''s structure into docs/project-structure.md, without migrating anything.'
---
Run the `codebase-structure-mapping` skill against the project at
`seleniumProjectPath` (from `.github/migration.config.json`).

Read the whole project as needed to understand feature-file organization,
step definition packages and how steps are matched/shared, the World/DI
setup (PicoContainer/Spring/Guice), hooks, tag taxonomy, the Page Object
layer, test data conventions, and CI setup — but per the `scope-guard`
skill, do **not** create or modify any `migration/<slug>/` artifact or
write any Playwright/Gherkin code as part of this, even for scenarios you
find interesting or obviously similar to what's in scope. Your only output
here is `docs/project-structure.md` (split into
`docs/project-structure/<area>.md` files with an index if the project is
large).

If `docs/project-structure.md` already exists, review it against the
current codebase and update only what's changed or missing.
