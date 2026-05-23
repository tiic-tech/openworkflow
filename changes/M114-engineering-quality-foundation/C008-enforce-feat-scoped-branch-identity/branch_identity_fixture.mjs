import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";

import { commitSelectedChange } from "../../../dist/core/src/git/localGitAutomation.js";

const execFile = promisify(execFileCallback);

async function git(cwd, args) {
  await execFile("git", args, { cwd });
}

const workspace = await mkdtemp(join(tmpdir(), "ow-branch-identity-"));

try {
  const root = join(workspace, "repo");
  await mkdir(root, { recursive: true });
  await git(root, ["init"]);
  await git(root, ["config", "user.name", "OpenWorkflow Test"]);
  await git(root, ["config", "user.email", "openworkflow@example.invalid"]);
  await git(root, ["commit", "--allow-empty", "-m", "initial"]);
  await git(root, ["switch", "-c", "codex/m101-build-proto-prompt-command-split"]);
  await mkdir(join(root, "allowed"), { recursive: true });
  await writeFile(join(root, "allowed", "change.txt"), "branch identity fixture\n", "utf8");

  const staleBoundary = await commitSelectedChange({
    root,
    planId: "M114-engineering-quality-foundation",
    candidateId: "C008",
    selectedChangeId: "M114-C008-enforce-feat-scoped-branch-identity",
    branchBoundary: "codex/m101-build-proto-prompt-command-split",
    allowedPaths: ["allowed"],
    validationEvidence: ["validation: branch identity fixture"],
    commitMessage: "M114-engineering-quality-foundation C008 branch identity fixture",
    dryRun: true,
  });

  assert.equal(staleBoundary.ok, false, "stale continuation branch must not be accepted as the M114 feat branch");
  assert(
    staleBoundary.errors.some((item) => item.includes("branch identity")),
    `stale branch failure should explain branch identity, got: ${staleBoundary.errors.join(", ")}`,
  );
} finally {
  await rm(workspace, { recursive: true, force: true });
}

console.log("branch identity fixture passed");
