import { readdir, readFile, stat } from "node:fs/promises";
import { statSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { SCHEMA_VERSION } from "../contracts/index.js";
import { parseYaml } from "../contracts/yaml.js";
import { isNotFound } from "../fs/index.js";
import type { ValidationResult } from "./validateOpenWorkflow.js";

const REQUIRED_FILES = [
  "AGENT.md",
  "README.md",
  "LICENSE",
  "build_system_vision.md",
  "references/contract-graph.md",
  "references/npm-cli-architecture.md",
  "references/engineering-skill-reference-research.md",
  "references/audit-first-discovery-loop.md",
  "references/discovery-artifact-contracts.md",
  "references/artifact-authoring-templates.md",
  "references/runtime-command-surface.md",
  "schemas/openworkflow-contract.schema.json",
  "schemas/current-state.schema.json",
  "schemas/workflow-index.schema.json",
  "schemas/contract-graph.schema.json",
  "schemas/artifact-contracts.schema.json",
  "schemas/disclosure-levels.schema.json",
  "schemas/vision-session.schema.json",
  "schemas/validation-target.schema.json",
  "schemas/prototype-evidence.schema.json",
  "schemas/decision-record.schema.json",
  "schemas/product-design.schema.json",
  "schemas/change.schema.json",
  "schemas/validation.schema.json",
  "schemas/prototype.schema.json",
  "schemas/work-items.schema.json",
  "package.json",
  "tsconfig.json",
  "packages/cli/src/index.ts",
  "packages/cli/src/report.ts",
  "packages/cli/src/commands/brief.ts",
  "packages/cli/src/commands/clean.ts",
  "packages/cli/src/commands/init.ts",
  "packages/cli/src/commands/validate.ts",
  "packages/cli/src/commands/sync.ts",
  "packages/cli/src/commands/doctor.ts",
  "packages/cli/src/dev/validateRepositoryContractsCli.ts",
  "packages/cli/src/dev/verifyRuntimeSurface.ts",
  "packages/cli/src/dev/verifyWorkflowE2E.ts",
  "packages/cli/src/dev/verifyCleanCommand.ts",
  "packages/adapters/src/registry.ts",
  "packages/core/src/artifacts/registry.ts",
  "packages/core/src/contracts/index.ts",
  "packages/core/src/contracts/yaml.ts",
  "packages/core/src/commands/registry.ts",
  "packages/core/src/fs/index.ts",
  "packages/core/src/onboarding/agentsGuide.ts",
  "packages/core/src/workflow/doctorOpenWorkflow.ts",
  "packages/core/src/workflow/initOpenWorkflow.ts",
  "packages/core/src/workflow/readWorkflowConfig.ts",
  "packages/core/src/workflow/cleanOpenWorkflow.ts",
  "packages/core/src/workflow/syncOpenWorkflow.ts",
  "packages/core/src/validators/validateOpenWorkflow.ts",
  "packages/core/src/validators/validateRepositoryContracts.ts",
  "packages/core/src/graph/README.md",
  "packages/adapters/codex/src/generateCodexAdapter.ts",
  "packages/adapters/codex/src/generateCommands.ts",
  "packages/adapters/codex/src/generateSkills.ts",
  "packages/adapters/codex/src/doctorCodexAdapter.ts",
  "packages/adapters/codex/src/cleanCodexAdapter.ts",
  "packages/adapters/codex/src/templates.ts",
  "templates/openworkflow/README.md",
  "templates/codex/README.md",
  "skills/build-validation/SKILL.md",
  "skills/build-validation/scripts/init_validation.py",
  "skills/build-prototype/SKILL.md",
  "skills/build-prototype/scripts/init_prototype.py",
  "skills/build-workflow/SKILL.md",
  "skills/build-workflow/scripts/init_workflow.py",
  "skills/build-team/SKILL.md",
  "skills/run-team/SKILL.md",
  "changes/M01-contract-foundation/CHANGE.yaml",
  "changes/M01-contract-foundation/WORK_ITEMS.yaml",
  "changes/M02-validation-first-prioritization/CHANGE.yaml",
  "changes/M02-validation-first-prioritization/WORK_ITEMS.yaml",
  "changes/M03-prototype-discovery-loop/CHANGE.yaml",
  "changes/M03-prototype-discovery-loop/WORK_ITEMS.yaml",
  "changes/M04-npm-first-cli-architecture/CHANGE.yaml",
  "changes/M04-npm-first-cli-architecture/WORK_ITEMS.yaml",
  "changes/M05-codex-adapter-sync/CHANGE.yaml",
  "changes/M05-codex-adapter-sync/WORK_ITEMS.yaml",
  "changes/M06-repository-architecture-scaffold/CHANGE.yaml",
  "changes/M06-repository-architecture-scaffold/WORK_ITEMS.yaml",
  "changes/M07-command-namespace-contract/CHANGE.yaml",
  "changes/M07-command-namespace-contract/WORK_ITEMS.yaml",
  "changes/M08-engineering-skill-reference-research/CHANGE.yaml",
  "changes/M08-engineering-skill-reference-research/WORK_ITEMS.yaml",
  "changes/M09-audit-first-discovery-loop/CHANGE.yaml",
  "changes/M09-audit-first-discovery-loop/WORK_ITEMS.yaml",
  "changes/M10-discovery-artifact-contracts/CHANGE.yaml",
  "changes/M10-discovery-artifact-contracts/WORK_ITEMS.yaml",
  "changes/M11-artifact-authoring-templates/CHANGE.yaml",
  "changes/M11-artifact-authoring-templates/WORK_ITEMS.yaml",
  "changes/M12-runtime-command-surface/CHANGE.yaml",
  "changes/M12-runtime-command-surface/WORK_ITEMS.yaml",
  "changes/M13-codex-skill-adapter-alignment/CHANGE.yaml",
  "changes/M13-codex-skill-adapter-alignment/WORK_ITEMS.yaml",
  "changes/M14-python-to-typescript-script-migration/CHANGE.yaml",
  "changes/M14-python-to-typescript-script-migration/WORK_ITEMS.yaml",
  "changes/M14-python-to-typescript-script-migration/LEGACY_SKILL_SCRIPTS.md",
  "changes/M15-interactive-vision-design-flow/CHANGE.yaml",
  "changes/M15-interactive-vision-design-flow/WORK_ITEMS.yaml",
  "changes/M16-prototype-creation-skill-upgrade/CHANGE.yaml",
  "changes/M16-prototype-creation-skill-upgrade/WORK_ITEMS.yaml",
  "changes/M17-tune-orchestration-internal-decision/CHANGE.yaml",
  "changes/M17-tune-orchestration-internal-decision/WORK_ITEMS.yaml",
  "changes/M18-e2e-friction-fixes/CHANGE.yaml",
  "changes/M18-e2e-friction-fixes/WORK_ITEMS.yaml",
  "changes/M19-command-display-label-cleanup/CHANGE.yaml",
  "changes/M19-command-display-label-cleanup/WORK_ITEMS.yaml",
  "changes/M20-workflow-e2e-regression/CHANGE.yaml",
  "changes/M20-workflow-e2e-regression/WORK_ITEMS.yaml",
  "changes/M21-npm-package-release-readiness/CHANGE.yaml",
  "changes/M21-npm-package-release-readiness/WORK_ITEMS.yaml",
  "changes/M22-project-clean-command/CHANGE.yaml",
  "changes/M22-project-clean-command/WORK_ITEMS.yaml",
  "changes/M23-production-command-lazy-contracts/CHANGE.yaml",
  "changes/M23-production-command-lazy-contracts/WORK_ITEMS.yaml",
  "changes/M24-agent-context-state-and-summaries/CHANGE.yaml",
  "changes/M24-agent-context-state-and-summaries/WORK_ITEMS.yaml",
  "changes/M25-agent-onboarding-entrypoint/CHANGE.yaml",
  "changes/M25-agent-onboarding-entrypoint/WORK_ITEMS.yaml",
  "changes/M26-non-destructive-multi-platform-sync/CHANGE.yaml",
  "changes/M26-non-destructive-multi-platform-sync/WORK_ITEMS.yaml",
  "changes/M27-agent-brief-status/CHANGE.yaml",
  "changes/M27-agent-brief-status/WORK_ITEMS.yaml",
  "changes/M28-cli-json-report-surface/CHANGE.yaml",
  "changes/M28-cli-json-report-surface/WORK_ITEMS.yaml",
];

const IGNORED_DIRS = new Set([".git", "node_modules", "dist", "build", "coverage"]);
const COMMON_REQUIRED = ["schema_version", "contract_id", "contract_type", "title", "status"];

export async function validateRepositoryContracts(rootInput: string): Promise<ValidationResult> {
  const root = resolve(rootInput);
  const errors: string[] = [];
  await validateRequiredFiles(root, errors);
  await validateJsonSchemas(root, errors);
  await validateYamlContracts(root, errors);
  return { ok: errors.length === 0, errors };
}

async function validateRequiredFiles(root: string, errors: string[]): Promise<void> {
  for (const item of REQUIRED_FILES) {
    if (!(await exists(join(root, item)))) {
      errors.push(`missing required file: ${item}`);
    }
  }
}

async function validateJsonSchemas(root: string, errors: string[]): Promise<void> {
  const schemasRoot = join(root, "schemas");
  for (const path of await findFiles(schemasRoot, (entry) => entry.endsWith(".json"))) {
    let data: unknown;
    try {
      data = JSON.parse(await readFile(path, "utf8"));
    } catch (error) {
      errors.push(`${relative(root, path)} is not valid JSON: ${messageFor(error)}`);
      continue;
    }
    if (!isRecord(data)) {
      errors.push(`${relative(root, path)} must be a JSON object`);
      continue;
    }
    for (const key of ["$schema", "title", "type"]) {
      if (!(key in data)) {
        errors.push(`${relative(root, path)} missing JSON schema key ${key}`);
      }
    }
  }
}

async function validateYamlContracts(root: string, errors: string[]): Promise<void> {
  for (const path of await findFiles(root, (entry) => entry.endsWith(".yaml") || entry.endsWith(".yml"))) {
    let data: unknown;
    try {
      data = parseYaml(await readFile(path, "utf8"));
    } catch (error) {
      errors.push(`${relative(root, path)} is not valid YAML: ${messageFor(error)}`);
      continue;
    }
    validateCommonContract(root, path, data, errors);
    if (isRecord(data)) {
      validateChange(root, path, data, errors);
      validateWorkItems(root, path, data, errors);
      validateValidation(root, path, data, errors);
      validatePrototype(root, path, data, errors);
      validateArtifactContracts(root, path, data, errors);
      validateDisclosureLevels(root, path, data, errors);
      validateConfig(root, path, data, errors);
      validateCurrentState(root, path, data, errors);
      validateActivePointer(root, path, data, errors);
      validateDiscoveryArtifact(root, path, data, errors);
      validateWorkflowIndex(root, path, data, errors);
      validateContractGraph(root, path, data, errors);
    }
  }
}

function validateConfig(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "config.yaml") {
    return;
  }
  const label = relative(root, path);
  if (!nonEmptyString(data.project_slug) || data.project_slug === "project") {
    errors.push(`${label} project_slug must be a useful non-empty slug`);
  }
  if (!nonEmptyString(data.project_title) || data.project_title === ".") {
    errors.push(`${label} project_title must be a useful non-empty title`);
  }
}

