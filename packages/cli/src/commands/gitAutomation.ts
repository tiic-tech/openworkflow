import { execFile } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { promisify } from "node:util";
import { parseYaml } from "../../../core/src/contracts/yaml.js";
import { simulateAutonomousGit } from "../../../core/src/git/autonomousSimulator.js";
import { pilotDraftPr } from "../../../core/src/git/draftPrPilot.js";
import { commitSelectedChange, ensureLocalFeatBranch } from "../../../core/src/git/localGitAutomation.js";
import { generatePrReadySummary } from "../../../core/src/git/prReadySummary.js";
import { planRemoteReadonly } from "../../../core/src/git/remoteReadonlyPlanner.js";
import { booleanFlag, stringFlag } from "../args.js";
import { emptyEffects, printJsonReport } from "../report.js";

type GitAutomationAction = "branch" | "commit" | "summary" | "remote" | "simulate" | "remote-plan" | "draft-pr";
const execFileAsync = promisify(execFile);

export async function gitAutomationCommand(positional: string[], flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const json = booleanFlag(flags, "json");
  const action = positional[0] as GitAutomationAction | undefined;
  const write = booleanFlag(flags, "write");
  const automation = stringFlag(flags, "automation", "managed") ?? "managed";

  if (!action || !["branch", "commit", "summary", "remote", "simulate", "remote-plan", "draft-pr"].includes(action)) {
    return finishGitAutomationUsage(root, json);
  }
  if (automation === "autonomous") {
    return finishGitAutomationError(root, json, "autonomous git automation is not implemented in G015", [
      "create a follow-up high-risk candidate before enabling autonomous push, PR, or merge operations",
    ]);
  }

  if (action === "branch") {
    return gitAutomationBranch(root, flags, write, json);
  }
  if (action === "commit") {
    return gitAutomationCommit(root, flags, write, json);
  }
  if (action === "summary") {
    return gitAutomationSummary(root, flags, write, json);
  }
  if (action === "simulate") {
    return gitAutomationSimulate(root, flags, json);
  }
  if (action === "remote-plan") {
    return gitAutomationRemotePlan(root, flags, json);
  }
  if (action === "draft-pr") {
    return gitAutomationDraftPr(root, flags, write, json);
  }
  return gitAutomationRemote(root, flags, json);
}

async function gitAutomationBranch(root: string, flags: Map<string, string | boolean>, write: boolean, json: boolean): Promise<number> {
  const queuePath = stringFlag(flags, "queue");
  if (!queuePath) {
    return finishGitAutomationError(root, json, "branch mode requires --queue <CANDIDATE_CHANGES.yaml>", []);
  }
  const queue = await loadQueue(root, queuePath);
  const branchBoundary = stringValue(record(queue.queue_policy).branch_boundary);
  if (!branchBoundary) {
    return finishGitAutomationError(root, json, "queue_policy.branch_boundary is required for branch automation", []);
  }
  const result = await ensureLocalFeatBranch({ root, branchBoundary, dryRun: !write });
  return finishGitAutomationResult(root, json, "git-automation branch", result.ok, {
    mode: "managed",
    action: "branch",
    queue: queuePath,
    result,
  }, write ? [`local branch action: ${result.action ?? "none"}`] : ["rerun with --write to apply local branch action"]);
}

async function gitAutomationCommit(root: string, flags: Map<string, string | boolean>, write: boolean, json: boolean): Promise<number> {
  const queuePath = stringFlag(flags, "queue");
  const candidateId = stringFlag(flags, "candidate");
  const commitMessage = stringFlag(flags, "message");
  const validationEvidence = listFlag(flags, "validation-evidence");
  if (!queuePath || !candidateId || !commitMessage) {
    return finishGitAutomationError(root, json, "commit mode requires --queue, --candidate, and --message", []);
  }
  const queue = await loadQueue(root, queuePath);
  const candidate = findCandidate(queue, candidateId);
  if (!candidate) {
    return finishGitAutomationError(root, json, `candidate not found: ${candidateId}`, []);
  }
  const planId = stringValue(queue.plan_id) ?? "unknown-plan";
  const selectedChangeId = stringValue(record(candidate.selection).selected_change_id) ?? stringFlag(flags, "selected-change") ?? candidateId;
  const selectedChangePath = inferSelectedChangePath(candidate);
  const branchBoundary = stringValue(record(queue.queue_policy).branch_boundary);
  const allowedPaths = listFlag(flags, "allowed-paths");
  const candidateOwnedPaths = array(candidate.owned_paths).map(String);
  const commitEvidence = booleanFlag(flags, "commit-evidence");
  const evidencePath = stringFlag(flags, "evidence-path") ?? (commitEvidence ? inferLocalCommitEvidencePath(candidate) : undefined);
  if (commitEvidence && !evidencePath) {
    return finishGitAutomationError(root, json, "commit evidence requires --evidence-path or selection evidence ending in SELECTED_CHANGE.yaml", [
      "record selection.evidence with the selected-change artifact path",
      "or rerun with --evidence-path changes/<plan_id>/<candidate-id>-<slug>/LOCAL_COMMIT_EVIDENCE.yaml",
    ]);
  }
  const result = await commitSelectedChange({
    root,
    planId,
    candidateId,
    selectedChangeId,
    branchBoundary: branchBoundary ?? undefined,
    allowedPaths: allowedPaths.length > 0 ? allowedPaths : candidateOwnedPaths,
    validationEvidence,
    commitMessage,
    evidencePath,
    commitEvidence,
    queuePath,
    selectedChangePath,
    dryRun: !write,
  });
  return finishGitAutomationResult(root, json, "git-automation commit", result.ok, {
    mode: "managed",
    action: "commit",
    queue: queuePath,
    candidate: candidateId,
    result,
  }, write ? [`local commit head: ${result.headCommit ?? "not-created"}`] : ["rerun with --write to create local commit"]);
}

