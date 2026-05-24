import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { promisify } from "node:util";
import { dumpYaml, parseYaml } from "../contracts/yaml.js";
import { assessBranchIdentity, type BranchIdentityException } from "./branchIdentity.js";

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
  queuePath?: string;
  selectedChangePath?: string;
  branchIdentityException?: BranchIdentityException | null;
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
  evidenceBackfilledPaths: string[];
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
  if (options.branchBoundary) {
    const branchIdentity = assessBranchIdentity(options.planId, options.branchBoundary, options.branchIdentityException, "commit");
    if (!branchIdentity.ok) {
      return { ...withState, errors: branchIdentity.errors };
    }
    if (branchIdentity.warnings.length > 0) {
      withState.warnings.push(...branchIdentity.warnings);
    }
  }
  if (options.validationEvidence.length === 0) {
    return { ...withState, errors: ["validation evidence is required before local commit automation"] };
  }
  if (dirtyPaths.length === 0) {
    return { ...withState, errors: ["no dirty paths are available to commit"] };
  }
  if (unrelatedDirtyPaths.length > 0) {
    return {
      ...withState,
      warnings: [...withState.warnings, ...scopeGuidanceForUnrelatedPaths(unrelatedDirtyPaths)],
      errors: ["working tree contains dirty paths outside the selected change scope"],
    };
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
    const evidencePath = normalizeRepoPath(options.evidencePath);
    const evidence = buildCommitEvidence(options, primaryCommit);
    const absoluteEvidencePath = `${options.root}/${evidencePath}`;
    await mkdir(dirname(absoluteEvidencePath), { recursive: true });
    await writeFile(absoluteEvidencePath, dumpYaml(evidence), "utf8");
    const backfill = await backfillCommitEvidence(options, evidencePath);
    const evidenceAddResult = await gitCapture(options.root, ["add", "--", evidencePath, ...backfill.updatedPaths]);
    if (!evidenceAddResult.ok) {
      return {
        ...withState,
        preview,
        primaryCommit,
        evidenceBackfilledPaths: backfill.updatedPaths,
        warnings: [...withState.warnings, ...backfill.warnings],
        errors: [evidenceAddResult.stderr || evidenceAddResult.stdout || "git add evidence failed"],
      };
    }
    const evidenceMessage = `${options.planId}/${options.candidateId} Record commit evidence`;
    const evidenceCommitResult = await gitCapture(options.root, ["commit", "-m", evidenceMessage]);
    if (!evidenceCommitResult.ok) {
      return {
        ...withState,
        preview,
        primaryCommit,
        evidenceBackfilledPaths: backfill.updatedPaths,
        warnings: [...withState.warnings, ...backfill.warnings],
        errors: [evidenceCommitResult.stderr || evidenceCommitResult.stdout || "git commit evidence failed"],
      };
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
      evidencePath,
      evidenceBackfilledPaths: backfill.updatedPaths,
      warnings: [...withState.warnings, ...backfill.warnings],
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

async function backfillCommitEvidence(
  options: CommitSelectedChangeOptions,
  evidencePath: string,
): Promise<{ updatedPaths: string[]; warnings: string[] }> {
  const queuePath = options.queuePath ? normalizeRepoPath(options.queuePath) : null;
  const selectedChangePath = options.selectedChangePath ? normalizeRepoPath(options.selectedChangePath) : null;
  const warnings: string[] = [];
  if (!queuePath) {
    return { updatedPaths: [], warnings: ["commit evidence backfill skipped: queue path was not provided"] };
  }
  if (!selectedChangePath) {
    return { updatedPaths: [], warnings: ["commit evidence backfill skipped: selected-change path was not provided"] };
  }
  if (pathEscapesRepo(queuePath) || pathEscapesRepo(selectedChangePath) || pathEscapesRepo(evidencePath)) {
    return { updatedPaths: [], warnings: ["commit evidence backfill skipped: queue, selected-change, and evidence paths must be repo-relative"] };
  }
  const selectedChangeDir = dirname(selectedChangePath);
  if (!(evidencePath === `${selectedChangeDir}/LOCAL_COMMIT_EVIDENCE.yaml` || evidencePath.startsWith(`${selectedChangeDir}/`))) {
    return { updatedPaths: [], warnings: ["commit evidence backfill skipped: evidence path is outside the selected-change folder"] };
  }

  let queue: Record<string, unknown>;
  let selectedChange: Record<string, unknown>;
  try {
    queue = readYamlRecord(await readFile(`${options.root}/${queuePath}`, "utf8"));
    selectedChange = readYamlRecord(await readFile(`${options.root}/${selectedChangePath}`, "utf8"));
  } catch (error) {
    return {
      updatedPaths: [],
      warnings: [`commit evidence backfill skipped: could not read planning artifacts: ${error instanceof Error ? error.message : String(error)}`],
    };
  }

  const candidate = array(queue.changes).map(record).find((item) => item.id === options.candidateId);
  if (!candidate) {
    return { updatedPaths: [], warnings: [`commit evidence backfill skipped: candidate ${options.candidateId} was not found in queue`] };
  }
  if (candidate.status !== "done") {
    return { updatedPaths: [], warnings: [`commit evidence backfill skipped: candidate ${options.candidateId} status is not done`] };
  }
  const queueCompletion = recordOrNull(candidate.completion);
  if (!queueCompletion) {
    return { updatedPaths: [], warnings: [`commit evidence backfill skipped: candidate ${options.candidateId} has no completion object`] };
  }
  const selectedCompletion = recordOrNull(selectedChange.completion);
  if (!selectedCompletion) {
    return { updatedPaths: [], warnings: ["commit evidence backfill skipped: selected-change artifact has no completion object"] };
  }
  const queueEvidence = arrayOrNull(queueCompletion.evidence);
  if (!queueEvidence) {
    return { updatedPaths: [], warnings: [`commit evidence backfill skipped: candidate ${options.candidateId} completion.evidence is not an array`] };
  }
  const selectedEvidence = arrayOrNull(selectedCompletion.evidence);
  if (!selectedEvidence) {
    return { updatedPaths: [], warnings: ["commit evidence backfill skipped: selected-change completion.evidence is not an array"] };
  }

  const updatedPaths: string[] = [];
  if (!queueEvidence.includes(evidencePath)) {
    queueEvidence.push(evidencePath);
    await writeFile(`${options.root}/${queuePath}`, dumpYaml(queue), "utf8");
    updatedPaths.push(queuePath);
  }
  if (!selectedEvidence.includes(evidencePath)) {
    selectedEvidence.push(evidencePath);
    await writeFile(`${options.root}/${selectedChangePath}`, dumpYaml(selectedChange), "utf8");
    updatedPaths.push(selectedChangePath);
  }
  return { updatedPaths, warnings };
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
    evidenceBackfilledPaths: [],
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
    coder_gate: {
      status: "recorded",
      enforcement: "guidance_only",
      evidence_binding: "LOCAL_COMMIT_EVIDENCE.yaml",
      validation_evidence_ref: "validation_evidence",
      summary: "Coder governance evidence is bound to this local commit evidence record when the selected change involves source edits.",
    },
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

function pathEscapesRepo(path: string): boolean {
  return path === ".." || path.startsWith("../") || path.startsWith("/") || path.includes("://");
}

function isAllowedDirtyPath(path: string, allowedPaths: string[]): boolean {
  return allowedPaths.some((allowedPath) => path === allowedPath || path.startsWith(`${allowedPath}/`));
}

function scopeGuidanceForUnrelatedPaths(paths: string[]): string[] {
  const workflowOutputs = paths.filter(isLikelyOpenWorkflowOutputPath);
  if (workflowOutputs.length === 0) {
    return [];
  }
  return [
    `dirty paths look like OpenWorkflow command outputs outside selected-change owned_paths: ${workflowOutputs.join(", ")}`,
    "If these outputs are expected for the selected change, add the exact file or containing command-output folder to the candidate owned_paths and rerun git-automation commit; otherwise revert or move the unrelated output before committing.",
  ];
}

function isLikelyOpenWorkflowOutputPath(path: string): boolean {
  if (!path.startsWith(".openworkflow/")) {
    return false;
  }
  return path === ".openworkflow/CURRENT_STATE.yaml"
    || path.endsWith("/SUMMARY.yaml")
    || path.endsWith("_INDEX.yaml")
    || path.endsWith("/DECISION.yaml")
    || path.endsWith("/VISION_CONTRACT.yaml")
    || path.endsWith("/VALIDATION_INDEX.yaml");
}

function readYamlRecord(content: string): Record<string, unknown> {
  return record(parseYaml(content));
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function recordOrNull(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function arrayOrNull(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null;
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
