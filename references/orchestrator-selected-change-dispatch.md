# Orchestrator Selected-Change Dispatch Protocol

This reference defines the manual Orchestrator mode for OpenWorkflow dogfood
development. It governs how one Agent can own a whole candidate-change queue
while dispatching selected changes to subagents and preserving OW git,
evidence, and safety boundaries.

This is a planning and coordination contract. It does not create a new CLI
command, runtime daemon, automatic scheduler, or permission bypass.

## Purpose

Use this protocol when the user explicitly asks one Agent to act as the
Orchestrator for a large goal, feature queue, or group of candidate changes.

The Orchestrator may:

- create and maintain the `CANDIDATE_CHANGES.yaml` queue for the current goal
- select focused selected changes inside that queue
- prepare dispatch packets for subagents
- assign or resume subagents through available multi-agent tooling
- review returned work, evidence, and dirty paths
- run final validation and decide whether the selected change is complete
- create local commits and queue evidence when git governance allows it
- prepare PR, merge, or release packets only under the normal remote-operation
  approval gates

The Orchestrator must not treat broad authority as permission for subagents to
ignore selected-change boundaries. Delegation narrows authority; it does not
expand scope.

## Authority Model

Authority is tiered:

```text
User approval -> Orchestrator queue authority -> subagent selected-change authority
```

The user may grant the Orchestrator CC-level authority for a named queue or
goal. That authority lets the Orchestrator keep the work moving inside the
queue boundary, but it does not remove OW's normal stop gates.

Subagents receive only SC-level authority:

- one `plan_id`
- one `candidate_id` or selected-change id
- explicit `owned_paths`
- explicit forbidden paths
- validation commands
- acceptance criteria
- expected evidence shape
- stop conditions

Subagents must not push, open PRs, merge, publish, mutate Issues, change queue
status to complete, or create final local commits unless the Orchestrator
explicitly delegates that exact operation and the queue governance allows it.

## Orchestrator Duties

Before dispatch:

1. Run `openworkflow resume --root . --json` or `openworkflow handoff --root .
   --json` and inspect `git status --short --branch`.
2. Confirm the current queue boundary, branch boundary, dirty tree, and latest
   user authority.
3. Create or update `CANDIDATE_CHANGES.yaml` with queue scope, branch policy,
   candidates, dependencies, validation, risk, and operation history.
4. Select exactly one SC before implementation begins, unless the user is asking
   only for planning.
5. Generate a dispatch packet from `SELECTED_CHANGE.yaml`, `ATOM_TASKS.yaml`,
   and `IMPLEMENTATION_BRIEF.md`.

During dispatch:

1. Give each subagent only the selected-change packet and directly required
   source context.
2. Prefer isolated subagent work when path overlap, long-running work, or
   parallel execution could contaminate one shared worktree.
3. Track assignment state in the selected-change folder or queue operation log
   when more than one subagent is involved.
4. Keep remote operations and final queue completion under Orchestrator control.
5. Stop or re-scope when a subagent reports path drift, failing validation,
   missing authority, or ambiguous ownership.

After return:

1. Inspect `git status --short --branch` before reading the claimed result.
2. Classify changed paths as owned, generated-from-source, evidence-only, or
   out-of-scope.
3. Review the diff, not only the subagent summary.
4. Run the selected validation ladder.
5. Bind returned evidence to `LOCAL_COMMIT_EVIDENCE.yaml`,
   `IMPLEMENTATION_BRIEF.md`, or a queue-local dispatch evidence file.
6. Commit only after evidence and queue completion are coherent.
7. Update the queue, readable view, and summary after the selected change or
   queue completes.

## Dispatch Packet Shape

A dispatch packet may be embedded in `IMPLEMENTATION_BRIEF.md` or written as a
queue-local evidence file. It should include:

