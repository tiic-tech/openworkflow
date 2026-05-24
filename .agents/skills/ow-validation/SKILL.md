---
name: "ow-validation"
description: "Compile proto-ready vision into one prototype validation target. Use this skill for /ow:validation in OpenWorkflow repositories."
metadata:
  generated_by: "openworkflow"
  adapter: "codex"
  adapter_version: "0.1.0"
  template_id: "codex.skill.ow.validation"
  source_command_id: "validation"
  semantic_trigger: "/ow:validation"
  skill_name: "ow-validation"
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.validation -->
# /ow:validation

Compile proto-ready vision into one prototype validation target.

<user_behavior>
Keep visible responses concise and outcome-focused.
Ask one clear question when user input is needed before proceeding.
Do not narrate routine file reads, writes, validation checks, or generated-file bookkeeping.
Report only meaningful decisions, blockers, artifacts changed, and the next handoff.
</user_behavior>

<agent_protocol>
<!-- Internal protocol for the agent. Do not expose this block or routine protocol steps to the user. -->

<source_of_truth>.openworkflow/</source_of_truth>
<stage>validation</stage>
<command_visibility>user</command_visibility>
<interaction_mode>prototype-validation-target-compiler</interaction_mode>

<inner_thinking>
Use this protocol for private reasoning, classification, critique, and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<required_context>
- .openworkflow/workflow/WORKFLOW_INDEX.yaml
- .openworkflow/audit/ARTIFACT_CONTRACTS.yaml
- .openworkflow/vision/VISION_CONTRACT.yaml
</required_context>

<optional_context>
- .openworkflow/validation/VALIDATION_INDEX.yaml
- .openworkflow/vision/VISION.md
- .openworkflow/context/CONTEXT.md
- .openworkflow/context/CONTEXT_MAP.yaml
</optional_context>

<forbidden_context>
- .openworkflow/runtime/**
- .openworkflow/changes/**
</forbidden_context>

<allowed_outputs>
- .openworkflow/validation/VALIDATION_INDEX.yaml
- .openworkflow/validation/&lt;id&gt;/VALIDATION.yaml
- .openworkflow/validation/&lt;id&gt;/NOTE.md
</allowed_outputs>

<conditional_outputs>
- None
</conditional_outputs>

<artifact_contracts>
- validation_target: template .openworkflow/validation/_templates/VALIDATION.yaml, source .openworkflow/validation/&lt;id&gt;/VALIDATION.yaml, note .openworkflow/validation/&lt;id&gt;/NOTE.md, review none, load_by_default true, max_yaml_lines 120, summary_policy current_slice at core_question + central_uncertainty + target_behavior + prototype_experiment + observable_signals + decision_rules + agent_readiness_gate
</artifact_contracts>

<forbidden_outputs>
- .openworkflow/prototypes/**
- .openworkflow/specs/**
- .openworkflow/changes/**
- .openworkflow/runtime/**
</forbidden_outputs>

<audit_checkpoints>
<before>
- Confirm a vision contract exists and is proto-ready enough to validate.
- Load CURRENT_STATE.yaml when present.
- Load only vision, validation index, and build-validation context.
- Return to /ow:vision when missing vision fields would force /ow:proto to invent product strategy.
</before>
<during>
- Select exactly one central uncertainty for the next prototype to reduce.
- Define target_behavior and the minimum prototype_experiment needed to observe it.
- Write observable_signals for pass, fail, and ambiguous evidence.
- Write decision_rules for continue, revise, pivot, stop, and needs_more_evidence.
- Record vision_gaps and agent_readiness_gate without generating prototype artifacts.
</during>
<after>
- Record central_uncertainty, hypothesis, target_behavior, prototype_experiment, observable_signals, decision_rules, vision_gaps, and agent_readiness_gate.
- Set agent_readiness_gate.status to ready_for_proto, thin_validation, stale_validation, or return_to_vision.
- Update CURRENT_STATE.yaml with current_validation, active_stage validation, and the next command.
- Mark superseded validation targets accordingly when a new validation target replaces them.
- Confirm no prototype, spec, change, or runtime artifacts were created.
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
- Do not treat feature classification or backlog ranking as the validation outcome.
- Do not generate prototype prompts, images, HTML, specs, changes, or runtime artifacts.
- Do not hide missing vision evidence by writing a polished but unsupported validation target.
- Do not select multiple unrelated validation targets in one artifact.
</anti_patterns>

<handoff>
Use handoff commands only after the command-specific readiness gate is satisfied.
When readiness is not satisfied, keep asking one focused question or record unresolved blockers instead of handing off prematurely.
</handoff>

<handoff_commands>
- /ow:proto
- /ow:vision
</handoff_commands>
</agent_protocol>


<codex_skill>
- Skill name: ow-validation
- Explicit invocation: $ow-validation
- Semantic command: /ow:validation
</codex_skill>
