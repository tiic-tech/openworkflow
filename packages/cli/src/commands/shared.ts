import { basename, resolve } from "node:path";

export function parseTools(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }
  return raw.split(",").map((tool) => tool.trim()).filter(Boolean);
}

export function basenameForTitle(path: string): string {
  const name = basename(resolve(path));
  if (!name || name === "." || name === "..") {
    return "OpenWorkflow Project";
  }
  return name;
}

export function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "project";
}

export function printWarnings(warnings: string[]): void {
  for (const warning of warnings) {
    console.warn(`Warning: ${warning}`);
  }
}
