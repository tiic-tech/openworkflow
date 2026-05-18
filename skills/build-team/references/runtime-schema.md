# Runtime Schema Reference

Use this reference when creating or reconciling `.codex/runtime/**`.

## Directory Layout

Required layout:

```txt
.codex/runtime/
  RUNTIME_INDEX.yaml
  STATE_MACHINE.md
  archive/
  scopes/
    <scope_id>/
      SCOPE.yaml
      MILESTONES.yaml
      IMPLEMENT_INDEX.yaml
      IMPLEMENT_ISSUE_INDEX.yaml
      AGENT_ROSTER.yaml
      archive/
      milestones/
        <milestone_id>/
          IMPLEMENT_TASKS.yaml
          IMPLEMENT_ISSUES.yaml
          prompts/
          reviews/
          archive/
```

Use `.gitkeep` files in empty `archive/`, `prompts/`, and `reviews/` folders.

## RUNTIME_INDEX.yaml

```yaml
active_scope: MVP
scopes:
  - scope_id: MVP
    title: MVP implementation
    status: active
    source: AGENT.md
    path: .codex/runtime/scopes/MVP/
    base_git_ref: null
```

## SCOPE.yaml

```yaml
scope_id: MVP
title: MVP implementation
status: active
source_artifacts:
  - AGENT.md
base_git_ref: null
runtime_protocol:
  agent_team_protocol: .codex/agents/README.md
  orchestrator_role: .codex/agents/orchestrator.md
  agent_roster: .codex/runtime/scopes/MVP/AGENT_ROSTER.yaml
boundary:
  application_roots: []
  protected_roots:
    - .git/
    - .codex/runtime/
```

## MILESTONES.yaml

```yaml
scope_id: MVP
source_artifacts:
  - AGENT.md
milestones:
  - milestone_id: M01
    title: Repo initialization
    status: planned
    scope: Initialize the repo and workflow contracts.
    target: A runnable baseline with clear ownership and checks.
    dependencies: []
    required_specs:
      - AGENT.md
    expected_artifacts: []
    estimated_atom_tasks: 3-6
    task_file: .codex/runtime/scopes/MVP/milestones/M01/IMPLEMENT_TASKS.yaml
    issue_file: .codex/runtime/scopes/MVP/milestones/M01/IMPLEMENT_ISSUES.yaml
    qa_gate:
      - baseline checks pass
    acceptance:
      - runtime state is current
```

## IMPLEMENT_INDEX.yaml

```yaml
scope_id: MVP
active_milestone: M01
milestones:
  - milestone_id: M01
    status: active
    title: Repo initialization
    task_file: .codex/runtime/scopes/MVP/milestones/M01/IMPLEMENT_TASKS.yaml
    issue_file: .codex/runtime/scopes/MVP/milestones/M01/IMPLEMENT_ISSUES.yaml
    qa_report: null
    branch: feat/m01-repo-initialization
    last_checkpoint: null
```

## IMPLEMENT_TASKS.yaml

Each milestone has one task file:

```yaml
tasks:
  - task_id: M01-T001
    milestone_id: M01
    task_name: Initialize workflow baseline
    task_type: implementation
    status: planned
    agent_name: orchestrator
    agent_id: null
    agent_session_policy: persistent
    preferred_agent_id: null
    assigned_at: null
    resumed_from_agent_id: null
    handoff_required: true
    orchestrator_exception: null
    required_artifacts:
      - AGENT.md
    required_tasks: []
    implement_prompt_path: .codex/runtime/scopes/MVP/milestones/M01/prompts/M01-T001.md
    expected_output_artifact: Workflow baseline
    output_artifact_path: []
    owned_paths:
      - .codex/runtime/
    allowed_paths:
      - .codex/runtime/
    forbidden_paths:
      - .git/
    checks_required: []
    artifact_status: missing
    review_status: none
    qa_status: not_run
    is_output_done: false
    notes: ""
```

After assignment, `agent_id` must be a real returned agent id. Use `legacy_untracked` only for historical tasks that predate roster tracking.

## AGENT_ROSTER.yaml

Each scope owns one agent lifecycle file:

```yaml
scope_id: MVP
roster_version: 1
updated_at: null
lifecycle_status_values:
  - available
  - active
  - idle
  - blocked
  - closed
  - archived
  - legacy_untracked
session_policies:
  persistent:
    purpose: Keep domain agents mounted across related atom tasks and issue-fix loops.
    reuse_rule: Resume the existing matching agent_id before spawning a replacement.
  event:
    purpose: Run async or one-off review, security, QA, and git drafting work.
    reuse_rule: Close after handoff unless the Orchestrator records a reason to keep it idle.
persistent_agents:
  - agent_name: frontend-agent
    agent_id: null
    lifecycle_status: available
    session_policy: persistent
    owns:
      - frontend/src/app/
      - frontend/src/components/
    current_task: null
    last_completed_task: null
    active_milestone: null
    notes: Spawn once for frontend work, then resume for related tasks and fixes.
event_agents:
  - agent_name: code-review-agent
    agent_id: null
    lifecycle_status: available
    session_policy: event
    trigger: artifact_ready
    closes_after_handoff: true
    notes: Writes review artifacts and issue logs, then closes.
legacy_tracking:
  task_agent_ids_before_roster: legacy_untracked
  note: Do not invent ids for historical null task agent_id values.
```

## IMPLEMENT_ISSUES.yaml

Milestone-local issue file:

```yaml
issues:
  - id: M01-I001
    task: M01-T001
    severity: major
    status: open
    owner: frontend-agent
    loc: path/to/file.ts:42
    title: Short issue title
    expected: Expected behavior.
    fix_task: null
    review: .codex/runtime/scopes/MVP/milestones/M01/reviews/M01-T001-review.md
```

Scope-level issue index:

```yaml
scope_id: MVP
issues: []
```

Use the scope-level index only for cross-milestone issues, deferred risks, reopened regressions, and architecture-level concerns.

## Status Values

Task `status`:

```txt
planned, prompted, claimed, in_progress, artifact_ready, review_pending, reviewed, fix_required, qa_ready, done, blocked, archived
```

`artifact_status`:

```txt
missing, created, validated, archived
```

`review_status`:

```txt
none, pending, passed, issues_found, waived
```

`qa_status`:

```txt
not_run, passed, failed, waived
```

Milestone `status`:

```txt
planned, active, qa, completed, frozen, blocked, deferred, archived
```

Issue `status`:

```txt
open, fixed, waived, deferred, reopened, archived
```

Issue `severity`:

```txt
blocker, critical, major, minor, nit
```

## Maintenance Rules

- Update runtime state when task reality changes, not at the end of a session.
- Update `AGENT_ROSTER.yaml` when agent lifecycle changes.
- New delegated tasks must not leave `agent_id: null`.
- Keep YAML compact; put detailed reasoning in `prompts/` and `reviews/`.
- Archive superseded coordination artifacts instead of deleting them.
- Freeze completed milestone directories after QA and checkpoint decisions.
- Do not allow implementation agents to update global runtime indexes unless the Orchestrator assigns an explicit state task.
