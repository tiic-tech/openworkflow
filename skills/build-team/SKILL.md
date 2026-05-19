---
name: build-team
description: Build or regenerate a repo-specific Agent Team workflow from the current repository goal. Use when the user invokes /ow:team CONTENT or asks Codex to create, adapt, or formalize an Agent Team with orchestrator/subagent roles, scoped responsibilities, runtime state machine, milestone/task planning, review/QA loops, git checkpoint rules, and .codex/runtime initialization or maintenance.
---

# Build Team

## Purpose

Create a repeatable Agent Team operating system for the current repository. Treat `CONTENT` from `/ow:team CONTENT` as the user's seed intent, then derive the team from the actual repo instead of copying a fixed roster blindly.

The final team must include:

- an `AGENT.md` project guide or an equivalent update to the existing guide
- `.codex/agents/` role documents for the orchestrator and selected subagents
- `.codex/runtime/` initialized with scopes, milestones, tasks, prompts, reviews, issues, and archive folders
- `.codex/runtime/scopes/<scope_id>/AGENT_ROSTER.yaml` for persistent and event-driven agent lifecycle tracking
- a state machine that binds planning, implementation, review, QA, fixes, checkpoint commits, and archiving

## Required Repo Scan

Before asking the user anything, inspect the repo state and infer the project goal.

Run or equivalent:

```bash
pwd
git status --short
git branch --show-current
git log --oneline -5
rg --files -g '!node_modules' -g '!dist' -g '!build' -g '!coverage'
rg -n "goal|scope|mvp|roadmap|milestone|agent|runtime|architecture|launch|todo|spec" .
```

Read the relevant files from this scan, prioritizing:

- `AGENT.md`, `.codex/agents/README.md`, `.codex/runtime/**`
- `README*`, `docs/**`, `DESIGN_SPEC/**`, `SPEC*`, `ROADMAP*`, `LAUNCH_CHECKLIST*`
- package or framework manifests such as `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`
- existing tests and CI files

Summarize internally:

- current repo goal and current delivery stage
- source-of-truth documents
- application roots and ownership boundaries
- existing workflow artifacts that must be preserved
- dirty worktree changes that must not be overwritten

## Ask Exactly One Question

After the repo scan, ask one question and only one question before designing the team. The question must compress all missing high-value slots into a single prompt.

Use this shape:

```txt
I infer this repo is aiming at <repo_goal>. For this /ow:team run, what delivery target should the team optimize for, what counts as done for the first milestone, and are there any agent roles/tools that must be included or forbidden?
```

Parameter slots filled by the answer:

- `delivery_target`
- `first_milestone_done_criteria`
- `required_roles`
- `forbidden_roles_or_tools`
- `scope_id` if the user names one
- `validation_bar`

Do not ask follow-up questions. If the answer is incomplete, state assumptions and proceed.

## Design Workflow

Once the scan and the single answer are complete, plan the build in dependency order.

1. Define the scope.
   - Choose a stable `scope_id`, usually `MVP`, `V1`, `MIGRATION`, or a short uppercase slug.
   - Identify source-of-truth artifacts and non-goals.
   - Define application roots and protected roots.

2. Select the team.
   - Always include `orchestrator`.
   - Include implementation agents only for real repo domains, such as frontend, backend, content-schema, data, infra, docs, or testing.
   - Include `tech-prompt-agent` when tasks need formal prompts before implementation.
   - Include `tdd-qa-agent` for executable checks and milestone QA.
   - Include `code-review-agent` for async artifact review.
   - Include `security-review-agent` only when the repo handles secrets, auth, deployment, external input, APIs, dependencies, or infrastructure.
   - Include `git-release-agent` when milestone branches, commits, PRs, or releases are part of the workflow.

3. Define role boundaries.
   - Orchestrator owns runtime state, task transitions, integration, and git checkpoint decisions.
   - Orchestrator uses delegation-first execution: it must assign or resume an eligible subagent before doing implementation, docs, QA, review, or prompt-writing work directly.
   - Direct Orchestrator execution requires an `orchestrator_exception` note in the task state.
   - Implementation agents edit only their `owned_paths` and never commit.
   - Review and security agents write review artifacts and issue logs; they do not edit implementation files.
   - QA agents may write tests and QA reports; they do not commit.
   - Git release agents draft branch, commit, PR, and release text; final git actions remain with the Orchestrator unless the user explicitly changes that boundary.

4. Define agent session topology.
   - Persistent agents stay mounted across related atom tasks and issue-fix loops.
   - Use persistent agents for planning and recurring implementation domains such as frontend, backend, content/schema, data, docs, or infra.
   - Event-driven agents run asynchronously or one-off, then close after handoff.
   - Use event-driven agents for code review, security review, milestone QA, git release drafting, and narrow investigations.
   - Require the Orchestrator to capture every returned `agent_id` after spawn or resume and write it to `AGENT_ROSTER.yaml` and the task entry.
   - Do not leave `agent_id: null` after assignment. Use `legacy_untracked` only for historical tasks that predate roster tracking.

