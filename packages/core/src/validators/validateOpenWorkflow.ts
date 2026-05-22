import { statSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { CONTRACT_TYPES, SCHEMA_VERSION } from "../contracts/index.js";
import { parseYaml } from "../contracts/yaml.js";
import { isNotFound, readTextFile } from "../fs/index.js";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

const REQUIRED_OPENWORKFLOW_FILES = [
  ".openworkflow/config.yaml",
  ".openworkflow/CURRENT_STATE.yaml",
  ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
  ".openworkflow/audit/COMMAND_AUDIT_INDEX.yaml",
  ".openworkflow/audit/CONTEXT_PACKETS.yaml",
  ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
  ".openworkflow/audit/DISCLOSURE_LEVELS.yaml",
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
    validateConfig(root, file, data, errors);
    validateCurrentState(root, file, data, errors);
    validateActivePointer(root, file, data, errors);
    validateDiscoveryArtifact(root, file, data, errors);
  }

  return { ok: errors.length === 0, errors };
}

function validateConfig(root: string, file: string, data: unknown, errors: string[]): void {
  if (!file.endsWith("config.yaml") || !isRecord(data)) {
    return;
  }
  const label = relative(root, file);
  if (!nonEmptyString(data.project_slug) || data.project_slug === "project") {
    errors.push(`${label} project_slug must be a useful non-empty slug`);
  }
  if (!nonEmptyString(data.project_title) || data.project_title === ".") {
    errors.push(`${label} project_title must be a useful non-empty title`);
  }
}

function validateCurrentState(root: string, file: string, data: unknown, errors: string[]): void {
  if (!file.endsWith("CURRENT_STATE.yaml") || !isRecord(data)) {
    return;
  }
  const label = relative(root, file);
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

function validateArtifactContracts(root: string, file: string, data: unknown, errors: string[]): void {
  if (!file.endsWith("ARTIFACT_CONTRACTS.yaml") || !isRecord(data)) {
    return;
  }
  const artifacts = data.artifacts;
  if (!Array.isArray(artifacts) || artifacts.length === 0) {
    errors.push(`${relative(root, file)} must contain artifacts`);
    return;
  }
  const required = new Set([
    "vision_session",
    "validation_target",
    "prototype_evidence",
    "decision_record",
    "product_design",
    "production_spec",
    "production_change",
    "team_runtime",
  ]);
  for (const artifact of artifacts) {
    if (!isRecord(artifact)) {
      errors.push(`${relative(root, file)} has invalid artifact entry`);
      continue;
    }
    const artifactType = artifact.artifact_type;
    if (typeof artifactType === "string") {
      required.delete(artifactType);
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
        errors.push(`${relative(root, file)} artifact entry missing ${key}`);
      }
    }
    validateArtifactContractMetadata(root, file, artifact, errors);
  }
  for (const artifactType of required) {
    errors.push(`${relative(root, file)} missing artifact_type ${artifactType}`);
  }
}

function validateArtifactContractMetadata(
  root: string,
  file: string,
  artifact: Record<string, unknown>,
  errors: string[],
): void {
  const label = relative(root, file);
  if (typeof artifact.template_path === "string") {
    const templatePath = join(root, artifact.template_path);
    if (!templatePath.startsWith(root)) {
      errors.push(`${label} references template path outside root: ${artifact.template_path}`);
    }
  }
  const readPolicy = artifact.read_policy;
  if (isRecord(readPolicy)) {
    for (const key of ["load_by_default", "agent_read_order", "max_yaml_lines", "max_note_lines", "raw_evidence"]) {
      if (!(key in readPolicy)) {
        errors.push(`${label} ${String(artifact.artifact_type)} read_policy missing ${key}`);
      }
    }
  } else {
    errors.push(`${label} ${String(artifact.artifact_type)} read_policy must be a mapping`);
  }
  const activePointer = artifact.active_pointer;
  if (isRecord(activePointer)) {
    for (const key of ["index_path", "pointer_key", "collection_key", "id_key", "path_key"]) {
      if (!(key in activePointer)) {
        errors.push(`${label} ${String(artifact.artifact_type)} active_pointer missing ${key}`);
      }
    }
  } else {
    errors.push(`${label} ${String(artifact.artifact_type)} active_pointer must be a mapping`);
  }
  const summaryPolicy = artifact.summary_policy;
  if (summaryPolicy !== null && summaryPolicy !== undefined) {
    if (!isRecord(summaryPolicy)) {
      errors.push(`${label} ${String(artifact.artifact_type)} summary_policy must be null or a mapping`);
    } else {
      for (const key of ["strategy", "path", "load_before_full", "refresh_when"]) {
        if (!(key in summaryPolicy)) {
          errors.push(`${label} ${String(artifact.artifact_type)} summary_policy missing ${key}`);
        }
      }
    }
  }
}

function validateActivePointer(root: string, file: string, data: unknown, errors: string[]): void {
  if (!isRecord(data)) {
    return;
  }
  const label = relative(root, file);
  const rules = [
    pointerRule("VISION_CONTRACT.yaml", "current_session", "sessions", "session_id", "path"),
    pointerRule("VALIDATION_INDEX.yaml", "current_validation", "validations", "validation_id", "path"),
    pointerRule("PROTOTYPE_INDEX.yaml", "current_prototype", "prototypes", "prototype_id", "path"),
    pointerRule("DECISION_INDEX.yaml", "current_decision", "decisions", "decision_id", "path"),
    pointerRule("DESIGN_INDEX.yaml", "current_design", "designs", "design_id", "path"),
    pointerRule("SPEC_INDEX.yaml", "current_spec", "specs", "spec_id", "path"),
    pointerRule("CHANGE_INDEX.yaml", "current_change", "changes", "change_id", "path"),
    pointerRule("RUNTIME_INDEX.yaml", "current_run", "runs", "run_id", "path"),
  ];
  const rule = rules.find((item) => file.endsWith(item.fileName));
  if (!rule) {
    return;
  }
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
  const resolved = join(root, artifactPath);
  if (!resolved.startsWith(root)) {
    errors.push(`${label} ${pointer} path is outside root: ${artifactPath}`);
    return;
  }
  if (!existsSyncMarker(resolved)) {
    errors.push(`${label} ${rule.pointerKey} references missing artifact path ${artifactPath}`);
  }
}

function pointerRule(fileName: string, pointerKey: string, collectionKey: string, idKey: string, pathKey: string) {
  return { fileName, pointerKey, collectionKey, idKey, pathKey };
}

function existsSyncMarker(path: string): boolean {
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
  if (file.endsWith("SUMMARY.yaml")) {
    return;
  }
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
    validatePrototypeEvidence(root, label, data, errors);
  }
  if (data.artifact_type === "decision_record") {
    validateDecisionRecord(label, data, errors);
  }
  if (data.artifact_type === "product_design") {
    validateProductDesign(label, data, errors);
  }
  if (data.artifact_type === "production_spec") {
    validateProductionSpec(label, data, errors);
  }
  if (data.artifact_type === "production_change") {
    validateProductionChange(label, data, errors);
  }
  if (data.artifact_type === "team_runtime") {
    validateTeamRuntime(label, data, errors);
  }
}

