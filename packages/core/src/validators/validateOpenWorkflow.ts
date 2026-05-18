import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { CONTRACT_TYPES, SCHEMA_VERSION } from "../contracts/index.js";
import { parseYaml } from "../contracts/yaml.js";
import { isNotFound, readTextFile } from "../fs/index.js";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

const REQUIRED_OPENWORKFLOW_FILES = [
  ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
  ".openworkflow/workflow/CONTRACT_GRAPH.yaml",
  ".openworkflow/audit/COMMAND_AUDIT_INDEX.yaml",
  ".openworkflow/audit/CONTEXT_PACKETS.yaml",
  ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
  ".openworkflow/audit/DISCLOSURE_LEVELS.yaml",
  ".openworkflow/context/CONTEXT_MAP.yaml",
  ".openworkflow/vision/VISION_CONTRACT.yaml",
  ".openworkflow/validation/VALIDATION_INDEX.yaml",
  ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
  ".openworkflow/decisions/DECISION_INDEX.yaml",
  ".openworkflow/specs/SPEC_INDEX.yaml",
  ".openworkflow/changes/CHANGE_INDEX.yaml",
  ".openworkflow/runtime/RUNTIME_INDEX.yaml",
];

export async function validateOpenWorkflow(root: string): Promise<ValidationResult> {
  const errors: string[] = [];
  for (const file of REQUIRED_OPENWORKFLOW_FILES) {
    if (!(await exists(join(root, file)))) {
      errors.push(`missing required file: ${file}`);
    }
  }

  const yamlFiles = await findYamlFiles(join(root, ".openworkflow"));
  for (const file of yamlFiles) {
    let data: unknown;
    try {
      data = parseYaml(await readTextFile(file));
    } catch (error) {
      errors.push(`${relative(root, file)} is not valid YAML: ${String(error)}`);
      continue;
    }
    validateCommon(root, file, data, errors);
    validateWorkflowIndex(root, file, data, errors);
    validateContractGraph(root, file, data, errors);
    validateArtifactContracts(root, file, data, errors);
    validateDisclosureLevels(root, file, data, errors);
    validateDiscoveryArtifact(root, file, data, errors);
  }

  return { ok: errors.length === 0, errors };
}

function validateArtifactContracts(root: string, file: string, data: unknown, errors: string[]): void {
  if (!file.endsWith("ARTIFACT_CONTRACTS.yaml") || !isRecord(data)) {
    return;
  }
  const artifacts = data.artifacts;
  if (!Array.isArray(artifacts) || artifacts.length === 0) {
    errors.push(`${relative(root, file)} must contain artifacts`);
    return;
  }
  const required = new Set(["vision_session", "validation_target", "prototype_evidence", "decision_record"]);
  for (const artifact of artifacts) {
    if (!isRecord(artifact)) {
      errors.push(`${relative(root, file)} has invalid artifact entry`);
      continue;
    }
    const artifactType = artifact.artifact_type;
    if (typeof artifactType === "string") {
      required.delete(artifactType);
    }
    for (const key of ["artifact_type", "contract_type", "command", "source_of_truth_path", "required_keys"]) {
      if (!(key in artifact)) {
        errors.push(`${relative(root, file)} artifact entry missing ${key}`);
      }
    }
  }
  for (const artifactType of required) {
    errors.push(`${relative(root, file)} missing artifact_type ${artifactType}`);
  }
}

function validateDisclosureLevels(root: string, file: string, data: unknown, errors: string[]): void {
  if (!file.endsWith("DISCLOSURE_LEVELS.yaml") || !isRecord(data)) {
    return;
  }
  const levels = data.levels;
  if (!Array.isArray(levels) || levels.length < 5) {
    errors.push(`${relative(root, file)} must contain disclosure levels 0 through 4`);
    return;
  }
  const seen = new Set<number>();
  for (const level of levels) {
    if (!isRecord(level) || typeof level.level !== "number") {
      errors.push(`${relative(root, file)} has invalid disclosure level entry`);
      continue;
    }
    seen.add(level.level);
    for (const key of ["name", "default_for_agents", "purpose", "examples"]) {
      if (!(key in level)) {
        errors.push(`${relative(root, file)} level ${level.level} missing ${key}`);
      }
    }
  }
  for (let level = 0; level <= 4; level += 1) {
    if (!seen.has(level)) {
      errors.push(`${relative(root, file)} missing disclosure level ${level}`);
    }
  }
}

function validateDiscoveryArtifact(root: string, file: string, data: unknown, errors: string[]): void {
  if (!isRecord(data) || typeof data.artifact_type !== "string") {
    return;
  }
  const label = relative(root, file);
  const requiredKeys = artifactRequiredKeys(data.artifact_type);
  if (!requiredKeys) {
    errors.push(`${label} has unknown artifact_type ${data.artifact_type}`);
    return;
  }
  for (const key of requiredKeys) {
    if (!(key in data)) {
      errors.push(`${label} missing artifact key ${key}`);
    }
  }
  if (data.artifact_type === "validation_target") {
    validateValidationTarget(label, data, errors);
  }
  if (data.artifact_type === "prototype_evidence") {
    validatePrototypeEvidence(label, data, errors);
  }
  if (data.artifact_type === "decision_record") {
    validateDecisionRecord(label, data, errors);
  }
}

