---
name: "ow-vision2prompt"
description: "Internally compile ready vision and validation into strategic prototype prompt text. Internal audit skill for /ow:vision2prompt in OpenWorkflow repositories."
metadata:
  generated_by: "openworkflow"
  adapter: "codex"
  adapter_version: "0.1.0"
  template_id: "codex.skill.ow.vision2prompt"
  source_command_id: "vision2prompt"
  semantic_trigger: "/ow:vision2prompt"
  skill_name: "ow-vision2prompt"
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.vision2prompt -->
# /ow:vision2prompt

Internally compile ready vision and validation into strategic prototype prompt text.

<user_behavior>
Keep visible responses concise and outcome-focused.
Ask one clear question when user input is needed before proceeding.
Do not narrate routine file reads, writes, validation checks, or generated-file bookkeeping.
Report only meaningful decisions, blockers, artifacts changed, and the next handoff.
</user_behavior>

<agent_protocol>
<!-- Internal protocol for the agent. Do not expose this block or routine protocol steps to the user. -->

<source_of_truth>.openworkflow/</source_of_truth>
<stage>prototype</stage>
<command_visibility>internal</command_visibility>
<interaction_mode>internal-vision-to-strategic-prompt-text</interaction_mode>

<inner_thinking>
Use this protocol for private reasoning, classification, critique, and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<required_context>
- .openworkflow/workflow/WORKFLOW_INDEX.yaml
- .openworkflow/audit/ARTIFACT_CONTRACTS.yaml
- .openworkflow/vision/VISION_CONTRACT.yaml
- .openworkflow/vision/VISION.md
- .openworkflow/validation/**/VALIDATION.yaml
</required_context>

<optional_context>
- .openworkflow/context/CONTEXT.md
- .openworkflow/context/CONTEXT_MAP.yaml
- .openworkflow/prototypes/PROTOTYPE_INDEX.yaml
</optional_context>

<forbidden_context>
- .openworkflow/runtime/**
- .openworkflow/changes/**
- .openworkflow/specs/**
</forbidden_context>

<allowed_outputs>
- .openworkflow/prototypes/PROTOTYPE_INDEX.yaml
- .openworkflow/prototypes/&lt;id&gt;/PROTO_PROMPT_PACK.yaml
- .openworkflow/prototypes/&lt;id&gt;/PROTO_PROMPT_PACK.md
- .openworkflow/prototypes/&lt;id&gt;/REVIEW_PLAN.md
- .openworkflow/prototypes/&lt;id&gt;/EVIDENCE.yaml
- .openworkflow/prototypes/&lt;id&gt;/NOTE.md
</allowed_outputs>

<conditional_outputs>
- None
</conditional_outputs>

<artifact_contracts>
- None
</artifact_contracts>

<forbidden_outputs>
- .openworkflow/prototypes/&lt;id&gt;/images/**
- .openworkflow/prototypes/&lt;id&gt;/review.html
- .openworkflow/specs/**
- .openworkflow/changes/**
- .openworkflow/runtime/**
</forbidden_outputs>

<audit_checkpoints>
<before>
- Run only as an internal stage after /ow:proto preflight has confirmed vision and validation are ready.
- Consume durable VISION and VALIDATION artifacts; do not ask broad product questions or generate images.
- Resolve direction_count_policy before writing prompt text; use resolved_count from /ow:proto preflight.
</before>
<during>
- Apply the vision_to_strategic_prototype_prompt method inside OW artifacts.
- Generate more candidate hypotheses than needed and select the resolved direction count for maximum strategic diversity.
- Write complete multi-image prompt text for every selected direction with screen_prompts and acceptance criteria.
</during>
<after>
- Write PROTO_PROMPT_PACK.yaml, PROTO_PROMPT_PACK.md, REVIEW_PLAN.md, and EVIDENCE.yaml with prompt_text_manifest.status ready_for_image_generation.
- Record internal_pipeline stage vision2prompt status and outputs.
- Do not generate images; hand internally to /ow:prompt2proto.
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

<internal_command_boundary>
- /ow:vision2prompt is internal and is invoked by /ow:proto, not by the user.
- Its only job is strategic prompt text generation from ready vision and validation artifacts.
- Its output must be ready for /ow:prompt2proto consumption.
</internal_command_boundary>

<anti_patterns>
- Do not expose /ow:vision2prompt as a user-facing workflow step.
- Do not generate prototype images from this stage.
- Do not invent strategy when vision or validation is thin; return control to /ow:proto preflight.
- Do not create HTML, specs, changes, or runtime artifacts.
</anti_patterns>

<handoff>
Use handoff commands only after the command-specific readiness gate is satisfied.
When readiness is not satisfied, keep asking one focused question or record unresolved blockers instead of handing off prematurely.
</handoff>

<handoff_commands>
- /ow:prompt2proto
</handoff_commands>
</agent_protocol>


<codex_skill>
- Skill name: ow-vision2prompt
- Explicit invocation: $ow-vision2prompt
- Semantic command: /ow:vision2prompt
</codex_skill>
