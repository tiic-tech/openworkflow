export function parseTools(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }
  return raw.split(",").map((tool) => tool.trim()).filter(Boolean);
}

export function basenameForTitle(path: string): string {
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts.at(-1) ?? "OpenWorkflow Project";
}

export function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "project";
}

export function printWarnings(warnings: string[]): void {
  for (const warning of warnings) {
    console.warn(`Warning: ${warning}`);
  }
}
