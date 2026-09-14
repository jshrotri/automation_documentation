---
name: 'artifact-contract'
usedBy: ['analyst', 'architect', 'engineer', 'validator']
trigger: 'always'
---
# Skill: Artifact Contract

## Purpose

Copilot chat modes can't call each other directly — this is the file-based
protocol that makes the four-agent handoff actually work, and the thing
that keeps a migration resumable across separate chat sessions, VS Code
restarts, or a different person picking up where you left off.

## When to use

Whenever locating, creating, or updating a scenario's artifacts.

## Steps / Checklist

1. The slug is the kebab-case entry already recorded in
   `scope.scenarios[].slug` (see [`scope-guard.skill.md`](scope-guard.skill.md))
   — don't re-derive it differently each time. Convention:
   `<feature-file-kebab>--<scenario-kebab>` (e.g. `login--successful-login-with-valid-credentials`),
   or `<feature-file-kebab>--all` when `scenario` is `"*"`.
2. Artifacts live at `<migrationArtifactsPath>/<slug>/`. If the folder
   doesn't exist yet, create it by copying
   `<migrationArtifactsPath>/_template/*.md`.
3. File-by-file contract:

   | File | Owner (only writer) | Readers |
   |---|---|---|
   | `requirements.md` | Analyst | Architect, Validator |
   | `plan.md` | Architect | Engineer |
   | `questions-for-planner.md` | Engineer (create only when blocked) | Architect |
   | `dev-log.md` | Engineer | Validator, Architect |
   | `test-report.md` | Validator | Engineer, Architect, user |
   | `defects.md` | Validator (create only on failure) | Engineer, Architect, or Analyst |

4. Never edit a file you're not the owner of. If you disagree with
   something in a file another agent owns, say so in your own file's notes
   and let the human route it back — don't unilaterally rewrite someone
   else's artifact.
5. Before writing your file, actually read the ones upstream of you fully —
   don't skim. An Engineer that doesn't read all of `plan.md` before coding
   is the most common source of wasted round-trips in this system.
6. End every turn where you touched an artifact by stating, in chat, which
   agent the user should switch to next and why (see
   [`blocked-escalation.skill.md`](blocked-escalation.skill.md) for the
   blocked case specifically).

## Output / Contract

Consistent, predictable file locations and ownership so any agent, in any
session, can pick up a slug's history purely from disk.

## Related skills

- [`scope-guard.skill.md`](scope-guard.skill.md)
- [`blocked-escalation.skill.md`](blocked-escalation.skill.md)
