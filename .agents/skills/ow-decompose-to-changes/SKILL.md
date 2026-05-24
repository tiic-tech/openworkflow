---
name: "ow-decompose-to-changes"
description: "Create, update, query, or maintain an OpenWorkflow candidate change queue. Use this skill for /ow:decompose-to-changes in OpenWorkflow repositories."
metadata:
  generated_by: "openworkflow"
  adapter: "codex"
  adapter_version: "0.1.0"
  template_id: "codex.skill.ow.decompose-to-changes"
  source_command_id: "decompose-to-changes"
  semantic_trigger: "/ow:decompose-to-changes"
  skill_name: "ow-decompose-to-changes"
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.decompose-to-changes -->
# /ow:decompose-to-changes

Create, update, query, or maintain an OpenWorkflow candidate change queue.

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
<interaction_mode>candidate-queue-decomposition-and-maintenance</interaction_mode>

<inner_thinking>
Use this protocol for private reasoning, classification, critique, and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<required_context>
- references/planning-artifact-contracts.md
- skills/decompose-to-changes/references/decomposition-protocol.md
</required_context>

<optional_context>
- changes/&lt;plan_id&gt;/CANDIDATE_CHANGES.yaml
- changes/&lt;plan_id&gt;/SUMMARY.yaml
- changes/&lt;plan_id&gt;/HIGH_RISK_DECISION_REPORT.md
- docs/OW_DEVELOP_PLAN.md
- docs/OW_DEVELOP_PLAN_Phase2.md
- user-provided planning source
</optional_context>

<forbidden_context>
- None
</forbidden_context>

<allowed_outputs>
- changes/&lt;plan_id&gt;/CANDIDATE_CHANGES.yaml
- changes/&lt;plan_id&gt;/CANDIDATE_CHANGES.md
- changes/&lt;plan_id&gt;/SUMMARY.yaml
- changes/&lt;plan_id&gt;/HIGH_RISK_DECISION_REPORT.md when the next actionable work is high risk
</allowed_outputs>

<conditional_outputs>
- high-risk decision report when a risk: high candidate becomes the next actionable work
- queue maintenance operation entries for add, update, split, merge, defer, block, supersede, restore, or complete
</conditional_outputs>

<artifact_contracts>
- None
</artifact_contracts>

<forbidden_outputs>
- SELECTED_CHANGE.yaml
- ATOM_TASKS.yaml
- IMPLEMENTATION_BRIEF.md
- implementation code changes
- generated .agents/** or .openworkflow/** edits unless selected and explicitly approved
</forbidden_outputs>

<audit_checkpoints>
<before>
- Run git status --short --branch and record branch and dirty-tree state.
- Decide whether this is new decomposition or maintenance of an existing queue.
- Run the queue scope gate: choose one feature, bounded module, command surface, artifact family, or workflow slice for this queue.
- Read existing queue YAML before changing candidate ids or statuses.
</before>
<during>
- Preserve stable candidate ids and branch_boundary when updating an existing queue.
- Record features outside the current queue boundary as deferred refs instead of current candidates.
- Keep candidates focused, dependency-aware, and bounded by owned paths.
- Append an operation entry for every queue maintenance edit.
</during>
<after>
- Refresh CANDIDATE_CHANGES.md as a readable view of YAML source truth.
- Refresh SUMMARY.yaml with candidate count, next recommended candidate, risks, and validation evidence.
- Stop with a high-risk report instead of selecting or implementing risk: high candidates.
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
- Do not select a candidate from decompose-to-changes.
- Do not implement code from decompose-to-changes.
- Do not create a new top-level changes folder for every small candidate inside the same feat boundary.
- Do not turn one CANDIDATE_CHANGES queue into a roadmap bucket for multiple features or a large module family.
- Do not delete historical candidate ids; use status transitions and operation evidence.
</anti_patterns>

<handoff>
Use handoff commands only after the command-specific readiness gate is satisfied.
When readiness is not satisfied, keep asking one focused question or record unresolved blockers instead of handing off prematurely.
</handoff>

<handoff_commands>
- /ow:analyze-changes
- /ow:select-change
</handoff_commands>
</agent_protocol>


<codex_skill>
- Skill name: ow-decompose-to-changes
- Explicit invocation: $ow-decompose-to-changes
- Semantic command: /ow:decompose-to-changes
</codex_skill>
