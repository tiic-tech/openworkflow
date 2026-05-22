#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CURRENT_FILE = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(dirname(CURRENT_FILE), "../../../..");
const CLI = join(REPO_ROOT, "dist", "cli", "src", "index.js");

const VALIDATION_PATH = ".openworkflow/validation/val-1/VALIDATION.yaml";
const PROTOTYPE_PATH = ".openworkflow/prototypes/proto-1/EVIDENCE.yaml";
const PROTOTYPE_SUMMARY_PATH = ".openworkflow/prototypes/proto-1/SUMMARY.yaml";

async function main(): Promise<number> {
  await assertFile(CLI);
  const tempRoot = await mkdtemp(join(tmpdir(), "openworkflow-agent-e2e-"));
  try {
    const target = join(tempRoot, "consumer");
    const codexHome = join(tempRoot, "codex-home");
    const env = { ...process.env, CODEX_HOME: codexHome };

    await mkdir(target, { recursive: true });
    await writeFile(join(target, "AGENTS.md"), "# Consumer Agents\n\nUser insight stays.\n", "utf8");
    await run(["node", CLI, "init", target, "--tools", "codex", "--force"], env);

    await verifyMinimalInit(target);
    await verifyFreshEntry(target, env);
    await createValidationArtifact(target, env);
    await createThinPrototypeArtifact(target, env);
    await verifyThinSummaryTrustGates(target, env);
    await verifyPlanningArtifactRegistrationContract();

    const sourceSnapshots = await readSnapshots(target, [
      VALIDATION_PATH,
      ".openworkflow/validation/VALIDATION_INDEX.yaml",
      PROTOTYPE_PATH,
      PROTOTYPE_SUMMARY_PATH,
      ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
    ]);
    await verifyCleanAndSyncRecovery(target, env, sourceSnapshots);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }

  console.log("OpenWorkflow Agent-first E2E verification passed.");
  return 0;
}

async function verifyMinimalInit(target: string): Promise<void> {
  for (const path of [
    ".openworkflow/config.yaml",
    ".openworkflow/CURRENT_STATE.yaml",
    ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
    ".openworkflow/audit/COMMAND_AUDIT_INDEX.yaml",
    ".openworkflow/audit/CONTEXT_PACKETS.yaml",
    ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
    ".openworkflow/audit/DISCLOSURE_LEVELS.yaml",
    ".agents/openworkflow-adapter.yaml",
    ".agents/skills/ow-vision/SKILL.md",
    "AGENTS.md",
  ]) {
    await assertFile(join(target, path));
  }
  const agents = await read(join(target, "AGENTS.md"));
  assert(agents.includes("User insight stays."), "init did not preserve user AGENTS.md content");
  assert(agents.includes("BEGIN OPENWORKFLOW AGENT GUIDE"), "init did not append OpenWorkflow managed block");
  await assertNoLazyStageArtifacts(target);
}

async function verifyFreshEntry(target: string, env: NodeJS.ProcessEnv): Promise<void> {
  const handoff = parseJsonReport(await runCapture(["node", CLI, "handoff", "--root", target, "--json"], env), "handoff");
  const handoffData = record(handoff.data, "fresh handoff data");
  assert(handoff.ok === true, "fresh handoff should pass");
  assert(handoffData.handoff_ok === true, "fresh handoff should expose handoff_ok=true");
  assert(handoffData.next_command === "/ow:vision", "fresh handoff should point to /ow:vision");

  const context = parseJsonReport(await runCapture(["node", CLI, "context", "--root", target, "--handoff", "--json"], env), "context");
  const contextData = record(context.data, "fresh handoff context data");
  assert(context.ok === true, "fresh context --handoff should pass");
  assert(contextData.handoff_mode === true, "fresh context --handoff should expose handoff_mode=true");
  assert(contextData.normalized_command === "/ow:vision", "fresh context should default to CURRENT_STATE.next_command");

  const check = parseJsonReport(await runCapture(["node", CLI, "check", "/ow:vision", "--root", target, "--json"], env), "check");
  assert(check.ok === true, "fresh /ow:vision check should pass");
  await assertNoLazyStageArtifacts(target);
}

