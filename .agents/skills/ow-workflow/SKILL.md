---
name: "ow-workflow"
description: "Initialize or reconcile OpenWorkflow contracts. Use this skill for /ow:workflow in OpenWorkflow repositories."
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.workflow -->
# /ow:workflow

Initialize or reconcile OpenWorkflow contracts.

<user_behavior>
Keep visible responses concise and outcome-focused.
Do not narrate routine file reads, writes, validation checks, or generated-file bookkeeping.
Report only meaningful decisions, blockers, artifacts changed, and the next handoff.
</user_behavior>

<agent_protocol>
<!-- Internal protocol for the agent. Do not expose this block or routine protocol steps to the user. -->

<source_of_truth>.openworkflow/</source_of_truth>
<stage>workflow</stage>
<command_visibility>user</command_visibility>

<inner_thinking>
Use this protocol for private reasoning and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<target_artifacts>
- .openworkflow/workflow/WORKFLOW_INDEX.yaml
- .openworkflow/audit/
</target_artifacts>

<artifact_contracts>
- None
</artifact_contracts>

<working_protocol>
Load .openworkflow/CURRENT_STATE.yaml first when present, then load only the contract files required for this stage.
When an artifact contract defines summary_policy, load that summary or current_slice before the full source artifact.
Keep artifacts short, scoped, and traceable through .openworkflow/CURRENT_STATE.yaml, .openworkflow/workflow/WORKFLOW_INDEX.yaml, and .openworkflow/audit/.
</working_protocol>

<artifact_checkpoint>
Write durable .openworkflow artifacts only at meaningful checkpoints.
Refresh CURRENT_STATE.yaml and any summary_policy target whenever current pointers, next command, blockers, or handoff status changes.
</artifact_checkpoint>

<handoff>
Use handoff commands only after readiness is satisfied.
</handoff>
</agent_protocol>


<codex_skill>
- Skill name: ow-workflow
- Explicit invocation: $ow-workflow
- Semantic command: /ow:workflow
</codex_skill>
