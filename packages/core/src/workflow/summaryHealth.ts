import { readdir, stat } from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
import { parseYaml } from "../contracts/yaml.js";
import { isNotFound, readTextFile } from "../fs/index.js";

export type SummaryHealthStatus = "not_applicable" | "not_instantiated" | "missing" | "present" | "stale_unknown" | "current";
export type SummaryQualityStatus = "unknown" | "usable" | "current_but_thin";

export interface SummaryHealthItem {
  artifact_path: string;
  summary_path: string | null;
  current_slice: string[] | null;
  status: SummaryHealthStatus;
  source_status: string | null;
  empty_key_fields: string[];
  quality_status: SummaryQualityStatus;
  quality_warnings: string[];
  warnings: string[];
}

export interface SummaryHealthEntry {
  artifact_type: string;
  command: string;
  strategy: "summary_file" | "current_slice" | "none";
  policy_path: string | null;
  status: SummaryHealthStatus;
  instantiated_count: number;
  items: SummaryHealthItem[];
  warnings: string[];
  next_actions: string[];
}

export interface SummaryHealthModel {
  ok: boolean;
  initialized: boolean;
  contracts_path: string;
  counts: Record<SummaryHealthStatus, number>;
  entries: SummaryHealthEntry[];
  planning_queue_health_errors: string[];
  planning_queue_guidance: string[];
  warnings: string[];
  next_actions: string[];
}

export interface SummaryQualityGate {
  strict: boolean;
  ok: boolean;
  health_errors: string[];
}

export type SummaryQualitySummaryStatus = "not_initialized" | "needs_refresh" | "current_but_thin" | "trusted";

export interface SummaryQualitySummary {
  initialized: boolean;
  status: SummaryQualitySummaryStatus;
  freshness_ok: boolean;
  strict_quality_ok: boolean;
  handoff_quality_ok: boolean;
  counts: Record<SummaryHealthStatus, number>;
  instantiated_count: number;
  current_but_thin_count: number;
  freshness_health_error_count: number;
  strict_quality_health_error_count: number;
  health_error_count: number;
  warning_count: number;
  next_actions: string[];
}

interface SummaryArtifactContract {
  artifactType: string;
  command: string;
  sourceOfTruthPath: string;
  summaryPolicy?: SummaryPolicy;
}

interface SummaryPolicy {
  strategy: "summary_file" | "current_slice";
  path: string;
  loadBeforeFull: boolean;
  refreshWhen: string;
}

export async function evaluateSummaryHealth(root: string): Promise<SummaryHealthModel> {
  const contractsPath = join(root, ".openworkflow", "audit", "ARTIFACT_CONTRACTS.yaml");
  const contracts = await loadArtifactContracts(contractsPath);
  if (!contracts) {
    return {
      ok: false,
      initialized: false,
      contracts_path: ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
      counts: emptyCounts(),
      entries: [],
      planning_queue_health_errors: [],
      planning_queue_guidance: [],
      warnings: ["missing OpenWorkflow artifact contracts: .openworkflow/audit/ARTIFACT_CONTRACTS.yaml"],
      next_actions: ["run openworkflow init <folder> --tools codex, or run openworkflow sync on an initialized project"],
    };
  }
  const entries = await Promise.all(contracts.map((contract) => evaluateContract(root, contract)));
  const planningQueueAudit = await evaluatePlanningQueueCommitEvidence(root);
  const warnings = unique([
    ...entries.flatMap((entry) => entry.warnings),
    ...planningQueueAudit.guidance,
  ]);
  const nextActions = unique([
    ...entries.flatMap((entry) => entry.next_actions),
    ...planningQueueAudit.next_actions,
  ]);
  return {
    ok: !entries.some((entry) => ["missing", "stale_unknown"].includes(entry.status)),
    initialized: true,
    contracts_path: ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
    counts: countStatuses(entries),
    entries,
    planning_queue_health_errors: planningQueueAudit.health_errors,
    planning_queue_guidance: planningQueueAudit.guidance,
    warnings,
    next_actions: nextActions,
  };
}

export function evaluateSummaryQualityGate(health: SummaryHealthModel, strict: boolean): SummaryQualityGate {
  const healthErrors = strict ? summaryQualityHealthErrors(health) : [];
  return {
    strict,
    ok: healthErrors.length === 0,
    health_errors: healthErrors,
  };
}

