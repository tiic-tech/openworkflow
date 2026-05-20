---
name: "ow-change"
description: "Create one focused production change for the current core feature. Use this skill for /ow:change in OpenWorkflow repositories."
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.change -->
# /ow:change

Create one focused production change for the current core feature.

<user_behavior>
Keep visible responses concise and outcome-focused.
Ask one clear question when user input is needed before proceeding.
Do not narrate routine file reads, writes, validation checks, or generated-file bookkeeping.
Report only meaningful decisions, blockers, artifacts changed, and the next handoff.
</user_behavior>

<agent_protocol>
<!-- Internal protocol for the agent. Do not expose this block or routine protocol steps to the user. -->

<source_of_truth>.openworkflow/</source_of_truth>
<stage>change</stage>
<command_visibility>user</command_visibility>
<interaction_mode>production-change-planning</interaction_mode>

<inner_thinking>
Use this protocol for private reasoning, classification, critique, and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<required_context>
- .openworkflow/workflow/WORKFLOW_INDEX.yaml
- .openworkflow/audit/ARTIFACT_CONTRACTS.yaml
- .openworkflow/specs/SPEC_INDEX.yaml
</required_context>

<optional_context>
- .openworkflow/specs/**/SPEC.yaml
- .openworkflow/specs/**/NOTE.md
- .openworkflow/changes/CHANGE_INDEX.yaml
- AGENT.md
- package.json
</optional_context>

<forbidden_context>
- .openworkflow/runtime/**
</forbidden_context>

<allowed_outputs>
- .openworkflow/changes/CHANGE_INDEX.yaml
- .openworkflow/changes/&lt;id&gt;/CHANGE.yaml
- .openworkflow/changes/&lt;id&gt;/NOTE.md
- .openworkflow/changes/&lt;id&gt;/WORK_ITEMS.yaml
</allowed_outputs>

<conditional_outputs>
- None
</conditional_outputs>

<artifact_contracts>
- production_change: template .openworkflow/changes/_templates/CHANGE.yaml, source .openworkflow/changes/&lt;id&gt;/CHANGE.yaml, note .openworkflow/changes/&lt;id&gt;/NOTE.md, review none, load_by_default true, max_yaml_lines 220, summary_policy summary_file at .openworkflow/changes/&lt;id&gt;/SUMMARY.yaml
</artifact_contracts>

<forbidden_outputs>
- .openworkflow/runtime/**
</forbidden_outputs>

<audit_checkpoints>
<before>
- Confirm a focused production spec exists.
- Inspect the repository just enough to identify affected paths, integration points, and verification commands.
- Lazy-create the changes index, change artifact, and work items only when /ow:change is invoked.
</before>
<during>
- Convert the spec into one bounded implementation change with non-goals and rollback notes.
- Split work into ordered items with owned paths, dependencies, acceptance, and verification.
- Record unresolved implementation risks instead of expanding scope.
</during>
<after>
- Write CHANGE.yaml, WORK_ITEMS.yaml, and CHANGE_INDEX.yaml.
- Refresh change SUMMARY.yaml when summary_policy is configured and update CURRENT_STATE.yaml with current_change and runtime readiness.
- Hand off to /ow:team only when work items are implementable and verification is explicit.
- Confirm no runtime artifacts were created.
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
- OpenWorkflow init is minimal and does not create .openworkflow/changes/.
- If CHANGE_INDEX.yaml is absent, create it together with the first change artifact during /ow:change.
- Create WORK_ITEMS.yaml only for the active change, not as a global task backlog.
</lazy_create>

<planning_quality_bar>
- A change plan must let an implementation agent start with bounded files, ordered tasks, acceptance checks, and rollback awareness.
- Prefer small coherent work items with explicit owned_paths and verification over broad task buckets.
- Keep the user-facing summary short and keep detailed implementation intelligence in the artifacts.
</planning_quality_bar>

<readiness_gate>
- Do not hand off to /ow:team until CHANGE.yaml and WORK_ITEMS.yaml agree on scope and verification.
- If the spec is too broad or thin, ask one focused question or hand back to /ow:spec.
</readiness_gate>

<anti_patterns>
- Do not implement product code during /ow:change.
- Do not create runtime or agent team files before the change plan is accepted.
- Do not plan work that is not traceable to the current spec.
- Do not precreate change artifacts during init or sync; create them only on /ow:change.
</anti_patterns>

<handoff>
Use handoff commands only after the command-specific readiness gate is satisfied.
When readiness is not satisfied, keep asking one focused question or record unresolved blockers instead of handing off prematurely.
</handoff>

<handoff_commands>
- /ow:team
- /ow:spec
</handoff_commands>
</agent_protocol>


<codex_skill>
- Skill name: ow-change
- Explicit invocation: $ow-change
- Semantic command: /ow:change
</codex_skill>
