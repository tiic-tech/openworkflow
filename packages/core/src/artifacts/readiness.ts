import { join } from "node:path";
import { parseYaml } from "../contracts/yaml.js";
import { isNotFound, readTextFile } from "../fs/index.js";

export interface ArtifactReadinessResult {
  ok: boolean;
  blockers: string[];
  warnings: string[];
}

export async function assessStageReadiness(root: string, command: string, currentState: Record<string, unknown> | null): Promise<ArtifactReadinessResult> {
  if (command === "/ow:proto") {
    return assessCurrentArtifact(root, currentState, "current_validation", validationTargetChecks);
  }
  if (command === "/ow:design") {
    return assessCurrentArtifact(root, currentState, "current_prototype", prototypeEvidenceChecks);
  }
  if (command === "/ow:spec") {
    return assessCurrentArtifact(root, currentState, "current_design", productDesignChecks);
  }
  if (command === "/ow:change") {
    return assessCurrentArtifact(root, currentState, "current_spec", productionSpecChecks);
  }
  if (command === "/ow:team") {
    return assessCurrentArtifact(root, currentState, "current_change", productionChangeChecks);
  }
  return { ok: true, blockers: [], warnings: [] };
}

async function assessCurrentArtifact(
  root: string,
  currentState: Record<string, unknown> | null,
  pointerKey: string,
  check: (path: string, artifact: Record<string, unknown>) => ArtifactReadinessResult,
): Promise<ArtifactReadinessResult> {
  const artifactPath = stringValue(currentState?.[pointerKey]);
  if (!artifactPath) {
    return {
      ok: false,
      blockers: [`CURRENT_STATE.${pointerKey} is required for this command`],
      warnings: [],
    };
  }
  const artifact = await readArtifact(root, artifactPath);
  if (!artifact) {
    return {
      ok: false,
      blockers: [`CURRENT_STATE.${pointerKey} references missing or unreadable artifact: ${artifactPath}`],
      warnings: [],
    };
  }
  return check(artifactPath, artifact);
}

function validationTargetChecks(path: string, artifact: Record<string, unknown>): ArtifactReadinessResult {
  const blockers = commonArtifactBlockers(path, artifact, "validation_target");
  if (!nonEmptyString(artifact.core_question)) {
    blockers.push(`${path} core_question must be non-empty before /ow:proto`);
  }
  if (!hasNonEmptyPath(artifact, ["prototype_scope", "include"])) {
    blockers.push(`${path} prototype_scope.include must name at least one prototype scope item before /ow:proto`);
  }
  if (!nonEmptyArray(artifact.acceptance)) {
    blockers.push(`${path} acceptance must name at least one success criterion before /ow:proto`);
  }
  return result(blockers);
}

function prototypeEvidenceChecks(path: string, artifact: Record<string, unknown>): ArtifactReadinessResult {
  const blockers = commonArtifactBlockers(path, artifact, "prototype_evidence");
  const resultValue = stringValue(artifact.result);
  if (resultValue !== "pass") {
    blockers.push(`${path} result must be pass before /ow:design`);
  }
  const status = stringValue(artifact.status);
  if (status && !["accepted", "reviewed"].includes(status)) {
    blockers.push(`${path} status must be accepted or reviewed before /ow:design`);
  }
  return result(blockers);
}

function productDesignChecks(path: string, artifact: Record<string, unknown>): ArtifactReadinessResult {
  const blockers = commonArtifactBlockers(path, artifact, "product_design");
  if (!hasBooleanPath(artifact, ["spec_readiness", "ready"], true)) {
    blockers.push(`${path} spec_readiness.ready must be true before /ow:spec`);
  }
  return result(blockers);
}

function productionSpecChecks(path: string, artifact: Record<string, unknown>): ArtifactReadinessResult {
  const blockers = commonArtifactBlockers(path, artifact, "production_spec");
  if (!hasBooleanPath(artifact, ["change_readiness", "ready"], true)) {
    blockers.push(`${path} change_readiness.ready must be true before /ow:change`);
  }
  return result(blockers);
}

function productionChangeChecks(path: string, artifact: Record<string, unknown>): ArtifactReadinessResult {
  const blockers = commonArtifactBlockers(path, artifact, "production_change");
  if (!hasBooleanPath(artifact, ["runtime_readiness", "ready"], true)) {
    blockers.push(`${path} runtime_readiness.ready must be true before /ow:team`);
  }
  return result(blockers);
}

function commonArtifactBlockers(path: string, artifact: Record<string, unknown>, artifactType: string): string[] {
  const blockers: string[] = [];
  if (artifact.artifact_type !== artifactType) {
    blockers.push(`${path} artifact_type must be ${artifactType}`);
  }
  const status = stringValue(artifact.status);
  if (!status || status === "draft") {
    blockers.push(`${path} status must be beyond draft before downstream handoff`);
  }
  if (isPlaceholder(artifact.title)) {
    blockers.push(`${path} title must be filled before downstream handoff`);
  }
  return blockers;
}

async function readArtifact(root: string, path: string): Promise<Record<string, unknown> | null> {
  try {
    const parsed = parseYaml(await readTextFile(join(root, path)));
    return isRecord(parsed) ? parsed : null;
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }
}

function result(blockers: string[]): ArtifactReadinessResult {
  return { ok: blockers.length === 0, blockers, warnings: [] };
}

function hasNonEmptyPath(record: Record<string, unknown>, path: string[]): boolean {
  let current: unknown = record;
  for (const part of path) {
    if (!isRecord(current)) {
      return false;
    }
    current = current[part];
  }
  return hasNonEmptyValue(current);
}

function hasBooleanPath(record: Record<string, unknown>, path: string[], expected: boolean): boolean {
  let current: unknown = record;
  for (const part of path) {
    if (!isRecord(current)) {
      return false;
    }
    current = current[part];
  }
  return current === expected;
}

function hasNonEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim().length > 0 && !isPlaceholder(value);
  }
  if (Array.isArray(value)) {
    return value.some((item) => hasNonEmptyValue(item));
  }
  if (isRecord(value)) {
    return Object.values(value).some((item) => hasNonEmptyValue(item));
  }
  return true;
}

function nonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0 && !isPlaceholder(value);
}

function nonEmptyArray(value: unknown): boolean {
  return Array.isArray(value) && value.some((item) => hasNonEmptyValue(item));
}

function isPlaceholder(value: unknown): boolean {
  return typeof value === "string" && /^<[^>]+>$/u.test(value.trim());
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
