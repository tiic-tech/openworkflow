import { mkdir, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { dumpYaml, parseYaml } from "../../../core/src/contracts/yaml.js";
import { isNotFound, readTextFile } from "../../../core/src/fs/index.js";
import { evaluateSummaryHealth } from "../../../core/src/workflow/summaryHealth.js";
import { booleanFlag, stringFlag } from "../args.js";
import { emptyEffects, printJsonReport, type CliEffects } from "../report.js";

interface SummaryContract {
  artifact_type: string;
  command: string;
  source_of_truth_path: string;
  summary_policy?: {
    strategy: "summary_file" | "current_slice";
    path: string;
  };
}

interface SummaryPlan {
  artifact_type: string;
  source_path: string;
  summary_path: string | null;
  action: "write" | "skip";
  reason: string;
  content: string | null;
}

interface SummarizeModel {
  write: boolean;
  mode: "artifact" | "all";
  plans: Omit<SummaryPlan, "content">[];
}

export async function summarizeCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const json = booleanFlag(flags, "json");
  const write = booleanFlag(flags, "write");
  const all = booleanFlag(flags, "all");
  const artifact = stringFlag(flags, "artifact");

  if ((all && artifact) || (!all && !artifact)) {
    return finishUsage(root, json);
  }

  const contracts = await loadContracts(root);
  if (!contracts) {
    return finishError(root, json, "missing OpenWorkflow artifact contracts: .openworkflow/audit/ARTIFACT_CONTRACTS.yaml", [
      "run openworkflow init <folder> --tools codex, or run openworkflow sync on an initialized project",
    ]);
  }

  let plans: SummaryPlan[];
  try {
    plans = all
      ? await plansForAll(root, contracts)
      : await plansForArtifact(root, contracts, artifact ?? "");
  } catch (error) {
    return finishError(root, json, error instanceof Error ? error.message : String(error), [
      "run openworkflow summaries --root . --json to inspect summary health",
    ]);
  }
  const effects = await applyPlans(root, plans, write);
  const model: SummarizeModel = {
    write,
    mode: all ? "all" : "artifact",
    plans: plans.map(({ content: _content, ...plan }) => plan),
  };
  const warnings = plans.filter((plan) => plan.action === "skip").map((plan) => `${plan.source_path}: ${plan.reason}`);
  if (json) {
    printJsonReport({
      command: "summarize",
      ok: true,
      root,
      data: model,
      warnings,
      errors: [],
      effects,
      next_actions: write ? ["run openworkflow summaries --root . --json"] : ["rerun with --write to apply planned summary refreshes"],
    });
  } else {
    printSummarize(model, effects);
  }
  return 0;
}

async function loadContracts(root: string): Promise<SummaryContract[] | null> {
  try {
    const parsed = parseYaml(await readTextFile(join(root, ".openworkflow", "audit", "ARTIFACT_CONTRACTS.yaml")));
    if (!isRecord(parsed) || !Array.isArray(parsed.artifacts)) {
      return [];
    }
    return parsed.artifacts.flatMap((artifact) => {
      if (!isRecord(artifact)) {
        return [];
      }
      const artifactType = stringValue(artifact.artifact_type);
      const command = stringValue(artifact.command);
      const sourcePath = stringValue(artifact.source_of_truth_path);
      if (!artifactType || !command || !sourcePath) {
        return [];
      }
      return [{
        artifact_type: artifactType,
        command,
        source_of_truth_path: sourcePath,
        summary_policy: summaryPolicy(artifact.summary_policy),
      }];
    });
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }
}