function artifactRequiredKeys(artifactType: string): string[] | null {
  if (artifactType === "vision_session") {
    return ["current_question", "stable_answers", "unresolved_questions", "vision_delta", "handoff"];
  }
  if (artifactType === "validation_target") {
    return [
      "trigger",
      "core_question",
      "central_uncertainty",
      "hypothesis",
      "target_behavior",
      "feature_classification",
      "critical_assumptions",
      "prototype_scope",
      "prototype_experiment",
      "observable_signals",
      "acceptance",
      "decision_rules",
      "decision_options",
      "vision_gaps",
      "agent_readiness_gate",
    ];
  }
  if (artifactType === "prototype_evidence") {
    return [
      "validation_target",
      "core_question",
      "prototype_mode",
      "prompt_pack_type",
      "validation_input",
      "source",
      "negative_constraints",
      "review_plan",
      "result",
      "handoff",
    ];
  }
  if (artifactType === "decision_record") {
    return [
      "reviewed_evidence",
      "outcome",
      "rationale",
      "accepted_scope",
      "rejected_scope",
      "revision_scope",
      "next_command",
      "follow_up_questions",
    ];
  }
  if (artifactType === "product_design") {
    return [
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
    ];
  }
  if (artifactType === "production_spec") {
    return [
      "source_design",
      "goal",
      "scope",
      "requirements",
      "interfaces",
      "acceptance",
      "verification",
      "risks",
      "change_readiness",
    ];
  }
  if (artifactType === "production_change") {
    return [
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
    ];
  }
  if (artifactType === "team_runtime") {
    return [
      "source_change",
      "active_work_item",
      "execution_mode",
      "work_queue",
      "agents",
      "verification",
      "issues",
      "checkpoints",
      "handoff",
    ];
  }
  return null;
}

function validateValidationTarget(label: string, data: Record<string, unknown>, errors: string[]): void {
  const trigger = data.trigger;
  if (isRecord(trigger)) {
    for (const key of ["mode", "requested_command", "reason"]) {
      if (!(key in trigger)) {
        errors.push(`${label} trigger missing ${key}`);
      }
    }
    const mode = String(trigger.mode ?? "");
    if (mode && !["user_explicit", "agent_auto"].includes(mode)) {
      errors.push(`${label} trigger.mode has invalid value ${mode}`);
    }
  }
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
  const prototypeExperiment = data.prototype_experiment;
  if (isRecord(prototypeExperiment)) {
    for (const key of ["scenario", "must_show", "must_not_show"]) {
      if (!(key in prototypeExperiment)) {
        errors.push(`${label} prototype_experiment missing ${key}`);
      }
    }
  }
  validateSignalSet(label, "observable_signals", data.observable_signals, ["pass", "fail", "ambiguous"], errors);
  validateSignalSet(label, "decision_rules", data.decision_rules, ["continue", "revise", "pivot", "stop", "needs_more_evidence"], errors);
  const agentReadinessGate = data.agent_readiness_gate;
  if (isRecord(agentReadinessGate)) {
    for (const key of ["status", "blockers", "warnings", "write_authority"]) {
      if (!(key in agentReadinessGate)) {
        errors.push(`${label} agent_readiness_gate missing ${key}`);
      }
    }
    const status = String(agentReadinessGate.status ?? "");
    if (status && !["missing_validation", "thin_validation", "stale_validation", "ready_for_proto", "return_to_vision"].includes(status)) {
      errors.push(`${label} agent_readiness_gate.status has invalid value ${status}`);
    }
  }
}

function validateSignalSet(label: string, field: string, value: unknown, keys: string[], errors: string[]): void {
  if (!isRecord(value)) {
    return;
  }
  for (const key of keys) {
    if (!(key in value)) {
      errors.push(`${label} ${field} missing ${key}`);
    }
  }
}

function validatePrototypeEvidence(root: string, label: string, data: Record<string, unknown>, errors: string[]): void {
  if (
    typeof data.prototype_mode === "string" &&
    !["image_prompt_pack", "visual", "interaction", "technical_feasibility", "3d_material", "workflow", "data_logic"].includes(data.prototype_mode)
  ) {
    errors.push(`${label} has invalid prototype_mode ${data.prototype_mode}`);
  }
  for (const key of ["reference_analysis", "concept_evidence", "implementation_evidence", "known_limits"]) {
    if (key in data && !Array.isArray(data[key])) {
      errors.push(`${label} ${key} must be an array`);
    }
  }
  if ("visual_direction" in data && !isRecord(data.visual_direction)) {
    errors.push(`${label} visual_direction must be a mapping`);
  }
  if ("visual_concept_policy" in data) {
    validateVisualConceptPolicy(label, data, errors);
  }
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
  if ("validation_input" in data && !isRecord(data.validation_input)) {
    errors.push(`${label} validation_input must be a mapping`);
  } else {
    validatePrototypeValidationInput(label, data.validation_input, errors);
  }
  if ("source" in data && !isRecord(data.source)) {
    errors.push(`${label} source must be a mapping`);
  }
  if ("negative_constraints" in data && !Array.isArray(data.negative_constraints)) {
    errors.push(`${label} negative_constraints must be an array`);
  }
  if ("review_plan" in data && !isRecord(data.review_plan)) {
    errors.push(`${label} review_plan must be a mapping`);
  }
  if ("directions" in data && !Array.isArray(data.directions)) {
    errors.push(`${label} directions must be an array`);
  }
  if ("screen_manifest" in data && !Array.isArray(data.screen_manifest)) {
    errors.push(`${label} screen_manifest must be an array`);
  }
  if ("screen_prompts" in data && !Array.isArray(data.screen_prompts)) {
    errors.push(`${label} screen_prompts must be an array`);
  }
  if ("prompt_pack_type" in data && !["strategic_proto_prompt_pack", "refined_proto_prompt_pack", "proto_review_evidence"].includes(String(data.prompt_pack_type))) {
    errors.push(`${label} has invalid prompt_pack_type ${String(data.prompt_pack_type)}`);
  }
  if (data.prompt_pack_type === "strategic_proto_prompt_pack") {
    validateStrategicPrototypePromptPack(label, data, errors);
  }
  if (data.prompt_pack_type === "refined_proto_prompt_pack") {
    validateRefinedPrototypePromptPack(label, data, errors);
  }
  if (typeof data.result === "string" && !["pass", "fail", "unclear", "not_reviewed"].includes(data.result)) {
    errors.push(`${label} has invalid result ${data.result}`);
  }
}

function validateRefinedPrototypePromptPack(label: string, data: Record<string, unknown>, errors: string[]): void {
  validateRequiredObjectFields(label, "tune_input", data.tune_input, ["baseline_source_type", "baseline_refs", "tune_request", "regeneration_scope"], errors);
  validateRefinedBaselineResolution(label, data.baseline_resolution, errors);
  validateRefinedCarryForward(label, data.carry_forward, errors);
  validateRefinedBaselineAudit(label, data.baseline_audit, errors);
  validateRequiredObjectFields(label, "product_system", data.product_system, REFINED_PRODUCT_SYSTEM_FIELDS, errors);
  validateRefinedDeltaRules(label, data.delta_rules, data.tune_input, errors);
  validateRefinedScreenDeltaMatrix(label, data.screen_delta_matrix, errors);
  const manifestIds = validateRefinedScreenManifest(label, data.screen_manifest, errors);
  validateRefinedScreenPrompts(label, data.screen_prompts, manifestIds, errors);
  if (!Array.isArray(data.generation_order) || data.generation_order.length === 0) {
    errors.push(`${label} generation_order must list target screen ids`);
  }
  if (!Array.isArray(data.acceptance_checklist) || data.acceptance_checklist.length === 0) {
    errors.push(`${label} acceptance_checklist must be non-empty`);
  }
}

const REFINED_BASELINE_AUDIT_FIELDS = [
  "source_screen_id",
  "screen_name",
  "journey_stage",
  "user_goal",
  "system_state",
  "components",
  "must_preserve",
];

const REFINED_BASELINE_RESOLUTION_FIELDS = [
  "latest_approved_baseline_group_id",
  "latest_approved_baseline_ref",
  "baseline_lineage",
  "resolution_rule",
  "stale_source_guard",
];

