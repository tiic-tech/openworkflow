import { readdir, rm, rmdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { isNotFound } from "../fs/index.js";
import { openWorkflowManagedRelativePaths } from "./initOpenWorkflow.js";

export interface CleanTarget {
  path: string;
  reason: string;
}

export interface CleanResult {
  planned: CleanTarget[];
  removed: string[];
  updated: string[];
  skipped: string[];
  preserved: string[];
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
  const updated: string[] = [];
  const skipped: string[] = [];
  const preserved: string[] = [];
  const warnings: string[] = [];

  if (!(await exists(target))) {
    skipped.push(target);
    return { planned, removed, updated, skipped, preserved, warnings, dryRun };
  }

  const managedPaths = openWorkflowManagedRelativePaths().map((relativePath) => join(options.root, relativePath));
  const managedPathSet = new Set(managedPaths);
  for (const path of managedPaths) {
    if (await exists(path)) {
      planned.push({ path, reason: "OpenWorkflow managed metadata" });
    }
  }
  preserved.push(...await collectPreservedPaths(target, managedPathSet));

  if (dryRun) {
    return { planned, removed, updated, skipped, preserved, warnings, dryRun };
  }

  for (const path of managedPaths) {
    if (await exists(path)) {
      await rm(path, { force: true });
      removed.push(path);
    }
  }
  removed.push(...await pruneManagedDirs(options.root, managedPaths));
  if (preserved.length > 0) {
    warnings.push(`Preserved ${preserved.length} non-managed .openworkflow path(s).`);
  }
  return { planned, removed, updated, skipped, preserved, warnings, dryRun };
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

async function collectPreservedPaths(root: string, managedPathSet: Set<string>): Promise<string[]> {
  const preserved: string[] = [];
  await walk(root, preserved, managedPathSet);
  return preserved.sort();
}

async function walk(path: string, preserved: string[], managedPathSet: Set<string>): Promise<void> {
  let info;
  try {
    info = await stat(path);
  } catch (error) {
    if (isNotFound(error)) {
      return;
    }
    throw error;
  }

  if (info.isFile()) {
    if (!managedPathSet.has(path)) {
      preserved.push(path);
    }
    return;
  }

  if (!info.isDirectory()) {
    if (!managedPathSet.has(path)) {
      preserved.push(path);
    }
    return;
  }

  const entries = await readdir(path);
  for (const entry of entries) {
    await walk(join(path, entry), preserved, managedPathSet);
  }
}

async function pruneManagedDirs(root: string, managedPaths: string[]): Promise<string[]> {
  const dirs = new Set<string>([join(root, ".openworkflow")]);
  for (const path of managedPaths) {
    let current = dirname(path);
    while (current.startsWith(join(root, ".openworkflow"))) {
      dirs.add(current);
      const parent = dirname(current);
      if (parent === current || parent === root) {
        break;
      }
      current = parent;
    }
  }

  const removed: string[] = [];
  const sorted = [...dirs].sort((a, b) => b.length - a.length);
  for (const dir of sorted) {
    if (await removeIfEmpty(dir)) {
      removed.push(dir);
    }
  }
  return removed;
}

async function removeIfEmpty(path: string): Promise<boolean> {
  try {
    const entries = await readdir(path);
    if (entries.length > 0) {
      return false;
    }
    await rmdir(path);
    return true;
  } catch (error) {
    if (isNotFound(error)) {
      return false;
    }
    throw error;
  }
}
