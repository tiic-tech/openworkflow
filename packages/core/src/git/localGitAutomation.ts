import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { promisify } from "node:util";
import { dumpYaml } from "../contracts/yaml.js";

const execFileAsync = promisify(execFile);

export type LocalFeatBranchAction = "already_on_branch" | "checkout_existing_branch" | "create_branch";
export type SelectedChangeCommitAction = "commit_selected_change";

export interface LocalGitCommandPreview {
  command: "git";
  args: string[];
}

export interface EnsureLocalFeatBranchOptions {
  root: string;
  branchBoundary: string;
  dryRun?: boolean;
}

export interface EnsureLocalFeatBranchResult {
  ok: boolean;
  dryRun: boolean;
  branchBoundary: string;
  currentBranch: string | null;
  dirtyPaths: string[];
  action: LocalFeatBranchAction | null;
  preview: LocalGitCommandPreview | null;
  errors: string[];
  warnings: string[];
}

export interface CommitSelectedChangeOptions {
  root: string;
  planId: string;
  candidateId: string;
  selectedChangeId: string;
  branchBoundary?: string;
  allowedPaths: string[];
  validationEvidence: string[];
  commitMessage: string;
  dryRun?: boolean;
  evidencePath?: string;
  commitEvidence?: boolean;
}

export interface CommitSelectedChangeResult {
  ok: boolean;
  dryRun: boolean;
  planId: string;
  candidateId: string;
  selectedChangeId: string;
  currentBranch: string | null;
  dirtyPaths: string[];
  includedPaths: string[];
  unrelatedDirtyPaths: string[];
  validationEvidence: string[];
  action: SelectedChangeCommitAction | null;
  preview: LocalGitCommandPreview | null;
  primaryCommit: string | null;
  evidenceCommit: string | null;
  headCommit: string | null;
  evidencePath: string | null;
  errors: string[];
  warnings: string[];
}

export async function ensureLocalFeatBranch(options: EnsureLocalFeatBranchOptions): Promise<EnsureLocalFeatBranchResult> {
  const dryRun = options.dryRun !== false;
  const branchBoundary = options.branchBoundary.trim();
  const base = emptyResult(dryRun, branchBoundary);

  const branchError = validateBranchBoundary(branchBoundary);
  if (branchError) {
    return { ...base, errors: [branchError] };
  }

  const insideWorkTree = await gitCapture(options.root, ["rev-parse", "--is-inside-work-tree"]);
  if (!insideWorkTree.ok || insideWorkTree.stdout.trim() !== "true") {
    return { ...base, errors: ["root must be inside a git work tree"] };
  }
  const gitBranchCheck = await gitCapture(options.root, ["check-ref-format", "--branch", branchBoundary]);
  if (!gitBranchCheck.ok) {
    return { ...base, errors: ["branch boundary must be accepted by git check-ref-format --branch"] };
  }

  const currentBranchResult = await gitCapture(options.root, ["branch", "--show-current"]);
  const currentBranch = currentBranchResult.ok && currentBranchResult.stdout.trim().length > 0
    ? currentBranchResult.stdout.trim()
    : null;
  const dirtyPaths = await readDirtyPaths(options.root);
  const withState = { ...base, currentBranch, dirtyPaths };

  if (dirtyPaths.length > 0) {
    return {
      ...withState,
      errors: ["working tree has uncommitted paths; resolve them before local branch automation"],
    };
  }

  if (currentBranch === branchBoundary) {
    return { ...withState, ok: true, action: "already_on_branch" };
  }

  const branchExists = await gitExitCode(options.root, ["show-ref", "--verify", "--quiet", `refs/heads/${branchBoundary}`]) === 0;
  const args = branchExists ? ["switch", branchBoundary] : ["switch", "-c", branchBoundary];
  const action: LocalFeatBranchAction = branchExists ? "checkout_existing_branch" : "create_branch";
  const preview: LocalGitCommandPreview = { command: "git", args };

  if (dryRun) {
    return { ...withState, ok: true, action, preview };
  }

  const mutation = await gitCapture(options.root, args);
  if (!mutation.ok) {
    return { ...withState, action, preview, errors: [mutation.stderr || mutation.stdout || `git ${args.join(" ")} failed`] };
  }
  const afterBranch = await gitCapture(options.root, ["branch", "--show-current"]);
  return {
    ...withState,
    ok: true,
    currentBranch: afterBranch.ok && afterBranch.stdout.trim().length > 0 ? afterBranch.stdout.trim() : branchBoundary,
    action,
    preview,
  };
}