const REFINED_CARRY_FORWARD_FIELDS = [
  "locked_screens",
  "locked_elements",
  "preserved_improvements",
  "explicit_unlocks",
  "cumulative_drift_guard",
];

const REFINED_PRODUCT_SYSTEM_FIELDS = [
  "product_thesis",
  "primary_loop",
  "component_vocabulary",
  "copywriting_style",
  "trust_and_boundary_system",
  "stable_constants",
  "adaptable_variables",
];

const REFINED_DELTA_RULE_KEYS = ["must_inherit", "must_add", "must_remove", "flexible_change"];

const REFINED_SCREEN_DELTA_FIELDS = [
  "target_screen_id",
  "source_screen_ids",
  "preserve",
  "add",
  "remove",
  "transform",
  "flexible",
  "acceptance_criteria",
];

const REFINED_SCREEN_MANIFEST_FIELDS = ["target_screen_id", "source_screen_ids", "screen_name", "generation_scope"];
const REFINED_SCREEN_PROMPT_FIELDS = ["prompt_id", "target_screen_id", "source_screen_ids", "screen_name", "prompt", "negative_prompt", "acceptance_criteria"];

function validateRefinedBaselineAudit(label: string, value: unknown, errors: string[]): void {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${label} baseline_audit must contain source screen audits`);
    return;
  }
  value.forEach((item, index) => {
    validateRequiredObjectFields(label, `baseline_audit[${index}]`, item, REFINED_BASELINE_AUDIT_FIELDS, errors);
  });
}

function validateRefinedBaselineResolution(label: string, value: unknown, errors: string[]): void {
  validateRequiredObjectFields(label, "baseline_resolution", value, REFINED_BASELINE_RESOLUTION_FIELDS, errors);
  if (!isRecord(value)) {
    return;
  }
  if (!Array.isArray(value.baseline_lineage)) {
    errors.push(`${label} baseline_resolution.baseline_lineage must be an array`);
  }
  if (String(value.stale_source_guard ?? "").trim().length === 0) {
    errors.push(`${label} baseline_resolution.stale_source_guard must forbid stale source-screen fallback`);
  }
}

function validateRefinedCarryForward(label: string, value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${label} carry_forward must be a mapping`);
    return;
  }
  for (const key of REFINED_CARRY_FORWARD_FIELDS) {
    if (!Object.hasOwn(value, key)) {
      errors.push(`${label} carry_forward.${key} must be present`);
    }
  }
  for (const key of ["locked_screens", "locked_elements", "preserved_improvements", "explicit_unlocks"]) {
    if (!Array.isArray(value[key])) {
      errors.push(`${label} carry_forward.${key} must be an array`);
    }
  }
  if (String(value.cumulative_drift_guard ?? "").trim().length === 0) {
    errors.push(`${label} carry_forward.cumulative_drift_guard must forbid cumulative tune drift`);
  }
}

function validateRefinedDeltaRules(label: string, value: unknown, tuneInput: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${label} delta_rules must be a mapping`);
    return;
  }
  for (const key of REFINED_DELTA_RULE_KEYS) {
    if (!Array.isArray(value[key])) {
      errors.push(`${label} delta_rules.${key} must be an array`);
    }
  }
  if (Array.isArray(value.must_inherit) && value.must_inherit.length === 0) {
    errors.push(`${label} delta_rules.must_inherit must preserve baseline product-system constants`);
  }
  const tuneRequest = isRecord(tuneInput) ? String(tuneInput.tune_request ?? "").toLowerCase() : "";
  if (/\b(remove|delete|drop|eliminate|hide)\b/.test(tuneRequest) && Array.isArray(value.must_remove) && value.must_remove.length === 0) {
    errors.push(`${label} delta_rules.must_remove must name requested removals from tune_input.tune_request`);
  }
}

function validateRefinedScreenDeltaMatrix(label: string, value: unknown, errors: string[]): void {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${label} screen_delta_matrix must contain target screen delta rows`);
    return;
  }
  value.forEach((item, index) => {
    validateRequiredObjectFields(label, `screen_delta_matrix[${index}]`, item, REFINED_SCREEN_DELTA_FIELDS, errors);
  });
}

function validateRefinedScreenManifest(label: string, value: unknown, errors: string[]): Set<string> {
  const ids = new Set<string>();
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${label} screen_manifest must contain target screens`);
    return ids;
  }
  value.forEach((item, index) => {
    validateRequiredObjectFields(label, `screen_manifest[${index}]`, item, REFINED_SCREEN_MANIFEST_FIELDS, errors);
    if (isRecord(item) && nonEmptyString(item.target_screen_id)) {
      ids.add(String(item.target_screen_id));
    }
  });
  return ids;
}

function validateRefinedScreenPrompts(label: string, value: unknown, manifestIds: Set<string>, errors: string[]): void {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${label} screen_prompts must contain screen-bound refined prompts`);
    return;
  }
  value.forEach((item, index) => {
    validateRequiredObjectFields(label, `screen_prompts[${index}]`, item, REFINED_SCREEN_PROMPT_FIELDS, errors);
    if (isRecord(item) && nonEmptyString(item.target_screen_id) && manifestIds.size > 0 && !manifestIds.has(String(item.target_screen_id))) {
      errors.push(`${label} screen_prompts[${index}].target_screen_id must exist in screen_manifest`);
    }
  });
}

const STRATEGIC_NORMALIZED_FIELDS = [
  "product_domain",
  "primary_user",
  "usage_context",
  "current_alternative",
  "core_pain",
  "desired_behavior_change",
  "strongest_success_signal",
  "core_differentiator",
  "emotional_value",
  "functional_value",
  "trust_requirements",
  "privacy_requirements",
  "non_goals",
  "future_opportunities",
  "validation_target",
];

const STRATEGIC_CORE_FIELDS = [
  "target_user",
  "behavior_change",
  "mechanism",
  "differentiator",
  "boundary_conditions",
  "central_uncertainty",
];

const PRODUCT_EXPERIENCE_MODEL_FIELDS = [
  "product_archetype",
  "primary_canvas",
  "information_architecture",
  "domain_object_model",
  "primary_task_loop",
  "interaction_state_model",
  "data_realism_requirements",
  "visual_language",
  "anti_generic_constraints",
];

const PROTOTYPE_REALITY_GATE_DIMENSIONS = [
  "product_category_fit",
  "primary_canvas_fit",
  "domain_object_realism",
  "task_loop_completeness",
  "interaction_state_coverage",
  "data_realism",
  "anti_generic_constraints",
];

const PROMPT_PACK_INTEGRITY_GATE_DIMENSIONS = [
  "direction_count_matches",
  "prompt_text_refs_resolve",
  "generated_image_refs_resolve",
];

const STRATEGIC_PROTOTYPE_BRIEF_FIELDS = [
  "product_name",
  "positioning",
  "target_user",
  "current_alternative",
  "core_idea",
  "primary_loop",
  "trust_boundaries",
  "non_goals",
  "desired_feeling",
];

const STRATEGIC_SCREEN_MANIFEST_FIELDS = [
  "target_screen_id",
  "screen_name",
  "journey_stage",
  "user_goal",
  "system_state",
  "required_components",
  "required_data_fields",
  "primary_actions",
  "trust_controls",
  "example_copy",
  "acceptance_criteria",
];

const STRATEGIC_GLOBAL_DESIGN_SYSTEM_PROMPT_FIELDS = [
  "visual_language",
  "layout_system",
  "component_vocabulary",
  "information_density",
  "copy_tone",
  "responsive_canvas_rules",
  "negative_visual_patterns",
];

