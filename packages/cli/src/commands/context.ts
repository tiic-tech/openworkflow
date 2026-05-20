import { stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parseYaml } from "../../../core/src/contracts/yaml.js";
import { isNotFound, readTextFile } from "../../../core/src/fs/index.js";
import { type SummaryHealthEntry } from "../../../core/src/workflow/summaryHealth.js";
import { booleanFlag, stringFlag } from "../args.js";
import { emptyEffects, printJsonReport } from "../report.js";
import { buildBriefModel } from "./brief.js";
import { buildReadiness, type ContextStatus, type ReadinessModel } from "./check.js";
import { buildInspectModel, type InspectModel } from "./inspect.js";
import { parseTools } from "./shared.js";

const DEFAULT_MAX_BYTES = 24000;
const DEFAULT_MAX_ITEM_BYTES = 6000;

interface ContextPacketFile {
  path: string;
  source: "workflow" | "required_context" | "optional_context" | "summary_file" | "current_slice";
  reason: string;
  bytes: number;
  truncated: boolean;
  content: string;
}

interface ContextOmission {
  path: string;
  reason: string;
}

interface ContextPacketMetadata {
  packet_id: string;
  command: string;
  visibility: string | null;
  required: string[];
  optional: string[];
  forbidden: string[];
  audit_checkpoints: unknown;
}

interface ContextBudget {
  max_bytes: number;
  max_item_bytes: number;
  used_bytes: number;
  remaining_bytes: number;
}

interface ContextModel {
  command: string | null;
  normalized_command: string | null;
  packet_id: string | null;
  budget: ContextBudget;
  readiness: ReadinessModel;
  inspect: InspectModel;
  context_packet: ContextPacketMetadata | null;
  included: ContextPacketFile[];
  missing: ContextStatus[];
  omitted: ContextOmission[];
  truncated: ContextOmission[];
  summary_guidance: ReadinessModel["summary_guidance"];
  recommended_next_actions: string[];
}

interface LoadedPacket {
  packetsPath: string;
  packets: unknown[];
}

interface BudgetState {
  maxBytes: number;
  maxItemBytes: number;
  usedBytes: number;
}

interface AddContentInput {
  path: string;
  source: ContextPacketFile["source"];
  reason: string;
  content: string;
}

export async function contextCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const json = booleanFlag(flags, "json");
  const maxBytes = parseMaxBytes(stringFlag(flags, "max-bytes"));
  if (maxBytes === null) {
    return finishError(root, json, "invalid --max-bytes; expected a positive integer", ["rerun with --max-bytes 24000"]);
  }

  const loaded = await loadContextPacketMetadata(root);
  if (!loaded) {
    return finishError(root, json, "missing OpenWorkflow context packets: .openworkflow/audit/CONTEXT_PACKETS.yaml", [
      "run openworkflow init <folder> --tools codex, or run openworkflow sync on an initialized project",
    ]);
  }

  const brief = await buildBriefModel(root, parseTools(stringFlag(flags, "tools")));
  const requested = stringFlag(flags, "for") ?? brief.workflow.next_command;
  if (!requested) {
    return finishError(root, json, "no command provided and CURRENT_STATE.next_command is empty", [
      "run openworkflow context --root . --for /ow:vision --json",
    ]);
  }

  const readiness = await buildReadiness(root, requested);
  const inspect = buildInspectModel(brief, readiness);
  const packet = findPacket(loaded, readiness.normalized_command ?? requested);
  const model = await buildContextModel(root, maxBytes, readiness, inspect, packet);
  const packetErrors = packet ? [] : [`missing context packet for command: ${readiness.normalized_command ?? requested}`];
  const warnings = unique([
    ...readiness.warnings,
    ...inspect.summaries.warnings,
    ...model.omitted.filter((item) => item.reason.includes("summary")).map((item) => `${item.path}: ${item.reason}`),
  ]);
  const errors = unique([...readiness.blockers, ...packetErrors]);
  const ok = packet !== null && readiness.ready && errors.length === 0;

  if (json) {
    printJsonReport({
      command: "context",
      ok,
      root,
      data: model,
      warnings,
      errors,
      effects: emptyEffects(),
      next_actions: model.recommended_next_actions,
    });
  } else {
    printContext(model, ok);
  }
  return packet === null || errors.length > 0 ? 1 : 0;
}