function validateCurrentState(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "CURRENT_STATE.yaml") {
    return;
  }
  const label = relative(root, path);
  for (const key of ["active_stage", "next_command", "blocked_by", "read_this_first", "last_decision"]) {
    if (!(key in data)) {
      errors.push(`${label} missing current state key ${key}`);
    }
  }
  if (!nonEmptyString(data.active_stage)) {
    errors.push(`${label} active_stage must be a non-empty string`);
  }
  if (typeof data.next_command !== "string" && data.next_command !== null) {
    errors.push(`${label} next_command must be a string or null`);
  }
  for (const key of ["blocked_by", "read_this_first"]) {
    if (!Array.isArray(data[key])) {
      errors.push(`${label} ${key} must be an array`);
    }
  }
  if (!isRecord(data.last_decision)) {
    errors.push(`${label} last_decision must be a mapping`);
  }
}

function validateCommonContract(root: string, path: string, data: unknown, errors: string[]): void {
  if (!isRecord(data)) {
    return;
  }
  if (!("contract_type" in data) && !("schema_version" in data)) {
    return;
  }
  const label = relative(root, path);
  for (const key of COMMON_REQUIRED) {
    if (!(key in data)) {
      errors.push(`${label} missing contract key ${key}`);
    }
  }
  if (data.schema_version !== SCHEMA_VERSION) {
    errors.push(`${label} must use schema_version ${SCHEMA_VERSION}`);
  }
  for (const listKey of ["depends_on", "produces"]) {
    const value = data[listKey];
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item !== "string") {
          errors.push(`${label} has non-string ${listKey} value`);
        }
      }
    }
  }
}

