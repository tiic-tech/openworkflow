import { getWorkflowCommands, type WorkflowCommand } from "../../../core/src/commands/registry.js";
import { getDiscoveryArtifactContractsForCommand } from "../../../core/src/artifacts/registry.js";

export function codexCommandPath(command: WorkflowCommand): string {
  return `.codex/commands/${command.namespace}/${command.id}.md`;
}

export function codexPromptPathForId(id: string): string {
  return `ow-${id}.md`;
}

export function legacyCodexCommandPaths(): string[] {
  const commandPaths = getWorkflowCommands().map((command) => codexCommandPath(command));
  return [
    ...commandPaths,
    ".codex/commands/build-workflow.md",
    ".codex/commands/build-context.md",
    ".codex/commands/build-vision.md",
    ".codex/commands/build-validation.md",
    ".codex/commands/build-prototype.md",
    ".codex/commands/build-decision.md",
    ".codex/commands/build-design.md",
    ".codex/commands/build-spec.md",
    ".codex/commands/build-change.md",
    ".codex/commands/build-team.md",
    ".codex/commands/run-team.md",
  ];
}

export function commandDoc(command: WorkflowCommand, trigger = command.trigger): string {
  const protocol = command.protocol;
  const artifacts = getDiscoveryArtifactContractsForCommand(command.trigger);
  if (!protocol || protocol.depth === "shallow") {
    return shallowCommandDoc(command, artifacts, trigger);
  }

  return `# ${trigger}

${command.description}

<user_behavior>
Keep visible responses concise and outcome-focused.
Ask one clear question when user input is needed before proceeding.
Do not narrate routine file reads, writes, validation checks, or generated-file bookkeeping.
Report only meaningful decisions, blockers, artifacts changed, and the next handoff.
</user_behavior>

<agent_protocol>
<!-- Internal protocol for the agent. Do not expose this block or routine protocol steps to the user. -->

<source_of_truth>.openworkflow/</source_of_truth>
<stage>${escapeXml(command.stage)}</stage>
<command_visibility>${escapeXml(command.visibility)}</command_visibility>
<interaction_mode>${escapeXml(protocol.interactionMode)}</interaction_mode>

<inner_thinking>
Use this protocol for private reasoning, classification, critique, and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<required_context>
${xmlList(protocol.requiredContext)}
</required_context>

<optional_context>
${xmlList(protocol.optionalContext)}
</optional_context>

<forbidden_context>
${xmlList(protocol.forbiddenContext)}
</forbidden_context>

<allowed_outputs>
${xmlList(protocol.allowedOutputs)}
</allowed_outputs>

<conditional_outputs>
${xmlList(protocol.conditionalOutputs ?? [])}
</conditional_outputs>

<artifact_contracts>
${artifactXmlList(artifacts)}
</artifact_contracts>

<forbidden_outputs>
${xmlList(protocol.forbiddenOutputs)}
</forbidden_outputs>

<audit_checkpoints>
<before>
${xmlList(protocol.auditCheckpoints.before)}
</before>
<during>
${xmlList(protocol.auditCheckpoints.during)}
</during>
<after>
${xmlList(protocol.auditCheckpoints.after)}
</after>
</audit_checkpoints>

<working_protocol>
1. Load only the required context packet first.
2. Use optional context only when the required packet is insufficient.
3. Stay inside allowed outputs.
4. Create conditional outputs only when the current artifact explicitly names them as blockers or the user asks for that packet.
5. Stop before creating any forbidden output.
6. Record unresolved questions instead of expanding scope.
</working_protocol>

<artifact_checkpoint>
Write durable .openworkflow artifacts only at meaningful checkpoints: stable user answers, explicit save requests, completed evidence changes, or handoff readiness.
Do not treat artifact writing as the opening move for conversation-first commands.
</artifact_checkpoint>

${internalSectionsXml(protocol.internalSections ?? [])}

<anti_patterns>
${xmlList(protocol.antiPatterns)}
</anti_patterns>

<handoff>
Use handoff commands only after the command-specific readiness gate is satisfied.
When readiness is not satisfied, keep asking one focused question or record unresolved blockers instead of handing off prematurely.
</handoff>

<handoff_commands>
${xmlList(protocol.handoffCommands)}
</handoff_commands>
</agent_protocol>
`;
}

function shallowCommandDoc(
  command: WorkflowCommand,
  artifacts = getDiscoveryArtifactContractsForCommand(command.trigger),
  trigger = command.trigger,
): string {
  return `# ${trigger}

${command.description}

<user_behavior>
Keep visible responses concise and outcome-focused.
Do not narrate routine file reads, writes, validation checks, or generated-file bookkeeping.
Report only meaningful decisions, blockers, artifacts changed, and the next handoff.
</user_behavior>

<agent_protocol>
<!-- Internal protocol for the agent. Do not expose this block or routine protocol steps to the user. -->

<source_of_truth>.openworkflow/</source_of_truth>
<stage>${escapeXml(command.stage)}</stage>
<command_visibility>${escapeXml(command.visibility)}</command_visibility>

<inner_thinking>
Use this protocol for private reasoning and scope checks.
Do not expose chain-of-thought, routine checklist results, context-loading traces, or generated-file bookkeeping to the user.
</inner_thinking>

<target_artifacts>
${xmlList(command.targetArtifacts)}
</target_artifacts>

<artifact_contracts>
${artifactXmlList(artifacts)}
</artifact_contracts>

<working_protocol>
Load only the contract files required for this stage.
Keep artifacts short, scoped, and traceable through .openworkflow/workflow/WORKFLOW_INDEX.yaml plus .openworkflow/audit/.
</working_protocol>

<artifact_checkpoint>
Write durable .openworkflow artifacts only at meaningful checkpoints.
</artifact_checkpoint>

<handoff>
Use handoff commands only after readiness is satisfied.
</handoff>
</agent_protocol>
`;
}

function xmlList(items: string[]): string {
  if (items.length === 0) {
    return "- None";
  }
  return items.map((item) => `- ${escapeXml(item)}`).join("\n");
}

function artifactXmlList(artifacts: ReturnType<typeof getDiscoveryArtifactContractsForCommand>): string {
  if (artifacts.length === 0) {
    return "- None";
  }
  return artifacts
    .map(
      (artifact) =>
        `- ${escapeXml(artifact.artifactType)}: template ${escapeXml(artifact.templatePath)}, source ${escapeXml(artifact.sourceOfTruthPath)}, note ${escapeXml(artifact.notePath)}, review ${escapeXml(artifact.reviewPath ?? "none")}, load_by_default ${artifact.readPolicy.loadByDefault}, max_yaml_lines ${artifact.readPolicy.maxYamlLines}`,
    )
    .join("\n");
}

function internalSectionsXml(sections: NonNullable<WorkflowCommand["protocol"]>["internalSections"]): string {
  if (!sections || sections.length === 0) {
    return "";
  }
  return sections
    .map((section) => `<${section.tag}>\n${xmlList(section.items)}\n</${section.tag}>`)
    .join("\n\n");
}

function yamlString(value: string): string {
  return JSON.stringify(value);
}

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function codexPromptIdFromTrigger(trigger: string): string | null {
  const match = trigger.match(/^\/ow:([a-z0-9-]+)$/);
  return match?.[1] ?? null;
}
