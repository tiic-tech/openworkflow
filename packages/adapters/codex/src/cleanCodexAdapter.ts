import { readdir, rm, rmdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { CleanResult, CleanTarget } from "../../../core/src/workflow/cleanOpenWorkflow.js";
import { isNotFound, readTextFile } from "../../../core/src/fs/index.js";
import { CODEX_MANIFEST_PATH, LEGACY_CODEX_MANIFEST_PATHS } from "./manifest.js";
import { getCodexTemplates } from "./templates.js";
import { hasGeneratedMarker } from "./generatedFiles.js";
import { legacyCodexCommandPaths } from "./generateCommands.js";
import { legacyCodexSkillPaths } from "./generateSkills.js";

export interface CleanCodexOptions {
  root: string;
  yes: boolean;
  force: boolean;
}

export async function cleanCodexAdapter(options: CleanCodexOptions): Promise<CleanResult> {
  const dryRun = !options.yes;
  const planned: CleanTarget[] = [];
  const removed: string[] = [];
  const updated: string[] = [];
  const skipped: string[] = [];
  const warnings: string[] = [];

  for (const relativePath of cleanCandidatePaths()) {
    const path = join(options.root, relativePath);
    const content = await readIfFile(path);
    if (content === null) {
      continue;
    }
    if (!options.force && !hasGeneratedMarker(content)) {
      skipped.push(path);
      warnings.push(`Skipped non-generated file: ${path}`);
      continue;
    }
    planned.push({ path, reason: "generated Codex adapter file" });
    if (!dryRun) {
      await rm(path, { force: true });
      removed.push(path);
    }
  }

  if (!dryRun) {
    await pruneCodexDirs(options.root);
  }

  return { planned, removed, updated, skipped, warnings, dryRun };
}

function cleanCandidatePaths(): string[] {
  return [
    ...getCodexTemplates().map((template) => template.path),
    CODEX_MANIFEST_PATH,
    ...legacyCodexCommandPaths(),
    ...legacyCodexSkillPaths(),
    ...legacyCodexAgentPaths(),
    ...LEGACY_CODEX_MANIFEST_PATHS,
  ];
}

function legacyCodexAgentPaths(): string[] {
  return [".codex/agents/README.md", ".codex/agents/openworkflow-orchestrator.md"];
}

async function readIfFile(path: string): Promise<string | null> {
  try {
    const info = await stat(path);
    if (!info.isFile()) {
      return null;
    }
    return readTextFile(path);
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }
}

async function pruneCodexDirs(root: string): Promise<void> {
  const dirs = new Set<string>();
  for (const relativePath of cleanCandidatePaths()) {
    let current = dirname(join(root, relativePath));
    while (current.startsWith(join(root, ".agents")) || current.startsWith(join(root, ".codex"))) {
      dirs.add(current);
      const parent = dirname(current);
      if (parent === current || parent === root) {
        break;
      }
      current = parent;
    }
  }

  const sorted = [...dirs].sort((a, b) => b.length - a.length);
  for (const dir of sorted) {
    await removeIfEmpty(dir);
  }
}

async function removeIfEmpty(path: string): Promise<void> {
  try {
    const entries = await readdir(path);
    if (entries.length === 0) {
      await rmdir(path);
    }
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
  }
}
