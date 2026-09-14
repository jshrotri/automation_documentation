---
mode: 'analyst'
description: 'Register one or more additional Cucumber scenarios into migration scope, then gather requirements for each.'
---
Register these as new in-scope scenarios:
${input:scenarios:One or more "feature-file.feature :: Scenario name" pairs, comma- or newline-separated (use :: * for every scenario in a file)}

For each one: derive its slug, add an entry to `.github/migration.config.json`
`scope.scenarios` with `status: "pending"` if it isn't already there (skip
ones that already exist rather than duplicating), then run full Analyst
requirement gathering on it per your chat mode instructions.

Do not add or act on anything not listed above, even if you notice related
or similar scenarios while reading the feature files or step definitions.
