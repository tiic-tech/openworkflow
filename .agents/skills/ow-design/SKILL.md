---
name: "ow-design"
description: "Convert accepted prototype evidence into product design for production specification. Use this skill for /ow:design in OpenWorkflow repositories."
metadata:
  generated_by: "openworkflow"
  adapter: "codex"
  adapter_version: "0.1.0"
  template_id: "codex.skill.ow.design"
  source_command_id: "design"
  semantic_trigger: "/ow:design"
  skill_name: "ow-design"
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.design -->
# /ow:design

Convert accepted prototype evidence into product design for production specification.

<user_behavior>
Keep visible responses concise and outcome-focused.
Ask one clear question when user input is needed before proceeding.
Do not narrate routine file reads, writes, validation checks, or generated-file bookkeeping.
Report only meaningful decisions, blockers, artifacts changed, and the next handoff.
</user_behavior>

<agent_protocol>
<!-- Internal protocol for the agent. Do not expose this block or routine protocol steps to the user. -->

<source_of_truth>.openworkflow/</source_of_truth>
<stage>design</stage>
<command_visibility>user</command_visibility>
<interaction_mode>conversation-first-product-design</interaction_mode>

<inner_thinking>
Use this protocol for private reasoning, classification, critique, and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<required_context>
- .openworkflow/workflow/WORKFLOW_INDEX.yaml
- .openworkflow/audit/ARTIFACT_CONTRACTS.yaml
- .openworkflow/prototypes/PROTOTYPE_INDEX.yaml
- .openworkflow/decisions/DECISION_INDEX.yaml
</required_context>

<optional_context>
- .openworkflow/prototypes/**/EVIDENCE.yaml
- .openworkflow/decisions/**/DECISION.yaml
- .openworkflow/validation/**/VALIDATION.yaml
- .openworkflow/vision/VISION_CONTRACT.yaml
- .openworkflow/context/CONTEXT_MAP.yaml
</optional_context>

<forbidden_context>
- .openworkflow/runtime/**
- .openworkflow/changes/**
- .openworkflow/specs/**
</forbidden_context>

<allowed_outputs>
- .openworkflow/design/DESIGN_INDEX.yaml
- .openworkflow/design/&lt;id&gt;/PRODUCT_DESIGN.yaml
- .openworkflow/design/&lt;id&gt;/NOTE.md
</allowed_outputs>

<conditional_outputs>
- .openworkflow/design/&lt;id&gt;/TECH_SPEC.yaml
- .openworkflow/design/&lt;id&gt;/FRONTEND_SPEC.yaml
- .openworkflow/design/&lt;id&gt;/BACKEND_SPEC.yaml
- .openworkflow/design/&lt;id&gt;/API_CONTRACT.yaml
- .openworkflow/design/&lt;id&gt;/DB_SCHEMA_MODEL.yaml
</conditional_outputs>

<artifact_contracts>
- product_design: template .openworkflow/design/_templates/PRODUCT_DESIGN.yaml, source .openworkflow/design/&lt;id&gt;/PRODUCT_DESIGN.yaml, note .openworkflow/design/&lt;id&gt;/NOTE.md, review none, load_by_default true, max_yaml_lines 220, summary_policy summary_file at .openworkflow/design/&lt;id&gt;/SUMMARY.yaml
</artifact_contracts>

<forbidden_outputs>
- .openworkflow/specs/**
- .openworkflow/changes/**
- .openworkflow/runtime/**
</forbidden_outputs>

<audit_checkpoints>
<before>
- Confirm accepted prototype evidence or a continue decision exists.
- Start by clarifying product behavior and UX gaps before writing PRODUCT_DESIGN.yaml.
</before>
<during>
- Ask one focused design question at a time when behavior, states, edge cases, or scope are thin.
- Cover mandatory design dimensions before spec handoff.
- Create conditional packets only when explicitly needed.
</during>
<after>
- Write PRODUCT_DESIGN.yaml only after enough design meaning is stable.
- Refresh design SUMMARY.yaml when summary_policy is configured and update CURRENT_STATE.yaml with current_design and spec readiness.
- Hand off to /ow:spec only when spec readiness is true and blockers are explicit.
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

<conversation_first>
- Treat /ow:design as product-design clarification before specification.
- Ask one focused question when accepted evidence does not yet support durable product design.
- Do not begin by authoring PRODUCT_DESIGN.yaml when journey, states, flows, or scope are still unclear.
</conversation_first>

<mandatory_coverage>
- Cover personas and usage context.
- Cover journey map and key flows.
- Cover UX states, state transitions, and feedback timing.
- Cover interaction details and recovery behavior.
- Cover edge cases and failure states.
- Cover responsive behavior and accessibility expectations.
- Cover scope boundaries, priority, and what remains out of scope.
- Cover spec readiness and blockers.
</mandatory_coverage>

<readiness_gate>
- Do not hand off to /ow:spec until design coverage is sufficient, blockers are explicit, and spec_readiness.ready is true.
- If accepted prototype evidence is thin, ask targeted design questions or hand back to /ow:tune.
- Design readiness depends on behavior clarity, not on having a long document.
</readiness_gate>

<artifact_checkpoint>
- Persist PRODUCT_DESIGN.yaml after stable design answers or explicit checkpoint request.
- Use conditional packets only when implementation constraints genuinely need a separate packet.
- Keep unresolved design questions visible instead of silently inventing product behavior.
</artifact_checkpoint>

<anti_patterns>
- Do not treat unreviewed prototype evidence as accepted.
- Do not convert thin prototype evidence into design artifacts prematurely.
- Do not create production specs or changes during design.
- Do not generate conditional technical packets by default.
</anti_patterns>

<handoff>
Use handoff commands only after the command-specific readiness gate is satisfied.
When readiness is not satisfied, keep asking one focused question or record unresolved blockers instead of handing off prematurely.
</handoff>

<handoff_commands>
- /ow:spec
- /ow:tune
- /ow:validation
</handoff_commands>
</agent_protocol>


<codex_skill>
- Skill name: ow-design
- Explicit invocation: $ow-design
- Semantic command: /ow:design
</codex_skill>
