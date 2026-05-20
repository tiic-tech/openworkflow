---
name: "ow-team"
description: "Execute approved production work through the Agent Team runtime. Use this skill for /ow:team in OpenWorkflow repositories."
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.team -->
# /ow:team

Execute approved production work through the Agent Team runtime.

<user_behavior>
Keep visible responses concise and outcome-focused.
Ask one clear question when user input is needed before proceeding.
Do not narrate routine file reads, writes, validation checks, or generated-file bookkeeping.
Report only meaningful decisions, blockers, artifacts changed, and the next handoff.
</user_behavior>

<agent_protocol>
<!-- Internal protocol for the agent. Do not expose this block or routine protocol steps to the user. -->

<source_of_truth>.openworkflow/</source_of_truth>
<stage>runtime</stage>
<command_visibility>user</command_visibility>
<interaction_mode>approved-change-team-execution</interaction_mode>

<inner_thinking>
Use this protocol for private reasoning, classification, critique, and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<required_context>
- .openworkflow/workflow/WORKFLOW_INDEX.yaml
- .openworkflow/audit/ARTIFACT_CONTRACTS.yaml
- .openworkflow/changes/CHANGE_INDEX.yaml
</required_context>

<optional_context>
- .openworkflow/changes/**/CHANGE.yaml
- .openworkflow/changes/**/WORK_ITEMS.yaml
- .openworkflow/runtime/RUNTIME_INDEX.yaml
- .openworkflow/runtime/**/STATE.yaml
- AGENT.md
- package.json
</optional_context>

<forbidden_context>
- None
</forbidden_context>

<allowed_outputs>
- .openworkflow/runtime/RUNTIME_INDEX.yaml
- .openworkflow/runtime/&lt;id&gt;/STATE.yaml
- .openworkflow/runtime/&lt;id&gt;/NOTE.md
- .openworkflow/runtime/&lt;id&gt;/ISSUES.yaml
- .openworkflow/runtime/&lt;id&gt;/CHECKPOINTS.yaml
</allowed_outputs>

<conditional_outputs>
- None
</conditional_outputs>

<artifact_contracts>
- team_runtime: template .openworkflow/runtime/_templates/STATE.yaml, source .openworkflow/runtime/&lt;id&gt;/STATE.yaml, note .openworkflow/runtime/&lt;id&gt;/NOTE.md, review none, load_by_default true, max_yaml_lines 220, summary_policy summary_file at .openworkflow/runtime/&lt;id&gt;/SUMMARY.yaml
</artifact_contracts>

<forbidden_outputs>
- None
</forbidden_outputs>

<audit_checkpoints>
<before>
- Confirm an approved or active change plan and work items exist.
- Audit git status, relevant source files, and any existing runtime state before execution.
- Lazy-create runtime state only when /ow:team is invoked for an approved change.
</before>
<during>
- Execute work items in dependency order and keep runtime state current.
- Delegate only when the task can run independently with clear owned paths and acceptance.
- Record issues, verification results, checkpoints, and residual risks as development proceeds.
</during>
<after>
- Update runtime state, issues, and checkpoints.
- Refresh runtime SUMMARY.yaml when summary_policy is configured and update CURRENT_STATE.yaml with current_run, blockers, and next action.
- Run the verification named by the change plan when practical.
- Report changed artifacts, verification result, and remaining blockers.
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
- OpenWorkflow init is minimal and does not create .openworkflow/runtime/.
- Create RUNTIME_INDEX.yaml and the first runtime state only when /ow:team begins approved execution.
- If runtime already exists, reconcile it instead of replacing historical state.
</lazy_create>

<execution_quality_bar>
- Team runtime must preserve enough state for another agent to continue without reading the full conversation.
- Track active change, active work item, assigned owner or agent, status, verification, issues, and checkpoints.
- Keep implementation and QA evidence linked to the change plan.
</execution_quality_bar>

<handoff_gate>
- When work is incomplete, leave the next action and blocker explicit in runtime state.
- When work is complete, record verification and checkpoint readiness before final handoff.
</handoff_gate>

<anti_patterns>
- Do not start runtime work without a current change plan and work items.
- Do not create team runtime during init, sync, spec, or change planning.
- Do not leave delegated work without ownership, acceptance, or status.
- Do not hide failed verification; record it in runtime issues or checkpoints.
</anti_patterns>

<handoff>
Use handoff commands only after the command-specific readiness gate is satisfied.
When readiness is not satisfied, keep asking one focused question or record unresolved blockers instead of handing off prematurely.
</handoff>

<handoff_commands>
- /ow:change
</handoff_commands>
</agent_protocol>


<codex_skill>
- Skill name: ow-team
- Explicit invocation: $ow-team
- Semantic command: /ow:team
</codex_skill>