function artifactRequiredKeys(artifactType: string): string[] | null {
  if (artifactType === "vision_session") {
    return ["current_question", "stable_answers", "unresolved_questions", "vision_delta", "handoff"];
  }
  if (artifactType === "validation_target") {
    return ["core_question", "feature_classification", "critical_assumptions", "prototype_scope", "acceptance", "decision_options"];
  }
  if (artifactType === "prototype_evidence") {
    return ["validation_target", "core_question", "prototype_artifact", "run", "observations", "evidence", "result", "handoff"];
  }
  if (artifactType === "decision_record") {
    return [
      "reviewed_evidence",
      "outcome",
      "rationale",
      "accepted_scope",
      "rejected_scope",
      "next_command",
      "follow_up_questions",
    ];
  }
  return null;
}

function validateValidationTarget(label: string, data: Record<string, unknown>, errors: string[]): void {
  const featureClassification = data.feature_classification;
  if (isRecord(featureClassification)) {
    for (const key of ["existential", "supporting", "later", "out_of_scope"]) {
      if (!(key in featureClassification)) {
        errors.push(`${label} feature_classification missing ${key}`);
      }
    }
  }
  const prototypeScope = data.prototype_scope;
  if (isRecord(prototypeScope)) {
    for (const key of ["include", "exclude"]) {
      if (!(key in prototypeScope)) {
        errors.push(`${label} prototype_scope missing ${key}`);
      }
    }
  }
}

function validatePrototypeEvidence(label: string, data: Record<string, unknown>, errors: string[]): void {
  const prototypeArtifact = data.prototype_artifact;
  if (isRecord(prototypeArtifact)) {
    for (const key of ["path", "type"]) {
      if (!(key in prototypeArtifact)) {
        errors.push(`${label} prototype_artifact missing ${key}`);
      }
    }
  }
  if (typeof data.result === "string" && !["pass", "fail", "unclear", "not_reviewed"].includes(data.result)) {
    errors.push(`${label} has invalid result ${data.result}`);
  }
}

function validateDecisionRecord(label: string, data: Record<string, unknown>, errors: string[]): void {
  if (
    typeof data.outcome === "string" &&
    !["continue", "pivot", "stop", "needs_more_evidence"].includes(data.outcome)
  ) {
    errors.push(`${label} has invalid outcome ${data.outcome}`);
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (isNotFound(error)) {
      return false;
    }
    throw error;
  }
}

async function findYamlFiles(root: string): Promise<string[]> {
  if (!(await exists(root))) {
    return [];
  }
  const found: string[] = [];
  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
      } else if (entry.isFile() && (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml"))) {
        found.push(path);
      }
    }
  }
  await walk(root);
  return found.sort();
}

function validateCommon(root: string, file: string, data: unknown, errors: string[]): void {
  if (!isRecord(data)) {
    return;
  }
  if (!("schema_version" in data) && !("contract_type" in data)) {
    return;
  }
  const label = relative(root, file);
  for (const key of ["schema_version", "contract_id", "contract_type", "title", "status"]) {
    if (!(key in data)) {
      errors.push(`${label} missing contract key ${key}`);
    }
  }
  if (data.schema_version !== SCHEMA_VERSION) {
    errors.push(`${label} must use schema_version ${SCHEMA_VERSION}`);
  }
  if (typeof data.contract_type === "string" && !CONTRACT_TYPES.includes(data.contract_type as never)) {
    errors.push(`${label} has unknown contract_type ${data.contract_type}`);
  }
}

function validateWorkflowIndex(root: string, file: string, data: unknown, errors: string[]): void {
  if (!file.endsWith("WORKFLOW_INDEX.yaml") || !isRecord(data)) {
    return;
  }
  const contracts = data.contracts;
  if (!Array.isArray(contracts) || contracts.length === 0) {
    errors.push(`${relative(root, file)} must contain contracts`);
    return;
  }
  for (const entry of contracts) {
    if (!isRecord(entry) || typeof entry.path !== "string") {
      errors.push(`${relative(root, file)} has invalid contract entry`);
      continue;
    }
    const path = join(root, entry.path);
    if (!path.startsWith(root)) {
      errors.push(`${relative(root, file)} references path outside root: ${entry.path}`);
    }
  }
}

function validateContractGraph(root: string, file: string, data: unknown, errors: string[]): void {
  if (!file.endsWith("CONTRACT_GRAPH.yaml") || !isRecord(data)) {
    return;
  }
  const nodes = data.nodes;
  const edges = data.edges;
  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    errors.push(`${relative(root, file)} must contain nodes and edges`);
    return;
  }
  const nodeIds = new Set<string>();
  for (const node of nodes) {
    if (isRecord(node) && typeof node.contract_id === "string") {
      nodeIds.add(node.contract_id);
    }
  }
  for (const edge of edges) {
    if (!isRecord(edge)) {
      errors.push(`${relative(root, file)} has invalid edge`);
      continue;
    }
    for (const key of ["from", "to"]) {
      const value = edge[key];
      if (typeof value !== "string" || !nodeIds.has(value)) {
        errors.push(`${relative(root, file)} edge ${key} references missing node ${String(value)}`);
      }
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