async function gitAutomationSummary(root: string, flags: Map<string, string | boolean>, write: boolean, json: boolean): Promise<number> {
  const queuePath = stringFlag(flags, "queue");
  if (!queuePath) {
    return finishGitAutomationError(root, json, "summary mode requires --queue <CANDIDATE_CHANGES.yaml>", []);
  }
  const result = await generatePrReadySummary({
    root,
    queuePath,
    outputPath: stringFlag(flags, "output"),
    dryRun: !write,
  });
  return finishGitAutomationResult(root, json, "git-automation summary", result.ok, {
    mode: "managed",
    action: "summary",
    queue: queuePath,
    result,
  }, write ? [`wrote ${result.outputPath}`] : ["rerun with --write to write local PR_READY_SUMMARY.md"]);
}

async function gitAutomationRemote(root: string, flags: Map<string, string | boolean>, json: boolean): Promise<number> {
  const operation = stringFlag(flags, "operation", "unspecified") ?? "unspecified";
  const queuePath = stringFlag(flags, "queue");
  const queue = queuePath ? await loadQueue(root, queuePath) : {};
  const branchBoundary = stringValue(record(queue.queue_policy).branch_boundary);
  const baseRef = stringFlag(flags, "base");
  const orderedCommits = baseRef ? await readOrderedCommits(root, baseRef) : commitEvidenceFromQueue(queue);
  return finishGitAutomationResult(root, json, "git-automation remote", false, {
    mode: "managed",
    action: "remote",
    operation,
    queue: queuePath ?? null,
    branch_boundary: branchBoundary,
    base_ref: baseRef ?? null,
    remote_operation_plan: [
      "confirm working tree is clean and validation evidence is current",
      "push the local feat branch to the approved remote branch",
      "create or update the PR from the pushed branch",
      "wait for required checks and resolve conflicts against the target base",
      "merge only after user approval and repository protection checks pass",
      "record remote URL, PR id, merge commit, and rollback guidance as evidence",
    ],
    ordered_local_commits: orderedCommits,
    ordered_local_commit_count: orderedCommits.length,
    approved: false,
    refused: true,
    reason: "remote git and gh mutation requires explicit operation-level approval; G015 produces the operation plan but does not execute it",
    blocked_operations: ["git push", "gh pr create", "gh pr edit", "gh pr merge", "gh issue create", "gh issue edit", "gh issue close", "git merge", "git reset", "git rebase"],
  }, ["review remote_operation_plan, then approve a concrete push/PR/merge operation or create a follow-up autonomous high-risk candidate"]);
}

async function gitAutomationSimulate(root: string, flags: Map<string, string | boolean>, json: boolean): Promise<number> {
  const queuePath = stringFlag(flags, "queue");
  if (!queuePath) {
    return finishGitAutomationError(root, json, "simulate mode requires --queue <CANDIDATE_CHANGES.yaml>", []);
  }
  const result = await simulateAutonomousGit({
    root,
    queuePath,
    baseRef: stringFlag(flags, "base"),
    targetRemote: stringFlag(flags, "remote"),
    targetBase: stringFlag(flags, "target-base"),
    prSummaryPath: stringFlag(flags, "pr-summary"),
  });
  return finishGitAutomationResult(root, json, "git-automation simulate", result.ok, {
    mode: "autonomous-simulator",
    action: "simulate",
    result,
  }, result.ok ? ["review simulator evidence before considering a narrow autonomous pilot"] : ["resolve simulator blockers before autonomous pilot work"]);
}

async function gitAutomationRemotePlan(root: string, flags: Map<string, string | boolean>, json: boolean): Promise<number> {
  const queuePath = stringFlag(flags, "queue");
  if (!queuePath) {
    return finishGitAutomationError(root, json, "remote-plan mode requires --queue <CANDIDATE_CHANGES.yaml>", []);
  }
  const result = await planRemoteReadonly({
    root,
    queuePath,
    baseRef: stringFlag(flags, "base"),
    targetRemote: stringFlag(flags, "remote"),
    targetBase: stringFlag(flags, "target-base"),
    targetBranch: stringFlag(flags, "target-branch"),
    prSummaryPath: stringFlag(flags, "pr-summary"),
  });
  return finishGitAutomationResult(root, json, "git-automation remote-plan", result.ok, {
    mode: "remote-readonly-plan",
    action: "remote-plan",
    result,
  }, result.ok ? ["review remote read-only plan before any draft PR pilot"] : ["resolve remote-plan blockers before any remote mutation pilot"]);
}

