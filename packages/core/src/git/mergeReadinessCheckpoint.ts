import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type MergeFastForwardStatus = "fast_forward" | "already_merged" | "non_fast_forward" | "unknown";

export interface MergeReadinessCheckpointOptions {
  root: string;
  targetRemote: string;
  targetBase: string;
  targetBranch: string;
  baseHead: string | null;
  branchHead: string | null;
  validationEvidence: string[];
}

export interface MergeReadinessCheckpoint {
  target: {
    remote: string;
    base: string;
    branch: string;
    baseHead: string | null;
    branchHead: string | null;
  };
  mergeBase: string | null;
  fastForward: MergeFastForwardStatus;
  conflictProbe: {
    attempted: boolean;
    method: "git merge-tree --write-tree";
    clean: boolean | null;
    exitCode: number | null;
    conflictFiles: string[];
  };
  requiredValidations: string[];
  stopReasons: string[];
}

export async function buildMergeReadinessCheckpoint(options: MergeReadinessCheckpointOptions): Promise<MergeReadinessCheckpoint> {
  const mergeBase = await gitCaptureTrim(options.root, ["merge-base", options.targetBase, options.targetBranch]);
  const fastForward = await fastForwardStatus(options.root, options.targetBase, options.targetBranch, mergeBase);
  const probe = mergeBase
    ? await probeMergeTree(options.root, options.targetBase, options.targetBranch)
    : {
        attempted: false,
        method: "git merge-tree --write-tree" as const,
        clean: null,
        exitCode: null,
        conflictFiles: [],
      };
  const requiredValidations = requiredValidationEvidence(options.validationEvidence, probe.conflictFiles);
  const stopReasons = [
    ...(!mergeBase ? [`merge base is unknown for ${options.targetBase} and ${options.targetBranch}`] : []),
    ...(probe.conflictFiles.length > 0
      ? [`merge conflict checkpoint requires isolated worktree resolution before merge: ${probe.conflictFiles.join(", ")}`]
      : []),
  ];

  return {
    target: {
      remote: options.targetRemote,
      base: options.targetBase,
      branch: options.targetBranch,
      baseHead: options.baseHead,
      branchHead: options.branchHead,
    },
    mergeBase,
    fastForward,
    conflictProbe: probe,
    requiredValidations,
    stopReasons,
  };
}

async function fastForwardStatus(root: string, base: string, branch: string, mergeBase: string | null): Promise<MergeFastForwardStatus> {
  if (!mergeBase) {
    return "unknown";
  }
  if (await gitExitCode(root, ["merge-base", "--is-ancestor", base, branch]) === 0) {
    return "fast_forward";
  }
  if (await gitExitCode(root, ["merge-base", "--is-ancestor", branch, base]) === 0) {
    return "already_merged";
  }
  return "non_fast_forward";
}

async function probeMergeTree(root: string, base: string, branch: string): Promise<MergeReadinessCheckpoint["conflictProbe"]> {
  const result = await gitCaptureStatus(root, ["merge-tree", "--write-tree", base, branch]);
  return {
    attempted: true,
    method: "git merge-tree --write-tree",
    clean: result.code === 0,
    exitCode: result.code,
    conflictFiles: conflictFilesFromMergeTree(result.output),
  };
}

function requiredValidationEvidence(validationEvidence: string[], conflictFiles: string[]): string[] {
  if (conflictFiles.length > 0) {
    return [
      "explicit user approval for isolated conflict-resolution worktree",
      "conflict-resolution evidence naming resolved files",
      "rerun selected validation commands before any later approved merge",
      "local merge-readiness evidence before remote merge execution",
    ];
  }
  return validationEvidence.length > 0
    ? validationEvidence
    : ["rerun selected validation commands before any later approved merge"];
}

function conflictFilesFromMergeTree(output: string): string[] {
  const files = new Set<string>();
  for (const line of output.split("\n")) {
    const stageMatch = /^\d{6}\s+[0-9a-f]{40}\s+[123]\t(.+)$/.exec(line);
    if (stageMatch?.[1]) {
      files.add(stageMatch[1]);
    }
    const conflictMatch = /CONFLICT \([^)]+\): .* in (.+)$/.exec(line);
    if (conflictMatch?.[1]) {
      files.add(conflictMatch[1]);
    }
  }
  return [...files].sort();
}

async function gitCaptureTrim(root: string, args: string[]): Promise<string | null> {
  const result = await gitCaptureStatus(root, args);
  const output = result.output.trim();
  return result.code === 0 && output ? output.split("\n")[0] ?? null : null;
}

async function gitExitCode(root: string, args: string[]): Promise<number | null> {
  return (await gitCaptureStatus(root, args)).code;
}

async function gitCaptureStatus(root: string, args: string[]): Promise<{ code: number | null; output: string }> {
  try {
    const { stdout, stderr } = await execFileAsync("git", args, { cwd: root });
    return { code: 0, output: `${stdout}${stderr}` };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      const code = typeof error.code === "number" ? error.code : null;
      const stdout = "stdout" in error && typeof error.stdout === "string" ? error.stdout : "";
      const stderr = "stderr" in error && typeof error.stderr === "string" ? error.stderr : "";
      return { code, output: `${stdout}${stderr}` };
    }
    return { code: null, output: error instanceof Error ? error.message : String(error) };
  }
}