async function plansForAll(root: string, contracts: SummaryContract[]): Promise<SummaryPlan[]> {
  const health = await evaluateSummaryHealth(root);
  const plans: SummaryPlan[] = [];
  for (const entry of health.entries) {
    const contract = contracts.find((item) => item.artifact_type === entry.artifact_type);
    if (!contract || contract.summary_policy?.strategy !== "summary_file") {
      continue;
    }
    for (const item of entry.items) {
      if (item.status === "missing" || item.status === "stale_unknown") {
        plans.push(await buildWritePlan(root, contract, item.artifact_path, item.summary_path ?? summaryPathFor(item.artifact_path, contract), item.status));
      } else {
        plans.push(skipPlan(contract, item.artifact_path, item.summary_path, `summary is ${item.status}`));
      }
    }
  }
  return plans;
}

async function plansForArtifact(root: string, contracts: SummaryContract[], artifactPathInput: string): Promise<SummaryPlan[]> {
  const artifactPath = normalizeRelativePath(root, artifactPathInput);
  const contract = contracts.find((item) => artifactMatchesContract(artifactPath, item));
  if (!contract) {
    throw new Error(`no summary contract found for artifact: ${artifactPathInput}`);
  }
  const absoluteArtifact = join(root, artifactPath);
  if (!(await exists(absoluteArtifact))) {
    throw new Error(`artifact does not exist: ${artifactPath}`);
  }
  if (!contract.summary_policy) {
    return [skipPlan(contract, artifactPath, null, "artifact has no summary_policy")];
  }
  if (contract.summary_policy.strategy === "current_slice") {
    return [skipPlan(contract, artifactPath, null, "artifact uses current_slice; update the source artifact fields instead of writing SUMMARY.yaml")];
  }
  return [await buildWritePlan(root, contract, artifactPath, summaryPathFor(artifactPath, contract), "requested")];
}

async function buildWritePlan(
  root: string,
  contract: SummaryContract,
  artifactPath: string,
  summaryPath: string,
  reason: string,
): Promise<SummaryPlan> {
  const parsed = parseYaml(await readTextFile(join(root, artifactPath)));
  const source = isRecord(parsed) ? parsed : {};
  return {
    artifact_type: contract.artifact_type,
    source_path: artifactPath,
    summary_path: summaryPath,
    action: "write",
    reason,
    content: renderSummary(contract, artifactPath, summaryPath, source),
  };
}

function renderSummary(
  contract: SummaryContract,
  artifactPath: string,
  summaryPath: string,
  source: Record<string, unknown>,
): string {
  return dumpYaml({
    schema_version: "0.1.0",
    contract_id: `summary:${contract.artifact_type}:${artifactIdForPath(artifactPath, contract.source_of_truth_path) ?? basename(dirname(summaryPath))}`,
    contract_type: "summary",
    artifact_type: "artifact_summary",
    source_artifact_type: contract.artifact_type,
    source_path: artifactPath,
    source_command: contract.command,
    source_status: stringValue(source.status),
    title: stringValue(source.title) ?? `${contract.artifact_type} summary`,
    summary: {
      generated_by: "openworkflow summarize",
      strategy: "extractive",
      key_fields: keyFields(source),
      handoff: isRecord(source.handoff) ? source.handoff : null,
    },
  });
}

function keyFields(source: Record<string, unknown>): Record<string, unknown> {
  const preferred = [
    "core_question",
    "prompt_pack_type",
    "validation_input",
    "build_recommendation",
    "review_plan",
    "prototype_scope",
    "acceptance",
    "result",
    "outcome",
    "rationale",
    "scope",
    "change_readiness",
    "runtime_readiness",
    "spec_readiness",
    "open_questions",
    "known_limits",
  ];
  const keys = preferred.filter((key) => key in source).slice(0, 10);
  return Object.fromEntries(keys.map((key) => [key, compactValue(source[key])]));
}

function compactValue(value: unknown): unknown {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 6).map((item) => compactValue(item));
  }
  if (isRecord(value)) {
    return Object.fromEntries(Object.entries(value).slice(0, 8).map(([key, item]) => [key, compactValue(item)]));
  }
  return String(value);
}

