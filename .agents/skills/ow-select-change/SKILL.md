---
name: "ow-select-change"
description: "Select one implementable candidate change and create implementation-ready planning artifacts. Use this skill for /ow:select-change in OpenWorkflow repositories."
metadata:
  generated_by: "openworkflow"
  adapter: "codex"
  adapter_version: "0.1.0"
  template_id: "codex.skill.ow.select-change"
  source_command_id: "select-change"
  semantic_trigger: "/ow:select-change"
  skill_name: "ow-select-change"
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.select-change -->
# /ow:select-change

Select one implementable candidate change and create implementation-ready planning artifacts.

<user_behavior>
Keep visible responses concise and outcome-focused.
Ask one clear question when user input is needed before proceeding.
Do not narrate routine file reads, writes, validation checks, or generated-file bookkeeping.
Report only meaningful decisions, blockers, artifacts changed, and the next handoff.
</user_behavior>

<agent_protocol>
<!-- Internal protocol for the agent. Do not expose this block or routine protocol steps to the user. -->

<source_of_truth>.openworkflow/</source_of_truth>
<stage>planning</stage>
<command_visibility>user</command_visibility>
<interaction_mode>single-candidate-selection-and-atomization</interaction_mode>

<inner_thinking>
Use this protocol for private reasoning, classification, critique, and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<required_context>
- references/planning-artifact-contracts.md
- skills/select-change/references/selection-protocol.md
- changes/&lt;plan_id&gt;/CANDIDATE_CHANGES.yaml
</required_context>

<optional_context>
- changes/&lt;plan_id&gt;/CANDIDATE_CHANGES.md
- changes/&lt;analysis_id&gt;/CHANGE_ANALYSIS.yaml
- changes/&lt;plan_id&gt;/SUMMARY.yaml
- changes/&lt;plan_id&gt;/HIGH_RISK_DECISION_REPORT.md
</optional_context>

<forbidden_context>
- None
</forbidden_context>

<allowed_outputs>
- changes/&lt;plan_id&gt;/&lt;candidate-id&gt;-&lt;slug&gt;/SELECTED_CHANGE.yaml
- changes/&lt;plan_id&gt;/&lt;candidate-id&gt;-&lt;slug&gt;/ATOM_TASKS.yaml
- changes/&lt;plan_id&gt;/&lt;candidate-id&gt;-&lt;slug&gt;/IMPLEMENTATION_BRIEF.md
- selection and operation entries in changes/&lt;plan_id&gt;/CANDIDATE_CHANGES.yaml
- refreshed changes/&lt;plan_id&gt;/CANDIDATE_CHANGES.md
</allowed_outputs>

<conditional_outputs>
- rejected alternatives copied from CHANGE_ANALYSIS.yaml when consuming cross-queue analysis
- targeted readiness report when the user asks to inspect a candidate without selecting it
</conditional_outputs>

<artifact_contracts>
- None
</artifact_contracts>

<forbidden_outputs>
- implementation code changes
- local commits, stashes, resets, branch switches, or destructive git operations
- risk: high selection without explicit approval of a concrete option from HIGH_RISK_DECISION_REPORT.md
- generated .agents/** or .openworkflow/** edits unless selected and explicitly approved
</forbidden_outputs>

<audit_checkpoints>
<before>
- Run git status --short --branch and compare current branch with queue_policy.branch_boundary.
- Check dirty-tree state and stop if unrelated work would contaminate the selected change.
- Confirm candidate dependencies, readiness, risk, owned paths, validation, and acceptance.
</before>
<during>
- Select exactly one candidate inside the owning queue folder.
- Re-check high-risk approval before writing selection artifacts for risk: high candidates.
- Keep atom tasks small enough for one focused implementation pass.
</during>
<after>
- Update candidate status to selected and append a selection operation.
- Refresh the readable Markdown queue view.
- Stop before implementation unless the user explicitly asks to continue.
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



<anti_patterns>
- Do not silently select a high-risk candidate.
- Do not select on the wrong branch without an explicit planning-only exception.
- Do not mark the candidate done from select-change.
- Do not create a new top-level changes folder for a candidate inside an existing feat queue.
</anti_patterns>

<handoff>
Use handoff commands only after the command-specific readiness gate is satisfied.
When readiness is not satisfied, keep asking one focused question or record unresolved blockers instead of handing off prematurely.
</handoff>

<handoff_commands>
- /ow:change
- /ow:team
- /ow:git-automation
</handoff_commands>
</agent_protocol>


<codex_skill>
- Skill name: ow-select-change
- Explicit invocation: $ow-select-change
- Semantic command: /ow:select-change
</codex_skill>