export function summaryQualityHealthErrors(health: SummaryHealthModel): string[] {
  return unique([
    ...health.entries.flatMap((entry) =>
      entry.items.flatMap((item) => {
        if (item.quality_status !== "current_but_thin") {
          return [];
        }
        const details = item.quality_warnings.length > 0
          ? item.quality_warnings
          : [`summary source quality is current_but_thin: ${item.artifact_path}`];
        return details.map((detail) => `summary quality ${entry.artifact_type}: ${detail}`);
      })
    ),
    ...health.planning_queue_health_errors,
  ]);
}

export function buildSummaryQualitySummary(
  health: SummaryHealthModel,
  strictQuality: SummaryQualityGate = evaluateSummaryQualityGate(health, true),
): SummaryQualitySummary {
  const currentButThinCount = health.entries.reduce(
    (count, entry) => count + entry.items.filter((item) => item.quality_status === "current_but_thin").length,
    0,
  );
  const freshnessHealthErrorCount = health.ok ? 0 : health.warnings.length;
  const strictQualityHealthErrorCount = strictQuality.health_errors.length;
  const handoffQualityOk = health.ok && strictQuality.ok;
  return {
    initialized: health.initialized,
    status: summaryQualitySummaryStatus(health, strictQuality),
    freshness_ok: health.ok,
    strict_quality_ok: strictQuality.ok,
    handoff_quality_ok: handoffQualityOk,
    counts: health.counts,
    instantiated_count: health.entries.reduce((count, entry) => count + entry.instantiated_count, 0),
    current_but_thin_count: currentButThinCount,
    freshness_health_error_count: freshnessHealthErrorCount,
    strict_quality_health_error_count: strictQualityHealthErrorCount,
    health_error_count: freshnessHealthErrorCount + strictQualityHealthErrorCount,
    warning_count: health.warnings.length,
    next_actions: summaryQualityNextActions(health, strictQuality),
  };
}

function summaryQualitySummaryStatus(health: SummaryHealthModel, strictQuality: SummaryQualityGate): SummaryQualitySummaryStatus {
  if (!health.initialized) {
    return "not_initialized";
  }
  if (!health.ok) {
    return "needs_refresh";
  }
  if (!strictQuality.ok) {
    return "current_but_thin";
  }
  return "trusted";
}

function summaryQualityNextActions(health: SummaryHealthModel, strictQuality: SummaryQualityGate): string[] {
  if (!health.initialized) {
    return ["run openworkflow init <folder> --tools codex, or run openworkflow sync on an initialized project"];
  }
  return unique([
    ...(!health.ok ? health.next_actions : []),
    ...(health.planning_queue_health_errors.length > 0 ? [
      "repair selected-change commit evidence before trusting handoff; run openworkflow git-automation commit for the affected candidate",
    ] : []),
    ...(!strictQuality.ok ? ["run openworkflow summaries --root . --strict --json before trusting artifact handoff quality"] : []),
  ]);
}

async function loadArtifactContracts(contractsPath: string): Promise<SummaryArtifactContract[] | null> {
  try {
    const parsed = parseYaml(await readTextFile(contractsPath));
    if (isRecord(parsed) && Array.isArray(parsed.artifacts)) {
      return parsed.artifacts.flatMap((artifact) => {
        const mapped = artifactContractFromRecord(artifact);
        return mapped ? [mapped] : [];
      });
    }
    return [];
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
    return null;
  }
}

function artifactContractFromRecord(value: unknown): SummaryArtifactContract | null {
  if (!isRecord(value)) {
    return null;
  }
  const artifactType = stringValue(value.artifact_type);
  const command = stringValue(value.command);
  const sourceOfTruthPath = stringValue(value.source_of_truth_path);
  if (!artifactType || !command || !sourceOfTruthPath) {
    return null;
  }
  return {
    artifactType,
    command,
    sourceOfTruthPath,
    summaryPolicy: summaryPolicyFromRecord(value.summary_policy),
  };
}

function summaryPolicyFromRecord(value: unknown): SummaryPolicy | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const strategy = stringValue(value.strategy);
  const path = stringValue(value.path);
  if ((strategy !== "summary_file" && strategy !== "current_slice") || !path) {
    return undefined;
  }
  return {
    strategy,
    path,
    loadBeforeFull: value.load_before_full === true,
    refreshWhen: stringValue(value.refresh_when) ?? "",
  };
}

