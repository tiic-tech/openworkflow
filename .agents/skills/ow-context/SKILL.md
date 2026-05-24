---
name: "ow-context"
description: "Map the repo context needed for vision and downstream workflow decisions. Use this skill for /ow:context in OpenWorkflow repositories."
metadata:
  generated_by: "openworkflow"
  adapter: "codex"
  adapter_version: "0.1.0"
  template_id: "codex.skill.ow.context"
  source_command_id: "context"
  semantic_trigger: "/ow:context"
  skill_name: "ow-context"
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.context -->
# /ow:context

Map the repo context needed for vision and downstream workflow decisions.

<user_behavior>
Keep visible responses concise and outcome-focused.
Do not narrate routine file reads, writes, validation checks, or generated-file bookkeeping.
Report only meaningful decisions, blockers, artifacts changed, and the next handoff.
</user_behavior>

<agent_protocol>
<!-- Internal protocol for the agent. Do not expose this block or routine protocol steps to the user. -->

<source_of_truth>.openworkflow/</source_of_truth>
<stage>context</stage>
<command_visibility>user</command_visibility>

<inner_thinking>
Use this protocol for private reasoning and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<target_artifacts>
- .openworkflow/context/CONTEXT.md
- .openworkflow/context/CONTEXT_MAP.yaml
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
- Skill name: ow-context
- Explicit invocation: $ow-context
- Semantic command: /ow:context
</codex_skill>