function validateChange(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "CHANGE.yaml") {
    return;
  }
  for (const key of ["problem", "goals", "non_goals", "affected_paths", "acceptance", "validation"]) {
    if (!(key in data)) {
      errors.push(`${relative(root, path)} missing change key ${key}`);
    }
  }
  if (data.contract_type !== "change") {
    errors.push(`${relative(root, path)} contract_type must be change`);
  }
}

function validateWorkItems(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "WORK_ITEMS.yaml") {
    return;
  }
  const label = relative(root, path);
  if (data.contract_type !== "work_items") {
    errors.push(`${label} contract_type must be work_items`);
  }
  const changeContract = data.change_contract;
  if (typeof changeContract !== "string") {
    errors.push(`${label} missing change_contract`);
  } else if (!(existsSyncSafe(join(contractRootFor(root, path), changeContract)) || existsSyncSafe(join(root, changeContract)))) {
    errors.push(`${label} references missing change_contract ${changeContract}`);
  }
  const items = data.items;
  if (!Array.isArray(items) || items.length === 0) {
    errors.push(`${label} must contain non-empty items`);
    return;
  }
  const seen = new Set<string>();
  items.forEach((item, index) => {
    if (!isRecord(item)) {
      errors.push(`${label} item ${index} is not a mapping`);
      return;
    }
    const taskId = item.task_id;
    if (typeof taskId !== "string" || taskId.length === 0) {
      errors.push(`${label} item ${index} missing task_id`);
      return;
    }
    if (seen.has(taskId)) {
      errors.push(`${label} duplicate task_id ${taskId}`);
    }
    seen.add(taskId);
    for (const key of ["title", "status", "owned_paths", "acceptance"]) {
      if (!(key in item)) {
        errors.push(`${label} ${taskId} missing ${key}`);
      }
    }
  });
}

