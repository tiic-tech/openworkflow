#!/usr/bin/env node
import { mkdir, mkdtemp, readdir, readFile, rm, stat, unlink, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const CURRENT_FILE = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(dirname(CURRENT_FILE), "../../../..");
const CLI = join(REPO_ROOT, "dist", "cli", "src", "index.js");

async function main(): Promise<number> {
  await assertFile(CLI);
  const tempRoot = await mkdtemp(join(tmpdir(), "openworkflow-runtime-surface-"));
  try {
    const target = join(tempRoot, "target");
    const codexHome = join(tempRoot, "codex-home");
    const env = { ...process.env, CODEX_HOME: codexHome };

    await run(["node", CLI, "init", target, "--tools", "codex", "--force"], env);
    await writeStaleAgentsGuide(target);
    await run(["node", CLI, "sync", "--root", target, "--tools", "codex"], env);
    await run(["node", CLI, "doctor", "--root", target, "--tools", "codex"], env);
    await run(["node", CLI, "validate", "--root", target], env);

    await verifyMinimalOpenWorkflow(target);
    await verifyAgentsGuide(target);
    await verifyHelpSurface(env);
    await verifyBriefStatus(target, tempRoot, env);
    await verifyJsonReports(target, tempRoot, env);
    await verifyCommandCheck(target, env);
    await verifySummaryHealth(tempRoot, env);
    await verifyConfig(target);
    await verifySkills(target);
    await verifyNoDefaultPrompts(codexHome);
    await verifyDesignContract(target);
    await verifyTuneDecisionSurface(target);
    await verifyNoDefaultCodexCommands(target);
    await verifyNonDestructiveSyncMigration(tempRoot, env);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }

  console.log("OpenWorkflow runtime surface verification passed.");
  return 0;
}

async function runCaptureStatus(command: string[], env: NodeJS.ProcessEnv): Promise<{ code: number | null; output: string }> {
  return new Promise<{ code: number | null; output: string }>((resolvePromise, reject) => {
    let output = "";
    const child = spawn(command[0] ?? "", command.slice(1), {
      cwd: REPO_ROOT,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.on("data", (chunk: Buffer) => {
      output += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      output += chunk.toString("utf8");
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolvePromise({ code, output });
    });
  });
}

async function run(command: string[], env: NodeJS.ProcessEnv): Promise<void> {
  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn(command[0] ?? "", command.slice(1), {
      cwd: REPO_ROOT,
      env,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        reject(new Error(`command failed (${code ?? "signal"}): ${command.join(" ")}`));
      }
    });
  });
}

