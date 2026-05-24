---
name: "ow-tune"
description: "Refine accepted prototype screens or prompt packs and record the decision audit automatically. Use this skill for /ow:tune in OpenWorkflow repositories."
metadata:
  generated_by: "openworkflow"
  adapter: "codex"
  adapter_version: "0.1.0"
  template_id: "codex.skill.ow.tune"
  source_command_id: "tune"
  semantic_trigger: "/ow:tune"
  skill_name: "ow-tune"
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.tune -->
# /ow:tune

Refine accepted prototype screens or prompt packs and record the decision audit automatically.

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
<interaction_mode>screen-bound-prototype-refinement</interaction_mode>

<inner_thinking>
Use this protocol for private reasoning, classification, critique, and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<required_context>
- .openworkflow/workflow/WORKFLOW_INDEX.yaml
- .openworkflow/audit/ARTIFACT_CONTRACTS.yaml
</required_context>

<optional_context>
- .openworkflow/validation/VALIDATION_INDEX.yaml
- .openworkflow/validation/**/VALIDATION.yaml
- .openworkflow/prototypes/PROTOTYPE_INDEX.yaml
- .openworkflow/prototypes/**/EVIDENCE.yaml
- .openworkflow/prototypes/**/PROTO_PROMPT_PACK.yaml
- .openworkflow/prototypes/**/REFINED_PROTO_PROMPT_PACK.yaml
- .openworkflow/prototypes/**/NOTE.md
- .openworkflow/decisions/DECISION_INDEX.yaml
- .openworkflow/decisions/**/DECISION.yaml
- package.json
</optional_context>

