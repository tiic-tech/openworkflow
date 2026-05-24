---
name: "ow-decision"
description: "Internally record prototype review outcomes for audit. Internal audit skill for /ow:decision in OpenWorkflow repositories."
metadata:
  generated_by: "openworkflow"
  adapter: "codex"
  adapter_version: "0.1.0"
  template_id: "codex.skill.ow.decision"
  source_command_id: "decision"
  semantic_trigger: "/ow:decision"
  skill_name: "ow-decision"
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.decision -->
# /ow:decision

Internally record prototype review outcomes for audit.

<user_behavior>
Keep visible responses concise and outcome-focused.
Ask one clear question when user input is needed before proceeding.
Do not narrate routine file reads, writes, validation checks, or generated-file bookkeeping.
Report only meaningful decisions, blockers, artifacts changed, and the next handoff.
</user_behavior>

<agent_protocol>
<!-- Internal protocol for the agent. Do not expose this block or routine protocol steps to the user. -->

<source_of_truth>.openworkflow/</source_of_truth>
<stage>decision</stage>
<command_visibility>internal</command_visibility>
<interaction_mode>internal-audit-recording</interaction_mode>

<inner_thinking>
Use this protocol for private reasoning, classification, critique, and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<required_context>
- .openworkflow/workflow/WORKFLOW_INDEX.yaml
- .openworkflow/audit/ARTIFACT_CONTRACTS.yaml
- .openworkflow/prototypes/PROTOTYPE_INDEX.yaml
</required_context>

<optional_context>
- .openworkflow/decisions/DECISION_INDEX.yaml
- .openworkflow/prototypes/**/EVIDENCE.yaml
- .openworkflow/validation/**/VALIDATION.yaml
</optional_context>

<forbidden_context>
- .openworkflow/runtime/**
</forbidden_context>

<allowed_outputs>
- .openworkflow/decisions/DECISION_INDEX.yaml
- .openworkflow/decisions/&lt;id&gt;/DECISION.yaml
- .openworkflow/decisions/&lt;id&gt;/NOTE.md
- .openworkflow/decisions/&lt;id&gt;/review.html
- .openworkflow/prototypes/&lt;id&gt;/EVIDENCE.yaml
</allowed_outputs>

<conditional_outputs>
- None
</conditional_outputs>

<artifact_contracts>
- decision_record: template .openworkflow/decisions/_templates/DECISION.yaml, source .openworkflow/decisions/&lt;id&gt;/DECISION.yaml, note .openworkflow/decisions/&lt;id&gt;/NOTE.md, review .openworkflow/decisions/&lt;id&gt;/review.html, load_by_default true, max_yaml_lines 120, summary_policy current_slice at outcome + rationale + next_command + follow_up_questions
</artifact_contracts>

<forbidden_outputs>
- .openworkflow/specs/**
- .openworkflow/changes/**
- .openworkflow/runtime/**
</forbidden_outputs>

<audit_checkpoints>
<before>
- Confirm prototype evidence exists.
- Load only prototype evidence, user feedback summary, and decision index context.
</before>
<during>
- Record audit outcome as continue, revise, pivot, stop, or needs_more_evidence.
- Keep only decision-rich evidence.
</during>
<after>
- Write the decision record.
- Update CURRENT_STATE.yaml last_decision and next_command.
- Set prototype status to accepted only when outcome is continue, revise_requested when outcome is revise, or superseded when pivoted.
- Authorize /ow:design only when outcome is continue.
- Return control to the user-facing proto or tune command.
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

<internal_audit_only>
- /ow:decision is preserved for durable audit records, not as a normal user-facing workflow step.
- Proto and tune flows invoke this audit behavior internally after evidence changes or user review outcomes.
- Visible user handoffs should name /ow:tune, /ow:design, /ow:validation, or /ow:vision instead of asking for manual /ow:decision.
</internal_audit_only>

<anti_patterns>
- Do not infer acceptance without user review or explicit evidence.
- Do not create design, specs, or changes during decision capture.
- Do not leave unresolved prototype evidence as accepted.
- Do not present /ow:decision as a normal user handoff; this is an internal audit command.
</anti_patterns>

<handoff>
Use handoff commands only after the command-specific readiness gate is satisfied.
When readiness is not satisfied, keep asking one focused question or record unresolved blockers instead of handing off prematurely.
</handoff>

<handoff_commands>
- /ow:design
- /ow:tune
- /ow:validation
- /ow:vision
</handoff_commands>
</agent_protocol>


<codex_skill>
- Skill name: ow-decision
- Explicit invocation: $ow-decision
- Semantic command: /ow:decision
</codex_skill>
