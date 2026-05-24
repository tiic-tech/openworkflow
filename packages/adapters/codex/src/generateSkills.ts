import type { CodexTemplate } from "./templates.js";
import { CODEX_ADAPTER_VERSION } from "./constants.js";
import { getWorkflowCommands, type WorkflowCommand } from "../../../core/src/commands/registry.js";
import { commandDoc } from "./generateCommands.js";

export function generateSkillTemplates(): CodexTemplate[] {
  return getWorkflowCommands().flatMap((command) => [
    {
      id: `codex.skill.${command.namespace}.${command.id}`,
      path: codexSkillPath(command),
      content: codexSkill(command),
    },
    {
      id: `codex.skill-interface.${command.namespace}.${command.id}`,
      path: codexSkillInterfacePath(command),
      content: codexSkillInterface(command),
    },
  ]);
}

export function codexSkillName(command: WorkflowCommand): string {
  return `${command.namespace}-${command.id}`;
}

export function codexSkillPath(command: WorkflowCommand): string {
  return `.agents/skills/${codexSkillName(command)}/SKILL.md`;
}

export function codexSkillInterfacePath(command: WorkflowCommand): string {
  return `.agents/skills/${codexSkillName(command)}/agents/openai.yaml`;
}

export function legacyCodexSkillPaths(): string[] {
  return [".codex/skills/openworkflow.md"];
}

function codexSkill(command: WorkflowCommand): string {
  const skillName = codexSkillName(command);
  const templateId = codexSkillTemplateId(command);
  const description =
    command.visibility === "internal"
      ? `${command.description} Internal audit skill for ${command.trigger} in OpenWorkflow repositories.`
      : `${command.description} Use this skill for ${command.trigger} in OpenWorkflow repositories.`;
  return `---
name: ${yamlString(skillName)}
description: ${yamlString(description)}
metadata:
  generated_by: ${yamlString("openworkflow")}
  adapter: ${yamlString("codex")}
  adapter_version: ${yamlString(CODEX_ADAPTER_VERSION)}
  template_id: ${yamlString(templateId)}
  source_command_id: ${yamlString(command.id)}
  semantic_trigger: ${yamlString(command.trigger)}
  skill_name: ${yamlString(skillName)}
---
${commandDoc(command)}

<codex_skill>
- Skill name: ${skillName}
- Explicit invocation: $${skillName}
- Semantic command: ${command.trigger}
</codex_skill>
`;
}

function codexSkillTemplateId(command: WorkflowCommand): string {
  return `codex.skill.${command.namespace}.${command.id}`;
}

function codexSkillInterface(command: WorkflowCommand): string {
  return `interface:
  display_name: ${yamlString(displayName(command))}
  short_description: ${yamlString(command.visibility === "internal" ? `${command.description} Internal audit only.` : command.description)}
  default_prompt: ${yamlString(`Use ${command.trigger} for this OpenWorkflow repository.`)}
`;
}

function displayName(command: WorkflowCommand): string {
  return command.trigger.startsWith("/") ? command.trigger.slice(1) : command.trigger;
}

function yamlString(value: string): string {
  return JSON.stringify(value);
}
