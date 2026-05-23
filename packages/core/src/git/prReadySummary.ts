import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { parseYaml } from "../contracts/yaml.js";
import { readLocalGitEvidence, type LocalGitCommitEvidence } from "./localEvidenceReader.js";

export interface GeneratePrReadySummaryOptions {
  root: string;
  queuePath: string;
  outputPath?: string;
  dryRun?: boolean;
}

export interface GeneratePrReadySummaryResult {
  ok: boolean;
  dryRun: boolean;
  queuePath: string;
  outputPath: string;
  content: string;
  errors: string[];
  warnings: string[];
}

interface CandidateChange {
  id?: unknown;
  status?: unknown;
  title?: unknown;
  risk?: unknown;
  validation?: unknown;
  selection?: unknown;
  completion?: unknown;
}

export async function generatePrReadySummary(options: GeneratePrReadySummaryOptions): Promise<GeneratePrReadySummaryResult> {
  const dryRun = options.dryRun !== false;
  const queuePath = normalizeRepoPath(options.queuePath);
  const defaultOutputPath = defaultSummaryPath(queuePath);
  const outputPath = normalizeRepoPath(options.outputPath ?? defaultOutputPath);
  const base = emptyResult(dryRun, queuePath, outputPath);

  let queue: Record<string, unknown>;
  try {
    queue = asRecord(parseYaml(await readFile(join(options.root, queuePath), "utf8")));
  } catch (error) {
    return { ...base, errors: [error instanceof Error ? error.message : String(error)] };
  }

  const changes = asArray(queue.changes).map((change) => asRecord(change) as CandidateChange);
  const completed = changes.filter((change) => change.status === "done");
  const remaining = changes.filter((change) => change.status !== "done");
  const highRisk = changes.filter((change) => change.risk === "high");
  const localEvidence = await readLocalGitEvidence(options.root, queue);
  const validation = localEvidence.validationEvidence.map((item) => item.value);
  const warnings = [
    ...base.warnings,
    ...localEvidence.warnings,
    ...(remaining.length > 0 ? ["candidate queue is not fully complete; PR-ready summary is a review packet, not a merge signal"] : []),
    ...(validation.length === 0 ? ["no validation evidence found in queue or completed candidates"] : []),
  ];
  const content = renderSummary({
    planId: scalar(queue.plan_id, "unknown-plan"),
    title: scalar(queue.title, "Untitled candidate queue"),
    branchBoundary: scalar(asRecord(queue.queue_policy).branch_boundary, "not recorded"),
    queuePath,
    completed,
    remaining,
    highRisk,
    commitEvidence: localEvidence.commitEvidence,
    validation,
    warnings,
  });

  if (!dryRun) {
    await mkdir(dirname(join(options.root, outputPath)), { recursive: true });
    await writeFile(join(options.root, outputPath), content, "utf8");
  }

  return { ...base, ok: true, content, warnings };
}

function renderSummary(input: {
  planId: string;
  title: string;
  branchBoundary: string;
  queuePath: string;
  completed: CandidateChange[];
  remaining: CandidateChange[];
  highRisk: CandidateChange[];
  commitEvidence: LocalGitCommitEvidence[];
  validation: string[];
  warnings: string[];
}): string {
  return [
    `# PR Ready Summary - ${input.planId}`,
    "",
    "This is a local review handoff artifact. It does not mean a remote PR was opened, edited, pushed, merged, or approved.",
    "",
    "## Feat",
    "",
    `- Plan id: \`${input.planId}\``,
    `- Title: ${input.title}`,
    `- Branch boundary: \`${input.branchBoundary}\``,
    `- Source queue: \`${input.queuePath}\``,
    "",
    "## Completed Changes",
    "",
    ...renderCompleted(input.completed, input.commitEvidence),
    "",
    "## Deferred Or Blocked Changes",
    "",
    ...renderRemaining(input.remaining),
    "",
    "## High-Risk Decisions",
    "",
    ...renderHighRisk(input.highRisk),
    "",
    "## Validation",
    "",
    ...renderList(input.validation, "- No validation evidence found."),
    "",
    "## Review Notes",
    "",
    "- This artifact is local evidence only.",
    "- Remote PR creation or mutation requires separate gh operation governance and explicit user approval.",
    ...input.warnings.map((warning) => `- Warning: ${warning}`),
    "",
  ].join("\n");
}

function renderCompleted(changes: CandidateChange[], commitEvidence: LocalGitCommitEvidence[]): string[] {
  if (changes.length === 0) {
    return ["- No completed changes recorded."];
  }
  return changes.map((change) => {
    const candidateId = scalar(change.id, "unknown");
    const selectedChangeId = scalar(asRecord(change.selection).selected_change_id, "not recorded");
    const commits = commitEvidence.filter((item) => item.candidate_id === candidateId).map(formatCommitEvidence);
    const commitText = commits.length > 0 ? `; ${commits.join("; ")}` : "; commit: not recorded";
    return `- \`${candidateId}\` ${scalar(change.title, "Untitled change")} (selected: \`${selectedChangeId}\`${commitText})`;
  });
}

function formatCommitEvidence(item: LocalGitCommitEvidence): string {
  const path = item.evidence_path ? `, evidence: ${item.evidence_path}` : "";
  return `commit: ${item.hash}${path}`;
}

function renderRemaining(changes: CandidateChange[]): string[] {
  if (changes.length === 0) {
    return ["- None."];
  }
  return changes.map((change) => `- \`${scalar(change.id, "unknown")}\` status \`${scalar(change.status, "unknown")}\`: ${scalar(change.title, "Untitled change")}`);
}

function renderHighRisk(changes: CandidateChange[]): string[] {
  if (changes.length === 0) {
    return ["- No high-risk candidates recorded."];
  }
  return changes.map((change) => `- \`${scalar(change.id, "unknown")}\` status \`${scalar(change.status, "unknown")}\`: ${scalar(change.title, "Untitled high-risk change")}`);
}

function renderList(values: string[], empty: string): string[] {
  return values.length > 0 ? values.map((value) => `- \`${value}\``) : [empty];
}

function defaultSummaryPath(queuePath: string): string {
  const segments = queuePath.split("/");
  segments[segments.length - 1] = "PR_READY_SUMMARY.md";
  return segments.join("/");
}

function emptyResult(dryRun: boolean, queuePath: string, outputPath: string): GeneratePrReadySummaryResult {
  return {
    ok: false,
    dryRun,
    queuePath,
    outputPath,
    content: "",
    errors: [],
    warnings: [],
  };
}

function scalar(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeRepoPath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\.?\//, "").replace(/\/+$/g, "");
}