async function createValidationArtifact(target: string, env: NodeJS.ProcessEnv): Promise<void> {
  const dryDraft = parseJsonReport(await runCapture(["node", CLI, "draft", "--root", target, "--artifact", "validation_target", "--id", "val-1", "--json"], env), "draft");
  const dryEffects = record(dryDraft.effects, "validation dry draft effects");
  assert(Array.isArray(dryEffects.planned) && dryEffects.planned.includes(VALIDATION_PATH), "validation dry draft did not plan artifact path");
  assert(!(await exists(join(target, ".openworkflow", "validation"))), "validation dry draft created a lazy stage directory");

  parseJsonReport(await runCapture(["node", CLI, "draft", "--root", target, "--artifact", "validation_target", "--id", "val-1", "--write", "--json"], env), "draft");
  await writeFile(join(target, VALIDATION_PATH), [
    "schema_version: 0.1.0",
    "contract_id: validation:val-1",
    "contract_type: validation",
    "artifact_type: validation_target",
    "title: Agent E2E validation target",
    "status: active",
    "core_question: Can an Agent continue from low-context OpenWorkflow handoff?",
    "central_uncertainty: Whether a low-context Agent can trust managed OpenWorkflow read models before loading raw evidence.",
    "hypothesis: A strict handoff and summary-quality gate lets the Agent continue safely from compact context.",
    "target_behavior: The Agent starts from handoff, checks readiness, and refuses thin evidence before downstream work.",
    "feature_classification:",
    "  existential:",
    "    - first consumer trust",
    "  supporting: []",
    "  later: []",
    "  out_of_scope: []",
    "critical_assumptions:",
    "  - Agents need one strict trust gate before context loading.",
    "prototype_scope:",
    "  include:",
    "    - Build a thin prototype artifact to test strict handoff quality.",
    "  exclude: []",
    "prototype_experiment:",
    "  scenario: Agent resumes a repository after validation and then encounters thin prototype evidence.",
    "  must_show:",
    "    - Handoff succeeds after validation registration.",
    "    - Strict summary quality blocks thin prototype evidence.",
    "  must_not_show: []",
    "observable_signals:",
    "  pass:",
    "    - /ow:proto readiness check passes after current validation is registered.",
    "  fail:",
    "    - /ow:proto readiness check reports thin_validation for the completed validation fixture.",
    "  ambiguous: []",
    "acceptance:",
    "  - Strict handoff blocks current-but-thin evidence.",
    "decision_rules:",
    "  continue:",
    "    - /ow:proto readiness passes and thin prototype summary is blocked by strict handoff.",
    "  revise:",
    "    - /ow:proto readiness fails because validation fixture lacks required prototype-readiness fields.",
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

  const register = parseJsonReport(await runCapture(["node", CLI, "register", "--root", target, "--artifact", VALIDATION_PATH, "--current", "--next-command", "/ow:proto", "--write", "--json"], env), "register");
  const registerEffects = record(register.effects, "validation register effects");
  assert(Array.isArray(registerEffects.updated) && registerEffects.updated.includes(".openworkflow/CURRENT_STATE.yaml"), "validation register did not update CURRENT_STATE");

  const protoCheck = parseJsonReport(await runCapture(["node", CLI, "check", "/ow:proto", "--root", target, "--json"], env), "check");
  assert(protoCheck.ok === true, "/ow:proto check should pass after active validation registration");
}

async function createThinPrototypeArtifact(target: string, env: NodeJS.ProcessEnv): Promise<void> {
  parseJsonReport(await runCapture(["node", CLI, "draft", "--root", target, "--artifact", "prototype_evidence", "--id", "proto-1", "--write", "--json"], env), "draft");
  await writeFile(join(target, PROTOTYPE_PATH), [
    "schema_version: 0.1.0",
    "contract_id: prototype:proto-1",
    "contract_type: prototype",
    "artifact_type: prototype_evidence",
    "title: Agent E2E thin prototype",
    "status: reviewed",
    "validation_target: validation:val-1",
    "core_question: Can strict handoff detect thin evidence?",
    "result: promising",
    "handoff:",
    "  next_command: /ow:tune",
    "",
  ].join("\n"), "utf8");
  parseJsonReport(await runCapture(["node", CLI, "register", "--root", target, "--artifact", PROTOTYPE_PATH, "--current", "--next-command", "/ow:tune", "--write", "--json"], env), "register");
  const tuneCheck = parseJsonReport(await runCapture(["node", CLI, "check", "/ow:tune", "--root", target, "--json"], env), "check");
  assert(tuneCheck.ok === true, "/ow:tune check should pass after prototype registration");

  parseJsonReport(await runCapture(["node", CLI, "summarize", "--root", target, "--artifact", PROTOTYPE_PATH, "--write", "--json"], env), "summarize");
  await assertFile(join(target, PROTOTYPE_SUMMARY_PATH));
}

async function verifyThinSummaryTrustGates(target: string, env: NodeJS.ProcessEnv): Promise<void> {
  const summaries = parseJsonReport(await runCapture(["node", CLI, "summaries", "--root", target, "--json"], env), "summaries");
  assert(summaries.ok === true, "non-strict summaries should pass for current-but-thin summaries");
  const summariesData = record(summaries.data, "summaries data");
  assert(summaryStatus(summariesData, "prototype_evidence") === "current", "prototype summary should be current");

  const strictSummaries = await runCaptureStatus(["node", CLI, "summaries", "--root", target, "--strict", "--json"], env);
  assert(strictSummaries.code !== 0, "summaries --strict should fail for current-but-thin prototype evidence");
  const strictSummaryReport = parseJsonReport(strictSummaries.output, "summaries");
  assert(hasHealthError(strictSummaryReport, "summary quality prototype_evidence"), "strict summaries did not expose prototype quality health error");

  const handoff = await runCaptureStatus(["node", CLI, "handoff", "--root", target, "--json"], env);
  assert(handoff.code !== 0, "handoff should fail for current-but-thin prototype evidence");
  const handoffReport = parseJsonReport(handoff.output, "handoff");
  const handoffData = record(handoffReport.data, "thin handoff data");
  assert(handoffData.handoff_ok === false, "thin handoff should expose handoff_ok=false");
  assert(handoffData.summary_freshness_ok === true, "thin handoff should keep summary_freshness_ok=true");
  assert(handoffData.summary_quality_ok === false, "thin handoff should expose summary_quality_ok=false");
  assert(hasHealthError(handoffReport, "summary quality prototype_evidence"), "handoff did not expose strict prototype quality health error");

  const defaultContext = parseJsonReport(await runCapture(["node", CLI, "context", "--root", target, "--json"], env), "context");
  const defaultContextData = record(defaultContext.data, "default context data");
  assert(defaultContext.ok === true, "default context should remain non-strict for current-but-thin summaries");
  assert(defaultContextData.handoff_mode === false, "default context should expose handoff_mode=false");
  assert(defaultContextData.handoff_quality_ok === false, "default context should expose handoff_quality_ok=false");

  const handoffContext = await runCaptureStatus(["node", CLI, "context", "--root", target, "--handoff", "--json"], env);
  assert(handoffContext.code !== 0, "context --handoff should fail for current-but-thin summaries");
  const handoffContextReport = parseJsonReport(handoffContext.output, "context");
  const handoffContextData = record(handoffContextReport.data, "handoff context data");
  assert(handoffContextData.handoff_mode === true, "context --handoff should expose handoff_mode=true");
  assert(hasHealthError(handoffContextReport, "summary quality prototype_evidence"), "context --handoff did not expose strict prototype quality health error");

  const doctor = parseJsonReport(await runCapture(["node", CLI, "doctor", "--root", target, "--tools", "codex", "--json"], env), "doctor");
  const doctorData = record(doctor.data, "doctor data");
  assert(doctor.ok === true, "doctor should keep maintenance ok for thin handoff quality");
  assert(doctorData.handoff_quality_ok === false, "doctor should expose handoff_quality_ok=false for thin summaries");
}

async function verifyPlanningArtifactRegistrationContract(): Promise<void> {
  const contracts = await read(join(REPO_ROOT, "references", "planning-artifact-contracts.md"));
  for (const required of [
    "Planning Artifact Registration",
    "must not load full planning history",
    "`SUMMARY.yaml`: default queue handoff and read-model artifact",
    "`CANDIDATE_CHANGES.yaml` only when source truth is needed",
  ]) {
    assert(contracts.includes(required), `planning registration contract missing for Agent E2E: ${required}`);
  }
}

async function verifyCleanAndSyncRecovery(target: string, env: NodeJS.ProcessEnv, sourceSnapshots: Record<string, string>): Promise<void> {
  const clean = parseJsonReport(await runCapture(["node", CLI, "clean", "--root", target, "--tools", "codex", "--yes", "--json"], env), "clean");
  const cleanEffects = record(clean.effects, "clean effects");
  assert(arrayIncludesPath(cleanEffects.preserved, PROTOTYPE_PATH), "clean did not report preserved prototype source artifact");
  assert(!(await exists(join(target, ".openworkflow", "config.yaml"))), "clean did not remove managed config");
  await assertFile(join(target, VALIDATION_PATH));
  await assertFile(join(target, PROTOTYPE_PATH));
  await assertFile(join(target, PROTOTYPE_SUMMARY_PATH));
  const agentsAfterClean = await read(join(target, "AGENTS.md"));
  assert(agentsAfterClean.includes("User insight stays."), "clean removed user AGENTS.md content");
  assert(!agentsAfterClean.includes("BEGIN OPENWORKFLOW AGENT GUIDE"), "clean did not remove OpenWorkflow managed AGENTS.md block");
  assert(!(await exists(join(target, ".agents", "openworkflow-adapter.yaml"))), "clean did not remove Codex adapter manifest");
  await assertSnapshots(target, sourceSnapshots);

  const sync = parseJsonReport(await runCapture(["node", CLI, "sync", "--root", target, "--json"], env), "sync");
  const syncData = record(sync.data, "sync data");
  const syncDetection = record(syncData.detection, "sync detection");
  assert(Array.isArray(syncData.tools) && syncData.tools.includes("codex"), "default sync recovery did not select codex");
  assert(Array.isArray(syncDetection.evidence) && syncDetection.evidence.some((item) => String(item).includes("default auto sync fallback tool: codex")), "default sync recovery did not expose codex fallback evidence");
  await assertFile(join(target, ".agents", "openworkflow-adapter.yaml"));
  const reconciliation = record(syncData.state_reconciliation, "sync state_reconciliation");
  assert(reconciliation.reconciled === true, "sync did not reconcile CURRENT_STATE after clean");
  assert(reconciliation.active_stage === "prototype", "sync did not recover prototype active_stage");
  assert(reconciliation.next_command === "/ow:tune", "sync did not recover /ow:tune next_command");
  const restoredPointers = record(reconciliation.restored_pointers, "sync restored_pointers");
  assert(restoredPointers.current_validation === VALIDATION_PATH, "sync did not recover current_validation");
  assert(restoredPointers.current_prototype === PROTOTYPE_PATH, "sync did not recover current_prototype");
  await assertFile(join(target, ".openworkflow", "CURRENT_STATE.yaml"));
  const recoveredState = await read(join(target, ".openworkflow", "CURRENT_STATE.yaml"));
  assert(recoveredState.includes("active_stage: prototype"), "recovered CURRENT_STATE missing prototype stage");
  assert(recoveredState.includes(`current_validation: ${VALIDATION_PATH}`), "recovered CURRENT_STATE missing validation pointer");
  assert(recoveredState.includes(`current_prototype: ${PROTOTYPE_PATH}`), "recovered CURRENT_STATE missing prototype pointer");
  assert(recoveredState.includes("next_command: /ow:tune"), "recovered CURRENT_STATE missing /ow:tune");
  const agentsAfterSync = await read(join(target, "AGENTS.md"));
  assert(agentsAfterSync.includes("User insight stays."), "sync removed user AGENTS.md content");
  assert(agentsAfterSync.includes("BEGIN OPENWORKFLOW AGENT GUIDE"), "sync did not restore OpenWorkflow AGENTS.md managed block");
  await assertSnapshots(target, sourceSnapshots);

  const recoveredDoctor = parseJsonReport(await runCapture(["node", CLI, "doctor", "--root", target, "--json"], env), "doctor");
  const recoveredDoctorData = record(recoveredDoctor.data, "recovered doctor data");
  assert(recoveredDoctor.ok === true, "doctor should pass after default sync recovery");
  assert(Array.isArray(recoveredDoctorData.tools) && recoveredDoctorData.tools.includes("codex"), "doctor did not detect codex after default sync recovery");
  assert(recoveredDoctorData.adapter_ok === true, "doctor did not report adapter_ok=true after default sync recovery");

  const recoveredContext = parseJsonReport(await runCapture(["node", CLI, "context", "--root", target, "--json"], env), "context");
  const recoveredContextData = record(recoveredContext.data, "recovered context data");
  assert(recoveredContext.ok === true, "default context should pass after sync recovery");
  assert(recoveredContextData.normalized_command === "/ow:tune", "recovered context should default to /ow:tune");
  const recoveredHandoff = await runCaptureStatus(["node", CLI, "handoff", "--root", target, "--json"], env);
  assert(recoveredHandoff.code !== 0, "handoff should still fail on preserved thin prototype after sync recovery");
  const recoveredTuneCheck = parseJsonReport(await runCapture(["node", CLI, "check", "/ow:tune", "--root", target, "--json"], env), "check");
  assert(recoveredTuneCheck.ok === true, "/ow:tune check should pass after sync recovery");
}

async function run(command: string[], env: NodeJS.ProcessEnv): Promise<void> {
  const result = await runCaptureStatus(command, env);
  if (result.code !== 0) {
    throw new Error(`command failed (${result.code ?? "signal"}): ${command.join(" ")}\n${result.output}`);
  }
}

function runCapture(command: string[], env: NodeJS.ProcessEnv): Promise<string> {
  return runCaptureStatus(command, env).then((result) => {
    if (result.code !== 0) {
      throw new Error(`command failed (${result.code ?? "signal"}): ${command.join(" ")}\n${result.output}`);
    }
    return result.output;
  });
}

function runCaptureStatus(command: string[], env: NodeJS.ProcessEnv): Promise<{ code: number | null; output: string }> {
  return new Promise<{ code: number | null; output: string }>((resolvePromise, reject) => {
    const executable = command[0];
    if (!executable) {
      reject(new Error("empty command"));
      return;
    }
    let output = "";
    const child = spawn(executable, command.slice(1), {
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

function parseJsonReport(output: string, command: string): Record<string, unknown> {
  const parsed = JSON.parse(output) as unknown;
  assert(isRecord(parsed), `${command} did not emit a JSON object`);
  assert(parsed.command === command, `${command} JSON command mismatch`);
  assert("ok" in parsed, `${command} JSON missing ok`);
  assert(isRecord(parsed.effects), `${command} JSON missing effects`);
  assert(Array.isArray(parsed.health_errors), `${command} JSON missing health_errors`);
  return parsed;
}

function summaryStatus(summaryData: Record<string, unknown>, artifactType: string): string | null {
  const entries = summaryData.entries;
  if (!Array.isArray(entries)) {
    return null;
  }
  const found = entries.find((entry) => isRecord(entry) && entry.artifact_type === artifactType);
  return isRecord(found) && typeof found.status === "string" ? found.status : null;
}

function hasHealthError(report: Record<string, unknown>, pattern: string): boolean {
  return Array.isArray(report.health_errors) && report.health_errors.some((item) => String(item).includes(pattern));
}

function arrayIncludesPath(value: unknown, suffix: string): boolean {
  return Array.isArray(value) && value.some((item) => typeof item === "string" && item.endsWith(suffix));
}

async function readSnapshots(root: string, paths: string[]): Promise<Record<string, string>> {
  const snapshots: Record<string, string> = {};
  for (const path of paths) {
    snapshots[path] = hash(await read(join(root, path)));
  }
  return snapshots;
}

async function assertSnapshots(root: string, snapshots: Record<string, string>): Promise<void> {
  for (const [path, expected] of Object.entries(snapshots)) {
    assert(hash(await read(join(root, path))) === expected, `file changed unexpectedly: ${path}`);
  }
}

function hash(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

async function assertNoLazyStageArtifacts(root: string): Promise<void> {
  for (const path of [
    ".openworkflow/vision",
    ".openworkflow/validation",
    ".openworkflow/prototypes",
    ".openworkflow/design",
    ".openworkflow/specs",
    ".openworkflow/changes",
    ".openworkflow/runtime",
  ]) {
    assert(!(await exists(join(root, path))), `minimal init created lazy stage path: ${path}`);
  }
}

async function assertFile(path: string): Promise<void> {
  const info = await stat(path);
  assert(info.isFile(), `expected file: ${path}`);
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function read(path: string): Promise<string> {
  return readFile(path, "utf8");
}

function record(value: unknown, label: string): Record<string, unknown> {
  assert(isRecord(value), `${label} must be an object`);
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

main().then((code) => {
  process.exitCode = code;
}).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
