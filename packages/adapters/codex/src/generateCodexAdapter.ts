import { join } from "node:path";
import type { InitOptions } from "../../../core/src/contracts/index.js";
import { ensureDir } from "../../../core/src/fs/index.js";
import { removeGenerated, renderGeneratedFile, writeGenerated } from "./generatedFiles.js";
import { legacyCodexCommandPaths } from "./generateCommands.js";
import { CODEX_MANIFEST_PATH, CODEX_MANIFEST_TEMPLATE_ID, codexManifest } from "./manifest.js";
import { getCodexTemplates } from "./templates.js";

export interface AdapterResult {
  written: string[];
  skipped: string[];
  unchanged: string[];
  removed: string[];
  warnings: string[];
}

export async function generateCodexAdapter(options: InitOptions): Promise<AdapterResult> {
  const written: string[] = [];
  const skipped: string[] = [];
  const unchanged: string[] = [];
  const removed: string[] = [];
  const warnings: string[] = [];
  const templates = getCodexTemplates();
  const dirs = [".codex/agents", ".codex/skills", ".codex/commands/ow", ".openworkflow/adapters"];

  for (const dir of dirs) {
    await ensureDir(join(options.root, dir));
  }

  for (const template of templates) {
    await writeGenerated(
      join(options.root, template.path),
      renderGeneratedFile(template.path, template.content, template.id),
      options.force,
      written,
      skipped,
      unchanged,
      warnings,
    );
  }

  await writeGenerated(
    join(options.root, CODEX_MANIFEST_PATH),
    renderGeneratedFile(CODEX_MANIFEST_PATH, codexManifest(options.root, templates.map((template) => template.path)), CODEX_MANIFEST_TEMPLATE_ID),
    options.force,
    written,
    skipped,
    unchanged,
    warnings,
  );

  for (const legacyPath of legacyCodexCommandPaths()) {
    await removeGenerated(join(options.root, legacyPath), options.force, removed, skipped, warnings);
  }

  return { written, skipped, unchanged, removed, warnings };
}
