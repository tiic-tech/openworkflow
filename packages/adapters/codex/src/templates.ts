import { generateSkillTemplates } from "./generateSkills.js";
import { CODEX_ADAPTER_VERSION } from "./constants.js";

export interface CodexTemplate {
  id: string;
  path: string;
  content: string;
}

export function getCodexTemplates(): CodexTemplate[] {
  return generateSkillTemplates();
}