async function gitAutomationDraftPr(root: string, flags: Map<string, string | boolean>, write: boolean, json: boolean): Promise<number> {
  const queuePath = stringFlag(flags, "queue");
  if (!queuePath) {
    return finishGitAutomationError(root, json, "draft-pr mode requires --queue <CANDIDATE_CHANGES.yaml>", []);
  }
  const result = await pilotDraftPr({
    root,
    queuePath,
    baseRef: stringFlag(flags, "base"),
    targetRemote: stringFlag(flags, "remote"),
    targetBase: stringFlag(flags, "target-base"),
    targetBranch: stringFlag(flags, "target-branch"),
    prSummaryPath: stringFlag(flags, "pr-summary"),
    title: stringFlag(flags, "title"),
    allowDraftPr: booleanFlag(flags, "allow-draft-pr"),
    dryRun: !write,
  });
  return finishGitAutomationResult(root, json, "git-automation draft-pr", result.ok, {
    mode: "draft-pr-pilot",
    action: "draft-pr",
    result,
  }, result.ok ? [write ? "record draft PR URL and rollback evidence" : "rerun with --write --allow-draft-pr only after reviewing the payload preview"] : ["resolve draft-pr blockers before mutation"]);
}

async function loadQueue(root: string, queuePath: string): Promise<Record<string, unknown>> {
  const { readFile } = await import("node:fs/promises");
  return record(parseYaml(await readFile(join(root, queuePath), "utf8")));
}

function findCandidate(queue: Record<string, unknown>, candidateId: string): Record<string, unknown> | null {
  return array(queue.changes).map(record).find((candidate) => candidate.id === candidateId) ?? null;
}

function finishGitAutomationUsage(root: string, json: boolean): number {
  const usage = "usage: openworkflow git-automation <branch|commit|summary|remote|simulate|remote-plan|draft-pr> --root <folder> --queue <CANDIDATE_CHANGES.yaml> [--write] [--json]";
  if (json) {
    printJsonReport({
      command: "git-automation",
      ok: false,
      root,
      data: { usage },
      warnings: [],
      errors: [usage],
      effects: emptyEffects(),
      next_actions: ["choose branch, commit, summary, or remote"],
    });
  } else {
    console.error(usage);
  }
  return 1;
}

function finishGitAutomationError(root: string, json: boolean, error: string, nextActions: string[]): number {
  if (json) {
    printJsonReport({
      command: "git-automation",
      ok: false,
      root,
      data: {},
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

function finishGitAutomationResult(root: string, json: boolean, command: string, ok: boolean, data: unknown, nextActions: string[]): number {
  const errors = resultErrors(data);
  if (json) {
    printJsonReport({
      command,
      ok,
      root,
      data,
      warnings: resultWarnings(data),
      errors,
      effects: emptyEffects(),
      next_actions: nextActions,
    });
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
  return ok ? 0 : 1;
}

function resultErrors(data: unknown): string[] {
  const item = record(data);
  const result = record(record(data).result);
  const resultErrors = array(result.errors).map(String);
  if (resultErrors.length > 0) {
    return resultErrors;
  }
  const reason = stringValue(item.reason);
  return reason ? [reason] : [];
}

function resultWarnings(data: unknown): string[] {
  const result = record(record(data).result);
  return array(result.warnings).map(String);
}

function listFlag(flags: Map<string, string | boolean>, name: string): string[] {
  const value = stringFlag(flags, name);
  return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
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

function inferLocalCommitEvidencePath(candidate: Record<string, unknown>): string | undefined {
  const selectedChangePath = inferSelectedChangePath(candidate);
  return selectedChangePath ? join(dirname(selectedChangePath), "LOCAL_COMMIT_EVIDENCE.yaml") : undefined;
}

function inferSelectedChangePath(candidate: Record<string, unknown>): string | undefined {
  const selection = record(candidate.selection);
  const artifactPath = stringValue(record(selection.artifacts).selected_change);
  if (artifactPath?.endsWith("/SELECTED_CHANGE.yaml")) {
    return artifactPath;
  }
  const selectionEvidence = array(selection.evidence).map(String);
  return selectionEvidence.find((item) => item.endsWith("/SELECTED_CHANGE.yaml"));
}

async function readOrderedCommits(root: string, baseRef: string): Promise<Array<Record<string, string>>> {
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

function commitEvidenceFromQueue(queue: Record<string, unknown>): Array<Record<string, string>> {
  return array(queue.changes).map(record).flatMap((candidate) => {
    const candidateId = stringValue(candidate.id) ?? "unknown";
    return array(record(candidate.completion).evidence)
      .map(String)
      .filter((item) => item.startsWith("commit:"))
      .map((item) => ({ candidate_id: candidateId, hash: item.replace(/^commit:\s*/, "") }));
  });
}