async function evaluateContract(root: string, contract: SummaryArtifactContract): Promise<SummaryHealthEntry> {
  if (!contract.summaryPolicy) {
    return {
      artifact_type: contract.artifactType,
      command: contract.command,
      strategy: "none",
      policy_path: null,
      status: "not_applicable",
      instantiated_count: 0,
      items: [],
      warnings: [],
      next_actions: [],
    };
  }

  const artifacts = await findInstantiatedArtifacts(root, contract);
  if (artifacts.length === 0) {
    return {
      artifact_type: contract.artifactType,
      command: contract.command,
      strategy: contract.summaryPolicy.strategy,
      policy_path: contract.summaryPolicy.path,
      status: "not_instantiated",
      instantiated_count: 0,
      items: [],
      warnings: [],
      next_actions: [],
    };
  }

  const items = await Promise.all(artifacts.map((path) => evaluateArtifact(root, path, contract)));
  const status = aggregateStatus(items.map((item) => item.status));
  const warnings = items.flatMap((item) => item.warnings);
  return {
    artifact_type: contract.artifactType,
    command: contract.command,
    strategy: contract.summaryPolicy.strategy,
    policy_path: contract.summaryPolicy.path,
    status,
    instantiated_count: items.length,
    items,
    warnings,
    next_actions: nextActionsFor(status, contract),
  };
}

async function evaluateArtifact(root: string, artifactPath: string, contract: SummaryArtifactContract): Promise<SummaryHealthItem> {
  if (!contract.summaryPolicy) {
    return {
      artifact_path: artifactPath,
      summary_path: null,
      current_slice: null,
      status: "not_applicable",
      source_status: null,
      empty_key_fields: [],
      quality_status: "unknown",
      quality_warnings: [],
      warnings: [],
    };
  }

  const source = await readYamlRecord(join(root, artifactPath));
  const quality = qualityForArtifact(artifactPath, contract.artifactType, source);
  if (contract.summaryPolicy.strategy === "current_slice") {
    const fields = currentSliceFields(contract.summaryPolicy.path);
    const missing = fields.filter((field) => !hasNonEmptyValue(source?.[field]));
    return {
      artifact_path: artifactPath,
      summary_path: null,
      current_slice: fields,
      status: missing.length === 0 ? "current" : "missing",
      ...quality,
      warnings: [
        ...missing.map((field) => `missing current_slice field ${field} in ${artifactPath}`),
        ...quality.quality_warnings,
      ],
    };
  }

  const summaryPath = summaryPathForArtifact(artifactPath, contract);
  const artifactStat = await stat(join(root, artifactPath));
  const summaryStat = await statOptional(join(root, summaryPath));
  if (!summaryStat) {
    return {
      artifact_path: artifactPath,
      summary_path: summaryPath,
      current_slice: null,
      status: "missing",
      ...quality,
      warnings: [`missing summary file: ${summaryPath}`],
    };
  }
  const current = summaryStat.mtimeMs >= artifactStat.mtimeMs;
  return {
    artifact_path: artifactPath,
    summary_path: summaryPath,
    current_slice: null,
    status: current ? "current" : "stale_unknown",
    ...quality,
    warnings: current ? quality.quality_warnings : [`summary may be stale: ${summaryPath}`, ...quality.quality_warnings],
  };
}

function qualityForArtifact(
  artifactPath: string,
  artifactType: string,
  source: Record<string, unknown> | null,
): Pick<SummaryHealthItem, "source_status" | "empty_key_fields" | "quality_status" | "quality_warnings"> {
  if (!source) {
    return {
      source_status: null,
      empty_key_fields: qualityFieldsForArtifact(artifactType),
      quality_status: "current_but_thin",
      quality_warnings: [`source artifact could not be read for quality assessment: ${artifactPath}`],
    };
  }
  const sourceStatus = stringValue(source.status);
  const emptyKeyFields = qualityFieldsForArtifact(artifactType).filter((field) => !hasNonEmptyValue(valueAtPath(source, field)));
  const readinessWarnings = readinessWarningsForArtifact(artifactPath, artifactType, source);
  const qualityWarnings = [
    ...(sourceStatus === "draft" ? [`source artifact is draft: ${artifactPath}`] : []),
    ...(emptyKeyFields.length > 0 ? [`source artifact has empty handoff fields in ${artifactPath}: ${emptyKeyFields.join(", ")}`] : []),
    ...readinessWarnings,
  ];
  return {
    source_status: sourceStatus,
    empty_key_fields: emptyKeyFields,
    quality_status: qualityWarnings.length > 0 ? "current_but_thin" : "usable",
    quality_warnings: qualityWarnings,
  };
}

