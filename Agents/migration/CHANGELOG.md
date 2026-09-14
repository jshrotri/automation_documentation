# Migration Changelog

Append-only chronological record of completed migrations — one entry per
scenario, added by the **Validator** the moment it signs a scenario off as
`passed`. This is the project's memory across chat sessions: read this
before `migration/<slug>/dev-log.md` if you just need "what's happened so
far and why," not full per-scenario detail. Never edit a past entry — if
something later turns out to be wrong, add a new entry noting the
correction, same as you would in any other append-only log. See
[`.github/skills/project-memory.skill.md`](../.github/skills/project-memory.skill.md).

## Format

```
## YYYY-MM-DD — <slug>

- **Feature**: <feature file>
- **Scenario**: <scenario name>
- **Summary**: one or two sentences — what this scenario now covers
- **Files**: new/changed files (feature, steps, page objects, fixtures)
- **New reusable components**: any step/page-object/fixture added to
  docs/component-registry.md by this scenario (or "none — fully reused")
- **Design notes**: one-line pointer to anything notable in plan.md's
  Design Rationale, if a new pattern was introduced
- **Details**: migration/<slug>/{requirements,plan,dev-log,test-report}.md
```

---

_(no entries yet)_
