import { getWorkflowCommands, type WorkflowCommand } from "../../../core/src/commands/registry.js";
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
  return `# ${command.trigger}

${command.description}

Source of truth: \`.openworkflow/\`.

Stage: \`${command.stage}\`.

Target artifacts:

${command.targetArtifacts.map((artifact) => `- \`${artifact}\``).join("\n")}

Load only the contract files required for this stage. Keep artifacts short, scoped, and traceable through \`.openworkflow/workflow/CONTRACT_GRAPH.yaml\`.
`;
}
