import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type LocalFeatBranchAction = "already_on_branch" | "checkout_existing_branch" | "create_branch";

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
  return status.stdout.split("\n").filter((line) => line.trim().length > 0);
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