async function buildContextModel(
  root: string,
  maxBytes: number,
  readiness: ReadinessModel,
  inspect: InspectModel,
  contextPacket: ContextPacketMetadata | null,
): Promise<ContextModel> {
  const budget: BudgetState = {
    maxBytes,
    maxItemBytes: Math.min(DEFAULT_MAX_ITEM_BYTES, maxBytes),
    usedBytes: 0,
  };
  const included: ContextPacketFile[] = [];
  const omitted: ContextOmission[] = [];
  const truncated: ContextOmission[] = [];
  const seen = new Set<string>();
  const summaryEntries = inspect.summaries.entries;

  const missing = uniqueContextStatuses([
    ...readiness.required_context.filter((item) => !item.exists),
    ...readiness.optional_context.filter((item) => !item.exists && !isPattern(item.path)),
  ]);

  for (const forbidden of readiness.forbidden_context) {
    omitted.push({ path: forbidden.path, reason: forbidden.exists ? "forbidden context for this command" : "forbidden context omitted by command boundary" });
  }

  const startupPaths = unique([
    "AGENTS.md",
    ".openworkflow/CURRENT_STATE.yaml",
    ".openworkflow/audit/CONTEXT_PACKETS.yaml",
  ]);
  for (const path of startupPaths) {
    await includePath(root, path, "workflow", "startup workflow context", budget, included, omitted, truncated, seen);
  }

  for (const item of readiness.required_context.concat(readiness.optional_context).filter((entry) => entry.exists && isPattern(entry.path))) {
    await includeContextPath(root, item.path, "summary_file", "summary/current_slice context for command pattern", summaryEntries, budget, included, omitted, truncated, seen);
  }

  for (const path of unique([...inspect.read_order.must_read, ...(contextPacket?.required ?? [])])) {
    await includePath(root, path, "workflow", "startup workflow context", budget, included, omitted, truncated, seen);
  }

  for (const item of readiness.required_context.filter((entry) => entry.exists && !isPattern(entry.path))) {
    await includeContextPath(root, item.path, "required_context", "required command context", summaryEntries, budget, included, omitted, truncated, seen);
  }
  for (const item of readiness.optional_context.filter((entry) => entry.exists && !isPattern(entry.path))) {
    await includeContextPath(root, item.path, "optional_context", "optional command context", summaryEntries, budget, included, omitted, truncated, seen);
  }

  return {
    command: readiness.command,
    normalized_command: readiness.normalized_command,
    packet_id: contextPacket?.packet_id ?? null,
    budget: budgetModel(budget),
    readiness,
    inspect,
    context_packet: contextPacket,
    included,
    missing,
    omitted: uniqueOmissions(omitted),
    truncated: uniqueOmissions(truncated),
    summary_guidance: readiness.summary_guidance,
    recommended_next_actions: unique([
      ...inspect.recommended_next_actions,
      ...readiness.next_actions,
      ...(inspect.summaries.ok ? [] : inspect.summaries.next_actions),
    ]),
  };
}

async function includeContextPath(
  root: string,
  path: string,
  source: ContextPacketFile["source"],
  reason: string,
  summaryEntries: SummaryHealthEntry[],
  budget: BudgetState,
  included: ContextPacketFile[],
  omitted: ContextOmission[],
  truncated: ContextOmission[],
  seen: Set<string>,
): Promise<void> {
  if (isRawEvidencePath(path)) {
    omitted.push({ path, reason: "raw evidence or review asset omitted by default" });
    return;
  }
  if (isPattern(path)) {
    const matched = summaryEntries.flatMap((entry) => entry.items.map((item) => ({ entry, item })))
      .filter(({ item }) => matchesPattern(item.artifact_path, path));
    if (matched.length === 0) {
      omitted.push({ path, reason: "pattern context not materialized; no matching summary/current_slice artifact found" });
      return;
    }
    for (const match of matched) {
      await includeSummaryOrSlice(root, match.entry, match.item, budget, included, omitted, truncated, seen);
    }
    return;
  }
  await includePath(root, path, source, reason, budget, included, omitted, truncated, seen);
}