function qualityFieldsForArtifact(artifactType: string): string[] {
  if (artifactType === "vision_session") {
    return [
      "vision_delta.one_sentence",
      "vision_delta.problem",
      "vision_delta.users",
      "vision_delta.goals",
      "vision_delta.non_goals",
      "vision_delta.quality_bar",
      "vision_delta.ai_native_role",
      "vision_delta.success_signals",
      "vision_delta.failure_signals",
      "strategic_core.target_user",
      "strategic_core.current_alternative",
      "strategic_core.desired_behavior_change",
      "strategic_core.core_mechanism",
      "strategic_core.core_differentiator",
      "strategic_core.strongest_success_signal",
      "product_system_seed.product_thesis",
      "product_system_seed.primary_loop",
      "product_system_seed.trust_boundary",
      "product_system_seed.anti_goals",
      "proto_readiness.prototype_direction_seeds",
      "proto_readiness.prompt_constraints",
      "proto_readiness.validation_target",
      "proto_readiness.status",
    ];
  }
  if (artifactType === "validation_target") {
    return [
      "core_question",
      "central_uncertainty",
      "target_behavior",
      "prototype_scope",
      "prototype_experiment.scenario",
      "prototype_experiment.must_show",
      "observable_signals.pass",
      "observable_signals.fail",
      "acceptance",
      "decision_rules.continue",
      "decision_rules.revise",
      "agent_readiness_gate.status",
    ];
  }
  if (artifactType === "prototype_evidence") {
    return [
      "core_question",
      "prompt_pack_type",
      "internal_pipeline.current_stage",
      "preflight_quality_gate.can_proceed",
      "direction_count_policy.resolved_count",
      "normalized_input.primary_user",
      "normalized_input.desired_behavior_change",
      "normalized_input.strongest_success_signal",
      "strategic_core.central_uncertainty",
      "prototype_brief.product_name",
      "prototype_brief.positioning",
      "prototype_brief.primary_loop",
      "product_experience_model.product_archetype",
      "product_experience_model.primary_canvas",
      "product_experience_model.domain_object_model",
      "product_experience_model.primary_task_loop",
      "product_experience_model.interaction_state_model",
      "product_experience_model.anti_generic_constraints",
      "screen_manifest",
      "global_design_system_prompt.visual_language",
      "global_design_system_prompt.layout_system",
      "global_design_system_prompt.negative_visual_patterns",
      "quality_rubric.prompt_executability",
      "quality_rubric.prompt_paragraph_quality",
      "quality_rubric.state_coverage",
      "prototype_reality_gate.status",
      "prototype_reality_gate.dimensions",
      "prompt_pack_integrity_gate.status",
      "prompt_pack_integrity_gate.dimensions",
      "directions",
      "build_recommendation.first_direction_id",
      "prompt_text_manifest.status",
      "prompt_text_manifest.paragraph_quality_status",
      "prompt_text_manifest.paragraph_quality_dimensions",
      "image_generation.status",
      "review_plan",
      "result",
    ];
  }
  if (artifactType === "decision_record") {
    return ["outcome", "rationale", "next_command"];
  }
  if (artifactType === "product_design") {
    return ["personas", "journey_map", "user_stories", "spec_readiness"];
  }
  if (artifactType === "production_spec") {
    return ["goal", "scope", "requirements", "verification", "change_readiness"];
  }
  if (artifactType === "production_change") {
    return ["problem", "goals", "affected_paths", "acceptance", "validation", "work_items", "runtime_readiness"];
  }
  if (artifactType === "team_runtime") {
    return ["active_work_item", "work_queue", "verification", "handoff"];
  }
  return [];
}

function readinessWarningsForArtifact(artifactPath: string, artifactType: string, source: Record<string, unknown>): string[] {
  if (artifactType === "vision_session") {
    const protoReadinessStatus = stringValue(valueAtPath(source, "proto_readiness.status"));
    if (protoReadinessStatus !== "ready") {
      return [`vision proto_readiness.status is not ready in ${artifactPath}: ${protoReadinessStatus || "missing"}`];
    }
    return [];
  }
  if (artifactType === "validation_target") {
    const readinessStatus = stringValue(valueAtPath(source, "agent_readiness_gate.status"));
    if (readinessStatus !== "ready_for_proto") {
      return [`validation agent_readiness_gate.status is not ready_for_proto in ${artifactPath}: ${readinessStatus || "missing"}`];
    }
  }
  return [];
}

