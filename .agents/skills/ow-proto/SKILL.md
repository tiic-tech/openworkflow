---
name: "ow-proto"
description: "Build the smallest prototype needed to validate the current core feature. Use this skill for /ow:proto in OpenWorkflow repositories."
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.proto -->
# /ow:proto

Build the smallest prototype needed to validate the current core feature.

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
<interaction_mode>classified-prototype-creation</interaction_mode>

<inner_thinking>
Use this protocol for private reasoning, classification, critique, and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<required_context>
- .openworkflow/workflow/WORKFLOW_INDEX.yaml
- .openworkflow/audit/ARTIFACT_CONTRACTS.yaml
- .openworkflow/validation/VALIDATION_INDEX.yaml
</required_context>

<optional_context>
- .openworkflow/prototypes/PROTOTYPE_INDEX.yaml
- .openworkflow/validation/**/VALIDATION.yaml
- .openworkflow/vision/VISION_CONTRACT.yaml
- package.json
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
- .openworkflow/prototypes/&lt;id&gt;/review.html
- .openworkflow/prototypes/&lt;id&gt;/evidence/**
- .openworkflow/decisions/DECISION_INDEX.yaml
- .openworkflow/decisions/&lt;id&gt;/DECISION.yaml
- .openworkflow/decisions/&lt;id&gt;/NOTE.md
- .openworkflow/decisions/&lt;id&gt;/review.html
</allowed_outputs>

<conditional_outputs>
- None
</conditional_outputs>

<artifact_contracts>
- prototype_evidence: template .openworkflow/prototypes/_templates/EVIDENCE.yaml, source .openworkflow/prototypes/&lt;id&gt;/EVIDENCE.yaml, note .openworkflow/prototypes/&lt;id&gt;/NOTE.md, review .openworkflow/prototypes/&lt;id&gt;/review.html, load_by_default true, max_yaml_lines 190, summary_policy summary_file at .openworkflow/prototypes/&lt;id&gt;/SUMMARY.yaml
- decision_record: template .openworkflow/decisions/_templates/DECISION.yaml, source .openworkflow/decisions/&lt;id&gt;/DECISION.yaml, note .openworkflow/decisions/&lt;id&gt;/NOTE.md, review .openworkflow/decisions/&lt;id&gt;/review.html, load_by_default true, max_yaml_lines 120, summary_policy current_slice at outcome + rationale + next_command + follow_up_questions
</artifact_contracts>

<forbidden_outputs>
- .openworkflow/specs/**
- .openworkflow/changes/**
- .openworkflow/runtime/**
</forbidden_outputs>

<audit_checkpoints>
<before>
- Confirm validation target exists.
- Classify prototype mode before implementation: visual, interaction, technical feasibility, 3D/material, workflow, or data/logic.
- Detect reference inputs: image, URL, screenshot, HTML/CSS source, existing artifact, or design-system hint.
</before>
<during>
- For visual-first prototypes, extract reference patterns and create a high-fidelity static concept with image generation before HTML unless the user explicitly skips it.
- Derive a compact visual direction and token packet before implementation.
- Build only what answers the validation question and keep one command or URL to run the prototype.
- Verify rendered prototypes with browser and screenshot checks before handoff.
</during>
<after>
- Record reference analysis, static concept evidence, runnable implementation evidence, verification, self-critique, and known limits separately.
- Write a decision audit record internally after prototype evidence changes.
- Write evidence and result artifacts.
- Refresh prototype SUMMARY.yaml when summary_policy is configured and update CURRENT_STATE.yaml with current_prototype, last_decision, and next_command.
- Confirm no design, spec, change, team, persistence, or production hardening was created.
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

<prototype_classification>
- Classify the prototype as visual, interaction, technical feasibility, 3D/material, workflow, or data/logic before choosing tools or writing files.
- Name the validation question, the riskiest assumption, and the smallest success signal.
- If classification is ambiguous, ask one clarifying question; otherwise proceed with the most likely mode and record the assumption.
</prototype_classification>

<reference_extraction>
- When the user provides a target image, URL, screenshot, HTML/CSS, or reference artifact, perform reference-pattern extraction before visual generation or HTML implementation.
- Extract transferable patterns: information architecture, layout rhythm, component grammar, typography posture, palette, motion, interaction details, and anti-patterns to avoid.
- Record reference analysis as evidence by path or URL; do not paste bulky source or screenshots into YAML.
</reference_extraction>

<visual_first_path>
- For visual, product-experience, 3D/material, and aesthetic-sensitive interaction prototypes, default to a high-fidelity static concept before runnable HTML.
- Use image generation as the default first visual pass for composition, mood, material, visual hierarchy, and brand direction unless the user asks to skip image generation.
- Record visual_concept_policy.image_generation as generated, skipped_by_user, or not_applicable; skipped_by_user requires a concrete skip reason.
- Discuss or confirm the static concept before spending implementation effort when the user is actively collaborating; if the user asked for autonomous execution, proceed after the concept establishes clear direction.
- Do not require image generation for data/logic, API, or pure technical feasibility prototypes.
</visual_first_path>

<design_seed_protocol>
- Do not design from a blank aesthetic when a direction, design system, template seed, or reference exists.
- Derive a compact visual packet before implementation: background, surface, foreground, muted, border, accent, display font, body font, radius, spacing, motion, and density.
- Choose domain-appropriate posture: operational tools should be dense and restrained, editorial surfaces can be expressive, games can be playful, and dashboards should avoid marketing hero treatment.
</design_seed_protocol>

<implementation_protocol>
- Implement the smallest runnable artifact that validates the current question, not a production app.
- For HTML prototypes, keep final review surfaces free of designer-only controls unless those controls are part of the validation target.
- Keep generated assets, screenshots, logs, and review HTML in the prototype evidence folder.
</implementation_protocol>

<verification_protocol>
- For rendered HTML or 3D prototypes, run browser verification and capture screenshots or notes for desktop and mobile when practical.
- Verify that the page is nonblank, core interactions work, primary assets render, text does not overlap, and responsive layout remains coherent.
- Record known limits separately from observations so downstream decision work can judge evidence quality.
</verification_protocol>

<self_critique>
- Before handoff, critique the prototype across philosophy, hierarchy, execution, specificity, restraint, accessibility, and responsive behavior.
- Any weak dimension must trigger one repair pass before evidence handoff unless the weakness is intentionally out of scope for the validation question.
- Record critique findings and repairs as compact evidence references or YAML summary fields.
</self_critique>

<internal_decision_audit>
- After creating or revising prototype evidence, write or update a decision audit record without asking the user to invoke /ow:decision.
- Use revise when the user asks for another tuning pass, continue when the user explicitly accepts evidence for design, pivot or stop when explicitly directed, and needs_more_evidence when evidence is inconclusive.
- Keep decision audit output in .openworkflow/decisions/** and do not expose internal bookkeeping as the user-facing workflow step.
</internal_decision_audit>

<anti_patterns>
- Do not jump directly to HTML for a visual-first prototype before a visual direction or static concept unless the user explicitly skips it.
- Do not ignore user-provided reference images, URLs, screenshots, or HTML/CSS source.
- Do not force image generation for logic-only, data-flow, API, or technical feasibility prototypes.
- Do not polish the prototype into production code.
- Do not add persistence unless persistence is the validation question.
- Do not create design, specs, changes, or teams from unaccepted prototype work.
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
