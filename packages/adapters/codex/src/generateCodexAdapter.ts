import { join, relative } from "node:path";
import type { InitOptions } from "../../../core/src/contracts.js";
import { ensureDir, isNotFound, readTextFile, writeTextFile } from "../../../core/src/fs.js";
import { dumpYaml } from "../../../core/src/yaml.js";
import { CODEX_ADAPTER_VERSION, getCodexTemplates } from "./templates.js";

export interface AdapterResult {
  written: string[];
  skipped: string[];
  unchanged: string[];
  warnings: string[];
}

export async function generateCodexAdapter(options: InitOptions): Promise<AdapterResult> {
  const written: string[] = [];
  const skipped: string[] = [];
  const unchanged: string[] = [];
  const warnings: string[] = [];
  const templates = getCodexTemplates();
  const dirs = [".codex/agents", ".codex/skills", ".codex/commands", ".openworkflow/adapters"];

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
    join(options.root, ".openworkflow/adapters/codex.yaml"),
    renderGeneratedFile(".openworkflow/adapters/codex.yaml", codexManifest(options.root, templates.map((template) => template.path)), "codex.manifest"),
    options.force,
    written,
    skipped,
    unchanged,
    warnings,
  );

  return { written, skipped, unchanged, warnings };
}

export interface AdapterDoctorResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export async function doctorCodexAdapter(root: string): Promise<AdapterDoctorResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const templates = getCodexTemplates();

  for (const template of templates) {
    const path = join(root, template.path);
    const expected = renderGeneratedFile(template.path, template.content, template.id);
    let actual: string;
    try {
      actual = await readTextFile(path);
    } catch (error) {
      if (isNotFound(error)) {
        errors.push(`missing Codex adapter file: ${template.path}`);
        continue;
      }
      throw error;
    }
    if (!hasGeneratedMarker(actual)) {
      errors.push(`Codex adapter file is not marked as generated: ${template.path}`);
      continue;
    }
    if (!actual.includes(`template-id: ${template.id}`)) {
      errors.push(`Codex adapter file has unexpected template id: ${template.path}`);
    }
    if (actual !== expected) {
      warnings.push(`Codex adapter file is stale: ${template.path}`);
    }
  }

  const manifestPath = ".openworkflow/adapters/codex.yaml";
  const expectedManifest = renderGeneratedFile(manifestPath, codexManifest(root, templates.map((template) => template.path)), "codex.manifest");
  try {
    const manifest = await readTextFile(join(root, manifestPath));
    if (!hasGeneratedMarker(manifest)) {
      errors.push(`Codex adapter manifest is not marked as generated: ${manifestPath}`);
    } else if (manifest !== expectedManifest) {
      warnings.push(`Codex adapter manifest is stale: ${manifestPath}`);
    }
  } catch (error) {
    if (isNotFound(error)) {
      errors.push(`missing Codex adapter manifest: ${manifestPath}`);
    } else {
      throw error;
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

async function writeGenerated(
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

function renderGeneratedFile(path: string, content: string, templateId: string): string {
  const marker = `generated-by: openworkflow; adapter: codex; adapter-version: ${CODEX_ADAPTER_VERSION}; template-id: ${templateId}`;
  if (path.endsWith(".yaml") || path.endsWith(".yml")) {
    return `# ${marker}\n${content}`;
  }
  return `<!-- ${marker} -->\n${content}`;
}

function hasGeneratedMarker(content: string): boolean {
  return content.includes("generated-by: openworkflow");
}

function codexManifest(root: string, files: string[]): string {
  return dumpYaml({
    adapter: "codex",
    adapter_version: CODEX_ADAPTER_VERSION,
    generated_by: "openworkflow",
    delivery: "project-local",
    source_of_truth: ".openworkflow",
    generated_files: files.map((path) => relative(root, join(root, path))),
    sync_command: "openworkflow sync --tools codex",
  });
}
