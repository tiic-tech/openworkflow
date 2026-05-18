import { join, relative } from "node:path";
import { COMMAND_NAMESPACE, getWorkflowCommands } from "../../../core/src/commands/registry.js";
import { dumpYaml } from "../../../core/src/contracts/yaml.js";
import { codexCommandPath, codexPromptDisplayPath, codexPromptPath, codexPromptPathForId } from "./generateCommands.js";
import { CODEX_ADAPTER_VERSION } from "./templates.js";

export const CODEX_MANIFEST_PATH = ".codex/openworkflow-adapter.yaml";
export const LEGACY_CODEX_MANIFEST_PATHS = [".openworkflow/adapters/codex.yaml"] as const;
export const CODEX_MANIFEST_TEMPLATE_ID = "codex.manifest";

export function codexManifest(root: string, files: string[]): string {
  return dumpYaml({
    adapter: "codex",
    adapter_version: CODEX_ADAPTER_VERSION,
    generated_by: "openworkflow",
    delivery: "global-prompts",
    source_of_truth: ".openworkflow",
    command_namespace: COMMAND_NAMESPACE,
    prompt_surface: {
      directory: "$CODEX_HOME/prompts",
      fallback_directory: "~/.codex/prompts",
      path_pattern: "ow-<id>.md",
      frontmatter: ["description", "argument-hint"],
    },
    repo_local_commands: {
      role: "reference/audit docs",
      path_pattern: ".codex/commands/ow/<id>.md",
    },
    commands: getWorkflowCommands().map((command) => ({
      id: command.id,
      trigger: command.trigger,
      prompt_path: codexPromptDisplayPath(command),
      prompt_fallback_path: `~/.codex/prompts/${codexPromptPath(command)}`,
      prompt_filename: codexPromptPath(command),
      prompt_aliases: command.legacyTriggers
        .map((trigger) => codexPromptIdFromTrigger(trigger))
        .filter((id): id is string => id !== null && id !== command.id)
        .map((id) => ({
          trigger: `/${COMMAND_NAMESPACE}:${id}`,
          prompt_path: `$CODEX_HOME/prompts/${codexPromptPathForId(id)}`,
          prompt_fallback_path: `~/.codex/prompts/${codexPromptPathForId(id)}`,
          prompt_filename: codexPromptPathForId(id),
        })),
      reference_path: codexCommandPath(command),
      legacy_triggers: command.legacyTriggers,
    })),
    generated_files: files.map((path) => relative(root, join(root, path))),
    sync_command: "openworkflow sync --tools codex",
  });
}

function codexPromptIdFromTrigger(trigger: string): string | null {
  const match = trigger.match(/^\/ow:([a-z0-9-]+)$/);
  return match?.[1] ?? null;
}
