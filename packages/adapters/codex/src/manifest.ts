import { join, relative } from "node:path";
import { dumpYaml } from "../../../core/src/contracts/yaml.js";
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
    generated_files: files.map((path) => relative(root, join(root, path))),
    sync_command: "openworkflow sync --tools codex",
  });
}
