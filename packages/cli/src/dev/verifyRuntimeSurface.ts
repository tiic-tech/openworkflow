#!/usr/bin/env node
import { mkdir, mkdtemp, readdir, readFile, rm, stat, unlink, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { parse as parseYaml } from "yaml";
import { commitSelectedChange, ensureLocalFeatBranch } from "../../../core/src/git/localGitAutomation.js";
import { generatePrReadySummary } from "../../../core/src/git/prReadySummary.js";

const CURRENT_FILE = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(dirname(CURRENT_FILE), "../../../..");
const CLI = join(REPO_ROOT, "dist", "cli", "src", "index.js");
const SKILL_NAMES = [
  "ow-workflow",
  "ow-context",
  "ow-vision",
  "ow-validation",
  "ow-vision2prompt",
  "ow-prompt2proto",
  "ow-proto",
  "ow-tune",
  "ow-decision",
  "ow-design",
  "ow-spec",
  "ow-change",
  "ow-team",
  "ow-decompose-to-changes",
  "ow-analyze-changes",
  "ow-select-change",
  "ow-git-automation",
] as const;

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
    await verifyStrategicPromptPackStressFixtures(target, env);
    await verifyRefinedPromptPackStressFixtures(target, env);
    await verifyDiscoveryLoopDogfoodFixture(target, env);
    await verifyNoDefaultCodexCommands(target);
    await verifyNonDestructiveSyncMigration(tempRoot, env);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }

  await verifyGeneratedSkillRepositoryValidation();
  await verifyGitGovernanceDogfoodFixtures();
  await verifyLocalFeatBranchAutomation();
  await verifySelectedChangeCommitAutomation();
  await verifyPrReadySummaryGeneration();
  await verifyGitAutomationManagedShell();
  await verifyPlanningArtifactRegistrationContract();
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

