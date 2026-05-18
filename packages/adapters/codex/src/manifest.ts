import { join, relative } from "node:path";
import { COMMAND_NAMESPACE, getWorkflowCommands } from "../../../core/src/commands/registry.js";
import { dumpYaml } from "../../../core/src/contracts/yaml.js";
import { codexCommandPath } from "./generateCommands.js";
import { CODEX_ADAPTER_VERSION } from "./templates.js";

export const CODEX_MANIFEST_PATH = ".openworkflow/adapters/codex.yaml";
export const CODEX_MANIFEST_TEMPLATE_ID = "codex.manifest";

export function codexManifest(root: string, files: string[]): string {
  return dumpYaml({
    adapter: "codex",
    adapter_version: CODEX_ADAPTER_VERSION,
    generated_by: "openworkflow",
    delivery: "project-local",
    source_of_truth: ".openworkflow",
    command_namespace: COMMAND_NAMESPACE,
    commands: getWorkflowCommands().map((command) => ({
      id: command.id,
      trigger: command.trigger,
      path: codexCommandPath(command),
      legacy_triggers: command.legacyTriggers,
    })),
    generated_files: files.map((path) => relative(root, join(root, path))),
    sync_command: "openworkflow sync --tools codex",
  });
}