export async function commitSelectedChange(options: CommitSelectedChangeOptions): Promise<CommitSelectedChangeResult> {
  const dryRun = options.dryRun !== false;
  const base = emptyCommitResult(options, dryRun);
  const rootCheck = await validateGitRoot(options.root);
  if (!rootCheck.ok) {
    return { ...base, errors: rootCheck.errors };
  }

  const commitInputError = validateCommitInputs(options);
  if (commitInputError) {
    return { ...base, errors: [commitInputError] };
  }

  const currentBranch = await readCurrentBranch(options.root);
  const dirtyPaths = await readDirtyPaths(options.root);
  const normalizedAllowedPaths = options.allowedPaths.map(normalizeRepoPath);
  const unrelatedDirtyPaths = dirtyPaths.filter((path) => !isAllowedDirtyPath(path, normalizedAllowedPaths));
  const includedPaths = dirtyPaths.filter((path) => isAllowedDirtyPath(path, normalizedAllowedPaths));
  const withState = { ...base, currentBranch, dirtyPaths, includedPaths, unrelatedDirtyPaths };

  if (options.branchBoundary && currentBranch !== options.branchBoundary) {
    return { ...withState, errors: [`current branch ${currentBranch ?? "(detached)"} does not match branch boundary ${options.branchBoundary}`] };
  }
  if (options.validationEvidence.length === 0) {
    return { ...withState, errors: ["validation evidence is required before local commit automation"] };
  }
  if (dirtyPaths.length === 0) {
    return { ...withState, errors: ["no dirty paths are available to commit"] };
  }
  if (unrelatedDirtyPaths.length > 0) {
    return { ...withState, errors: ["working tree contains dirty paths outside the selected change scope"] };
  }

  const commitArgs = ["commit", "-m", options.commitMessage];
  const preview: LocalGitCommandPreview = { command: "git", args: commitArgs };
  if (dryRun) {
    return { ...withState, ok: true, action: "commit_selected_change", preview };
  }

  const addResult = await gitCapture(options.root, ["add", "--", ...includedPaths]);
  if (!addResult.ok) {
    return { ...withState, preview, errors: [addResult.stderr || addResult.stdout || "git add failed"] };
  }
  const commitResult = await gitCapture(options.root, commitArgs);
  if (!commitResult.ok) {
    return { ...withState, preview, errors: [commitResult.stderr || commitResult.stdout || "git commit failed"] };
  }
  const primaryCommit = await readHeadCommit(options.root);

  if (options.evidencePath && options.commitEvidence) {
    const evidence = buildCommitEvidence(options, primaryCommit);
    const absoluteEvidencePath = `${options.root}/${normalizeRepoPath(options.evidencePath)}`;
    await mkdir(dirname(absoluteEvidencePath), { recursive: true });
    await writeFile(absoluteEvidencePath, dumpYaml(evidence), "utf8");
    const evidenceAddResult = await gitCapture(options.root, ["add", "--", normalizeRepoPath(options.evidencePath)]);
    if (!evidenceAddResult.ok) {
      return { ...withState, preview, primaryCommit, errors: [evidenceAddResult.stderr || evidenceAddResult.stdout || "git add evidence failed"] };
    }
    const evidenceMessage = `${options.planId}/${options.candidateId} Record commit evidence`;
    const evidenceCommitResult = await gitCapture(options.root, ["commit", "-m", evidenceMessage]);
    if (!evidenceCommitResult.ok) {
      return { ...withState, preview, primaryCommit, errors: [evidenceCommitResult.stderr || evidenceCommitResult.stdout || "git commit evidence failed"] };
    }
    const evidenceCommit = await readHeadCommit(options.root);
    return {
      ...withState,
      ok: true,
      action: "commit_selected_change",
      preview,
      primaryCommit,
      evidenceCommit,
      headCommit: evidenceCommit,
      evidencePath: normalizeRepoPath(options.evidencePath),
    };
  }

  return {
    ...withState,
    ok: true,
    action: "commit_selected_change",
    preview,
    primaryCommit,
    headCommit: primaryCommit,
  };
}

async function validateGitRoot(root: string): Promise<{ ok: boolean; errors: string[] }> {
  const insideWorkTree = await gitCapture(root, ["rev-parse", "--is-inside-work-tree"]);
  if (!insideWorkTree.ok || insideWorkTree.stdout.trim() !== "true") {
    return { ok: false, errors: ["root must be inside a git work tree"] };
  }
  return { ok: true, errors: [] };
}

function validateCommitInputs(options: CommitSelectedChangeOptions): string | null {
  if (options.planId.trim().length === 0 || options.candidateId.trim().length === 0 || options.selectedChangeId.trim().length === 0) {
    return "plan id, candidate id, and selected change id are required";
  }
  if (!options.commitMessage.includes(options.planId) || !options.commitMessage.includes(options.candidateId)) {
    return "commit message must include the plan id and candidate id";
  }
  if (options.allowedPaths.length === 0) {
    return "allowed paths are required before local commit automation";
  }
  if (options.allowedPaths.some((path) => normalizeRepoPath(path).startsWith(".."))) {
    return "allowed paths must stay inside the repository";
  }
  return null;
}

