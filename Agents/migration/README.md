# Migration Artifacts

One folder per migrated **scenario**, named by kebab-case slug:
`<feature-file-kebab>--<scenario-kebab>` (e.g.
`login--successful-login-with-valid-credentials`), or
`<feature-file-kebab>--all` when an entire feature file's scenarios were
provided at once. To start a new one, copy `_template/` to
`migration/<slug>/`.

See [`../docs/agentic-workflow.md`](../docs/agentic-workflow.md) for how
these files flow between the four agents (Analyst → Architect → Engineer →
Validator).

| File | Always present? | Written by |
|---|---|---|
| `requirements.md` | yes | Analyst |
| `plan.md` | yes | Architect |
| `questions-for-planner.md` | only if Engineer gets blocked | Engineer |
| `dev-log.md` | yes | Engineer |
| `test-report.md` | yes | Validator |
| `defects.md` | only on test failure | Validator |