async function applyPlans(root: string, plans: SummaryPlan[], write: boolean): Promise<CliEffects> {
  const effects = emptyEffects();
  for (const plan of plans) {
    if (plan.action === "skip" || !plan.summary_path || !plan.content) {
      effects.skipped.push(`${plan.source_path} (${plan.reason})`);
      continue;
    }
    const absoluteSummaryPath = join(root, plan.summary_path);
    if (!write) {
      effects.planned.push(plan.summary_path);
      continue;
    }
    await mkdir(dirname(absoluteSummaryPath), { recursive: true });
    await writeFile(absoluteSummaryPath, plan.content, "utf8");
    effects.written.push(plan.summary_path);
  }
  return effects;
}

function skipPlan(contract: SummaryContract, artifactPath: string, summaryPath: string | null, reason: string): SummaryPlan {
  return {
    artifact_type: contract.artifact_type,
    source_path: artifactPath,
    summary_path: summaryPath,
    action: "skip",
    reason,
    content: null,
  };
}

function summaryPathFor(artifactPath: string, contract: SummaryContract): string {
  const policyPath = contract.summary_policy?.path;
  const artifactId = artifactIdForPath(artifactPath, contract.source_of_truth_path);
  if (policyPath && artifactId) {
    return policyPath.replace("<id>", artifactId);
  }
  return join(dirname(artifactPath), "SUMMARY.yaml");
}

function artifactMatchesContract(artifactPath: string, contract: SummaryContract): boolean {
  const marker = "<id>";
  if (!contract.source_of_truth_path.includes(marker)) {
    return artifactPath === contract.source_of_truth_path;
  }
  const [prefix, suffix = ""] = contract.source_of_truth_path.split(marker);
  return Boolean(prefix && artifactPath.startsWith(prefix) && artifactPath.endsWith(suffix));
}

function artifactIdForPath(artifactPath: string, sourcePath: string): string | null {
  if (!sourcePath.includes("<id>")) {
    return null;
  }
  const [prefix, suffix = ""] = sourcePath.split("<id>");
  if (!prefix || !artifactPath.startsWith(prefix) || !artifactPath.endsWith(suffix)) {
    return null;
  }
  const id = artifactPath.slice(prefix.length, artifactPath.length - suffix.length);
  return id.length > 0 && !id.includes("/") ? id : null;
}

function normalizeRelativePath(root: string, path: string): string {
  const absolute = resolve(root, path);
  const relativePath = relative(root, absolute);
  if (relativePath.startsWith("..")) {
    throw new Error(`artifact path is outside root: ${path}`);
  }
  return relativePath;
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

function summaryPolicy(value: unknown): SummaryContract["summary_policy"] {
  if (!isRecord(value)) {
    return undefined;
  }
  const strategy = stringValue(value.strategy);
  const path = stringValue(value.path);
  if ((strategy !== "summary_file" && strategy !== "current_slice") || !path) {
    return undefined;
  }
  return { strategy, path };
}

function printSummarize(model: SummarizeModel, effects: CliEffects): void {
  console.log("OpenWorkflow summarize");
  console.log(`mode: ${model.mode}`);
  console.log(`write: ${model.write}`);
  for (const plan of model.plans) {
    console.log(`${plan.action}: ${plan.source_path} -> ${plan.summary_path ?? "none"} (${plan.reason})`);
  }
  console.log(`planned: ${effects.planned.length}, written: ${effects.written.length}, skipped: ${effects.skipped.length}`);
}

function finishUsage(root: string, json: boolean): number {
  return finishError(root, json, "choose exactly one of --artifact <path> or --all", [
    "run openworkflow summarize --root . --all --json",
  ]);
}

function finishError(root: string, json: boolean, error: string, nextActions: string[]): number {
  if (json) {
    printJsonReport({
      command: "summarize",
      ok: false,
      root,
      data: { ok: false },
      warnings: [],
      errors: [error],
      effects: emptyEffects(),
      next_actions: nextActions,
    });
  } else {
    console.error(error);
  }
  return 1;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}
