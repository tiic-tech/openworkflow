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
- None
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
- Load vision and optional validation context; validation is optional but must be consumed when present.
- Record validation_input.mode as vision_only or validation_present; do not silently auto-generate validation.
- Extract the strategic core: target user, behavior change, mechanism, differentiator, boundary conditions, and central uncertainty.
</before>
<during>
- Generate 5-8 strategic prototype hypotheses, then select the strongest prompt directions.
- Make directions differ by product form, initiation trigger, interaction model, emotional driver, retention mechanism, validation metric, or main risk.
- Write concrete high-fidelity image-generation prompts with screens, journey, interactions, AI/system behavior, trust controls, anti-goals, and sample content.
- Recommend the first direction to generate based on risk reduction, observability, feasibility, and closeness to the success signal.
</during>
<after>
- Write PROTO_PROMPT_PACK.yaml, PROTO_PROMPT_PACK.md, REVIEW_PLAN.md, and compact EVIDENCE.yaml.
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

<validation_consumption>
- If validation artifacts are absent but a vision exists, proceed in vision_only mode.
- If VALIDATION.yaml and PROTOTYPE_BRIEF.md exist, consume them and preserve their include/exclude boundaries.
- If validation conflicts with vision, stop for a decision instead of broadening scope silently.
</validation_consumption>

<strategic_prompt_pack>
- Write prompt_pack_type: strategic_proto_prompt_pack.
- Normalize product domain, primary user, current alternative, core pain, behavior change, success signal, differentiator, emotional value, trust constraints, and non-goals.
- Represent strategic_core as target user plus behavior change plus mechanism plus differentiator plus boundary conditions.
- Each direction must include direction_id, name, strategic_hypothesis, validates, main_risk, prototype_prompt, and pm_judgment.
</strategic_prompt_pack>

<image_only_boundary>
- /ow:proto creates prompt packs for high-fidelity static prototype images.
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
- Do not hide missing validation; record vision_only mode when validation artifacts are absent.
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
