import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { InitOptions } from "../contracts/index.js";
import { isNotFound, readTextFile } from "../fs/index.js";
import { renderOpenWorkflowManagedFiles } from "./initOpenWorkflow.js";

export interface WorkflowSyncResult {
  added: string[];
  updated: string[];
  unchanged: string[];
  preserved: string[];
  warnings: string[];
  migrationNotes: string[];
}

export async function syncOpenWorkflow(options: InitOptions): Promise<WorkflowSyncResult> {
  const added: string[] = [];
  const updated: string[] = [];
  const unchanged: string[] = [];
  const preserved: string[] = [];
  const warnings: string[] = [];
  const migrationNotes: string[] = [];

  for (const file of renderOpenWorkflowManagedFiles(options)) {
    const path = join(options.root, file.relativePath);
    const existing = await readOptional(path);
    if (existing === null) {
      await writeManaged(path, file.content);
      added.push(path);
      migrationNotes.push(`added missing managed workflow file: ${file.relativePath}`);
      continue;
    }
    if (existing === file.content) {
      unchanged.push(path);
      continue;
    }
    if (file.refreshPolicy === "missing-only") {
      preserved.push(path);
      migrationNotes.push(`preserved existing workflow state file: ${file.relativePath}`);
      continue;
    }
    await writeManaged(path, file.content);
    updated.push(path);
    migrationNotes.push(`refreshed managed workflow file: ${file.relativePath}`);
  }

  return { added, updated, unchanged, preserved, warnings, migrationNotes };
}

async function readOptional(path: string): Promise<string | null> {
  try {
    return await readTextFile(path);
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }
}

async function writeManaged(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
}
