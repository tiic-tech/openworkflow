import { readdir, stat } from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
import { getDiscoveryArtifactContracts, type DiscoveryArtifactContract } from "../artifacts/registry.js";
import { parseYaml } from "../contracts/yaml.js";
import { isNotFound, readTextFile } from "../fs/index.js";

export type SummaryHealthStatus = "not_applicable" | "not_instantiated" | "missing" | "present" | "stale_unknown" | "current";

export interface SummaryHealthItem {
  artifact_path: string;
  summary_path: string | null;
  current_slice: string[] | null;
  status: SummaryHealthStatus;
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
  counts: Record<SummaryHealthStatus, number>;
  entries: SummaryHealthEntry[];
  warnings: string[];
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
  const contracts = await loadArtifactContracts(root);
  const entries = await Promise.all(contracts.map((contract) => evaluateContract(root, contract)));
  const warnings = entries.flatMap((entry) => entry.warnings);
  const nextActions = [...new Set(entries.flatMap((entry) => entry.next_actions))];
  return {
    ok: !entries.some((entry) => ["missing", "stale_unknown"].includes(entry.status)),
    counts: countStatuses(entries),
    entries,
    warnings,
    next_actions: nextActions,
  };
}

async function loadArtifactContracts(root: string): Promise<SummaryArtifactContract[]> {
  const contractsPath = join(root, ".openworkflow", "audit", "ARTIFACT_CONTRACTS.yaml");
  try {
    const parsed = parseYaml(await readTextFile(contractsPath));
    if (isRecord(parsed) && Array.isArray(parsed.artifacts)) {
      return parsed.artifacts.flatMap((artifact) => {
        const mapped = artifactContractFromRecord(artifact);
        return mapped ? [mapped] : [];
      });
    }
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
  }
  return getDiscoveryArtifactContracts().map(artifactContractFromRegistry);
}

function artifactContractFromRegistry(contract: DiscoveryArtifactContract): SummaryArtifactContract {
  return {
    artifactType: contract.artifactType,
    command: contract.command,
    sourceOfTruthPath: contract.sourceOfTruthPath,
    summaryPolicy: contract.summaryPolicy,
  };
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
      warnings: [],
    };
  }

  if (contract.summaryPolicy.strategy === "current_slice") {
    const fields = currentSliceFields(contract.summaryPolicy.path);
    const content = await readYamlRecord(join(root, artifactPath));
    const missing = fields.filter((field) => !hasNonEmptyValue(content?.[field]));
    return {
      artifact_path: artifactPath,
      summary_path: null,
      current_slice: fields,
      status: missing.length === 0 ? "current" : "missing",
      warnings: missing.map((field) => `missing current_slice field ${field} in ${artifactPath}`),
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
      warnings: [`missing summary file: ${summaryPath}`],
    };
  }
  const current = summaryStat.mtimeMs >= artifactStat.mtimeMs;
  return {
    artifact_path: artifactPath,
    summary_path: summaryPath,
    current_slice: null,
    status: current ? "current" : "stale_unknown",
    warnings: current ? [] : [`summary may be stale: ${summaryPath}`],
  };
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
  return {
    not_applicable: entries.filter((entry) => entry.status === "not_applicable").length,
    not_instantiated: entries.filter((entry) => entry.status === "not_instantiated").length,
    missing: entries.filter((entry) => entry.status === "missing").length,
    present: entries.filter((entry) => entry.status === "present").length,
    stale_unknown: entries.filter((entry) => entry.status === "stale_unknown").length,
    current: entries.filter((entry) => entry.status === "current").length,
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}
