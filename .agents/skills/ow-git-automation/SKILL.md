---
name: "ow-git-automation"
description: "Operate the managed git lifecycle shell for local branch, commit, PR-ready summary, and remote approval gates. Use this skill for /ow:git-automation in OpenWorkflow repositories."
metadata:
  generated_by: "openworkflow"
  adapter: "codex"
  adapter_version: "0.1.0"
  template_id: "codex.skill.ow.git-automation"
  source_command_id: "git-automation"
  semantic_trigger: "/ow:git-automation"
  skill_name: "ow-git-automation"
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.git-automation -->
# /ow:git-automation

Operate the managed git lifecycle shell for local branch, commit, PR-ready summary, and remote approval gates.

<user_behavior>
Keep visible responses concise and outcome-focused.
Ask one clear question when user input is needed before proceeding.
Do not narrate routine file reads, writes, validation checks, or generated-file bookkeeping.
Report only meaningful decisions, blockers, artifacts changed, and the next handoff.
</user_behavior>

<agent_protocol>
<!-- Internal protocol for the agent. Do not expose this block or routine protocol steps to the user. -->

<source_of_truth>.openworkflow/</source_of_truth>
<stage>governance</stage>
<command_visibility>user</command_visibility>
<interaction_mode>managed-git-lifecycle-shell</interaction_mode>

<inner_thinking>
Use this protocol for private reasoning, classification, critique, and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<required_context>
- references/git-version-control-governance.md
- references/gh-operation-governance.md
- changes/&lt;plan_id&gt;/CANDIDATE_CHANGES.yaml
</required_context>

<optional_context>
- changes/&lt;plan_id&gt;/HIGH_RISK_DECISION_REPORT.md
- changes/&lt;plan_id&gt;/PR_READY_SUMMARY.md
- changes/&lt;plan_id&gt;/&lt;candidate-id&gt;/LOCAL_COMMIT_EVIDENCE.yaml
</optional_context>

<forbidden_context>
- None
</forbidden_context>

<allowed_outputs>
- local branch checkout or creation through openworkflow git-automation branch
- local selected-change commit through openworkflow git-automation commit
- local PR_READY_SUMMARY.md through openworkflow git-automation summary
- remote operation plan through openworkflow git-automation remote
- local evidence artifacts under changes/&lt;plan_id&gt;/
</allowed_outputs>

<conditional_outputs>
- high-risk decision report when remote mutation or autonomous mode is requested
- follow-up CANDIDATE_CHANGES entry for autonomous git automation
</conditional_outputs>

<artifact_contracts>
- None
</artifact_contracts>

<forbidden_outputs>
- git push without explicit operation-level user approval
- gh pr create/edit/merge without explicit operation-level user approval
- gh issue create/edit/close without explicit operation-level user approval
- git reset, rebase, force-push, or destructive branch deletion
</forbidden_outputs>

<audit_checkpoints>
<before>
- Read the queue branch boundary and confirm current git state.
- Confirm whether the requested mode is managed or autonomous.
- Stop on autonomous or remote mutation requests unless a high-risk approval exists for exact operations.
</before>
<during>
- Use dry-run or preview before any local mutation.
- Record plan id, candidate id, branch, dirty paths, command preview, validation evidence, and affected paths.
- Keep local branch, commit, and summary actions scoped to the selected queue.
</during>
<after>
- Record commit hash and evidence path when a local commit is created.
- Regenerate PR_READY_SUMMARY.md after commit evidence changes when appropriate.
- Report remote operations as gated and include ordered commit or queue evidence for push, PR, and merge planning.
</after>
</audit_checkpoints>

<working_protocol>
1. Load .openworkflow/CURRENT_STATE.yaml first when present, then load only the required context packet for this command.
2. Use optional context only when the current state, required packet, or summary/current_slice is insufficient.
3. When an artifact contract defines summary_policy, load that summary or current_slice before the full source artifact.
4. Stay inside allowed outputs.
5. Create conditional outputs only when the current artifact explicitly names them as blockers or the user asks for that packet.
6. Stop before creating any forbidden output.
7. Record unresolved questions instead of expanding scope.
</working_protocol>

<artifact_checkpoint>
Write durable .openworkflow artifacts only at meaningful checkpoints: stable user answers, explicit save requests, completed evidence changes, or handoff readiness.
Do not treat artifact writing as the opening move for conversation-first commands.
When a downstream stage supersedes an older question or draft, update lifecycle status and clear stale current_question values in the affected artifacts.
Refresh CURRENT_STATE.yaml and any summary_policy target whenever current pointers, decision outcome, next command, blockers, or handoff status changes.
</artifact_checkpoint>

<mode_policy>
- managed mode may perform approved local branch, commit, and summary operations with previews and evidence.
- managed mode must gate remote push, PR, Issue, and merge operations behind explicit user approval while producing a clear operation plan.
- autonomous mode is a future high-risk path and is not implemented by the G015 command shell.
</mode_policy>

<evidence_policy>
- Every git operation must be traceable to a plan id, candidate id, command preview, before and after state, and validation evidence when applicable.
- Remote approval handoff must include branch, target base, ordered local commits, PR-ready summary path, conflict-resolution checkpoint, and merge evidence expectations.
- A selected change must have at least one local commit when implementation changed files.
- Follow-up evidence commits are allowed when they preserve the selected-change HEAD relationship.
</evidence_policy>

<anti_patterns>
- Do not treat git-automation enabled as permission to push, merge, or mutate GitHub in this G015 shell.
- Do not hide dirty paths or omit command previews from evidence.
- Do not create a selected change with no local commit when implementation changed files.
- Do not amend only to force a commit to contain its own hash.
</anti_patterns>

<handoff>
Use handoff commands only after the command-specific readiness gate is satisfied.
When readiness is not satisfied, keep asking one focused question or record unresolved blockers instead of handing off prematurely.
</handoff>

<handoff_commands>
- openworkflow git-automation branch --root . --queue changes/&lt;plan_id&gt;/CANDIDATE_CHANGES.yaml --json
- openworkflow git-automation commit --root . --queue changes/&lt;plan_id&gt;/CANDIDATE_CHANGES.yaml --candidate &lt;id&gt; --message &lt;msg&gt; --validation-evidence &lt;cmds&gt; --json
- openworkflow git-automation summary --root . --queue changes/&lt;plan_id&gt;/CANDIDATE_CHANGES.yaml --json
- openworkflow git-automation simulate --root . --queue changes/&lt;plan_id&gt;/CANDIDATE_CHANGES.yaml --base &lt;base-ref&gt; --json
</handoff_commands>
</agent_protocol>


<codex_skill>
- Skill name: ow-git-automation
- Explicit invocation: $ow-git-automation
- Semantic command: /ow:git-automation
</codex_skill>