async function includeSummaryOrSlice(
  root: string,
  entry: SummaryHealthEntry,
  item: SummaryHealthEntry["items"][number],
  budget: BudgetState,
  included: ContextPacketFile[],
  omitted: ContextOmission[],
  truncated: ContextOmission[],
  seen: Set<string>,
): Promise<void> {
  if (entry.strategy === "summary_file") {
    if (item.status !== "current" || !item.summary_path) {
      omitted.push({
        path: item.summary_path ?? item.artifact_path,
        reason: `summary_file is ${item.status}; run openworkflow summarize before relying on low-context content`,
      });
      return;
    }
    await includePath(root, item.summary_path, "summary_file", `trusted summary for ${item.artifact_path}`, budget, included, omitted, truncated, seen);
    return;
  }
  if (entry.strategy === "current_slice") {
    if (item.status !== "current" || !item.current_slice) {
      omitted.push({
        path: item.artifact_path,
        reason: `current_slice is ${item.status}; update source artifact fields before relying on low-context content`,
      });
      return;
    }
    const content = await currentSliceContent(root, item.artifact_path, item.current_slice);
    addContent({ path: item.artifact_path, source: "current_slice", reason: `current_slice for ${entry.artifact_type}`, content }, budget, included, omitted, truncated, seen);
  }
}

async function includePath(
  root: string,
  path: string,
  source: ContextPacketFile["source"],
  reason: string,
  budget: BudgetState,
  included: ContextPacketFile[],
  omitted: ContextOmission[],
  truncated: ContextOmission[],
  seen: Set<string>,
): Promise<void> {
  if (seen.has(path) || isPattern(path)) {
    return;
  }
  if (isRawEvidencePath(path)) {
    omitted.push({ path, reason: "raw evidence or review asset omitted by default" });
    return;
  }
  try {
    const info = await stat(join(root, path));
    if (!info.isFile()) {
      omitted.push({ path, reason: "not a file" });
      return;
    }
    const content = await readTextFile(join(root, path));
    addContent({ path, source, reason, content }, budget, included, omitted, truncated, seen);
  } catch (error) {
    if (isNotFound(error)) {
      return;
    }
    throw error;
  }
}

function addContent(
  input: AddContentInput,
  budget: BudgetState,
  included: ContextPacketFile[],
  omitted: ContextOmission[],
  truncated: ContextOmission[],
  seen: Set<string>,
): void {
  if (seen.has(input.path)) {
    return;
  }
  const remaining = budget.maxBytes - budget.usedBytes;
  if (remaining <= 0) {
    omitted.push({ path: input.path, reason: "context budget exhausted" });
    return;
  }
  const limit = Math.min(remaining, budget.maxItemBytes);
  const measured = byteLength(input.content);
  const truncatedContent = measured > limit ? truncateWithMarker(input.content, limit) : input.content;
  const bytes = byteLength(truncatedContent);
  budget.usedBytes += bytes;
  seen.add(input.path);
  if (measured > limit) {
    truncated.push({ path: input.path, reason: `truncated from ${measured} bytes to ${bytes} bytes` });
  }
  included.push({
    path: input.path,
    source: input.source,
    reason: input.reason,
    bytes,
    truncated: measured > limit,
    content: truncatedContent,
  });
}

async function currentSliceContent(root: string, artifactPath: string, fields: string[]): Promise<string> {
  const parsed = parseYaml(await readTextFile(join(root, artifactPath)));
  const source = isRecord(parsed) ? parsed : {};
  return fields.map((field) => `${field}: ${JSON.stringify(source[field] ?? null)}`).join("\n");
}

async function loadContextPacketMetadata(root: string): Promise<LoadedPacket | null> {
  const packetsPath = ".openworkflow/audit/CONTEXT_PACKETS.yaml";
  try {
    const parsed = parseYaml(await readTextFile(join(root, packetsPath)));
    if (!isRecord(parsed) || !Array.isArray(parsed.packets)) {
      return { packetsPath, packets: [] };
    }
    return { packetsPath, packets: parsed.packets };
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }
}

