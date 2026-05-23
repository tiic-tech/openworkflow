---
name: "ow-coder"
description: "Govern source edits with internal Agent-only code quality preflight, RED/GREEN evidence, self-check, validation, and evidence binding. Internal audit skill for /ow:coder in OpenWorkflow repositories."
metadata:
  generated_by: "openworkflow"
  adapter: "codex"
  adapter_version: "0.1.0"
  template_id: "codex.skill.ow.coder"
  source_command_id: "coder"
  semantic_trigger: "/ow:coder"
  skill_name: "ow-coder"
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.coder -->
# /ow:coder

Govern source edits with internal Agent-only code quality preflight, RED/GREEN evidence, self-check, validation, and evidence binding.

<user_behavior>
Keep visible responses concise and outcome-focused.
Ask one clear question when user input is needed before proceeding.
Do not narrate routine file reads, writes, validation checks, or generated-file bookkeeping.
Report only meaningful decisions, blockers, artifacts changed, and the next handoff.
</user_behavior>

<agent_protocol>
<!-- Internal protocol for the agent. Do not expose this block or routine protocol steps to the user. -->

<source_of_truth>.openworkflow/</source_of_truth>
<stage>execution</stage>
<command_visibility>internal</command_visibility>
<interaction_mode>internal-agent-code-execution-governance</interaction_mode>

<inner_thinking>
Use this protocol for private reasoning, classification, critique, and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<required_context>
- references/internal-coder-protocol.md
- skills/coder/SKILL.md
- changes/&lt;plan_id&gt;/CANDIDATE_CHANGES.yaml when queue-driven
- changes/&lt;plan_id&gt;/&lt;candidate-id&gt;-&lt;slug&gt;/SELECTED_CHANGE.yaml when selected-change-driven
- git status --short --branch
</required_context>

<optional_context>
- references/validation-trust-domains.md
- references/skill-system-lifecycle.md
- references/git-version-control-governance.md
- changes/&lt;plan_id&gt;/&lt;candidate-id&gt;-&lt;slug&gt;/ATOM_TASKS.yaml
- changes/&lt;plan_id&gt;/&lt;candidate-id&gt;-&lt;slug&gt;/IMPLEMENTATION_BRIEF.md
- changes/&lt;plan_id&gt;/&lt;candidate-id&gt;-&lt;slug&gt;/LOCAL_COMMIT_EVIDENCE.yaml
</optional_context>