async function findInstantiatedArtifacts(root: string, contract: SummaryArtifactContract): Promise<string[]> {
  const stageRoot = contract.sourceOfTruthPath.split("/<id>/", 1)[0];
  const fileName = basename(contract.sourceOfTruthPath);
  if (!stageRoot || fileName.includes("<")) {
    return [];
  }
  const absoluteStageRoot = join(root, stageRoot);
  if (!(await statOptional(absoluteStageRoot))) {
    return [];
  }
  const found = await findFilesNamed(absoluteStageRoot, fileName);
  return found.map((path) => relative(root, path)).sort();
}

async function findFilesNamed(root: string, fileName: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const found: string[] = [];
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith("_")) {
        continue;
      }
      found.push(...(await findFilesNamed(path, fileName)));
    } else if (entry.isFile() && entry.name === fileName) {
      found.push(path);
    }
  }
  return found;
}

interface PlanningQueueAudit {
  health_errors: string[];
  guidance: string[];
  next_actions: string[];
}

async function evaluatePlanningQueueCommitEvidence(root: string): Promise<PlanningQueueAudit> {
  const changesRoot = join(root, "changes");
  if (!(await statOptional(changesRoot))) {
    return { health_errors: [], guidance: [], next_actions: [] };
  }
  const queuePaths = await findFilesNamed(changesRoot, "CANDIDATE_CHANGES.yaml");
  const healthErrors: string[] = [];
  const guidance: string[] = [];
  for (const queuePath of queuePaths) {
    const queue = await readYamlRecord(queuePath);
    if (!queue || queue.planning_artifact_type !== "candidate_changes") {
      continue;
    }
    const queuePolicy = recordValue(queue.queue_policy);
    if (queuePolicy.selected_change_commit_gate !== "strict") {
      continue;
    }
    healthErrors.push(...(await strictQueueCommitEvidenceErrors(root, queuePath, queue)));
    guidance.push(...coderGateGuidance(root, queuePath, queue));
  }
  return {
    health_errors: unique(healthErrors),
    guidance: unique(guidance),
    next_actions: healthErrors.length > 0
      ? ["repair selected-change commit evidence before trusting handoff; run openworkflow git-automation commit for the affected candidate"]
      : [],
  };
}

function coderGateGuidance(root: string, queuePath: string, queue: Record<string, unknown>): string[] {
  const label = relative(root, queuePath);
  const changes = Array.isArray(queue.changes) ? queue.changes : [];
  const guidance: string[] = [];
  for (const candidate of changes) {
    if (!isRecord(candidate) || candidate.status !== "selected") {
      continue;
    }
    const candidateId = stringValue(candidate.id) ?? "<unknown>";
    if (!sourceEditLikely(stringList(candidate.owned_paths))) {
      continue;
    }
    guidance.push(`coder gate guidance ${label} ${candidateId}: source-edit candidate should bind coder gate status in LOCAL_COMMIT_EVIDENCE.yaml; guidance only, not a handoff blocker`);
  }
  return guidance;
}