const STRATEGIC_SCREEN_PROMPT_FIELDS = [
  "prompt_id",
  "target_screen_id",
  "screen_name",
  "image_role",
  "negative_prompt",
  "example_copy",
  "acceptance_criteria",
];

const STRATEGIC_QUALITY_RUBRIC_FIELDS = [
  "prompt_executability",
  "strategic_distinctness",
  "product_specificity",
  "state_coverage",
  "trust_boundary_coverage",
];

const STRATEGIC_DIRECTION_FIELDS = [
  "direction_id",
  "name",
  "strategic_hypothesis",
  "validates",
  "main_risk",
  "distinctness_rationale",
  "prototype_prompt",
  "screen_prompts",
  "pm_judgment",
];

const STRATEGIC_DISTINCTNESS_SIGNALS = [
  "product form",
  "trigger",
  "interaction model",
  "emotional driver",
  "retention mechanism",
  "metric",
  "main risk",
  "risk",
  "user behavior",
  "workflow",
  "trust",
  "privacy",
];

const STRATEGIC_FINGERPRINT_DIMENSIONS = [
  "product_form",
  "trigger",
  "interaction_model",
  "emotional_driver",
  "retention_mechanism",
  "metric",
  "main_risk",
  "trust_model",
  "privacy_model",
];

const PROTOTYPE_PROMPT_PARAGRAPH_DIMENSIONS = [
  "product_context",
  "target_user",
  "journey",
  "screens_or_components",
  "interaction_or_system_response",
  "concrete_content",
  "trust_or_user_control",
  "visual_direction",
  "anti_goals",
  "desired_user_feeling",
] as const;

const SCREEN_PROMPT_PARAGRAPH_DIMENSIONS = [
  "journey_or_screen_purpose",
  "user_goal_or_system_state",
  "components_or_domain_objects",
  "actions_or_system_response",
  "concrete_content",
  "trust_or_user_control",
  "negative_constraints",
  "acceptance_or_user_feeling",
] as const;

function validatePrototypeValidationInput(label: string, value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    return;
  }
  const mode = String(value.mode ?? "");
  if (mode && !["validation_present", "agent_auto_generated"].includes(mode)) {
    errors.push(`${label} validation_input.mode has invalid value ${mode}`);
  }
  if (mode === "vision_only" || mode === "internally_derived") {
    errors.push(`${label} validation_input.mode must reference durable validation, not ${mode}`);
  }
  if (!Array.isArray(value.refs)) {
    errors.push(`${label} validation_input.refs must be an array`);
  } else if (mode && value.refs.length === 0) {
    errors.push(`${label} validation_input.refs must include durable validation artifact refs`);
  }
}

function validateStrategicPrototypePromptPack(label: string, data: Record<string, unknown>, errors: string[]): void {
  validatePreflightQualityGate(label, data.preflight_quality_gate, errors);
  validateInternalPipeline(label, data.internal_pipeline, errors);
  validateDirectionCountPolicy(label, data.direction_count_policy, errors);
  validateRequiredObjectFields(label, "normalized_input", data.normalized_input, STRATEGIC_NORMALIZED_FIELDS, errors);
  validateRequiredObjectFields(label, "strategic_core", data.strategic_core, STRATEGIC_CORE_FIELDS, errors);
  validateProductExperienceModel(label, data.product_experience_model, data, errors);
  validatePrototypeRealityGate(label, data.prototype_reality_gate, data, errors);
  validatePromptPackIntegrityGate(label, data.prompt_pack_integrity_gate, data, errors);
  validateScreenBoundExecutability(label, data, errors);
  validatePromptParagraphQuality(label, data, errors);
  validateStrategicDirections(label, data.directions, data.direction_count_policy, errors);
  validateBuildRecommendation(label, data.build_recommendation, errors);
  validatePromptTextManifest(label, data.prompt_text_manifest, errors);
  validatePostValidate(label, data.post_validate, data.direction_count_policy, data.prompt_text_manifest, data.image_generation, data.directions, errors);
  validateImageGeneration(label, data.image_generation, errors);
}

function validatePreflightQualityGate(label: string, value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${label} preflight_quality_gate must be a mapping`);
    return;
  }
  for (const key of ["vision_status", "validation_status", "can_proceed", "blockers", "next_command_when_blocked"]) {
    if (!(key in value)) {
      errors.push(`${label} preflight_quality_gate missing ${key}`);
    }
  }
  for (const key of ["vision_status", "validation_status"]) {
    const status = String(value[key] ?? "");
    if (status && !["missing", "thin", "ready"].includes(status)) {
      errors.push(`${label} preflight_quality_gate.${key} has invalid value ${status}`);
    }
  }
  if (value.can_proceed !== true && value.next_command_when_blocked !== "/ow:vision") {
    errors.push(`${label} preflight_quality_gate must route blocked prototype work back to /ow:vision`);
  }
}

function validateInternalPipeline(label: string, value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${label} internal_pipeline must be a mapping`);
    return;
  }
  if (value.orchestrator_command !== "/ow:proto" || value.user_visible_command !== "/ow:proto") {
    errors.push(`${label} internal_pipeline must keep /ow:proto as the user-visible orchestrator`);
  }
  const stages = value.stages;
  if (!Array.isArray(stages)) {
    errors.push(`${label} internal_pipeline.stages must be an array`);
    return;
  }
  const stageIds = new Set<string>();
  for (const item of stages) {
    if (!isRecord(item)) {
      errors.push(`${label} internal_pipeline.stages entries must be mappings`);
      continue;
    }
    const stageId = String(item.stage_id ?? "");
    stageIds.add(stageId);
    for (const key of ["stage_id", "command", "visibility", "status", "outputs"]) {
      if (!(key in item)) {
        errors.push(`${label} internal_pipeline stage missing ${key}`);
      }
    }
    if ((stageId === "vision2prompt" || stageId === "prompt2proto") && item.visibility !== "internal") {
      errors.push(`${label} internal pipeline stage ${stageId} must be internal`);
    }
  }
  for (const required of ["proto-preflight", "vision2prompt", "prompt2proto"]) {
    if (!stageIds.has(required)) {
      errors.push(`${label} internal_pipeline missing stage ${required}`);
    }
  }
}

function validateDirectionCountPolicy(label: string, value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${label} direction_count_policy must be a mapping`);
    return;
  }
  const source = String(value.source ?? "");
  if (source && !["user_input", "agent_default_after_user_delegation"].includes(source)) {
    errors.push(`${label} direction_count_policy.source has invalid value ${source}`);
  }
  if (typeof value.resolved_count !== "number" || value.resolved_count < 1) {
    errors.push(`${label} direction_count_policy.resolved_count must be a positive number`);
  }
  if (source === "agent_default_after_user_delegation" && value.resolved_count !== 3) {
    errors.push(`${label} direction_count_policy delegated default must resolve to 3`);
  }
  if (value.ask_user_question_required === true && !nonEmptyString(value.ask_user_question)) {
    errors.push(`${label} direction_count_policy.ask_user_question must be set when askUserQuestion is required`);
  }
}

function validateRequiredObjectFields(label: string, field: string, value: unknown, keys: string[], errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${label} ${field} must be a mapping`);
    return;
  }
  for (const key of keys) {
    if (!hasUsefulValue(value[key])) {
      errors.push(`${label} ${field}.${key} must be non-empty`);
    }
  }
}