<forbidden_context>
- .openworkflow/runtime/** unless the active task is /ow:team execution
- generated .agents/** as source truth
</forbidden_context>

<allowed_outputs>
- source edits already allowed by the current selected change
- test, fixture, verifier, or reference edits already allowed by the current selected change
- selected-change evidence updates under changes/&lt;plan_id&gt;/&lt;candidate-id&gt;-&lt;slug&gt;/
- source-driven generated surfaces only after sync when the selected change owns them
</allowed_outputs>

<conditional_outputs>
- LOCAL_COMMIT_EVIDENCE.yaml through openworkflow git-automation commit when implementation files changed
- future optional CODER_EVIDENCE.yaml only after a later selected change defines the artifact contract
</conditional_outputs>

<artifact_contracts>
- None
</artifact_contracts>

<forbidden_outputs>
- user-facing command handoff to /ow:coder
- new mandatory CODER_EVIDENCE.yaml
- generated .agents/** hand edits
- .openworkflow/** mutation unless the active user-facing command owns that output
- git push, PR creation, Issue mutation, merge, reset, rebase, force-push, or destructive branch operations
</forbidden_outputs>

<audit_checkpoints>
<before>
- Recover trust with repo-local resume, handoff, inspect --strict, and git status before source edits.
- Identify selected plan id, candidate id, selected-change artifact, owned paths, forbidden paths, and validation commands when queue-driven.
- Build an owner/file/dependency map that names source truth, derived surfaces, validators, tests or fixtures, public report surfaces, and docs or skills.
- Decide whether RED evidence is required for the change type; for docs-only or contract-only work, record why RED is not applicable.
</before>
<during>
- Change the source owner first and regenerate derived surfaces only through the repo-local sync path when generated surfaces are in scope.
- For behavior, validator, CLI report, generated-surface, path-safety, summary, queue, or git-evidence changes, produce RED evidence before production edits when practical.
- After edits, rerun the RED evidence or nearest equivalent and record GREEN evidence for the touched trust domain.
- Keep /ow:change responsible for selected-change boundaries and /ow:team responsible for managed execution; coder governance constrains source edits but does not replace either command.
</during>
<after>
- Run the post-write self-check from skills/coder/SKILL.md before final validation.
- Run the narrowest honest validation ladder for the touched trust domain.
- Bind validation evidence to SELECTED_CHANGE.yaml, ATOM_TASKS.yaml, IMPLEMENTATION_BRIEF.md, or LOCAL_COMMIT_EVIDENCE.yaml as appropriate.
- Report generated surfaces as source-driven or intentionally untouched; do not present /ow:coder as a normal user-facing next step.
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

<internal_command_boundary>
- /ow:coder is internal and Agent-only.
- It is not a normal user-facing coding command and must not appear as the recommended handoff for product work.
- It constrains source-edit quality inside /ow:change, /ow:team, git-automation, and other implementation flows.
- Its source behavior lives in skills/coder/SKILL.md and references/internal-coder-protocol.md.
</internal_command_boundary>

<preflight_owner_map>
- Identify source truth before edits: command registry, artifact registry, schema, validator, adapter template, source skill, or planning queue.
- Identify derived surfaces such as .agents/**, .openworkflow/audit/**, summaries, fixtures, and readable Markdown views.
- Name forbidden paths and dependency order before writing across multiple concerns.
- If two owners define the same rule, either collapse the duplication or record a temporary compatibility boundary.
</preflight_owner_map>

<red_green_evidence>
- For behavior, validator, CLI report, generated-surface, path-safety, summary, queue, or git-evidence changes, prefer RED evidence before production edits.
- Valid RED evidence can be a failing parsed JSON/YAML assertion, fixture, generated-surface parity check, summary or resume health assertion, compile failure, or runtime verifier failure.
- After edits, rerun the RED evidence or nearest equivalent and record GREEN evidence.
- For docs-only, contract-only, mechanical rename, or exploratory work, mark RED not applicable and use the nearest structural check.
</red_green_evidence>

<validation_ladder>
- Use the narrowest honest validation ladder for the touched trust domain.
- Source skill or generated protocol work requires build, sync, generated diff review, strict inspect, and diff check.
- Command registry or generated runtime surface work requires build, sync, runtime-surface verification, and generated diff review.
- Artifact, schema, or validator work requires build, validate, and targeted valid/invalid fixtures.
- Git evidence work requires git-automation preview/write plus strict read-model commands.
</validation_ladder>

<evidence_binding>
- Bind scope and acceptance to SELECTED_CHANGE.yaml.
- Bind task status and verification results to ATOM_TASKS.yaml.
- Bind handoff instructions to IMPLEMENTATION_BRIEF.md.
- Bind local commit hashes and validation evidence to LOCAL_COMMIT_EVIDENCE.yaml when implementation files changed.
- Do not batch multiple completed selected changes into one checkpoint commit.
</evidence_binding>

<anti_patterns>
- Do not expose /ow:coder as a normal user-facing workflow entrypoint.
- Do not use /ow:coder to bypass /ow:change selected-change boundaries or /ow:team execution governance.
- Do not patch generated .agents surfaces as the durable fix.
- Do not require CODER_EVIDENCE.yaml before a later candidate defines and proves the evidence contract.
- Do not treat npm run build alone as sufficient validation for behavior, validator, generated-surface, summary, or git-evidence changes.
- Do not hide historical validation debt; classify it separately from active-change failures.
</anti_patterns>

<handoff>
Use handoff commands only after the command-specific readiness gate is satisfied.
When readiness is not satisfied, keep asking one focused question or record unresolved blockers instead of handing off prematurely.
</handoff>

<handoff_commands>
- None
</handoff_commands>
</agent_protocol>


<codex_skill>
- Skill name: ow-coder
- Explicit invocation: $ow-coder
- Semantic command: /ow:coder
</codex_skill>
