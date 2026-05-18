import { homedir } from "node:os";
import { join } from "node:path";
import { getWorkflowCommands } from "../../../core/src/commands/registry.js";
import type { InitOptions } from "../../../core/src/contracts/index.js";
import { ensureDir } from "../../../core/src/fs/index.js";
import { removeGenerated, renderGeneratedFile, writeGenerated } from "./generatedFiles.js";
import { codexPromptIdFromTrigger, codexPromptPathForId, legacyCodexCommandPaths } from "./generateCommands.js";
import { legacyCodexSkillPaths } from "./generateSkills.js";
import {
  CODEX_MANIFEST_PATH,
  CODEX_MANIFEST_TEMPLATE_ID,
  LEGACY_CODEX_MANIFEST_PATHS,
  codexManifest,
} from "./manifest.js";
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
  const dirs = [".agents"];

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
  for (const legacyPath of legacyCodexSkillPaths()) {
    await removeGenerated(join(options.root, legacyPath), options.force, removed, skipped, warnings);
  }
  for (const legacyPath of legacyCodexAgentPaths()) {
    await removeGenerated(join(options.root, legacyPath), options.force, removed, skipped, warnings);
  }
  for (const legacyPath of LEGACY_CODEX_MANIFEST_PATHS) {
    await removeGenerated(join(options.root, legacyPath), options.force, removed, skipped, warnings);
  }
  for (const legacyPromptPath of legacyCodexPromptPaths()) {
    await removeGenerated(legacyPromptPath, false, removed, skipped, warnings);
  }

  return { written, skipped, unchanged, removed, warnings };
}

function legacyCodexAgentPaths(): string[] {
  return [".codex/agents/README.md", ".codex/agents/openworkflow-orchestrator.md"];
}

function legacyCodexPromptPaths(): string[] {
  const codexHome = process.env.CODEX_HOME?.trim() || join(homedir(), ".codex");
  const promptIds = new Set<string>();
  for (const command of getWorkflowCommands()) {
    promptIds.add(command.id);
    for (const legacyTrigger of command.legacyTriggers) {
      const id = codexPromptIdFromTrigger(legacyTrigger);
      if (id) {
        promptIds.add(id);
      }
    }
  }
  return [...promptIds].map((id) => join(codexHome, "prompts", codexPromptPathForId(id)));
}
