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
- Adopt the co-founder plus senior product-manager perspective engine before running references; the references are tools, not a checklist that proves quality by itself.
- Load skills/build-prototype/references/strategic-prompt-pack-protocol.md, then run references/vision2prompt/01_input_contract.md through 07_quality_rubric.md in order before writing PROTO_PROMPT_PACK.
- Resolve direction_count_policy before writing prompt text; use resolved_count from /ow:proto preflight.
- Prepare to infer product_experience_model before strategic directions; do not start directions from scenario labels or visual style variants.
- Prepare to write dailin-grade long-form prompt paragraphs; direction and screen prompt text must include journey, interaction behavior, system response, trust controls, anti-goals, visual direction, desired user feeling, and concrete content.
- Prepare to run prompt_pack_integrity_gate, prototype_reality_gate, quality_rubric.prompt_executability, and post_validate after prompt assets are complete; do not hand off to /ow:prompt2proto while any required gate is missing or failing.
</before>
<during>
- Apply the OW vision2prompt reference pipeline inside OW artifacts and keep intermediate reasoning outputs compactly represented in PROTO_PROMPT_PACK.yaml or NOTE.md.
- Record the intermediate pipeline outputs: perspective engine, normalized input contract, vision decomposition, candidate strategic hypotheses, product experience model, screen_manifest, prototype prompt schema, output manifest, and quality rubric.
- Each selected direction must carry product_thesis, user_transformation, reason_to_exist, differentiated product form, and pm_judgment before screen prompt anatomy.
- Infer product_experience_model from VISION and VALIDATION: product archetype, primary canvas, information architecture, domain object model, primary task loop, interaction state model, data realism requirements, visual language, anti-generic constraints, and category quality bar.
- Decide whether scenario names are separate strategic product forms or modules, layers, workflows, or states inside one product shell; do not split directions by scenario labels alone.
- Generate more candidate hypotheses than needed and select the resolved direction count for maximum strategic diversity.
- Only select directions that differ by product form, product loop, initiation trigger, interaction model, emotional driver, retention mechanism, validation metric, or main risk.
- Write complete multi-image prompt text for every selected direction with screen_prompts, negative_prompt, example_copy, and acceptance criteria tied to screen_manifest target_screen_id values.
- Populate quality_rubric.prompt_paragraph_quality and prompt_text_manifest.paragraph_quality_status before handoff; fail closed when paragraph_quality_dimensions are missing.
- Do not set prompt_text_manifest.status to ready_for_image_generation until prompt_pack_integrity_gate.status, prototype_reality_gate.status, quality_rubric.prompt_executability.status, and prompt_text_manifest.paragraph_quality_status are pass.
- After prompt text is ready, run the deterministic post_validate gate over strategic_fingerprint dimensions when resolved_count is 2 or more.
- When the user explicitly requested exactly one strategic direction, set post_validate.status: skipped and record the skip reason instead of running diversity comparison.
</during>
<after>
- Write PROTO_PROMPT_PACK.yaml, PROTO_PROMPT_PACK.md, REVIEW_PLAN.md, and EVIDENCE.yaml with product_experience_model, screen_manifest, screen_prompts, prompt_pack_integrity_gate, prototype_reality_gate, quality_rubric, prompt_text_manifest.status ready_for_image_generation, and post_validate status.
- Hand internally to /ow:prompt2proto only when prompt_pack_integrity_gate.status and prototype_reality_gate.status are pass, quality_rubric.prompt_executability.status is pass, prompt_text_manifest.paragraph_quality_status is pass, and post_validate.status is pass or skipped.
- If any readiness gate fails, keep handoff blocked and repair prompt directions through /ow:vision2prompt.
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

<perspective_engine>
- Start from a co-founder plus 15-year senior product-manager perspective before executing the reference pipeline.
- Treat dailin-derived references as tools for judgment, not a checklist whose completion alone proves quality.
- Ask what product should exist, why this prototype matters, which form best expresses the vision, and what user transformation should become visible.
- Every selected direction must include product_thesis, user_transformation, differentiated product form, reason_to_exist, and pm_judgment.
- Reject complete-but-soulless prompt paragraphs that list screens but do not make a product argument.
</perspective_engine>

