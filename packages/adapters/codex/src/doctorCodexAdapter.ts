import { join } from "node:path";
import { isNotFound, readTextFile } from "../../../core/src/fs/index.js";
import { hasGeneratedMarker, renderGeneratedFile } from "./generatedFiles.js";
import { CODEX_MANIFEST_PATH, CODEX_MANIFEST_TEMPLATE_ID, codexManifest } from "./manifest.js";
import { getCodexTemplates } from "./templates.js";

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

  const expectedManifest = renderGeneratedFile(
    CODEX_MANIFEST_PATH,
    codexManifest(root, templates.map((template) => template.path)),
    CODEX_MANIFEST_TEMPLATE_ID,
  );
  try {
    const manifest = await readTextFile(join(root, CODEX_MANIFEST_PATH));
    if (!hasGeneratedMarker(manifest)) {
      errors.push(`Codex adapter manifest is not marked as generated: ${CODEX_MANIFEST_PATH}`);
    } else if (manifest !== expectedManifest) {
      warnings.push(`Codex adapter manifest is stale: ${CODEX_MANIFEST_PATH}`);
    }
  } catch (error) {
    if (isNotFound(error)) {
      errors.push(`missing Codex adapter manifest: ${CODEX_MANIFEST_PATH}`);
    } else {
      throw error;
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