function sourceEditLikely(ownedPaths: string[]): boolean {
  return ownedPaths.some((path) => {
    const normalized = path.replace(/^\.?\//, "");
    if (normalized.length === 0 || normalized.startsWith("changes/")) {
      return false;
    }
    return normalized.startsWith("packages/")
      || normalized.startsWith("skills/")
      || normalized.startsWith("references/")
      || normalized.startsWith("schemas/")
      || normalized.startsWith(".agents/")
      || normalized.startsWith(".openworkflow/audit/");
  });
}

async function strictQueueCommitEvidenceErrors(root: string, queuePath: string, queue: Record<string, unknown>): Promise<string[]> {
  const label = relative(root, queuePath);
  const changes = Array.isArray(queue.changes) ? queue.changes : [];
  const errors: string[] = [];
  for (const candidate of changes) {
    if (!isRecord(candidate) || candidate.status !== "done") {
      continue;
    }
    const selection = recordValue(candidate.selection);
    if (!stringValue(selection.selected_change_id)) {
      continue;
    }
    const candidateId = stringValue(candidate.id) ?? "<unknown>";
    const completion = recordValue(candidate.completion);
    if (completion.implementation_changed_files === false) {
      if (!stringValue(completion.commit_not_required_reason)) {
        errors.push(`selected-change commit evidence ${label} ${candidateId}: planning-only completion must include commit_not_required_reason`);
      }
      continue;
    }
    if (completion.implementation_changed_files !== true) {
      errors.push(`selected-change commit evidence ${label} ${candidateId}: strict completion must set implementation_changed_files true or false`);
      continue;
    }
    const evidencePath = localCommitEvidencePath(completion);
    if (!evidencePath) {
      errors.push(`selected-change commit evidence ${label} ${candidateId}: implementation completion must include LOCAL_COMMIT_EVIDENCE.yaml`);
      continue;
    }
    if (evidencePath.startsWith("/") || evidencePath.includes("://") || evidencePath.startsWith("..")) {
      errors.push(`selected-change commit evidence ${label} ${candidateId}: LOCAL_COMMIT_EVIDENCE.yaml must be repo-relative`);
      continue;
    }
    const absoluteEvidencePath = join(root, evidencePath);
    if (!(await statOptional(absoluteEvidencePath))) {
      errors.push(`selected-change commit evidence ${label} ${candidateId}: missing ${evidencePath}`);
    }
  }
  return errors;
}

function localCommitEvidencePath(completion: Record<string, unknown>): string | null {
  const direct = stringValue(completion.local_commit_evidence_path) ?? stringValue(completion.local_commit_evidence);
  if (direct?.endsWith("LOCAL_COMMIT_EVIDENCE.yaml")) {
    return direct;
  }
  const evidence = Array.isArray(completion.evidence) ? completion.evidence : [];
  for (const item of evidence) {
    if (typeof item === "string" && item.endsWith("LOCAL_COMMIT_EVIDENCE.yaml")) {
      return item;
    }
  }
  return null;
}

function summaryPathForArtifact(artifactPath: string, contract: SummaryArtifactContract): string {
  const policyPath = contract.summaryPolicy?.path;
  if (policyPath) {
    const artifactId = artifactIdForPath(artifactPath, contract.sourceOfTruthPath);
    if (artifactId) {
      return policyPath.replace("<id>", artifactId);
    }
    if (!policyPath.includes("<id>")) {
      return policyPath;
    }
  }
  return join(dirname(artifactPath), "SUMMARY.yaml");
}

function artifactIdForPath(artifactPath: string, sourceOfTruthPath: string): string | null {
  const marker = "<id>";
  if (!sourceOfTruthPath.includes(marker)) {
    return null;
  }
  const [prefix, suffix = ""] = sourceOfTruthPath.split(marker);
  if (!prefix || !artifactPath.startsWith(prefix) || !artifactPath.endsWith(suffix)) {
    return null;
  }
  const id = artifactPath.slice(prefix.length, artifactPath.length - suffix.length);
  return id.length > 0 && !id.includes("/") ? id : null;
}

function currentSliceFields(path: string): string[] {
  return path.split("+").map((part) => part.trim()).filter(Boolean);
}

async function readYamlRecord(path: string): Promise<Record<string, unknown> | null> {
  try {
    const value = parseYaml(await readTextFile(path));
    return isRecord(value) ? value : null;
  } catch {
    return null;
  }
}

async function statOptional(path: string): Promise<Awaited<ReturnType<typeof stat>> | null> {
  try {
    return await stat(path);
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }
}

function aggregateStatus(statuses: SummaryHealthStatus[]): SummaryHealthStatus {
  if (statuses.includes("missing")) {
    return "missing";
  }
  if (statuses.includes("stale_unknown")) {
    return "stale_unknown";
  }
  if (statuses.includes("present")) {
    return "present";
  }
  if (statuses.includes("current")) {
    return "current";
  }
  return "not_instantiated";
}

function countStatuses(entries: SummaryHealthEntry[]): Record<SummaryHealthStatus, number> {
  const counts = emptyCounts();
  for (const entry of entries) {
    counts[entry.status] += 1;
  }
  return counts;
}

function emptyCounts(): Record<SummaryHealthStatus, number> {
  return {
    not_applicable: 0,
    not_instantiated: 0,
    missing: 0,
    present: 0,
    stale_unknown: 0,
    current: 0,
  };
}

function nextActionsFor(status: SummaryHealthStatus, contract: SummaryArtifactContract): string[] {
  if (status === "missing" || status === "stale_unknown") {
    return [`refresh summary for ${contract.artifactType} before relying on low-context reads`];
  }
  return [];
}

function hasNonEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (isRecord(value)) {
    return Object.values(value).some((item) => hasNonEmptyValue(item));
  }
  return true;
}

function valueAtPath(source: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((current, part) => {
    if (!isRecord(current)) {
      return undefined;
    }
    return current[part];
  }, source);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function recordValue(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}
