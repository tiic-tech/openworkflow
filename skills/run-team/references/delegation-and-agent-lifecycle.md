# Delegation And Agent Lifecycle

Use this reference before assigning work.

## Orchestrator Boundary

The Orchestrator owns:

- scope and milestone selection
- runtime state
- atom task decomposition
- prompt assignment
- agent lifecycle
- integration
- checkpoint decisions

The Orchestrator must not directly perform implementation, docs, QA, review, or prompt-writing work when an eligible subagent can own it.

Direct execution requires:

```yaml
orchestrator_exception: "<reason>"
```

## Persistent Agents

Use persistent agents for recurring work:

- `tech-prompt-agent`
- `frontend-agent`
- `backend-agent`
- `content-schema-agent`
- `data-agent`
- `infra-agent`
- `docs-agent`

Before spawning a persistent agent, check `AGENT_ROSTER.yaml` for an existing idle or active matching role. Resume it when possible.

After spawn or resume:

- record returned `agent_id` in `AGENT_ROSTER.yaml`
- record the same `agent_id` in `IMPLEMENT_TASKS.yaml`
- set lifecycle state to `active`
- set `current_task`

When the handoff is complete:

- set lifecycle state to `idle` unless blocked or closed
- set `last_completed_task`
- clear or update `current_task`

## Event-Driven Agents

Use event-driven agents for:

- `code-review-agent`
- `security-review-agent`
- `tdd-qa-agent` unless running a long test authoring stream
- `git-release-agent`

Event agents may run asynchronously when ownership is disjoint. Close after handoff unless there is a recorded reason to keep them idle.

## Issue Fix Return

When review finds issues:

1. Record issues in the reviewed milestone's `IMPLEMENT_ISSUES.yaml`.
2. Convert required issues into fix tasks.
3. Prefer the original persistent implementation `agent_id`.
4. Spawn a replacement only when the original agent is closed, unavailable, or no longer owns the paths.

## Forbidden States

- new assigned work with `agent_id: null`
- invented ids for historical work
- review agents editing implementation files
- implementation agents committing
- two agents writing the same path ownership without a merge plan
