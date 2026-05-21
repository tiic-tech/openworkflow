import { execFile } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { parseYaml } from "../contracts/yaml.js";

const execFileAsync = promisify(execFile);

export interface PlanRemoteReadonlyOptions {
  root: string;
  queuePath: string;
  baseRef?: string;
  targetRemote?: string;
  targetBase?: string;
  targetBranch?: string;
  prSummaryPath?: string;
}

export interface PlanRemoteReadonlyResult {
  ok: boolean;
  mode: "remote-readonly-plan";
  mutation_performed: false;
  queuePath: string;
  planId: string;
  targetIdentity: {
    remote: string;
    remoteUrl: string | null;
    base: string;
    branch: string;
    currentBranch: string | null;
    branchBoundary: string | null;
  };
  localState: {
    head: string | null;
    baseRef: string | null;
    dirtyPaths: string[];
    orderedCommits: Array<{ hash: string; subject: string }>;
    commitEvidence: Array<{ candidate_id: string; hash: string }>;
    validationEvidence: string[];
    simulatorEvidencePresent: boolean;
    prSummaryPath: string;
    prSummaryExists: boolean;
  };
  remoteState: {
    branchHead: string | null;
    baseHead: string | null;
  };
  prState: {
    lookupAttempted: boolean;
    available: boolean;
    items: Array<Record<string, unknown>>;
    warning: string | null;
  };
  blockers: string[];
  warnings: string[];
  readOnlyPlan: string[];
  rollbackPlan: string[];
}

export async function planRemoteReadonly(options: PlanRemoteReadonlyOptions): Promise<PlanRemoteReadonlyResult> {
  const queue = await loadQueue(options.root, options.queuePath);
  const planId = stringValue(queue.plan_id) ?? "unknown-plan";
  const branchBoundary = stringValue(record(queue.queue_policy).branch_boundary);
  const currentBranch = await gitCaptureTrim(options.root, ["branch", "--show-current"]);
  const targetRemote = options.targetRemote ?? "origin";
  const targetBase = options.targetBase ?? options.baseRef ?? "main";
  const targetBranch = options.targetBranch ?? branchBoundary ?? currentBranch ?? "HEAD";
  const baseRef = options.baseRef ?? targetBase;
  const prSummaryPath = options.prSummaryPath ?? defaultPrSummaryPath(options.queuePath);
  const remoteUrl = await gitCaptureTrim(options.root, ["remote", "get-url", targetRemote]);
  const localHead = await gitCaptureTrim(options.root, ["rev-parse", "HEAD"]);
  const dirtyPaths = await readDirtyPaths(options.root);
  const orderedCommits = await readOrderedCommits(options.root, baseRef);
  const commitEvidence = commitEvidenceFromQueue(queue);
  const validationEvidence = collectValidationEvidence(queue);
  const simulatorEvidencePresent = hasSimulatorEvidence(queue);
  const prSummaryExists = await exists(join(options.root, prSummaryPath));
  const branchHead = parseLsRemoteHead(await gitCapture(options.root, ["ls-remote", "--heads", targetRemote, targetBranch]));
  const baseHead = parseLsRemoteHead(await gitCapture(options.root, ["ls-remote", "--heads", targetRemote, targetBase]));
  const prState = await readPrState(options.root, targetBranch, targetBase);
  const blockers = [
    ...(!branchBoundary ? ["queue_policy.branch_boundary is missing"] : []),
    ...(branchBoundary && currentBranch !== branchBoundary ? [`current branch ${currentBranch ?? "(detached)"} does not match branch boundary ${branchBoundary}`] : []),
    ...(dirtyPaths.length > 0 ? ["working tree is not clean"] : []),
    ...(!remoteUrl ? [`target remote is unknown: ${targetRemote}`] : []),
    ...(!baseHead ? [`remote base head is unknown for ${targetRemote}/${targetBase}`] : []),
    ...(orderedCommits.length === 0 && commitEvidence.length === 0 ? ["no ordered local commits or queue commit evidence available"] : []),
    ...(!simulatorEvidencePresent ? ["simulator evidence is missing"] : []),
    ...(!prSummaryExists ? [`PR-ready summary is missing: ${prSummaryPath}`] : []),
    ...(validationEvidence.length === 0 ? ["validation evidence is missing"] : []),
  ];
  const warnings = [
    ...(!branchHead ? [`remote branch head is absent or unreadable for ${targetRemote}/${targetBranch}`] : []),
    ...(prState.warning ? [prState.warning] : []),
    "remote-readonly-plan is read-only and did not push, create PRs, edit PRs, merge, or mutate Issues",
  ];

  return {
    ok: blockers.length === 0,
    mode: "remote-readonly-plan",
    mutation_performed: false,
    queuePath: options.queuePath,
    planId,
    targetIdentity: {
      remote: targetRemote,
      remoteUrl,
      base: targetBase,
      branch: targetBranch,
      currentBranch,
      branchBoundary,
    },
    localState: {
      head: localHead,
      baseRef,
      dirtyPaths,
      orderedCommits,
      commitEvidence,
      validationEvidence,
      simulatorEvidencePresent,
      prSummaryPath,
      prSummaryExists,
    },
    remoteState: {
      branchHead,
      baseHead,
    },
    prState,
    blockers,
    warnings,
    readOnlyPlan: [
      "verify target remote, branch, and base identity",
      "compare local HEAD, ordered commits, and queue commit evidence",
      "compare remote branch head and target base head",
      "inspect existing draft PR metadata when gh is available",
      "produce a push and draft PR operation preview for a later approved mutation candidate",
      "stop before any git push, gh pr create, gh pr edit, merge, or Issue mutation",
    ],
    rollbackPlan: [
      "for a later branch push: record previous remote ref and prefer revert PR recovery over force-push",
      "for a later draft PR create: record PR URL and close guidance",
      "for a later draft PR update: record previous managed-section digest and restore guidance",
      "for merge or Issue mutation: no rollback is planned because those operations remain out of scope",
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

async function readPrState(root: string, head: string, base: string): Promise<PlanRemoteReadonlyResult["prState"]> {
  try {
    const { stdout } = await execFileAsync("gh", [
      "pr",
      "list",
      "--head",
      head,
      "--base",
      base,
      "--state",
      "all",
      "--json",
      "number,title,state,isDraft,url,headRefName,baseRefName,updatedAt",
      "--limit",
      "10",
    ], { cwd: root });
    return {
      lookupAttempted: true,
      available: true,
      items: array(JSON.parse(stdout)).map(record),
      warning: null,
    };
  } catch {
    return {
      lookupAttempted: true,
      available: false,
      items: [],
      warning: "gh PR metadata is unavailable; remote git refs were still read without mutation",
    };
  }
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

function parseLsRemoteHead(output: string): string | null {
  const first = output.trim().split("\n").find(Boolean);
  if (!first) {
    return null;
  }
  return first.split(/\s+/)[0] ?? null;
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

function hasSimulatorEvidence(queue: Record<string, unknown>): boolean {
  return array(queue.changes).map(record).some((candidate) => {
    const id = stringValue(candidate.id) ?? "";
    const title = (stringValue(candidate.title) ?? "").toLowerCase();
    const status = stringValue(candidate.status);
    const completionEvidence = array(record(candidate.completion).evidence);
    return status === "done" && completionEvidence.length > 0 && (id === "G017" || title.includes("simulator"));
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
