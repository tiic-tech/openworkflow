import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { getDiscoveryArtifactContracts, type DiscoveryArtifactContract } from "../artifacts/registry.js";
import type { InitOptions } from "../contracts/index.js";
import { dumpYaml, parseYaml } from "../contracts/yaml.js";
import { isNotFound, readTextFile } from "../fs/index.js";
import { renderOpenWorkflowManagedFiles } from "./initOpenWorkflow.js";

export interface WorkflowSyncResult {
  added: string[];
  updated: string[];
  unchanged: string[];
  preserved: string[];
  warnings: string[];
  migrationNotes: string[];
  stateReconciliation: StateReconciliationResult;
}

export interface StateReconciliationResult {
  attempted: boolean;
  reconciled: boolean;
  reason: string;
  current_state_path: string;
  restored_pointers: Record<string, string>;
  active_stage: string | null;
  next_command: string | null;
  read_this_first: string[];
  warnings: string[];
}

export async function syncOpenWorkflow(options: InitOptions): Promise<WorkflowSyncResult> {
  const added: string[] = [];
  const updated: string[] = [];
  const unchanged: string[] = [];
  const preserved: string[] = [];
  const warnings: string[] = [];
  const migrationNotes: string[] = [];
  let shouldReconcileCurrentState = false;

  for (const file of renderOpenWorkflowManagedFiles(options)) {
    const path = join(options.root, file.relativePath);
    const existing = await readOptional(path);
    if (existing === null) {
      await writeManaged(path, file.content);
      added.push(path);
      migrationNotes.push(`added missing managed workflow file: ${file.relativePath}`);
      if (file.relativePath === ".openworkflow/CURRENT_STATE.yaml") {
        shouldReconcileCurrentState = true;
      }
      continue;
    }
    if (existing === file.content) {
      unchanged.push(path);
      if (file.relativePath === ".openworkflow/CURRENT_STATE.yaml") {
        shouldReconcileCurrentState = true;
      }
      continue;
    }
    if (file.refreshPolicy === "missing-only") {
      preserved.push(path);
      migrationNotes.push(`preserved existing workflow state file: ${file.relativePath}`);
      continue;
    }
    await writeManaged(path, file.content);
    updated.push(path);
    migrationNotes.push(`refreshed managed workflow file: ${file.relativePath}`);
  }

  const stateReconciliation = await reconcileCurrentState(options.root, shouldReconcileCurrentState);
  warnings.push(...stateReconciliation.warnings);
  if (stateReconciliation.reconciled) {
    const currentStatePath = join(options.root, ".openworkflow", "CURRENT_STATE.yaml");
    if (!updated.includes(currentStatePath)) {
      updated.push(currentStatePath);
    }
    migrationNotes.push(`reconciled CURRENT_STATE.yaml from preserved indexes: ${Object.keys(stateReconciliation.restored_pointers).join(", ")}`);
  }

  return { added, updated, unchanged, preserved, warnings, migrationNotes, stateReconciliation };
}

async function readOptional(path: string): Promise<string | null> {
  try {
    return await readTextFile(path);
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }
}

async function writeManaged(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
}

async function reconcileCurrentState(root: string, shouldAttempt: boolean): Promise<StateReconciliationResult> {
  const currentStatePath = ".openworkflow/CURRENT_STATE.yaml";
  const empty = emptyReconciliation(currentStatePath, shouldAttempt ? "no_current_pointers_found" : "current_state_preserved");
  if (!shouldAttempt) {
    return empty;
  }

  const state = await readYamlRecordOptional(join(root, currentStatePath));
  if (!state) {
    return {
      ...empty,
      attempted: true,
      reason: "current_state_missing_after_sync",
      warnings: ["CURRENT_STATE.yaml could not be read after sync wrote managed files"],
    };
  }

  const restoredPointers: Record<string, string> = {};
  const readThisFirst = [
    ".openworkflow/CURRENT_STATE.yaml",
    ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
    ".openworkflow/audit/COMMAND_AUDIT_INDEX.yaml",
    ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
  ];
  const warnings: string[] = [];
  let activeStage: string | null = null;
  let nextCommand: string | null = null;

  for (const contract of getDiscoveryArtifactContracts()) {
    const recovered = await recoverPointer(root, contract);
    warnings.push(...recovered.warnings);
    if (!recovered.path) {
      continue;
    }
    restoredPointers[contract.activePointer.pointerKey] = recovered.path;
    readThisFirst.push(contract.indexPath, recovered.path);
    activeStage = contract.contractType;
    nextCommand = inferNextCommand(contract, recovered.artifact);
  }

  if (Object.keys(restoredPointers).length === 0) {
    return {
      ...empty,
      attempted: true,
      warnings,
    };
  }

  const reconciledState = {
    ...state,
    active_stage: activeStage,
    ...restoredPointers,
    next_command: nextCommand,
    read_this_first: unique(readThisFirst),
  };
  await writeManaged(join(root, currentStatePath), dumpYaml(reconciledState));

  return {
    attempted: true,
    reconciled: true,
    reason: "restored_from_preserved_indexes",
    current_state_path: currentStatePath,
    restored_pointers: restoredPointers,
    active_stage: activeStage,
    next_command: nextCommand,
    read_this_first: unique(readThisFirst),
    warnings,
  };
}