async function runCapture(command: string[], env: NodeJS.ProcessEnv): Promise<string> {
  return new Promise<string>((resolvePromise, reject) => {
    let output = "";
    const child = spawn(command[0] ?? "", command.slice(1), {
      cwd: REPO_ROOT,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.on("data", (chunk: Buffer) => {
      output += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      output += chunk.toString("utf8");
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise(output);
      } else {
        reject(new Error(`command failed (${code ?? "signal"}): ${command.join(" ")}\n${output}`));
      }
    });
  });
}

async function verifyAgentsGuide(root: string): Promise<void> {
  const guide = await read(join(root, "AGENTS.md"));
  for (const required of [
    "BEGIN OPENWORKFLOW AGENT GUIDE",
    "generated-by: openworkflow",
    "template-id: openworkflow.agents-guide.v1",
    "openworkflow --help",
    ".openworkflow/CURRENT_STATE.yaml",
    "read_this_first",
    ".agents/skills/ow-*/SKILL.md",
    "openworkflow inspect --root . --json",
    "openworkflow brief --root .",
    "openworkflow status --root .",
    "openworkflow check /ow:<command> --root . --json",
    "openworkflow summaries --root . --json",
    "openworkflow summarize --root . --artifact <path> --json",
    "SUMMARY.yaml trust is checked by `summaries`, not by `validate`",
    "/ow:vision",
    "/ow:spec",
    "/ow:team",
    "Respect lazy creation",
  ]) {
    assert(guide.includes(required), `AGENTS.md missing onboarding guidance: ${required}`);
  }
  assert(!guide.includes("Old lazy creation wording"), "sync did not refresh stale AGENTS.md managed block");
  assert(guide.indexOf("BEGIN OPENWORKFLOW AGENT GUIDE") === guide.lastIndexOf("BEGIN OPENWORKFLOW AGENT GUIDE"), "sync duplicated AGENTS.md managed block");
}

async function writeStaleAgentsGuide(root: string): Promise<void> {
  const path = join(root, "AGENTS.md");
  const guide = await read(path);
  await writeFile(path, guide.replace("Respect lazy creation", "Old lazy creation wording"), "utf8");
}

async function verifyHelpSurface(env: NodeJS.ProcessEnv): Promise<void> {
  const help = await runCapture(["node", CLI, "--help"], env);
  for (const required of [
    "Agent quick start",
    "Two command surfaces",
    "CLI maintenance commands",
    "Repo-local workflow commands are Agent skills",
    ".openworkflow/CURRENT_STATE.yaml",
    "/ow:vision",
    "/ow:team",
    "Lazy creation boundary",
    "Sync safety",
    "status",
    "brief",
    "inspect",
    "check",
    "summaries",
    "summarize",
    "pass --write to update summary files",
    "SUMMARY.yaml freshness is checked by summaries",
    "requires an initialized .openworkflow root",
    "Every command supports --json",
    "schema_version, command, ok, root, data, warnings, errors, effects",
  ]) {
    assert(help.includes(required), `openworkflow --help missing agent guidance: ${required}`);
  }
}

async function verifyBriefStatus(root: string, tempRoot: string, env: NodeJS.ProcessEnv): Promise<void> {
  const status = await runCapture(["node", CLI, "status", "--root", root], env);
  for (const required of [
    "OpenWorkflow brief for",
    "Workflow:",
    "active_stage: workflow",
    "next_command: /ow:vision",
    "Read this first:",
    ".openworkflow/CURRENT_STATE.yaml",
    "Active pointers:",
    "Health:",
    "Git:",
    "Agent guidance:",
  ]) {
    assert(status.includes(required), `status output missing ${required}`);
  }

  const json = parseJsonReport(await runCapture(["node", CLI, "brief", "--root", root, "--json"], env), "brief");
  const data = record(json.data, "brief data");
  for (const key of ["project", "workflow", "read_this_first", "active_pointers", "health", "git", "agent_guidance"]) {
    assert(key in data, `brief json missing data key ${key}`);
  }
  const workflow = record(data.workflow, "workflow");
  assert(workflow.active_stage === "workflow", "brief json active_stage mismatch");
  assert(workflow.next_command === "/ow:vision", "brief json next_command mismatch");
  const git = record(data.git, "git");
  assert(git.available === false, "brief json should report non-git target as unavailable");

  for (const forbiddenPath of [
    ".openworkflow/vision",
    ".openworkflow/validation",
    ".openworkflow/prototypes",
    ".openworkflow/changes",
    ".openworkflow/runtime",
  ]) {
    assert(!(await exists(join(root, forbiddenPath))), `brief/status created stage path: ${forbiddenPath}`);
  }

  const gitTarget = join(tempRoot, "git-target");
  await run(["git", "init", gitTarget], env);
  await run(["node", CLI, "init", gitTarget, "--tools", "codex", "--force"], env);
  const gitJson = parseJsonReport(await runCapture(["node", CLI, "brief", "--root", gitTarget, "--json"], env), "brief");
  const gitData = record(gitJson.data, "brief data");
  const gitState = record(gitData.git, "git");
  assert(gitState.available === true, "brief json should detect git worktree");
  assert(gitState.dirty === true, "brief json should report dirty git worktree");
  assert(Array.isArray(gitState.changed_files) && gitState.changed_files.length > 0, "brief json missing changed files");
}

async function verifyJsonReports(root: string, tempRoot: string, env: NodeJS.ProcessEnv): Promise<void> {
  const initTarget = join(tempRoot, "json-init");
  parseJsonReport(await runCapture(["node", CLI, "init", initTarget, "--tools", "codex", "--json"], env), "init");
  parseJsonReport(await runCapture(["node", CLI, "sync", "--root", root, "--json"], env), "sync");
  parseJsonReport(await runCapture(["node", CLI, "doctor", "--root", root, "--json"], env), "doctor");
  const validateReport = parseJsonReport(await runCapture(["node", CLI, "validate", "--root", root, "--json"], env), "validate");
  const validateData = record(validateReport.data, "validate data");
  const validateScope = record(validateData.scope, "validate scope");
  assert(String(validateScope.summary_files).includes("summaries"), "validate scope missing summary boundary");
  parseJsonReport(await runCapture(["node", CLI, "clean", "--root", root, "--tools", "codex", "--json"], env), "clean");
  parseJsonReport(await runCapture(["node", CLI, "status", "--root", root, "--json"], env), "status");
  parseJsonReport(await runCapture(["node", CLI, "brief", "--root", root, "--json"], env), "brief");
  parseJsonReport(await runCapture(["node", CLI, "inspect", "--root", root, "--json"], env), "inspect");
  parseJsonReport(await runCapture(["node", CLI, "check", "/ow:vision", "--root", root, "--json"], env), "check");
  parseJsonReport(await runCapture(["node", CLI, "summaries", "--root", root, "--json"], env), "summaries");
  const summarizeStatus = await runCaptureStatus(["node", CLI, "summarize", "--root", root, "--all", "--json"], env);
  assert(summarizeStatus.code === 0, "summarize --all dry-run should succeed");
  parseJsonReport(summarizeStatus.output, "summarize");
}

async function verifySummaryHealth(tempRoot: string, env: NodeJS.ProcessEnv): Promise<void> {
  const missingRoot = join(tempRoot, "not-openworkflow");
  await mkdir(missingRoot, { recursive: true });
  const uninitialized = await runCaptureStatus(["node", CLI, "summaries", "--root", missingRoot, "--json"], env);
  assert(uninitialized.code !== 0, "summaries should fail clearly outside an initialized OpenWorkflow root");
  const uninitializedReport = parseJsonReport(uninitialized.output, "summaries");
  const uninitializedData = record(uninitializedReport.data, "uninitialized summary data");
  assert(uninitializedReport.ok === false, "uninitialized summaries report should not be ok");
  assert(uninitializedData.initialized === false, "uninitialized summaries data should be initialized=false");
  assert(Array.isArray(uninitializedReport.errors) && uninitializedReport.errors.some((item) => String(item).includes("missing OpenWorkflow artifact contracts")), "uninitialized summaries missing explicit error");

  const inspectUninitialized = await runCaptureStatus(["node", CLI, "inspect", "--root", missingRoot, "--json"], env);
  assert(inspectUninitialized.code !== 0, "inspect should fail clearly outside an initialized OpenWorkflow root");
  const inspectUninitializedReport = parseJsonReport(inspectUninitialized.output, "inspect");
  const inspectUninitializedData = record(inspectUninitializedReport.data, "uninitialized inspect data");
  const inspectUninitializedSummaries = record(inspectUninitializedData.summaries, "uninitialized inspect summaries");
  assert(inspectUninitializedReport.ok === false, "uninitialized inspect should not be ok");
  assert(inspectUninitializedSummaries.initialized === false, "uninitialized inspect should expose summary initialized=false");

  const summarizeUninitialized = await runCaptureStatus(["node", CLI, "summarize", "--root", missingRoot, "--all", "--json"], env);
  assert(summarizeUninitialized.code !== 0, "summarize should fail clearly outside an initialized OpenWorkflow root");
  const summarizeUninitializedReport = parseJsonReport(summarizeUninitialized.output, "summarize");
  assert(summarizeUninitializedReport.ok === false, "uninitialized summarize should not be ok");

  const summaryBoundaryRoot = join(tempRoot, "summary-validate-boundary");
  await run(["node", CLI, "init", summaryBoundaryRoot, "--tools", "codex", "--force"], env);
  const summaryOnlyDir = join(summaryBoundaryRoot, ".openworkflow", "prototypes", "proto-summary-only");
  await mkdir(summaryOnlyDir, { recursive: true });
  await writeFile(join(summaryOnlyDir, "SUMMARY.yaml"), "artifact_type: prototype_summary\nsummary: Validate should not schema-check summary files.\n", "utf8");
  const validateBoundary = parseJsonReport(await runCapture(["node", CLI, "validate", "--root", summaryBoundaryRoot, "--json"], env), "validate");
  assert(validateBoundary.ok === true, "validate should not reject SUMMARY.yaml as an unknown source artifact");

  const root = join(tempRoot, "summary-health");
  await run(["node", CLI, "init", root, "--tools", "codex", "--force"], env);
  const fresh = parseJsonReport(await runCapture(["node", CLI, "summaries", "--root", root, "--json"], env), "summaries");
  const freshData = record(fresh.data, "summary health data");
  const freshCounts = record(freshData.counts, "summary health counts");
  assert(freshData.initialized === true, "fresh summary health should report initialized=true");
  assert(Number(freshCounts.not_instantiated) > 0, "fresh summary health should report not_instantiated artifacts");
  const inspectFresh = parseJsonReport(await runCapture(["node", CLI, "inspect", "--root", root, "--json"], env), "inspect");
  const inspectFreshData = record(inspectFresh.data, "inspect data");
  const inspectReadOrder = record(inspectFreshData.read_order, "inspect read_order");
  const inspectNextCheck = record(inspectFreshData.next_command_check, "inspect next_command_check");
  assert(inspectFresh.ok === true, "fresh inspect should be ok");
  assert(Array.isArray(inspectReadOrder.must_read) && inspectReadOrder.must_read.includes(".openworkflow/CURRENT_STATE.yaml"), "inspect read_order missing current state");
  assert(inspectNextCheck.ready === true, "inspect next_command_check should report ready vision");
  await assertNoStageArtifacts(root);

  const artifactDir = join(root, ".openworkflow", "prototypes", "proto-1");
  await mkdir(artifactDir, { recursive: true });
  await writeFile(join(artifactDir, "EVIDENCE.yaml"), "artifact_type: prototype_evidence\ncore_question: Test\nresult: promising\nhandoff:\n  next_command: /ow:design\n", "utf8");
  const missing = parseJsonReport(await runCapture(["node", CLI, "summaries", "--root", root, "--json"], env), "summaries");
  const missingData = record(missing.data, "summary health data");
  const entries = missingData.entries;
  assert(Array.isArray(entries), "summary health entries must be array");
  assert(entries.some((entry) => record(entry, "summary entry").artifact_type === "prototype_evidence" && record(entry, "summary entry").status === "missing"), "summary health did not report missing prototype summary");
  const missingCheckStatus = await runCaptureStatus(["node", CLI, "check", "/ow:proto", "--root", root, "--json"], env);
  assert(missingCheckStatus.code !== 0, "proto check should fail without required validation context");
  const missingCheck = parseJsonReport(missingCheckStatus.output, "check");
  assert(Array.isArray(missingCheck.warnings) && missingCheck.warnings.some((item) => String(item).includes("summary health for prototype_evidence")), "check warnings missing summary health promotion");

  const dryRun = parseJsonReport(await runCapture(["node", CLI, "summarize", "--root", root, "--artifact", ".openworkflow/prototypes/proto-1/EVIDENCE.yaml", "--json"], env), "summarize");
  const dryEffects = record(dryRun.effects, "summarize dry-run effects");
  assert(Array.isArray(dryEffects.planned) && dryEffects.planned.includes(".openworkflow/prototypes/proto-1/SUMMARY.yaml"), "summarize dry-run did not plan summary write");
  assert(!(await exists(join(artifactDir, "SUMMARY.yaml"))), "summarize dry-run wrote SUMMARY.yaml");
  const invalidArtifact = await runCaptureStatus(["node", CLI, "summarize", "--root", root, "--artifact", ".openworkflow/prototypes/missing/EVIDENCE.yaml", "--json"], env);
  assert(invalidArtifact.code !== 0, "summarize should fail clearly for a missing artifact");
  const invalidArtifactReport = parseJsonReport(invalidArtifact.output, "summarize");
  assert(invalidArtifactReport.ok === false, "invalid summarize artifact should return ok=false JSON");

  const writeRun = parseJsonReport(await runCapture(["node", CLI, "summarize", "--root", root, "--artifact", ".openworkflow/prototypes/proto-1/EVIDENCE.yaml", "--write", "--json"], env), "summarize");
  const writeEffects = record(writeRun.effects, "summarize write effects");
  assert(Array.isArray(writeEffects.written) && writeEffects.written.includes(".openworkflow/prototypes/proto-1/SUMMARY.yaml"), "summarize write did not report summary write");
  assert(await exists(join(artifactDir, "SUMMARY.yaml")), "summarize --write did not create SUMMARY.yaml");
  const currentAfterWrite = parseJsonReport(await runCapture(["node", CLI, "summaries", "--root", root, "--json"], env), "summaries");
  const currentEntries = record(currentAfterWrite.data, "summary health data").entries;
  assert(Array.isArray(currentEntries), "summary health entries must be array");
  assert(currentEntries.some((entry) => record(entry, "summary entry").artifact_type === "prototype_evidence" && record(entry, "summary entry").status === "current"), "summary health did not report current prototype after summarize write");

  const validationDir = join(root, ".openworkflow", "validation", "val-1");
  await mkdir(validationDir, { recursive: true });
  await writeFile(join(validationDir, "VALIDATION.yaml"), "artifact_type: validation_target\ncore_question: Test\n", "utf8");
  const missingSlice = parseJsonReport(await runCapture(["node", CLI, "summaries", "--root", root, "--json"], env), "summaries");
  const missingSliceEntries = record(missingSlice.data, "summary health data").entries;
  assert(Array.isArray(missingSliceEntries), "summary health entries must be array");
  assert(missingSliceEntries.some((entry) => record(entry, "summary entry").artifact_type === "validation_target" && record(entry, "summary entry").status === "missing"), "summary health did not report missing validation current_slice");

  const summaryPath = join(artifactDir, "SUMMARY.yaml");
  const old = new Date(0);
  await utimes(summaryPath, old, old);
  const stale = parseJsonReport(await runCapture(["node", CLI, "summaries", "--root", root, "--json"], env), "summaries");
  const staleEntries = record(stale.data, "summary health data").entries;
  assert(Array.isArray(staleEntries), "summary health entries must be array");
  assert(staleEntries.some((entry) => record(entry, "summary entry").artifact_type === "prototype_evidence" && record(entry, "summary entry").status === "stale_unknown"), "summary health did not report stale prototype summary");
  const allWrite = parseJsonReport(await runCapture(["node", CLI, "summarize", "--root", root, "--all", "--write", "--json"], env), "summarize");
  const allEffects = record(allWrite.effects, "summarize all effects");
  assert(Array.isArray(allEffects.written) && allEffects.written.includes(".openworkflow/prototypes/proto-1/SUMMARY.yaml"), "summarize --all --write did not refresh stale summary");

  const brief = parseJsonReport(await runCapture(["node", CLI, "brief", "--root", root, "--json"], env), "brief");
  const briefData = record(brief.data, "brief data");
  const briefHealth = record(briefData.health, "brief health");
  assert("summaries" in briefHealth, "brief health missing summaries");
  assert(brief.ok === false, "brief top-level ok should include failing summary health");
  assert(briefHealth.ok === false, "brief health.ok should include failing summary health");

  const inspect = parseJsonReport(await runCapture(["node", CLI, "inspect", "--root", root, "--json"], env), "inspect");
  const inspectData = record(inspect.data, "inspect data");
  const inspectHealth = record(inspectData.health, "inspect health");
  assert(inspect.ok === false, "inspect top-level ok should include failing summary health");
  assert(inspectHealth.ok === false, "inspect health.ok should include failing summary health");

  const checkStatus = await runCaptureStatus(["node", CLI, "check", "/ow:proto", "--root", root, "--json"], env);
  assert(checkStatus.code !== 0, "proto check should fail without required validation context");
  const check = parseJsonReport(checkStatus.output, "check");
  const checkData = record(check.data, "check data");
  assert("summary_guidance" in checkData, "check output missing summary_guidance");

}

async function verifyCommandCheck(root: string, env: NodeJS.ProcessEnv): Promise<void> {
  const vision = parseJsonReport(await runCapture(["node", CLI, "check", "/ow:vision", "--root", root, "--json"], env), "check");
  const visionData = record(vision.data, "vision check data");
  assert(visionData.ready === true, "vision check should be ready in fresh init");
  assert(Array.isArray(visionData.required_context), "check missing required_context");
  assert(Array.isArray(visionData.allowed_outputs), "check missing allowed_outputs");
  assert(Array.isArray(visionData.handoff_commands), "check missing handoff_commands");

  const spec = await runCaptureStatus(["node", CLI, "check", "ow-spec", "--root", root, "--json"], env);
  assert(spec.code !== 0, "spec check should fail without required design context");
  const specReport = parseJsonReport(spec.output, "check");
  const specData = record(specReport.data, "spec check data");
  assert(specData.ready === false, "spec check should not be ready");
  assert(Array.isArray(specData.blockers) && specData.blockers.some((item) => String(item).includes("missing required context")), "spec check missing required context blocker");

  const validation = await runCaptureStatus(["node", CLI, "check", "ow-validation", "--root", root, "--json"], env);
  assert(validation.code !== 0, "validation check should fail without vision contract");
  const validationReport = parseJsonReport(validation.output, "check");
  const validationData = record(validationReport.data, "validation check data");
  assert(validationData.ready === false, "validation check should not be ready without vision contract");
  assert(Array.isArray(validationData.warnings) && validationData.warnings.some((item) => String(item).includes("CURRENT_STATE next_command")), "validation check missing next-command warning");

  await assertNoStageArtifacts(root);
}

async function assertNoStageArtifacts(root: string): Promise<void> {
  for (const forbiddenPath of [
    ".openworkflow/vision",
    ".openworkflow/validation",
    ".openworkflow/prototypes",
    ".openworkflow/changes",
    ".openworkflow/runtime",
  ]) {
    assert(!(await exists(join(root, forbiddenPath))), `check created stage path: ${forbiddenPath}`);
  }
}

async function verifyNonDestructiveSyncMigration(tempRoot: string, env: NodeJS.ProcessEnv): Promise<void> {
  const older = join(tempRoot, "older-project");
  await run(["node", CLI, "init", older, "--tools", "codex", "--force"], env);
  const userArtifact = join(older, ".openworkflow", "validation", "VALIDATION.yaml");
  await mkdir(join(older, ".openworkflow", "validation"), { recursive: true });
  await writeFile(userArtifact, "user validation artifact\n", "utf8");
  await unlink(join(older, ".openworkflow", "CURRENT_STATE.yaml"));
  await writeFile(join(older, ".openworkflow", "audit", "ARTIFACT_CONTRACTS.yaml"), "stale managed contract\n", "utf8");

  const doctor = await runCaptureStatus(["node", CLI, "doctor", "--root", older, "--tools", "auto"], env);
  assert(doctor.code !== 0, "doctor should fail before sync repairs missing managed workflow files");
  assert(doctor.output.includes("missing managed workflow file: .openworkflow/CURRENT_STATE.yaml"), "doctor did not report missing current state");
  assert(doctor.output.includes("stale managed workflow file: .openworkflow/audit/ARTIFACT_CONTRACTS.yaml"), "doctor did not report stale artifact contracts");

  const syncAuto = await runCapture(["node", CLI, "sync", "--root", older], env);
  assert(syncAuto.includes("Detected tools: codex"), "sync without --tools did not auto-detect codex");
  assert(syncAuto.includes("Workflow files added:"), "sync report missing workflow phase");
  assert(syncAuto.includes("codex adapter written:"), "sync report missing codex adapter phase");
  await assertFile(join(older, ".openworkflow", "CURRENT_STATE.yaml"));
  const contracts = await read(join(older, ".openworkflow", "audit", "ARTIFACT_CONTRACTS.yaml"));
  assert(contracts.includes("artifact_type: product_design"), "sync did not refresh managed artifact contracts");
  assert((await read(userArtifact)) === "user validation artifact\n", "sync modified user stage artifact");

  const syncExplicitAuto = await runCapture(["node", CLI, "sync", "--root", older, "--tools", "auto"], env);
  assert(syncExplicitAuto.includes("Detected tools: codex"), "sync --tools auto did not auto-detect codex");
  const syncExplicitCodex = await runCapture(["node", CLI, "sync", "--root", older, "--tools", "codex"], env);
  assert(syncExplicitCodex.includes("codex adapter written:"), "sync --tools codex did not sync codex explicitly");
  assert(!syncExplicitCodex.includes("claude-code"), "explicit codex sync mentioned an unrequested future platform");
}

async function verifyMinimalOpenWorkflow(root: string): Promise<void> {
  const actualFiles = new Set(
    (await collectPaths(join(root, ".openworkflow"), "file")).map((path) => relative(root, path)),
  );
  assertSetEqual(
    actualFiles,
    new Set([
      ".openworkflow/config.yaml",
      ".openworkflow/CURRENT_STATE.yaml",
      ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
      ".openworkflow/audit/COMMAND_AUDIT_INDEX.yaml",
      ".openworkflow/audit/CONTEXT_PACKETS.yaml",
      ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
      ".openworkflow/audit/DISCLOSURE_LEVELS.yaml",
    ]),
    "unexpected .openworkflow files",
  );

  const actualDirs = new Set(
    [".openworkflow", ...(await collectPaths(join(root, ".openworkflow"), "directory")).map((path) => relative(root, path))],
  );
  assertSetEqual(
    actualDirs,
    new Set([
      ".openworkflow",
      ".openworkflow/audit",
      ".openworkflow/workflow",
    ]),
    "unexpected .openworkflow dirs",
  );
}

async function verifyConfig(root: string): Promise<void> {
  const config = await read(join(root, ".openworkflow", "config.yaml"));
  assert(config.includes("default_command_delivery: codex-repo-skills"), "config missing Codex skill delivery");
  assert(config.includes(".agents/skills"), "config missing Codex skill surface");
  assert(config.includes("explicit_invocation: $ow-<id>"), "config missing explicit skill invocation policy");
  assert(!config.includes("project_title: ."), "config kept unusable project title");
  assert(!config.includes("project_slug: project"), "config kept generic project slug");

  const currentState = await read(join(root, ".openworkflow", "CURRENT_STATE.yaml"));
  assert(currentState.includes("active_stage: workflow"), "current state missing workflow active stage");
  assert(currentState.includes("next_command: /ow:vision"), "current state missing initial next command");
  assert(currentState.includes("read_this_first:"), "current state missing read_this_first");
}

async function verifyNoDefaultPrompts(codexHome: string): Promise<void> {
  for (const name of ["ow-vision.md", "ow-validation.md", "ow-proto.md", "ow-tune.md", "ow-design.md", "ow-spec.md", "ow-change.md", "ow-team.md"]) {
    assert(!(await exists(join(codexHome, "prompts", name))), `default global prompt generated unexpectedly: ${name}`);
  }
}

async function verifySkills(root: string): Promise<void> {
  for (const name of ["ow-vision", "ow-validation", "ow-proto", "ow-tune", "ow-decision", "ow-design", "ow-spec", "ow-change", "ow-team"]) {
    const skill = join(root, ".agents", "skills", name, "SKILL.md");
    const interfaceFile = join(root, ".agents", "skills", name, "agents", "openai.yaml");
    await assertFile(skill);
    await assertFile(interfaceFile);
    const skillContent = await read(skill);
    const interfaceContent = await read(interfaceFile);
    assert(skillContent.startsWith("---\n"), `${name} missing SKILL.md frontmatter`);
    assert(skillContent.includes(`name: "${name}"`), `${name} missing skill name`);
    assert(skillContent.includes("description:"), `${name} missing skill description`);
    assert(skillContent.includes("generated-by: openworkflow"), `${name} missing generated marker`);
    assert(skillContent.includes("<user_behavior>"), `${name} missing user behavior block`);
    assert(skillContent.includes("<agent_protocol>"), `${name} missing agent protocol block`);
    assert(skillContent.includes("<inner_thinking>"), `${name} missing inner thinking block`);
    assert(skillContent.includes("<artifact_checkpoint>"), `${name} missing artifact checkpoint block`);
    assert(skillContent.includes("<handoff>"), `${name} missing handoff block`);
    assert(skillContent.includes(".openworkflow/CURRENT_STATE.yaml"), `${name} missing current state guidance`);
    assert(skillContent.includes("summary_policy"), `${name} missing summary policy guidance`);
    if (name === "ow-vision") {
      verifyVisionSkill(skillContent);
    }
    if (name === "ow-proto") {
      verifyProtoSkill(skillContent);
    }
    if (name === "ow-tune") {
      verifyTuneSkill(skillContent);
    }
    if (name === "ow-decision") {
      verifyDecisionSkill(skillContent);
    }
    if (name === "ow-design") {
      verifyDesignSkill(skillContent);
    }
    if (name === "ow-spec") {
      verifySpecSkill(skillContent);
    }
    if (name === "ow-change") {
      verifyChangeSkill(skillContent);
    }
    if (name === "ow-team") {
      verifyTeamSkill(skillContent);
    }
    const semanticCommand = `/${name.replace("ow-", "ow:")}`;
    const displayName = semanticCommand.slice(1);
    assert(hasYamlScalar(interfaceContent, "display_name", displayName), `${name} missing slashless display name`);
    assert(!hasYamlScalar(interfaceContent, "display_name", semanticCommand), `${name} display name includes semantic slash`);
    assert(skillContent.includes(`Semantic command: ${semanticCommand}`), `${name} missing semantic command`);
    assert(interfaceContent.includes("default_prompt:"), `${name} missing default prompt`);
  }
}

function verifySpecSkill(content: string): void {
  for (const required of [
    "accepted-design-to-production-spec",
    "<lazy_create>",
    "OpenWorkflow init is minimal",
    "create it during /ow:spec",
    "<spec_quality_bar>",
    "A production spec must be enough for an implementation agent",
    "Do not hand off to /ow:change until implementation scope, acceptance, and test plan are explicit.",
  ]) {
    assert(content.includes(required), `ow-spec missing production guidance: ${required}`);
  }
}

function verifyChangeSkill(content: string): void {
  for (const required of [
    "production-change-planning",
    "<lazy_create>",
    "create it together with the first change artifact during /ow:change",
    "<planning_quality_bar>",
    "owned_paths",
    "Do not hand off to /ow:team until CHANGE.yaml and WORK_ITEMS.yaml agree on scope and verification.",
  ]) {
    assert(content.includes(required), `ow-change missing production guidance: ${required}`);
  }
}

function verifyTeamSkill(content: string): void {
  for (const required of [
    "approved-change-team-execution",
    "<lazy_create>",
    "Create RUNTIME_INDEX.yaml and the first runtime state only when /ow:team begins approved execution.",
    "<execution_quality_bar>",
    "Track active change, active work item",
    "When work is incomplete, leave the next action and blocker explicit in runtime state.",
  ]) {
    assert(content.includes(required), `ow-team missing production guidance: ${required}`);
  }
}

function hasYamlScalar(content: string, key: string, value: string): boolean {
  return content.includes(`${key}: ${value}`) || content.includes(`${key}: "${value}"`);
}

function verifyVisionSkill(content: string): void {
  for (const required of [
    "conversation-first-sustained-grill",
    "<conversation_first>",
    "<mandatory_coverage>",
    "Cover target user and beneficiary.",
    "Cover the problem, motivation, and emotional or quality bar.",
    "Cover AI-native role, boundaries, and failure modes.",
    "Cover privacy, data, sharing, and retention assumptions.",
    "Cover success signals and failure signals.",
    "<readiness_gate>",
    "Do not hand off to /ow:validation until mandatory coverage is addressed",
    "Vision readiness is based on coverage and user confirmation, not on a fixed number of turns.",
    "Write VISION_SESSION.yaml, VISION_CONTRACT.yaml, VISION.md, or context updates only after stable answers",
  ]) {
    assert(content.includes(required), `ow-vision missing M15 guidance: ${required}`);
  }
}

function verifyProtoSkill(content: string): void {
  for (const required of [
    "<prototype_classification>",
    "prototype mode",
    "visual, interaction, technical feasibility, 3D/material, workflow, or data/logic",
    "<reference_extraction>",
    "reference-pattern extraction",
    "target image, URL, screenshot, HTML/CSS",
    "<visual_first_path>",
    "high-fidelity static concept",
    "image generation",
    "visual_concept_policy.image_generation",
    "<design_seed_protocol>",
    "design system, template seed",
    "<verification_protocol>",
    "browser verification",
    "screenshot",
    "<self_critique>",
    "philosophy, hierarchy, execution, specificity, restraint, accessibility, and responsive behavior",
    "repair pass before evidence handoff",
  ]) {
    assert(content.includes(required), `ow-proto missing M16 guidance: ${required}`);
  }
}

function verifyTuneSkill(content: string): void {
  for (const required of [
    "<target_resolution>",
    "/ow:tune resolves to the current prototype by default.",
    "/ow:tune:proto is an explicit alias",
    "<proto_orchestration>",
    "no current prototype exists but a current validation target exists",
    "<revision_protocol>",
    "<internal_decision_audit>",
    "Every tune pass must write or update a decision audit record internally.",
    "Do not expose /ow:decision as the next manual user step",
  ]) {
    assert(content.includes(required), `ow-tune missing M17 guidance: ${required}`);
  }
}

function verifyDecisionSkill(content: string): void {
  for (const required of [
    "<command_visibility>internal</command_visibility>",
    "<internal_audit_only>",
    "/ow:decision is preserved for durable audit records, not as a normal user-facing workflow step.",
  ]) {
    assert(content.includes(required), `ow-decision missing internal audit guidance: ${required}`);
  }
}

function verifyDesignSkill(content: string): void {
  for (const required of [
    "conversation-first-product-design",
    "<conversation_first>",
    "<mandatory_coverage>",
    "Cover journey map and key flows.",
    "Cover UX states, state transitions, and feedback timing.",
    "Cover edge cases and failure states.",
    "Cover responsive behavior and accessibility expectations.",
    "Cover spec readiness and blockers.",
    "<readiness_gate>",
    "Do not hand off to /ow:spec until design coverage is sufficient",
    "If accepted prototype evidence is thin, ask targeted design questions or hand back to /ow:tune.",
    "Persist PRODUCT_DESIGN.yaml after stable design answers or explicit checkpoint request.",
  ]) {
    assert(content.includes(required), `ow-design missing M15 guidance: ${required}`);
  }
}

async function verifyDesignContract(root: string): Promise<void> {
  const commandIndex = await read(join(root, ".openworkflow", "audit", "COMMAND_AUDIT_INDEX.yaml"));
  assert(commandIndex.includes("trigger: /ow:design"), "command audit missing /ow:design");
  const designSection = commandIndex.split("trigger: /ow:design", 2)[1]?.split("  - id:", 1)[0] ?? "";
  assert(designSection.includes("PRODUCT_DESIGN.yaml"), "design allowed outputs missing PRODUCT_DESIGN");
  assert(!extractBlock(designSection, "allowed_outputs").includes("TECH_SPEC.yaml"), "design allowed outputs include TECH_SPEC");
  assert(extractBlock(designSection, "conditional_outputs").includes("TECH_SPEC.yaml"), "design conditional outputs missing TECH_SPEC");

  const artifacts = await read(join(root, ".openworkflow", "audit", "ARTIFACT_CONTRACTS.yaml"));
  assert(artifacts.includes("artifact_type: product_design"), "artifact contracts missing product_design");
  assert(artifacts.includes("artifact_type: production_spec"), "artifact contracts missing production_spec");
  assert(artifacts.includes("artifact_type: production_change"), "artifact contracts missing production_change");
  assert(artifacts.includes("artifact_type: team_runtime"), "artifact contracts missing team_runtime");
  assert(artifacts.includes("lazy_create: true"), "artifact contracts missing lazy_create markers");
  assert(artifacts.includes("summary_policy:"), "artifact contracts missing summary policy metadata");
  assert(artifacts.includes("SUMMARY.yaml"), "artifact contracts missing summary file paths");
  assert(artifacts.includes("template:"), "artifact contracts missing embedded templates");
  assert(artifacts.includes("conditional_packets:"), "artifact contracts missing conditional packets");
}

async function verifyTuneDecisionSurface(root: string): Promise<void> {
  const commandIndex = await read(join(root, ".openworkflow", "audit", "COMMAND_AUDIT_INDEX.yaml"));
  assert(commandIndex.includes("trigger: /ow:tune"), "command audit missing /ow:tune");
  assert(commandIndex.includes("visibility: internal"), "command audit missing internal command visibility");

  const protoSection = commandIndex.split("trigger: /ow:proto", 2)[1]?.split("  - id:", 1)[0] ?? "";
  const tuneSection = commandIndex.split("trigger: /ow:tune", 2)[1]?.split("  - id:", 1)[0] ?? "";
  const decisionSection = commandIndex.split("trigger: /ow:decision", 2)[1]?.split("  - id:", 1)[0] ?? "";
  const designSection = commandIndex.split("trigger: /ow:design", 2)[1]?.split("  - id:", 1)[0] ?? "";
  assert(!extractBlock(protoSection, "handoff_commands").includes("/ow:decision"), "proto exposes manual decision handoff");
  assert(!extractBlock(tuneSection, "handoff_commands").includes("/ow:decision"), "tune exposes manual decision handoff");
  assert(!extractBlock(designSection, "handoff_commands").includes("/ow:decision"), "design exposes manual decision handoff");
  assert(decisionSection.includes("visibility: internal"), "decision command is not internal");
  assert(extractBlock(tuneSection, "allowed_outputs").includes(".openworkflow/decisions/"), "tune cannot write decision audit");

  const contextPackets = await read(join(root, ".openworkflow", "audit", "CONTEXT_PACKETS.yaml"));
  const tunePacket = contextPackets.split("command: /ow:tune", 2)[1]?.split("  - packet_id:", 1)[0] ?? "";
  assert(!extractBlock(tunePacket, "required").includes("PROTOTYPE_INDEX.yaml"), "tune requires prototype index");
  assert(extractBlock(tunePacket, "optional").includes("PROTOTYPE_INDEX.yaml"), "tune optional context missing prototype index");

  const artifacts = await read(join(root, ".openworkflow", "audit", "ARTIFACT_CONTRACTS.yaml"));
  assert(artifacts.includes("revision_scope"), "decision artifact contracts missing revision_scope");
  for (const forbiddenPath of [
    ".openworkflow/vision",
    ".openworkflow/validation",
    ".openworkflow/prototypes",
    ".openworkflow/decisions",
    ".openworkflow/design",
    ".openworkflow/specs",
    ".openworkflow/changes",
    ".openworkflow/runtime",
  ]) {
    assert(!(await exists(join(root, forbiddenPath))), `init eagerly created stage path: ${forbiddenPath}`);
  }
}

async function verifyNoDefaultCodexCommands(root: string): Promise<void> {
  assert(!(await exists(join(root, ".codex", "commands", "ow"))), ".codex command references generated unexpectedly");
  assert(!(await exists(join(root, ".codex", "skills"))), ".codex skills generated unexpectedly");
}

function extractBlock(content: string, key: string): string {
  const marker = `${key}:`;
  if (content.includes(marker)) {
    const block: string[] = [];
    let collecting = false;
    for (const line of content.split("\n")) {
      if (line.trim() === marker) {
        collecting = true;
        continue;
      }
      if (collecting && line.startsWith("    ") && !line.startsWith("      ")) {
        break;
      }
      if (collecting) {
        block.push(line);
      }
    }
    return block.join("\n");
  }
  const openTag = `<${key}>`;
  const closeTag = `</${key}>`;
  if (content.includes(openTag) && content.includes(closeTag)) {
    return content.split(openTag, 2)[1]?.split(closeTag, 1)[0] ?? "";
  }
  return "";
}

async function collectPaths(root: string, kind: "file" | "directory"): Promise<string[]> {
  const found: string[] = [];
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      if (kind === "directory") {
        found.push(path);
      }
      found.push(...(await collectPaths(path, kind)));
    } else if (kind === "file" && entry.isFile()) {
      found.push(path);
    }
  }
  return found.sort();
}

