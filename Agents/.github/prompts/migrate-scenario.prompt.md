---
mode: 'analyst'
description: 'Kick off migration of one Cucumber scenario end-to-end (starts the pipeline at Analyst, and is the only entry point that adds a scenario to migration scope).'
---
Start migrating this Cucumber scenario to Playwright TypeScript (via
playwright-bdd):
${input:featureFile:Path to the .feature file, relative to seleniumSource.featuresDir}
${input:scenario:Exact Scenario/Scenario Outline name, or * for every scenario in the file}

Follow the `scope-guard` skill: register this as a new entry in
`.github/migration.config.json`'s `scope.scenarios` (status `"pending"`) —
this is what makes it an authorized scenario for every other agent. Then
follow your Analyst role: resolve each Gherkin step against its Java step
definition, trace `Background`/tags/`Examples`, ask clarifying questions
only where genuinely ambiguous, and produce `migration/<slug>/requirements.md`.

Do not migrate, plan, or otherwise act on any other scenario you happen to
notice — including other scenarios in this same `.feature` file — unless
it was explicitly named above.

Once requirements are complete, tell me the slug and remind me to switch to
**Architect** mode next.
