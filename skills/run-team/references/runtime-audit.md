# Runtime Audit

Use this reference before planning or executing.

## Required Checks

Run:

```bash
python3 .codex/skills/run-team/scripts/audit_team_runtime.py --root . --format markdown
git status --short
git branch --show-current
git log --oneline -5
```

Inspect:

- `AGENT.md`
- `.codex/agents/README.md`
- `.codex/agents/orchestrator.md`
- `.codex/runtime/STATE_MACHINE.md`
- `.codex/runtime/RUNTIME_INDEX.yaml`
- `.codex/runtime/scopes/<scope_id>/SCOPE.yaml`
- `.codex/runtime/scopes/<scope_id>/MILESTONES.yaml`
- `.codex/runtime/scopes/<scope_id>/IMPLEMENT_INDEX.yaml`
- `.codex/runtime/scopes/<scope_id>/IMPLEMENT_ISSUE_INDEX.yaml`
- `.codex/runtime/scopes/<scope_id>/AGENT_ROSTER.yaml`
- active milestone `IMPLEMENT_TASKS.yaml`
- active milestone `IMPLEMENT_ISSUES.yaml`

## What To Detect

- dirty unrelated files
- active scope and milestone
- completed or frozen scope
- missing roster
- stale `agent_id: null` in active tasks
- unresolved issues
- blocked tasks
- missing prompt/review/archive directories
- mismatch between runtime state and source files
- completed milestones without QA report or checkpoint

## Archive Use

Read `archive/` to understand previous decisions or frozen snapshots. Do not revive archived work without creating a new task or scope that explains why.

## Reporting

Summarize:

- current scope/milestone
- run mode recommendation
- blockers
- next likely action
- files that must be read next
