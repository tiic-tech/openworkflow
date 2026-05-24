#!/usr/bin/env node
import { execFile as execFileCallback } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { generatePrReadySummary } from "../../../dist/core/src/git/prReadySummary.js";
import { planRemoteReadonly } from "../../../dist/core/src/git/remoteReadonlyPlanner.js";
import { simulateAutonomousGit } from "../../../dist/core/src/git/autonomousSimulator.js";

const execFile = promisify(execFileCallback);

const tempRoot = await mkdtemp(join(tmpdir(), "openworkflow-local-evidence-reader-"));
const remoteRoot = `${tempRoot}-remote.git`;

try {
  await git(["init"], tempRoot);
  await git(["config", "user.name", "OpenWorkflow Test"], tempRoot);
  await git(["config", "user.email", "openworkflow@example.invalid"], tempRoot);
  await writeFile(join(tempRoot, "README.md"), "fixture\n", "utf8");
  await git(["add", "README.md"], tempRoot);
  await git(["commit", "-m", "initial"], tempRoot);
  await git(["switch", "-c", "codex/m117-modern-evidence"], tempRoot);
  await mkdir(join(tempRoot, "src"), { recursive: true });
  await writeFile(join(tempRoot, "src", "change.txt"), "modern evidence\n", "utf8");
  await git(["add", "src/change.txt"], tempRoot);
  await git(["commit", "-m", "M117 C001 modern evidence implementation"], tempRoot);
  const primaryCommit = (await git(["rev-parse", "HEAD"], tempRoot)).stdout.trim();

  const queueDir = join(tempRoot, "changes", "M117-modern-evidence");
  const evidenceDir = join(queueDir, "C001-modern-evidence");
  const evidencePath = "changes/M117-modern-evidence/C001-modern-evidence/LOCAL_COMMIT_EVIDENCE.yaml";
  const queuePath = "changes/M117-modern-evidence/CANDIDATE_CHANGES.yaml";
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(join(tempRoot, evidencePath), [
    "schema_version: 0.1.0",
    "contract_id: local_commit_evidence:M117-C001-modern-evidence",
    "contract_type: planning",
    "planning_artifact_type: implementation_evidence",
    "title: Local commit evidence fixture",
    "status: current",
    "source_plan_id: M117-modern-evidence",
    "source_candidate_id: C001",
    "selected_change_id: M117-C001-modern-evidence",
    `primary_commit: ${primaryCommit}`,
    "validation_evidence:",
    "  - npm run build",
    "  - git diff --check",
    "",
  ].join("\n"), "utf8");
  await writeFile(join(tempRoot, queuePath), [
    "schema_version: 0.1.0",
    "contract_id: candidate_changes:M117-modern-evidence",
    "contract_type: planning",
    "planning_artifact_type: candidate_changes",
    "plan_id: M117-modern-evidence",
    "title: Modern local evidence fixture",
    "status: active",
    "queue_policy:",
    "  branch_boundary: codex/m117-modern-evidence",
    "changes:",
    "  - id: C001",
    "    status: done",
    "    title: Modern evidence reader fixture",
    "    risk: medium",
    "    selection:",
    "      selected_change_id: M117-C001-modern-evidence",
    "      artifacts:",
    "        selected_change: changes/M117-modern-evidence/C001-modern-evidence/SELECTED_CHANGE.yaml",
    "    completion:",
    "      completed_at: 2026-05-23",
    "      implementation_changed_files: true",
    "      evidence:",
    `        - ${evidencePath}`,
    "  - id: G017",
    "    status: done",
    "    title: Build read-only autonomous git simulator",
    "    risk: high",
    "    selection:",
    "      selected_change_id: G017-simulator-fixture",
    "    completion:",
    "      completed_at: 2026-05-23",
    "      implementation_changed_files: true",
    "      evidence:",
    `        - ${evidencePath}`,
    "",
  ].join("\n"), "utf8");

  const summaryPreview = await generatePrReadySummary({ root: tempRoot, queuePath, dryRun: true });
  assert(summaryPreview.ok, `summary preview failed: ${summaryPreview.errors.join(", ")}`);
  assert(summaryPreview.content.includes(`commit: ${primaryCommit}`), "summary did not render primary_commit from LOCAL_COMMIT_EVIDENCE.yaml");
  assert(summaryPreview.content.includes("npm run build"), "summary did not render validation_evidence from LOCAL_COMMIT_EVIDENCE.yaml");

  await generatePrReadySummary({ root: tempRoot, queuePath, dryRun: false });
  await git(["add", "changes"], tempRoot);
  await git(["commit", "-m", "M117 C001 modern local evidence queue"], tempRoot);
  await git(["init", "--bare", remoteRoot], tempRoot);
  await git(["remote", "add", "origin", remoteRoot], tempRoot);
  await git(["push", "origin", "master"], tempRoot);
  await git(["push", "origin", "codex/m117-modern-evidence"], tempRoot);

  const simulator = await simulateAutonomousGit({
    root: tempRoot,
    queuePath,
    baseRef: "master",
    targetRemote: "origin",
    targetBase: "master",
  });
  assert(hasCommit(simulator.commitEvidence, primaryCommit), "simulator did not expose LOCAL_COMMIT_EVIDENCE.yaml primary_commit");
  assert(simulator.validationEvidence.includes("npm run build"), "simulator did not expose LOCAL_COMMIT_EVIDENCE.yaml validation evidence");

  const remotePlan = await planRemoteReadonly({
    root: tempRoot,
    queuePath,
    baseRef: "master",
    targetRemote: "origin",
    targetBase: "master",
  });
  assert(hasCommit(remotePlan.localState.commitEvidence, primaryCommit), "remote-plan did not expose LOCAL_COMMIT_EVIDENCE.yaml primary_commit");
  assert(remotePlan.localState.validationEvidence.includes("npm run build"), "remote-plan did not expose LOCAL_COMMIT_EVIDENCE.yaml validation evidence");
} finally {
  await rm(tempRoot, { recursive: true, force: true });
  await rm(remoteRoot, { recursive: true, force: true });
}

function hasCommit(values, hash) {
  return Array.isArray(values) && values.some((item) => item && item.hash === hash);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function git(args, cwd) {
  return execFile("git", args, { cwd });
}