function findPacket(loaded: LoadedPacket, command: string): ContextPacketMetadata | null {
  for (const packet of loaded.packets) {
    if (!isRecord(packet) || stringValue(packet.command) !== command) {
      continue;
    }
    return {
      packet_id: stringValue(packet.packet_id) ?? `context:${command.replace("/ow:", "")}`,
      command,
      visibility: stringValue(packet.visibility),
      required: stringList(packet.required),
      optional: stringList(packet.optional),
      forbidden: stringList(packet.forbidden),
      audit_checkpoints: packet.audit_checkpoints ?? null,
    };
  }
  return null;
}

function parseMaxBytes(value: string | undefined): number | null {
  if (!value) {
    return DEFAULT_MAX_BYTES;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function budgetModel(budget: BudgetState): ContextBudget {
  return {
    max_bytes: budget.maxBytes,
    max_item_bytes: budget.maxItemBytes,
    used_bytes: budget.usedBytes,
    remaining_bytes: Math.max(0, budget.maxBytes - budget.usedBytes),
  };
}

function printContext(model: ContextModel, ok: boolean): void {
  console.log(`OpenWorkflow context for ${model.normalized_command ?? model.command ?? "unknown"}`);
  console.log(`ok: ${ok}`);
  console.log(`packet_id: ${model.packet_id ?? "none"}`);
  console.log(`budget: ${model.budget.used_bytes}/${model.budget.max_bytes} bytes`);
  console.log("included:");
  for (const item of model.included.length > 0 ? model.included : []) {
    console.log(`  - ${item.path} (${item.source}, ${item.bytes} bytes${item.truncated ? ", truncated" : ""})`);
  }
  if (model.included.length === 0) {
    console.log("  - none");
  }
  console.log("omitted:");
  for (const item of model.omitted.length > 0 ? model.omitted : []) {
    console.log(`  - ${item.path} (${item.reason})`);
  }
  if (model.omitted.length === 0) {
    console.log("  - none");
  }
  console.log("next_actions:");
  for (const item of model.recommended_next_actions.length > 0 ? model.recommended_next_actions : ["none"]) {
    console.log(`  - ${item}`);
  }
}

function finishError(root: string, json: boolean, error: string, nextActions: string[]): number {
  if (json) {
    printJsonReport({
      command: "context",
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

function matchesPattern(path: string, pattern: string): boolean {
  if (!isPattern(pattern)) {
    return path === pattern;
  }
  if (pattern.includes("**")) {
    const [prefix, suffix = ""] = pattern.split("**");
    return path.startsWith(prefix ?? "") && path.endsWith(suffix);
  }
  if (pattern.includes("<id>")) {
    const [prefix, suffix = ""] = pattern.split("<id>");
    return path.startsWith(prefix ?? "") && path.endsWith(suffix);
  }
  return false;
}

function isPattern(path: string): boolean {
  return path.includes("**") || path.includes("<");
}

function isRawEvidencePath(path: string): boolean {
  return path.includes("/evidence/") || path.endsWith("/evidence/**") || path.endsWith("/review.html") || path.includes("/review.");
}

function truncateToBytes(value: string, maxBytes: number): string {
  if (byteLength(value) <= maxBytes) {
    return value;
  }
  let result = value.slice(0, maxBytes);
  while (byteLength(result) > maxBytes) {
    result = result.slice(0, -1);
  }
  return result;
}

function truncateWithMarker(value: string, maxBytes: number): string {
  const marker = "\n... [truncated by openworkflow context]\n";
  const markerBytes = byteLength(marker);
  if (maxBytes <= markerBytes) {
    return truncateToBytes(marker, maxBytes);
  }
  return `${truncateToBytes(value, maxBytes - markerBytes)}${marker}`;
}

function byteLength(value: string): number {
  return Buffer.byteLength(value, "utf8");
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function uniqueContextStatuses(values: ContextStatus[]): ContextStatus[] {
  const byPath = new Map<string, ContextStatus>();
  for (const value of values) {
    byPath.set(value.path, value);
  }
  return [...byPath.values()];
}

function uniqueOmissions(values: ContextOmission[]): ContextOmission[] {
  const seen = new Set<string>();
  const result: ContextOmission[] = [];
  for (const value of values) {
    const key = `${value.path}\0${value.reason}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(value);
    }
  }
  return result;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