<forbidden_context>
- .openworkflow/runtime/**
- .openworkflow/changes/**
- .openworkflow/specs/**
</forbidden_context>

<allowed_outputs>
- .openworkflow/prototypes/PROTOTYPE_INDEX.yaml
- .openworkflow/prototypes/&lt;id&gt;/REFINED_PROTO_PROMPT_PACK.yaml
- .openworkflow/prototypes/&lt;id&gt;/REFINED_PROTO_PROMPT_PACK.md
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
- Resolve tune target: /ow:tune defaults to the latest approved prototype prompt pack, refined prompt pack, or accepted baseline screen group.
- Require baseline screens, screenshots, screen descriptions, generated images, or an accepted PROTO_PROMPT_PACK plus a tune request.
- Normalize tune inputs before baseline audit: baseline source type, baseline refs, tune request, target form factor, regeneration scope, screen count, locked screens, locked elements, and constraints.
- Record baseline_resolution before auditing: latest approved baseline group id, latest approved baseline ref, lineage, resolution rule, and stale source guard.
- Assign stable source screen ids and target screen ids when the baseline or request does not provide them.
- Load only the baseline prompt pack, current prototype evidence, relevant validation or vision context, and latest decision audit context.
</before>
<during>
- Audit the full baseline screen group before writing refined prompts.
- Carry forward locked screens, locked elements, and accepted improvements from previous tune passes unless the current user request explicitly unlocks them.
- Extract the product system and preserve product thesis, primary loop, component vocabulary, copy tone, AI/system behavior, trust boundaries, and user controls.
- Interpret the tune request as visual refinement, brand alignment, screen-specific correction, feature addition, feature removal, form-factor transformation, group expansion, group compression, IA adaptation, copy/localization adjustment, interaction-state coverage, design-system pass, or selected-screen regeneration.
- Detect conflicts between the tune request, locked elements, product boundaries, non-goals, privacy controls, safety boundaries, and accepted prototype evidence before prompt writing.
- Write MUST_INHERIT, MUST_ADD, MUST_REMOVE, and FLEXIBLE_CHANGE rules globally and per target screen.
- Build a screen_delta_matrix that binds each target screen to source screen ids, preserve/add/remove/transform/flexible rules, and acceptance criteria.
- Bind every refined prompt to target screen id, source screen id(s), generation scope, target form factor, negative constraints, and acceptance criteria.
- Write generation_order and acceptance_checklist so downstream generation agents can run the refined prompt pack without guessing.
- Record decision audit outcome as revise, continue, pivot, stop, or needs_more_evidence.
</during>
<after>
- Write REFINED_PROTO_PROMPT_PACK.yaml, REFINED_PROTO_PROMPT_PACK.md, REVIEW_PLAN.md, and compact EVIDENCE.yaml.
- Write or update the internal decision audit record.
- Refresh prototype SUMMARY.yaml and CURRENT_STATE.yaml after the revision outcome is known.
- Show the user only the tuning result, unresolved question if any, and the next user-facing command.
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

<target_resolution>
- /ow:tune resolves to the latest approved prototype prompt pack, refined prompt pack, or accepted baseline screen group by default.
- /ow:tune:proto is an explicit alias for tuning the current prototype.
- If no baseline prototype exists, return to /ow:proto instead of inventing refinement context.
</target_resolution>

<multi_round_baseline_inheritance>
- Before baseline audit, write baseline_resolution with latest_approved_baseline_group_id, latest_approved_baseline_ref, baseline_lineage, resolution_rule, and stale_source_guard.
- Use the latest approved baseline group by default; only use an older source screen group when the user explicitly names it.
- Write carry_forward with locked_screens, locked_elements, preserved_improvements, explicit_unlocks, and cumulative_drift_guard.
- Carry forward accepted improvements and locked elements across tune rounds unless the tune request explicitly unlocks or removes them.
- Never silently regenerate from stale source screens when a newer accepted tune pass exists.
</multi_round_baseline_inheritance>

<input_normalization>
- Normalize baseline_source_type, baseline_refs, tune_request, target_form_factor, regeneration_scope, target_screen_count, locked_screens, locked_elements, output_language, target_tool, and constraints before audit.
- Assign source ids such as SRC_M01, SRC_W01, or SRC_01 when baseline screens lack stable ids.
- Assign target ids such as MOB_S01, WEB_S01, TAB_S01, or VAR_A_S01 before writing screen-bound prompts.
</input_normalization>

<baseline_screen_audit>
- For each source screen, record screen id, screen name, journey stage, user goal, system state, components, copy tone, represented feature, AI/system behavior, trust controls, visual cues, must-preserve elements, platform artifacts to transform or remove, and assumptions.
- Treat the screen group as one product system, not unrelated images.
- State excluded source screens explicitly when the user limits scope.
</baseline_screen_audit>

<product_system_extraction>
- Extract product thesis, target user, core behavior, primary product loop, brand promise, interaction model, information architecture, design language, component vocabulary, copywriting style, feature system, trust and boundary system, and anti-goals.
- Separate stable_constants from adaptable_variables before interpreting the tune request.
- Preserve product meaning and interaction logic over raw geometry when adapting form factors.
</product_system_extraction>

<tune_request_interpretation>
- Classify the request into visual refinement, brand alignment, screen-specific correction, feature addition, feature removal, form-factor transformation, screen group expansion, screen group compression, layout or IA adaptation, copy/localization adjustment, interaction-state coverage, design-system pass, or selected-screen regeneration.
- Apply conflict priority in this order: latest explicit user request, hard constraints, product vision/non-goals/privacy/safety/trust boundaries, locked screens or elements, baseline product system, original upstream prompt, then agent aesthetic judgment.
- If a request conflicts with a product boundary or locked constraint, record the conflict and generate the closest valid alternative instead of drifting silently.
</tune_request_interpretation>

<inheritance_delta_rules>
- Build MUST_INHERIT, MUST_ADD, MUST_REMOVE, and FLEXIBLE_CHANGE buckets before writing prompts.
- Requested removals must appear in global negative constraints, per-screen negative constraints, and acceptance checks.
- Flexible changes must remain inside the product thesis, brand promise, non-goals, and screen purpose.
- Build screen_delta_matrix rows with target screen id, source screen ids, preserve, add, remove, transform, flexible, and acceptance criteria.
</inheritance_delta_rules>

<screen_manifest>
- Preserve target screen ids across rounds unless screens are deleted, split, merged, or explicitly renamed.
- Every screen prompt must include prompt_id, target_screen_id, screen_name, source_screen_ids, target form factor, generation scope, dependencies, prompt, negative prompt, and acceptance criteria.
- Do not output anonymous prompts that downstream generation cannot map back to screens.
</screen_manifest>

<refined_prompt_pack_output>
- Output Baseline System Summary, Tuning Intent Summary, Inheritance and Delta Rules, Screen Mapping / Prompt Manifest, Global Design System Prompt, Screen-Specific Refined Prompts, Negative Prompt / Exclusion Rules, Generation Order, and Acceptance Checklist.
- Every screen-specific refined prompt must be standalone and bound to a target screen id plus source screen ids.
- Output prompt text only unless a later internal generation stage is explicitly selected; /ow:tune itself does not generate images.
</refined_prompt_pack_output>

<internal_decision_audit>
- Every tune pass must write or update a decision audit record internally.
- Use outcome revise when the user asks for another iteration, continue when the user explicitly accepts the prototype for design, pivot or stop when explicitly directed, and needs_more_evidence when evidence is inconclusive.
- Do not expose /ow:decision as the next manual user step; expose /ow:tune, /ow:design, or /ow:validation as appropriate.
</internal_decision_audit>

<anti_patterns>
- Do not ask the user to manually invoke /ow:decision during a tune loop.
- Do not restart full strategic prototype discovery when a focused refinement is enough.
- Do not tune from one representative screen when the input is a screen group unless the user explicitly limits scope.
- Do not silently drop accepted baseline controls, privacy affordances, memory controls, or non-goals.
- Do not generate HTML, CSS, or runnable app work from /ow:tune.
- Do not create design, specs, changes, or runtime work from unaccepted tune evidence.
- Do not ignore the current validation scope when one is explicitly present and accepted for the prototype.
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
- Skill name: ow-tune
- Explicit invocation: $ow-tune
- Semantic command: /ow:tune
</codex_skill>