5. Define milestones.
   - Convert the repo goal into dependency-ordered milestones.
   - Keep contracts before broad implementation.
   - Each milestone needs source artifacts, expected artifacts, dependencies, QA gate, acceptance criteria, and estimated atom task range.

6. Define atom task schema.
   - Make tasks small enough for one agent and one ownership boundary.
   - Require `agent_session_policy`, `agent_id`, `preferred_agent_id`, `assigned_at`, `resumed_from_agent_id`, `handoff_required`, `orchestrator_exception`, `status`, `artifact_status`, `review_status`, `qa_status`, `is_output_done`, dependencies, `owned_paths`, `allowed_paths`, checks, and prompt path.
   - Do not treat file existence as completion.

7. Initialize or reconcile `.codex/runtime/`.
   - Use `scripts/init_team_runtime.py` for the base directory and YAML skeleton when possible.
   - Preserve existing runtime files unless the user explicitly asks to regenerate.
   - Add missing archive folders even when runtime state already exists.

8. Write or update coordination artifacts.
   - `AGENT.md`
   - `.codex/agents/README.md`
   - `.codex/agents/<role>.md`
   - `.codex/runtime/**`

9. Validate.
   - Ensure all YAML is parseable or structurally consistent.
   - Ensure every referenced prompt/review/task path has a parent directory.
   - Ensure role docs declare `can_modify_code`, `can_commit`, `owns`, `forbidden_paths`, inputs, and outputs.
   - Ensure every newly assigned task has a non-null `agent_id`.
   - Check `git status --short` and report created or changed files.

## Runtime Initialization

The runtime root must be:

```txt
.codex/runtime/
```

Required hierarchy:

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

Use `archive/` for superseded plans, stale prompts, obsolete reviews, replaced QA evidence, and frozen milestone snapshots. Do not delete historical coordination artifacts unless the user explicitly requests cleanup.

Run the helper from the repo root, adapting arguments to the planned scope:

```bash
python3 .codex/skills/build-team/scripts/init_team_runtime.py \
  --scope-id MVP \
  --scope-title "MVP implementation" \
  --source-artifact AGENT.md \
  --milestone "M01:Repo initialization"
```

If this skill is installed outside the repo, run the script from the skill folder path instead.

## Agent Session Topology

Persistent agents:

- Use for recurring planning and implementation work.
- Keep mounted while the milestone or related issue-fix loop is active.
- Resume the same `agent_id` for related atom tasks before spawning a replacement.
- Send review-discovered fix tasks back to the original persistent implementation agent when ownership still matches.

Event-driven agents:

- Use for async code review, security review, milestone QA, git release drafting, and one-off investigations.
- Allow event-driven review to run against an earlier milestone while persistent implementation agents continue later work, as long as ownership is disjoint.
- Close event-driven agents after handoff unless the Orchestrator records a reason to keep them idle.

The Orchestrator must immediately write every returned subagent `agent_id` to both:

```txt
.codex/runtime/scopes/<scope_id>/AGENT_ROSTER.yaml
.codex/runtime/scopes/<scope_id>/milestones/<milestone_id>/IMPLEMENT_TASKS.yaml
```

New assigned work must not keep `agent_id: null`.

## State Machine

Use this operating flow:

```txt
repo_scan
  -> user_parameter_question
  -> scope_design
  -> runtime_bootstrap
  -> milestone_plan
  -> atom_task_plan
  -> agent_session_topology
  -> prompt_preparation
  -> spawn_or_resume_agent
  -> record_agent_id
  -> implementation_or_event_work
  -> artifact_ready
  -> async_review
  -> issue_fix_loop
  -> resume_original_persistent_agent_for_fix
  -> milestone_qa
  -> git_checkpoint_decision
  -> archive_or_freeze
  -> next_milestone
```

Allowed task `status` values:

```txt
planned
prompted
claimed
in_progress
artifact_ready
review_pending
reviewed
fix_required
qa_ready
done
blocked
archived
```

Allowed `artifact_status` values:

```txt
missing
created
validated
archived
```

Allowed `review_status` values:

```txt
none
pending
passed
issues_found
waived
```

Allowed `qa_status` values:

```txt
not_run
passed
failed
waived
```

Allowed milestone `status` values:

```txt
planned
active
qa
completed
frozen
blocked
deferred
archived
```

## References

Load `references/team-protocol.md` before writing `AGENT.md` or `.codex/agents/*.md`.

Load `references/runtime-schema.md` before writing or reconciling `.codex/runtime/**`.
