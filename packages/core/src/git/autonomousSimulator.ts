import { execFile } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { parseYaml } from "../contracts/yaml.js";

const execFileAsync = promisify(execFile);

export interface SimulateAutonomousGitOptions {
  root: string;
  queuePath: string;
  baseRef?: string;
  targetRemote?: string;
  targetBase?: string;
  prSummaryPath?: string;
}

export interface SimulateAutonomousGitResult {
  ok: boolean;
  mode: "autonomous-simulator";
  mutation_performed: false;
  queuePath: string;
  planId: string;
  branchBoundary: string | null;
  currentBranch: string | null;
  targetRemote: string;
  targetBase: string;
  baseRef: string | null;
  localHead: string | null;
  dirtyPaths: string[];
  orderedLocalCommits: Array<{ hash: string; subject: string }>;
  commitEvidence: Array<{ candidate_id: string; hash: string }>;
  prSummaryPath: string;
  prSummaryExists: boolean;
  validationEvidence: string[];
  blockers: string[];
  warnings: string[];
  remoteRead: {
    remoteHead: string | null;
    baseHead: string | null;
  };
  simulatedPlan: string[];
  rollbackPlan: string[];
}

export async function simulateAutonomousGit(options: SimulateAutonomousGitOptions): Promise<SimulateAutonomousGitResult> {
  const queue = await loadQueue(options.root, options.queuePath);
  const planId = stringValue(queue.plan_id) ?? "unknown-plan";
  const branchBoundary = stringValue(record(queue.queue_policy).branch_boundary);
  const targetRemote = options.targetRemote ?? "origin";
  const targetBase = options.targetBase ?? options.baseRef ?? "main";
  const baseRef = options.baseRef ?? targetBase;
  const prSummaryPath = options.prSummaryPath ?? defaultPrSummaryPath(options.queuePath);
  const currentBranch = await gitCaptureTrim(options.root, ["branch", "--show-current"]);
  const localHead = await gitCaptureTrim(options.root, ["rev-parse", "HEAD"]);
  const dirtyPaths = await readDirtyPaths(options.root);
  const orderedLocalCommits = await readOrderedCommits(options.root, baseRef);
  const commitEvidence = commitEvidenceFromQueue(queue);
  const prSummaryExists = await exists(join(options.root, prSummaryPath));
  const validationEvidence = collectValidationEvidence(queue);
  const remoteHead = await gitCaptureTrim(options.root, ["ls-remote", "--heads", targetRemote, branchBoundary ?? currentBranch ?? "HEAD"]);
  const baseHead = await gitCaptureTrim(options.root, ["ls-remote", "--heads", targetRemote, targetBase]);
  const blockers = [
    ...(!branchBoundary ? ["queue_policy.branch_boundary is missing"] : []),
    ...(branchBoundary && currentBranch !== branchBoundary ? [`current branch ${currentBranch ?? "(detached)"} does not match branch boundary ${branchBoundary}`] : []),
    ...(dirtyPaths.length > 0 ? ["working tree is not clean"] : []),
    ...(orderedLocalCommits.length === 0 && commitEvidence.length === 0 ? ["no local commits or commit evidence available for autonomous plan"] : []),
    ...(!prSummaryExists ? [`PR-ready summary is missing: ${prSummaryPath}`] : []),
    ...(validationEvidence.length === 0 ? ["validation evidence is missing"] : []),
  ];
  const warnings = [
    ...(!remoteHead ? [`remote branch head is unknown for ${targetRemote}/${branchBoundary ?? currentBranch ?? "HEAD"}`] : []),
    ...(!baseHead ? [`remote base head is unknown for ${targetRemote}/${targetBase}`] : []),
    "simulator is read-only and did not push, create PRs, merge, or mutate Issues",
  ];

  return {
    ok: blockers.length === 0,
    mode: "autonomous-simulator",
    mutation_performed: false,
    queuePath: options.queuePath,
    planId,
    branchBoundary,
    currentBranch,
    targetRemote,
    targetBase,
    baseRef,
    localHead,
    dirtyPaths,
    orderedLocalCommits,
    commitEvidence,
    prSummaryPath,
    prSummaryExists,
    validationEvidence,
    blockers,
    warnings,
    remoteRead: {
      remoteHead,
      baseHead,
    },
    simulatedPlan: [
      "verify clean working tree and branch boundary",
      "verify validation evidence and PR-ready summary are current",
      `push ${branchBoundary ?? currentBranch ?? "<branch>"} to ${targetRemote}`,
      `create or update PR from ${branchBoundary ?? currentBranch ?? "<branch>"} into ${targetBase}`,
      "wait for checks and repository protection",
      "stop for conflict evidence if merge cannot be cleanly planned",
      "merge only after autonomous merge policy is separately approved",
      "record remote URLs, refs, merge evidence, and rollback guidance",
    ],
    rollbackPlan: [
      "for push: record previous remote ref and prefer revert PR over force-push",
      "for PR update: record previous body digest and restore guidance",
      "for merge: record merge commit and prepare revert PR plan",
      "for Issue mutation: record before and after state before any future operation",
    ],
  };
}

async function loadQueue(root: string, queuePath: string): Promise<Record<string, unknown>> {
  return record(parseYaml(await readFile(join(root, queuePath), "utf8")));
}

async function readOrderedCommits(root: string, baseRef: string): Promise<Array<{ hash: string; subject: string }>> {
  try {
    const { stdout } = await execFileAsync("git", ["log", "--reverse", "--pretty=format:%H%x09%s", `${baseRef}..HEAD`], { cwd: root });
    return stdout.split("\n").filter(Boolean).map((line) => {
      const [hash, ...subjectParts] = line.split("\t");
      return { hash: hash ?? "", subject: subjectParts.join("\t") };
    });
  } catch {
    return [];
  }
}

async function readDirtyPaths(root: string): Promise<string[]> {
  const status = await gitCapture(root, ["status", "--porcelain"]);
  return status.split("\n").map((line) => line.slice(3).trim()).filter(Boolean);
}

async function gitCaptureTrim(root: string, args: string[]): Promise<string | null> {
  const output = await gitCapture(root, args);
  if (!output.trim()) {
    return null;
  }
  return output.trim().split("\n")[0] ?? null;
}

async function gitCapture(root: string, args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", args, { cwd: root });
    return stdout;
  } catch {
    return "";
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function collectValidationEvidence(queue: Record<string, unknown>): string[] {
  const values = new Set<string>();
  for (const item of array(record(queue.validation).commands_run)) {
    values.add(String(item));
  }
  for (const change of array(queue.changes).map(record)) {
    for (const item of array(record(change.completion).evidence).map(String)) {
      if (item.startsWith("validation:")) {
        values.add(item.replace(/^validation:\s*/, ""));
      }
    }
  }
  return [...values];
}

function commitEvidenceFromQueue(queue: Record<string, unknown>): Array<{ candidate_id: string; hash: string }> {
  return array(queue.changes).map(record).flatMap((candidate) => {
    const candidateId = stringValue(candidate.id) ?? "unknown";
    return array(record(candidate.completion).evidence)
      .map(String)
      .filter((item) => item.startsWith("commit:"))
      .map((item) => ({ candidate_id: candidateId, hash: item.replace(/^commit:\s*/, "") }));
  });
}

function defaultPrSummaryPath(queuePath: string): string {
  const parts = queuePath.split("/");
  parts[parts.length - 1] = "PR_READY_SUMMARY.md";
  return parts.join("/");
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}
