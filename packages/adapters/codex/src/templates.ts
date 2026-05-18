import { generateAgentTemplates } from "./generateAgents.js";
import { generateCommandTemplates } from "./generateCommands.js";
import { generateSkillTemplates } from "./generateSkills.js";

export const CODEX_ADAPTER_VERSION = "0.1.0";

export interface CodexTemplate {
  id: string;
  path: string;
  content: string;
}

export function getCodexTemplates(): CodexTemplate[] {
  return [
    ...generateAgentTemplates(),
    ...generateCommandTemplates(),
    ...generateSkillTemplates(),
  ];
}
