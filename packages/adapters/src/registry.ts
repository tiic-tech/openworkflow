import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { InitOptions } from "../../core/src/contracts/index.js";
import { isNotFound } from "../../core/src/fs/index.js";
import { readWorkflowConfig } from "../../core/src/workflow/readWorkflowConfig.js";
import { doctorCodexAdapter, type AdapterDoctorResult } from "../codex/src/doctorCodexAdapter.js";
import { generateCodexAdapter, type AdapterResult } from "../codex/src/generateCodexAdapter.js";
import { CODEX_MANIFEST_PATH } from "../codex/src/manifest.js";

export interface AdapterRegistryEntry {
  id: string;
  displayName: string;
  detect(root: string): Promise<boolean>;
  sync(options: InitOptions): Promise<AdapterResult>;
  doctor(root: string): Promise<AdapterDoctorResult>;
}

export interface PlatformDetectionResult {
  detected: string[];
  configured: string[];
  unknownConfigured: string[];
  evidence: string[];
}

const REGISTRY: AdapterRegistryEntry[] = [
  {
    id: "codex",
    displayName: "Codex",
    detect: detectCodex,
    sync: generateCodexAdapter,
    doctor: doctorCodexAdapter,
  },
];

export function getAdapterRegistry(): AdapterRegistryEntry[] {
  return [...REGISTRY];
}

export function getSupportedAdapterIds(): string[] {
  return REGISTRY.map((entry) => entry.id);
}

export function getAdapterEntry(id: string): AdapterRegistryEntry | undefined {
  return REGISTRY.find((entry) => entry.id === id);
}

export async function detectAdapterPlatforms(root: string): Promise<PlatformDetectionResult> {
  const configured = (await readWorkflowConfig(root))?.tools ?? [];
  const supported = new Set(getSupportedAdapterIds());
  const detected = new Set<string>();
  const evidence: string[] = [];
  const unknownConfigured: string[] = [];

  for (const tool of configured) {
    if (supported.has(tool)) {
      detected.add(tool);
      evidence.push(`configured tool in .openworkflow/config.yaml: ${tool}`);
    } else {
      unknownConfigured.push(tool);
    }
  }

  for (const entry of REGISTRY) {
    if (detected.has(entry.id)) {
      continue;
    }
    if (await entry.detect(root)) {
      detected.add(entry.id);
      evidence.push(`detected ${entry.id} adapter surface`);
    }
  }

  return {
    detected: [...detected],
    configured,
    unknownConfigured,
    evidence,
  };
}

async function detectCodex(root: string): Promise<boolean> {
  for (const relativePath of [
    CODEX_MANIFEST_PATH,
    ".agents/skills/ow-vision/SKILL.md",
    ".agents/skills/ow-workflow/SKILL.md",
  ]) {
    if (await exists(join(root, relativePath))) {
      return true;
    }
  }
  return false;
}

async function exists(path: string): Promise<boolean> {
  try {
    const info = await stat(path);
    return info.isFile() || info.isDirectory();
  } catch (error) {
    if (isNotFound(error)) {
      return false;
    }
    throw error;
  }
}
