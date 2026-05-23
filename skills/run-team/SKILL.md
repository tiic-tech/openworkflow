---
name: run-team
description: Start and drive formal Agent Team development from the current repository state. Use when the user invokes /ow:team CONTENT or asks Codex to continue a governed multi-agent workflow, choose the next scope after MVP or another completed phase, inspect runtime/archive/git state, initialize or reconcile scope runtime, plan milestones and atom tasks, spawn or resume persistent agents, record agent_id values, and execute development through review, QA, issue-fix, and git checkpoint loops.
---

# Run Team

## Purpose

Use this skill as the execution entrypoint for an existing Agent Team. `/ow:team` is the user-facing entrypoint for both team creation and execution modes. This repo-local skill reads the current repo, runtime state, and user `CONTENT`, then drives the team through planning and actual development.

## Start Protocol

On `/ow:team CONTENT`, do not start coding immediately.

1. Audit the current state.
   - Run `scripts/audit_team_runtime.py --root . --format markdown`.
   - Inspect `git status --short`, current branch, and recent commits.
   - Read `AGENT.md`, `.codex/agents/README.md`, `.codex/agents/orchestrator.md`.
   - Read `.codex/runtime/STATE_MACHINE.md`, `RUNTIME_INDEX.yaml`, active scope `SCOPE.yaml`, `IMPLEMENT_INDEX.yaml`, `IMPLEMENT_ISSUE_INDEX.yaml`, and `AGENT_ROSTER.yaml`.
   - Inspect active milestone task/issue files and any relevant `archive/` entries.

2. Load relevant context.
   - Always load `references/run-loop.md` and `references/runtime-audit.md`.
   - Load `references/scope-selection.md` when deciding whether to continue the current scope or create a new one.
   - Load `references/delegation-and-agent-lifecycle.md` before spawning, resuming, or assigning agents.
   - Load repo source-of-truth docs only when relevant to `CONTENT`.

3. Decide the run mode.
   - `continue_scope`: continue active scope/milestone.
   - `new_scope`: create a post-MVP, V1, migration, launch, hardening, or feature scope.
   - `issue_fix`: convert unresolved issues into fix tasks.
   - `release_or_checkpoint`: prepare QA/checkpoint/release work.
   - `runtime_reconcile`: fix stale runtime before development.

4. Ask at most one question.
   - Ask only if the delivery target or acceptance bar cannot be inferred from `CONTENT` and repo state.
   - The question must combine target, done criteria, and constraints in one prompt.
   - If the answer is incomplete, state assumptions and proceed.

5. Plan dependency order.
   - Define or confirm scope id and goal.
   - Draft milestones with target, dependencies, expected artifacts, QA gate, and acceptance criteria.
   - Convert the first milestone into atom tasks.
   - Write prompts before implementation tasks.

6. Initialize or reconcile runtime.
   - For new scopes, run `scripts/init_next_scope.py`.
   - For existing scopes, update only stale or missing runtime files.
   - Preserve archive history; do not delete old runtime artifacts.

7. Execute through the Agent Team.
   - Orchestrator must not directly implement product code, docs, QA, review, or prompt-writing work when an eligible subagent can own it.
   - Spawn or resume the correct persistent/event-driven agent.
   - Immediately record the returned `agent_id` in `AGENT_ROSTER.yaml` and the task entry.
   - Keep persistent implementation agents mounted across related atom tasks and issue-fix loops.
   - Use event-driven review, security, QA, and git-release agents asynchronously where ownership is disjoint.
   - For source-edit work, apply coder governance before completion: owner/file
     map, RED evidence when applicable, GREEN evidence after edits,
     post-write self-check, validation ladder, and evidence binding.

8. Checkpoint.
   - Update runtime state after every real state transition.
   - Run required checks.
   - Record coder evidence status for source-edit work.
   - Commit coherent runtime/implementation/QA slices, or record why a checkpoint is deferred.

## Runtime Rules

New delegated work must not leave `agent_id: null`.

Use `legacy_untracked` only for historical tasks that predate roster tracking. Do not invent ids.

Direct Orchestrator execution requires `orchestrator_exception`.

If unresolved issues exist in an earlier milestone, record them in that milestone's issue file, then route fix tasks back to the original persistent implementation agent when possible.

## Script Quick Start

Audit:

```bash
python3 .codex/skills/run-team/scripts/audit_team_runtime.py --root . --format markdown
```

Create a new scope skeleton:

```bash
python3 .codex/skills/run-team/scripts/init_next_scope.py \
  --root . \
  --scope-id V1 \
  --scope-title "V1 iteration" \
  --source-artifact AGENT.md \
  --milestone "M01:Post-MVP planning"
```

If this skill is installed globally, run the scripts from that global skill path instead.