function validateProductExperienceModel(label: string, value: unknown, data: Record<string, unknown>, errors: string[]): void {
  if (!strategicPromptPackRequiresProductExperienceModel(data)) {
    if ("product_experience_model" in data && !isRecord(value)) {
      errors.push(`${label} product_experience_model must be a mapping when present`);
    }
    return;
  }
  validateRequiredObjectFields(label, "product_experience_model", value, PRODUCT_EXPERIENCE_MODEL_FIELDS, errors);
}

function strategicPromptPackRequiresProductExperienceModel(data: Record<string, unknown>): boolean {
  const promptTextManifest = isRecord(data.prompt_text_manifest) ? data.prompt_text_manifest : {};
  const imageGeneration = isRecord(data.image_generation) ? data.image_generation : {};
  return (
    data.status !== "draft" ||
    promptTextManifest.status === "ready_for_image_generation" ||
    promptTextManifest.status === "generated" ||
    (typeof imageGeneration.status === "string" && imageGeneration.status !== "not_started")
  );
}

function validatePrototypeRealityGate(label: string, value: unknown, data: Record<string, unknown>, errors: string[]): void {
  const required = strategicPromptPackRequiresProductExperienceModel(data);
  if (!required) {
    if ("prototype_reality_gate" in data && !isRecord(value)) {
      errors.push(`${label} prototype_reality_gate must be a mapping when present`);
    }
    return;
  }
  if (!isRecord(value)) {
    errors.push(`${label} prototype_reality_gate must be a mapping`);
    return;
  }
  for (const key of ["status", "trigger", "required_when_prompt_text_ready", "dimensions", "failures", "outcome_notes", "repair_route"]) {
    if (!(key in value)) {
      errors.push(`${label} prototype_reality_gate missing ${key}`);
    }
  }
  const status = String(value.status ?? "");
  if (status && !["pending", "pass", "fail"].includes(status)) {
    errors.push(`${label} prototype_reality_gate.status has invalid value ${status}`);
  }
  if (value.trigger !== "before_image_generation") {
    errors.push(`${label} prototype_reality_gate.trigger must be before_image_generation`);
  }
  if (value.required_when_prompt_text_ready !== true) {
    errors.push(`${label} prototype_reality_gate.required_when_prompt_text_ready must be true`);
  }
  if (value.repair_route !== "/ow:vision2prompt") {
    errors.push(`${label} prototype_reality_gate.repair_route must be /ow:vision2prompt`);
  }
  if (!Array.isArray(value.dimensions)) {
    errors.push(`${label} prototype_reality_gate.dimensions must be an array`);
  } else {
    for (const dimension of PROTOTYPE_REALITY_GATE_DIMENSIONS) {
      if (!value.dimensions.includes(dimension)) {
        errors.push(`${label} prototype_reality_gate.dimensions missing ${dimension}`);
      }
    }
  }
  for (const key of ["failures", "outcome_notes"]) {
    if (!Array.isArray(value[key])) {
      errors.push(`${label} prototype_reality_gate.${key} must be an array`);
    }
  }
  const promptTextManifest = isRecord(data.prompt_text_manifest) ? data.prompt_text_manifest : {};
  const imageGeneration = isRecord(data.image_generation) ? data.image_generation : {};
  const promptTextReady = promptTextManifest.status === "ready_for_image_generation" || promptTextManifest.status === "generated";
  if (promptTextReady && status !== "pass") {
    errors.push(`${label} prototype_reality_gate.status must be pass before image generation`);
  }
  if (status === "pass" && Array.isArray(value.failures) && value.failures.length > 0) {
    errors.push(`${label} prototype_reality_gate.failures must be empty when status is pass`);
  }
  if (status === "fail" && typeof imageGeneration.status === "string" && imageGeneration.status !== "not_started") {
    errors.push(`${label} prototype_reality_gate failed gates must not start image_generation`);
  }
}

function validatePromptPackIntegrityGate(label: string, value: unknown, data: Record<string, unknown>, errors: string[]): void {
  const required = strategicPromptPackRequiresProductExperienceModel(data);
  if (!required) {
    if ("prompt_pack_integrity_gate" in data && !isRecord(value)) {
      errors.push(`${label} prompt_pack_integrity_gate must be a mapping when present`);
    }
    return;
  }
  if (!isRecord(value)) {
    errors.push(`${label} prompt_pack_integrity_gate must be a mapping`);
    return;
  }
  for (const key of ["status", "trigger", "required_when_prompt_text_ready", "dimensions", "failures", "outcome_notes", "repair_route"]) {
    if (!(key in value)) {
      errors.push(`${label} prompt_pack_integrity_gate missing ${key}`);
    }
  }
  const status = String(value.status ?? "");
  if (status && !["pending", "pass", "fail"].includes(status)) {
    errors.push(`${label} prompt_pack_integrity_gate.status has invalid value ${status}`);
  }
  if (value.trigger !== "before_image_generation") {
    errors.push(`${label} prompt_pack_integrity_gate.trigger must be before_image_generation`);
  }
  if (value.required_when_prompt_text_ready !== true) {
    errors.push(`${label} prompt_pack_integrity_gate.required_when_prompt_text_ready must be true`);
  }
  if (value.repair_route !== "/ow:vision2prompt") {
    errors.push(`${label} prompt_pack_integrity_gate.repair_route must be /ow:vision2prompt`);
  }
  if (!Array.isArray(value.dimensions)) {
    errors.push(`${label} prompt_pack_integrity_gate.dimensions must be an array`);
  } else {
    for (const dimension of PROMPT_PACK_INTEGRITY_GATE_DIMENSIONS) {
      if (!value.dimensions.includes(dimension)) {
        errors.push(`${label} prompt_pack_integrity_gate.dimensions missing ${dimension}`);
      }
    }
  }
  for (const key of ["failures", "outcome_notes"]) {
    if (!Array.isArray(value[key])) {
      errors.push(`${label} prompt_pack_integrity_gate.${key} must be an array`);
    }
  }

  validatePromptPackIntegrity(label, data, errors);

  const promptTextManifest = isRecord(data.prompt_text_manifest) ? data.prompt_text_manifest : {};
  const imageGeneration = isRecord(data.image_generation) ? data.image_generation : {};
  const promptTextReady = promptTextManifest.status === "ready_for_image_generation" || promptTextManifest.status === "generated";
  if (promptTextReady && status !== "pass") {
    errors.push(`${label} prompt_pack_integrity_gate.status must be pass before image generation`);
  }
  if (status === "pass" && Array.isArray(value.failures) && value.failures.length > 0) {
    errors.push(`${label} prompt_pack_integrity_gate.failures must be empty when status is pass`);
  }
  if (status === "fail" && typeof imageGeneration.status === "string" && imageGeneration.status !== "not_started") {
    errors.push(`${label} prompt_pack_integrity_gate failed gates must not start image_generation`);
  }
}