async function runInCwd(cwd: string, command: string[]): Promise<void> {
  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn(command[0] ?? "", command.slice(1), {
      cwd,
      env: process.env,
      stdio: "ignore",
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

async function runCaptureInCwd(cwd: string, command: string[]): Promise<string> {
  return new Promise<string>((resolvePromise, reject) => {
    let output = "";
    const child = spawn(command[0] ?? "", command.slice(1), {
      cwd,
      env: process.env,
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
    "ok:false",
    "openworkflow handoff --root . --json",
    "strict Agent trust gate",
    "handoff_quality_ok",
    "data.quality_summary",
    "quality_summary.status",
    ".openworkflow/CURRENT_STATE.yaml",
    "read_this_first",
    ".agents/skills/ow-*/SKILL.md",
    "openworkflow inspect --root . --json",
    "--strict",
    "openworkflow context --root . --json",
    "openworkflow context --root . --handoff --json",
    "--for /ow:<command>",
    "--max-bytes <n>",
    "openworkflow draft --root . --artifact <type> --id <id> --json",
    "openworkflow register --root . --artifact <path> --json",
    "openworkflow brief --root .",
    "openworkflow status --root .",
    "openworkflow check /ow:<command> --root . --json",
    "openworkflow summaries --root . --json",
    "draft/thin source quality return `ok:false`",
    "openworkflow summarize --root . --artifact <path> --json",
    "SUMMARY.yaml trust is checked by `summaries`, not by `validate`",
    "/ow:vision",
    "/ow:spec",
    "/ow:team",
    "/ow:decompose-to-changes",
    "/ow:analyze-changes",
    "/ow:select-change",
    "/ow:git-automation",
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
    "Doctor confirms managed surface health, not handoff quality",
    "data.handoff_quality_ok",
    "data.quality_summary",
    "context --root . --handoff --json",
    "Repo-local workflow commands are Agent skills",
    ".openworkflow/CURRENT_STATE.yaml",
    "/ow:vision",
    "/ow:team",
    "/ow:decompose-to-changes",
    "/ow:analyze-changes",
    "/ow:select-change",
    "/ow:git-automation",
    "Lazy creation boundary",
    "Sync safety",
    "status",
    "brief",
    "handoff",
    "Strict Agent trust gate",
    "inspect",
    "fail on current-but-thin summaries",
    "context",
    "Read-only packet materializer",
    "quality_summary",
    "--handoff",
    "--max-bytes",
    "--mode full",
    "draft",
    "contract-shaped source artifact",
    "register",
    "index registration",
    "check",
    "summaries",
    "--strict",
    "summarize",
    "pass --write to update summary files",
    "git-automation",
    "Managed git lifecycle shell",
    "SUMMARY.yaml freshness is checked by summaries",
    "requires an initialized .openworkflow root",
    "Every command supports --json",
    "schema_version, command, ok, root, data, warnings, errors",
    "health_errors",
    "When ok is false",
    "inspect --strict --json",
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
  parseJsonReport(await runCapture(["node", CLI, "handoff", "--root", root, "--json"], env), "handoff");
  const validateReport = parseJsonReport(await runCapture(["node", CLI, "validate", "--root", root, "--json"], env), "validate");
  const validateData = record(validateReport.data, "validate data");
  const validateScope = record(validateData.scope, "validate scope");
  assert(String(validateScope.summary_files).includes("summaries"), "validate scope missing summary boundary");
  parseJsonReport(await runCapture(["node", CLI, "clean", "--root", root, "--tools", "codex", "--json"], env), "clean");
  parseJsonReport(await runCapture(["node", CLI, "status", "--root", root, "--json"], env), "status");
  parseJsonReport(await runCapture(["node", CLI, "brief", "--root", root, "--json"], env), "brief");
  parseJsonReport(await runCapture(["node", CLI, "inspect", "--root", root, "--json"], env), "inspect");
  parseJsonReport(await runCapture(["node", CLI, "context", "--root", root, "--json"], env), "context");
  parseJsonReport(await runCapture(["node", CLI, "draft", "--root", root, "--artifact", "validation_target", "--id", "json-val", "--json"], env), "draft");
  const registerStatus = await runCaptureStatus(["node", CLI, "register", "--root", root, "--artifact", ".openworkflow/validation/json-val/VALIDATION.yaml", "--json"], env);
  assert(registerStatus.code !== 0, "register should fail clearly when artifact path is missing");
  parseJsonReport(registerStatus.output, "register");
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

  const contextUninitialized = await runCaptureStatus(["node", CLI, "context", "--root", missingRoot, "--json"], env);
  assert(contextUninitialized.code !== 0, "context should fail clearly outside an initialized OpenWorkflow root");
  const contextUninitializedReport = parseJsonReport(contextUninitialized.output, "context");
  assert(contextUninitializedReport.ok === false, "uninitialized context should not be ok");
  assert(Array.isArray(contextUninitializedReport.errors) && contextUninitializedReport.errors.some((item) => String(item).includes("missing OpenWorkflow context packets")), "uninitialized context missing explicit error");

  const draftUninitialized = await runCaptureStatus(["node", CLI, "draft", "--root", missingRoot, "--artifact", "validation_target", "--id", "val-1", "--json"], env);
  assert(draftUninitialized.code !== 0, "draft should fail clearly outside an initialized OpenWorkflow root");
  const draftUninitializedReport = parseJsonReport(draftUninitialized.output, "draft");
  assert(draftUninitializedReport.ok === false, "uninitialized draft should not be ok");
  assert(Array.isArray(draftUninitializedReport.errors) && draftUninitializedReport.errors.some((item) => String(item).includes("missing OpenWorkflow artifact contracts")), "uninitialized draft missing explicit error");

  const registerUninitialized = await runCaptureStatus(["node", CLI, "register", "--root", missingRoot, "--artifact", ".openworkflow/validation/val-1/VALIDATION.yaml", "--json"], env);
  assert(registerUninitialized.code !== 0, "register should fail clearly outside an initialized OpenWorkflow root");
  const registerUninitializedReport = parseJsonReport(registerUninitialized.output, "register");
  assert(registerUninitializedReport.ok === false, "uninitialized register should not be ok");

  const summaryBoundaryRoot = join(tempRoot, "summary-validate-boundary");
  await run(["node", CLI, "init", summaryBoundaryRoot, "--tools", "codex", "--force"], env);
  const summaryOnlyDir = join(summaryBoundaryRoot, ".openworkflow", "prototypes", "proto-summary-only");
  await mkdir(summaryOnlyDir, { recursive: true });
  await writeFile(join(summaryOnlyDir, "SUMMARY.yaml"), "artifact_type: prototype_summary\nsummary: Validate should not schema-check summary files.\n", "utf8");
  const validateBoundary = parseJsonReport(await runCapture(["node", CLI, "validate", "--root", summaryBoundaryRoot, "--json"], env), "validate");
  assert(validateBoundary.ok === true, "validate should not reject SUMMARY.yaml as an unknown source artifact");

  const draftRoot = join(tempRoot, "draft-command");
  await run(["node", CLI, "init", draftRoot, "--tools", "codex", "--force"], env);
  await verifyDraftCommand(draftRoot, env);
  await verifyRegisterCommand(draftRoot, env);

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
  const handoffFresh = parseJsonReport(await runCapture(["node", CLI, "handoff", "--root", root, "--json"], env), "handoff");
  const handoffFreshData = record(handoffFresh.data, "fresh handoff data");
  assert(handoffFresh.ok === true, "fresh handoff should pass");
  assert(handoffFreshData.handoff_ok === true, "fresh handoff should report handoff_ok=true");
  assert(handoffFreshData.managed_surface_ok === true, "fresh handoff should report managed_surface_ok=true");
  assert(handoffFreshData.adapter_ok === true, "fresh handoff should report adapter_ok=true");
  assert(handoffFreshData.summary_freshness_ok === true, "fresh handoff should report summary_freshness_ok=true");
  assert(handoffFreshData.summary_quality_ok === true, "fresh handoff should report summary_quality_ok=true");
  assert(handoffFreshData.next_command_ready === true, "fresh handoff should report next_command_ready=true");
  assert(Array.isArray(handoffFreshData.blocking_reasons) && handoffFreshData.blocking_reasons.length === 0, "fresh handoff should have no blockers");
  const handoffFreshQuality = record(handoffFreshData.quality_summary, "fresh handoff quality_summary");
  assert(handoffFreshQuality.status === "trusted", "fresh handoff quality_summary should be trusted");
  const handoffFreshReadOrder = record(handoffFreshData.read_order, "fresh handoff read_order");
  assert(Array.isArray(handoffFreshReadOrder.must_read) && handoffFreshReadOrder.must_read.includes(".openworkflow/CURRENT_STATE.yaml"), "fresh handoff read_order missing current state");
  const contextFresh = parseJsonReport(await runCapture(["node", CLI, "context", "--root", root, "--json"], env), "context");
  const contextFreshData = record(contextFresh.data, "context data");
  const contextFreshBudget = record(contextFreshData.budget, "context budget");
  assert(contextFresh.ok === true, "fresh context should be ok");
  assert(contextFreshData.mode === "compact", "fresh context should default to compact mode");
  assert(contextFreshData.handoff_mode === false, "fresh context should default handoff_mode=false");
  assert(contextFreshBudget.mode === "compact", "fresh context budget should report compact mode");
  assert(Number(contextFreshBudget.max_bytes) === 12000, "fresh compact context should use compact default budget");
  assert(contextFreshData.normalized_command === "/ow:vision", "fresh context should default to CURRENT_STATE.next_command");
  assert(contextFreshData.packet_id === "context:vision", "fresh context missing packet_id");
  assert(contextFreshData.handoff_quality_ok === true, "fresh context should report handoff_quality_ok=true");
  const contextFreshQuality = record(contextFreshData.quality_summary, "fresh context quality_summary");
  assert(contextFreshQuality.status === "trusted", "fresh context quality_summary should be trusted");
  assert(contextFreshQuality.freshness_ok === true, "fresh context quality_summary freshness should be ok");
  assert(contextFreshQuality.strict_quality_ok === true, "fresh context quality_summary strict quality should be ok");
  assert(contextFreshQuality.handoff_quality_ok === true, "fresh context quality_summary handoff quality should be ok");
  assert(Number(contextFreshQuality.health_error_count) === 0, "fresh context quality_summary should have no health errors");
  const contextFreshAudit = record(contextFreshData.command_audit, "fresh context command_audit");
  assert(contextFreshAudit.trigger === "/ow:vision", "fresh context command_audit should describe current command");
  assert(Array.isArray(contextFreshAudit.allowed_outputs) && contextFreshAudit.allowed_outputs.length > 0, "fresh context command_audit missing allowed outputs");
  assert(Number(contextFreshBudget.used_bytes) > 0, "fresh context should include content");
  assert(Array.isArray(contextFreshData.included) && contextFreshData.included.some((item) => record(item, "included context").path === ".openworkflow/CURRENT_STATE.yaml"), "fresh context missing CURRENT_STATE content");
  assert(Array.isArray(contextFreshData.included) && !contextFreshData.included.some((item) => record(item, "included context").path === ".openworkflow/audit/COMMAND_AUDIT_INDEX.yaml"), "compact context should not include full command audit source");
  assert(Array.isArray(contextFreshData.included) && !contextFreshData.included.some((item) => record(item, "included context").path === ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml"), "compact context should not include full artifact contracts source");
  assert(Array.isArray(contextFreshData.omitted) && contextFreshData.omitted.some((item) => record(item, "omitted context").path === ".openworkflow/audit/COMMAND_AUDIT_INDEX.yaml" && String(record(item, "omitted context").reason).includes("represented structurally")), "compact context should explain omitted command audit");
  assert(Array.isArray(contextFreshData.omitted) && contextFreshData.omitted.some((item) => record(item, "omitted context").path === ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml" && String(record(item, "omitted context").reason).includes("represented structurally")), "compact context should explain omitted artifact contracts");
  assert(Array.isArray(contextFreshData.omitted) && contextFreshData.omitted.some((item) => String(record(item, "omitted context").path).includes(".openworkflow/changes/**")), "fresh context should omit forbidden context");
  const handoffContextFresh = parseJsonReport(await runCapture(["node", CLI, "context", "--root", root, "--handoff", "--json"], env), "context");
  const handoffContextFreshData = record(handoffContextFresh.data, "fresh handoff context data");
  assert(handoffContextFresh.ok === true, "fresh context --handoff should pass");
  assert(handoffContextFreshData.handoff_mode === true, "fresh context --handoff should report handoff_mode=true");
  assert(handoffContextFreshData.handoff_quality_ok === true, "fresh context --handoff should report handoff_quality_ok=true");
  const fullContext = parseJsonReport(await runCapture(["node", CLI, "context", "--root", root, "--mode", "full", "--json"], env), "context");
  const fullContextData = record(fullContext.data, "full context data");
  const fullContextBudget = record(fullContextData.budget, "full context budget");
  assert(fullContextData.mode === "full", "full context should report full mode");
  assert(fullContextBudget.mode === "full", "full context budget should report full mode");
  assert(Number(fullContextBudget.max_bytes) === 24000, "full context should use full default budget");
  assert(Array.isArray(fullContextData.included) && fullContextData.included.some((item) => record(item, "included full context").path === ".openworkflow/audit/COMMAND_AUDIT_INDEX.yaml"), "full context should include command audit when budget allows");
  assert(Array.isArray(fullContextData.included) && fullContextData.included.some((item) => record(item, "included full context").path === ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml"), "full context should include artifact contracts when budget allows");
  const invalidMode = await runCaptureStatus(["node", CLI, "context", "--root", root, "--mode", "verbose", "--json"], env);
  assert(invalidMode.code !== 0, "context should reject invalid mode");
  const invalidModeReport = parseJsonReport(invalidMode.output, "context");
  assert(invalidModeReport.ok === false, "invalid context mode should return ok=false");
  await assertNoStageArtifacts(root);
  await verifyVisionSummaryQualityFixtures(root, env);

  const missingValidationCheck = await runCaptureStatus(["node", CLI, "check", "/ow:proto", "--root", root, "--json"], env);
  assert(missingValidationCheck.code !== 0, "proto check should block before auto validation writes an artifact");
  const missingValidationReport = parseJsonReport(missingValidationCheck.output, "check");
  const missingValidationData = record(missingValidationReport.data, "missing validation check data");
  const missingValidationSemantic = record(missingValidationData.semantic_readiness, "missing validation semantic readiness");
  assert(missingValidationSemantic.gate_status === "missing_validation", "proto check should expose missing_validation before auto validation");
  assert(Array.isArray(missingValidationReport.health_errors) && missingValidationReport.health_errors.some((item) => String(item).includes("auto-run /ow:validation")), "missing validation check should instruct auto validation");

  const summaryValidationPath = ".openworkflow/validation/summary-val/VALIDATION.yaml";
  await mkdir(join(root, ".openworkflow", "validation", "summary-val"), { recursive: true });
  await writeFile(join(root, summaryValidationPath), [
    "schema_version: 0.1.0",
    "contract_id: validation:summary-val",
    "contract_type: validation",
    "artifact_type: validation_target",
    "title: Summary fixture validation",
    "status: active",
    "trigger:",
    "  mode: user_explicit",
    "  requested_command: /ow:validation",
    "  reason: runtime_surface_summary_fixture",
    "core_question: Can prototype summary health remain advisory?",
    "central_uncertainty: Whether unrelated prototype summary health should block proto readiness.",
    "hypothesis: A ready validation target keeps missing prototype summaries advisory.",
    "target_behavior: Agent can distinguish validation readiness from prototype summary freshness.",
    "feature_classification:",
    "  existential:",
    "    - validation readiness",
    "  supporting: []",
    "  later: []",
    "  out_of_scope: []",
    "critical_assumptions:",
    "  - Validation exists before proto.",
    "prototype_scope:",
    "  include:",
    "    - summary health check",
    "  exclude: []",
    "prototype_experiment:",
    "  scenario: Agent checks /ow:proto with current validation set.",
    "  must_show:",
    "    - validation artifact is current",
    "  must_not_show:",
    "    - missing validation blocker",
    "observable_signals:",
    "  pass:",
    "    - check remains ready when only prototype summary is missing",
    "  fail:",
    "    - check reports missing_validation",
    "  ambiguous: []",
    "acceptance:",
    "  - prototype summary health is advisory",
    "decision_rules:",
    "  continue:",
    "    - ready_for_proto",
    "  revise:",
    "    - summary warning only",
    "  pivot: []",
    "  stop: []",
    "  needs_more_evidence: []",
    "decision_options:",
    "  - continue",
    "  - revise",
    "  - pivot",
    "  - stop",
    "  - needs_more_evidence",
    "vision_gaps: []",
    "agent_readiness_gate:",
    "  status: ready_for_proto",
    "  blockers: []",
    "  warnings: []",
    "  write_authority: /ow:validation",
    "",
  ].join("\n"), "utf8");
  parseJsonReport(await runCapture(["node", CLI, "register", "--root", root, "--artifact", summaryValidationPath, "--current", "--write", "--json"], env), "register");

  const artifactDir = join(root, ".openworkflow", "prototypes", "proto-1");
  await mkdir(artifactDir, { recursive: true });
  await writeFile(join(artifactDir, "EVIDENCE.yaml"), "artifact_type: prototype_evidence\ncore_question: Test\nresult: promising\nhandoff:\n  next_command: /ow:design\n", "utf8");
  const missingStatus = await runCaptureStatus(["node", CLI, "summaries", "--root", root, "--json"], env);
  assert(missingStatus.code !== 0, "summaries should exit nonzero when initialized summary health is not ok");
  const missing = parseJsonReport(missingStatus.output, "summaries");
  assert(missing.ok === false, "missing summary health should emit ok=false");
  assert(nonEmptyArray(missing.health_errors), "missing summary health should expose health_errors");
  const missingData = record(missing.data, "summary health data");
  const entries = missingData.entries;
  assert(Array.isArray(entries), "summary health entries must be array");
  assert(entries.some((entry) => record(entry, "summary entry").artifact_type === "prototype_evidence" && record(entry, "summary entry").status === "missing"), "summary health did not report missing prototype summary");
  const missingCheckStatus = await runCaptureStatus(["node", CLI, "check", "/ow:proto", "--root", root, "--json"], env);
  assert(missingCheckStatus.code === 0, "proto check should stay ready when only prototype summary health is missing");
  const missingCheck = parseJsonReport(missingCheckStatus.output, "check");
  assert(missingCheck.ok === true, "proto check should report ok=true when summary health is only advisory");
  assert(Array.isArray(missingCheck.warnings) && missingCheck.warnings.some((item) => String(item).includes("summary health for prototype_evidence")), "check warnings missing summary health promotion");
  assert(Array.isArray(missingCheck.health_errors) && missingCheck.health_errors.length === 0, "advisory proto check should not expose blocker health_errors");

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
  const currentPrototypeEntry = currentEntries.find((entry) => record(entry, "summary entry").artifact_type === "prototype_evidence");
  assert(currentPrototypeEntry !== undefined, "summary health missing prototype entry");
  const currentPrototypeItems = record(currentPrototypeEntry, "prototype summary entry").items;
  assert(Array.isArray(currentPrototypeItems), "prototype summary entry items must be array");
  const currentPrototypeItem = currentPrototypeItems.find((item) => record(item, "prototype summary item").artifact_path === ".openworkflow/prototypes/proto-1/EVIDENCE.yaml");
  assert(currentPrototypeItem !== undefined, "summary health missing prototype item");
  const currentPrototypeRecord = record(currentPrototypeItem, "prototype summary item");
  assert(currentPrototypeRecord.quality_status === "current_but_thin", "fresh thin prototype summary should report current_but_thin quality");
  assert(Array.isArray(currentPrototypeRecord.empty_key_fields) && currentPrototypeRecord.empty_key_fields.includes("prompt_pack_type"), "thin prototype summary should report empty key fields");
  assert(Array.isArray(currentPrototypeRecord.quality_warnings) && currentPrototypeRecord.quality_warnings.some((item) => String(item).includes("empty handoff fields")), "thin prototype summary should report quality warnings");
  assert(currentAfterWrite.ok === true, "current but thin summary should not fail freshness health");
  const strictSummaryStatus = await runCaptureStatus(["node", CLI, "summaries", "--root", root, "--strict", "--json"], env);
  assert(strictSummaryStatus.code !== 0, "summaries --strict should fail for current_but_thin quality");
  const strictSummary = parseJsonReport(strictSummaryStatus.output, "summaries");
  const strictSummaryData = record(strictSummary.data, "strict summary data");
  const strictQuality = record(strictSummaryData.strict_quality, "strict quality");
  assert(strictSummary.ok === false, "summaries --strict should report ok=false");
  assert(strictQuality.strict === true, "summaries --strict should report strict quality enabled");
  assert(strictQuality.ok === false, "summaries --strict should report strict quality failure");
  assert(nonEmptyArray(strictSummary.health_errors), "summaries --strict should expose quality health_errors");
  assert(Array.isArray(strictSummary.health_errors) && strictSummary.health_errors.some((item) => String(item).includes("summary quality prototype_evidence")), "summaries --strict health_errors should name prototype quality");
  const strictInspectStatus = await runCaptureStatus(["node", CLI, "inspect", "--root", root, "--strict", "--json"], env);
  assert(strictInspectStatus.code !== 0, "inspect --strict should fail for current_but_thin quality");
  const strictInspect = parseJsonReport(strictInspectStatus.output, "inspect");
  const strictInspectData = record(strictInspect.data, "strict inspect data");
  const inspectStrictQuality = record(strictInspectData.strict_quality, "inspect strict quality");
  assert(strictInspect.ok === false, "inspect --strict should report ok=false");
  assert(inspectStrictQuality.strict === true, "inspect --strict should report strict quality enabled");
  assert(nonEmptyArray(strictInspect.health_errors), "inspect --strict should expose quality health_errors");
  const doctorThin = parseJsonReport(await runCapture(["node", CLI, "doctor", "--root", root, "--tools", "codex", "--json"], env), "doctor");
  const doctorThinData = record(doctorThin.data, "doctor thin data");
  assert(doctorThin.ok === true, "doctor should keep ok=true for thin quality when managed surfaces are healthy");
  assert(doctorThinData.managed_surface_ok === true, "doctor should report managed_surface_ok=true");
  assert(doctorThinData.adapter_ok === true, "doctor should report adapter_ok=true");
  assert(doctorThinData.summary_freshness_ok === true, "doctor should report summary_freshness_ok=true for current summaries");
  assert(doctorThinData.handoff_quality_ok === false, "doctor should report handoff_quality_ok=false for thin summaries");
  const doctorThinQuality = record(doctorThinData.quality_summary, "doctor quality_summary");
  assert(doctorThinQuality.status === "current_but_thin", "doctor quality_summary should report current_but_thin");
  assert(doctorThinQuality.freshness_ok === true, "doctor quality_summary freshness should be ok for current summaries");
  assert(doctorThinQuality.strict_quality_ok === false, "doctor quality_summary strict quality should fail for thin summaries");
  assert(doctorThinQuality.handoff_quality_ok === false, "doctor quality_summary handoff quality should fail for thin summaries");
  assert(Number(doctorThinQuality.current_but_thin_count) > 0, "doctor quality_summary should count thin artifacts");
  assert(Number(doctorThinQuality.strict_quality_health_error_count) > 0, "doctor quality_summary should count strict quality errors");
  assert(Array.isArray(doctorThinQuality.next_actions) && doctorThinQuality.next_actions.some((item) => String(item).includes("summaries --root . --strict --json")), "doctor quality_summary should recommend strict summaries");
  assert(nonEmptyArray(record(doctorThinData.strict_quality, "doctor strict quality").health_errors), "doctor should include strict quality errors");
  assert(Array.isArray(doctorThin.next_actions) && doctorThin.next_actions.some((item) => String(item).includes("summaries --root . --strict --json")), "doctor should recommend summaries --strict for thin handoff quality");
  const defaultThinContext = parseJsonReport(await runCapture(["node", CLI, "context", "--root", root, "--json"], env), "context");
  const defaultThinContextData = record(defaultThinContext.data, "default thin context data");
  assert(defaultThinContext.ok === true, "default context should stay non-strict for thin handoff quality");
  assert(defaultThinContextData.handoff_mode === false, "default thin context should report handoff_mode=false");
  assert(defaultThinContextData.handoff_quality_ok === false, "default thin context should expose handoff_quality_ok=false");
  const handoffThinContextStatus = await runCaptureStatus(["node", CLI, "context", "--root", root, "--handoff", "--json"], env);
  assert(handoffThinContextStatus.code !== 0, "context --handoff should fail for current_but_thin quality");
  const handoffThinContext = parseJsonReport(handoffThinContextStatus.output, "context");
  const handoffThinContextData = record(handoffThinContext.data, "thin handoff context data");
  assert(handoffThinContext.ok === false, "thin context --handoff should report ok=false");
  assert(handoffThinContextData.handoff_mode === true, "thin context --handoff should report handoff_mode=true");
  assert(handoffThinContextData.handoff_quality_ok === false, "thin context --handoff should report handoff_quality_ok=false");
  assert(Array.isArray(handoffThinContext.health_errors) && handoffThinContext.health_errors.some((item) => String(item).includes("summary quality prototype_evidence")), "thin context --handoff should expose strict summary health errors");
  const handoffThinStatus = await runCaptureStatus(["node", CLI, "handoff", "--root", root, "--tools", "codex", "--json"], env);
  assert(handoffThinStatus.code !== 0, "handoff should fail for current_but_thin quality");
  const handoffThin = parseJsonReport(handoffThinStatus.output, "handoff");
  const handoffThinData = record(handoffThin.data, "thin handoff data");
  assert(handoffThin.ok === false, "thin handoff should report ok=false");
  assert(handoffThinData.handoff_ok === false, "thin handoff should report handoff_ok=false");
  assert(handoffThinData.summary_freshness_ok === true, "thin handoff should keep summary_freshness_ok=true");
  assert(handoffThinData.summary_quality_ok === false, "thin handoff should report summary_quality_ok=false");
  assert(handoffThinData.next_command_ready === true, "thin handoff should keep next_command_ready=true");
  const handoffThinQuality = record(handoffThinData.quality_summary, "thin handoff quality_summary");
  assert(handoffThinQuality.status === "current_but_thin", "thin handoff quality_summary should report current_but_thin");
  assert(nonEmptyArray(handoffThinData.blocking_reasons), "thin handoff should expose blocking_reasons");
  assert(Array.isArray(handoffThin.health_errors) && handoffThin.health_errors.some((item) => String(item).includes("summary quality prototype_evidence")), "thin handoff should expose strict summary health errors");
  const designContextStatus = await runCaptureStatus(["node", CLI, "context", "--root", root, "--for", "/ow:design", "--max-bytes", "12000", "--json"], env);
  assert(designContextStatus.code !== 0, "design context should return nonzero while readiness blockers exist");
  const designContext = parseJsonReport(designContextStatus.output, "context");
  const designContextData = record(designContext.data, "design context data");
  assert(designContext.ok === false, "blocked design context should report ok=false");
  assert(designContextData.handoff_quality_ok === false, "thin design context should expose handoff_quality_ok=false");
  const designContextQuality = record(designContextData.quality_summary, "design context quality_summary");
  assert(designContextQuality.status === "current_but_thin", "thin design context quality_summary should report current_but_thin");
  assert(Number(designContextQuality.health_error_count) > 0, "thin design context quality_summary should count quality errors");
  assert(nonEmptyArray(designContext.health_errors), "blocked context should expose health_errors");
  assert(Array.isArray(designContextData.included) && designContextData.included.some((item) => record(item, "included design context").source === "summary_file" && record(item, "included design context").path === ".openworkflow/prototypes/proto-1/SUMMARY.yaml"), "design context should include trusted prototype SUMMARY.yaml");

  const validationDir = join(root, ".openworkflow", "validation", "val-1");
  await mkdir(validationDir, { recursive: true });
  await writeFile(join(validationDir, "VALIDATION.yaml"), [
    "artifact_type: validation_target",
    "status: active",
    "title: Ready validation target",
    "trigger:",
    "  mode: user_explicit",
    "  requested_command: /ow:validation",
    "  reason: runtime_surface_fixture",
    "core_question: Test",
    "central_uncertainty: Whether the prototype target is specific enough.",
    "hypothesis: A concrete target lets agents produce useful prototype prompts.",
    "target_behavior: Agent can identify the prototype experiment without guessing.",
    "feature_classification:",
    "  existential:",
    "    - prototype target",
    "  supporting: []",
    "  later: []",
    "  out_of_scope: []",
    "critical_assumptions:",
    "  - Validation can be read as an experiment brief.",
    "prototype_scope:",
    "  include:",
    "    - demo",
    "  exclude: []",
    "prototype_experiment:",
    "  scenario: Agent reviews a validation target before /ow:proto.",
    "  must_show:",
    "    - central uncertainty",
    "  must_not_show:",
    "    - silent validation artifact writes",
    "observable_signals:",
    "  pass:",
    "    - agent reports ready_for_proto",
    "  fail:",
    "    - agent reports thin_validation",
    "  ambiguous: []",
    "acceptance:",
    "  - works",
    "decision_rules:",
    "  continue:",
    "    - ready_for_proto",
    "  revise:",
    "    - thin_validation",
    "  pivot: []",
    "  stop: []",
    "  needs_more_evidence: []",
    "decision_options:",
    "  - continue",
    "  - revise",
    "  - pivot",
    "  - stop",
    "  - needs_more_evidence",
    "vision_gaps: []",
    "agent_readiness_gate:",
    "  status: ready_for_proto",
    "  blockers: []",
    "  warnings: []",
    "  write_authority: /ow:validation",
    "",
  ].join("\n"), "utf8");
  const missingSlice = parseJsonReport(await runCapture(["node", CLI, "summaries", "--root", root, "--json"], env), "summaries");
  const missingSliceEntries = record(missingSlice.data, "summary health data").entries;
  assert(Array.isArray(missingSliceEntries), "summary health entries must be array");
  assert(missingSliceEntries.some((entry) => record(entry, "summary entry").artifact_type === "validation_target" && record(entry, "summary entry").status === "current"), "summary health did not report current validation current_slice");
  const protoContextStatus = await runCaptureStatus(["node", CLI, "context", "--root", root, "--for", "/ow:proto", "--json"], env);
  assert(protoContextStatus.code === 0, "proto context should stay ready when current validation pointer is set");
  const protoContext = parseJsonReport(protoContextStatus.output, "context");
  const protoContextData = record(protoContext.data, "proto context data");
  assert(Array.isArray(protoContextData.included) && protoContextData.included.some((item) => record(item, "included proto context").source === "current_slice" && record(item, "included proto context").path === ".openworkflow/validation/val-1/VALIDATION.yaml"), "proto context should include validation current_slice");

  const summaryPath = join(artifactDir, "SUMMARY.yaml");
  const old = new Date(0);
  await utimes(summaryPath, old, old);
  const staleStatus = await runCaptureStatus(["node", CLI, "summaries", "--root", root, "--json"], env);
  assert(staleStatus.code !== 0, "summaries should exit nonzero for stale summaries");
  const stale = parseJsonReport(staleStatus.output, "summaries");
  assert(stale.ok === false, "stale summaries should emit ok=false");
  assert(nonEmptyArray(stale.health_errors), "stale summary health should expose health_errors");
  const staleEntries = record(stale.data, "summary health data").entries;
  assert(Array.isArray(staleEntries), "summary health entries must be array");
  assert(staleEntries.some((entry) => record(entry, "summary entry").artifact_type === "prototype_evidence" && record(entry, "summary entry").status === "stale_unknown"), "summary health did not report stale prototype summary");
  const allWrite = parseJsonReport(await runCapture(["node", CLI, "summarize", "--root", root, "--all", "--write", "--json"], env), "summarize");
  const allEffects = record(allWrite.effects, "summarize all effects");
  assert(Array.isArray(allEffects.written) && allEffects.written.includes(".openworkflow/prototypes/proto-1/SUMMARY.yaml"), "summarize --all --write did not refresh stale summary");
  const incompleteValidationDir = join(root, ".openworkflow", "validation", "val-missing");
  await mkdir(incompleteValidationDir, { recursive: true });
  await writeFile(join(incompleteValidationDir, "VALIDATION.yaml"), "artifact_type: validation_target\ncore_question: Incomplete\n", "utf8");

  const briefStatus = await runCaptureStatus(["node", CLI, "brief", "--root", root, "--json"], env);
  assert(briefStatus.code !== 0, "brief should exit nonzero when top-level ok=false");
  const brief = parseJsonReport(briefStatus.output, "brief");
  const briefData = record(brief.data, "brief data");
  const briefHealth = record(briefData.health, "brief health");
  assert("summaries" in briefHealth, "brief health missing summaries");
  assert(brief.ok === false, "brief top-level ok should include failing summary health");
  assert(briefHealth.ok === false, "brief health.ok should include failing summary health");
  assert(nonEmptyArray(brief.health_errors), "brief should expose health_errors when health fails");

  const statusStatus = await runCaptureStatus(["node", CLI, "status", "--root", root, "--json"], env);
  assert(statusStatus.code !== 0, "status should exit nonzero when top-level ok=false");
  const statusReport = parseJsonReport(statusStatus.output, "status");
  assert(statusReport.ok === false, "status top-level ok should include failing summary health");
  assert(nonEmptyArray(statusReport.health_errors), "status should expose health_errors when health fails");

  const inspectStatus = await runCaptureStatus(["node", CLI, "inspect", "--root", root, "--json"], env);
  assert(inspectStatus.code !== 0, "inspect should exit nonzero when top-level ok=false");
  const inspect = parseJsonReport(inspectStatus.output, "inspect");
  const inspectData = record(inspect.data, "inspect data");
  const inspectHealth = record(inspectData.health, "inspect health");
  assert(inspect.ok === false, "inspect top-level ok should include failing summary health");
  assert(inspectHealth.ok === false, "inspect health.ok should include failing summary health");
  assert(nonEmptyArray(inspect.health_errors), "inspect should expose health_errors when health fails");

  const checkStatus = await runCaptureStatus(["node", CLI, "check", "/ow:proto", "--root", root, "--json"], env);
  assert(checkStatus.code === 0, "proto check should stay ready after current validation is registered");
  const check = parseJsonReport(checkStatus.output, "check");
  const checkData = record(check.data, "check data");
  assert(check.ok === true, "proto check should report ok=true after current validation is registered");
  assert("summary_guidance" in checkData, "check output missing summary_guidance");

}

async function verifyVisionSummaryQualityFixtures(root: string, env: NodeJS.ProcessEnv): Promise<void> {
  const sessionsRoot = join(root, ".openworkflow", "vision", "sessions");
  const thinDir = join(sessionsRoot, "vision-thin");
  const blockedDir = join(sessionsRoot, "vision-blocked");
  const readyDir = join(sessionsRoot, "vision-ready");
  await mkdir(thinDir, { recursive: true });
  await mkdir(blockedDir, { recursive: true });
  await mkdir(readyDir, { recursive: true });

  await writeFile(join(thinDir, "VISION_SESSION.yaml"), visionSessionYaml({
    id: "vision-thin",
    status: "draft",
    oneSentence: "A thin interview snapshot that should not be compiled.",
    protoStatus: "missing",
    full: false,
  }), "utf8");
  await writeFile(join(blockedDir, "VISION_SESSION.yaml"), visionSessionYaml({
    id: "vision-blocked",
    status: "active",
    oneSentence: "A blocked vision with explicit proto-readiness blockers.",
    protoStatus: "blocked",
    full: true,
  }), "utf8");
  await writeFile(join(readyDir, "VISION_SESSION.yaml"), visionSessionYaml({
    id: "vision-ready",
    status: "active",
    oneSentence: "A proto-ready vision with enough strategy for prompt generation.",
    protoStatus: "ready",
    full: true,
  }), "utf8");

  const report = parseJsonReport(await runCapture(["node", CLI, "summaries", "--root", root, "--json"], env), "summaries");
  assert(report.ok === true, "vision current_slice summary health should stay freshness-ok");
  const entries = record(report.data, "vision summaries data").entries;
  assert(Array.isArray(entries), "vision summaries entries must be array");
  const visionEntry = entries.find((entry) => record(entry, "summary entry").artifact_type === "vision_session");
  assert(visionEntry !== undefined, "summary health missing vision_session entry");
  const visionItems = record(visionEntry, "vision summary entry").items;
  assert(Array.isArray(visionItems), "vision summary entry items must be array");

  const thin = summaryItemFor(visionItems, ".openworkflow/vision/sessions/vision-thin/VISION_SESSION.yaml");
  assert(thin.status === "current", "thin vision fixture should keep current_slice current");
  assert(thin.quality_status === "current_but_thin", "thin vision fixture should be current_but_thin");
  assert(Array.isArray(thin.empty_key_fields) && thin.empty_key_fields.includes("strategic_core.target_user"), "thin vision fixture should report missing strategic_core fields");
  assert(Array.isArray(thin.quality_warnings) && thin.quality_warnings.some((item) => String(item).includes("proto_readiness.status is not ready") && String(item).includes("missing")), "thin vision fixture should warn about missing proto-readiness");

  const blocked = summaryItemFor(visionItems, ".openworkflow/vision/sessions/vision-blocked/VISION_SESSION.yaml");
  assert(blocked.status === "current", "blocked vision fixture should keep current_slice current");
  assert(blocked.quality_status === "current_but_thin", "blocked vision fixture should be current_but_thin");
  assert(Array.isArray(blocked.empty_key_fields) && blocked.empty_key_fields.length === 0, "blocked vision fixture should be blocked by readiness, not empty fields");
  assert(Array.isArray(blocked.quality_warnings) && blocked.quality_warnings.some((item) => String(item).includes("proto_readiness.status is not ready") && String(item).includes("blocked")), "blocked vision fixture should warn about blocked proto-readiness");

  const ready = summaryItemFor(visionItems, ".openworkflow/vision/sessions/vision-ready/VISION_SESSION.yaml");
  assert(ready.status === "current", "ready vision fixture should keep current_slice current");
  assert(ready.quality_status === "usable", "ready vision fixture should be usable");
  assert(Array.isArray(ready.empty_key_fields) && ready.empty_key_fields.length === 0, "ready vision fixture should not have empty key fields");
  assert(Array.isArray(ready.quality_warnings) && ready.quality_warnings.length === 0, "ready vision fixture should not report quality warnings");

  const strict = await runCaptureStatus(["node", CLI, "summaries", "--root", root, "--strict", "--json"], env);
  assert(strict.code !== 0, "summaries --strict should fail when vision has thin or blocked proto-readiness");
  const strictReport = parseJsonReport(strict.output, "summaries");
  assert(Array.isArray(strictReport.health_errors) && strictReport.health_errors.some((item) => String(item).includes("summary quality vision_session")), "strict summaries should name vision_session quality errors");
}

function summaryItemFor(items: unknown[], artifactPath: string): Record<string, unknown> {
  const item = items.find((candidate) => record(candidate, "summary item").artifact_path === artifactPath);
  assert(item !== undefined, `missing summary item for ${artifactPath}`);
  return record(item, "summary item");
}

function visionSessionYaml(input: {
  id: string;
  status: string;
  oneSentence: string;
  protoStatus: "missing" | "blocked" | "ready";
  full: boolean;
}): string {
  const strategicCore = input.full
    ? `strategic_core:
  target_user: "Time-constrained product founders"
  context: "They are shaping an AI-native workflow before implementation"
  current_alternative: "Unstructured chat prompts and scattered notes"
  pain: "Weak product intent creates expensive downstream implementation churn"
  desired_behavior_change: "Slow down just enough to clarify product truth before generation"
  core_mechanism: "Conversation-first interrogation followed by structured compile"
  core_differentiator: "Proto-readiness is treated as a vision acceptance gate"
  strongest_success_signal: "A low-context Agent can generate strong prototype directions without inventing strategy"
  failure_signals:
    - "The Agent has to invent the target user"
`
    : "";
  const productSystemSeed = input.full
    ? `product_system_seed:
  product_thesis: "Vision quality determines downstream generation quality"
  primary_loop:
    - "interview"
    - "checkpoint"
    - "compile"
  interaction_model: "One focused question at a time"
  feature_system:
    - "coverage tracking"
    - "proto-readiness gate"
  emotional_value: "The human feels deeply understood without file-write interruptions"
  functional_value: "The Agent receives structured strategy before prototype prompt generation"
  trust_boundary: "Do not write durable artifacts after every answer"
  privacy_boundary: "Keep raw brainstorming out of stable truth until checkpoint"
  anti_goals:
    - "fixed small question count"
  future_opportunities:
    - "discovery-loop E2E fixture"
`
    : "";
  const protoReadiness = input.full
    ? `proto_readiness:
  status: ${input.protoStatus}
  missing_for_proto:
    - ${input.protoStatus === "blocked" ? "\"benchmark audience is conflicted\"" : "\"none\""}
  prototype_direction_seeds:
    - "conversation-first interview workspace"
    - "proto-readiness dashboard"
  prompt_constraints:
    - "Do not invent product strategy"
    - "Show trust and checkpoint controls"
  validation_target: "Can the compiled vision drive distinct prototype prompts?"
  downstream_notes:
    - "Hand off to /ow:proto only when ready"
`
    : `proto_readiness:
  status: ${input.protoStatus}
  missing_for_proto:
    - "strategic core"
  prototype_direction_seeds: []
  prompt_constraints: []
  validation_target: ""
  downstream_notes: []
`;
  return `schema_version: 0.1.0
contract_id: vision:${input.id}
contract_type: vision
artifact_type: vision_session
title: "${input.id}"
status: ${input.status}
current_question: ""
stable_answers:
  - "Vision should remain conversational until compile readiness."
unresolved_questions:
  - "What prototype directions are strongest?"
vision_delta:
  one_sentence: "${input.oneSentence}"
  problem: "Current vision discovery can compile too early."
  goals:
    - "Protect delayed compile"
  non_goals:
    - "Generate prototype prompts inside vision"
  users:
    - "AI Agents consuming OpenWorkflow artifacts"
  quality_bar:
    - "Proto can consume the output without inventing strategy"
  ai_native_role: "Product partner and intent compiler"
  success_signals:
    - "Low-context handoff is usable"
  failure_signals:
    - "The Agent invents core strategy"
${strategicCore}${productSystemSeed}${protoReadiness}coverage:
  proto_readiness:
    status: ${input.protoStatus === "ready" ? "solid" : "thin"}
    evidence:
      - "runtime fixture"
    follow_up_question: ""
handoff:
  ready: ${input.protoStatus === "ready" ? "true" : "false"}
  next_command: ${input.protoStatus === "ready" ? "/ow:validation" : "null"}
  blockers:
    - ${input.protoStatus === "ready" ? "\"\"" : "\"proto-readiness is not ready\""}
  readiness_notes:
    - "runtime fixture"
updated_at: null
`;
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

async function verifyDraftCommand(root: string, env: NodeJS.ProcessEnv): Promise<void> {
  const currentStateBefore = await read(join(root, ".openworkflow", "CURRENT_STATE.yaml"));
  const dryRun = parseJsonReport(await runCapture(["node", CLI, "draft", "--root", root, "--artifact", "validation_target", "--id", "val-draft", "--json"], env), "draft");
  const dryData = record(dryRun.data, "draft dry-run data");
  const dryEffects = record(dryRun.effects, "draft dry-run effects");
  assert(dryRun.ok === true, "draft dry-run should be ok");
  assert(dryData.path === ".openworkflow/validation/val-draft/VALIDATION.yaml", "draft dry-run path mismatch");
  assert(String(dryData.content).includes("contract_id: validation:val-draft"), "draft dry-run content did not replace id");
  assert(Array.isArray(dryEffects.planned) && dryEffects.planned.includes(".openworkflow/validation/val-draft/VALIDATION.yaml"), "draft dry-run missing planned effect");
  assert(!(await exists(join(root, ".openworkflow", "validation"))), "draft dry-run created validation directory");

  const invalidId = await runCaptureStatus(["node", CLI, "draft", "--root", root, "--artifact", "validation_target", "--id", "../bad", "--json"], env);
  assert(invalidId.code !== 0, "draft should reject unsafe ids");
  const invalidIdReport = parseJsonReport(invalidId.output, "draft");
  assert(invalidIdReport.ok === false, "draft invalid id should report ok=false");

  const invalidArtifact = await runCaptureStatus(["node", CLI, "draft", "--root", root, "--artifact", "unknown_artifact", "--id", "x1", "--json"], env);
  assert(invalidArtifact.code !== 0, "draft should reject unknown artifact types");
  const invalidArtifactReport = parseJsonReport(invalidArtifact.output, "draft");
  assert(invalidArtifactReport.ok === false, "draft unknown artifact should report ok=false");

  const writeRun = parseJsonReport(await runCapture(["node", CLI, "draft", "--root", root, "--artifact", "validation_target", "--id", "val-draft", "--write", "--json"], env), "draft");
  const writeEffects = record(writeRun.effects, "draft write effects");
  assert(writeRun.ok === true, "draft write should be ok");
  assert(Array.isArray(writeEffects.written) && writeEffects.written.includes(".openworkflow/validation/val-draft/VALIDATION.yaml"), "draft write missing written effect");
  await assertFile(join(root, ".openworkflow", "validation", "val-draft", "VALIDATION.yaml"));
  assert(!(await exists(join(root, ".openworkflow", "validation", "VALIDATION_INDEX.yaml"))), "draft created validation index unexpectedly");
  assert(!(await exists(join(root, ".openworkflow", "validation", "val-draft", "NOTE.md"))), "draft created note unexpectedly");
  assert((await read(join(root, ".openworkflow", "CURRENT_STATE.yaml"))) === currentStateBefore, "draft modified CURRENT_STATE.yaml");

  const duplicate = await runCaptureStatus(["node", CLI, "draft", "--root", root, "--artifact", "validation_target", "--id", "val-draft", "--write", "--json"], env);
  assert(duplicate.code !== 0, "draft duplicate write should fail without force");
  const duplicateReport = parseJsonReport(duplicate.output, "draft");
  assert(duplicateReport.ok === false, "draft duplicate write should report ok=false");
  assert(Array.isArray(duplicateReport.errors) && duplicateReport.errors.some((item) => String(item).includes("artifact already exists")), "draft duplicate missing explicit error");

  const force = parseJsonReport(await runCapture(["node", CLI, "draft", "--root", root, "--artifact", "validation_target", "--id", "val-draft", "--write", "--force", "--json"], env), "draft");
  const forceEffects = record(force.effects, "draft force effects");
  assert(force.ok === true, "draft force write should be ok");
  assert(Array.isArray(forceEffects.updated) && forceEffects.updated.includes(".openworkflow/validation/val-draft/VALIDATION.yaml"), "draft force write missing updated effect");
}

async function verifyRegisterCommand(root: string, env: NodeJS.ProcessEnv): Promise<void> {
  const currentStateBefore = await read(join(root, ".openworkflow", "CURRENT_STATE.yaml"));
  const artifactPath = ".openworkflow/validation/val-draft/VALIDATION.yaml";
  const dryRun = parseJsonReport(await runCapture(["node", CLI, "register", "--root", root, "--artifact", artifactPath, "--json"], env), "register");
  const dryData = record(dryRun.data, "register dry-run data");
  const dryEffects = record(dryRun.effects, "register dry-run effects");
  assert(dryRun.ok === true, "register dry-run should be ok");
  assert(dryData.index_path === ".openworkflow/validation/VALIDATION_INDEX.yaml", "register dry-run index path mismatch");
  assert(Array.isArray(dryEffects.planned) && dryEffects.planned.includes(".openworkflow/validation/VALIDATION_INDEX.yaml"), "register dry-run missing planned index");
  assert(!(await exists(join(root, ".openworkflow", "validation", "VALIDATION_INDEX.yaml"))), "register dry-run wrote index");

  const writeRun = parseJsonReport(await runCapture(["node", CLI, "register", "--root", root, "--artifact", artifactPath, "--write", "--json"], env), "register");
  const writeEffects = record(writeRun.effects, "register write effects");
  assert(writeRun.ok === true, "register write should be ok");
  assert(Array.isArray(writeEffects.written) && writeEffects.written.includes(".openworkflow/validation/VALIDATION_INDEX.yaml"), "register write missing written index");
  const indexPath = join(root, ".openworkflow", "validation", "VALIDATION_INDEX.yaml");
  await assertFile(indexPath);
  const index = await read(indexPath);
  assert(index.includes("validation_id: val-draft"), "register index missing validation entry");
  assert(index.includes(`path: ${artifactPath}`), "register index missing artifact path");
  assert((await read(join(root, ".openworkflow", "CURRENT_STATE.yaml"))) === currentStateBefore, "register without --current modified CURRENT_STATE.yaml");

  const duplicate = parseJsonReport(await runCapture(["node", CLI, "register", "--root", root, "--artifact", artifactPath, "--write", "--json"], env), "register");
  const duplicateEffects = record(duplicate.effects, "register duplicate effects");
  assert(Array.isArray(duplicateEffects.updated) && duplicateEffects.updated.includes(".openworkflow/validation/VALIDATION_INDEX.yaml"), "register duplicate should update index");
  const duplicateIndex = await read(indexPath);
  assert(duplicateIndex.indexOf("validation_id: val-draft") === duplicateIndex.lastIndexOf("validation_id: val-draft"), "register duplicate appended duplicate entry");

  const currentRun = parseJsonReport(await runCapture(["node", CLI, "register", "--root", root, "--artifact", artifactPath, "--current", "--next-command", "/ow:proto", "--write", "--json"], env), "register");
  const currentEffects = record(currentRun.effects, "register current effects");
  assert(Array.isArray(currentEffects.updated) && currentEffects.updated.includes(".openworkflow/CURRENT_STATE.yaml"), "register current missing current state update");
  const currentState = await read(join(root, ".openworkflow", "CURRENT_STATE.yaml"));
  assert(currentState.includes("active_stage: validation"), "register current did not update active_stage");
  assert(currentState.includes(`current_validation: ${artifactPath}`), "register current did not update current pointer");
  assert(currentState.includes("next_command: /ow:proto"), "register current did not update next command");
  const currentIndex = await read(indexPath);
  assert(currentIndex.includes("current_validation: val-draft"), "register current did not update index pointer");

  const draftProtoCheck = await runCaptureStatus(["node", CLI, "check", "/ow:proto", "--root", root, "--json"], env);
  assert(draftProtoCheck.code !== 0, "proto check should block when optional current validation is still a draft scaffold");
  const draftProtoReport = parseJsonReport(draftProtoCheck.output, "check");
  const draftProtoData = record(draftProtoReport.data, "draft proto check data");
  assert(draftProtoReport.ok === false, "draft optional current validation should make proto check ok=false");
  assert(Array.isArray(draftProtoData.blockers) && draftProtoData.blockers.some((item) => String(item).includes("status must be beyond draft")), "proto check missing draft status blocker");
  assert(Array.isArray(draftProtoData.blockers) && draftProtoData.blockers.some((item) => String(item).includes("core_question must be non-empty")), "proto check missing core_question readiness blocker");
  const draftSemanticReadiness = record(draftProtoData.semantic_readiness, "draft proto semantic readiness");
  assert(draftSemanticReadiness.gate_status === "thin_validation", "draft proto check should expose thin_validation semantic readiness");

  await writeFile(join(root, artifactPath), [
    "schema_version: 0.1.0",
    "contract_id: validation:val-draft",
    "contract_type: validation",
    "artifact_type: validation_target",
    "title: Vision gap validation target",
    "status: active",
    "trigger:",
    "  mode: agent_auto",
    "  requested_command: /ow:proto",
    "  reason: missing_current_validation",
    "core_question: Can the prototype proceed without more vision detail?",
    "central_uncertainty: Whether the missing user context would force strategy invention.",
    "hypothesis: The prototype should not proceed until the vision gap is resolved.",
    "target_behavior: Agent returns to /ow:vision instead of generating prototype prompts.",
    "feature_classification:",
    "  existential:",
    "    - missing vision strategy",
    "  supporting: []",
    "  later: []",
    "  out_of_scope: []",
    "critical_assumptions:",
    "  - The missing context changes the prototype direction.",
    "prototype_scope:",
    "  include:",
    "    - Return-to-vision gate.",
    "  exclude:",
    "    - Prototype prompt generation.",
    "prototype_experiment:",
    "  scenario: Agent checks validation before /ow:proto.",
    "  must_show:",
    "    - Missing vision gap is explicit.",
    "  must_not_show:",
    "    - Prototype prompt generation.",
    "observable_signals:",
    "  pass:",
    "    - /ow:proto check blocks and points back to /ow:vision.",
    "  fail:",
    "    - /ow:proto proceeds despite vision gaps.",
    "  ambiguous: []",
    "acceptance:",
    "  - Agent does not invent product strategy.",
    "decision_rules:",
    "  continue: []",
    "  revise:",
    "    - Ask the next vision question.",
    "  pivot: []",
    "  stop: []",
    "  needs_more_evidence:",
    "    - Vision gap must be resolved.",
    "decision_options:",
    "  - continue",
    "  - revise",
    "  - pivot",
    "  - stop",
    "  - needs_more_evidence",
    "vision_gaps:",
    "  - target user context is unresolved",
    "agent_readiness_gate:",
    "  status: return_to_vision",
    "  blockers:",
    "    - target user context is unresolved",
    "  warnings: []",
    "  write_authority: /ow:validation",
    "",
  ].join("\n"), "utf8");
  const blockedProtoCheck = await runCaptureStatus(["node", CLI, "check", "/ow:proto", "--root", root, "--json"], env);
  assert(blockedProtoCheck.code !== 0, "proto check should block when validation returns to vision");
  const blockedProtoReport = parseJsonReport(blockedProtoCheck.output, "check");
  const blockedProtoData = record(blockedProtoReport.data, "blocked proto check data");
  const blockedSemanticReadiness = record(blockedProtoData.semantic_readiness, "blocked proto semantic readiness");
  assert(blockedSemanticReadiness.gate_status === "return_to_vision", "blocked proto check should expose return_to_vision semantic readiness");
  assert(Array.isArray(blockedProtoData.blockers) && blockedProtoData.blockers.some((item) => String(item).includes("run /ow:vision")), "return-to-vision fixture should tell the agent to run /ow:vision");

  await writeFile(join(root, artifactPath), [
    "schema_version: 0.1.0",
    "contract_id: validation:val-draft",
    "contract_type: validation",
    "artifact_type: validation_target",
    "title: Filled validation target",
    "status: active",
    "trigger:",
    "  mode: agent_auto",
    "  requested_command: /ow:proto",
    "  reason: missing_current_validation",
    "core_question: Does the first prototype answer the core workflow risk?",
    "central_uncertainty: Whether agents can consume validation without inventing the prototype target.",
    "hypothesis: A focused validation target lets /ow:proto generate useful prototype directions.",
    "target_behavior: The agent starts /ow:proto with a concrete experiment brief.",
    "feature_classification:",
    "  existential:",
    "    - agent readiness",
    "  supporting: []",
    "  later: []",
    "  out_of_scope: []",
    "critical_assumptions:",
    "  - Agents need a concrete validation scope.",
    "prototype_scope:",
    "  include:",
    "    - Build the smallest checkable readiness flow.",
    "  exclude: []",
    "prototype_experiment:",
    "  scenario: Agent runs /ow:proto after a validation target has been registered.",
    "  must_show:",
    "    - Central uncertainty is named before prompt generation.",
    "    - Observable evidence rules constrain prototype directions.",
    "  must_not_show:",
    "    - Agent silently creates validation artifacts while running /ow:proto.",
    "observable_signals:",
    "  pass:",
    "    - /ow:proto check reports ready_for_proto.",
    "  fail:",
    "    - /ow:proto must infer the missing experiment target.",
    "  ambiguous:",
    "    - Validation has a question but no observable behavior.",
    "acceptance:",
    "  - Agent can start /ow:proto without guessing the validation target.",
    "decision_rules:",
    "  continue:",
    "    - Ready gate passes with no blockers.",
    "  revise:",
    "    - Experiment fields are present but too broad.",
    "  pivot:",
    "    - The prototype target no longer matches the vision.",
    "  stop:",
    "    - The validation target disproves the vision thesis.",
    "  needs_more_evidence:",
    "    - Evidence is observable but inconclusive.",
    "decision_options:",
    "  - continue",
    "  - revise",
    "  - pivot",
    "  - stop",
    "  - needs_more_evidence",
    "vision_gaps: []",
    "agent_readiness_gate:",
    "  status: ready_for_proto",
    "  blockers: []",
    "  warnings: []",
    "  write_authority: /ow:validation",
    "",
  ].join("\n"), "utf8");
  const filledProtoCheck = parseJsonReport(await runCapture(["node", CLI, "check", "/ow:proto", "--root", root, "--json"], env), "check");
  const filledProtoData = record(filledProtoCheck.data, "filled proto check data");
  assert(filledProtoCheck.ok === true, "filled current validation should make proto check ok=true");
  assert(Array.isArray(filledProtoData.blockers) && filledProtoData.blockers.length === 0, "filled proto check should have no blockers");
  const filledSemanticReadiness = record(filledProtoData.semantic_readiness, "filled proto semantic readiness");
  assert(filledSemanticReadiness.gate_status === "ready_for_proto", "filled proto check should expose ready_for_proto semantic readiness");

  const nextWithoutCurrent = await runCaptureStatus(["node", CLI, "register", "--root", root, "--artifact", artifactPath, "--next-command", "/ow:proto", "--json"], env);
  assert(nextWithoutCurrent.code !== 0, "register should reject --next-command without --current");
  const nextWithoutCurrentReport = parseJsonReport(nextWithoutCurrent.output, "register");
  assert(nextWithoutCurrentReport.ok === false, "register --next-command without current should report ok=false");

  const invalidPath = await runCaptureStatus(["node", CLI, "register", "--root", root, "--artifact", ".openworkflow/validation/val-draft/NOTE.md", "--json"], env);
  assert(invalidPath.code !== 0, "register should reject non-source artifact paths");
  const invalidPathReport = parseJsonReport(invalidPath.output, "register");
  assert(invalidPathReport.ok === false, "register invalid path should report ok=false");

  const mismatchPath = join(root, ".openworkflow", "validation", "val-mismatch", "VALIDATION.yaml");
  await mkdir(dirname(mismatchPath), { recursive: true });
  await writeFile(mismatchPath, "schema_version: 0.1.0\ncontract_id: validation:val-mismatch\ncontract_type: validation\nartifact_type: prototype_evidence\ntitle: mismatch\nstatus: draft\n", "utf8");
  const mismatch = await runCaptureStatus(["node", CLI, "register", "--root", root, "--artifact", ".openworkflow/validation/val-mismatch/VALIDATION.yaml", "--json"], env);
  assert(mismatch.code !== 0, "register should reject artifact_type mismatches");
  const mismatchReport = parseJsonReport(mismatch.output, "register");
  assert(mismatchReport.ok === false, "register mismatch should report ok=false");
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
  for (const name of SKILL_NAMES) {
    const promptName = `${name}.md`;
    assert(!(await exists(join(codexHome, "prompts", promptName))), `default global prompt generated unexpectedly: ${promptName}`);
  }
}

async function verifySkills(root: string): Promise<void> {
  const manifest = await read(join(root, ".agents", "openworkflow-adapter.yaml"));
  assert(manifest.includes("metadata_fields:"), "Codex manifest missing skill metadata fields");
  assert(manifest.includes("generated_by"), "Codex manifest missing generated_by metadata field");
  assert(manifest.includes("source_command_id"), "Codex manifest missing source command metadata field");
  assert(manifest.includes("semantic_trigger"), "Codex manifest missing semantic trigger metadata field");

  for (const name of SKILL_NAMES) {
    const skill = join(root, ".agents", "skills", name, "SKILL.md");
    const interfaceFile = join(root, ".agents", "skills", name, "agents", "openai.yaml");
    await assertFile(skill);
    await assertFile(interfaceFile);
    const skillContent = await read(skill);
    const interfaceContent = await read(interfaceFile);
    assert(skillContent.startsWith("---\n"), `${name} missing SKILL.md frontmatter`);
    assert(skillContent.includes(`name: "${name}"`), `${name} missing skill name`);
    assert(skillContent.includes("description:"), `${name} missing skill description`);
    assert(skillContent.includes("metadata:"), `${name} missing generated metadata`);
    assert(skillContent.includes('generated_by: "openworkflow"'), `${name} missing generated_by metadata`);
    assert(skillContent.includes('adapter: "codex"'), `${name} missing adapter metadata`);
    assert(skillContent.includes('adapter_version: "0.1.0"'), `${name} missing adapter_version metadata`);
    assert(skillContent.includes(`template_id: "codex.skill.ow.${name.replace("ow-", "")}"`), `${name} missing template_id metadata`);
    assert(skillContent.includes(`source_command_id: "${name.replace("ow-", "")}"`), `${name} missing source_command_id metadata`);
    assert(skillContent.includes(`semantic_trigger: "/ow:${name.replace("ow-", "")}"`), `${name} missing semantic_trigger metadata`);
    assert(skillContent.includes(`skill_name: "${name}"`), `${name} missing skill_name metadata`);
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
    if (name === "ow-vision2prompt") {
      verifyVision2PromptSkill(skillContent);
    }
    if (name === "ow-prompt2proto") {
      verifyPrompt2ProtoSkill(skillContent);
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
    if (name === "ow-decompose-to-changes") {
      verifyDecomposeToChangesSkill(skillContent);
    }
    if (name === "ow-analyze-changes") {
      verifyAnalyzeChangesSkill(skillContent);
    }
    if (name === "ow-select-change") {
      verifySelectChangeSkill(skillContent);
    }
    if (name === "ow-git-automation") {
      verifyGitAutomationSkill(skillContent);
    }
    const semanticCommand = `/${name.replace("ow-", "ow:")}`;
    const displayName = semanticCommand.slice(1);
    assert(hasYamlScalar(interfaceContent, "display_name", displayName), `${name} missing slashless display name`);
    assert(!hasYamlScalar(interfaceContent, "display_name", semanticCommand), `${name} display name includes semantic slash`);
    assert(skillContent.includes(`Semantic command: ${semanticCommand}`), `${name} missing semantic command`);
    assert(interfaceContent.includes("default_prompt:"), `${name} missing default prompt`);
  }
}

async function verifyGeneratedSkillRepositoryValidation(): Promise<void> {
  const skill = join(REPO_ROOT, ".agents", "skills", "ow-proto", "SKILL.md");
  const manifest = join(REPO_ROOT, ".agents", "openworkflow-adapter.yaml");
  const commandAudit = join(REPO_ROOT, ".openworkflow", "audit", "COMMAND_AUDIT_INDEX.yaml");
  const highRiskReport = join(REPO_ROOT, "changes", "M69-skill-system-lifecycle-planning", "HIGH_RISK_DECISION_REPORT.md");
  const branchGovernanceQueue = join(REPO_ROOT, "changes", "M71-git-version-control-governance", "CANDIDATE_CHANGES.yaml");
  const validator = join(REPO_ROOT, "dist", "cli", "src", "dev", "validateRepositoryContractsCli.js");
  const original = await read(skill);
  const originalManifest = await read(manifest);
  const originalCommandAudit = await read(commandAudit);
  const originalHighRiskReport = await read(highRiskReport);
  const originalBranchGovernanceQueue = await read(branchGovernanceQueue);
  try {
    await writeFile(skill, original.replace('  generated_by: "openworkflow"\n', ""), "utf8");
    const missingMetadata = await runCaptureStatus(["node", validator, "--root", REPO_ROOT], process.env);
    assert(missingMetadata.code !== 0, "validate passed after generated skill metadata was removed");
    assert(missingMetadata.output.includes("metadata.generated_by"), "missing metadata validation did not explain generated metadata failure");

    await writeFile(skill, original.replace("# /ow:proto", "<skill>\n# /ow:proto\n</skill>"), "utf8");
    const malformedWrapper = await runCaptureStatus(["node", validator, "--root", REPO_ROOT], process.env);
    assert(malformedWrapper.code !== 0, "validate passed after generated skill was wrapped in <skill>");
    assert(malformedWrapper.output.includes("must not use a top-level <skill> XML wrapper"), "malformed wrapper validation did not explain skill wrapper failure");

    await writeFile(manifest, originalManifest.replace("  - .agents/skills/ow-proto/SKILL.md\n", ""), "utf8");
    const missingGeneratedFile = await runCaptureStatus(["node", validator, "--root", REPO_ROOT], process.env);
    assert(missingGeneratedFile.code !== 0, "validate passed after Codex manifest generated_files drifted");
    assert(missingGeneratedFile.output.includes("generated_files missing .agents/skills/ow-proto/SKILL.md"), "generated_files drift validation did not explain missing generated file");

    await writeFile(commandAudit, originalCommandAudit.replace("    trigger: /ow:proto\n", "    trigger: /ow:proto-drift\n"), "utf8");
    const commandAuditDrift = await runCaptureStatus(["node", validator, "--root", REPO_ROOT], process.env);
    assert(commandAuditDrift.code !== 0, "validate passed after command audit trigger drifted");
    assert(commandAuditDrift.output.includes("COMMAND_AUDIT_INDEX.yaml proto trigger must be /ow:proto"), "command audit drift validation did not explain trigger mismatch");

    await writeFile(highRiskReport, originalHighRiskReport.replace("## Validation Expectations", "## Validation Notes"), "utf8");
    const missingHighRiskSection = await runCaptureStatus(["node", validator, "--root", REPO_ROOT], process.env);
    assert(missingHighRiskSection.code !== 0, "validate passed after high-risk report section was removed");
    assert(missingHighRiskSection.output.includes("missing high-risk report section: Validation Expectations"), "high-risk report validation did not explain missing section");

    await writeFile(branchGovernanceQueue, originalBranchGovernanceQueue.replace("branch_boundary: codex/m71-git-version-governance", "branch_boundary: bad branch with spaces"), "utf8");
    const malformedBranchBoundary = await runCaptureStatus(["node", validator, "--root", REPO_ROOT], process.env);
    assert(malformedBranchBoundary.code !== 0, "validate passed after branch boundary was malformed");
    assert(malformedBranchBoundary.output.includes("queue_policy.branch_boundary"), "branch boundary validation did not explain malformed branch boundary");
  } finally {
    await writeFile(skill, original, "utf8");
    await writeFile(manifest, originalManifest, "utf8");
    await writeFile(commandAudit, originalCommandAudit, "utf8");
    await writeFile(highRiskReport, originalHighRiskReport, "utf8");
    await writeFile(branchGovernanceQueue, originalBranchGovernanceQueue, "utf8");
  }
}

async function verifyGitGovernanceDogfoodFixtures(): Promise<void> {
  const queue = await read(join(REPO_ROOT, "changes", "M71-git-version-control-governance", "CANDIDATE_CHANGES.yaml"));
  const fixture = await read(join(REPO_ROOT, "changes", "M71-git-version-control-governance", "G006-branch-per-feat-dogfood-fixtures", "BRANCH_PER_FEAT_FIXTURE.md"));
  const prReadyExample = await read(join(REPO_ROOT, "changes", "M71-git-version-control-governance", "G006-branch-per-feat-dogfood-fixtures", "EXAMPLE_PR_READY_SUMMARY.md"));

  assert(queue.includes("branch_boundary: codex/m71-git-version-governance"), "M71 queue missing branch boundary fixture");
  assert(queue.includes("completed_by_change_id: G004-git-governance-validation"), "M71 queue missing completed selected-change evidence");
  assert(fixture.includes("selected change -> commit"), "branch-per-feat fixture missing commit boundary");
  assert(fixture.includes("CANDIDATE_CHANGES -> feat branch"), "branch-per-feat fixture missing feat branch boundary");
  assert(prReadyExample.includes("## Completed Changes"), "PR-ready example missing completed changes section");
  assert(prReadyExample.includes("## Validation"), "PR-ready example missing validation section");
  assert(prReadyExample.includes("does not mean a PR was opened"), "PR-ready example must avoid implying remote PR mutation");
}

async function verifyLocalFeatBranchAutomation(): Promise<void> {
  const tempRoot = await mkdtemp(join(tmpdir(), "openworkflow-local-git-automation-"));
  try {
    const gitRoot = join(tempRoot, "local-branch-automation");
    await mkdir(gitRoot, { recursive: true });
    await runInCwd(gitRoot, ["git", "init"]);
    await runInCwd(gitRoot, ["git", "-c", "user.name=OpenWorkflow Test", "-c", "user.email=openworkflow@example.invalid", "commit", "--allow-empty", "-m", "initial"]);

    const preview = await ensureLocalFeatBranch({
      root: gitRoot,
      branchBoundary: "codex/m71-local-branch-fixture",
      dryRun: true,
    });
    assert(preview.ok, `local branch preview failed: ${preview.errors.join(", ")}`);
    assert(preview.action === "create_branch", "local branch preview should create missing branch");
    assert(preview.preview?.args.join(" ") === "switch -c codex/m71-local-branch-fixture", "local branch preview command mismatch");

    const created = await ensureLocalFeatBranch({
      root: gitRoot,
      branchBoundary: "codex/m71-local-branch-fixture",
      dryRun: false,
    });
    assert(created.ok, `local branch creation failed: ${created.errors.join(", ")}`);
    assert(created.currentBranch === "codex/m71-local-branch-fixture", "local branch automation did not switch to created branch");

    await runInCwd(gitRoot, ["git", "switch", "-c", "scratch"]);
    const checkoutExisting = await ensureLocalFeatBranch({
      root: gitRoot,
      branchBoundary: "codex/m71-local-branch-fixture",
      dryRun: true,
    });
    assert(checkoutExisting.ok, `existing branch preview failed: ${checkoutExisting.errors.join(", ")}`);
    assert(checkoutExisting.action === "checkout_existing_branch", "existing branch preview should checkout branch");

    await writeFile(join(gitRoot, "dirty.txt"), "dirty\n", "utf8");
    const dirty = await ensureLocalFeatBranch({
      root: gitRoot,
      branchBoundary: "codex/m71-local-branch-fixture",
      dryRun: true,
    });
    assert(!dirty.ok, "local branch automation should refuse dirty trees");
    assert(dirty.dirtyPaths.length > 0, "dirty-tree refusal should report dirty paths");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

async function verifySelectedChangeCommitAutomation(): Promise<void> {
  const tempRoot = await mkdtemp(join(tmpdir(), "openworkflow-local-commit-automation-"));
  try {
    const gitRoot = join(tempRoot, "selected-change-commit");
    await mkdir(gitRoot, { recursive: true });
    await runInCwd(gitRoot, ["git", "init"]);
    await runInCwd(gitRoot, ["git", "config", "user.name", "OpenWorkflow Test"]);
    await runInCwd(gitRoot, ["git", "config", "user.email", "openworkflow@example.invalid"]);
    await runInCwd(gitRoot, ["git", "commit", "--allow-empty", "-m", "initial"]);
    await runInCwd(gitRoot, ["git", "switch", "-c", "codex/m71-commit-fixture"]);

    await mkdir(join(gitRoot, "allowed"), { recursive: true });
    await writeFile(join(gitRoot, "allowed", "change.txt"), "selected change\n", "utf8");
    await writeFile(join(gitRoot, "unrelated.txt"), "unrelated\n", "utf8");

    const unrelated = await commitSelectedChange({
      root: gitRoot,
      planId: "M71-git-version-control-governance",
      candidateId: "G013",
      selectedChangeId: "G013-selected-change-commit-automation",
      branchBoundary: "codex/m71-commit-fixture",
      allowedPaths: ["allowed"],
      validationEvidence: ["validation: npm run validate"],
      commitMessage: "M71-git-version-control-governance/G013 Commit selected change fixture",
      dryRun: true,
    });
    assert(!unrelated.ok, "commit automation should refuse unrelated dirty paths");
    assert(unrelated.unrelatedDirtyPaths.includes("unrelated.txt"), "commit automation should report unrelated dirty path");

    await unlink(join(gitRoot, "unrelated.txt"));
    const preview = await commitSelectedChange({
      root: gitRoot,
      planId: "M71-git-version-control-governance",
      candidateId: "G013",
      selectedChangeId: "G013-selected-change-commit-automation",
      branchBoundary: "codex/m71-commit-fixture",
      allowedPaths: ["allowed"],
      validationEvidence: ["validation: npm run validate"],
      commitMessage: "M71-git-version-control-governance/G013 Commit selected change fixture",
      dryRun: true,
    });
    assert(preview.ok, `commit automation preview failed: ${preview.errors.join(", ")}`);
    assert(preview.preview?.args.join(" ") === "commit -m M71-git-version-control-governance/G013 Commit selected change fixture", "commit preview command mismatch");

    const committed = await commitSelectedChange({
      root: gitRoot,
      planId: "M71-git-version-control-governance",
      candidateId: "G013",
      selectedChangeId: "G013-selected-change-commit-automation",
      branchBoundary: "codex/m71-commit-fixture",
      allowedPaths: ["allowed"],
      validationEvidence: ["validation: npm run validate"],
      commitMessage: "M71-git-version-control-governance/G013 Commit selected change fixture",
      evidencePath: "changes/G013/LOCAL_COMMIT_EVIDENCE.yaml",
      commitEvidence: true,
      dryRun: false,
    });
    assert(committed.ok, `commit automation execution failed: ${committed.errors.join(", ")}`);
    assert(/^[0-9a-f]{40}$/i.test(committed.primaryCommit ?? ""), "commit automation did not return primary commit hash");
    assert(/^[0-9a-f]{40}$/i.test(committed.evidenceCommit ?? ""), "commit automation did not return evidence commit hash");
    assert(committed.headCommit === committed.evidenceCommit, "commit automation should report evidence commit as final HEAD");

    const evidence = await read(join(gitRoot, "changes", "G013", "LOCAL_COMMIT_EVIDENCE.yaml"));
    assert(evidence.includes(`primary_commit: ${committed.primaryCommit}`), "commit evidence missing primary commit hash");
    const cleanStatus = await runCaptureInCwd(gitRoot, ["git", "status", "--porcelain"]);
    assert(cleanStatus.trim().length === 0, "commit automation fixture should finish clean");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

async function verifyPrReadySummaryGeneration(): Promise<void> {
  const tempRoot = await mkdtemp(join(tmpdir(), "openworkflow-pr-ready-summary-"));
  try {
    const queuePath = "changes/M71-fixture/CANDIDATE_CHANGES.yaml";
    await mkdir(join(tempRoot, "changes", "M71-fixture"), { recursive: true });
    await writeFile(join(tempRoot, queuePath), [
      "schema_version: 0.1.0",
      "contract_id: candidate_changes:M71-fixture",
      "contract_type: planning",
      "planning_artifact_type: candidate_changes",
      "plan_id: M71-fixture",
      "title: Candidate changes for fixture",
      "status: active",
      "queue_policy:",
      "  branch_boundary: codex/m71-fixture",
      "validation:",
      "  commands_run:",
      "    - npm run validate",
      "changes:",
      "  - id: G001",
      "    status: done",
      "    title: Completed fixture change",
      "    risk: low",
      "    selection:",
      "      selected_change_id: G001-fixture",
      "    completion:",
      "      evidence:",
      "        - 'commit: abcdef1'",
      "        - 'validation: git diff --check'",
      "  - id: G002",
      "    status: blocked",
      "    title: Blocked fixture change",
      "    risk: medium",
      "  - id: G003",
      "    status: ready",
      "    title: High-risk fixture command",
      "    risk: high",
      "",
    ].join("\n"), "utf8");

    const preview = await generatePrReadySummary({ root: tempRoot, queuePath, dryRun: true });
    assert(preview.ok, `PR-ready summary preview failed: ${preview.errors.join(", ")}`);
    assert(preview.content.includes("This is a local review handoff artifact"), "PR-ready preview must state local-only boundary");
    assert(preview.content.includes("commit: abcdef1"), "PR-ready preview missing commit evidence");
    assert(preview.content.includes("G002"), "PR-ready preview missing blocked candidate");
    assert(preview.content.includes("G003"), "PR-ready preview missing high-risk candidate");
    assert(preview.warnings.length > 0, "PR-ready preview should warn when queue is not fully complete");

    const written = await generatePrReadySummary({ root: tempRoot, queuePath, dryRun: false });
    assert(written.ok, `PR-ready summary write failed: ${written.errors.join(", ")}`);
    const output = await read(join(tempRoot, "changes", "M71-fixture", "PR_READY_SUMMARY.md"));
    assert(output.includes("Remote PR creation or mutation requires separate gh operation governance"), "PR-ready summary missing remote approval boundary");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

async function verifyGitAutomationManagedShell(): Promise<void> {
  const tempRoot = await mkdtemp(join(tmpdir(), "openworkflow-git-automation-shell-"));
  const remoteRoot = `${tempRoot}-remote.git`;
  try {
    await runInCwd(tempRoot, ["git", "init"]);
    await runInCwd(tempRoot, ["git", "config", "user.name", "OpenWorkflow Test"]);
    await runInCwd(tempRoot, ["git", "config", "user.email", "openworkflow@example.invalid"]);
    await runInCwd(tempRoot, ["git", "commit", "--allow-empty", "-m", "initial"]);
    await runInCwd(tempRoot, ["git", "switch", "-c", "codex/m71-shell-fixture"]);
    await writeFile(join(tempRoot, "change.txt"), "change\n", "utf8");
    await runInCwd(tempRoot, ["git", "add", "change.txt"]);
    await runInCwd(tempRoot, ["git", "commit", "-m", "M71/G015 shell fixture"]);
    await runInCwd(tempRoot, ["git", "init", "--bare", remoteRoot]);
    await runInCwd(tempRoot, ["git", "remote", "add", "origin", remoteRoot]);
    await runInCwd(tempRoot, ["git", "push", "origin", "master"]);
    await runInCwd(tempRoot, ["git", "push", "origin", "codex/m71-shell-fixture"]);
    await mkdir(join(tempRoot, "changes", "M71-shell"), { recursive: true });
    await writeFile(join(tempRoot, "changes", "M71-shell", "CANDIDATE_CHANGES.yaml"), [
      "schema_version: 0.1.0",
      "contract_id: candidate_changes:M71-shell",
      "contract_type: planning",
      "planning_artifact_type: candidate_changes",
      "plan_id: M71-shell",
      "title: Candidate changes for shell fixture",
      "status: active",
      "queue_policy:",
      "  branch_boundary: codex/m71-shell-fixture",
      "changes:",
      "  - id: G015",
      "    status: done",
      "    title: Shell fixture",
      "    risk: high",
      "    completion:",
      "      evidence:",
      "        - 'commit: abcdef1'",
      "",
    ].join("\n"), "utf8");

    const remote = await runCaptureStatus([
      "node",
      CLI,
      "git-automation",
      "remote",
      "--root",
      tempRoot,
      "--queue",
      "changes/M71-shell/CANDIDATE_CHANGES.yaml",
      "--operation",
      "pr",
      "--base",
      "master",
      "--json",
    ], process.env);
    assert(remote.code !== 0, "managed remote operation should be refused without approval");
    const remoteReport = parseJsonReport(remote.output, "git-automation remote");
    const data = record(remoteReport.data, "git-automation remote data");
    assert(data.refused === true, "managed remote report should mark operation refused");
    assert(Array.isArray(data.remote_operation_plan), "managed remote report missing operation plan");
    assert(Array.isArray(data.ordered_local_commits), "managed remote report missing ordered local commits");
    assert((data.ordered_local_commits as unknown[]).length > 0, "managed remote report should include ordered commits from base");
    assert(remote.output.includes("does not execute it"), "managed remote report missing non-execution reason");

    await writeFile(join(tempRoot, "changes", "M71-shell", "PR_READY_SUMMARY.md"), "# PR Ready\n", "utf8");
    const simulate = await runCaptureStatus([
      "node",
      CLI,
      "git-automation",
      "simulate",
      "--root",
      tempRoot,
      "--queue",
      "changes/M71-shell/CANDIDATE_CHANGES.yaml",
      "--base",
      "master",
      "--target-base",
      "master",
      "--json",
    ], process.env);
    assert(simulate.code !== 0, "simulator should report blockers when validation evidence is missing");
    const simulateReport = parseJsonReport(simulate.output, "git-automation simulate");
    const simulateData = record(simulateReport.data, "git-automation simulate data");
    const simulateResult = record(simulateData.result, "git-automation simulate result");
    assert(simulateResult.mutation_performed === false, "simulator must report no mutation");
    assert(Array.isArray(simulateResult.orderedLocalCommits), "simulator missing ordered local commits");
    assert((simulateResult.orderedLocalCommits as unknown[]).length > 0, "simulator should include ordered local commits");
    assert(Array.isArray(simulateResult.rollbackPlan), "simulator missing rollback plan");
    assert(Array.isArray(simulateResult.blockers), "simulator missing blockers");
    assert(simulate.output.includes("validation evidence is missing"), "simulator should report missing validation blocker");

    await writeFile(join(tempRoot, "changes", "M71-shell", "CANDIDATE_CHANGES.yaml"), [
      "schema_version: 0.1.0",
      "contract_id: candidate_changes:M71-shell",
      "contract_type: planning",
      "planning_artifact_type: candidate_changes",
      "plan_id: M71-shell",
      "title: Candidate changes for shell fixture",
      "status: active",
      "queue_policy:",
      "  branch_boundary: codex/m71-shell-fixture",
      "changes:",
      "  - id: G017",
      "    status: done",
      "    title: Build read-only autonomous git simulator",
      "    risk: high",
      "    completion:",
      "      evidence:",
      "        - 'commit: feed017'",
      "        - 'validation: npm run verify:runtime-surface'",
      "  - id: G019",
      "    status: done",
      "    title: Remote readonly plan fixture",
      "    risk: high",
      "    completion:",
      "      evidence:",
      "        - 'commit: abcdef1'",
      "        - 'validation: npm run validate'",
      "",
    ].join("\n"), "utf8");
    await runInCwd(tempRoot, ["git", "add", "changes/M71-shell/CANDIDATE_CHANGES.yaml", "changes/M71-shell/PR_READY_SUMMARY.md"]);
    await runInCwd(tempRoot, ["git", "commit", "-m", "M71/G019 remote plan fixture evidence"]);
    const remotePlan = await runCaptureStatus([
      "node",
      CLI,
      "git-automation",
      "remote-plan",
      "--root",
      tempRoot,
      "--queue",
      "changes/M71-shell/CANDIDATE_CHANGES.yaml",
      "--base",
      "master",
      "--remote",
      "origin",
      "--target-base",
      "master",
      "--json",
    ], process.env);
    assert(remotePlan.code === 0, `remote-plan should succeed with read-only fixture evidence: ${remotePlan.output}`);
    const remotePlanReport = parseJsonReport(remotePlan.output, "git-automation remote-plan");
    const remotePlanData = record(remotePlanReport.data, "git-automation remote-plan data");
    const remotePlanResult = record(remotePlanData.result, "git-automation remote-plan result");
    assert(remotePlanResult.mutation_performed === false, "remote-plan must report no mutation");
    const targetIdentity = record(remotePlanResult.targetIdentity, "remote-plan target identity");
    assert(targetIdentity.remote === "origin", "remote-plan should record target remote");
    const remoteState = record(remotePlanResult.remoteState, "remote-plan remote state");
    assert(typeof remoteState.baseHead === "string", "remote-plan should read remote base head");
    assert(typeof remoteState.branchHead === "string", "remote-plan should read remote branch head");
    assert(Array.isArray(remotePlanResult.readOnlyPlan), "remote-plan missing read-only plan");
    assert(remotePlan.output.includes("did not push"), "remote-plan should state non-mutation boundary");

    const draftPreview = await runCaptureStatus([
      "node",
      CLI,
      "git-automation",
      "draft-pr",
      "--root",
      tempRoot,
      "--queue",
      "changes/M71-shell/CANDIDATE_CHANGES.yaml",
      "--base",
      "master",
      "--remote",
      "origin",
      "--target-base",
      "master",
      "--json",
    ], process.env);
    assert(draftPreview.code === 0, `draft-pr preview should succeed without mutation: ${draftPreview.output}`);
    const draftPreviewReport = parseJsonReport(draftPreview.output, "git-automation draft-pr");
    const draftPreviewData = record(draftPreviewReport.data, "git-automation draft-pr data");
    const draftPreviewResult = record(draftPreviewData.result, "git-automation draft-pr result");
    assert(draftPreviewResult.mutation_performed === false, "draft-pr preview must not mutate");
    assert(typeof draftPreviewResult.bodyDigest === "string", "draft-pr preview should include body digest");
    const draftPreviewCommand = record(draftPreviewResult.preview, "draft-pr preview command");
    assert(Array.isArray(draftPreviewCommand.args), "draft-pr preview missing command args");
    assert((draftPreviewCommand.args as unknown[]).includes("--draft"), "draft-pr preview should create a draft PR");

    const draftWriteBlocked = await runCaptureStatus([
      "node",
      CLI,
      "git-automation",
      "draft-pr",
      "--root",
      tempRoot,
      "--queue",
      "changes/M71-shell/CANDIDATE_CHANGES.yaml",
      "--base",
      "master",
      "--remote",
      "origin",
      "--target-base",
      "master",
      "--write",
      "--json",
    ], process.env);
    assert(draftWriteBlocked.code !== 0, "draft-pr write should be blocked without --allow-draft-pr");
    assert(draftWriteBlocked.output.includes("requires --allow-draft-pr"), "draft-pr write blocker should name allow flag");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
    await rm(remoteRoot, { recursive: true, force: true });
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

function verifyGitAutomationSkill(content: string): void {
  for (const required of [
    "managed-git-lifecycle-shell",
    "<mode_policy>",
    "managed mode must gate remote push, PR, Issue, and merge operations behind explicit user approval while producing a clear operation plan.",
    "<evidence_policy>",
    "Remote approval handoff must include branch, target base, ordered local commits, PR-ready summary path, conflict-resolution checkpoint, and merge evidence expectations.",
    "openworkflow git-automation branch",
    "openworkflow git-automation commit",
    "openworkflow git-automation summary",
    "openworkflow git-automation simulate",
    "openworkflow git-automation remote-plan",
    "openworkflow git-automation draft-pr",
  ]) {
    assert(content.includes(required), `ow-git-automation missing managed git guidance: ${required}`);
  }
}

function verifyDecomposeToChangesSkill(content: string): void {
  for (const required of [
    "Create, update, query, or maintain an OpenWorkflow candidate change queue.",
    "candidate-queue-decomposition-and-maintenance",
    "skills/decompose-to-changes/references/decomposition-protocol.md",
    "changes/&lt;plan_id&gt;/CANDIDATE_CHANGES.yaml",
    "HIGH_RISK_DECISION_REPORT.md when the next actionable work is high risk",
    "Do not select a candidate from decompose-to-changes.",
    "/ow:analyze-changes",
    "/ow:select-change",
  ]) {
    assert(content.includes(required), `ow-decompose-to-changes missing planning guidance: ${required}`);
  }
}

function verifyAnalyzeChangesSkill(content: string): void {
  for (const required of [
    "Analyze multiple candidate change queues and recommend the next queue and candidate without selecting it.",
    "read-only-cross-queue-priority-analysis",
    "skills/analyze-changes/references/analysis-protocol.md",
    "CHANGE_ANALYSIS.yaml",
    "high-risk stop recommendation",
    "Do not select candidates from analyze-changes.",
    "/ow:select-change",
  ]) {
    assert(content.includes(required), `ow-analyze-changes missing planning guidance: ${required}`);
  }
}

function verifySelectChangeSkill(content: string): void {
  for (const required of [
    "Select one implementable candidate change and create implementation-ready planning artifacts.",
    "single-candidate-selection-and-atomization",
    "skills/select-change/references/selection-protocol.md",
    "SELECTED_CHANGE.yaml",
    "ATOM_TASKS.yaml",
    "IMPLEMENTATION_BRIEF.md",
    "Do not silently select a high-risk candidate.",
    "/ow:git-automation",
  ]) {
    assert(content.includes(required), `ow-select-change missing planning guidance: ${required}`);
  }
}

function hasYamlScalar(content: string, key: string, value: string): boolean {
  return content.includes(`${key}: ${value}`) || content.includes(`${key}: "${value}"`);
}

function verifyVisionSkill(content: string): void {
  for (const required of [
    "delayed-compile-product-interrogation",
    "<vision_role>",
    "Act as product partner",
    "Act as requirements interrogator",
    "Act as intent compiler",
    "<interaction_modes>",
    "Interview mode is the default",
    "Checkpoint mode writes",
    "Compile mode writes",
    "Do not write durable vision artifacts after every user answer.",
    "<agent_first_consumer>",
    "Treat the next implementing Agent as the first consumer of vision artifacts.",
    "The vision_delta must preserve enough handoff intelligence",
    "strategic_core and product_system_seed must let /ow:proto generate prototype directions",
    "<conversation_first>",
    "<mandatory_coverage>",
    "Cover target user and beneficiary.",
    "Cover the problem, motivation, and emotional or quality bar.",
    "Cover AI-native role, boundaries, and failure modes.",
    "Cover privacy, data, sharing, and retention assumptions.",
    "Cover success signals and failure signals.",
    "Cover prototype direction seeds and prompt constraints needed by /ow:proto.",
    "<proto_readiness_gate>",
    "VISION.md is ready only when /ow:proto can derive",
    "If proto_readiness.status is missing or thin",
    "<readiness_gate>",
    "Do not hand off to /ow:validation until mandatory coverage is addressed, proto-readiness",
    "Vision readiness is based on strategic depth, proto-readiness, and user confirmation",
    "Write VISION_SESSION.yaml, VISION_CONTRACT.yaml, VISION.md, or context updates only after stable answers",
    "auditability is preserved through checkpoints and compile, not per-answer file churn",
  ]) {
    assert(content.includes(required), `ow-vision missing delayed-compile guidance: ${required}`);
  }
}

function verifyProtoSkill(content: string): void {
  for (const required of [
    "image-first-strategic-proto-prompt-pack",
    "<internal_proto_pipeline>",
    "/ow:vision2prompt and /ow:prompt2proto are internal commands",
    "<validation_consumption>",
    "trigger.mode: agent_auto",
    "missing_current_validation",
    "<preflight_quality_gate>",
    "high-quality prototype prompt generation",
    "<direction_count_policy>",
    "askUserQuestion",
    "resolved_count: 3",
    "<strategic_prompt_pack>",
    "prompt_pack_type: strategic_proto_prompt_pack",
    "product_experience_model",
    "anti_generic_constraints",
    "Each direction must include direction_id",
    "<prompt_text_manifest>",
    "ready_for_image_generation",
    "<post_validate_gate>",
    "post_validate.status: pass",
    "post_validate.status: skipped",
    "post_validate.status is fail",
    "<image_generation>",
    "Batch-generate prototype images",
    "<image_only_boundary>",
    "Do not write HTML, CSS, runnable prototypes",
    "<review_evidence>",
    "Record selected direction",
    "PROTO_PROMPT_PACK.yaml",
  ]) {
    assert(content.includes(required), `ow-proto missing image-first prompt guidance: ${required}`);
  }
}

function verifyVision2PromptSkill(content: string): void {
  for (const required of [
    "internal-vision-to-strategic-prompt-text",
    "<command_visibility>internal</command_visibility>",
    "<internal_command_boundary>",
    "/ow:vision2prompt is internal",
    "<perspective_engine>",
    "co-founder plus 15-year senior product-manager perspective",
    "dailin-derived references as tools for judgment",
    "product_thesis",
    "user_transformation",
    "reason_to_exist",
    "<product_experience_model>",
    "anti_generic_constraints",
    "ready_for_image_generation",
    "<post_validate_gate>",
    "post_validate.status: pass",
    "post_validate.status: skipped",
    "post_validate.status: fail",
    "Do not generate images",
  ]) {
    assert(content.includes(required), `ow-vision2prompt missing internal prompt guidance: ${required}`);
  }
}

function verifyPrompt2ProtoSkill(content: string): void {
  for (const required of [
    "internal-prompt-text-to-prototype-images",
    "<command_visibility>internal</command_visibility>",
    "post_validate.status pass or skipped",
    "<image_metadata_contract>",
    "Every generated image must record image_id",
    "source_prompt_ref",
    "Do not expose /ow:prompt2proto as a user-facing workflow step",
  ]) {
    assert(content.includes(required), `ow-prompt2proto missing internal image guidance: ${required}`);
  }
}

function verifyTuneSkill(content: string): void {
  for (const required of [
    "screen-bound-prototype-refinement",
    "<target_resolution>",
    "/ow:tune resolves to the latest approved prototype prompt pack",
    "/ow:tune:proto is an explicit alias",
    "<multi_round_baseline_inheritance>",
    "baseline_resolution with latest_approved_baseline_group_id",
    "carry_forward with locked_screens",
    "Never silently regenerate from stale source screens",
    "<input_normalization>",
    "Normalize baseline_source_type",
    "<baseline_screen_audit>",
    "Treat the screen group as one product system",
    "<product_system_extraction>",
    "Extract product thesis",
    "<tune_request_interpretation>",
    "Classify the request",
    "<inheritance_delta_rules>",
    "MUST_INHERIT, MUST_ADD, MUST_REMOVE, and FLEXIBLE_CHANGE",
    "screen_delta_matrix rows",
    "<screen_manifest>",
    "Every screen prompt must include prompt_id",
    "<refined_prompt_pack_output>",
    "Generation Order, and Acceptance Checklist",
    "<internal_decision_audit>",
    "Every tune pass must write or update a decision audit record internally.",
    "Do not expose /ow:decision as the next manual user step",
  ]) {
    assert(content.includes(required), `ow-tune missing refined prompt guidance: ${required}`);
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
  assert(artifacts.includes("preflight_quality_gate:"), "artifact contracts missing proto preflight quality gate");
  assert(artifacts.includes("internal_pipeline:"), "artifact contracts missing proto internal pipeline");
  assert(artifacts.includes("direction_count_policy:"), "artifact contracts missing proto direction count policy");
  assert(artifacts.includes("prompt_text_manifest:"), "artifact contracts missing proto prompt text manifest");
  assert(artifacts.includes("post_validate:"), "artifact contracts missing proto post-validate gate");
  assert(artifacts.includes("image_generation:"), "artifact contracts missing proto image generation state");
  assert(artifacts.includes("generated_images:"), "artifact contracts missing generated image metadata container");
  assert(artifacts.includes("conditional_packets:"), "artifact contracts missing conditional packets");
}

async function verifyTuneDecisionSurface(root: string): Promise<void> {
  const commandIndex = await read(join(root, ".openworkflow", "audit", "COMMAND_AUDIT_INDEX.yaml"));
  assert(commandIndex.includes("trigger: /ow:tune"), "command audit missing /ow:tune");
  assert(commandIndex.includes("visibility: internal"), "command audit missing internal command visibility");

  const protoSection = commandIndex.split("trigger: /ow:proto", 2)[1]?.split("  - id:", 1)[0] ?? "";
  const tuneSection = commandIndex.split("trigger: /ow:tune", 2)[1]?.split("  - id:", 1)[0] ?? "";
  const decisionSection = commandIndex.split("trigger: /ow:decision", 2)[1]?.split("  - id:", 1)[0] ?? "";
  const vision2PromptSection = commandIndex.split("trigger: /ow:vision2prompt", 2)[1]?.split("  - id:", 1)[0] ?? "";
  const prompt2ProtoSection = commandIndex.split("trigger: /ow:prompt2proto", 2)[1]?.split("  - id:", 1)[0] ?? "";
  const designSection = commandIndex.split("trigger: /ow:design", 2)[1]?.split("  - id:", 1)[0] ?? "";
  assert(!extractBlock(protoSection, "handoff_commands").includes("/ow:decision"), "proto exposes manual decision handoff");
  assert(extractBlock(protoSection, "allowed_outputs").includes("PROTO_PROMPT_PACK.yaml"), "proto allowed outputs missing prompt pack");
  assert(extractBlock(protoSection, "forbidden_outputs").includes("review.html"), "proto forbidden outputs missing HTML review surface");
  assert(!extractBlock(tuneSection, "handoff_commands").includes("/ow:decision"), "tune exposes manual decision handoff");
  assert(extractBlock(tuneSection, "allowed_outputs").includes("REFINED_PROTO_PROMPT_PACK.yaml"), "tune allowed outputs missing refined prompt pack");
  assert(extractBlock(tuneSection, "forbidden_outputs").includes("review.html"), "tune forbidden outputs missing HTML review surface");
  assert(!extractBlock(designSection, "handoff_commands").includes("/ow:decision"), "design exposes manual decision handoff");
  assert(decisionSection.includes("visibility: internal"), "decision command is not internal");
  assert(vision2PromptSection.includes("visibility: internal"), "vision2prompt command is not internal");
  assert(prompt2ProtoSection.includes("visibility: internal"), "prompt2proto command is not internal");
  assert(!extractBlock(protoSection, "handoff_commands").includes("/ow:vision2prompt"), "proto exposes vision2prompt as user-facing handoff");
  assert(!extractBlock(protoSection, "handoff_commands").includes("/ow:prompt2proto"), "proto exposes prompt2proto as user-facing handoff");
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

async function verifyStrategicPromptPackStressFixtures(root: string, env: NodeJS.ProcessEnv): Promise<void> {
  const fixtureDir = join(root, ".openworkflow", "prototypes", "proto-stress-fixtures");
  await mkdir(fixtureDir, { recursive: true });

  const thinPath = join(fixtureDir, "THIN_PROTO_PROMPT_PACK.yaml");
  await writeFile(thinPath, thinStrategicPromptPackFixture(), "utf8");
  const thin = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(thin.code !== 0, "thin strategic prompt-pack fixture should fail validation");
  assert(thin.output.includes("normalized_input must be a mapping"), "thin strategic prompt-pack failure should name missing normalized input");
  assert(thin.output.includes("directions must contain strategic prompt directions"), "thin strategic prompt-pack failure should name missing directions");
  await unlink(thinPath);

  const styleOnlyPath = join(fixtureDir, "STYLE_ONLY_PROTO_PROMPT_PACK.yaml");
  await writeFile(styleOnlyPath, strategicPromptPackFixture("style-only"), "utf8");
  const styleOnly = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(styleOnly.code !== 0, "style-only strategic prompt-pack fixture should fail validation");
  await unlink(styleOnlyPath);

  const genericDashboardPath = join(fixtureDir, "GENERIC_DASHBOARD_PROTO_PROMPT_PACK.yaml");
  await writeFile(genericDashboardPath, strategicPromptPackFixture("generic-dashboard"), "utf8");
  const genericDashboard = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(genericDashboard.code !== 0, "generic dashboard strategic prompt-pack fixture should fail prototype reality gate");
  await unlink(genericDashboardPath);

  const smartCityReadyPath = join(fixtureDir, "SMART_CITY_MAP_FIRST_PROTO_PROMPT_PACK.yaml");
  await writeFile(smartCityReadyPath, smartCityStrategicPromptPackFixture("ready"), "utf8");
  const smartCityReady = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(smartCityReady.code === 0, `smart city map-first fixture should pass product reality gate: ${smartCityReady.output}`);
  await unlink(smartCityReadyPath);

  const smartCityReplaySource = await read(join(REPO_ROOT, "examples", "m98-smart-city-replay", "PROTO_PROMPT_PACK.yaml"));
  assertSmartCityReplayPromptPackCompleteness(smartCityReplaySource);
  const smartCityReplayPath = join(fixtureDir, "SMART_CITY_REPLAY_M98_PROTO_PROMPT_PACK.yaml");
  await writeFile(smartCityReplayPath, smartCityReplaySource, "utf8");
  const smartCityReplay = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(smartCityReplay.code !== 0, "M98 smart city replay prompt pack should fail M100 paragraph quality gate");
  assert(
    smartCityReplay.output.includes("screen_prompts[0].prompt missing prompt paragraph quality dimensions"),
    "M98 smart city replay failure should name prompt paragraph quality dimensions",
  );
  await unlink(smartCityReplayPath);

  const smartCityGenericPath = join(fixtureDir, "SMART_CITY_GENERIC_AI_DASHBOARD_PROTO_PROMPT_PACK.yaml");
  await writeFile(smartCityGenericPath, smartCityStrategicPromptPackFixture("generic-ai-dashboard"), "utf8");
  const smartCityGeneric = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(smartCityGeneric.code !== 0, "smart city generic AI dashboard fixture should fail product reality gate");
  await unlink(smartCityGenericPath);

  const dailinGradePath = join(fixtureDir, "DAILIN_GRADE_POCKET_ENGLISH_FRIEND_PROTO_PROMPT_PACK.yaml");
  await writeFile(dailinGradePath, strategicPromptPackFixture("ready"), "utf8");
  const dailinGrade = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(dailinGrade.code === 0, `dailin-grade Pocket English Friend fixture should pass prompt-pack gates: ${dailinGrade.output}`);
  await unlink(dailinGradePath);

  const terseScreenStatePath = join(fixtureDir, "TERSE_SCREEN_STATE_PROMPT_PROTO_PROMPT_PACK.yaml");
  await writeFile(terseScreenStatePath, terseScreenStatePromptStrategicPromptPackFixture(), "utf8");
  const terseScreenState = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(terseScreenState.code !== 0, "terse screen-state prompt fixture should fail paragraph quality validation");
  assert(
    terseScreenState.output.includes("screen_prompts[0].prompt missing prompt paragraph quality dimensions"),
    "terse screen-state prompt failure should name prompt paragraph quality dimensions",
  );
  await unlink(terseScreenStatePath);

  const readyPath = join(fixtureDir, "READY_PROTO_PROMPT_PACK.yaml");
  await writeFile(readyPath, strategicPromptPackFixture("ready"), "utf8");
  const ready = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(ready.code === 0, `proto-ready strategic prompt-pack fixture should pass validation: ${ready.output}`);
  await unlink(readyPath);

  const thinImagePromptPath = join(fixtureDir, "THIN_IMAGE_PROMPT_D1_PROTO_PROMPT_PACK.yaml");
  await writeFile(thinImagePromptPath, thinImagePromptOnlyStrategicPromptPackFixture(), "utf8");
  const thinImagePrompt = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(thinImagePrompt.code !== 0, "thin image-prompt D1 fixture should fail screen-bound executability validation");
  assert(
    thinImagePrompt.output.includes("screen_manifest must contain screen-bound product states before image generation"),
    "thin image-prompt D1 failure should name missing screen_manifest",
  );
  assert(
    thinImagePrompt.output.includes("directions[0].screen_prompts must contain screen-bound prompt text before image generation"),
    "thin image-prompt D1 failure should name missing screen-bound prompt text",
  );
  await unlink(thinImagePromptPath);

  const missingScreenManifestPath = join(fixtureDir, "MISSING_SCREEN_MANIFEST_PROTO_PROMPT_PACK.yaml");
  await writeFile(missingScreenManifestPath, withoutYamlBlock(strategicPromptPackFixture("ready"), "screen_manifest", "global_design_system_prompt"), "utf8");
  const missingScreenManifest = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(missingScreenManifest.code !== 0, "missing screen manifest fixture should fail validation");
  assert(
    missingScreenManifest.output.includes("screen_manifest must contain screen-bound product states before image generation"),
    "missing screen manifest failure should name screen-bound product states",
  );
  await unlink(missingScreenManifestPath);

  const orphanStrategicScreenPath = join(fixtureDir, "ORPHAN_STRATEGIC_SCREEN_PROMPT_PROTO_PROMPT_PACK.yaml");
  await writeFile(orphanStrategicScreenPath, strategicPromptPackFixture("ready").replace("target_screen_id: practice-entry", "target_screen_id: missing-practice-entry"), "utf8");
  const orphanStrategicScreen = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(orphanStrategicScreen.code !== 0, "orphan strategic screen prompt fixture should fail validation");
  assert(
    orphanStrategicScreen.output.includes("directions[0].screen_prompts[0].target_screen_id must exist in screen_manifest"),
    "orphan strategic screen prompt failure should name screen_manifest linkage",
  );
  await unlink(orphanStrategicScreenPath);

  const missingIntegrityGatePath = join(fixtureDir, "MISSING_INTEGRITY_GATE_PROTO_PROMPT_PACK.yaml");
  await writeFile(missingIntegrityGatePath, withoutPromptPackIntegrityGate(strategicPromptPackFixture("ready")), "utf8");
  const missingIntegrityGate = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(missingIntegrityGate.code !== 0, "missing integrity gate fixture should fail validation");
  assert(
    missingIntegrityGate.output.includes("prompt_pack_integrity_gate must be a mapping"),
    "missing integrity gate failure should name prompt_pack_integrity_gate",
  );
  await unlink(missingIntegrityGatePath);

  const directionCountMismatchPath = join(fixtureDir, "DIRECTION_COUNT_MISMATCH_PROTO_PROMPT_PACK.yaml");
  await writeFile(directionCountMismatchPath, strategicPromptPackFixture("ready").replace("  direction_count: 3", "  direction_count: 4"), "utf8");
  const directionCountMismatch = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(directionCountMismatch.code !== 0, "direction count mismatch fixture should fail validation");
  assert(
    directionCountMismatch.output.includes("prompt_text_manifest.direction_count must equal directions length"),
    "direction count mismatch failure should name prompt_text_manifest.direction_count",
  );
  await unlink(directionCountMismatchPath);

  const missingPromptRefPath = join(fixtureDir, "MISSING_PROMPT_REF_PROTO_PROMPT_PACK.yaml");
  await writeFile(missingPromptRefPath, strategicPromptPackFixture("ready").replace("prompts/D3.md", "prompts/DX.md"), "utf8");
  const missingPromptRef = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(missingPromptRef.code !== 0, "missing prompt ref fixture should fail validation");
  assert(
    missingPromptRef.output.includes("prompt_text_manifest.prompt_text_refs[2] must reference an existing direction_id or prompt_id"),
    "missing prompt ref failure should name the missing prompt text ref",
  );
  await unlink(missingPromptRefPath);

  const failedIntegrityStartedPath = join(fixtureDir, "FAILED_INTEGRITY_STARTED_IMAGE_GENERATION_PROTO_PROMPT_PACK.yaml");
  await writeFile(
    failedIntegrityStartedPath,
    strategicPromptPackFixture("ready")
      .replace("prompt_pack_integrity_gate:\n  status: pass", "prompt_pack_integrity_gate:\n  status: fail")
      .replace("image_generation:\n  status: not_started", "image_generation:\n  status: queued"),
    "utf8",
  );
  const failedIntegrityStarted = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(failedIntegrityStarted.code !== 0, "failed integrity gate with queued image generation should fail validation");
  assert(
    failedIntegrityStarted.output.includes("prompt_pack_integrity_gate failed gates must not start image_generation"),
    "failed integrity gate should block image generation",
  );
  await unlink(failedIntegrityStartedPath);

  const duplicatePath = join(fixtureDir, "DUPLICATE_FINGERPRINT_PROTO_PROMPT_PACK.yaml");
  await writeFile(duplicatePath, strategicPromptPackFixture("duplicate-fingerprint"), "utf8");
  const duplicate = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(duplicate.code !== 0, "duplicate strategic fingerprint fixture should fail validation");
  assert(duplicate.output.includes("exceeds strategic fingerprint similarity threshold"), "duplicate strategic fingerprint failure should name threshold");
  assert(duplicate.output.includes("shared dimensions"), "duplicate strategic fingerprint failure should name shared dimensions");
  await unlink(duplicatePath);

  const nearDuplicatePath = join(fixtureDir, "NEAR_DUPLICATE_FINGERPRINT_PROTO_PROMPT_PACK.yaml");
  await writeFile(nearDuplicatePath, strategicPromptPackFixture("near-duplicate-fingerprint"), "utf8");
  const nearDuplicate = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(nearDuplicate.code !== 0, "near-duplicate strategic fingerprint fixture should fail validation");
  assert(nearDuplicate.output.includes("exceeds strategic fingerprint similarity threshold"), "near-duplicate strategic fingerprint failure should name threshold");
  assert(nearDuplicate.output.includes("score"), "near-duplicate strategic fingerprint failure should name similarity score");
  assert(nearDuplicate.output.includes("shared dimensions"), "near-duplicate strategic fingerprint failure should name shared dimensions");
  await unlink(nearDuplicatePath);

  const singlePath = join(fixtureDir, "SINGLE_DIRECTION_PROTO_PROMPT_PACK.yaml");
  await writeFile(singlePath, strategicPromptPackFixture("single-direction"), "utf8");
  const single = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(single.code === 0, `single-direction strategic prompt-pack fixture should skip post-validation and pass: ${single.output}`);
  await unlink(singlePath);
}

function withoutPromptPackIntegrityGate(fixture: string): string {
  const start = fixture.indexOf("prompt_pack_integrity_gate:\n");
  const end = fixture.indexOf("directions:\n", start);
  if (start === -1 || end === -1) {
    return fixture;
  }
  return `${fixture.slice(0, start)}${fixture.slice(end)}`;
}

function withoutYamlBlock(fixture: string, startKey: string, nextKey: string): string {
  const start = fixture.indexOf(`${startKey}:\n`);
  const end = fixture.indexOf(`${nextKey}:\n`, start);
  if (start === -1 || end === -1) {
    return fixture;
  }
  return `${fixture.slice(0, start)}${fixture.slice(end)}`;
}

function terseScreenStatePromptStrategicPromptPackFixture(): string {
  return strategicPromptPackFixture("ready")
    .replace(
      "        standalone_prompt: Design the Today practice entry screen for Pocket English Friend as the first journey stage for a Chinese-speaking adult who wants low-pressure social English practice. Show a mobile product surface with the remembered emotional note, daily scenario card, sample phrase suggestions, primary speak button, privacy opt-out, and calm visual direction. When the user starts practice, the AI should offer one easy sentence and one natural sentence so the user can speak without feeling judged. Do not show an exam dashboard, generic chatbot, leaderboard, or decorative card wall. Acceptance criteria include voice practice action, memory control, example copy, and safe feeling are visible.",
      "        standalone_prompt: Show the same map shell with the incident detail panel open.",
    )
    .replace(
      "        prompt_text: Design the Today practice entry screen for Pocket English Friend as the first journey stage for a Chinese-speaking adult who wants low-pressure social English practice. Show a mobile product surface with the remembered emotional note, daily scenario card, sample phrase suggestions, primary speak button, privacy opt-out, and calm visual direction. When the user starts practice, the AI should offer one easy sentence and one natural sentence so the user can speak without feeling judged. Do not show an exam dashboard, generic chatbot, leaderboard, or decorative card wall. Acceptance criteria include voice practice action, memory control, example copy, and safe feeling are visible.",
      "        prompt_text: Show the same map shell with the incident detail panel open.",
    );
}

function assertSmartCityReplayPromptPackCompleteness(source: string): void {
  const document = parseYaml(source) as Record<string, unknown>;
  const prototypeBrief = asRecord(document.prototype_brief, "smart city replay prototype_brief");
  assert(prototypeBrief.product_name === "CityFlow Copilot", "smart city replay should name the product in prototype_brief");

  const screenManifest = asArray(document.screen_manifest, "smart city replay screen_manifest");
  const screenIds = new Set(
    screenManifest.map((screen, index) => String(asRecord(screen, `smart city replay screen_manifest[${index}]`).target_screen_id ?? "")),
  );
  for (const requiredScreen of ["map-shell", "planning-review", "incident-response", "capacity-monitor"]) {
    assert(screenIds.has(requiredScreen), `smart city replay screen_manifest missing ${requiredScreen}`);
  }

  const screenPrompts = asArray(asRecord(asArray(document.directions, "smart city replay directions")[0], "smart city replay directions[0]").screen_prompts, "smart city replay screen_prompts");
  const promptTargets = new Set(
    screenPrompts.map((prompt, index) => String(asRecord(prompt, `smart city replay screen_prompts[${index}]`).target_screen_id ?? "")),
  );
  for (const requiredScreen of screenIds) {
    assert(promptTargets.has(requiredScreen), `smart city replay screen prompt missing target ${requiredScreen}`);
  }

  const designPrompt = asRecord(document.global_design_system_prompt, "smart city replay global_design_system_prompt");
  assert(String(designPrompt.layout_system ?? "").includes("map canvas"), "smart city replay design prompt should keep map canvas primary");

  const qualityRubric = asRecord(document.quality_rubric, "smart city replay quality_rubric");
  for (const requiredRubric of ["prompt_executability", "product_specificity", "state_coverage", "trust_boundary_coverage"]) {
    assert(Array.isArray(qualityRubric[requiredRubric]), `smart city replay quality_rubric missing ${requiredRubric}`);
  }

  assert(
    source.includes("Planning, incident, and capacity are modules inside one map-first product shell."),
    "smart city replay should explicitly model planning, incident, and capacity inside one product shell",
  );
  assert(source.includes("visual reference parity is deferred"), "smart city replay should avoid claiming visual parity");
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  assert(typeof value === "object" && value !== null && !Array.isArray(value), `${label} must be a mapping`);
  return value as Record<string, unknown>;
}

function asArray(value: unknown, label: string): unknown[] {
  assert(Array.isArray(value), `${label} must be a sequence`);
  return value;
}

async function verifyRefinedPromptPackStressFixtures(root: string, env: NodeJS.ProcessEnv): Promise<void> {
  const fixtureDir = join(root, ".openworkflow", "prototypes", "tune-stress-fixtures");
  await mkdir(fixtureDir, { recursive: true });

  const readyPath = join(fixtureDir, "READY_REFINED_PROTO_PROMPT_PACK.yaml");
  await writeFile(readyPath, refinedPromptPackFixture("ready"), "utf8");
  const ready = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(ready.code === 0, `ready refined prompt-pack fixture should pass validation: ${ready.output}`);
  await unlink(readyPath);

  const missingBaselinePath = join(fixtureDir, "MISSING_BASELINE_AUDIT_REFINED_PROTO_PROMPT_PACK.yaml");
  await writeFile(missingBaselinePath, refinedPromptPackFixture("missing-baseline-audit"), "utf8");
  const missingBaseline = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(missingBaseline.code !== 0, "missing baseline audit refined prompt-pack fixture should fail validation");
  assert(missingBaseline.output.includes("baseline_audit must contain source screen audits"), "missing baseline audit failure should name baseline_audit");
  await unlink(missingBaselinePath);

  const orphanPath = join(fixtureDir, "ORPHAN_SCREEN_REFINED_PROTO_PROMPT_PACK.yaml");
  await writeFile(orphanPath, refinedPromptPackFixture("orphan-screen-prompt"), "utf8");
  const orphan = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(orphan.code !== 0, "orphan target screen refined prompt-pack fixture should fail validation");
  assert(orphan.output.includes("screen_prompts[0].target_screen_id must exist in screen_manifest"), "orphan target screen failure should name screen_manifest linkage");
  await unlink(orphanPath);

  const missingInheritPath = join(fixtureDir, "MISSING_MUST_INHERIT_REFINED_PROTO_PROMPT_PACK.yaml");
  await writeFile(missingInheritPath, refinedPromptPackFixture("missing-must-inherit"), "utf8");
  const missingInherit = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(missingInherit.code !== 0, "missing must_inherit refined prompt-pack fixture should fail validation");
  assert(missingInherit.output.includes("delta_rules.must_inherit must preserve baseline product-system constants"), "missing must_inherit failure should name delta_rules.must_inherit");
  await unlink(missingInheritPath);

  const missingRemovePath = join(fixtureDir, "MISSING_MUST_REMOVE_REFINED_PROTO_PROMPT_PACK.yaml");
  await writeFile(missingRemovePath, refinedPromptPackFixture("missing-must-remove"), "utf8");
  const missingRemove = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(missingRemove.code !== 0, "missing must_remove refined prompt-pack fixture should fail validation when tune request removes elements");
  assert(missingRemove.output.includes("delta_rules.must_remove must name requested removals"), "missing must_remove failure should name delta_rules.must_remove");
  await unlink(missingRemovePath);
}

async function verifyDiscoveryLoopDogfoodFixture(root: string, env: NodeJS.ProcessEnv): Promise<void> {
  const visionDir = join(root, ".openworkflow", "vision", "sessions", "dogfood-english-companion");
  const validationDir = join(root, ".openworkflow", "validation", "dogfood-validation");
  const protoDir = join(root, ".openworkflow", "prototypes", "dogfood-proto");
  const tuneDir = join(root, ".openworkflow", "prototypes", "dogfood-tune");
  const decisionDir = join(root, ".openworkflow", "decisions", "dogfood-benchmark");
  await mkdir(visionDir, { recursive: true });
  await mkdir(validationDir, { recursive: true });
  await mkdir(protoDir, { recursive: true });
  await mkdir(tuneDir, { recursive: true });
  await mkdir(decisionDir, { recursive: true });

  await writeFile(join(visionDir, "VISION_SESSION.yaml"), visionSessionYaml({
    id: "dogfood-english-companion",
    status: "active",
    oneSentence: "AI companion helps English learners turn emotional memory into daily spoken practice.",
    protoStatus: "ready",
    full: true,
  }), "utf8");
  await writeFile(join(validationDir, "VALIDATION.yaml"), discoveryLoopValidationFixture(), "utf8");
  await writeFile(join(protoDir, "EVIDENCE.yaml"), discoveryLoopStrategicPromptPackFixture(), "utf8");
  await writeFile(join(tuneDir, "REFINED_PROTO_PROMPT_PACK.yaml"), discoveryLoopRefinedPromptPackFixture(), "utf8");
  await writeFile(join(decisionDir, "DECISION.yaml"), discoveryLoopDecisionFixture(), "utf8");

  const validation = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(validation.code === 0, `canonical discovery-loop dogfood fixture should pass validation: ${validation.output}`);

  const proto = await readFile(join(protoDir, "EVIDENCE.yaml"), "utf8");
  const tune = await readFile(join(tuneDir, "REFINED_PROTO_PROMPT_PACK.yaml"), "utf8");
  const decision = await readFile(join(decisionDir, "DECISION.yaml"), "utf8");
  const commandAudit = await readFile(join(root, ".openworkflow", "audit", "COMMAND_AUDIT_INDEX.yaml"), "utf8");
  const contextPackets = await readFile(join(root, ".openworkflow", "audit", "CONTEXT_PACKETS.yaml"), "utf8");
  assert(proto.includes(".openworkflow/validation/dogfood-validation/VALIDATION.yaml"), "dogfood proto fixture should reference validation fixture");
  assert(proto.includes("image_id: IMG_D1_01"), "dogfood proto fixture should include generated image metadata");
  assert(tune.includes(".openworkflow/prototypes/dogfood-proto/EVIDENCE.yaml"), "dogfood tune fixture should reference proto fixture");
  assert(tune.includes("latest_approved_baseline_group_id: dogfood-proto-accepted-v1"), "dogfood tune fixture should include latest baseline id");
  assert(decision.includes(".openworkflow/prototypes/dogfood-tune/REFINED_PROTO_PROMPT_PACK.yaml"), "dogfood decision fixture should reference tune fixture");
  assert(decision.includes("accepted benchmark prototype image metadata"), "dogfood decision fixture should name benchmark readiness");
  assert(decision.includes("outcome: continue"), "dogfood decision fixture should accept the benchmark for downstream handoff");
  assert(decision.includes(".openworkflow/prototypes/dogfood-proto/EVIDENCE.yaml"), "dogfood decision fixture should retain original prototype evidence ref");
  assert(!(await exists(join(root, ".openworkflow", "html-prototypes"))), "dogfood benchmark readiness must not create proto2html artifacts");
  assert(!(await exists(join(root, ".openworkflow", "html2spec"))), "dogfood benchmark readiness must not create html2spec artifacts");
  assert(commandAudit.indexOf("trigger: /ow:vision") < commandAudit.indexOf("trigger: /ow:validation"), "command audit should order vision before validation");
  assert(commandAudit.indexOf("trigger: /ow:validation") < commandAudit.indexOf("trigger: /ow:vision2prompt"), "command audit should order validation before internal prompt compilation");
  assert(commandAudit.indexOf("trigger: /ow:vision2prompt") < commandAudit.indexOf("trigger: /ow:prompt2proto"), "command audit should order vision2prompt before prompt2proto");
  assert(commandAudit.indexOf("trigger: /ow:prompt2proto") < commandAudit.indexOf("trigger: /ow:proto"), "command audit should expose internal prompt2proto before user proto orchestration handoff");
  assert(commandAudit.indexOf("trigger: /ow:proto") < commandAudit.indexOf("trigger: /ow:tune"), "command audit should order proto before tune");
  assert(commandAudit.indexOf("trigger: /ow:tune") < commandAudit.indexOf("trigger: /ow:decision"), "command audit should order tune before internal decision audit");
  assert(extractBlock(commandAudit.split("trigger: /ow:tune", 2)[1] ?? "", "handoff_commands").includes("/ow:design"), "tune handoff should reach design after benchmark decision");
  assert(!commandAudit.includes("trigger: /ow:proto2html"), "happy-path dogfood should not enter proto2html");
  assert(contextPackets.includes("packet_id: context:vision2prompt"), "context packets should include internal vision2prompt stage");
  assert(contextPackets.includes("packet_id: context:prompt2proto"), "context packets should include internal prompt2proto stage");
  assert(extractBlock(contextPackets.split("packet_id: context:tune", 2)[1] ?? "", "optional").includes(".openworkflow/prototypes/PROTOTYPE_INDEX.yaml"), "tune context should allow prototype index handoff");

  const failedPostValidatePath = join(protoDir, "FAILED_POST_VALIDATE.yaml");
  await writeFile(
    failedPostValidatePath,
    discoveryLoopStrategicPromptPackFixture().replace("post_validate:\n  status: pass", "post_validate:\n  status: pending"),
    "utf8",
  );
  const failedPostValidate = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(failedPostValidate.code !== 0, "failed post-validation dogfood fixture should block image handoff");
  assert(failedPostValidate.output.includes("post_validate.status must be pass or fail before /ow:prompt2proto"), "failed post-validation should name prompt2proto gate");
  await unlink(failedPostValidatePath);

  const missingBaselineResolutionPath = join(tuneDir, "MISSING_BASELINE_RESOLUTION.yaml");
  await writeFile(missingBaselineResolutionPath, discoveryLoopRefinedPromptPackFixture().replace("baseline_resolution:", "baseline_resolution_missing:"), "utf8");
  const missingBaselineResolution = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(missingBaselineResolution.code !== 0, "missing baseline resolution dogfood fixture should block tune handoff");
  assert(missingBaselineResolution.output.includes("baseline_resolution must be a mapping"), "missing baseline resolution should name repair section");
  await unlink(missingBaselineResolutionPath);
}

type RefinedPromptPackFixtureKind = "ready" | "missing-baseline-audit" | "orphan-screen-prompt" | "missing-must-inherit" | "missing-must-remove";

function discoveryLoopValidationFixture(): string {
  return [
    "schema_version: 0.1.0",
    "contract_id: validation:dogfood-validation",
    "contract_type: validation",
    "artifact_type: validation_target",
    "title: Dogfood discovery-loop validation",
    "status: active",
    "trigger:",
    "  mode: user_explicit",
    "  requested_command: /ow:validation",
    "  reason: dogfood_fixture",
    "core_question: Does emotional memory increase repeat spoken practice?",
    "central_uncertainty: Whether companionship creates enough trust for daily English speaking.",
    "hypothesis: Learners return when the AI remembers emotional context and gives one concrete social rehearsal.",
    "target_behavior: User completes one short speaking mission and can name a real conversation to try.",
    "feature_classification:",
    "  existential:",
    "    - emotional memory note",
    "    - daily speaking mission",
    "  supporting:",
    "    - warm correction recap",
    "  later:",
    "    - travel mode",
    "  out_of_scope:",
    "    - exam preparation",
    "critical_assumptions:",
    "  - Emotional memory feels supportive rather than invasive.",
    "  - Daily missions are short enough to repeat.",
    "prototype_scope:",
    "  include:",
    "    - daily mission entry",
    "    - warm correction recap",
    "  exclude:",
    "    - exam preparation",
    "    - corporate learning dashboard",
    "prototype_experiment:",
    "  scenario: Learner opens the app before a casual social conversation.",
    "  must_show:",
    "    - remembered emotional note",
    "    - concrete scenario rehearsal",
    "    - privacy or memory control",
    "  must_not_show:",
    "    - grammar textbook lesson",
    "    - generic score dashboard",
    "observable_signals:",
    "  pass:",
    "    - User starts the daily mission.",
    "    - User completes a spoken or typed response.",
    "  fail:",
    "    - User cannot connect practice to a real social moment.",
    "  ambiguous:",
    "    - User likes the tone but does not return.",
    "acceptance:",
    "  - Prototype makes the daily speaking mission concrete.",
    "  - Prototype keeps memory controls visible.",
    "decision_rules:",
    "  continue:",
    "    - User can identify the next real conversation.",
    "  revise:",
    "    - Product thesis is visible but screen flow is too dense.",
    "  pivot:",
    "    - Emotional memory feels unsafe or irrelevant.",
    "  stop:",
    "    - Prototype reinforces exam-prep behavior.",
    "  needs_more_evidence:",
    "    - User reaction to memory is unclear.",
    "decision_options:",
    "  - continue",
    "  - revise",
    "  - pivot",
    "  - stop",
    "  - needs_more_evidence",
    "vision_gaps: []",
    "agent_readiness_gate:",
    "  status: ready_for_proto",
    "  blockers: []",
    "  warnings: []",
    "  write_authority: /ow:validation",
  ].join("\n");
}

function discoveryLoopStrategicPromptPackFixture(): string {
  return strategicPromptPackFixture("ready")
    .replaceAll("ready-proto-prompt-pack", "dogfood-strategic-prompt-pack")
    .replace("title: ready strategic prompt-pack fixture", "title: Dogfood strategic prompt pack")
    .replaceAll(".openworkflow/validation/validation-1/VALIDATION.yaml", ".openworkflow/validation/dogfood-validation/VALIDATION.yaml")
    .replaceAll(".openworkflow/prototypes/proto-stress-fixtures/prompts/", ".openworkflow/prototypes/dogfood-proto/prompts/")
    .replace("  status: not_started", "  status: complete")
    .replace("  generated_images: []", [
      "  generated_images:",
      "    - image_id: IMG_D1_01",
      "      direction_id: D1",
      "      prompt_id: screen-1",
      "      screen_name: Today practice entry",
      "      path: .openworkflow/prototypes/dogfood-proto/images/IMG_D1_01.png",
      "      metadata:",
      "        source_prompt_ref: .openworkflow/prototypes/dogfood-proto/prompts/D1.md",
      "        generated_at: 2026-05-22T00:00:00Z",
      "        generator: fixture",
      "        generation_status: complete",
      "        review_status: accepted_for_tune",
    ].join("\n"));
}

function discoveryLoopRefinedPromptPackFixture(): string {
  return refinedPromptPackFixture("ready")
    .replaceAll("ready-refined-prompt-pack", "dogfood-refined-prompt-pack")
    .replace("title: ready refined prompt-pack fixture", "title: Dogfood refined prompt pack")
    .replaceAll(".openworkflow/validation/validation-1/VALIDATION.yaml", ".openworkflow/validation/dogfood-validation/VALIDATION.yaml")
    .replaceAll(".openworkflow/prototypes/proto-1/EVIDENCE.yaml", ".openworkflow/prototypes/dogfood-proto/EVIDENCE.yaml")
    .replaceAll(".openworkflow/prototypes/proto-1/images/daily-entry.png", ".openworkflow/prototypes/dogfood-proto/images/IMG_D1_01.png")
    .replace("latest_approved_baseline_group_id: proto-1-accepted-v1", "latest_approved_baseline_group_id: dogfood-proto-accepted-v1");
}

function discoveryLoopDecisionFixture(): string {
  return [
    "schema_version: 0.1.0",
    "contract_id: decision:dogfood-benchmark",
    "contract_type: decision",
    "artifact_type: decision_record",
    "title: Dogfood benchmark prototype decision",
    "status: active",
    "reviewed_evidence:",
    "  - .openworkflow/prototypes/dogfood-proto/EVIDENCE.yaml",
    "  - .openworkflow/prototypes/dogfood-tune/REFINED_PROTO_PROMPT_PACK.yaml",
    "outcome: continue",
    "rationale: The tuned prompt pack preserves the emotional-memory product system and has accepted benchmark prototype image metadata.",
    "accepted_scope:",
    "  - accepted benchmark prototype image metadata",
    "  - daily mission entry screen",
    "  - memory trust control",
    "rejected_scope:",
    "  - exam dashboard",
    "  - grammar textbook flow",
    "revision_scope: []",
    "next_command: /ow:design",
    "follow_up_questions: []",
    "updated_at: 2026-05-22T00:00:00Z",
  ].join("\n");
}

function refinedPromptPackFixture(kind: RefinedPromptPackFixtureKind): string {
  const baselineAudit =
    kind === "missing-baseline-audit"
      ? ["baseline_audit: []"]
      : [
          "baseline_audit:",
          "  - source_screen_id: SRC_M01",
          "    screen_name: Daily mission entry",
          "    journey_stage: practice_start",
          "    user_goal: Begin a low-pressure speaking practice session.",
          "    system_state: AI remembers yesterday confidence and offers one scenario.",
          "    components:",
          "      - scenario card",
          "      - remembered confidence note",
          "      - speaking action",
          "    copy_tone: warm, concise, encouraging",
          "    represented_feature: remembered daily speaking mission",
          "    ai_or_system_behavior: remembers emotional state and suggests concrete phrase options",
          "    trust_controls:",
          "      - memory visibility",
          "      - correction boundary",
          "    visual_cues:",
          "      - calm mobile layout",
          "      - progress marker",
          "    must_preserve:",
          "      - emotional memory note",
          "      - primary speaking action",
          "    transform_or_remove:",
          "      - remove decorative badge clutter",
          "    assumptions: []",
        ];
  const mustInherit = kind === "missing-must-inherit" ? [] : ["product thesis", "daily mission loop", "memory trust controls"];
  const mustRemove = kind === "missing-must-remove" ? [] : ["decorative badge clutter"];
  const promptTarget = kind === "orphan-screen-prompt" ? "WEB_S99" : "WEB_S01";
  return [
    "schema_version: 0.1.0",
    `contract_id: prototype_evidence:${kind}-refined-prompt-pack`,
    "contract_type: prototype",
    `title: ${kind} refined prompt-pack fixture`,
    "status: draft",
    "artifact_type: prototype_evidence",
    "validation_target: .openworkflow/validation/validation-1/VALIDATION.yaml",
    "core_question: Can tune preserve product system while refining screen prompts?",
    "prototype_mode: image_prompt_pack",
    "prompt_pack_type: refined_proto_prompt_pack",
    "validation_input:",
    "  mode: validation_present",
    "  refs:",
    "    - .openworkflow/validation/validation-1/VALIDATION.yaml",
    "source:",
    "  command: /ow:tune",
    "  refs:",
    "    - .openworkflow/prototypes/proto-1/EVIDENCE.yaml",
    "tune_input:",
    "  baseline_source_type: images",
    "  baseline_refs:",
    "    - .openworkflow/prototypes/proto-1/images/daily-entry.png",
    "  tune_request: Remove decorative badge clutter and convert the accepted mobile screen into a desktop web screen.",
    "  target_form_factor: desktop_web",
    "  regeneration_scope: selected_screens",
    "  target_screen_count: 1",
    "  locked_screens:",
    "    - SRC_M01",
    "  locked_elements:",
    "    - emotional memory note",
    "    - primary speaking action",
    "  constraints:",
    "    - keep privacy and memory controls visible",
    "baseline_resolution:",
    "  latest_approved_baseline_group_id: proto-1-accepted-v1",
    "  latest_approved_baseline_ref: .openworkflow/prototypes/proto-1/EVIDENCE.yaml",
    "  baseline_lineage:",
    "    - .openworkflow/prototypes/proto-1/EVIDENCE.yaml",
    "  resolution_rule: Use the latest approved prototype group unless the user explicitly selects an older baseline.",
    "  stale_source_guard: Do not silently revert to pre-tune mobile source screens.",
    "carry_forward:",
    "  locked_screens:",
    "    - SRC_M01",
    "  locked_elements:",
    "    - emotional memory note",
    "    - primary speaking action",
    "  preserved_improvements:",
    "    - safer memory visibility from previous accepted tune pass",
    "  explicit_unlocks: []",
    "  cumulative_drift_guard: Preserve accepted improvements and locked elements unless explicitly unlocked.",
    ...baselineAudit,
    "product_system:",
    "  product_thesis: AI companion turns emotional memory into repeated spoken practice.",
    "  target_user: English learner who freezes in real conversation.",
    "  primary_loop: remember state, rehearse scenario, give warm correction, suggest real-world action",
    "  brand_promise: speaking practice feels personal and safe",
    "  interaction_model: guided companion rehearsal",
    "  information_architecture:",
    "    - mission entry",
    "    - phrase practice",
    "    - recap",
    "  design_language:",
    "    - calm",
    "    - trust-forward",
    "  component_vocabulary:",
    "    - scenario card",
    "    - confidence note",
    "    - speaking action",
    "  copywriting_style: warm and concrete",
    "  feature_system:",
    "    - emotional memory",
    "    - scenario rehearsal",
    "  trust_and_boundary_system:",
    "    - visible memory controls",
    "    - correction boundary",
    "  anti_goals:",
    "    - exam prep dashboard",
    "  stable_constants:",
    "    - companion memory",
    "    - daily speaking loop",
    "  adaptable_variables:",
    "    - layout density",
    "    - desktop navigation",
    "delta_rules:",
    "  must_inherit:",
    ...yamlStringList(mustInherit, 4),
    "  must_add:",
    "    - desktop information hierarchy",
    "  must_remove:",
    ...yamlStringList(mustRemove, 4),
    "  flexible_change:",
    "    - visual spacing",
    "    - secondary card order",
    "screen_delta_matrix:",
    "  - target_screen_id: WEB_S01",
    "    source_screen_ids:",
    "      - SRC_M01",
    "    preserve:",
    "      - emotional memory note",
    "      - primary speaking action",
    "    add:",
    "      - desktop side panel",
    "    remove:",
    "      - decorative badge clutter",
    "    transform:",
    "      - mobile stacked cards into desktop two-column layout",
    "    flexible:",
    "      - secondary metric placement",
    "    acceptance_criteria:",
    "      - Product thesis remains visible.",
    "      - Removed clutter does not reappear.",
    "screen_manifest:",
    "  - target_screen_id: WEB_S01",
    "    source_screen_ids:",
    "      - SRC_M01",
    "    screen_name: Desktop daily mission entry",
    "    target_form_factor: desktop_web",
    "    generation_scope: selected_screen_regeneration",
    "    dependencies:",
    "      - baseline product system",
    "global_design_prompt: Preserve the calm companion product system while adapting the screen to desktop web.",
    "screen_prompts:",
    "  - prompt_id: WEB_S01_PROMPT",
    `    target_screen_id: ${promptTarget}`,
    "    source_screen_ids:",
    "      - SRC_M01",
    "    screen_name: Desktop daily mission entry",
    "    image_role: refined desktop web screen",
    "    prompt: Create a desktop web screen that preserves the remembered emotional note, scenario rehearsal, speaking action, and privacy controls while removing decorative badge clutter.",
    "    negative_prompt: Do not add exam dashboards, generic LMS navigation, or decorative badge clutter.",
    "    acceptance_criteria:",
    "      - target screen maps back to SRC_M01",
    "      - primary speaking action remains prominent",
    "generation_order:",
    "  - WEB_S01",
    "acceptance_checklist:",
    "  - Baseline product thesis is preserved.",
    "  - Requested removals are absent.",
    "negative_constraints:",
    "  - Do not generate HTML.",
    "review_plan:",
    "  method: validate tune inheritance and screen binding",
    "result: pass",
    "handoff:",
    "  next_command: /ow:tune",
  ].join("\n");
}

function yamlStringList(values: string[], indent: number): string[] {
  const spaces = " ".repeat(indent);
  return values.length === 0 ? [`${spaces}[]`] : values.map((value) => `${spaces}- ${value}`);
}

function thinStrategicPromptPackFixture(): string {
  return [
    "schema_version: 0.1.0",
    "contract_id: prototype_evidence:thin-proto-prompt-pack",
    "contract_type: prototype",
    "title: Thin strategic prompt-pack fixture",
    "status: draft",
    "artifact_type: prototype_evidence",
    "validation_target: .openworkflow/validation/validation-1/VALIDATION.yaml",
    "core_question: Can thin prompt packs be rejected?",
    "prototype_mode: image_prompt_pack",
    "prompt_pack_type: strategic_proto_prompt_pack",
    "validation_input:",
    "  mode: validation_present",
    "  refs:",
    "    - .openworkflow/validation/validation-1/VALIDATION.yaml",
    "source:",
    "  command: /ow:proto",
    "negative_constraints: []",
    "review_plan:",
    "  method: validate required strategic prompt-pack fields",
    "result: not_reviewed",
    "handoff:",
    "  next_command: /ow:tune",
    "preflight_quality_gate:",
    "  vision_status: ready",
    "  validation_status: ready",
    "  can_proceed: true",
    "  blockers: []",
    "  next_command_when_blocked: /ow:vision",
    "direction_count_policy:",
    "  source: agent_default_after_user_delegation",
    "  resolved_count: 3",
    "directions: []",
  ].join("\n");
}

function thinImagePromptOnlyStrategicPromptPackFixture(): string {
  return [
    "schema_version: 0.1.0",
    "contract_id: prototype_evidence:thin-image-prompt-d1",
    "contract_type: prototype",
    "title: Thin image-prompt D1 fixture",
    "status: draft",
    "artifact_type: prototype_evidence",
    "validation_target: .openworkflow/validation/smart-city-validation/VALIDATION.yaml",
    "core_question: Can a short D1 image prompt be rejected when it lacks screen-bound product prototype fields?",
    "prototype_mode: image_prompt_pack",
    "prompt_pack_type: strategic_proto_prompt_pack",
    "validation_input:",
    "  mode: validation_present",
    "  refs:",
    "    - .openworkflow/validation/smart-city-validation/VALIDATION.yaml",
    "source:",
    "  command: /ow:proto",
    "  internal_stage: /ow:vision2prompt",
    "negative_constraints:",
    "  - Do not accept a single short screenshot prompt as a product prototype prompt pack.",
    "review_plan:",
    "  method: validate thin image prompt regression",
    "result: not_reviewed",
    "handoff:",
    "  next_command: /ow:tune",
    "preflight_quality_gate:",
    "  vision_status: ready",
    "  validation_status: ready",
    "  can_proceed: true",
    "  blockers: []",
    "  next_command_when_blocked: /ow:vision",
    "internal_pipeline:",
    "  orchestrator_command: /ow:proto",
    "  user_visible_command: /ow:proto",
    "  stages:",
    "    - stage_id: proto-preflight",
    "      command: /ow:proto",
    "      visibility: user",
    "      status: complete",
    "      outputs:",
    "        - preflight_quality_gate",
    "    - stage_id: vision2prompt",
    "      command: /ow:vision2prompt",
    "      visibility: internal",
    "      status: complete",
    "      outputs:",
    "        - prompt_text_manifest",
    "    - stage_id: prompt2proto",
    "      command: /ow:prompt2proto",
    "      visibility: internal",
    "      status: not_started",
    "      outputs:",
    "        - image_generation",
    "direction_count_policy:",
    "  source: user_input",
    "  ask_user_question_required: false",
    "  ask_user_question: null",
    "  resolved_count: 1",
    "normalized_input:",
    "  product_domain: smart city operations copilot",
    "  primary_user: City operations lead reviewing synthetic POC workflows",
    "  usage_context: Static dashboard concept review",
    "  current_alternative: GIS screenshots and report decks",
    "  core_pain: Product topology collapses into a generic dashboard prompt",
    "  desired_behavior_change: Reviewer should inspect a real product loop before image generation",
    "  strongest_success_signal: Reviewer can name screen states, data fields, and actions from the prompt pack",
    "  core_differentiator: Screen-bound product system beats a short image prompt",
    "  emotional_value: Operational confidence",
    "  functional_value: Actionable screen-level prompt source",
    "  trust_requirements: Human confirmation and synthetic-data disclosure",
    "  privacy_requirements: Synthetic POC data only",
    "  non_goals: Provider-backed image generation",
    "  future_opportunities: Smart city replay after fixture gates",
    "  validation_target: Reject short D1 prompt before /ow:prompt2proto",
    "strategic_core:",
    "  target_user: City operations lead",
    "  behavior_change: Move from report prompt to executable product prompt pack",
    "  mechanism: Validator-enforced screen-bound contract",
    "  differentiator: Prompt source must include states, data, actions, and trust controls",
    "  boundary_conditions: No image generation until gates pass",
    "  central_uncertainty: Whether validators catch short image-prompt regressions",
    "product_experience_model:",
    "  product_archetype: map-first smart city operations dashboard",
    "  primary_canvas: digital twin city map",
    "  information_architecture:",
    "    - map shell",
    "    - selected object drawer",
    "    - HIL controls",
    "  domain_object_model:",
    "    - district",
    "    - incident",
    "    - department task",
    "  primary_task_loop:",
    "    - select map object",
    "    - inspect recommendation",
    "    - confirm or block action",
    "  interaction_state_model:",
    "    - selected object",
    "    - pending human confirmation",
    "  data_realism_requirements:",
    "    - incident id",
    "    - owner",
    "    - timestamp",
    "  visual_language:",
    "    - map-first operations shell",
    "  anti_generic_constraints:",
    "    - no white-card AI governance dashboard",
    "prototype_reality_gate:",
    "  status: pass",
    "  trigger: before_image_generation",
    "  required_when_prompt_text_ready: true",
    "  dimensions:",
    "    - product_category_fit",
    "    - primary_canvas_fit",
    "    - domain_object_realism",
    "    - task_loop_completeness",
    "    - interaction_state_coverage",
    "    - data_realism",
    "    - anti_generic_constraints",
    "  failures: []",
    "  outcome_notes:",
    "    - The intentionally thin fixture passes reality gate to isolate screen-bound executability failure.",
    "  repair_route: /ow:vision2prompt",
    "prompt_pack_integrity_gate:",
    "  status: pass",
    "  trigger: before_image_generation",
    "  required_when_prompt_text_ready: true",
    "  dimensions:",
    "    - direction_count_matches",
    "    - prompt_text_refs_resolve",
    "    - generated_image_refs_resolve",
    "  failures: []",
    "  outcome_notes:",
    "    - The intentionally thin fixture keeps refs consistent to isolate executability failure.",
    "  repair_route: /ow:vision2prompt",
    "directions:",
    "  - direction_id: D1",
    "    name: Short dashboard image prompt",
    "    strategic_hypothesis: A short D1 prompt can produce a nice image, but not a reliable product prototype source.",
    "    validates: Whether validators reject one-shot image prompts.",
    "    main_risk: Downstream image generation invents the missing product system.",
    "    distinctness_rationale: Strategic difference is workflow completeness versus a short screenshot prompt.",
    "    strategic_fingerprint:",
    "      product_form: map-first smart city operations dashboard",
    "      trigger: operator selects a city object",
    "      interaction_model: map selection and HIL controls",
    "      emotional_driver: operational credibility",
    "      retention_mechanism: audit-ready workflow",
    "      metric: reviewer can name the task loop",
    "      main_risk: generic dashboard image prompt",
    "      trust_model: human confirms AI recommendation",
    "      privacy_model: synthetic city POC data only",
    "    prototype_prompt: Create a high-fidelity smart city AI dashboard with map, HIL, citations, and audit cards.",
    "    screen_prompts: []",
    "    pm_judgment: Not acceptable because it lacks screen-bound states, required components, data fields, actions, and acceptance criteria.",
    "build_recommendation:",
    "  first_direction_id: D1",
    "  why_first: It isolates the short image-prompt regression.",
    "  success_signals:",
    "    - Validator rejects missing screen-bound fields.",
    "  failure_signals:",
    "    - Validator accepts a short image prompt as generation-ready.",
    "  next_test_if_it_works: Add full dailin-grade fixtures.",
    "prompt_text_manifest:",
    "  status: ready_for_image_generation",
    "  directions_ready: true",
    "  direction_count: 1",
    "  prompt_text_refs:",
    "    - D1",
    "post_validate:",
    "  status: skipped",
    "  trigger: after_prompt_assets_ready",
    "  required_when_direction_count_gte: 2",
    "  skip_when_resolved_count: 1",
    "  threshold_policy:",
    "    method: strategic_fingerprint_similarity",
    "    max_pairwise_similarity: 0.65",
    "    comparison: pairwise",
    "  fingerprint_dimensions:",
    "    - product_form",
    "    - trigger",
    "    - interaction_model",
    "    - emotional_driver",
    "    - retention_mechanism",
    "    - metric",
    "    - main_risk",
    "    - trust_model",
    "    - privacy_model",
    "  comparisons: []",
    "  failures: []",
    "  outcome_notes:",
    "    - Single-direction thin fixture skips diversity comparison.",
    "  repair_route: /ow:vision2prompt",
    "image_generation:",
    "  status: not_started",
    "  batch_strategy: Do not generate from this thin prompt pack.",
    "  generated_images: []",
    "  collection_notes: []",
  ].join("\n");
}

type SmartCityFixtureKind = "ready" | "generic-ai-dashboard";

function smartCityStrategicPromptPackFixture(kind: SmartCityFixtureKind): string {
  const gateStatus = kind === "ready" ? "pass" : "fail";
  return [
    "schema_version: 0.1.0",
    `contract_id: prototype_evidence:smart-city-${kind}`,
    "contract_type: prototype",
    `title: Smart city ${kind} product reality fixture`,
    "status: active",
    "artifact_type: prototype_evidence",
    "validation_target: .openworkflow/validation/smart-city-validation/VALIDATION.yaml",
    "core_question: Can the prompt pack express a real smart city operations dashboard rather than a generic AI governance report?",
    "prototype_mode: image_prompt_pack",
    "prompt_pack_type: strategic_proto_prompt_pack",
    "validation_input:",
    "  mode: validation_present",
    "  refs:",
    "    - .openworkflow/validation/smart-city-validation/VALIDATION.yaml",
    "source:",
    "  command: /ow:proto",
    "negative_constraints:",
    "  - Do not make HIL, audit, and citations the visual main product.",
    "  - Do not use a white-card AI governance report dashboard.",
    "  - Do not split planning, incident, and capacity into scenario-only product directions.",
    "review_plan:",
    "  method: validate smart city product-category reality before image generation",
    "result: pass",
    "handoff:",
    "  next_command: /ow:tune",
    "preflight_quality_gate:",
    "  vision_status: ready",
    "  validation_status: ready",
    "  can_proceed: true",
    "  blockers: []",
    "  next_command_when_blocked: /ow:vision",
    "internal_pipeline:",
    "  orchestrator_command: /ow:proto",
    "  user_visible_command: /ow:proto",
    "  stages:",
    "    - stage_id: proto-preflight",
    "      command: /ow:proto",
    "      visibility: user",
    "      status: complete",
    "      outputs:",
    "        - preflight_quality_gate",
    "    - stage_id: vision2prompt",
    "      command: /ow:vision2prompt",
    "      visibility: internal",
    "      status: complete",
    "      outputs:",
    "        - product_experience_model",
    "        - prompt_text_manifest",
    "    - stage_id: prompt2proto",
    "      command: /ow:prompt2proto",
    "      visibility: internal",
    "      status: not_started",
    "      outputs:",
    "        - image_generation",
    "direction_count_policy:",
    "  source: user_input",
    "  ask_user_question_required: false",
    "  ask_user_question: null",
    "  resolved_count: 1",
    "normalized_input:",
    "  product_domain: smart city operations copilot",
    "  primary_user: City operations lead reviewing synthetic POC workflows",
    "  usage_context: Map-first digital twin command center for planning, incidents, and asset capacity",
    "  current_alternative: GIS screenshots, spreadsheets, PDFs, chat threads, and manual approval notes",
    "  core_pain: Spatial context, operational data, and responsible AI gates are disconnected",
    "  desired_behavior_change: Operator reviews AI-assisted city workflow from map context before human action",
    "  strongest_success_signal: Reviewer can identify the map-first operations loop and human decision boundary",
    "  core_differentiator: Responsible AI controls are embedded in a city operations product shell",
    "  emotional_value: The product feels operationally credible instead of speculative",
    "  functional_value: Map layers, domain objects, evidence, HIL, and audit appear in one workflow",
    "  trust_requirements: Synthetic data disclosure, citations, workflow trace, and human confirmation",
    "  privacy_requirements: Synthetic POC data only",
    "  non_goals: Production government integration, autonomous approval, compliance-grade audit",
    "  future_opportunities: Real GIS connector, IAM/RBAC/SSO, department workflow integration",
    "  validation_target: Test whether a static prompt pack can preserve smart city dashboard reality",
    "strategic_core:",
    "  target_user: City operations or solution-delivery leader evaluating a POC demo",
    "  behavior_change: Move from report explanation to accountable map-first AI-assisted review",
    "  mechanism: Digital twin map shell with layers, domain objects, evidence, HIL, and audit trace",
    "  differentiator: Smart city operations topology is primary; AI governance is embedded as controls",
    "  boundary_conditions: Synthetic data only, no autonomous approval, no production integration claim",
    "  central_uncertainty: Whether the prototype feels like a real smart city operations product",
    "prototype_brief:",
    "  product_name: CityFlow Copilot",
    "  positioning: Map-first responsible AI operations dashboard for synthetic smart city POC review",
    "  target_user: City operations lead reviewing planning, incident, and asset capacity workflows",
    "  current_alternative: GIS screenshots, spreadsheets, PDFs, chat threads, and manual approval notes",
    "  core_idea: Keep AI recommendations inside a digital twin map workflow with citations, HIL, and audit trace.",
    "  primary_loop:",
    "    - Select city object or incident on the map",
    "    - Inspect operational layers and detail metrics",
    "    - Review Copilot recommendation and citations",
    "    - Confirm or block the human-in-the-loop checkpoint",
    "  trust_boundaries:",
    "    - Synthetic POC data only",
    "    - AI recommends but cannot autonomously approve actions",
    "    - Human confirmation and audit trace stay visible",
    "  non_goals:",
    "    - production government integration",
    "    - autonomous approval",
    "    - compliance-grade audit",
    "  desired_feeling: Operationally credible, accountable, and map-first",
    "product_experience_model:",
    `  product_archetype: ${kind === "ready" ? "map-first smart city operations dashboard" : "generic AI governance report dashboard"}`,
    `  primary_canvas: ${kind === "ready" ? "digital twin city map with operational layers" : "white card summary dashboard"}`,
    "  information_architecture:",
    "    - city operations domains",
    "    - map layers",
    "    - selected object detail drawer",
    "    - workflow trace",
    "    - HIL controls",
    "    - audit and POC boundary",
    "  domain_object_model:",
    "    - district",
    "    - parcel",
    "    - parking asset",
    "    - hospital access incident",
    "    - PM2.5 sensor",
    "    - department task",
    "    - map pin",
    "    - capacity metric",
    "  primary_task_loop:",
    "    - Select a district, parcel, incident, or asset cluster on the map",
    "    - Inspect map layers and selected object details",
    "    - Run Copilot analysis",
    "    - Review citations, assumptions, and impacted departments",
    "    - Resolve human-in-the-loop checkpoint",
    "    - Inspect audit result and next integration step",
    "  interaction_state_model:",
    "    - selected map object",
    "    - active city layer",
    "    - warning or risk state",
    "    - pending human confirmation",
    "    - data gap",
    "    - right-side detail drawer",
    "  data_realism_requirements:",
    "    - parking spaces count",
    "    - PM2.5 and PM10 readings",
    "    - open or closed status",
    "    - capacity percentage",
    "    - risk level",
    "    - department owner",
    "    - timestamp",
    "  visual_language:",
    "    - map-first command shell",
    "    - dense operational sidebars",
    "    - layer toggles",
    "    - map pins and alerts",
    "    - detail drawer and workflow controls",
    "  anti_generic_constraints:",
    "    - no white-card AI governance report dashboard",
    "    - no scenario-only direction split",
    "    - no HIL/audit/citation as the visual main product",
    "screen_manifest:",
    "  - target_screen_id: map-shell",
    "    screen_name: Smart city map operations shell",
    "    journey_stage: orient and select",
    "    user_goal: Understand live city context before trusting an AI recommendation",
    "    system_state: map layer active with selected district and alerts",
    "    selected_object: Binjiang District capacity cluster",
    "    required_components:",
    "      - city domain navigation",
    "      - digital twin map",
    "      - layer toggles",
    "      - map pins and alerts",
    "      - selected object detail drawer",
    "    required_data_fields:",
    "      - parking occupancy percentage",
    "      - PM2.5 reading",
    "      - department owner",
    "      - timestamp",
    "      - risk level",
    "    primary_actions:",
    "      - select map object",
    "      - toggle layers",
    "      - run Copilot analysis",
    "    ai_behavior: Copilot summarizes selected-object risk and cites synthetic evidence before any action.",
    "    trust_controls:",
    "      - synthetic data badge",
    "      - source citations",
    "      - human confirmation required",
    "    example_copy:",
    "      - Capacity alert: 87% parking occupancy near Hospital A",
    "      - Human approval required before department dispatch",
    "    acceptance_criteria:",
    "      - Map is the dominant canvas.",
    "      - HIL and citations are controls inside the operations workflow.",
    "  - target_screen_id: selected-object-detail",
    "    screen_name: Selected object detail and HIL workflow",
    "    journey_stage: review and confirm",
    "    user_goal: Decide whether to confirm, revise, or block the AI-assisted workflow",
    "    system_state: detail drawer open with pending human confirmation",
    "    selected_object: Hospital access incident INC-2047",
    "    required_components:",
    "      - selected object drawer",
    "      - evidence list",
    "      - impacted departments",
    "      - HIL confirmation controls",
    "      - audit trace",
    "    required_data_fields:",
    "      - incident id",
    "      - affected route",
    "      - department owner",
    "      - confidence score",
    "      - last updated time",
    "    primary_actions:",
    "      - approve recommendation",
    "      - request revision",
    "      - inspect audit trace",
    "    ai_behavior: Copilot explains uncertainty, stale data, and next action while waiting for human confirmation.",
    "    trust_controls:",
    "      - confidence disclosure",
    "      - stale data warning",
    "      - audit log",
    "    example_copy:",
    "      - Pending human confirmation",
    "      - Confidence 0.78 based on synthetic traffic and hospital access data",
    "    acceptance_criteria:",
    "      - Selected object and pending confirmation are visible.",
    "      - Operational fields are concrete and city-specific.",
    "global_design_system_prompt:",
    "  visual_language: dense GIS command center with restrained operational styling",
    "  layout_system: left domain rail, full-bleed map canvas, right detail drawer, bottom workflow trace",
    "  component_vocabulary:",
    "    - layer toggles",
    "    - map pins",
    "    - risk badges",
    "    - detail drawer",
    "    - HIL action bar",
    "  information_density: high-density operational dashboard, not marketing or report cards",
    "  copy_tone: concise city-operations language with explicit POC boundaries",
    "  responsive_canvas_rules:",
    "    - desktop 16:9 primary canvas",
    "    - map remains dominant at all supported sizes",
    "  negative_visual_patterns:",
    "    - white-card AI governance report dashboard",
    "    - chatbot shell",
    "    - disconnected scenario cards",
    "quality_rubric:",
    "  prompt_executability:",
    "    - Another agent can generate the map shell without asking for missing product context.",
    "  strategic_distinctness:",
    "    - Product strategy is map-first operations workflow, not governance reporting.",
    "  product_specificity:",
    "    - Uses city assets, incidents, departments, layers, and synthetic POC data.",
    "  state_coverage:",
    "    - Covers selected object, active layer, alert, pending confirmation, and audit states.",
    "  trust_boundary_coverage:",
    "    - Shows citations, synthetic data disclosure, and human confirmation.",
    "prototype_reality_gate:",
    `  status: ${gateStatus}`,
    "  trigger: before_image_generation",
    "  required_when_prompt_text_ready: true",
    "  dimensions:",
    "    - product_category_fit",
    "    - primary_canvas_fit",
    "    - domain_object_realism",
    "    - task_loop_completeness",
    "    - interaction_state_coverage",
    "    - data_realism",
    "    - anti_generic_constraints",
    ...(kind === "ready"
      ? ["  failures: []"]
      : [
          "  failures:",
          "    - Prompt centers generic HIL, audit, and citation cards instead of a map-first operations shell.",
          "    - Planning, incident, and capacity are treated as scenario-only directions without shared product topology.",
        ]),
    "  outcome_notes:",
    `    - Smart city product reality fixture status is ${gateStatus}.`,
    "  repair_route: /ow:vision2prompt",
    "prompt_pack_integrity_gate:",
    "  status: pass",
    "  trigger: before_image_generation",
    "  required_when_prompt_text_ready: true",
    "  dimensions:",
    "    - direction_count_matches",
    "    - prompt_text_refs_resolve",
    "    - generated_image_refs_resolve",
    "  failures: []",
    "  outcome_notes:",
    "    - Prompt-pack direction count and prompt refs resolve to source directions.",
    "  repair_route: /ow:vision2prompt",
    "directions:",
    "  - direction_id: D1",
    "    name: Map-first operations shell",
    "    strategic_hypothesis: A map-first operations shell can make smart city Copilot judgment credible because the user sees city context, domain objects, workflow controls, and HIL in one product loop.",
    "    validates: Whether the product feels like a smart city dashboard rather than an AI governance report.",
    "    main_risk: The screen may still overemphasize governance controls over the city operations surface.",
    "    distinctness_rationale: Strategic difference is product form as a map-first operations dashboard with a city workflow loop, not a scenario-only AI report workflow.",
    "    strategic_fingerprint:",
    "      product_form: map-first smart city operations dashboard",
    "      trigger: operator selects a city object or active incident",
    "      interaction_model: map layer selection with detail drawer and HIL workflow control",
    "      emotional_driver: operational credibility and accountable control",
    "      retention_mechanism: audit-ready city operations workflow",
    "      metric: reviewer can explain the map-to-HIL task loop",
    "      main_risk: generic AI governance report dashboard",
    "      trust_model: AI recommends while human confirms actions",
    "      privacy_model: synthetic city POC data only",
    "    prototype_prompt: Design a high-fidelity desktop prototype for CityFlow Copilot, a map-first smart city operations dashboard for an operations lead who must review synthetic planning, incident, and capacity workflows without losing human control. The journey starts with the operator selecting a city object on the digital twin map, then reviewing concrete metrics, Copilot evidence, stale-data warnings, and HIL approval controls in a detail drawer. Use a dense desktop canvas with map-first layout, city domain rail, layer controls, audit citations, and operational data such as incident id, owner, confidence, timestamp, and capacity value. Do not make this a generic AI governance report, chatbot shell, or disconnected card wall. The user should feel credible control over AI-assisted city operations.",
    "    screen_prompts:",
    "      - prompt_id: map-shell",
    "        target_screen_id: map-shell",
    "        screen_name: Smart city map operations shell",
    "        image_role: primary product reality screen",
    "        prompt: Design the primary map shell screen for CityFlow Copilot at the first journey stage where a city operations lead enters the product and selects a live city object. Show a desktop map-first canvas with city domain rail, active planning/incident/capacity layers, map pins, selected district detail drawer, Copilot recommendation, HIL action controls, citations, and synthetic POC data boundary. When the operator selects a map object, the system should reveal metrics, owner, confidence, timestamp, and approval state without leaving the map. Do not show a white-card AI governance report, chatbot-first shell, or disconnected scenario cards. Acceptance criteria include map dominates the canvas, operational data is concrete, trust controls are visible, and the user feels in control.",
    "        negative_prompt: Do not show a white-card AI governance report dashboard or chatbot-first shell.",
    "        example_copy:",
    "          - Capacity alert: 87% parking occupancy near Hospital A",
    "          - Human approval required before department dispatch",
    "        acceptance_criteria:",
    "          - Map dominates the canvas.",
    "          - Planning, incident, and capacity appear as modules or layers in one product shell.",
    "      - prompt_id: selected-object-detail",
    "        target_screen_id: selected-object-detail",
    "        screen_name: Selected object detail and HIL workflow",
    "        image_role: interaction state screen",
    "        prompt: Design the selected-object detail screen for CityFlow Copilot after the operator clicks Parcel P-1182 or incident INC-2047 on the map. Keep the same map-first desktop layout while opening a detail drawer with zoning or route metrics, impacted departments, evidence rows, stale-data warning, pending human confirmation, and audit trace. The system response should explain the Copilot recommendation and require confirm, revise, or block before any dispatch or planning action. Include concrete copy such as confidence 0.78, traffic feed stale by 11 minutes, owner Operations Lead, and timestamp 09-42. Do not make the selected object a generic KPI card without map context. Acceptance criteria include selected object, system response, trust boundary, and user control are visible so the reviewer feels operational credibility.",
    "        negative_prompt: Do not make the selected object a generic KPI card without map context.",
    "        example_copy:",
    "          - Incident INC-2047 blocks hospital access route B",
    "          - Confidence 0.78, stale traffic feed warning",
    "        acceptance_criteria:",
    "          - Selected object and pending human confirmation are visible.",
    "          - Operational data fields are concrete.",
    "    pm_judgment: Strong enough because it preserves smart city product topology and treats governance as workflow controls.",
    "build_recommendation:",
    "  first_direction_id: D1",
    "  why_first: It directly tests whether a map-first product shell fixes the rejected generic AI dashboard outcome.",
    "  success_signals:",
    "    - Reviewer sees map-first operations dashboard before governance controls.",
    "    - Reviewer can identify city objects, layers, selected state, and HIL checkpoint.",
    "  failure_signals:",
    "    - Screen reads as AI governance report cards.",
    "    - Planning, incident, and capacity appear as unrelated scenario slides.",
    "  next_test_if_it_works: Run M97 smart city product-reality dogfood with new prompt compiler behavior.",
    "prompt_text_manifest:",
    "  status: ready_for_image_generation",
    "  directions_ready: true",
    "  direction_count: 1",
    "  prompt_text_refs:",
    "    - .openworkflow/prototypes/proto-stress-fixtures/prompts/smart-city-map-shell.md",
    "post_validate:",
    "  status: skipped",
    "  trigger: after_prompt_assets_ready",
    "  required_when_direction_count_gte: 2",
    "  skip_when_resolved_count: 1",
    "  threshold_policy:",
    "    method: strategic_fingerprint_similarity",
    "    max_pairwise_similarity: 0.65",
    "    comparison: pairwise",
    "  fingerprint_dimensions:",
    "    - product_form",
    "    - trigger",
    "    - interaction_model",
    "    - emotional_driver",
    "    - retention_mechanism",
    "    - metric",
    "    - main_risk",
    "    - trust_model",
    "    - privacy_model",
    "  comparisons: []",
    "  failures: []",
    "  outcome_notes:",
    "    - Single smart city product-shell direction intentionally skips diversity comparison.",
    "  repair_route: /ow:vision2prompt",
    "image_generation:",
    "  status: not_started",
    "  batch_strategy: Generate map-first smart city product shell screens only after product reality gate passes.",
    "  generated_images: []",
    "  collection_notes: []",
  ].join("\n");
}

type StrategicPromptPackFixtureKind = "ready" | "style-only" | "generic-dashboard" | "duplicate-fingerprint" | "near-duplicate-fingerprint" | "single-direction";

function strategicPromptPackFixture(kind: StrategicPromptPackFixtureKind): string {
  const rationales =
    kind === "style-only"
      ? [
          "Only changes visual style, color palette, card density, and illustration treatment.",
          "Only changes visual style, color palette, card density, and illustration treatment.",
          "Only changes visual style, color palette, card density, and illustration treatment.",
        ]
      : [
          "Strategic difference: product form shifts from open chat to guided daily mission workflow.",
          "Strategic difference: trigger changes from user-initiated practice to calendar-based social rehearsal.",
          "Strategic difference: main risk and metric focus move to trust calibration before free speaking.",
        ];
  const directionCount = kind === "single-direction" ? 1 : 3;
  const postValidateStatus = kind === "single-direction" ? "skipped" : "pass";
  const realityGateStatus = kind === "generic-dashboard" ? "fail" : "pass";
  const directionCountSource = kind === "single-direction" ? "user_input" : "agent_default_after_user_delegation";
  const askUserQuestionRequired = kind === "single-direction" ? "false" : "true";
  const directionRows =
    kind === "single-direction"
      ? directionLines("D1", "Daily Mission Companion", rationales[0] ?? "", kind)
      : [
          ...directionLines("D1", "Daily Mission Companion", rationales[0] ?? "", kind),
          ...directionLines("D2", "Calendar Rehearsal Coach", rationales[1] ?? "", kind),
          ...directionLines("D3", "Trust Calibration Lab", rationales[2] ?? "", kind),
        ];
  const promptRefs =
    kind === "single-direction"
      ? ["    - .openworkflow/prototypes/proto-stress-fixtures/prompts/D1.md"]
      : [
          "    - .openworkflow/prototypes/proto-stress-fixtures/prompts/D1.md",
          "    - .openworkflow/prototypes/proto-stress-fixtures/prompts/D2.md",
          "    - .openworkflow/prototypes/proto-stress-fixtures/prompts/D3.md",
        ];
  return [
    "schema_version: 0.1.0",
    `contract_id: prototype_evidence:${kind}-proto-prompt-pack`,
    "contract_type: prototype",
    `title: ${kind} strategic prompt-pack fixture`,
    "status: draft",
    "artifact_type: prototype_evidence",
    "validation_target: .openworkflow/validation/validation-1/VALIDATION.yaml",
    "core_question: Can the validated strategy produce distinct prototype prompt packs?",
    "prototype_mode: image_prompt_pack",
    "prompt_pack_type: strategic_proto_prompt_pack",
    "validation_input:",
    "  mode: validation_present",
    "  refs:",
    "    - .openworkflow/validation/validation-1/VALIDATION.yaml",
    "source:",
    "  command: /ow:proto",
    "  internal_stage: /ow:vision2prompt",
    "negative_constraints:",
    "  - Do not generate HTML.",
    "  - Do not collapse directions into visual skins.",
    "review_plan:",
    "  method: Compare strategic difference, screen specificity, and downstream image readiness.",
    "result: pass",
    "handoff:",
    "  next_command: /ow:tune",
    "preflight_quality_gate:",
    "  vision_status: ready",
    "  validation_status: ready",
    "  can_proceed: true",
    "  blockers: []",
    "  next_command_when_blocked: /ow:vision",
    "internal_pipeline:",
    "  orchestrator_command: /ow:proto",
    "  user_visible_command: /ow:proto",
    "  stages:",
    "    - stage_id: proto-preflight",
    "      command: /ow:proto",
    "      visibility: user",
    "      status: complete",
    "      outputs:",
    "        - preflight_quality_gate",
    "    - stage_id: vision2prompt",
    "      command: /ow:vision2prompt",
    "      visibility: internal",
    "      status: complete",
    "      outputs:",
    "        - prompt_text_manifest",
    "    - stage_id: prompt2proto",
    "      command: /ow:prompt2proto",
    "      visibility: internal",
    "      status: not_started",
    "      outputs:",
    "        - image_generation",
    "direction_count_policy:",
    `  source: ${directionCountSource}`,
    `  ask_user_question_required: ${askUserQuestionRequired}`,
    "  ask_user_question: How many strategically different prototype directions should be generated?",
    `  resolved_count: ${directionCount}`,
    "normalized_input:",
    "  product_domain: AI conversation practice",
    "  primary_user: Adult English learner who avoids real social conversations",
    "  usage_context: Daily mobile practice before or after real social moments",
    "  current_alternative: Generic chatbots, phrase books, and short video lessons",
    "  core_pain: Learners cannot transfer passive English knowledge into relaxed speaking",
    "  desired_behavior_change: User starts short real conversations with less fear",
    "  strongest_success_signal: User voluntarily returns after a real conversation and reports progress",
    "  core_differentiator: AI companion remembers emotional state and turns practice into personal rehearsal",
    "  emotional_value: User feels seen, encouraged, and gently stretched",
    "  functional_value: User gets scenario prompts, corrective feedback, and next-step practice",
    "  trust_requirements: Clear correction boundaries and transparent progress memory",
    "  privacy_requirements: Private conversation history and opt-out memory controls",
    "  non_goals: Exam prep, grammar textbook replacement, and corporate LMS",
    "  future_opportunities: Travel mode, workplace mode, and relationship-specific practice",
    "  validation_target: Test whether emotional companionship improves speaking practice retention",
    "strategic_core:",
    "  target_user: English learner who knows words but freezes in real conversation",
    "  behavior_change: Move from passive learning to repeated spoken practice",
    "  mechanism: Personal AI companion pairs emotional memory with scenario rehearsal",
    "  differentiator: Progress feedback is relational and concrete, not generic scoring",
    "  boundary_conditions: Must avoid feeling like an exam or scripted grammar lesson",
    "  central_uncertainty: Whether companionship creates enough trust to increase speaking frequency",
    "prototype_brief:",
    "  product_name: Pocket English Friend",
    "  positioning: Voice-first companion for low-pressure daily English rehearsal",
    "  target_user: Adult English learner who understands lessons but freezes in real social moments",
    "  current_alternative: Generic chatbot, phrase book, short video lesson, or exam-style grammar app",
    "  core_idea: A remembered AI companion turns one real-life scenario into a short speaking loop with correction and confidence recap.",
    "  primary_loop:",
    "    - Pick a daily social scenario",
    "    - Speak one answer",
    "    - Receive warm correction",
    "    - Save or decline memory",
    "    - Return for the next real-world conversation",
    "  trust_boundaries:",
    "    - Memory is visible and optional",
    "    - Corrections stay supportive and concrete",
    "    - User can opt out of saved emotional notes",
    "  non_goals:",
    "    - exam prep",
    "    - grammar textbook replacement",
    "    - corporate LMS",
    "  desired_feeling: Encouraged, seen, and ready to try one real conversation",
    "product_experience_model:",
    "  product_archetype: voice-first daily English companion app",
    "  primary_canvas: mobile voice practice room",
    "  information_architecture:",
    "    - Daily practice entry",
    "    - Scenario rehearsal",
    "    - Correction moment",
    "    - Progress recap",
    "    - Memory controls",
    "  domain_object_model:",
    "    - practice scenario",
    "    - remembered emotional note",
    "    - phrase suggestion",
    "    - spoken answer",
    "    - correction card",
    "    - progress recap",
    "  primary_task_loop:",
    "    - Pick a daily social scenario",
    "    - Speak or rehearse one answer",
    "    - Receive low-pressure correction",
    "    - Save optional memory",
    "    - Return for next practice",
    "  interaction_state_model:",
    "    - first-time entry",
    "    - remembered user returning",
    "    - user stuck",
    "    - correction accepted",
    "    - memory opt-out",
    "  data_realism_requirements:",
    "    - specific scenario title",
    "    - sample phrase suggestions",
    "    - concrete correction example",
    "    - confidence progress note",
    "  visual_language:",
    "    - warm mobile companion interface",
    "    - voice-first controls",
    "    - soft correction cards",
    "  anti_generic_constraints:",
    "    - no generic chatbot shell",
    "    - no exam dashboard",
    "    - no card wall without a voice practice loop",
    "screen_manifest:",
    "  - target_screen_id: practice-entry",
    "    screen_name: Today practice entry",
    "    journey_stage: start daily rehearsal",
    "    user_goal: Begin one realistic speaking practice without feeling tested",
    "    system_state: remembered user returning with a suggested scenario",
    "    selected_object: cafe small talk scenario",
    "    required_components:",
    "      - scenario title",
    "      - remembered emotional note",
    "      - phrase suggestions",
    "      - voice action button",
    "      - memory opt-out control",
    "    required_data_fields:",
    "      - scenario name",
    "      - remembered confidence note",
    "      - sample phrase",
    "      - difficulty label",
    "    primary_actions:",
    "      - start speaking",
    "      - switch scenario",
    "      - edit memory",
    "    ai_behavior: AI chooses a short scenario, recalls optional emotional context, and waits for user speech.",
    "    trust_controls:",
    "      - memory visibility",
    "      - opt-out control",
    "      - supportive correction promise",
    "    example_copy:",
    "      - Last time you said ordering coffee felt awkward.",
    "      - Try: Could I get that with oat milk?",
    "    acceptance_criteria:",
    "      - Voice practice action is primary.",
    "      - Memory and opt-out are visible.",
    "  - target_screen_id: progress-recap",
    "    screen_name: Progress recap",
    "    journey_stage: close the practice loop",
    "    user_goal: Understand one useful correction and one next real-world action",
    "    system_state: answer submitted and warm feedback ready",
    "    selected_object: spoken answer attempt",
    "    required_components:",
    "      - AI feedback message",
    "      - correction card",
    "      - confidence progress note",
    "      - next conversation suggestion",
    "      - saved memory toggle",
    "    required_data_fields:",
    "      - corrected phrase",
    "      - confidence score",
    "      - next scenario",
    "      - saved memory text",
    "    primary_actions:",
    "      - save phrase",
    "      - try again",
    "      - plan next conversation",
    "    ai_behavior: AI gives one gentle correction, records progress only with consent, and suggests a next real-world conversation.",
    "    trust_controls:",
    "      - editable memory",
    "      - correction boundary",
    "      - delete saved note",
    "    example_copy:",
    "      - Nice. Say could I get instead of give me for a softer tone.",
    "      - Save confidence note? You sounded more natural today.",
    "    acceptance_criteria:",
    "      - Feedback is concrete and supportive.",
    "      - Consent around memory is explicit.",
    "global_design_system_prompt:",
    "  visual_language: warm mobile companion with voice-first focus and restrained encouragement",
    "  layout_system: compact mobile screen with primary voice control, scenario context, and one feedback surface",
    "  component_vocabulary:",
    "    - voice action button",
    "    - scenario card",
    "    - memory note",
    "    - correction card",
    "    - confidence recap",
    "  information_density: low-friction mobile density with only one practice goal visible at a time",
    "  copy_tone: supportive, specific, and non-exam-like",
    "  responsive_canvas_rules:",
    "    - mobile portrait primary",
    "    - voice action remains thumb-reachable",
    "  negative_visual_patterns:",
    "    - generic chatbot shell",
    "    - exam dashboard",
    "    - card wall without a speaking loop",
    "quality_rubric:",
    "  prompt_executability:",
    "    - Another agent can generate each mobile screen without asking for missing journey or component details.",
    "  strategic_distinctness:",
    "    - Directions differ by product form, trigger, interaction model, and main risk.",
    "  product_specificity:",
    "    - Prompt includes voice practice, emotional memory, correction, and opt-out controls.",
    "  state_coverage:",
    "    - Covers returning user, practice entry, answer submitted, correction, and memory consent states.",
    "  trust_boundary_coverage:",
    "    - Memory controls and correction boundaries are visible.",
    "prototype_reality_gate:",
    `  status: ${realityGateStatus}`,
    "  trigger: before_image_generation",
    "  required_when_prompt_text_ready: true",
    "  dimensions:",
    "    - product_category_fit",
    "    - primary_canvas_fit",
    "    - domain_object_realism",
    "    - task_loop_completeness",
    "    - interaction_state_coverage",
    "    - data_realism",
    "    - anti_generic_constraints",
    ...(kind === "generic-dashboard"
      ? [
          "  failures:",
          "    - Prompt pack collapses the target product into a generic AI dashboard.",
          "    - Primary canvas and task loop are not credible for the product category.",
        ]
      : ["  failures: []"]),
    "  outcome_notes:",
    `    - Fixture prototype reality gate status is ${realityGateStatus}.`,
    "  repair_route: /ow:vision2prompt",
    "prompt_pack_integrity_gate:",
    "  status: pass",
    "  trigger: before_image_generation",
    "  required_when_prompt_text_ready: true",
    "  dimensions:",
    "    - direction_count_matches",
    "    - prompt_text_refs_resolve",
    "    - generated_image_refs_resolve",
    "  failures: []",
    "  outcome_notes:",
    "    - Prompt-pack direction count and prompt refs resolve to source directions.",
    "  repair_route: /ow:vision2prompt",
    "directions:",
    ...directionRows,
    "build_recommendation:",
    "  first_direction_id: D1",
    "  why_first: It tests the central retention hypothesis with the shortest daily loop.",
    "  success_signals:",
    "    - User records or types one practice answer for three consecutive days.",
    "    - User can name one real conversation they feel ready to try.",
    "  failure_signals:",
    "    - User treats the flow like another lesson and skips emotional check-ins.",
    "    - User cannot connect practice to a real social moment.",
    "  next_test_if_it_works: Expand from daily missions into calendar-triggered rehearsal.",
    "prompt_text_manifest:",
    "  status: ready_for_image_generation",
    "  directions_ready: true",
    `  direction_count: ${directionCount}`,
    "  prompt_text_refs:",
    ...promptRefs,
    "post_validate:",
    `  status: ${postValidateStatus}`,
    "  trigger: after_prompt_assets_ready",
    "  required_when_direction_count_gte: 2",
    "  skip_when_resolved_count: 1",
    "  threshold_policy:",
    "    method: strategic_fingerprint_similarity",
    "    max_pairwise_similarity: 0.65",
    "    comparison: pairwise",
    "  fingerprint_dimensions:",
    "    - product_form",
    "    - trigger",
    "    - interaction_model",
    "    - emotional_driver",
    "    - retention_mechanism",
    "    - metric",
    "    - main_risk",
    "    - trust_model",
    "    - privacy_model",
    "  comparisons: []",
    "  failures: []",
    "  outcome_notes:",
    `    - Fixture post-validation status is ${postValidateStatus}.`,
    "  repair_route: /ow:vision2prompt",
    "image_generation:",
    "  status: not_started",
    "  batch_strategy: Generate each direction as two mobile screens with consistent product system metadata.",
    "  generated_images: []",
    "  collection_notes: []",
  ].join("\n");
}

function directionLines(id: string, name: string, distinctness: string, fixtureKind: StrategicPromptPackFixtureKind): string[] {
  const fingerprint = strategicFingerprintLines(id, fixtureKind);
  return [
    `  - direction_id: ${id}`,
    `    name: ${name}`,
    `    strategic_hypothesis: ${name} can turn validated emotional trust into repeat practice behavior.`,
    "    validates: Whether this product strategy changes speaking practice frequency.",
    "    main_risk: The user may like the concept but avoid actual speaking.",
    `    distinctness_rationale: "${distinctness}"`,
    "    strategic_fingerprint:",
    ...fingerprint,
    "    prototype_prompt: Design a high-fidelity mobile prototype for Pocket English Friend, a voice-first social English practice app for a Chinese-speaking adult who wants low-pressure daily speaking confidence. The product journey should move from a remembered emotional check-in to a concrete daily scenario, one speaking action, AI rescue when the user freezes, a correction card, and a progress recap. Show the AI system response with easy and natural sentence options, visible memory consent, edit/delete controls, and supportive copy tied to real social situations. Use calm mobile visual direction with one primary action per screen and soft feedback, but do not show an exam dashboard, generic chatbot, leaderboard, or guilt streak. The user should feel safe, in control of memory, and ready to speak one small sentence.",
    "    screen_prompts:",
    "      - prompt_id: screen-1",
    "        target_screen_id: practice-entry",
    "        screen_name: Today practice entry",
    "        image_role: primary practice entry screen",
    "        standalone_prompt: Design the Today practice entry screen for Pocket English Friend as the first journey stage for a Chinese-speaking adult who wants low-pressure social English practice. Show a mobile product surface with the remembered emotional note, daily scenario card, sample phrase suggestions, primary speak button, privacy opt-out, and calm visual direction. When the user starts practice, the AI should offer one easy sentence and one natural sentence so the user can speak without feeling judged. Do not show an exam dashboard, generic chatbot, leaderboard, or decorative card wall. Acceptance criteria include voice practice action, memory control, example copy, and safe feeling are visible.",
    "        prompt_text: Design the Today practice entry screen for Pocket English Friend as the first journey stage for a Chinese-speaking adult who wants low-pressure social English practice. Show a mobile product surface with the remembered emotional note, daily scenario card, sample phrase suggestions, primary speak button, privacy opt-out, and calm visual direction. When the user starts practice, the AI should offer one easy sentence and one natural sentence so the user can speak without feeling judged. Do not show an exam dashboard, generic chatbot, leaderboard, or decorative card wall. Acceptance criteria include voice practice action, memory control, example copy, and safe feeling are visible.",
    "        negative_prompt: Do not show an exam dashboard, generic chatbot, or card wall without voice practice.",
    "        example_copy:",
    "          - Last time you said ordering coffee felt awkward.",
    "          - Try: Could I get that with oat milk?",
    "        acceptance_criteria:",
    "          - Voice practice action is primary.",
    "          - Memory and opt-out are visible.",
    "      - prompt_id: screen-2",
    "        target_screen_id: progress-recap",
    "        screen_name: Progress recap",
    "        image_role: follow-up feedback screen",
    "        standalone_prompt: Design the Progress recap screen for Pocket English Friend after the user finishes one voice practice answer. Show a mobile follow-up state with concrete AI feedback, one corrected sentence, confidence progress, memory-save consent, next conversation suggestion, and a calm visual layout that keeps the user in control. The system response should explain the correction gently, offer a try-again action, and ask before saving any memory. Include example copy and data such as one new phrase, confidence up from 2 to 3, and Save this memory for next time. Do not make feedback punitive, exam-like, privacy-opaque, or guilt-based. Acceptance criteria include correction, system response, memory control, and user feeling of progress are visible.",
    "        prompt_text: Design the Progress recap screen for Pocket English Friend after the user finishes one voice practice answer. Show a mobile follow-up state with concrete AI feedback, one corrected sentence, confidence progress, memory-save consent, next conversation suggestion, and a calm visual layout that keeps the user in control. The system response should explain the correction gently, offer a try-again action, and ask before saving any memory. Include example copy and data such as one new phrase, confidence up from 2 to 3, and Save this memory for next time. Do not make feedback punitive, exam-like, privacy-opaque, or guilt-based. Acceptance criteria include correction, system response, memory control, and user feeling of progress are visible.",
    "        negative_prompt: Do not make feedback punitive, exam-like, or privacy-opaque.",
    "        example_copy:",
    "          - Say could I get instead of give me for a softer tone.",
    "          - Save this memory for next time?",
    "        acceptance_criteria:",
    "          - Feedback is concrete and supportive.",
    "          - Consent around memory is explicit.",
    "    pm_judgment: Strong enough for image prototype generation because it names user behavior, system response, trust control, and sample content.",
  ];
}

function strategicFingerprintLines(id: string, fixtureKind: StrategicPromptPackFixtureKind): string[] {
  if (fixtureKind === "duplicate-fingerprint") {
    return [
      "      product_form: daily companion mission",
      "      trigger: user opens app for daily practice",
      "      interaction_model: guided chat rehearsal",
      "      emotional_driver: warm confidence support",
      "      retention_mechanism: daily streak and recap",
      "      metric: three day speaking practice return",
      "      main_risk: user avoids real speaking",
      "      trust_model: remembered encouragement with clear correction",
      "      privacy_model: private conversation memory controls",
    ];
  }
  if (fixtureKind === "near-duplicate-fingerprint") {
    const nearDuplicates: Record<string, string[]> = {
      D1: [
        "      product_form: daily companion mission",
        "      trigger: user opens app for daily practice",
        "      interaction_model: guided chat rehearsal",
        "      emotional_driver: warm confidence support",
        "      retention_mechanism: daily streak and recap",
        "      metric: three day speaking practice return",
        "      main_risk: user avoids real speaking",
        "      trust_model: remembered encouragement with clear correction",
        "      privacy_model: private conversation memory controls",
      ],
      D2: [
        "      product_form: daily companion practice mission",
        "      trigger: user opens mobile app for daily practice",
        "      interaction_model: guided chat speaking rehearsal",
        "      emotional_driver: warm confidence encouragement",
        "      retention_mechanism: daily streak plus recap",
        "      metric: three day speaking practice return rate",
        "      main_risk: user avoids real speaking moments",
        "      trust_model: remembered encouragement with gentle correction",
        "      privacy_model: private conversation memory controls",
      ],
      D3: [
        "      product_form: daily companion rehearsal mission",
        "      trigger: user opens app for daily speaking practice",
        "      interaction_model: guided conversational rehearsal",
        "      emotional_driver: warm support for confidence",
        "      retention_mechanism: daily recap and streak",
        "      metric: three day practice return",
        "      main_risk: user still avoids real speaking",
        "      trust_model: remembered encouragement with clear corrections",
        "      privacy_model: private memory controls for conversations",
      ],
    };
    return nearDuplicates[id] ?? nearDuplicates.D1 ?? [];
  }
  const byId: Record<string, string[]> = {
    D1: [
      "      product_form: daily companion mission",
      "      trigger: user opens app for daily practice",
      "      interaction_model: guided chat rehearsal",
      "      emotional_driver: warm confidence support",
      "      retention_mechanism: daily streak and recap",
      "      metric: three day speaking practice return",
      "      main_risk: user avoids real speaking",
      "      trust_model: remembered encouragement with clear correction",
      "      privacy_model: private conversation memory controls",
    ],
    D2: [
      "      product_form: calendar rehearsal coach",
      "      trigger: upcoming real social event",
      "      interaction_model: scenario planning checklist",
      "      emotional_driver: readiness before a specific moment",
      "      retention_mechanism: event followup loop",
      "      metric: completed rehearsal before event",
      "      main_risk: calendar prompts feel intrusive",
      "      trust_model: explicit event permission",
      "      privacy_model: user controlled calendar context",
    ],
    D3: [
      "      product_form: trust calibration lab",
      "      trigger: user asks for correction confidence",
      "      interaction_model: feedback slider and repair practice",
      "      emotional_driver: safety before speaking freely",
      "      retention_mechanism: visible confidence calibration",
      "      metric: correction acceptance rate",
      "      main_risk: feedback feels too clinical",
      "      trust_model: transparent correction boundary",
      "      privacy_model: ephemeral practice snippets",
    ],
  };
  return byId[id] ?? byId.D1 ?? [];
}

async function verifyNoDefaultCodexCommands(root: string): Promise<void> {
  assert(!(await exists(join(root, ".codex", "commands", "ow"))), ".codex command references generated unexpectedly");
  assert(!(await exists(join(root, ".codex", "skills"))), ".codex skills generated unexpectedly");
}

async function verifyPlanningArtifactRegistrationContract(): Promise<void> {
  const contracts = await read(join(REPO_ROOT, "references", "planning-artifact-contracts.md"));
  const exposure = await read(join(REPO_ROOT, "references", "planning-skill-runtime-exposure.md"));
  for (const required of [
    "Planning Artifact Registration",
    "`SUMMARY.yaml`: default queue handoff and read-model artifact",
    "`CHANGE_ANALYSIS.yaml`: advisory cross-queue recommendation evidence",
    "`SELECTED_CHANGE.yaml`: implementation boundary",
    "`LOCAL_COMMIT_EVIDENCE.yaml`: local implementation evidence",
    "`HIGH_RISK_DECISION_REPORT.md`: stop packet",
    "Read-model order for planning work",
    "`CANDIDATE_CHANGES.yaml` only when source truth is needed",
  ]) {
    assert(contracts.includes(required), `planning artifact registration contract missing: ${required}`);
  }
  assert(exposure.includes("must not load full planning history by default"), "runtime exposure reference lost summary-first read-model rule");
  assert(exposure.includes("depend on that registration contract"), "runtime exposure reference does not depend on planning registration contract");
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
  for (const key of ["schema_version", "command", "ok", "root", "data", "warnings", "errors", "health_errors", "effects", "next_actions"]) {
    assert(key in report, `${command} json missing envelope key ${key}`);
  }
  assert(report.command === command, `${command} json command mismatch`);
  assert(typeof report.ok === "boolean", `${command} json ok must be boolean`);
  assert(Array.isArray(report.warnings), `${command} json warnings must be array`);
  assert(Array.isArray(report.errors), `${command} json errors must be array`);
  assert(Array.isArray(report.health_errors), `${command} json health_errors must be array`);
  assert(Array.isArray(report.next_actions), `${command} json next_actions must be array`);
  const effects = record(report.effects, `${command} effects`);
  for (const key of ["planned", "written", "updated", "removed", "skipped", "unchanged", "preserved", "migration_notes"]) {
    assert(Array.isArray(effects[key]), `${command} effects.${key} must be array`);
  }
  return report;
}

function nonEmptyArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
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
