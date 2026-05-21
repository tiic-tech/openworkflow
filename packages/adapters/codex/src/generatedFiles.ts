import { rm } from "node:fs/promises";
import { readTextFile, writeTextFile, isNotFound } from "../../../core/src/fs/index.js";
import { CODEX_ADAPTER_VERSION } from "./constants.js";

export function renderGeneratedFile(path: string, content: string, templateId: string): string {
  const marker = `generated-by: openworkflow; adapter: codex; adapter-version: ${CODEX_ADAPTER_VERSION}; template-id: ${templateId}`;
  if (path.endsWith(".yaml") || path.endsWith(".yml")) {
    return `# ${marker}\n${content}`;
  }
  if (content.startsWith("---\n")) {
    const frontmatterEnd = content.indexOf("\n---\n", 4);
    if (frontmatterEnd !== -1) {
      const endOffset = frontmatterEnd + "\n---\n".length;
      return `${content.slice(0, endOffset)}<!-- ${marker} -->\n${content.slice(endOffset)}`;
    }
  }
  return `<!-- ${marker} -->\n${content}`;
}

export function hasGeneratedMarker(content: string): boolean {
  return content.includes("generated-by: openworkflow");
}

export async function writeGenerated(
  path: string,
  content: string,
  force: boolean,
  written: string[],
  skipped: string[],
  unchanged: string[],
  warnings: string[],
): Promise<void> {
  let existing: string | null = null;
  try {
    existing = await readTextFile(path);
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
  }

  if (existing === content) {
    unchanged.push(path);
    return;
  }

  if (existing && !force && !hasGeneratedMarker(existing)) {
    skipped.push(path);
    warnings.push(`Skipped non-generated file: ${path}`);
    return;
  }

  const action = await writeTextFile(path, content, true);
  if (action === "write") {
    written.push(path);
  } else {
    skipped.push(path);
  }
}

export async function removeGenerated(
  path: string,
  force: boolean,
  removed: string[],
  skipped: string[],
  warnings: string[],
): Promise<void> {
  let existing: string;
  try {
    existing = await readTextFile(path);
  } catch (error) {
    if (isNotFound(error)) {
      return;
    }
    throw error;
  }

  if (!hasGeneratedMarker(existing) && !force) {
    skipped.push(path);
    warnings.push(`Skipped legacy non-generated file: ${path}`);
    return;
  }

  await rm(path);
  removed.push(path);
}