function validatePromptPackIntegrity(label: string, data: Record<string, unknown>, errors: string[]): void {
  const directions = Array.isArray(data.directions) ? data.directions.filter(isRecord) : [];
  const directionIds = new Set<string>();
  const promptIds = new Set<string>();
  for (const direction of directions) {
    if (nonEmptyString(direction.direction_id)) {
      directionIds.add(String(direction.direction_id));
    }
    if (Array.isArray(direction.screen_prompts)) {
      for (const prompt of direction.screen_prompts) {
        if (isRecord(prompt) && nonEmptyString(prompt.prompt_id)) {
          promptIds.add(String(prompt.prompt_id));
        }
      }
    }
  }

  const countPolicy = isRecord(data.direction_count_policy) ? data.direction_count_policy : {};
  const promptTextManifest = isRecord(data.prompt_text_manifest) ? data.prompt_text_manifest : {};
  const promptTextReady = promptTextManifest.status === "ready_for_image_generation" || promptTextManifest.status === "generated";
  const resolvedCount = typeof countPolicy.resolved_count === "number" ? countPolicy.resolved_count : null;
  if (promptTextReady && resolvedCount !== null && directions.length !== resolvedCount) {
    errors.push(`${label} directions length must equal direction_count_policy.resolved_count before image generation`);
  }
  if (promptTextReady && typeof promptTextManifest.direction_count !== "number") {
    errors.push(`${label} prompt_text_manifest.direction_count must be a number before image generation`);
  }
  if (typeof promptTextManifest.direction_count === "number" && directions.length > 0 && promptTextManifest.direction_count !== directions.length) {
    errors.push(`${label} prompt_text_manifest.direction_count must equal directions length`);
  }

  if (promptTextReady) {
    const refs = Array.isArray(promptTextManifest.prompt_text_refs) ? promptTextManifest.prompt_text_refs : [];
    if (refs.length === 0) {
      errors.push(`${label} prompt_text_manifest.prompt_text_refs must include prompt refs before image generation`);
    }
    refs.forEach((ref, index) => {
      if (!stringReferencesKnownPrompt(String(ref), directionIds, promptIds)) {
        errors.push(`${label} prompt_text_manifest.prompt_text_refs[${index}] must reference an existing direction_id or prompt_id`);
      }
    });
  }

  const imageGeneration = isRecord(data.image_generation) ? data.image_generation : {};
  const generatedImages = Array.isArray(imageGeneration.generated_images) ? imageGeneration.generated_images : [];
  generatedImages.forEach((image, index) => {
    if (!isRecord(image)) {
      return;
    }
    const directionId = String(image.direction_id ?? "");
    const promptId = String(image.prompt_id ?? "");
    if (directionId && !directionIds.has(directionId)) {
      errors.push(`${label} image_generation.generated_images[${index}].direction_id must exist in directions`);
    }
    if (promptId && !promptIds.has(promptId)) {
      errors.push(`${label} image_generation.generated_images[${index}].prompt_id must exist in directions[].screen_prompts`);
    }
    const metadata = isRecord(image.metadata) ? image.metadata : {};
    const sourcePromptRef = String(metadata.source_prompt_ref ?? "");
    if (sourcePromptRef && !stringReferencesKnownPrompt(sourcePromptRef, directionIds, promptIds)) {
      errors.push(`${label} image_generation.generated_images[${index}].metadata.source_prompt_ref must reference an existing direction_id or prompt_id`);
    }
  });
}

function validateScreenBoundExecutability(label: string, data: Record<string, unknown>, errors: string[]): void {
  if (!strategicPromptPackRequiresScreenExecutability(data)) {
    return;
  }
  validateRequiredObjectFields(label, "prototype_brief", data.prototype_brief, STRATEGIC_PROTOTYPE_BRIEF_FIELDS, errors);
  validateRequiredObjectFields(label, "global_design_system_prompt", data.global_design_system_prompt, STRATEGIC_GLOBAL_DESIGN_SYSTEM_PROMPT_FIELDS, errors);
  validateRequiredObjectFields(label, "quality_rubric", data.quality_rubric, STRATEGIC_QUALITY_RUBRIC_FIELDS, errors);
  const manifestIds = validateStrategicScreenManifest(label, data.screen_manifest, errors);
  validateStrategicDirectionScreenPrompts(label, data.directions, manifestIds, errors);
}

function strategicPromptPackRequiresScreenExecutability(data: Record<string, unknown>): boolean {
  const promptTextManifest = isRecord(data.prompt_text_manifest) ? data.prompt_text_manifest : {};
  const imageGeneration = isRecord(data.image_generation) ? data.image_generation : {};
  return (
    promptTextManifest.status === "ready_for_image_generation" ||
    promptTextManifest.status === "generated" ||
    (typeof imageGeneration.status === "string" && imageGeneration.status !== "not_started")
  );
}

