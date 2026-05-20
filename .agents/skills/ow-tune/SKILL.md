---
name: "ow-tune"
description: "Revise the current prototype and record the decision audit automatically. Use this skill for /ow:tune in OpenWorkflow repositories."
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.tune -->
# /ow:tune

Revise the current prototype and record the decision audit automatically.

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
<interaction_mode>prototype-revision-orchestration</interaction_mode>

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
- Resolve tune target: /ow:tune and /ow:tune:proto default to the current prototype.
- If no current prototype exists but a current validation target exists, orchestrate prototype creation through /ow:proto behavior.
- Load only the current prototype evidence, relevant validation target, and latest decision audit context.
</before>
<during>
- Apply exactly one focused revision loop from user feedback.
- Preserve M16 prototype evidence separation for concept, implementation, verification, self-critique, and known limits.
- Run required verification for changed rendered artifacts.
- Record decision audit outcome as revise, continue, pivot, stop, or needs_more_evidence.
</during>
<after>
- Write updated prototype evidence and review artifacts.
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
- /ow:tune resolves to the current prototype by default.
- /ow:tune:proto is an explicit alias for tuning the current prototype.
- /ow:tune:&lt;target&gt; reserves routing for explicit future artifact targets; in M17, implement prototype target behavior and record unsupported targets as unresolved.
</target_resolution>

<proto_orchestration>
- When no current prototype exists but a current validation target exists, use /ow:proto behavior to create the first prototype evidence before tuning.
- When a current prototype exists, revise it in place unless the user explicitly requests a new prototype branch.
- Keep the revision scoped to the user's feedback and the active validation question.
</proto_orchestration>

<revision_protocol>
- Treat user feedback as the tune brief; ask one clarifying question only when the requested revision is ambiguous or unsafe.
- Update the smallest artifact set needed: prototype evidence, note, review surface, and evidence files.
- Preserve visual concept policy, evidence refs, verification, and self-critique integrity from the prototype evidence contract.
</revision_protocol>

<internal_decision_audit>
- Every tune pass must write or update a decision audit record internally.
- Use outcome revise when the user asks for another iteration, continue when the user explicitly accepts the prototype for design, pivot or stop when explicitly directed, and needs_more_evidence when evidence is inconclusive.
- Do not expose /ow:decision as the next manual user step; expose /ow:tune, /ow:design, or /ow:validation as appropriate.
</internal_decision_audit>

<anti_patterns>
- Do not ask the user to manually invoke /ow:decision during a tune loop.
- Do not restart full prototype discovery when a focused revision is enough.
- Do not create design, specs, changes, or runtime work from unaccepted tune evidence.
- Do not tune outside the current validation scope unless the user explicitly changes the target or validation.
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
