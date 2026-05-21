---
name: "ow-vision"
description: "Create or refine the product vision contract through focused collaboration. Use this skill for /ow:vision in OpenWorkflow repositories."
metadata:
  generated_by: "openworkflow"
  adapter: "codex"
  adapter_version: "0.1.0"
  template_id: "codex.skill.ow.vision"
  source_command_id: "vision"
  semantic_trigger: "/ow:vision"
  skill_name: "ow-vision"
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.vision -->
# /ow:vision

Create or refine the product vision contract through focused collaboration.

<user_behavior>
Keep visible responses concise and outcome-focused.
Ask one clear question when user input is needed before proceeding.
Do not narrate routine file reads, writes, validation checks, or generated-file bookkeeping.
Report only meaningful decisions, blockers, artifacts changed, and the next handoff.
</user_behavior>

<agent_protocol>
<!-- Internal protocol for the agent. Do not expose this block or routine protocol steps to the user. -->

<source_of_truth>.openworkflow/</source_of_truth>
<stage>vision</stage>
<command_visibility>user</command_visibility>
<interaction_mode>conversation-first-sustained-grill</interaction_mode>

<inner_thinking>
Use this protocol for private reasoning, classification, critique, and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<required_context>
- .openworkflow/workflow/WORKFLOW_INDEX.yaml
- .openworkflow/audit/ARTIFACT_CONTRACTS.yaml
</required_context>

<optional_context>
- .openworkflow/vision/VISION_CONTRACT.yaml
- .openworkflow/context/CONTEXT.md
- .openworkflow/context/CONTEXT_MAP.yaml
- .openworkflow/context/GLOSSARY.yaml
- AGENT.md
</optional_context>

<forbidden_context>
- .openworkflow/runtime/**
- .openworkflow/changes/**
</forbidden_context>

<allowed_outputs>
- .openworkflow/vision/VISION.md
- .openworkflow/vision/VISION_CONTRACT.yaml
- .openworkflow/vision/sessions/&lt;id&gt;/VISION_SESSION.yaml
- .openworkflow/vision/sessions/&lt;id&gt;/NOTE.md
- .openworkflow/context/CONTEXT.md
- .openworkflow/context/CONTEXT_MAP.yaml
</allowed_outputs>

<conditional_outputs>
- None
</conditional_outputs>

<artifact_contracts>
- vision_session: template .openworkflow/vision/_templates/VISION_SESSION.yaml, source .openworkflow/vision/sessions/&lt;id&gt;/VISION_SESSION.yaml, note .openworkflow/vision/sessions/&lt;id&gt;/NOTE.md, review none, load_by_default true, max_yaml_lines 90, summary_policy current_slice at vision_delta
</artifact_contracts>

<forbidden_outputs>
- .openworkflow/validation/**
- .openworkflow/prototypes/**
- .openworkflow/specs/**
- .openworkflow/changes/**
- .openworkflow/runtime/**
</forbidden_outputs>

<audit_checkpoints>
<before>
- Confirm workflow and context indexes exist.
- Load CURRENT_STATE.yaml when present to avoid stale stage routing.
- Start in conversation mode and ask the next useful vision question before writing artifacts.
</before>
<during>
- Ask one focused question at a time and make each question depend on the previous answer.
- Cover mandatory vision dimensions before validation handoff.
- Provide concrete examples or options when the user is stuck.
</during>
<after>
- Persist artifacts only after stable answers, explicit save request, or readiness checkpoint.
- Handoff to validation only after mandatory coverage, unresolved blockers are named, and the user confirms readiness.
- When handing off, mark the vision session active or reviewed, clear stale current_question when answered, and update CURRENT_STATE.yaml.
- Confirm no validation, prototype, spec, change, or runtime artifacts were created.
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

<agent_first_consumer>
- Treat the next implementing Agent as the first consumer of vision artifacts.
- Before persistence or handoff, make the compact vision state answer: current state, read-first pointers, source-of-truth artifact, unresolved blockers, safe write boundary, validation proof, and next command.
- The vision_delta must preserve enough handoff intelligence for a low-context Agent: one sentence, users, core problem, goals, non-goals, quality bar, AI-native role, success signals, and failure signals.
- If those handoff fields are thin, continue the conversation or record explicit unresolved questions instead of presenting the artifact as ready.
</agent_first_consumer>

<conversation_first>
- Treat /ow:vision as a focused product conversation, not an artifact fill-out task.
- Ask exactly one question unless the user explicitly requests a summary or save checkpoint.
- Let each answer drive the next deeper question; do not run a generic questionnaire mechanically.
</conversation_first>

<mandatory_coverage>
- Cover target user and beneficiary.
- Cover the problem, motivation, and emotional or quality bar.
- Cover the core product surface and primary job to be done.
- Cover explicit non-goals and exclusions.
- Cover AI-native role, boundaries, and failure modes.
- Cover privacy, data, sharing, and retention assumptions.
- Cover alternatives or competing mental models.
- Cover success signals and failure signals.
</mandatory_coverage>

<readiness_gate>
- Do not hand off to /ow:validation until mandatory coverage is addressed, unresolved questions are explicit, and the user confirms readiness.
- If a dimension is thin, ask another targeted question instead of writing a final artifact.
- Vision readiness is based on coverage and user confirmation, not on a fixed number of turns.
</readiness_gate>

<artifact_checkpoint>
- Write VISION_SESSION.yaml, VISION_CONTRACT.yaml, VISION.md, or context updates only after stable answers or an explicit checkpoint request.
- Keep brainstorming and tentative hypotheses in NOTE.md or unresolved_questions rather than presenting them as stable product truth.
- Summarize at meaningful checkpoints before persisting durable vision state.
</artifact_checkpoint>

<anti_patterns>
- Do not open by writing vision artifacts before the conversation has stable answers.
- Do not create validation rankings during vision work.
- Do not create specs, changes, tasks, or teams from a vision session.
- Do not batch many interview questions into one turn.
- Do not hand off to validation after a fixed small number of questions.
</anti_patterns>

<handoff>
Use handoff commands only after the command-specific readiness gate is satisfied.
When readiness is not satisfied, keep asking one focused question or record unresolved blockers instead of handing off prematurely.
</handoff>

<handoff_commands>
- /ow:validation
</handoff_commands>
</agent_protocol>


<codex_skill>
- Skill name: ow-vision
- Explicit invocation: $ow-vision
- Semantic command: /ow:vision
</codex_skill>