function validateStrategicScreenManifest(label: string, value: unknown, errors: string[]): Set<string> {
  const ids = new Set<string>();
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${label} screen_manifest must contain screen-bound product states before image generation`);
    return ids;
  }
  value.forEach((item, index) => {
    validateRequiredObjectFields(label, `screen_manifest[${index}]`, item, STRATEGIC_SCREEN_MANIFEST_FIELDS, errors);
    if (!isRecord(item)) {
      return;
    }
    if (nonEmptyString(item.target_screen_id)) {
      ids.add(String(item.target_screen_id));
    }
    if (!hasUsefulValue(item.ai_behavior) && !hasUsefulValue(item.non_ai_rationale)) {
      errors.push(`${label} screen_manifest[${index}] must include ai_behavior or non_ai_rationale`);
    }
  });
  return ids;
}

function validateStrategicDirectionScreenPrompts(label: string, directions: unknown, manifestIds: Set<string>, errors: string[]): void {
  if (!Array.isArray(directions)) {
    return;
  }
  directions.forEach((direction, directionIndex) => {
    if (!isRecord(direction)) {
      return;
    }
    const screenPrompts = direction.screen_prompts;
    if (!Array.isArray(screenPrompts) || screenPrompts.length === 0) {
      errors.push(`${label} directions[${directionIndex}].screen_prompts must contain screen-bound prompt text before image generation`);
      return;
    }
    screenPrompts.forEach((prompt, promptIndex) => {
      const fieldLabel = `directions[${directionIndex}].screen_prompts[${promptIndex}]`;
      validateRequiredObjectFields(label, fieldLabel, prompt, STRATEGIC_SCREEN_PROMPT_FIELDS, errors);
      if (!isRecord(prompt)) {
        return;
      }
      if (!hasUsefulValue(prompt.prompt) && !hasUsefulValue(prompt.standalone_prompt)) {
        errors.push(`${label} ${fieldLabel} must include prompt or standalone_prompt`);
      }
      if (nonEmptyString(prompt.target_screen_id) && manifestIds.size > 0 && !manifestIds.has(String(prompt.target_screen_id))) {
        errors.push(`${label} ${fieldLabel}.target_screen_id must exist in screen_manifest`);
      }
    });
  });
}

function validatePromptParagraphQuality(label: string, data: Record<string, unknown>, errors: string[]): void {
  if (!strategicPromptPackRequiresScreenExecutability(data)) {
    return;
  }
  const directions = Array.isArray(data.directions) ? data.directions : [];
  directions.forEach((direction, directionIndex) => {
    if (!isRecord(direction)) {
      return;
    }
    const prototypePrompt = String(direction.prototype_prompt ?? "");
    const missingPrototypeDimensions = promptParagraphMissingDimensions(
      prototypePrompt,
      PROTOTYPE_PROMPT_PARAGRAPH_DIMENSIONS,
      70,
    );
    if (missingPrototypeDimensions.length > 0) {
      errors.push(
        `${label} directions[${directionIndex}].prototype_prompt missing prompt paragraph quality dimensions: ${missingPrototypeDimensions.join(", ")}`,
      );
    }
    const screenPrompts = Array.isArray(direction.screen_prompts) ? direction.screen_prompts : [];
    screenPrompts.forEach((prompt, promptIndex) => {
      if (!isRecord(prompt)) {
        return;
      }
      const text = String(prompt.prompt ?? prompt.standalone_prompt ?? prompt.prompt_text ?? "");
      const missingScreenDimensions = promptParagraphMissingDimensions(
        text,
        SCREEN_PROMPT_PARAGRAPH_DIMENSIONS,
        55,
      );
      if (missingScreenDimensions.length > 0) {
        errors.push(
          `${label} directions[${directionIndex}].screen_prompts[${promptIndex}].prompt missing prompt paragraph quality dimensions: ${missingScreenDimensions.join(", ")}`,
        );
      }
    });
  });
}

function promptParagraphMissingDimensions(text: string, dimensions: readonly string[], minimumWords: number): string[] {
  const normalized = normalizePromptParagraphText(text);
  const missing: string[] = [];
  if (wordCount(normalized) < minimumWords) {
    missing.push("minimum_substance");
  }
  for (const dimension of dimensions) {
    if (!promptTextCoversDimension(normalized, dimension)) {
      missing.push(dimension);
    }
  }
  return missing;
}

function normalizePromptParagraphText(text: string): string {
  return text.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function wordCount(text: string): number {
  return text.length === 0 ? 0 : text.split(/\s+/).filter(Boolean).length;
}

function promptTextCoversDimension(text: string, dimension: string): boolean {
  const groups: Record<string, string[]> = {
    product_context: ["product", "called", "positioning", "prototype", "dashboard", "app", "workflow", "platform"],
    target_user: ["target user", "user", "operator", "reviewer", "adult", "lead", "planner", "coordinator"],
    journey: ["journey", "flow", "step", "screen", "stage", "loop", "from", "then", "after"],
    screens_or_components: ["screen", "component", "panel", "drawer", "card", "button", "control", "map", "list", "navigation"],
    interaction_or_system_response: ["action", "respond", "response", "when the user", "after the user", "system", "ai", "copilot", "confirm", "revise"],
    concrete_content: ["example", "copy", "metric", "data", "id", "timestamp", "owner", "confidence", "message", "label"],
    trust_or_user_control: ["trust", "privacy", "control", "approval", "consent", "delete", "edit", "human", "audit", "citation"],
    visual_direction: ["visual", "layout", "canvas", "density", "style", "component vocabulary", "map first", "voice first", "mobile", "desktop"],
    anti_goals: ["do not", "avoid", "must not", "not a", "not an", "anti goal", "negative"],
    desired_user_feeling: ["feel", "feeling", "confidence", "safe", "credible", "calm", "control", "trust", "relief"],
    journey_or_screen_purpose: ["journey", "purpose", "screen", "stage", "flow", "entry", "recap", "review", "response", "monitor"],
    user_goal_or_system_state: ["goal", "user", "operator", "state", "selected", "pending", "stale", "blocked", "ready", "active"],
    components_or_domain_objects: ["component", "panel", "drawer", "card", "button", "control", "map", "object", "incident", "parcel", "route", "memory"],
    actions_or_system_response: ["action", "tap", "select", "confirm", "revise", "respond", "response", "system", "ai", "copilot"],
    negative_constraints: ["do not", "avoid", "must not", "negative", "not show", "not turn"],
    acceptance_or_user_feeling: ["acceptance", "must show", "should make", "feel", "confidence", "credible", "safe", "control"],
  };
  return (groups[dimension] ?? []).some((token) => text.includes(token));
}

function stringReferencesKnownPrompt(value: string, directionIds: Set<string>, promptIds: Set<string>): boolean {
  const normalized = normalizePromptRef(value);
  if (normalized.length === 0) {
    return false;
  }
  for (const id of [...directionIds, ...promptIds]) {
    const token = normalizePromptRef(id);
    if (token.length > 0 && normalized.includes(token)) {
      return true;
    }
  }
  return false;
}

function normalizePromptRef(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function validateStrategicDirections(label: string, value: unknown, countPolicy: unknown, errors: string[]): void {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${label} directions must contain strategic prompt directions`);
    return;
  }
  const resolvedCount = isRecord(countPolicy) && typeof countPolicy.resolved_count === "number" ? countPolicy.resolved_count : null;
  if (resolvedCount !== null && value.length < resolvedCount) {
    errors.push(`${label} directions must include at least direction_count_policy.resolved_count items`);
  }
  value.forEach((item, index) => {
    if (!isRecord(item)) {
      errors.push(`${label} directions[${index}] must be a mapping`);
      return;
    }
    for (const key of STRATEGIC_DIRECTION_FIELDS) {
      if (!hasUsefulValue(item[key])) {
        errors.push(`${label} directions[${index}].${key} must be non-empty`);
      }
    }
    const screenPrompts = item.screen_prompts;
    if (Array.isArray(screenPrompts) && screenPrompts.length < 2) {
      errors.push(`${label} directions[${index}].screen_prompts must include multi-image prompt text`);
    }
    const distinctness = String(item.distinctness_rationale ?? "").toLowerCase();
    if (!STRATEGIC_DISTINCTNESS_SIGNALS.some((signal) => distinctness.includes(signal))) {
      errors.push(`${label} directions[${index}].distinctness_rationale must name a strategic difference, not only visual style`);
    }
  });
}

function validateBuildRecommendation(label: string, value: unknown, errors: string[]): void {
  validateRequiredObjectFields(label, "build_recommendation", value, ["first_direction_id", "why_first", "success_signals", "failure_signals", "next_test_if_it_works"], errors);
}

function validatePromptTextManifest(label: string, value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${label} prompt_text_manifest must be a mapping`);
    return;
  }
  const status = String(value.status ?? "");
  if (status && !["draft", "ready_for_image_generation", "generated"].includes(status)) {
    errors.push(`${label} prompt_text_manifest.status has invalid value ${status}`);
  }
  if (status !== "draft" && value.directions_ready !== true) {
    errors.push(`${label} prompt_text_manifest.directions_ready must be true before image generation`);
  }
  if (!Array.isArray(value.prompt_text_refs)) {
    errors.push(`${label} prompt_text_manifest.prompt_text_refs must be an array`);
  }
}

function validatePostValidate(label: string, value: unknown, countPolicy: unknown, promptTextManifest: unknown, imageGeneration: unknown, directions: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${label} post_validate must be a mapping`);
    return;
  }
  for (const key of ["status", "trigger", "required_when_direction_count_gte", "skip_when_resolved_count", "threshold_policy", "fingerprint_dimensions", "comparisons", "failures", "outcome_notes", "repair_route"]) {
    if (!(key in value)) {
      errors.push(`${label} post_validate missing ${key}`);
    }
  }
  const status = String(value.status ?? "");
  if (status && !["pending", "pass", "fail", "skipped"].includes(status)) {
    errors.push(`${label} post_validate.status has invalid value ${status}`);
  }
  if (value.trigger !== "after_prompt_assets_ready") {
    errors.push(`${label} post_validate.trigger must be after_prompt_assets_ready`);
  }
  if (value.required_when_direction_count_gte !== 2) {
    errors.push(`${label} post_validate.required_when_direction_count_gte must be 2`);
  }
  if (value.skip_when_resolved_count !== 1) {
    errors.push(`${label} post_validate.skip_when_resolved_count must be 1`);
  }
  if (value.repair_route !== "/ow:vision2prompt") {
    errors.push(`${label} post_validate.repair_route must be /ow:vision2prompt`);
  }
  const thresholdPolicy = value.threshold_policy;
  if (!isRecord(thresholdPolicy)) {
    errors.push(`${label} post_validate.threshold_policy must be a mapping`);
  } else {
    if (thresholdPolicy.method !== "strategic_fingerprint_similarity") {
      errors.push(`${label} post_validate.threshold_policy.method must be strategic_fingerprint_similarity`);
    }
    if (thresholdPolicy.comparison !== "pairwise") {
      errors.push(`${label} post_validate.threshold_policy.comparison must be pairwise`);
    }
    if (typeof thresholdPolicy.max_pairwise_similarity !== "number" || thresholdPolicy.max_pairwise_similarity <= 0 || thresholdPolicy.max_pairwise_similarity >= 1) {
      errors.push(`${label} post_validate.threshold_policy.max_pairwise_similarity must be between 0 and 1`);
    }
  }
  if (!Array.isArray(value.fingerprint_dimensions)) {
    errors.push(`${label} post_validate.fingerprint_dimensions must be an array`);
  } else {
    for (const dimension of STRATEGIC_FINGERPRINT_DIMENSIONS) {
      if (!value.fingerprint_dimensions.includes(dimension)) {
        errors.push(`${label} post_validate.fingerprint_dimensions missing ${dimension}`);
      }
    }
  }
  for (const key of ["comparisons", "failures", "outcome_notes"]) {
    if (!Array.isArray(value[key])) {
      errors.push(`${label} post_validate.${key} must be an array`);
    }
  }

  const resolvedCount = isRecord(countPolicy) && typeof countPolicy.resolved_count === "number" ? countPolicy.resolved_count : null;
  const promptStatus = isRecord(promptTextManifest) ? String(promptTextManifest.status ?? "") : "";
  const promptReady = promptStatus === "ready_for_image_generation" || promptStatus === "generated";
  if (resolvedCount === 1 && status !== "skipped") {
    errors.push(`${label} post_validate.status must be skipped when direction_count_policy.resolved_count is 1`);
  }
  if (promptReady && resolvedCount !== null && resolvedCount >= 2 && !["pass", "fail"].includes(status)) {
    errors.push(`${label} post_validate.status must be pass or fail before /ow:prompt2proto when resolved_count is 2 or more`);
  }
  if (status === "skipped" && resolvedCount !== 1) {
    errors.push(`${label} post_validate.status can be skipped only when resolved_count is 1`);
  }
  if (status === "fail") {
    const imageStatus = isRecord(imageGeneration) ? String(imageGeneration.status ?? "") : "";
    if (["queued", "in_progress", "complete"].includes(imageStatus)) {
      errors.push(`${label} post_validate failed gates must not start image_generation`);
    }
  }
  if (status === "pass" && promptReady && resolvedCount !== null && resolvedCount >= 2) {
    validateStrategicFingerprintSimilarity(label, directions, value.fingerprint_dimensions, thresholdPolicy, errors);
  }
}

