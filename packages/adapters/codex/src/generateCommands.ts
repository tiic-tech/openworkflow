import { homedir } from "node:os";
import { join } from "node:path";
import { getWorkflowCommands, type WorkflowCommand } from "../../../core/src/commands/registry.js";
import { getDiscoveryArtifactContractsForCommand } from "../../../core/src/artifacts/registry.js";
import type { CodexTemplate } from "./templates.js";

const PROMPT_ARGUMENT_HINT = "optional user intent or stage feedback";

export function generateCommandTemplates(): CodexTemplate[] {
  return getWorkflowCommands().map((command) => ({
    id: `codex.command-reference.${command.namespace}.${command.id}`,
    path: codexCommandPath(command),
    content: commandReferenceDoc(command),
  }));
}

export function generatePromptTemplates(): CodexTemplate[] {
  return getWorkflowCommands().flatMap((command) => {
    const templates: CodexTemplate[] = [
      {
        id: `codex.prompt.${command.namespace}.${command.id}`,
        path: codexPromptPath(command),
        content: commandPromptDoc(command),
      },
    ];
    for (const legacyTrigger of command.legacyTriggers) {
      const legacyPromptId = codexPromptIdFromTrigger(legacyTrigger);
      if (!legacyPromptId || legacyPromptId === command.id) {
        continue;
      }
      templates.push({
        id: `codex.prompt.${command.namespace}.${legacyPromptId}`,
        path: codexPromptPathForId(legacyPromptId),
        content: commandPromptDoc(command, legacyTrigger),
      });
    }
    return templates;
  });
}

export function codexCommandPath(command: WorkflowCommand): string {
  return `.codex/commands/${command.namespace}/${command.id}.md`;
}

export function codexPromptPath(command: WorkflowCommand): string {
  return codexPromptPathForId(command.id);
}

export function codexPromptPathForId(id: string): string {
  return `ow-${id}.md`;
}

export function codexPromptsDir(): string {
  const codexHome = process.env.CODEX_HOME?.trim() || join(homedir(), ".codex");
  return join(codexHome, "prompts");
}

export function codexPromptDisplayPath(command: WorkflowCommand): string {
  return `$CODEX_HOME/prompts/${codexPromptPath(command)}`;
}

export function legacyCodexCommandPaths(): string[] {
  return [
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

function commandReferenceDoc(command: WorkflowCommand): string {
  return `# ${command.trigger} Reference

Reference/audit copy only. Codex slash registration is generated globally at \`$CODEX_HOME/prompts/${codexPromptPath(command)}\`, or \`~/.codex/prompts/${codexPromptPath(command)}\` when \`CODEX_HOME\` is unset.

${commandDoc(command)}
`;
}

function commandPromptDoc(command: WorkflowCommand, trigger = command.trigger): string {
  return `---
description: ${yamlString(command.description)}
argument-hint: ${yamlString(PROMPT_ARGUMENT_HINT)}
---
${commandDoc(command, trigger)}
`;
}

function commandDoc(command: WorkflowCommand, trigger = command.trigger): string {
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
<interaction_mode>${escapeXml(protocol.interactionMode)}</interaction_mode>

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

<anti_patterns>
${xmlList(protocol.antiPatterns)}
</anti_patterns>

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

function yamlString(value: string): string {
  return JSON.stringify(value);
}

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function codexPromptIdFromTrigger(trigger: string): string | null {
  const match = trigger.match(/^\/ow:([a-z0-9-]+)$/);
  return match?.[1] ?? null;
}
