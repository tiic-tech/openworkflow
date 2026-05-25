---
name: "ow-proto"
description: "Create image-first strategic prototype prompt packs from vision or validation context. Use this skill for /ow:proto in OpenWorkflow repositories."
metadata:
  generated_by: "openworkflow"
  adapter: "codex"
  adapter_version: "0.1.0"
  template_id: "codex.skill.ow.proto"
  source_command_id: "proto"
  semantic_trigger: "/ow:proto"
  skill_name: "ow-proto"
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.proto -->
# /ow:proto

Create image-first strategic prototype prompt packs from vision or validation context.

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
<command_visibility>user</command_visibility>
<interaction_mode>image-first-strategic-proto-prompt-pack</interaction_mode>

<inner_thinking>
Use this protocol for private reasoning, classification, critique, and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<required_context>
- .openworkflow/workflow/WORKFLOW_INDEX.yaml
- .openworkflow/audit/ARTIFACT_CONTRACTS.yaml
</required_context>

<optional_context>
- .openworkflow/vision/VISION_CONTRACT.yaml
- .openworkflow/vision/VISION.md
- .openworkflow/validation/VALIDATION_INDEX.yaml
- .openworkflow/validation/**/VALIDATION.yaml
- .openworkflow/prototypes/PROTOTYPE_INDEX.yaml
- .openworkflow/context/CONTEXT.md
- .openworkflow/context/CONTEXT_MAP.yaml
- package.json
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
- .openworkflow/prototypes/&lt;id&gt;/images/**
- .openworkflow/decisions/DECISION_INDEX.yaml
- .openworkflow/decisions/&lt;id&gt;/DECISION.yaml
- .openworkflow/decisions/&lt;id&gt;/NOTE.md
</allowed_outputs>

<conditional_outputs>
- .openworkflow/validation/VALIDATION_INDEX.yaml
- .openworkflow/validation/&lt;id&gt;/VALIDATION.yaml
- .openworkflow/validation/&lt;id&gt;/NOTE.md
</conditional_outputs>

<artifact_contracts>
- prototype_evidence: template .openworkflow/prototypes/_templates/EVIDENCE.yaml, source .openworkflow/prototypes/&lt;id&gt;/EVIDENCE.yaml, note .openworkflow/prototypes/&lt;id&gt;/NOTE.md, review none, load_by_default true, max_yaml_lines 190, summary_policy summary_file at .openworkflow/prototypes/&lt;id&gt;/SUMMARY.yaml
- decision_record: template .openworkflow/decisions/_templates/DECISION.yaml, source .openworkflow/decisions/&lt;id&gt;/DECISION.yaml, note .openworkflow/decisions/&lt;id&gt;/NOTE.md, review .openworkflow/decisions/&lt;id&gt;/review.html, load_by_default true, max_yaml_lines 120, summary_policy current_slice at outcome + rationale + next_command + follow_up_questions
</artifact_contracts>

<forbidden_outputs>
- .openworkflow/prototypes/&lt;id&gt;/review.html
- .openworkflow/specs/**
- .openworkflow/changes/**
- .openworkflow/runtime/**
</forbidden_outputs>

<audit_checkpoints>
<before>
- Act as the user-facing orchestrator for the internal proto pipeline: proto-preflight, /ow:build-proto-prompt or compatible /ow:vision2prompt compiler path, then /ow:prompt2proto/build-prototype consumption.
- Load vision and current validation context; validation is required before prototype generation.
- If current_validation is missing, auto-run /ow:validation first and write VALIDATION.yaml, NOTE.md, and VALIDATION_INDEX.yaml with trigger.mode agent_auto, requested_command /ow:proto, and reason missing_current_validation.
- Proceed only after validation_input.mode can reference a durable validation artifact; do not use ephemeral vision_only validation context.
- Verify vision and validation artifact quality before prompt work; if either is missing, thin, stale, or not strong enough for high-quality prototype prompts, route back to /ow:vision with focused follow-up questions instead of generating prompts.
- If the user has not specified the number of strategically different prototype directions, askUserQuestion for the count; use 3 only when the user explicitly delegates that decision to the agent.
- Extract the strategic core: target user, behavior change, mechanism, differentiator, boundary conditions, and central uncertainty.
</before>
<during>
- Before strategic directions, require /ow:build-proto-prompt or compatible /ow:vision2prompt compiler path to infer product_experience_model: product archetype, primary canvas, information architecture, domain objects, task loop, interaction states, data realism, visual language, and anti-generic constraints.
- Before /ow:prompt2proto, require prototype_system_contract so stable app shell, navigation, data vocabulary, object anatomy, action bar, audit pattern, copy tone, and allowed deltas are explicit.
- Treat scenarios such as planning, incident, or capacity as possible modules, layers, workflows, or states inside one product shell unless they truly imply different product forms.
- Internally trigger /ow:build-proto-prompt or compatible /ow:vision2prompt compiler path to generate 5-8 strategic prototype hypotheses, select the resolved direction count, and write all multi-direction, multi-image prompt text.
- Do not internally trigger /ow:prompt2proto until prompt_text_manifest.status is ready_for_image_generation and every selected direction has concrete screen prompts.
- Do not internally trigger /ow:prompt2proto until prototype_system_contract exists, prompt_pack_integrity_gate.status and prototype_reality_gate.status are pass and quality_rubric.prompt_executability is pass.
- Do not internally trigger /ow:prompt2proto until post_validate.status is pass for resolved_count 2 or more, or skipped when the user explicitly requested exactly one strategic direction.
- If post_validate.status is fail, or if prompt_pack_integrity_gate, prototype_reality_gate, prompt executability, prototype_system_contract, paragraph quality, or philosophy readiness fails, route back through /ow:build-proto-prompt or compatible /ow:vision2prompt prompt repair instead of starting image generation.
- After prompt_text_manifest.status is ready_for_image_generation and post_validate.status is pass or skipped, Batch-generate prototype images by internally triggering /ow:prompt2proto/build-prototype only after ready prompt-pack artifacts exist; build-prototype consumes the ready pack and must not recompile vision into prompt text.
- Recommend the first direction to generate based on risk reduction, observability, feasibility, and closeness to the success signal.
</during>
<after>
- Write PROTO_PROMPT_PACK.yaml, PROTO_PROMPT_PACK.md, REVIEW_PLAN.md, compact EVIDENCE.yaml, prompt_text_manifest, and image_generation collection state.
- Record review evidence and a decision audit record internally after prompt-pack evidence changes.
- Refresh prototype SUMMARY.yaml when summary_policy is configured and update CURRENT_STATE.yaml with current_prototype, last_decision, and next_command.
- Confirm no HTML, design, spec, change, team, persistence, or production hardening was created.
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

<internal_proto_pipeline>
- /ow:proto is the only user-facing command in this chain; /ow:build-proto-prompt, /ow:vision2prompt compatibility, and /ow:prompt2proto are internal commands.
- /ow:vision2prompt and /ow:prompt2proto are internal commands; do not expose them as normal user-facing handoffs from /ow:proto.
- Run proto-preflight first, then /ow:build-proto-prompt or compatible /ow:vision2prompt compiler path, then /ow:prompt2proto/build-prototype consumption.
- Record internal_pipeline.stages with stage ids proto-preflight, build-proto-prompt or vision2prompt-compatible compiler, and prompt2proto in EVIDENCE.yaml.
- Do not expose /ow:build-proto-prompt, /ow:vision2prompt, or /ow:prompt2proto as normal user-facing handoffs.
</internal_proto_pipeline>

<validation_consumption>
- If validation artifacts are absent but a vision exists, auto-run /ow:validation first and persist VALIDATION.yaml, NOTE.md, and VALIDATION_INDEX.yaml.
- Auto validation must set trigger.mode: agent_auto, trigger.requested_command: /ow:proto, and trigger.reason: missing_current_validation.
- If VALIDATION.yaml exists, consume it and preserve central_uncertainty, prototype_experiment, observable_signals, decision_rules, and include/exclude boundaries.
- Before prompt generation, verify that both VISION.md or VISION_CONTRACT.yaml and VALIDATION.yaml are high-quality enough to produce high-quality prototype prompts.
- If source quality is insufficient, record preflight_quality_gate.can_proceed false and hand back to /ow:vision with targeted missing questions.
- If validation conflicts with vision, stop for a decision instead of broadening scope silently.
</validation_consumption>

<preflight_quality_gate>
- Set preflight_quality_gate.vision_status and validation_status to missing, thin, or ready before prompt work.
- Set preflight_quality_gate.can_proceed true only when vision and validation can support high-quality prototype prompt generation without agent invention.
- When can_proceed is false, set next_command_when_blocked: /ow:vision and include required_followup_questions for the user's supplemental interview.
</preflight_quality_gate>

<direction_count_policy>
- If the user did not specify NUMBER_OF_TYPES or a strategic direction count, askUserQuestion before generating prompt directions.
- If the user answers with a count, set source: user_input and resolved_count to that number.
- If the user delegates direction count to the agent, set source: agent_default_after_user_delegation and resolved_count: 3.
- Do not silently default to 3 before the user either provides a count or delegates the choice.
</direction_count_policy>

<strategic_prompt_pack>
- Write prompt_pack_type: strategic_proto_prompt_pack.
- Normalize product domain, primary user, usage context, current alternative, core pain, desired behavior change, strongest success signal, core differentiator, emotional value, functional value, trust requirements, privacy requirements, non-goals, future opportunities, and validation target.
- Represent strategic_core as target user plus behavior change plus mechanism plus differentiator plus boundary conditions.
- Write product_experience_model before directions: product_archetype, primary_canvas, information_architecture, domain_object_model, primary_task_loop, interaction_state_model, data_realism_requirements, visual_language, anti_generic_constraints, and category_quality_bar.
- Use product_experience_model to decide whether source concepts are separate strategic directions or modules, scenarios, layers, states, or workflows inside one product shell.
- Convert non-goals and category anti-patterns into negative_constraints; explicitly block generic AI dashboards, consulting-report layouts, and card walls when the target product category implies a richer product shell.
- Generate more candidate hypotheses than needed, then select the resolved direction count with maximum strategic diversity.
- Each direction must include direction_id, name, strategic_hypothesis, validates, main_risk, distinctness_rationale, prototype_prompt, screen_prompts, and pm_judgment.
</strategic_prompt_pack>

<prompt_text_manifest>
- Write complete prompt text for every selected direction before invoking image generation.
- Each direction should include multi-image screen prompt text with prompt_id, screen_name, image_role, prompt, and acceptance_criteria.
- Set prompt_text_manifest.status: ready_for_image_generation only after every selected direction has concrete, directly executable prompt text and screen-bound prompt refs.
- Do not set prompt_text_manifest.status: ready_for_image_generation when prompt_pack_integrity_gate, prototype_reality_gate, screen_manifest coverage, or quality_rubric.prompt_executability is missing or failing.
</prompt_text_manifest>

<prompt_pack_handoff_gate>
- Before /ow:prompt2proto, require prompt_pack_integrity_gate.status: pass.
- Before /ow:prompt2proto, require prototype_reality_gate.status: pass.
- Before /ow:prompt2proto, require screen_manifest entries and direction screen_prompts to resolve by target_screen_id.
- Before /ow:prompt2proto, require quality_rubric.prompt_executability.status: pass.
- If any required gate fails or is missing, keep image_generation.status: not_started and repair inside /ow:vision2prompt.
</prompt_pack_handoff_gate>

<post_validate_gate>
- Run prompt asset post-validation after prompt_text_manifest.status is ready_for_image_generation and before /ow:prompt2proto.
- Require post_validate.status: pass when direction_count_policy.resolved_count is 2 or more.
- Set post_validate.status: skipped only when direction_count_policy.resolved_count is 1 because the user explicitly requested exactly one strategic direction.
- Do not start image_generation or invoke /ow:prompt2proto when post_validate.status is fail; route back to /ow:vision2prompt prompt repair.
</post_validate_gate>

<image_generation>
- After prompt_text_manifest.status is ready_for_image_generation and post_validate.status is pass or skipped, Batch-generate prototype images from the prepared prompt text.
- Generate image groups by direction and screen prompt; keep each generated image linked to direction_id and prompt_id.
- Record image_generation.status, batch_strategy, generated_images, and collection_notes in EVIDENCE.yaml.
- Do not use image generation as a substitute for missing strategy or incomplete prompt text.
</image_generation>

<image_only_boundary>
- /ow:proto creates prompt packs and image groups for high-fidelity static prototype images.
- Do not write HTML, CSS, runnable prototypes, production code, deployment config, auth, persistence, or team runtime.
- Hand off to /ow:tune when generated images or accepted baseline screens need refinement.
</image_only_boundary>

<review_evidence>
- Record selected direction, user feedback, accepted elements, rejected elements, tune requests, and recommendation.
- Use recommendation continue, tune, pivot, stop, or needs_more_evidence.
- Reference generated images by path when present; do not embed large binary evidence.
</review_evidence>

<internal_decision_audit>
- After creating or revising prototype evidence, write or update a decision audit record without asking the user to invoke /ow:decision.
- Use revise when the user asks for another tuning pass, continue when the user explicitly accepts evidence for design, pivot or stop when explicitly directed, and needs_more_evidence when evidence is inconclusive.
- Keep decision audit output in .openworkflow/decisions/** and do not expose internal bookkeeping as the user-facing workflow step.
</internal_decision_audit>

<anti_patterns>
- Do not generate HTML, CSS, local runnable apps, or implementation tasks from /ow:proto.
- Do not treat visual style variants as strategic directions.
- Do not hide missing validation or proceed in ephemeral vision_only mode.
- Do not convert prompt packs into production specs or change backlogs.
- Do not create design, specs, changes, or teams from unaccepted prompt-pack evidence.
- Do not ask the user to manually invoke /ow:decision after prototype work; record the decision audit internally.
</anti_patterns>

<handoff>
Use handoff commands only after the command-specific readiness gate is satisfied.
When readiness is not satisfied, keep asking one focused question or record unresolved blockers instead of handing off prematurely.
</handoff>

<handoff_commands>
- /ow:tune
- /ow:design
- /ow:validation
</handoff_commands>
</agent_protocol>


<codex_skill>
- Skill name: ow-proto
- Explicit invocation: $ow-proto
- Semantic command: /ow:proto
</codex_skill>