function validateStrategicFingerprintSimilarity(label: string, directions: unknown, dimensions: unknown, thresholdPolicy: unknown, errors: string[]): void {
  if (!Array.isArray(directions) || !Array.isArray(dimensions) || !isRecord(thresholdPolicy)) {
    return;
  }
  const threshold = typeof thresholdPolicy.max_pairwise_similarity === "number" ? thresholdPolicy.max_pairwise_similarity : null;
  if (threshold === null) {
    return;
  }
  const records = directions
    .filter(isRecord)
    .map((direction, index) => {
      const directionId = nonEmptyString(direction.direction_id) ? String(direction.direction_id) : `index-${index}`;
      const fingerprint = isRecord(direction.strategic_fingerprint) ? direction.strategic_fingerprint : null;
      if (fingerprint === null) {
        errors.push(`${label} directions[${index}].strategic_fingerprint must be set when post_validate.status is pass`);
      }
      return { directionId, index, fingerprint };
    });
  for (let left = 0; left < records.length; left += 1) {
    for (let right = left + 1; right < records.length; right += 1) {
      const leftRecord = records[left];
      const rightRecord = records[right];
      if (!leftRecord?.fingerprint || !rightRecord?.fingerprint) {
        continue;
      }
      const result = compareStrategicFingerprints(leftRecord.fingerprint, rightRecord.fingerprint, dimensions);
      if (result.comparedCount === 0) {
        errors.push(`${label} post_validate cannot compare ${leftRecord.directionId} and ${rightRecord.directionId}: no populated strategic_fingerprint dimensions`);
        continue;
      }
      if (result.score > threshold) {
        errors.push(`${label} post_validate pair ${leftRecord.directionId}/${rightRecord.directionId} exceeds strategic fingerprint similarity threshold ${threshold}: score ${formatSimilarity(result.score)} shared dimensions ${result.sharedDimensions.join(", ")}`);
      }
    }
  }
}

function compareStrategicFingerprints(left: Record<string, unknown>, right: Record<string, unknown>, dimensions: unknown[]): { score: number; comparedCount: number; sharedDimensions: string[] } {
  let total = 0;
  let comparedCount = 0;
  const sharedDimensions: string[] = [];
  for (const rawDimension of dimensions) {
    const dimension = String(rawDimension);
    const leftTokens = fingerprintTokens(left[dimension]);
    const rightTokens = fingerprintTokens(right[dimension]);
    if (leftTokens.size === 0 || rightTokens.size === 0) {
      continue;
    }
    const similarity = jaccardSimilarity(leftTokens, rightTokens);
    total += similarity;
    comparedCount += 1;
    if (similarity >= 0.8) {
      sharedDimensions.push(dimension);
    }
  }
  return {
    score: comparedCount === 0 ? 0 : total / comparedCount,
    comparedCount,
    sharedDimensions,
  };
}

function fingerprintTokens(value: unknown): Set<string> {
  const raw = Array.isArray(value)
    ? value.join(" ")
    : isRecord(value)
      ? Object.values(value).join(" ")
      : String(value ?? "");
  return new Set(raw.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 1));
}

function jaccardSimilarity(left: Set<string>, right: Set<string>): number {
  let intersection = 0;
  for (const token of left) {
    if (right.has(token)) {
      intersection += 1;
    }
  }
  const union = left.size + right.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function formatSimilarity(value: number): string {
  return value.toFixed(2);
}

function validateImageGeneration(label: string, value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${label} image_generation must be a mapping`);
    return;
  }
  const status = String(value.status ?? "");
  if (status && !["not_started", "queued", "in_progress", "complete", "blocked"].includes(status)) {
    errors.push(`${label} image_generation.status has invalid value ${status}`);
  }
  if (!nonEmptyString(value.batch_strategy)) {
    errors.push(`${label} image_generation.batch_strategy must be non-empty`);
  }
  if (!Array.isArray(value.generated_images)) {
    errors.push(`${label} image_generation.generated_images must be an array`);
  } else {
    value.generated_images.forEach((item, index) => validateGeneratedImageMetadata(label, item, index, errors));
  }
  if (!Array.isArray(value.collection_notes)) {
    errors.push(`${label} image_generation.collection_notes must be an array`);
  }
}

function validateGeneratedImageMetadata(label: string, value: unknown, index: number, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${label} image_generation.generated_images[${index}] must be a mapping`);
    return;
  }
  for (const key of ["image_id", "direction_id", "prompt_id", "screen_name", "path", "metadata"]) {
    if (!hasUsefulValue(value[key])) {
      errors.push(`${label} image_generation.generated_images[${index}].${key} must be non-empty`);
    }
  }
  const metadata = value.metadata;
  if (!isRecord(metadata)) {
    errors.push(`${label} image_generation.generated_images[${index}].metadata must be a mapping`);
    return;
  }
  for (const key of ["source_prompt_ref", "generated_at", "generator", "generation_status", "review_status"]) {
    if (!hasUsefulValue(metadata[key])) {
      errors.push(`${label} image_generation.generated_images[${index}].metadata.${key} must be non-empty`);
    }
  }
}

function hasUsefulValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (isRecord(value)) {
    return Object.keys(value).length > 0;
  }
  return nonEmptyString(value);
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
  if (!existsSyncMarker(resolved)) {
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
  if (
    typeof data.outcome === "string" &&
    !["continue", "revise", "pivot", "stop", "needs_more_evidence"].includes(data.outcome)
  ) {
    errors.push(`${label} has invalid outcome ${data.outcome}`);
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
        if (entry.name !== "_templates") {
          await walk(path);
        }
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
