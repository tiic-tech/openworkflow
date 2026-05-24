#!/usr/bin/env node
import { execFile as execFileCallback } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { ensureLocalFeatBranch } from "../../../dist/core/src/git/localGitAutomation.js";
import { planRemoteReadonly } from "../../../dist/core/src/git/remoteReadonlyPlanner.js";
import { simulateAutonomousGit } from "../../../dist/core/src/git/autonomousSimulator.js";
import { pilotDraftPr } from "../../../dist/core/src/git/draftPrPilot.js";

const execFile = promisify(execFileCallback);

const tempRoot = await mkdtemp(join(tmpdir(), "openworkflow-branch-identity-modes-"));
const remoteRoot = `${tempRoot}-remote.git`;
const planId = "M117-stale-branch-identity-fixture";
const branchBoundary = "codex/m101-stale-continuation";
const queuePath = `changes/${planId}/CANDIDATE_CHANGES.yaml`;

try {
  await git(["init"], tempRoot);
  await git(["config", "user.name", "OpenWorkflow Test"], tempRoot);
  await git(["config", "user.email", "openworkflow@example.invalid"], tempRoot);
  await writeFile(join(tempRoot, "README.md"), "fixture\n", "utf8");
  await git(["add", "README.md"], tempRoot);
  await git(["commit", "-m", "initial"], tempRoot);
  await git(["switch", "-c", branchBoundary], tempRoot);
  await mkdir(join(tempRoot, "src"), { recursive: true });
  await writeFile(join(tempRoot, "src", "change.txt"), "branch identity\n", "utf8");
  await git(["add", "src/change.txt"], tempRoot);
  await git(["commit", "-m", "M117 stale branch identity fixture"], tempRoot);
  const primaryCommit = (await git(["rev-parse", "HEAD"], tempRoot)).stdout.trim();

  const queueDir = join(tempRoot, "changes", planId);
  const evidenceDir = join(queueDir, "G017-simulator");
  const evidencePath = `changes/${planId}/G017-simulator/LOCAL_COMMIT_EVIDENCE.yaml`;
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(join(tempRoot, evidencePath), [
    "schema_version: 0.1.0",
    "contract_id: local_commit_evidence:G017-simulator",
    "contract_type: planning",
    "planning_artifact_type: implementation_evidence",
    "title: Local commit evidence fixture",
    "status: current",
    `source_plan_id: ${planId}`,
    "source_candidate_id: G017",
    "selected_change_id: G017-simulator",
    `primary_commit: ${primaryCommit}`,
    "validation_evidence:",
    "  - npm run verify:runtime-surface",
    "",
  ].join("\n"), "utf8");
  await writeFile(join(tempRoot, queuePath), [
    "schema_version: 0.1.0",
    `contract_id: candidate_changes:${planId}`,
    "contract_type: planning",
    "planning_artifact_type: candidate_changes",
    `plan_id: ${planId}`,
    "title: Stale branch identity fixture",
    "status: active",
    "queue_policy:",
    `  branch_boundary: ${branchBoundary}`,
    "changes:",
    "  - id: G017",
    "    status: done",
    "    title: Build read-only autonomous git simulator",
    "    risk: high",
    "    selection:",
    "      selected_change_id: G017-simulator",
    "      artifacts:",
    `        selected_change: changes/${planId}/G017-simulator/SELECTED_CHANGE.yaml`,
    "    completion:",
    "      completed_at: 2026-05-23",
    "      implementation_changed_files: true",
    "      evidence:",
    `        - ${evidencePath}`,
    "",
  ].join("\n"), "utf8");
  await writeFile(join(queueDir, "PR_READY_SUMMARY.md"), "# PR Ready\n\nfixture\n", "utf8");
  await git(["add", "changes"], tempRoot);
  await git(["commit", "-m", "M117 stale branch identity queue"], tempRoot);
  await git(["init", "--bare", remoteRoot], tempRoot);
  await git(["remote", "add", "origin", remoteRoot], tempRoot);
  await git(["push", "origin", "master"], tempRoot);
  await git(["push", "origin", branchBoundary], tempRoot);

  const branch = await ensureLocalFeatBranch({
    root: tempRoot,
    planId,
    branchBoundary,
    dryRun: true,
  });
  assertStaleIdentity("branch", branch.ok, branch.branchIdentity, branch.errors);

  const remotePlan = await planRemoteReadonly({
    root: tempRoot,
    queuePath,
    baseRef: "master",
    targetRemote: "origin",
    targetBase: "master",
  });
  assertStaleIdentity("remote-plan", remotePlan.ok, remotePlan.targetIdentity.branchIdentity, remotePlan.blockers);

  const simulator = await simulateAutonomousGit({
    root: tempRoot,
    queuePath,
    baseRef: "master",
    targetRemote: "origin",
    targetBase: "master",
  });
  assertStaleIdentity("simulate", simulator.ok, simulator.branchIdentity, simulator.blockers);

  const draft = await pilotDraftPr({
    root: tempRoot,
    queuePath,
    baseRef: "master",
    targetRemote: "origin",
    targetBase: "master",
    dryRun: true,
  });
  assertStaleIdentity("draft-pr", draft.ok, draft.branchIdentity, draft.blockers);
} finally {
  await rm(tempRoot, { recursive: true, force: true });
  await rm(remoteRoot, { recursive: true, force: true });
}

function assertStaleIdentity(mode, ok, branchIdentity, blockers) {
  assert(ok === false, `${mode} should fail closed for stale branch identity`);
  assert(branchIdentity?.owns_plan === false, `${mode} should report branch_owns_plan false`);
  assert(branchIdentity?.status === "mismatched_plan_id", `${mode} should report mismatched_plan_id`);
  assert(Array.isArray(blockers) && blockers.some((item) => String(item).includes("branch identity mismatch")), `${mode} should include branch identity blocker`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function git(args, cwd) {
  return execFile("git", args, { cwd });
}
