---
name: "ow-build-proto-prompt"
description: "Internally compile ready vision and validation into ready prototype prompt packs. Internal audit skill for /ow:build-proto-prompt in OpenWorkflow repositories."
metadata:
  generated_by: "openworkflow"
  adapter: "codex"
  adapter_version: "0.1.0"
  template_id: "codex.skill.ow.build-proto-prompt"
  source_command_id: "build-proto-prompt"
  semantic_trigger: "/ow:build-proto-prompt"
  skill_name: "ow-build-proto-prompt"
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.build-proto-prompt -->
# /ow:build-proto-prompt

Internally compile ready vision and validation into ready prototype prompt packs.

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
<interaction_mode>internal-build-proto-prompt-pack-compiler</interaction_mode>

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
- skills/build-proto-prompt/SKILL.md
- skills/build-proto-prompt/references/prompt-pack-compiler-protocol.md
- skills/build-proto-prompt/references/output-boundary.md
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
- Run only as an internal prompt-pack compiler stage after /ow:proto preflight has confirmed vision and validation are ready.
- Load skills/build-proto-prompt/SKILL.md and its references before compiling PROTO_PROMPT_PACK.
- Adopt the Co-Founder plus Chief PM / senior product strategist perspective engine before generating directions.
- Resolve direction_count_policy before writing prompt text; do not silently default the direction count.
- Prepare to infer product_experience_model before strategic directions, including product archetype, primary canvas, information architecture, domain objects, state model, data realism, visual language, anti-generic constraints, and category quality bar.
- Prepare to write dailin-grade long-form prompt paragraphs; prompt text must include journey, interaction behavior, system response, trust controls, anti-goals, visual direction, desired user feeling, and concrete content.
</before>
<during>
- Compile durable vision and validation into strategic_core, prototype_brief, product_experience_model, screen_manifest, global_design_system_prompt, directions, screen_prompts, review_plan, and readiness gates.
- Each selected direction must carry product_thesis, user_transformation, differentiated product form, reason_to_exist, and pm_judgment before screen prompt anatomy.
- Decide whether source concepts are separate strategic product forms or modules, layers, workflows, or states inside one product shell; do not split directions by scenario labels alone.
- Write complete multi-image prompt text for every selected direction with screen_prompts, negative_prompt, example_copy, and acceptance criteria tied to screen_manifest target_screen_id values.
- Populate prompt_pack_integrity_gate, prototype_reality_gate, quality_rubric.prompt_executability, quality_rubric.prompt_paragraph_quality, prompt_text_manifest.paragraph_quality_status, and post_validate before handoff.
- Keep image_generation.status: not_started while this compiler stage runs.
</during>
<after>
- Write PROTO_PROMPT_PACK.yaml, PROTO_PROMPT_PACK.md, REVIEW_PLAN.md, and EVIDENCE.yaml with prompt_text_manifest.status ready_for_image_generation only when all readiness gates pass.
- Hand internally to /ow:prompt2proto only when prompt_pack_integrity_gate.status and prototype_reality_gate.status are pass, quality_rubric.prompt_executability.status is pass, prompt_text_manifest.paragraph_quality_status is pass, and post_validate.status is pass or skipped.
- If any readiness gate fails, keep handoff blocked and repair prompt directions through /ow:build-proto-prompt.
- Do not generate images; do not consume provider image output or prototype review artifacts.
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
- /ow:build-proto-prompt is internal and is invoked by /ow:proto orchestration, not by the user.
- Its only job is prompt-pack compilation from ready vision and validation artifacts.
- Its output must be ready for prompt2proto consumption.
- Keep /ow:vision2prompt compatibility until a later migration candidate explicitly removes or aliases it.
</internal_command_boundary>

<prompt_pack_compiler_role>
- Start from a Co-Founder plus Chief PM / senior product strategist perspective before executing the prompt-pack compiler references.
- Ask what product should exist, why this prototype matters, which form best expresses the vision, and what user transformation should become visible.
- Every selected direction must include product_thesis, user_transformation, differentiated product form, reason_to_exist, and pm_judgment.
- Reject complete-but-soulless prompt paragraphs that list screens but do not make a product argument.
</prompt_pack_compiler_role>

<source_skill_reference>
- Load skills/build-proto-prompt/SKILL.md as the source behavior for this command.
- Load skills/build-proto-prompt/references/prompt-pack-compiler-protocol.md before writing prompt-pack outputs.
- Load skills/build-proto-prompt/references/output-boundary.md before handoff.
- The legacy vision2prompt references may be reused as detailed prompt-generation tools until the compiler references are fully split.
</source_skill_reference>

<prompt_pack_readiness_gate>
- prompt_text_manifest.status cannot become ready_for_image_generation until prompt_pack_integrity_gate.status is pass.
- prompt_text_manifest.status cannot become ready_for_image_generation until prototype_reality_gate.status is pass.
- prompt_text_manifest.status cannot become ready_for_image_generation until quality_rubric.prompt_executability.status is pass.
- prompt_text_manifest.status cannot become ready_for_image_generation until prompt_text_manifest.paragraph_quality_status is pass.
- prompt_text_manifest.status cannot become ready_for_image_generation until every direction screen_prompt target_screen_id resolves to screen_manifest.
- When a gate fails or is missing, set image_generation.status: not_started and repair through /ow:build-proto-prompt before handoff.
</prompt_pack_readiness_gate>

<downstream_boundary>
- Do not generate images.
- Do not perform human visual review.
- Do not claim visual reference parity.
- Do not create proto2html, specs, changes, or runtime artifacts.
- Do not narrow build-prototype behavior in this command-boundary candidate.
</downstream_boundary>

<anti_patterns>
- Do not expose /ow:build-proto-prompt as a user-facing workflow step.
- Do not generate prototype images from this stage.
- Do not consume provider image output, human visual review, visual parity scores, proto2html artifacts, specs, changes, or runtime state.
- Do not invent strategy when vision or validation is thin; return control to /ow:proto preflight.
- Do not treat YAML field completion as quality when the prompt lacks product thesis, user transformation, reason-to-exist, or design philosophy.
- Do not hand off to /ow:prompt2proto when post_validate.status is fail or missing for multi-direction prompt packs.
- Do not hand off to /ow:prompt2proto when prompt_pack_integrity_gate, prototype_reality_gate, screen_manifest coverage, paragraph quality, or prompt executability is missing or failing.
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
- Skill name: ow-build-proto-prompt
- Explicit invocation: $ow-build-proto-prompt
- Semantic command: /ow:build-proto-prompt
</codex_skill>