async function recoverPointer(
  root: string,
  contract: DiscoveryArtifactContract,
): Promise<{ path: string | null; artifact: Record<string, unknown> | null; warnings: string[] }> {
  const warnings: string[] = [];
  const index = await readYamlRecordOptional(join(root, contract.indexPath));
  if (!index) {
    return { path: null, artifact: null, warnings };
  }

  const pointer = index[contract.activePointer.pointerKey];
  if (pointer === null || pointer === undefined) {
    return { path: null, artifact: null, warnings };
  }
  if (typeof pointer !== "string" || pointer.length === 0) {
    warnings.push(`${contract.indexPath} has invalid ${contract.activePointer.pointerKey}; CURRENT_STATE could not recover ${contract.artifactType}`);
    return { path: null, artifact: null, warnings };
  }

  const collection = index[contract.activePointer.collectionKey];
  if (!Array.isArray(collection)) {
    warnings.push(`${contract.indexPath} missing ${contract.activePointer.collectionKey}; CURRENT_STATE could not recover ${contract.artifactType}`);
    return { path: null, artifact: null, warnings };
  }
  const entry = collection.find((item) => isRecord(item) && item[contract.activePointer.idKey] === pointer);
  if (!isRecord(entry)) {
    warnings.push(`${contract.indexPath} ${contract.activePointer.pointerKey} references missing entry ${pointer}`);
    return { path: null, artifact: null, warnings };
  }

  const artifactPath = entry[contract.activePointer.pathKey];
  if (typeof artifactPath !== "string" || artifactPath.length === 0) {
    warnings.push(`${contract.indexPath} entry ${pointer} missing ${contract.activePointer.pathKey}; CURRENT_STATE could not recover ${contract.artifactType}`);
    return { path: null, artifact: null, warnings };
  }

  const artifact = await readYamlRecordOptional(join(root, artifactPath));
  if (!artifact) {
    warnings.push(`${contract.indexPath} entry ${pointer} references unreadable artifact: ${artifactPath}`);
  }
  return { path: artifactPath, artifact, warnings };
}

function inferNextCommand(contract: DiscoveryArtifactContract, artifact: Record<string, unknown> | null): string | null {
  const handoff = artifact ? valueAtPath(artifact, contract.handoffKey) : null;
  if (typeof handoff === "string" && handoff.startsWith("/ow:")) {
    return handoff;
  }
  return fallbackNextCommand(contract.artifactType);
}

function fallbackNextCommand(artifactType: string): string | null {
  if (artifactType === "vision_session") {
    return "/ow:validation";
  }
  if (artifactType === "validation_target") {
    return "/ow:proto";
  }
  if (artifactType === "prototype_evidence") {
    return "/ow:tune";
  }
  if (artifactType === "product_design") {
    return "/ow:spec";
  }
  if (artifactType === "production_spec") {
    return "/ow:change";
  }
  if (artifactType === "production_change") {
    return "/ow:team";
  }
  if (artifactType === "team_runtime") {
    return "/ow:team";
  }
  return null;
}

function valueAtPath(record: Record<string, unknown>, path: string): unknown {
  let current: unknown = record;
  for (const part of path.split(".")) {
    if (!isRecord(current)) {
      return null;
    }
    current = current[part];
  }
  return current;
}

async function readYamlRecordOptional(path: string): Promise<Record<string, unknown> | null> {
  const content = await readOptional(path);
  if (content === null) {
    return null;
  }
  const parsed = parseYaml(content);
  return isRecord(parsed) ? parsed : null;
}

function emptyReconciliation(currentStatePath: string, reason: string): StateReconciliationResult {
  return {
    attempted: reason !== "current_state_preserved",
    reconciled: false,
    reason,
    current_state_path: currentStatePath,
    restored_pointers: {},
    active_stage: null,
    next_command: null,
    read_this_first: [],
    warnings: [],
  };
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