function validateValidation(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "VALIDATION.yaml") {
    return;
  }
  const label = relative(root, path);
  if (data.contract_type !== "validation") {
    errors.push(`${label} contract_type must be validation`);
  }
  validateValidationTarget(label, data, errors);
  for (const key of [
    "core_question",
    "feature_classification",
    "critical_assumptions",
    "prototype_scope",
    "acceptance",
    "decision_options",
  ]) {
    if (!(key in data)) {
      errors.push(`${label} missing validation key ${key}`);
    }
  }
  const decisionOptions = data.decision_options;
  if (Array.isArray(decisionOptions)) {
    const allowed = new Set(["continue", "revise", "pivot", "stop", "needs_more_evidence"]);
    for (const option of decisionOptions) {
      if (typeof option !== "string" || !allowed.has(option)) {
        errors.push(`${label} has invalid decision option ${String(option)}`);
      }
    }
  }
}

function validatePrototype(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "TODO.yaml" || data.contract_type !== "prototype") {
    return;
  }
  const label = relative(root, path);
  for (const key of [
    "validation_contract",
    "core_question",
    "prototype_scope",
    "todo",
    "acceptance",
    "artifact",
    "decision_handoff",
  ]) {
    if (!(key in data)) {
      errors.push(`${label} missing prototype key ${key}`);
    }
  }
  validatePrototypeScope(label, data.prototype_scope, errors);
  validatePrototypeTodo(label, data.todo, errors);
  const artifact = data.artifact;
  if (isRecord(artifact) && typeof artifact.path === "string" && !existsSyncSafe(join(contractRootFor(root, path), artifact.path))) {
    errors.push(`${label} references missing artifact path ${artifact.path}`);
  }
  const decisionHandoff = data.decision_handoff;
  if (isRecord(decisionHandoff) && decisionHandoff.requires_user_review !== true) {
    errors.push(`${label} decision_handoff.requires_user_review must be true`);
  }
}

function validateArtifactContracts(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "ARTIFACT_CONTRACTS.yaml") {
    return;
  }
  const label = relative(root, path);
  const artifacts = data.artifacts;
  if (!Array.isArray(artifacts) || artifacts.length === 0) {
    errors.push(`${label} must contain artifacts`);
    return;
  }
  const missing = new Set([
    "vision_session",
    "validation_target",
    "prototype_evidence",
    "decision_record",
    "product_design",
    "production_spec",
    "production_change",
    "team_runtime",
  ]);
  artifacts.forEach((artifact, index) => {
    if (!isRecord(artifact)) {
      errors.push(`${label} artifact ${index} is not a mapping`);
      return;
    }
    if (typeof artifact.artifact_type === "string") {
      missing.delete(artifact.artifact_type);
    }
    for (const key of [
      "artifact_type",
      "contract_type",
      "command",
      "source_of_truth_path",
      "template_path",
      "read_policy",
      "active_pointer",
      "required_keys",
    ]) {
      if (!(key in artifact)) {
        errors.push(`${label} artifact ${index} missing ${key}`);
      }
    }
    validateArtifactContractMetadata(label, index, artifact, errors);
  });
  for (const artifactType of [...missing].sort()) {
    errors.push(`${label} missing artifact_type ${artifactType}`);
  }
}

