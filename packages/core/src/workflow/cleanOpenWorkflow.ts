import { rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { isNotFound } from "../fs/index.js";

export interface CleanTarget {
  path: string;
  reason: string;
}

export interface CleanResult {
  planned: CleanTarget[];
  removed: string[];
  skipped: string[];
  warnings: string[];
  dryRun: boolean;
}

export interface CleanOptions {
  root: string;
  yes: boolean;
}

export async function cleanOpenWorkflow(options: CleanOptions): Promise<CleanResult> {
  const dryRun = !options.yes;
  const target = join(options.root, ".openworkflow");
  const planned: CleanTarget[] = [];
  const removed: string[] = [];
  const skipped: string[] = [];
  const warnings: string[] = [];

  if (!(await exists(target))) {
    skipped.push(target);
    return { planned, removed, skipped, warnings, dryRun };
  }

  planned.push({ path: target, reason: "OpenWorkflow project state" });
  if (dryRun) {
    return { planned, removed, skipped, warnings, dryRun };
  }

  await rm(target, { recursive: true, force: true });
  removed.push(target);
  return { planned, removed, skipped, warnings, dryRun };
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (isNotFound(error)) {
      return false;
    }
    throw error;
  }
}