<vision2prompt_reference_pipeline>
- Run skills/build-prototype/references/strategic-prompt-pack-protocol.md as the governing protocol.
- Load references/vision2prompt/01_input_contract.md to normalize vision, validation, direction count, target tool, fidelity, constraints, and missing inputs.
- Load references/vision2prompt/02_vision_decomposition.md before strategic hypotheses.
- Load references/vision2prompt/03_strategy_hypothesis_generation.md to create 5-8 candidates and select materially distinct directions.
- Load references/vision2prompt/04_product_system_extraction.md before writing screen_manifest or product_experience_model.
- Load references/vision2prompt/05_prototype_prompt_schema.md before writing direction screen_prompts.
- Load references/vision2prompt/06_output_templates.md so YAML remains source of truth and Markdown remains a readable view.
- Load references/vision2prompt/07_quality_rubric.md before marking prompt_text_manifest ready.
</vision2prompt_reference_pipeline>

<prompt_paragraph_quality>
- Before writing prompt text, run the mapped OW equivalents of dailin 01-06 references in order; references are mandatory generation tools, not optional background.
- Every direction prototype_prompt must be a dailin-grade long-form prototype-generation brief, not a short image prompt.
- Every screen_prompts[].prompt must include journey stage, interaction behavior, system response, trust controls, anti-goals, visual direction, desired user feeling, concrete content, and screen-bound acceptance criteria.
- quality_rubric.prompt_paragraph_quality must record pass/fail evidence for product context, target user, journey, screens/components, interaction/system response, concrete content, trust/user control, visual direction, anti-goals, desired user feeling, and the perspective engine.
- prompt_text_manifest.paragraph_quality_status must be pass before /ow:prompt2proto handoff, with paragraph_quality_dimensions listing the dimensions that were checked.
</prompt_paragraph_quality>

<product_experience_model>
- Before directions, write product_experience_model with product_archetype, primary_canvas, information_architecture, domain_object_model, primary_task_loop, interaction_state_model, data_realism_requirements, visual_language, anti_generic_constraints, and category_quality_bar.
- Use the model to preserve target product category reality from VISION-only input.
- Do not treat modules, scenarios, layers, workflows, or interaction states as separate strategic directions unless they imply different product forms or loops.
- Block generic AI dashboard, report-screen, or card-wall drift through anti_generic_constraints and negative_constraints.
</product_experience_model>

<prompt_pack_readiness_gate>
- prompt_text_manifest.status cannot become ready_for_image_generation until prompt_pack_integrity_gate.status is pass.
- prompt_text_manifest.status cannot become ready_for_image_generation until prototype_reality_gate.status is pass.
- prompt_text_manifest.status cannot become ready_for_image_generation until quality_rubric.prompt_executability.status is pass.
- prompt_text_manifest.status cannot become ready_for_image_generation until prompt_text_manifest.paragraph_quality_status is pass.
- prompt_text_manifest.status cannot become ready_for_image_generation until every direction screen_prompt target_screen_id resolves to screen_manifest.
- When a gate fails or is missing, set image_generation.status: not_started and repair through /ow:vision2prompt before handoff.
</prompt_pack_readiness_gate>

<post_validate_gate>
- Run post_validate after prompt assets are ready and before /ow:prompt2proto handoff.
- For resolved_count 2 or more, require post_validate.status: pass before image generation.
- For resolved_count 1 from explicit user input, set post_validate.status: skipped and record why the diversity gate did not run.
- For post_validate.status: fail, repair strategic prompt directions inside /ow:vision2prompt instead of invoking /ow:prompt2proto.
</post_validate_gate>

<anti_patterns>
- Do not expose /ow:vision2prompt as a user-facing workflow step.
- Do not generate prototype images from this stage.
- Do not invent strategy when vision or validation is thin; return control to /ow:proto preflight.
- Do not treat dailin-derived references or YAML field completion as quality when the prompt lacks product thesis, user transformation, reason-to-exist, or design philosophy.
- Do not treat screen_prompts[].prompt as image-generation-ready when it reads like a screen-state instruction instead of a dailin-grade prototype-generation brief.
- Do not hand off to /ow:prompt2proto when post_validate.status is fail or missing for multi-direction prompt packs.
- Do not hand off to /ow:prompt2proto when prompt_pack_integrity_gate, prototype_reality_gate, screen_manifest coverage, or prompt executability is missing or failing.
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
