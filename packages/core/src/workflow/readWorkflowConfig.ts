import { join } from "node:path";
import { parseYaml } from "../contracts/yaml.js";
import { isNotFound, readTextFile } from "../fs/index.js";

export interface WorkflowConfigSnapshot {
  projectSlug?: string;
  projectTitle?: string;
  tools: string[];
}

export async function readWorkflowConfig(root: string): Promise<WorkflowConfigSnapshot | null> {
  let content: string;
  try {
    content = await readTextFile(join(root, ".openworkflow", "config.yaml"));
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }

  const data = parseYaml(content);
  if (!isRecord(data)) {
    return { tools: [] };
  }

  return {
    projectSlug: typeof data.project_slug === "string" ? data.project_slug : undefined,
    projectTitle: typeof data.project_title === "string" ? data.project_title : undefined,
    tools: Array.isArray(data.tools) ? data.tools.filter((tool): tool is string => typeof tool === "string") : [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