async function read(path: string): Promise<string> {
  return readFile(path, "utf8");
}

async function assertFile(path: string): Promise<void> {
  const info = await stat(path);
  assert(info.isFile(), `missing file: ${path}`);
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function assertSetEqual(actual: Set<string>, expected: Set<string>, label: string): void {
  const actualList = [...actual].sort();
  const expectedList = [...expected].sort();
  assert(JSON.stringify(actualList) === JSON.stringify(expectedList), `${label}: ${actualList.join(", ")}`);
}

function record(value: unknown, label: string): Record<string, unknown> {
  assert(typeof value === "object" && value !== null && !Array.isArray(value), `${label} must be a record`);
  return value as Record<string, unknown>;
}

function parseJsonReport(output: string, command: string): Record<string, unknown> {
  const report = JSON.parse(output) as Record<string, unknown>;
  for (const key of ["schema_version", "command", "ok", "root", "data", "warnings", "errors", "effects", "next_actions"]) {
    assert(key in report, `${command} json missing envelope key ${key}`);
  }
  assert(report.command === command, `${command} json command mismatch`);
  assert(typeof report.ok === "boolean", `${command} json ok must be boolean`);
  assert(Array.isArray(report.warnings), `${command} json warnings must be array`);
  assert(Array.isArray(report.errors), `${command} json errors must be array`);
  assert(Array.isArray(report.next_actions), `${command} json next_actions must be array`);
  const effects = record(report.effects, `${command} effects`);
  for (const key of ["planned", "written", "updated", "removed", "skipped", "unchanged", "preserved", "migration_notes"]) {
    assert(Array.isArray(effects[key]), `${command} effects.${key} must be array`);
  }
  return report;
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