function validateArtifactContractMetadata(
  label: string,
  index: number,
  artifact: Record<string, unknown>,
  errors: string[],
): void {
  const readPolicy = artifact.read_policy;
  if (isRecord(readPolicy)) {
    for (const key of ["load_by_default", "agent_read_order", "max_yaml_lines", "max_note_lines", "raw_evidence"]) {
      if (!(key in readPolicy)) {
        errors.push(`${label} artifact ${index} read_policy missing ${key}`);
      }
    }
  } else {
    errors.push(`${label} artifact ${index} read_policy must be a mapping`);
  }
  const activePointer = artifact.active_pointer;
  if (isRecord(activePointer)) {
    for (const key of ["index_path", "pointer_key", "collection_key", "id_key", "path_key"]) {
      if (!(key in activePointer)) {
        errors.push(`${label} artifact ${index} active_pointer missing ${key}`);
      }
    }
  } else {
    errors.push(`${label} artifact ${index} active_pointer must be a mapping`);
  }
  const summaryPolicy = artifact.summary_policy;
  if (summaryPolicy !== null && summaryPolicy !== undefined) {
    if (!isRecord(summaryPolicy)) {
      errors.push(`${label} artifact ${index} summary_policy must be null or a mapping`);
    } else {
      for (const key of ["strategy", "path", "load_before_full", "refresh_when"]) {
        if (!(key in summaryPolicy)) {
          errors.push(`${label} artifact ${index} summary_policy missing ${key}`);
        }
      }
    }
  }
}

function validateDisclosureLevels(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "DISCLOSURE_LEVELS.yaml") {
    return;
  }
  const label = relative(root, path);
  const levels = data.levels;
  if (!Array.isArray(levels) || levels.length < 5) {
    errors.push(`${label} must contain disclosure levels 0 through 4`);
    return;
  }
  const seen = new Set<number>();
  levels.forEach((level, index) => {
    if (!isRecord(level)) {
      errors.push(`${label} level ${index} is not a mapping`);
      return;
    }
    if (typeof level.level === "number") {
      seen.add(level.level);
    }
    for (const key of ["name", "default_for_agents", "purpose", "examples"]) {
      if (!(key in level)) {
        errors.push(`${label} level ${index} missing ${key}`);
      }
    }
  });
  for (let level = 0; level <= 4; level += 1) {
    if (!seen.has(level)) {
      errors.push(`${label} missing disclosure level ${level}`);
    }
  }
}

function validateDiscoveryArtifact(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (typeof data.artifact_type !== "string") {
    return;
  }
  const label = relative(root, path);
  const required = artifactRequiredKeys(data.artifact_type);
  if (!required) {
    errors.push(`${label} has unknown artifact_type ${data.artifact_type}`);
    return;
  }
  for (const key of required) {
    if (!(key in data)) {
      errors.push(`${label} missing artifact key ${key}`);
    }
  }
  if (data.artifact_type === "validation_target") {
    validateValidationTarget(label, data, errors);
  } else if (data.artifact_type === "prototype_evidence") {
    validatePrototypeEvidence(root, label, data, errors);
  } else if (data.artifact_type === "decision_record") {
    validateDecisionRecord(label, data, errors);
  } else if (data.artifact_type === "product_design") {
    validateProductDesign(label, data, errors);
  } else if (data.artifact_type === "production_spec") {
    validateProductionSpec(label, data, errors);
  } else if (data.artifact_type === "production_change") {
    validateProductionChange(label, data, errors);
  } else if (data.artifact_type === "team_runtime") {
    validateTeamRuntime(label, data, errors);
  }
}

function artifactRequiredKeys(artifactType: string): string[] | null {
  const requiredByType: Record<string, string[]> = {
    vision_session: ["current_question", "stable_answers", "unresolved_questions", "vision_delta", "handoff"],
    validation_target: [
      "core_question",
      "feature_classification",
      "critical_assumptions",
      "prototype_scope",
      "acceptance",
      "decision_options",
    ],
    prototype_evidence: [
      "validation_target",
      "core_question",
      "prototype_mode",
      "reference_analysis",
      "visual_direction",
      "visual_concept_policy",
      "concept_evidence",
      "prototype_artifact",
      "run",
      "implementation_evidence",
      "observations",
      "evidence",
      "verification",
      "self_critique",
      "known_limits",
      "result",
      "handoff",
    ],
    decision_record: [
      "reviewed_evidence",
      "outcome",
      "rationale",
      "accepted_scope",
      "rejected_scope",
      "revision_scope",
      "next_command",
      "follow_up_questions",
    ],
    product_design: [
      "accepted_prototype_evidence",
      "personas",
      "journey_map",
      "user_stories",
      "feature_matrix",
      "kano_classification",
      "behavior_model",
      "ux_states",
      "scope",
      "open_questions",
      "conditional_packets",
      "spec_readiness",
    ],
    production_spec: [
      "source_design",
      "goal",
      "scope",
      "requirements",
      "interfaces",
      "acceptance",
      "verification",
      "risks",
      "change_readiness",
    ],
    production_change: [
      "source_spec",
      "problem",
      "goals",
      "non_goals",
      "affected_paths",
      "acceptance",
      "validation",
      "work_items",
      "risks",
      "runtime_readiness",
    ],
    team_runtime: [
      "source_change",
      "active_work_item",
      "execution_mode",
      "work_queue",
      "agents",
      "verification",
      "issues",
      "checkpoints",
      "handoff",
    ],
  };
  return requiredByType[artifactType] ?? null;
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
  validatePrototypeScope(label, data.prototype_scope, errors);
}

