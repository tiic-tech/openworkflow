import { join, relative } from "node:path";
import { COMMAND_NAMESPACE, getWorkflowCommands } from "../../../core/src/commands/registry.js";
import { dumpYaml } from "../../../core/src/contracts/yaml.js";
import { codexSkillInterfacePath, codexSkillName, codexSkillPath } from "./generateSkills.js";
import { CODEX_ADAPTER_VERSION } from "./templates.js";

export const CODEX_MANIFEST_PATH = ".agents/openworkflow-adapter.yaml";
export const LEGACY_CODEX_MANIFEST_PATHS = [
  ".openworkflow/adapters/codex.yaml",
  ".codex/openworkflow-adapter.yaml",
] as const;
export const CODEX_MANIFEST_TEMPLATE_ID = "codex.manifest";

export function codexManifest(root: string, files: string[]): string {
  return dumpYaml({
    adapter: "codex",
    adapter_version: CODEX_ADAPTER_VERSION,
    generated_by: "openworkflow",
    delivery: "repo-local-skills",
    source_of_truth: ".openworkflow",
    command_namespace: COMMAND_NAMESPACE,
    skill_surface: {
      directory: ".agents/skills",
      path_pattern: ".agents/skills/ow-<id>/SKILL.md",
      interface_metadata: "agents/openai.yaml",
      frontmatter: ["name", "description"],
    },
    commands: getWorkflowCommands().map((command) => ({
      id: command.id,
      trigger: command.trigger,
      skill_name: codexSkillName(command),
      explicit_invocation: `$${codexSkillName(command)}`,
      skill_path: codexSkillPath(command),
      interface_path: codexSkillInterfacePath(command),
      legacy_triggers: command.legacyTriggers,
    })),
    generated_files: files.map((path) => relative(root, join(root, path))),
    sync_command: "openworkflow sync --tools codex",
  });
}
