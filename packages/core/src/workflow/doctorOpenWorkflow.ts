import { join } from "node:path";
import type { InitOptions } from "../contracts/index.js";
import { isNotFound, readTextFile } from "../fs/index.js";
import { renderOpenWorkflowManagedFiles } from "./initOpenWorkflow.js";

export interface WorkflowDoctorResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export async function doctorOpenWorkflow(options: InitOptions): Promise<WorkflowDoctorResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const file of renderOpenWorkflowManagedFiles(options)) {
    const path = join(options.root, file.relativePath);
    let actual: string;
    try {
      actual = await readTextFile(path);
    } catch (error) {
      if (isNotFound(error)) {
        errors.push(`missing managed workflow file: ${file.relativePath}; run openworkflow sync to add it`);
        continue;
      }
      throw error;
    }
    if (file.refreshPolicy === "refresh" && actual !== file.content) {
      warnings.push(`stale managed workflow file: ${file.relativePath}; run openworkflow sync to refresh it`);
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