function validatePrototypeScope(label: string, value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    return;
  }
  for (const key of ["include", "exclude"]) {
    if (!(key in value)) {
      errors.push(`${label} prototype_scope missing ${key}`);
    }
  }
}

function validatePrototypeTodo(label: string, value: unknown, errors: string[]): void {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${label} must contain non-empty todo list`);
    return;
  }
  const seen = new Set<string>();
  value.forEach((item, index) => {
    if (!isRecord(item)) {
      errors.push(`${label} todo item ${index} is not a mapping`);
      return;
    }
    const taskId = item.task_id;
    if (typeof taskId !== "string" || taskId.length === 0) {
      errors.push(`${label} todo item ${index} missing task_id`);
      return;
    }
    if (seen.has(taskId)) {
      errors.push(`${label} duplicate prototype task_id ${taskId}`);
    }
    seen.add(taskId);
    for (const key of ["title", "status", "acceptance"]) {
      if (!(key in item)) {
        errors.push(`${label} ${taskId} missing ${key}`);
      }
    }
  });
}

function validatePrototypeEvidence(root: string, label: string, data: Record<string, unknown>, errors: string[]): void {
  if (!["visual", "interaction", "technical_feasibility", "3d_material", "workflow", "data_logic"].includes(String(data.prototype_mode))) {
    errors.push(`${label} has invalid prototype_mode ${String(data.prototype_mode)}`);
  }
  for (const key of ["reference_analysis", "concept_evidence", "implementation_evidence", "known_limits"]) {
    if (key in data && !Array.isArray(data[key])) {
      errors.push(`${label} ${key} must be an array`);
    }
  }
  if ("visual_direction" in data && !isRecord(data.visual_direction)) {
    errors.push(`${label} visual_direction must be a mapping`);
  }
  validateVisualConceptPolicy(label, data, errors);
  if ("verification" in data && !isRecord(data.verification)) {
    errors.push(`${label} verification must be a mapping`);
  }
  if ("self_critique" in data && !isRecord(data.self_critique)) {
    errors.push(`${label} self_critique must be a mapping`);
  } else {
    validateSelfCritique(label, data.self_critique, errors);
  }
  const prototypeArtifact = data.prototype_artifact;
  if (isRecord(prototypeArtifact)) {
    for (const key of ["path", "type"]) {
      if (!(key in prototypeArtifact)) {
        errors.push(`${label} prototype_artifact missing ${key}`);
      }
    }
    validateLocalRef(root, label, "prototype_artifact.path", prototypeArtifact.path, errors);
  }
  validateEvidenceRefs(root, label, data, errors);
  if (!["pass", "fail", "unclear", "not_reviewed"].includes(String(data.result))) {
    errors.push(`${label} has invalid result ${String(data.result)}`);
  }
}

function validateVisualConceptPolicy(label: string, data: Record<string, unknown>, errors: string[]): void {
  const policy = data.visual_concept_policy;
  if (!isRecord(policy)) {
    errors.push(`${label} visual_concept_policy must be a mapping`);
    return;
  }
  const imageGeneration = policy.image_generation;
  if (!["generated", "skipped_by_user", "not_applicable"].includes(String(imageGeneration))) {
    errors.push(`${label} visual_concept_policy.image_generation has invalid value ${String(imageGeneration)}`);
    return;
  }
  if (imageGeneration === "skipped_by_user" && !nonEmptyString(policy.skip_reason)) {
    errors.push(`${label} visual_concept_policy.skip_reason is required when image generation is skipped`);
  }
  if (["visual", "interaction", "3d_material"].includes(String(data.prototype_mode))) {
    if (imageGeneration === "not_applicable") {
      errors.push(`${label} visual_concept_policy.image_generation cannot be not_applicable for ${String(data.prototype_mode)} prototypes`);
    }
    if (imageGeneration === "generated" && (!Array.isArray(data.concept_evidence) || data.concept_evidence.length === 0)) {
      errors.push(`${label} concept_evidence is required when image generation is generated`);
    }
  }
}

function validateSelfCritique(label: string, value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    return;
  }
  for (const key of ["philosophy", "hierarchy", "execution", "specificity", "restraint", "accessibility", "responsive_behavior"]) {
    if (!nonEmptyString(value[key])) {
      errors.push(`${label} self_critique.${key} must be a non-empty string`);
    }
  }
  if (!Array.isArray(value.repairs)) {
    errors.push(`${label} self_critique.repairs must be an array`);
  }
}

function validateEvidenceRefs(root: string, label: string, data: Record<string, unknown>, errors: string[]): void {
  for (const key of ["reference_analysis", "concept_evidence", "implementation_evidence", "evidence"]) {
    const items = data[key];
    if (!Array.isArray(items)) {
      continue;
    }
    items.forEach((item, index) => {
      if (isRecord(item)) {
        validateLocalRef(root, label, `${key}[${index}].ref`, item.ref, errors);
      }
    });
  }
  const verification = data.verification;
  if (!isRecord(verification)) {
    return;
  }
  for (const key of ["screenshots", "logs"]) {
    const refs = verification[key];
    if (!Array.isArray(refs)) {
      continue;
    }
    refs.forEach((ref, index) => validateLocalRef(root, label, `verification.${key}[${index}]`, ref, errors));
  }
}

function validateLocalRef(root: string, label: string, field: string, value: unknown, errors: string[]): void {
  if (typeof value !== "string" || value.length === 0 || isExternalRef(value)) {
    return;
  }
  const resolved = resolve(root, value);
  if (resolved !== root && !resolved.startsWith(`${root}/`)) {
    errors.push(`${label} ${field} references path outside root: ${value}`);
    return;
  }
  if (!existsSyncSafe(resolved)) {
    errors.push(`${label} ${field} references missing path ${value}`);
  }
}

function isExternalRef(value: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function nonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function validateDecisionRecord(label: string, data: Record<string, unknown>, errors: string[]): void {
  if (!["continue", "revise", "pivot", "stop", "needs_more_evidence"].includes(String(data.outcome))) {
    errors.push(`${label} has invalid outcome ${String(data.outcome)}`);
  }
}

function validateProductDesign(label: string, data: Record<string, unknown>, errors: string[]): void {
  const specReadiness = data.spec_readiness;
  if (isRecord(specReadiness)) {
    for (const key of ["ready", "next_command"]) {
      if (!(key in specReadiness)) {
        errors.push(`${label} spec_readiness missing ${key}`);
      }
    }
  }
}

function validateProductionSpec(label: string, data: Record<string, unknown>, errors: string[]): void {
  for (const key of ["scope", "requirements", "interfaces", "verification", "change_readiness"]) {
    if (key in data && !isRecord(data[key])) {
      errors.push(`${label} ${key} must be a mapping`);
    }
  }
  const changeReadiness = data.change_readiness;
  if (isRecord(changeReadiness)) {
    for (const key of ["ready", "next_command"]) {
      if (!(key in changeReadiness)) {
        errors.push(`${label} change_readiness missing ${key}`);
      }
    }
  }
}

function validateProductionChange(label: string, data: Record<string, unknown>, errors: string[]): void {
  for (const key of ["goals", "non_goals", "affected_paths", "acceptance", "validation", "risks"]) {
    if (key in data && !Array.isArray(data[key])) {
      errors.push(`${label} ${key} must be an array`);
    }
  }
  const runtimeReadiness = data.runtime_readiness;
  if (isRecord(runtimeReadiness)) {
    for (const key of ["ready", "next_command"]) {
      if (!(key in runtimeReadiness)) {
        errors.push(`${label} runtime_readiness missing ${key}`);
      }
    }
  }
}

function validateTeamRuntime(label: string, data: Record<string, unknown>, errors: string[]): void {
  if (typeof data.execution_mode === "string" && !["single_agent", "agent_team", "reconcile", "qa_fix"].includes(data.execution_mode)) {
    errors.push(`${label} has invalid execution_mode ${data.execution_mode}`);
  }
  for (const key of ["work_queue", "agents", "issues", "checkpoints"]) {
    if (key in data && !Array.isArray(data[key])) {
      errors.push(`${label} ${key} must be an array`);
    }
  }
  if ("verification" in data && !isRecord(data.verification)) {
    errors.push(`${label} verification must be a mapping`);
  }
  if ("handoff" in data && !isRecord(data.handoff)) {
    errors.push(`${label} handoff must be a mapping`);
  }
}

function validateActivePointer(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  const rule = [
    pointerRule("VISION_CONTRACT.yaml", "current_session", "sessions", "session_id", "path"),
    pointerRule("VALIDATION_INDEX.yaml", "current_validation", "validations", "validation_id", "path"),
    pointerRule("PROTOTYPE_INDEX.yaml", "current_prototype", "prototypes", "prototype_id", "path"),
    pointerRule("DECISION_INDEX.yaml", "current_decision", "decisions", "decision_id", "path"),
    pointerRule("DESIGN_INDEX.yaml", "current_design", "designs", "design_id", "path"),
    pointerRule("SPEC_INDEX.yaml", "current_spec", "specs", "spec_id", "path"),
    pointerRule("CHANGE_INDEX.yaml", "current_change", "changes", "change_id", "path"),
    pointerRule("RUNTIME_INDEX.yaml", "current_run", "runs", "run_id", "path"),
  ].find((item) => basename(path) === item.fileName);
  if (!rule) {
    return;
  }
  const label = relative(root, path);
  const pointer = data[rule.pointerKey];
  if (pointer === null || pointer === undefined) {
    return;
  }
  if (typeof pointer !== "string" || pointer.length === 0) {
    errors.push(`${label} ${rule.pointerKey} must be null or a non-empty string`);
    return;
  }
  const collection = data[rule.collectionKey];
  if (!Array.isArray(collection)) {
    errors.push(`${label} ${rule.collectionKey} must be a list when ${rule.pointerKey} is set`);
    return;
  }
  const entry = collection.find((item) => isRecord(item) && item[rule.idKey] === pointer);
  if (!isRecord(entry)) {
    errors.push(`${label} ${rule.pointerKey} references missing ${rule.collectionKey} entry ${pointer}`);
    return;
  }
  const artifactPath = entry[rule.pathKey];
  if (typeof artifactPath !== "string" || artifactPath.length === 0) {
    errors.push(`${label} ${pointer} missing ${rule.pathKey}`);
    return;
  }
  if (!existsSyncSafe(join(contractRootFor(root, path), artifactPath))) {
    errors.push(`${label} ${rule.pointerKey} references missing artifact path ${artifactPath}`);
  }
}

function validateWorkflowIndex(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "WORKFLOW_INDEX.yaml") {
    return;
  }
  const label = relative(root, path);
  const contracts = data.contracts;
  if (!Array.isArray(contracts) || contracts.length === 0) {
    errors.push(`${label} must contain contracts`);
    return;
  }
  const projectRoot = workflowRootFor(path);
  for (const entry of contracts) {
    if (!isRecord(entry)) {
      errors.push(`${label} has non-mapping contract entry`);
      continue;
    }
    const entryPath = entry.path;
    if (typeof entryPath === "string" && !existsSyncSafe(join(projectRoot, entryPath))) {
      errors.push(`${label} references missing contract path ${entryPath}`);
    }
  }
}

function validateContractGraph(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "CONTRACT_GRAPH.yaml") {
    return;
  }
  const label = relative(root, path);
  const nodes = data.nodes;
  const edges = data.edges;
  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    errors.push(`${label} must contain nodes and edges lists`);
    return;
  }
  const nodeIds = new Set(
    nodes.flatMap((node) => (isRecord(node) && typeof node.contract_id === "string" ? [node.contract_id] : [])),
  );
  for (const edge of edges) {
    if (!isRecord(edge)) {
      errors.push(`${label} has non-mapping edge`);
      continue;
    }
    for (const key of ["from", "to"]) {
      const value = edge[key];
      if (typeof value !== "string" || !nodeIds.has(value)) {
        errors.push(`${label} edge ${key} references missing node ${String(value)}`);
      }
    }
  }
}

function pointerRule(fileName: string, pointerKey: string, collectionKey: string, idKey: string, pathKey: string) {
  return { fileName, pointerKey, collectionKey, idKey, pathKey };
}

function contractRootFor(root: string, path: string): string {
  const parts = path.split("/");
  const codexIndex = parts.indexOf(".codex");
  if (codexIndex <= 0) {
    return root;
  }
  return parts.slice(0, codexIndex).join("/");
}

function workflowRootFor(path: string): string {
  return resolve(path, "..", "..", "..");
}

async function findFiles(root: string, predicate: (entryName: string) => boolean): Promise<string[]> {
  if (!(await exists(root))) {
    return [];
  }
  const found: string[] = [];
  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && IGNORED_DIRS.has(entry.name)) {
        continue;
      }
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
      } else if (entry.isFile() && predicate(entry.name)) {
        found.push(path);
      }
    }
  }
  await walk(root);
  return found.sort();
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

function existsSyncSafe(path: string): boolean {
  try {
    statSync(path);
    return true;
  } catch (error) {
    if (isNotFound(error)) {
      return false;
    }
    throw error;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function messageFor(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
