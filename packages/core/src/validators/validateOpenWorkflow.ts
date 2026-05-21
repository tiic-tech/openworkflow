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
  if (typeof data.result === "string" && !["pass", "fail", "unclear", "not_reviewed"].includes(data.result)) {
    errors.push(`${label} has invalid result ${data.result}`);
  }
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
  validateDirectionCountPolicy(label, data.direction_count_policy, errors);
  validateRequiredObjectFields(label, "normalized_input", data.normalized_input, STRATEGIC_NORMALIZED_FIELDS, errors);
  validateRequiredObjectFields(label, "strategic_core", data.strategic_core, STRATEGIC_CORE_FIELDS, errors);
  validateStrategicDirections(label, data.directions, data.direction_count_policy, errors);
  validateBuildRecommendation(label, data.build_recommendation, errors);
  validatePromptTextManifest(label, data.prompt_text_manifest, errors);
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
  }
  if (!Array.isArray(value.collection_notes)) {
    errors.push(`${label} image_generation.collection_notes must be an array`);
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
