# Scope Selection

Use this reference when `/ow:team CONTENT` may need a new scope.

## Continue Current Scope When

- active scope status is active or blocked but still matches `CONTENT`
- active milestone has remaining planned, prompted, in-progress, fix-required, or QA-ready tasks
- unresolved issues must be fixed before moving forward
- user asks to continue the same phase

## Create New Scope When

- MVP or current phase is completed and user asks for the next phase
- `CONTENT` introduces a distinct delivery target or product stage
- current scope was frozen and should not be modified
- work is large enough to need its own milestone plan
- acceptance criteria differ materially from the current scope

## Scope Id Guidance

Use short uppercase ids:

- `V1` for first post-MVP iteration
- `POST_MVP` for broad next-stage work
- `LAUNCH` for release and production readiness
- `CONTENT` for content expansion
- `PERF` for performance work
- `SECURITY` for security hardening
- `MIGRATION` for structural migration

## Milestone Requirements

Every milestone needs:

- `milestone_id`
- `title`
- `status`
- `scope`
- `target`
- `dependencies`
- `required_specs`
- `expected_artifacts`
- `estimated_atom_tasks`
- `task_file`
- `issue_file`
- `qa_gate`
- `acceptance`

Keep contracts before broad implementation. For product work, prefer:

```txt
requirements/contracts -> architecture/data model -> implementation -> QA/hardening
```

## One-Question Rule

Ask one question only if needed:

```txt
I infer the next scope is <scope_id>: <goal>. What is the delivery target, first milestone done criteria, and any required or forbidden roles/tools for this run?
```

If the user answer is incomplete, proceed with explicit assumptions.
