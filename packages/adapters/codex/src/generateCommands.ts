import { getWorkflowCommands, type WorkflowCommand } from "../../../core/src/commands/registry.js";
import { getDiscoveryArtifactContractsForCommand } from "../../../core/src/artifacts/registry.js";
import type { CodexTemplate } from "./templates.js";

export function generateCommandTemplates(): CodexTemplate[] {
  return getWorkflowCommands().map((command) => ({
    id: `codex.command.${command.namespace}.${command.id}`,
    path: codexCommandPath(command),
    content: commandDoc(command),
  }));
}

export function codexCommandPath(command: WorkflowCommand): string {
  return `.codex/commands/${command.namespace}/${command.id}.md`;
}

export function legacyCodexCommandPaths(): string[] {
  return [
    ".codex/commands/build-workflow.md",
    ".codex/commands/build-context.md",
    ".codex/commands/build-vision.md",
    ".codex/commands/build-validation.md",
    ".codex/commands/build-prototype.md",
    ".codex/commands/build-decision.md",
    ".codex/commands/build-spec.md",
    ".codex/commands/build-change.md",
    ".codex/commands/run-team.md",
  ];
}

function commandDoc(command: WorkflowCommand): string {
  const protocol = command.protocol;
  const artifacts = getDiscoveryArtifactContractsForCommand(command.trigger);
  if (!protocol || protocol.depth === "shallow") {
    return shallowCommandDoc(command, artifacts);
  }

  return `# ${command.trigger}

${command.description}

Source of truth: \`.openworkflow/\`.

Stage: \`${command.stage}\`.

Interaction mode: \`${protocol.interactionMode}\`.

## Required Context

${list(protocol.requiredContext)}

## Optional Context

${list(protocol.optionalContext)}

## Forbidden Context

${list(protocol.forbiddenContext)}

## Allowed Outputs

${list(protocol.allowedOutputs)}

## Artifact Contracts

${artifactList(artifacts)}

## Forbidden Outputs

${list(protocol.forbiddenOutputs)}

## Audit Checkpoints

Before:

${list(protocol.auditCheckpoints.before)}

During:

${list(protocol.auditCheckpoints.during)}

After:

${list(protocol.auditCheckpoints.after)}

## Working Protocol

1. Load only the required context packet first.
2. Use optional context only when the required packet is insufficient.
3. Stay inside allowed outputs.
4. Stop before creating any forbidden output.
5. Record unresolved questions instead of expanding scope.

## Anti-Patterns

${list(protocol.antiPatterns)}

## Handoff

${list(protocol.handoffCommands)}
`;
}

function shallowCommandDoc(command: WorkflowCommand, artifacts = getDiscoveryArtifactContractsForCommand(command.trigger)): string {
  return `# ${command.trigger}

${command.description}

Source of truth: \`.openworkflow/\`.

Stage: \`${command.stage}\`.

Target artifacts:

${command.targetArtifacts.map((artifact) => `- \`${artifact}\``).join("\n")}

Artifact contracts:

${artifactList(artifacts)}

Load only the contract files required for this stage. Keep artifacts short, scoped, and traceable through \`.openworkflow/workflow/CONTRACT_GRAPH.yaml\`.
`;
}

function list(items: string[]): string {
  if (items.length === 0) {
    return "- None";
  }
  return items.map((item) => `- \`${item}\``).join("\n");
}

function artifactList(artifacts: ReturnType<typeof getDiscoveryArtifactContractsForCommand>): string {
  if (artifacts.length === 0) {
    return "- None";
  }
  return artifacts
    .map(
      (artifact) =>
        `- \`${artifact.artifactType}\`: source \`${artifact.sourceOfTruthPath}\`, note \`${artifact.notePath}\`, review \`${artifact.reviewPath ?? "none"}\``,
    )
    .join("\n");
}
