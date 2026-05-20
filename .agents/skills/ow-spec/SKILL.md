---
name: "ow-spec"
description: "Create one focused production spec from accepted product design. Use this skill for /ow:spec in OpenWorkflow repositories."
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.spec -->
# /ow:spec

Create one focused production spec from accepted product design.

<user_behavior>
Keep visible responses concise and outcome-focused.
Ask one clear question when user input is needed before proceeding.
Do not narrate routine file reads, writes, validation checks, or generated-file bookkeeping.
Report only meaningful decisions, blockers, artifacts changed, and the next handoff.
</user_behavior>

<agent_protocol>
<!-- Internal protocol for the agent. Do not expose this block or routine protocol steps to the user. -->

<source_of_truth>.openworkflow/</source_of_truth>
<stage>spec</stage>
<command_visibility>user</command_visibility>
<interaction_mode>accepted-design-to-production-spec</interaction_mode>

<inner_thinking>
Use this protocol for private reasoning, classification, critique, and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<required_context>
- .openworkflow/workflow/WORKFLOW_INDEX.yaml
- .openworkflow/audit/ARTIFACT_CONTRACTS.yaml
- .openworkflow/design/DESIGN_INDEX.yaml
</required_context>

<optional_context>
- .openworkflow/design/**/PRODUCT_DESIGN.yaml
- .openworkflow/design/**/TECH_SPEC.yaml
- .openworkflow/design/**/FRONTEND_SPEC.yaml
- .openworkflow/design/**/BACKEND_SPEC.yaml
- .openworkflow/design/**/API_CONTRACT.yaml
- .openworkflow/design/**/DB_SCHEMA_MODEL.yaml
- .openworkflow/specs/SPEC_INDEX.yaml
- AGENT.md
- package.json
</optional_context>

<forbidden_context>
- .openworkflow/runtime/**
- .openworkflow/changes/**
</forbidden_context>

<allowed_outputs>
- .openworkflow/specs/SPEC_INDEX.yaml
- .openworkflow/specs/&lt;id&gt;/SPEC.yaml
- .openworkflow/specs/&lt;id&gt;/NOTE.md
</allowed_outputs>

<conditional_outputs>
- None
</conditional_outputs>

<artifact_contracts>
- production_spec: template .openworkflow/specs/_templates/SPEC.yaml, source .openworkflow/specs/&lt;id&gt;/SPEC.yaml, note .openworkflow/specs/&lt;id&gt;/NOTE.md, review none, load_by_default true, max_yaml_lines 220, summary_policy summary_file at .openworkflow/specs/&lt;id&gt;/SUMMARY.yaml
</artifact_contracts>

<forbidden_outputs>
- .openworkflow/changes/**
- .openworkflow/runtime/**
</forbidden_outputs>

<audit_checkpoints>
<before>
- Confirm a product design exists and spec_readiness.ready is true.
- Load only the current design and any conditional design packets named by that design.
- Lazy-create the specs index and spec artifact only when /ow:spec is invoked.
</before>
<during>
- Translate accepted product behavior into one implementable production slice.
- Preserve traceability to design evidence, accepted scope, and known blockers.
- Separate user-facing requirements, technical constraints, interfaces, acceptance criteria, and verification plan.
</during>
<after>
- Write the spec artifact and update SPEC_INDEX.yaml.
- Refresh spec SUMMARY.yaml when summary_policy is configured and update CURRENT_STATE.yaml with current_spec and change readiness.
- Hand off to /ow:change only when the spec has bounded scope, acceptance, and verification.
- Confirm no change or runtime artifacts were created.
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

<lazy_create>
- OpenWorkflow init is minimal: it creates only workflow, audit, and config files.
- If .openworkflow/specs/ or SPEC_INDEX.yaml is absent, create it during /ow:spec from ARTIFACT_CONTRACTS.yaml.
- Do not create unrelated stage directories, templates, changes, or runtime files while authoring the spec.
</lazy_create>

<spec_quality_bar>
- A production spec must be enough for an implementation agent to work without rereading the full discovery history.
- Name the exact scope, affected user behavior, interface contracts, non-goals, acceptance checks, verification commands, and risks.
- Keep rationale compact and reference source artifacts by path instead of copying long evidence.
</spec_quality_bar>

<readiness_gate>
- Do not hand off to /ow:change until implementation scope, acceptance, and test plan are explicit.
- If design packets are missing or contradictory, ask one focused question or hand back to /ow:design.
</readiness_gate>

<anti_patterns>
- Do not create specs from unaccepted or unready product design.
- Do not turn a broad product design into a multi-feature implementation plan.
- Do not create change or runtime artifacts during spec work.
- Do not precreate spec artifacts during init or sync; create them only on /ow:spec.
</anti_patterns>

<handoff>
Use handoff commands only after the command-specific readiness gate is satisfied.
When readiness is not satisfied, keep asking one focused question or record unresolved blockers instead of handing off prematurely.
</handoff>

<handoff_commands>
- /ow:change
- /ow:design
</handoff_commands>
</agent_protocol>


<codex_skill>
- Skill name: ow-spec
- Explicit invocation: $ow-spec
- Semantic command: /ow:spec
</codex_skill>