function emptyCommitResult(options: CommitSelectedChangeOptions, dryRun: boolean): CommitSelectedChangeResult {
  return {
    ok: false,
    dryRun,
    planId: options.planId,
    candidateId: options.candidateId,
    selectedChangeId: options.selectedChangeId,
    currentBranch: null,
    dirtyPaths: [],
    includedPaths: [],
    unrelatedDirtyPaths: [],
    validationEvidence: options.validationEvidence,
    action: null,
    preview: null,
    primaryCommit: null,
    evidenceCommit: null,
    headCommit: null,
    evidencePath: options.evidencePath ? normalizeRepoPath(options.evidencePath) : null,
    errors: [],
    warnings: [],
  };
}

function buildCommitEvidence(options: CommitSelectedChangeOptions, primaryCommit: string | null): Record<string, unknown> {
  return {
    schema_version: "0.1.0",
    contract_id: `local_commit_evidence:${options.selectedChangeId}`,
    contract_type: "planning",
    planning_artifact_type: "implementation_evidence",
    title: `Local commit evidence for ${options.selectedChangeId}`,
    status: "current",
    source_plan_id: options.planId,
    source_candidate_id: options.candidateId,
    selected_change_id: options.selectedChangeId,
    primary_commit: primaryCommit,
    validation_evidence: options.validationEvidence,
    audit_notes: [
      "Selected changes must have at least one local commit.",
      "Additional evidence commits are allowed when they preserve selected-change traceability.",
      "Remote push, PR creation, Issue mutation, and merge are not part of this local automation.",
    ],
  };
}

async function readCurrentBranch(root: string): Promise<string | null> {
  const currentBranchResult = await gitCapture(root, ["branch", "--show-current"]);
  return currentBranchResult.ok && currentBranchResult.stdout.trim().length > 0
    ? currentBranchResult.stdout.trim()
    : null;
}

async function readHeadCommit(root: string): Promise<string | null> {
  const head = await gitCapture(root, ["rev-parse", "HEAD"]);
  return head.ok && head.stdout.trim().length > 0 ? head.stdout.trim() : null;
}

function emptyResult(dryRun: boolean, branchBoundary: string): EnsureLocalFeatBranchResult {
  return {
    ok: false,
    dryRun,
    branchBoundary,
    currentBranch: null,
    dirtyPaths: [],
    action: null,
    preview: null,
    errors: [],
    warnings: [],
  };
}

function validateBranchBoundary(branch: string): string | null {
  if (branch.length === 0) {
    return "branch boundary must be non-empty";
  }
  if (branch.includes(" ") || branch.startsWith("/") || branch.endsWith("/") || branch.startsWith("-")) {
    return "branch boundary must be a branch-like string without spaces, leading dash, or leading/trailing slashes";
  }
  if (branch.includes("..") || /[~^:?*[\\]/.test(branch)) {
    return "branch boundary must not contain git ref control characters";
  }
  return null;
}

async function readDirtyPaths(root: string): Promise<string[]> {
  const status = await gitCapture(root, ["status", "--porcelain"]);
  if (!status.ok || status.stdout.trim().length === 0) {
    return [];
  }
  return status.stdout.split("\n").map(parseStatusPath).filter((line) => line.length > 0);
}

function parseStatusPath(line: string): string {
  const path = line.slice(3).trim();
  const renameTarget = path.includes(" -> ") ? path.split(" -> ").pop() ?? path : path;
  return normalizeRepoPath(renameTarget.replace(/^"|"$/g, ""));
}

function normalizeRepoPath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\.?\//, "").replace(/\/+$/g, "");
}

function isAllowedDirtyPath(path: string, allowedPaths: string[]): boolean {
  return allowedPaths.some((allowedPath) => path === allowedPath || path.startsWith(`${allowedPath}/`));
}

async function gitExitCode(root: string, args: string[]): Promise<number | null> {
  try {
    await execFileAsync("git", args, { cwd: root });
    return 0;
  } catch (error) {
    if (isExecError(error) && typeof error.code === "number") {
      return error.code;
    }
    return null;
  }
}

async function gitCapture(root: string, args: string[]): Promise<{ ok: boolean; stdout: string; stderr: string }> {
  try {
    const { stdout, stderr } = await execFileAsync("git", args, { cwd: root });
    return { ok: true, stdout, stderr };
  } catch (error) {
    if (isExecError(error)) {
      return {
        ok: false,
        stdout: typeof error.stdout === "string" ? error.stdout : "",
        stderr: typeof error.stderr === "string" ? error.stderr : "",
      };
    }
    return { ok: false, stdout: "", stderr: error instanceof Error ? error.message : String(error) };
  }
}

function isExecError(error: unknown): error is Error & { code?: number; stdout?: string; stderr?: string } {
  return error instanceof Error;
}
