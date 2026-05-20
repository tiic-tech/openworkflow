import { readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { getDiscoveryArtifactContractsForCommand } from "../../../core/src/artifacts/registry.js";
import { assessStageReadiness } from "../../../core/src/artifacts/readiness.js";
import { getWorkflowCommands, type WorkflowCommand } from "../../../core/src/commands/registry.js";
import { parseYaml } from "../../../core/src/contracts/yaml.js";
import { isNotFound, readTextFile } from "../../../core/src/fs/index.js";
import { evaluateSummaryHealth, type SummaryHealthEntry } from "../../../core/src/workflow/summaryHealth.js";
import { booleanFlag, stringFlag } from "../args.js";
import { emptyEffects, printJsonReport } from "../report.js";

export interface ReadinessModel {
  command: string | null;
  normalized_command: string | null;
  ready: boolean;
  blockers: string[];
  warnings: string[];
  required_context: ContextStatus[];
  optional_context: ContextStatus[];
  forbidden_context: ContextStatus[];
  conditional_context: string[];
  allowed_outputs: string[];
  forbidden_outputs: string[];
  handoff_commands: string[];
  artifact_contracts: ArtifactSummary[];
  summary_guidance: SummaryGuidance[];
  read_this_first: string[];
  active_pointers: Record<string, string | null>;
  next_actions: string[];
}

export interface ContextStatus {
  path: string;
  exists: boolean;
}

export interface ArtifactSummary {
  artifact_type: string;
  source_of_truth_path: string;
  summary_policy: string | null;
}

export interface SummaryGuidance {
  artifact_type: string;
  status: string;
  next_actions: string[];
}

export async function checkCommand(positional: string[], flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const json = booleanFlag(flags, "json");
  const requested = positional[0];
  if (!requested) {
    const data = missingCommandModel();
    return finish(root, json, data, "Missing command argument.", ["run openworkflow check /ow:vision --root ."]);
  }

  const model = await buildReadiness(root, requested);
  const ok = model.ready;
  const exitCode = model.blockers.length > 0 ? 1 : 0;
  if (json) {
    printJsonReport({
      command: "check",
      ok,
      root,
      data: model,
      warnings: model.warnings,
      errors: model.blockers,
      effects: emptyEffects(),
      next_actions: model.next_actions,
    });
  } else {
    printReadiness(model);
  }
  return exitCode;
}

async function finish(root: string, json: boolean, data: ReadinessModel, error: string, nextActions: string[]): Promise<number> {
  if (json) {
    printJsonReport({
      command: "check",
      ok: false,
      root,
      data,
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

export async function buildReadiness(root: string, requested: string): Promise<ReadinessModel> {
  const normalized = normalizeCommand(requested);
  const command = findCommand(normalized);
  const currentState = await readCurrentState(root);
  if (!command) {
    return {
      ...baseModel(requested, normalized, currentState),
      blockers: [`unknown workflow command: ${requested}`],
      next_actions: ["run openworkflow --help to inspect supported workflow commands"],
    };
  }

  const protocol = command.protocol;
  const summaryHealth = await evaluateSummaryHealth(root);
  const required = await contextStatuses(root, protocol?.requiredContext ?? [".openworkflow/workflow/WORKFLOW_INDEX.yaml"]);
  const optional = await contextStatuses(root, protocol?.optionalContext ?? []);
  const forbidden = await contextStatuses(root, protocol?.forbiddenContext ?? []);
  const semanticReadiness = await assessStageReadiness(root, command.trigger, currentState);
  const blockers = [
    ...required.filter((item) => !item.exists).map((item) => `missing required context: ${item.path}`),
    ...forbidden.filter((item) => item.exists).map((item) => `forbidden context exists: ${item.path}`),
    ...semanticReadiness.blockers,
  ];
  const warnings: string[] = [];
  const nextCommand = stringOrNull(currentState?.next_command);
  if (nextCommand && nextCommand !== command.trigger) {
    warnings.push(`CURRENT_STATE next_command is ${nextCommand}, not ${command.trigger}`);
  }
  if (command.visibility === "internal") {
    warnings.push(`${command.trigger} is an internal command and is not a normal user-facing step`);
  }
  const summaryGuidance = summaryGuidanceFor(command.trigger, summaryHealth.entries);
  warnings.push(...summaryWarnings(summaryGuidance));
  if (!summaryHealth.initialized) {
    warnings.push("summary health unavailable because OpenWorkflow artifact contracts are missing");
  }
  warnings.push(...semanticReadiness.warnings);

  const nextActions = nextActionsFor(command, blockers, warnings, currentState);
  return {
    ...baseModel(requested, command.trigger, currentState),
    ready: blockers.length === 0,
    blockers,
    warnings,
    required_context: required,
    optional_context: optional,
    forbidden_context: forbidden,
    conditional_context: protocol?.conditionalOutputs ?? [],
    allowed_outputs: protocol?.allowedOutputs ?? command.targetArtifacts,
    forbidden_outputs: protocol?.forbiddenOutputs ?? [],
    handoff_commands: protocol?.handoffCommands ?? [],
    artifact_contracts: getDiscoveryArtifactContractsForCommand(command.trigger).map((artifact) => ({
      artifact_type: artifact.artifactType,
      source_of_truth_path: artifact.sourceOfTruthPath,
      summary_policy: artifact.summaryPolicy?.strategy ?? null,
    })),
    summary_guidance: summaryGuidance,
    next_actions: nextActions,
  };
}

function printReadiness(model: ReadinessModel): void {
  console.log(`OpenWorkflow command check: ${model.normalized_command ?? model.command ?? "unknown"}`);
  console.log(`ready: ${model.ready}`);
  printList("blockers", model.blockers);
  printList("warnings", model.warnings);
  printContext("required_context", model.required_context);
  printContext("forbidden_context", model.forbidden_context);
  printList("allowed_outputs", model.allowed_outputs);
  printList("forbidden_outputs", model.forbidden_outputs);
  printList("handoff_commands", model.handoff_commands);
  printList("summary_guidance", model.summary_guidance.map((item) => `${item.artifact_type}: ${item.status}`));
  printList("read_this_first", model.read_this_first);
  printList("next_actions", model.next_actions);
}

function printList(label: string, values: string[]): void {
  console.log(`${label}:`);
  for (const value of values.length > 0 ? values : ["none"]) {
    console.log(`  - ${value}`);
  }
}

function printContext(label: string, values: ContextStatus[]): void {
  console.log(`${label}:`);
  for (const value of values.length > 0 ? values : [{ path: "none", exists: false }]) {
    console.log(`  - ${value.path} (${value.exists ? "exists" : "missing"})`);
  }
}

function missingCommandModel(): ReadinessModel {
  return {
    command: null,
    normalized_command: null,
    ready: false,
    blockers: ["missing command argument"],
    warnings: [],
    required_context: [],
    optional_context: [],
    forbidden_context: [],
    conditional_context: [],
    allowed_outputs: [],
    forbidden_outputs: [],
    handoff_commands: [],
    artifact_contracts: [],
    summary_guidance: [],
    read_this_first: [],
    active_pointers: {},
    next_actions: ["run openworkflow check /ow:vision --root ."],
  };
}

function baseModel(requested: string, normalized: string, currentState: Record<string, unknown> | null): ReadinessModel {
  return {
    command: requested,
    normalized_command: normalized,
    ready: false,
    blockers: [],
    warnings: [],
    required_context: [],
    optional_context: [],
    forbidden_context: [],
    conditional_context: [],
    allowed_outputs: [],
    forbidden_outputs: [],
    handoff_commands: [],
    artifact_contracts: [],
    summary_guidance: [],
    read_this_first: stringList(currentState?.read_this_first),
    active_pointers: activePointers(currentState),
    next_actions: [],
  };
}

function summaryGuidanceFor(command: string, entries: SummaryHealthEntry[]): SummaryGuidance[] {
  const artifactTypes = new Set<string>(getDiscoveryArtifactContractsForCommand(command).map((artifact) => artifact.artifactType));
  return entries
    .filter((entry) => artifactTypes.has(entry.artifact_type) && entry.strategy !== "none")
    .map((entry) => ({
      artifact_type: entry.artifact_type,
      status: entry.status,
      next_actions: entry.next_actions,
    }));
}

function summaryWarnings(guidance: SummaryGuidance[]): string[] {
  return guidance
    .filter((entry) => entry.status === "missing" || entry.status === "stale_unknown")
    .map((entry) => `summary health for ${entry.artifact_type} is ${entry.status}; inspect summaries before relying on low-context reads`);
}

function nextActionsFor(
  command: WorkflowCommand,
  blockers: string[],
  warnings: string[],
  currentState: Record<string, unknown> | null,
): string[] {
  if (blockers.length > 0) {
    return ["resolve blockers before starting the workflow command"];
  }
  const nextCommand = stringOrNull(currentState?.next_command);
  if (nextCommand && nextCommand !== command.trigger && warnings.length > 0) {
    return [`consider running ${nextCommand} first, or confirm why ${command.trigger} is appropriate now`];
  }
  return [`start ${command.trigger} using the repo-local Agent skill`];
}

async function contextStatuses(root: string, paths: string[]): Promise<ContextStatus[]> {
  return Promise.all(paths.map(async (path) => ({ path, exists: await contextExists(root, path) })));
}

async function contextExists(root: string, pattern: string): Promise<boolean> {
  const clean = pattern.replace(/<[^>]+>/gu, "");
  if (clean.includes("**")) {
    return existsPrefix(root, clean.split("**", 1)[0] ?? clean);
  }
  if (clean.endsWith("/")) {
    return existsPath(root, clean);
  }
  return existsPath(root, clean);
}

async function existsPrefix(root: string, prefix: string): Promise<boolean> {
  const path = join(root, prefix);
  try {
    const info = await stat(path);
    if (info.isFile()) {
      return true;
    }
    if (info.isDirectory()) {
      const entries = await readdir(path);
      return entries.length > 0;
    }
    return false;
  } catch (error) {
    if (isNotFound(error)) {
      return false;
    }
    throw error;
  }
}

async function existsPath(root: string, relativePath: string): Promise<boolean> {
  try {
    await stat(join(root, relativePath));
    return true;
  } catch (error) {
    if (isNotFound(error)) {
      return false;
    }
    throw error;
  }
}

async function readCurrentState(root: string): Promise<Record<string, unknown> | null> {
  try {
    const data = parseYaml(await readTextFile(join(root, ".openworkflow", "CURRENT_STATE.yaml")));
    return isRecord(data) ? data : null;
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }
}

function normalizeCommand(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("/ow:")) {
    return trimmed;
  }
  if (trimmed.startsWith("ow:")) {
    return `/${trimmed}`;
  }
  if (trimmed.startsWith("ow-")) {
    return `/ow:${trimmed.slice("ow-".length)}`;
  }
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  return `/ow:${trimmed}`;
}

function findCommand(normalized: string): WorkflowCommand | undefined {
  return getWorkflowCommands().find((command) =>
    command.trigger === normalized || command.legacyTriggers.includes(normalized),
  );
}

function activePointers(currentState: Record<string, unknown> | null): Record<string, string | null> {
  const keys = [
    "current_vision",
    "current_validation",
    "current_prototype",
    "current_decision",
    "current_design",
    "current_spec",
    "current_change",
    "current_run",
  ];
  return Object.fromEntries(keys.map((key) => [key, stringOrNull(currentState?.[key])]));
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
