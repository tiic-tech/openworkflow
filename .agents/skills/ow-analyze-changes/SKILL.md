---
name: "ow-analyze-changes"
description: "Analyze one or more candidate change queues and recommend the next candidate without selecting it. Use this skill for /ow:analyze-changes in OpenWorkflow repositories."
metadata:
  generated_by: "openworkflow"
  adapter: "codex"
  adapter_version: "0.1.0"
  template_id: "codex.skill.ow.analyze-changes"
  source_command_id: "analyze-changes"
  semantic_trigger: "/ow:analyze-changes"
  skill_name: "ow-analyze-changes"
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.analyze-changes -->
# /ow:analyze-changes

Analyze one or more candidate change queues and recommend the next candidate without selecting it.

<user_behavior>
Keep visible responses concise and outcome-focused.
Ask one clear question when user input is needed before proceeding.
Do not narrate routine file reads, writes, validation checks, or generated-file bookkeeping.
Report only meaningful decisions, blockers, artifacts changed, and the next handoff.
</user_behavior>

<agent_protocol>
<!-- Internal protocol for the agent. Do not expose this block or routine protocol steps to the user. -->

<source_of_truth>.openworkflow/</source_of_truth>
<stage>planning</stage>
<command_visibility>user</command_visibility>
<interaction_mode>read-only-cross-queue-priority-analysis</interaction_mode>

<inner_thinking>
Use this protocol for private reasoning, classification, critique, and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<required_context>
- references/planning-artifact-contracts.md
- skills/analyze-changes/references/analysis-protocol.md
- changes/&lt;plan_id&gt;/CANDIDATE_CHANGES.yaml
</required_context>

<optional_context>
- references/git-version-control-governance.md
- references/issue-governance.md
- changes/*/CANDIDATE_CHANGES.yaml when the user asks for global or cross-queue analysis
- changes/&lt;plan_id&gt;/SUMMARY.yaml
- changes/&lt;plan_id&gt;/HIGH_RISK_DECISION_REPORT.md
</optional_context>

<forbidden_context>
- None
</forbidden_context>

<allowed_outputs>
- changes/&lt;analysis_id&gt;/CHANGE_ANALYSIS.yaml
- changes/&lt;analysis_id&gt;/CHANGE_ANALYSIS.md
- changes/&lt;plan_id&gt;/CHANGE_ANALYSIS.yaml for single-queue analysis
- changes/&lt;plan_id&gt;/CHANGE_ANALYSIS.md for single-queue analysis
</allowed_outputs>

<conditional_outputs>
- high-risk stop recommendation that points to the needed HIGH_RISK_DECISION_REPORT.md
- queue maintenance recommendation when no candidate is safe to select
</conditional_outputs>

<artifact_contracts>
- None
</artifact_contracts>

<forbidden_outputs>
- CANDIDATE_CHANGES.yaml mutations unless the user separately requests maintenance
- SELECTED_CHANGE.yaml
- ATOM_TASKS.yaml
- IMPLEMENTATION_BRIEF.md
- implementation code changes
- high-risk implementation approval
</forbidden_outputs>

<audit_checkpoints>
<before>
- Run git status --short --branch and record branch and dirty-tree state.
- Discover only user-provided queues, or obvious changes/*/CANDIDATE_CHANGES.yaml files when global analysis is requested.
- Read YAML queues as source truth and Markdown views only as aids.
</before>
<during>
- Score candidates by readiness, dependency unlock value, risk, branch fit, dirty-tree fit, Issue linkage, validation realism, and user recency.
- Treat high-risk candidates as stop recommendations unless a concrete high-risk option is already approved.
- Recommend exactly one target plan id and candidate id only when evidence supports selection.
</during>
<after>
- Write CHANGE_ANALYSIS.yaml before CHANGE_ANALYSIS.md.
- Record rejected alternatives with plan id, candidate id, and concise reasons.
- Hand off to select-change without mutating selection artifacts.
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



<anti_patterns>
- Do not select candidates from analyze-changes.
- Do not implement candidates from analyze-changes.
- Do not treat CHANGE_ANALYSIS.yaml as approval for high-risk implementation.
- Do not discover every queue unless the user requests global comparison.
</anti_patterns>

<handoff>
Use handoff commands only after the command-specific readiness gate is satisfied.
When readiness is not satisfied, keep asking one focused question or record unresolved blockers instead of handing off prematurely.
</handoff>

<handoff_commands>
- /ow:select-change
- /ow:decompose-to-changes
</handoff_commands>
</agent_protocol>


<codex_skill>
- Skill name: ow-analyze-changes
- Explicit invocation: $ow-analyze-changes
- Semantic command: /ow:analyze-changes
</codex_skill>
