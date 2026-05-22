---
name: "ow-prompt2proto"
description: "Internally generate high-fidelity prototype image groups from prepared prompt text. Internal audit skill for /ow:prompt2proto in OpenWorkflow repositories."
metadata:
  generated_by: "openworkflow"
  adapter: "codex"
  adapter_version: "0.1.0"
  template_id: "codex.skill.ow.prompt2proto"
  source_command_id: "prompt2proto"
  semantic_trigger: "/ow:prompt2proto"
  skill_name: "ow-prompt2proto"
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.prompt2proto -->
# /ow:prompt2proto

Internally generate high-fidelity prototype image groups from prepared prompt text.

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
<interaction_mode>internal-prompt-text-to-prototype-images</interaction_mode>

<inner_thinking>
Use this protocol for private reasoning, classification, critique, and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<required_context>
- .openworkflow/workflow/WORKFLOW_INDEX.yaml
- .openworkflow/audit/ARTIFACT_CONTRACTS.yaml
- .openworkflow/prototypes/**/PROTO_PROMPT_PACK.yaml
- .openworkflow/prototypes/**/EVIDENCE.yaml
</required_context>

<optional_context>
- .openworkflow/validation/**/VALIDATION.yaml
- .openworkflow/prototypes/PROTOTYPE_INDEX.yaml
- .openworkflow/prototypes/**/NOTE.md
</optional_context>

<forbidden_context>
- .openworkflow/runtime/**
- .openworkflow/changes/**
- .openworkflow/specs/**
</forbidden_context>

<allowed_outputs>
- .openworkflow/prototypes/PROTOTYPE_INDEX.yaml
- .openworkflow/prototypes/&lt;id&gt;/EVIDENCE.yaml
- .openworkflow/prototypes/&lt;id&gt;/NOTE.md
- .openworkflow/prototypes/&lt;id&gt;/images/**
- .openworkflow/decisions/DECISION_INDEX.yaml
- .openworkflow/decisions/&lt;id&gt;/DECISION.yaml
- .openworkflow/decisions/&lt;id&gt;/NOTE.md
</allowed_outputs>

<conditional_outputs>
- None
</conditional_outputs>

<artifact_contracts>
- None
</artifact_contracts>

<forbidden_outputs>
- .openworkflow/prototypes/&lt;id&gt;/review.html
- .openworkflow/specs/**
- .openworkflow/changes/**
- .openworkflow/runtime/**
</forbidden_outputs>

<audit_checkpoints>
<before>
- Run only as an internal stage after /ow:vision2prompt has written prompt_text_manifest.status ready_for_image_generation, prompt_text_manifest.paragraph_quality_status pass, and post_validate.status pass or skipped.
- Load prepared prompt text and verify every selected direction has screen_prompts before image generation.
- Verify prompt_pack_integrity_gate.status: pass, prototype_reality_gate.status: pass, quality_rubric.prompt_executability.status: pass, prompt_text_manifest.paragraph_quality_status: pass, and screen_manifest linkage before image generation.
- Block image generation when prompt_pack_integrity_gate, prototype_reality_gate, prompt executability, paragraph quality, screen_manifest linkage, or post_validate is fail or missing.
</before>
<during>
- Batch-generate high-fidelity prototype images by direction_id and prompt_id.
- Write one metadata record for every generated image with image_id, direction_id, prompt_id, screen_name, path, source_prompt_ref, generator, and status.
- Do not revise product strategy or prompt text during image generation.
</during>
<after>
- Update image_generation.status, generated_images, collection_notes, and internal_pipeline stage prompt2proto outputs.
- Record decision audit internally after image evidence changes.
- Hand the user-facing flow back to /ow:proto for summary and next command.
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

<prompt_pack_readiness_gate>
- Refuse prompt packs whose prompt_pack_integrity_gate.status is not pass.
- Refuse prompt packs whose prototype_reality_gate.status is not pass.
- Refuse prompt packs whose quality_rubric.prompt_executability.status is not pass.
- Refuse prompt packs whose prompt_text_manifest.paragraph_quality_status is not pass.
- Refuse prompt packs whose screen_prompts[].prompt paragraphs omit journey, interaction behavior, system response, trust controls, anti-goals, visual direction, desired user feeling, or concrete content.
- Refuse prompt packs whose direction screen_prompts do not resolve to screen_manifest target_screen_id values.
- When a prompt pack is refused, keep image_generation.status: not_started and hand back to /ow:vision2prompt repair.
</prompt_pack_readiness_gate>

<image_metadata_contract>
- Every generated image must record image_id, direction_id, prompt_id, screen_name, path, and metadata.
- metadata must include source_prompt_ref, generated_at, generator, generation_status, and review_status.
- Images without metadata are not valid prototype evidence.
</image_metadata_contract>

<anti_patterns>
- Do not expose /ow:prompt2proto as a user-facing workflow step.
- Do not start image generation when prompt text is not ready.
- Do not start image generation when prompt_text_manifest.paragraph_quality_status is missing, fail, or unchecked.
- Do not start image generation when prompt_pack_integrity_gate or prototype_reality_gate is missing or failing.
- Do not start image generation when screen prompts are detached from screen_manifest or prompt executability has not passed.
- Do not create HTML, specs, changes, or runtime artifacts.
- Do not allow generated images without per-image metadata.
</anti_patterns>

<handoff>
Use handoff commands only after the command-specific readiness gate is satisfied.
When readiness is not satisfied, keep asking one focused question or record unresolved blockers instead of handing off prematurely.
</handoff>

<handoff_commands>
- /ow:proto
</handoff_commands>
</agent_protocol>


<codex_skill>
- Skill name: ow-prompt2proto
- Explicit invocation: $ow-prompt2proto
- Semantic command: /ow:prompt2proto
</codex_skill>
