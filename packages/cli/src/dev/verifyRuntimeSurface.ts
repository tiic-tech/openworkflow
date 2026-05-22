#!/usr/bin/env node
import { mkdir, mkdtemp, readdir, readFile, rm, stat, unlink, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
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
    "Each direction must include direction_id",
    "<prompt_text_manifest>",
    "ready_for_image_generation",
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
    "ready_for_image_generation",
    "Do not generate images",
  ]) {
    assert(content.includes(required), `ow-vision2prompt missing internal prompt guidance: ${required}`);
  }
}

function verifyPrompt2ProtoSkill(content: string): void {
  for (const required of [
    "internal-prompt-text-to-prototype-images",
    "<command_visibility>internal</command_visibility>",
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
    "/ow:tune resolves to the current prototype prompt pack or accepted baseline screen group by default.",
    "/ow:tune:proto is an explicit alias",
    "<baseline_screen_audit>",
    "Treat the screen group as one product system",
    "<inheritance_delta_rules>",
    "MUST_INHERIT, MUST_ADD, MUST_REMOVE, and FLEXIBLE_CHANGE",
    "<screen_manifest>",
    "Every screen prompt must include prompt_id",
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
  assert(
    styleOnly.output.includes("distinctness_rationale must name a strategic difference, not only visual style"),
    "style-only strategic prompt-pack failure should name strategic distinctness",
  );
  await unlink(styleOnlyPath);

  const readyPath = join(fixtureDir, "READY_PROTO_PROMPT_PACK.yaml");
  await writeFile(readyPath, strategicPromptPackFixture("ready"), "utf8");
  const ready = await runCaptureStatus(["node", CLI, "validate", "--root", root, "--json"], env);
  assert(ready.code === 0, `proto-ready strategic prompt-pack fixture should pass validation: ${ready.output}`);
  await unlink(readyPath);
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

function strategicPromptPackFixture(kind: "ready" | "style-only"): string {
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
    "  source: agent_default_after_user_delegation",
    "  ask_user_question_required: true",
    "  ask_user_question: How many strategically different prototype directions should be generated?",
    "  resolved_count: 3",
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
    "directions:",
    ...directionLines("D1", "Daily Mission Companion", rationales[0] ?? ""),
    ...directionLines("D2", "Calendar Rehearsal Coach", rationales[1] ?? ""),
    ...directionLines("D3", "Trust Calibration Lab", rationales[2] ?? ""),
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
    "  prompt_text_refs:",
    "    - .openworkflow/prototypes/proto-stress-fixtures/prompts/D1.md",
    "    - .openworkflow/prototypes/proto-stress-fixtures/prompts/D2.md",
    "    - .openworkflow/prototypes/proto-stress-fixtures/prompts/D3.md",
    "post_validate:",
    "  status: pass",
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
    "    - Fixture assumes post-validation passed so style-only checks remain isolated.",
    "  repair_route: /ow:vision2prompt",
    "image_generation:",
    "  status: not_started",
    "  batch_strategy: Generate each direction as two mobile screens with consistent product system metadata.",
    "  generated_images: []",
    "  collection_notes: []",
  ].join("\n");
}

function directionLines(id: string, name: string, distinctness: string): string[] {
  return [
    `  - direction_id: ${id}`,
    `    name: ${name}`,
    `    strategic_hypothesis: ${name} can turn validated emotional trust into repeat practice behavior.`,
    "    validates: Whether this product strategy changes speaking practice frequency.",
    "    main_risk: The user may like the concept but avoid actual speaking.",
    `    distinctness_rationale: "${distinctness}"`,
    "    prototype_prompt: Mobile app prototype with a concrete daily scenario, emotional check-in, AI response, correction moment, and progress recap.",
    "    screen_prompts:",
    "      - prompt_id: screen-1",
    "        screen_name: Today practice entry",
    "        prompt_text: Show a mobile screen where the user sees a real-life scenario, a remembered emotional note, sample phrase suggestions, and a primary speaking action.",
    "      - prompt_id: screen-2",
    "        screen_name: Progress recap",
    "        prompt_text: Show a mobile screen where the AI gives warm feedback, highlights one new phrase, records confidence progress, and suggests a next real-world conversation.",
    "    pm_judgment: Strong enough for image prototype generation because it names user behavior, system response, trust control, and sample content.",
  ];
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
