# Run Loop

Use this reference to drive `/run-team CONTENT` from inspection into execution.

## Execution Flow

```txt
content_intake
  -> repo_and_runtime_audit
  -> source_truth_loading
  -> run_mode_decision
  -> scope_or_milestone_plan
  -> runtime_init_or_reconcile
  -> atom_task_plan
  -> prompt_preparation
  -> spawn_or_resume_agent
  -> record_agent_id
  -> delegated_work
  -> handoff
  -> review_or_qa
  -> issue_fix_loop
  -> checkpoint
```

## Operating Rules

- Treat `CONTENT` as the seed target, not as a complete plan.
- Infer from runtime first, then source-of-truth docs, then code state.
- Do not skip `git status --short`; dirty unrelated files affect checkpoint boundaries.
- Do not start implementation until the active scope, milestone, task, ownership, and agent session policy are known.
- Do not let the Orchestrator become the default implementer.
- Prefer persistent implementation agents for repeated work in the same domain.
- Use event-driven agents for review, security, QA, release notes, and narrow investigations.
- Keep `.codex/runtime/` synchronized with reality before moving to unrelated work.

## Run Modes

`continue_scope`:

- Active scope exists.
- Active milestone has planned, prompted, in-progress, blocked, or fix-required tasks.
- Continue by reconciling stale state, then assigning the next unblocked task.

`new_scope`:

- Existing scope is complete, frozen, deferred, or no longer matches `CONTENT`.
- Create a new scope such as `V1`, `POST_MVP`, `LAUNCH`, `CONTENT`, `MIGRATION`, or a short uppercase slug.
- Initialize runtime before atom tasks.

`issue_fix`:

- Unresolved issues exist and match `CONTENT`.
- Convert issues into fix tasks and route to the original persistent implementation agent when possible.

`release_or_checkpoint`:

- Work is complete enough for QA, commit, PR, deploy, or release notes.
- Assign QA/release agents as event-driven work.

`runtime_reconcile`:

- Runtime files are stale, missing, contradictory, or not parseable.
- Fix runtime before development.

## End State

A successful run should leave:

- updated runtime state
- agent ids recorded for new delegated work
- clear task/milestone status
- review or QA artifacts when relevant
- a commit decision for coherent slices
