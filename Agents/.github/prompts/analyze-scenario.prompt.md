---
mode: 'analyst'
description: 'Re-enter or continue requirement gathering for a specific scenario slug.'
---
Continue or start requirement gathering for slug:
${input:slug:The kebab-case slug, e.g. login--successful-login-with-valid-credentials}

If `migration/${input:slug}/requirements.md` already exists, review it for
completeness and resolve any remaining entries in "Open Questions & Answers"
by asking me. If it doesn't exist yet, ask me for the `.feature` file and
scenario name to start from.
