---
name: 'blocked-escalation'
usedBy: ['analyst', 'architect', 'engineer', 'validator']
trigger: 'when you cannot proceed correctly without a decision that isn''t yours to make'
---
# Skill: Blocked Escalation

## Purpose

A wrong guess costs more round-trips than stopping once to ask. This skill
standardizes what "stopping to ask" looks like so it's consistent across
all four agents instead of each one improvising its own format.

## When to use

- **Engineer** blocked by an underspecified or wrong `plan.md` →
  escalate to Architect.
- **Architect** blocked by incomplete `requirements.md` → escalate to
  Analyst.
- **Validator** finding a failure caused by a design gap rather than an
  implementation bug → escalate to Architect (or Analyst, if the
  requirement/Gherkin wording itself was wrong).
- **Any agent** hitting a scope violation → escalate per
  [`scope-guard.skill.md`](scope-guard.skill.md) (that has its own exact
  wording; use it, not this skill's, for scope issues specifically).

## Steps / Checklist

1. Stop working on the blocked part immediately — don't produce a
   best-guess implementation "just in case" alongside the question.
2. Write the specific, answerable question(s) to the appropriate file
   (`questions-for-planner.md` or `defects.md` per the
   [artifact contract](artifact-contract.skill.md)). Vague questions
   ("is this right?") are not acceptable — state exactly what's ambiguous
   and what the two-or-more concrete options are.
3. Update the slug's `status` in `.github/migration.config.json` to
   `"blocked"`.
4. Tell the user, in chat, in this exact shape:

   > Blocked on `<slug>` — see `<file>`. Switch to **<Agent>** mode to
   > resolve, then come back to **<current agent>** mode to continue.

5. When the upstream agent resolves the question, it edits the plan/
   requirements file directly (the fix belongs in the source-of-truth
   artifact, not just as a chat reply) and flips status back to the
   appropriate non-blocked value.

## Output / Contract

A question file the next agent can act on without re-reading the entire
chat history, and an accurate `status` field so anyone opening the config
file can see what's stuck and where.

## Related skills

- [`artifact-contract.skill.md`](artifact-contract.skill.md)
- [`scope-guard.skill.md`](scope-guard.skill.md)