```yaml
dispatch:
  mode: orchestrator_selected_change
  plan_id: M000-example
  candidate_id: C001
  selected_change_path: changes/M000-example/C001-example/SELECTED_CHANGE.yaml
  atom_tasks_path: changes/M000-example/C001-example/ATOM_TASKS.yaml
  implementation_brief_path: changes/M000-example/C001-example/IMPLEMENTATION_BRIEF.md
  authority:
    granted_by: user
    scope: selected_change_only
    remote_mutation: false
    final_commit: false
  owned_paths:
    - references/example.md
  forbidden_paths:
    - .openworkflow/**
    - .agents/**
  required_reads:
    - references/orchestrator-selected-change-dispatch.md
  validation:
    - npm run validate
    - git diff --check
  expected_return:
    - files_changed
    - commands_run
    - validation_result
    - blockers
    - residual_risk
```

This shape is advisory in the first protocol stage. A later candidate may turn
it into a formal schema, validator, or CLI-generated assignment artifact after
dogfood evidence proves the fields are sufficient.

## Worktree And Branch Policy

The safest default is one Orchestrator-owned branch per CC. Subagents may work
inside the same worktree only when the Orchestrator dispatches one SC at a time
or when paths are disjoint and the Orchestrator is actively managing dirty
state.

Use an isolated worktree or separate branch when:

- two subagents would run concurrently
- owned paths overlap or are likely to generate shared artifacts
- a subagent needs to run broad formatting, sync, or code generation
- validation produces temporary files that are easy to confuse with source
  changes
- the Orchestrator needs to preserve a clean integration branch

The Orchestrator remains responsible for final integration. A subagent branch is
not a PR boundary unless the Orchestrator explicitly promotes it under git
governance.

## Evidence Contract

Every subagent return must be auditable without chat memory. Minimum return
evidence:

- selected plan and candidate id
- exact files changed
- commands run and whether they passed
- tests or checks intentionally skipped and why
- blockers, if any
- residual risk
- whether generated surfaces were changed, and if so, which source change
  generated them

The Orchestrator converts this into durable OW evidence:

- queue `operations` entry for assignment, return, block, or completion
- selected-change `LOCAL_COMMIT_EVIDENCE.yaml` when files changed
- completion evidence in `CANDIDATE_CHANGES.yaml`
- `SUMMARY.yaml` update when the queue handoff changes
- `PR_READY_SUMMARY.md` only when the whole CC is ready for PR review

## Completion Gates

An SC is complete only when:

- returned changes stay inside owned paths or are explicitly justified
- validation evidence matches the selected-change risk and touched trust domain
- queue completion references durable evidence
- implementation changes are tied to a local commit when strict commit evidence
  is enabled
- no unresolved subagent blocker is hidden by the Orchestrator

A CC is complete only when:

- all required SCs are `done`, `deferred`, `superseded`, or explicitly
  `blocked` with next authority needed
- branch, PR, release, or publication state is recorded when the queue policy
  requires it
- final validation and handoff are current
- the summary states the next correct queue or that no queue-local action
  remains

## Stop Conditions

The Orchestrator must stop or ask for new authority when:

- the user request crosses the current CC boundary
- a subagent needs forbidden paths or remote mutation
- npm publish, PR creation, merge, Issue mutation, or destructive git operation
  is required and not explicitly approved
- the dirty tree includes unrelated user work
- validation failure belongs to a different queue or historical debt
- two subagents produce conflicting edits
- the selected change is too broad for a coherent commit and needs splitting

## Relationship To Existing OW Modes

- `decompose-to-changes` creates or maintains the CC queue.
- `select-change` prepares one SC for dispatch or direct implementation.
- `/ow:change` remains the normal selected-change implementation boundary.
- `/ow:team` remains the runtime Agent Team mechanism for managed execution.
- `/ow:coder` remains internal quality governance for source edits.
- `git-automation` remains the local git lifecycle shell and remote approval
  gate.

This protocol connects those pieces. It does not replace them.
