#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CURRENT_FILE = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(dirname(CURRENT_FILE), "../../../..");
const CLI = join(REPO_ROOT, "dist", "cli", "src", "index.js");

async function main(): Promise<number> {
  await assertFile(CLI);
  const tempRoot = await mkdirTemp();
  try {
    const target = join(tempRoot, "target");
    const codexHome = join(tempRoot, "codex-home");
    const env = { ...process.env, CODEX_HOME: codexHome };

    await mkdir(target, { recursive: true });
    await writeFile(join(target, "AGENTS.md"), "# Project Agents\n\nUser rules stay.\n", "utf8");
    await run(["node", CLI, "init", target, "--tools", "codex", "--force"], env);
    let agentsGuide = await read(join(target, "AGENTS.md"));
    assert(agentsGuide.includes("User rules stay."), "init did not preserve existing AGENTS.md content");
    assert(agentsGuide.includes("BEGIN OPENWORKFLOW AGENT GUIDE"), "init did not append AGENTS.md managed block");
    await writeNonGeneratedFixtures(target);

    const dryRun = await runCapture(["node", CLI, "clean", "--root", target, "--tools", "codex"], env);
    assert(dryRun.includes("OpenWorkflow clean plan"), "clean dry-run did not print plan");
    assert(dryRun.includes("Dry run only"), "clean dry-run did not explain --yes");
    await assertFile(join(target, ".openworkflow", "config.yaml"));
    await assertFile(join(target, ".agents", "openworkflow-adapter.yaml"));
    await assertFile(join(target, ".agents", "custom.md"));
    await assertFile(join(target, ".codex", "commands", "ow", "vision.md"));
    await writeOpenWorkflowSourceArtifacts(target);
    const sourceSnapshots = await readSourceSnapshots(target);

    const jsonDryRun = JSON.parse(await runCapture(["node", CLI, "clean", "--root", target, "--tools", "codex", "--json"], env)) as {
      effects?: { preserved?: string[] };
    };
    assert(jsonDryRun.effects?.preserved?.some((path) => path.endsWith(".openworkflow/validation/val-1/VALIDATION.yaml")) === true, "clean --json did not report preserved source artifacts");
    const clean = await runCapture(["node", CLI, "clean", "--root", target, "--tools", "codex", "--yes"], env);
    assert(clean.includes("OpenWorkflow clean completed"), "clean --yes did not complete");
    assert(clean.includes("removed:"), "clean --yes did not report removed files");
    assert(clean.includes("preserved:"), "clean --yes did not report preserved files");
    assert(clean.includes("Skipped non-generated file"), "clean --yes did not warn for non-generated files");
    await assertFile(join(target, ".openworkflow", "validation", "val-1", "VALIDATION.yaml"));
    await assertFile(join(target, ".openworkflow", "prototypes", "proto-1", "EVIDENCE.yaml"));
    await assertFile(join(target, ".openworkflow", "prototypes", "proto-1", "SUMMARY.yaml"));
    await assertFile(join(target, ".openworkflow", "notes", "handoff.md"));
    assert(!(await exists(join(target, ".openworkflow", "config.yaml"))), "managed config.yaml was not removed");
    assert(!(await exists(join(target, ".openworkflow", "workflow", "WORKFLOW_INDEX.yaml"))), "managed workflow index was not removed");
    assert(!(await exists(join(target, ".openworkflow", "audit", "COMMAND_AUDIT_INDEX.yaml"))), "managed audit index was not removed");
    assert(!(await exists(join(target, ".agents", "openworkflow-adapter.yaml"))), "Codex manifest was not removed");
    assert(!(await exists(join(target, ".agents", "skills", "ow-vision", "SKILL.md"))), "generated skill was not removed");
    await assertFile(join(target, ".agents", "custom.md"));
    await assertFile(join(target, ".agents", "skills", "ow-vision", "custom.md"));
    await assertFile(join(target, ".codex", "commands", "ow", "vision.md"));
    agentsGuide = await read(join(target, "AGENTS.md"));
    assert(agentsGuide.includes("User rules stay."), "clean removed user AGENTS.md content");
    assert(!agentsGuide.includes("BEGIN OPENWORKFLOW AGENT GUIDE"), "clean did not remove AGENTS.md managed block");

    const sync = await runCaptureStatus(["node", CLI, "sync", "--root", target, "--tools", "codex", "--json"], env);
    assert(sync.code === 0 || sync.code === 1, "sync --json returned an unexpected exit code after clean recovery");
    const syncReport = parseJsonReport(sync.output, "sync");
    assert(isRecord(syncReport.effects), "sync --json did not include effects after clean recovery");
    const syncData = record(syncReport.data, "sync data");
    const stateReconciliation = record(syncData.state_reconciliation, "sync state_reconciliation");
    const restoredPointers = record(stateReconciliation.restored_pointers, "sync restored_pointers");
    assert(stateReconciliation.reconciled === true, "sync did not reconcile CURRENT_STATE from preserved indexes");
    assert(stateReconciliation.active_stage === "prototype", "sync did not restore prototype active_stage");
    assert(stateReconciliation.next_command === "/ow:tune", "sync did not restore prototype next_command");
    assert(restoredPointers.current_validation === ".openworkflow/validation/val-1/VALIDATION.yaml", "sync did not restore current_validation");
    assert(restoredPointers.current_prototype === ".openworkflow/prototypes/proto-1/EVIDENCE.yaml", "sync did not restore current_prototype");
    assert(arrayIncludesPath(syncReport.effects.written, ".openworkflow/workflow/WORKFLOW_INDEX.yaml"), "sync --json did not report restored workflow index");
    assert(arrayIncludesPath(syncReport.effects.written, ".agents/openworkflow-adapter.yaml"), "sync --json did not report restored Codex adapter manifest");
    assert(arrayIncludesPath(syncReport.effects.updated, ".openworkflow/CURRENT_STATE.yaml"), "sync --json did not report reconciled CURRENT_STATE update");
    assert(arrayIncludesPath(syncReport.effects.skipped, ".codex/commands/ow/vision.md"), "sync --json did not report preserved legacy non-generated command");
    await assertFile(join(target, ".openworkflow", "config.yaml"));
    await assertFile(join(target, ".openworkflow", "CURRENT_STATE.yaml"));
    await assertFile(join(target, ".openworkflow", "workflow", "WORKFLOW_INDEX.yaml"));
    await assertFile(join(target, ".openworkflow", "audit", "COMMAND_AUDIT_INDEX.yaml"));
    await assertFile(join(target, ".openworkflow", "audit", "ARTIFACT_CONTRACTS.yaml"));
    await assertFile(join(target, ".agents", "openworkflow-adapter.yaml"));
    await assertFile(join(target, ".agents", "skills", "ow-vision", "SKILL.md"));
    const recoveredState = await read(join(target, ".openworkflow", "CURRENT_STATE.yaml"));
    assert(recoveredState.includes("active_stage: prototype"), "recovered CURRENT_STATE missing prototype active_stage");
    assert(recoveredState.includes("current_validation: .openworkflow/validation/val-1/VALIDATION.yaml"), "recovered CURRENT_STATE missing current_validation");
    assert(recoveredState.includes("current_prototype: .openworkflow/prototypes/proto-1/EVIDENCE.yaml"), "recovered CURRENT_STATE missing current_prototype");
    assert(recoveredState.includes("next_command: /ow:tune"), "recovered CURRENT_STATE missing next_command");
    await assertSourceSnapshots(target, sourceSnapshots);
    agentsGuide = await read(join(target, "AGENTS.md"));
    assert(agentsGuide.includes("User rules stay."), "sync recovery did not preserve user AGENTS.md content");
    assert(agentsGuide.includes("BEGIN OPENWORKFLOW AGENT GUIDE"), "sync recovery did not restore AGENTS.md managed block");
    const doctorReport = parseJsonReport(await runCapture(["node", CLI, "doctor", "--root", target, "--tools", "codex", "--json"], env), "doctor");
    assert(doctorReport.ok === true, "doctor --json did not report ok after sync recovery");
    const checkReport = parseJsonReport(await runCapture(["node", CLI, "check", "/ow:vision", "--root", target, "--json"], env), "check");
    assert(checkReport.ok === true, "check /ow:vision --json did not report ready after sync recovery");
    const recoveredStateBeforeResync = await read(join(target, ".openworkflow", "CURRENT_STATE.yaml"));
    const resync = await runCaptureStatus(["node", CLI, "sync", "--root", target, "--tools", "codex", "--json"], env);
    assert(resync.code === 0 || resync.code === 1, "resync --json returned an unexpected exit code");
    const resyncReport = parseJsonReport(resync.output, "sync");
    const resyncData = record(resyncReport.data, "resync data");
    const resyncReconciliation = record(resyncData.state_reconciliation, "resync state_reconciliation");
    assert(resyncReconciliation.attempted === false, "sync attempted to reconcile an existing non-default CURRENT_STATE");
    assert((await read(join(target, ".openworkflow", "CURRENT_STATE.yaml"))) === recoveredStateBeforeResync, "sync overwrote existing non-default CURRENT_STATE");

    await run(["node", CLI, "init", target, "--tools", "codex", "--force"], env);
    const forceClean = await runCapture(["node", CLI, "clean", "--root", target, "--tools", "codex", "--yes", "--force"], env);
    assert(forceClean.includes("OpenWorkflow clean completed"), "clean --force did not complete");
    assert(!(await exists(join(target, ".codex", "commands", "ow", "vision.md"))), "force clean did not remove expected legacy target");

    const generatedOnlyTarget = join(tempRoot, "generated-only");
    await run(["node", CLI, "init", generatedOnlyTarget, "--tools", "codex", "--force"], env);
    await run(["node", CLI, "clean", "--root", generatedOnlyTarget, "--tools", "codex", "--yes"], env);
    assert(!(await exists(join(generatedOnlyTarget, ".openworkflow"))), "generated-only .openworkflow should be removed after managed files are cleaned");
    await assertFile(join(generatedOnlyTarget, "AGENTS.md"));
    const generatedOnlyAgents = await read(join(generatedOnlyTarget, "AGENTS.md"));
    assert(generatedOnlyAgents === "", "clean should clear only the managed block and leave AGENTS.md in place");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }

  console.log("OpenWorkflow clean verification passed.");
  return 0;
}

async function mkdirTemp(): Promise<string> {
  const { mkdtemp } = await import("node:fs/promises");
  return mkdtemp(join(tmpdir(), "openworkflow-clean-"));
}

async function writeNonGeneratedFixtures(target: string): Promise<void> {
  await mkdir(join(target, ".agents", "skills", "ow-vision"), { recursive: true });
  await mkdir(join(target, ".codex", "commands", "ow"), { recursive: true });
  await writeFile(join(target, ".agents", "custom.md"), "user content\n", "utf8");
  await writeFile(join(target, ".agents", "skills", "ow-vision", "custom.md"), "user skill note\n", "utf8");
  await writeFile(join(target, ".codex", "commands", "ow", "vision.md"), "user legacy command\n", "utf8");
}

async function writeOpenWorkflowSourceArtifacts(target: string): Promise<void> {
  await mkdir(join(target, ".openworkflow", "validation", "val-1"), { recursive: true });
  await mkdir(join(target, ".openworkflow", "prototypes", "proto-1"), { recursive: true });
  await mkdir(join(target, ".openworkflow", "notes"), { recursive: true });
  await writeFile(join(target, ".openworkflow", "validation", "val-1", "VALIDATION.yaml"), [
    "schema_version: 0.1.0",
    "contract_id: validation:val-1",
    "contract_type: validation",
    "artifact_type: validation_target",
    "title: Validation fixture",
    "status: active",
    "core_question: Can sync recover current state?",
    "prototype_scope:",
    "  include:",
    "    - state recovery",
    "acceptance:",
    "  - CURRENT_STATE points to prototype after clean/sync",
    "",
  ].join("\n"), "utf8");
  await writeFile(join(target, ".openworkflow", "validation", "VALIDATION_INDEX.yaml"), [
    "schema_version: 0.1.0",
    "contract_id: index:validation",
    "contract_type: validation",
    "title: Validation index",
    "status: active",
    "current_validation: val-1",
    "validations:",
    "  - validation_id: val-1",
    "    path: .openworkflow/validation/val-1/VALIDATION.yaml",
    "    artifact_type: validation_target",
    "    title: Validation fixture",
    "    status: active",
    "",
  ].join("\n"), "utf8");
  await writeFile(join(target, ".openworkflow", "prototypes", "proto-1", "EVIDENCE.yaml"), [
    "schema_version: 0.1.0",
    "contract_id: prototype:proto-1",
    "contract_type: prototype",
    "artifact_type: prototype_evidence",
    "title: Prototype fixture",
    "status: active",
    "validation_target: validation:val-1",
    "core_question: Can sync recover next command?",
    "prototype_mode: image_prompt_pack",
    "prompt_pack_type: strategic_proto_prompt_pack",
    "validation_input:",
    "  mode: validation_present",
    "  refs:",
    "    - .openworkflow/validation/val-1/VALIDATION.yaml",
    "  notes: []",
    "source:",
    "  refs: []",
    "negative_constraints: []",
    "review_plan: {}",
    "result: not_reviewed",
    "handoff:",
    "  next_command: /ow:tune",
    "",
  ].join("\n"), "utf8");
  await writeFile(join(target, ".openworkflow", "prototypes", "PROTOTYPE_INDEX.yaml"), [
    "schema_version: 0.1.0",
    "contract_id: index:prototype",
    "contract_type: prototype",
    "title: Prototype index",
    "status: active",
    "current_prototype: proto-1",
    "prototypes:",
    "  - prototype_id: proto-1",
    "    path: .openworkflow/prototypes/proto-1/EVIDENCE.yaml",
    "    artifact_type: prototype_evidence",
    "    title: Prototype fixture",
    "    status: active",
    "",
  ].join("\n"), "utf8");
  await writeFile(join(target, ".openworkflow", "prototypes", "proto-1", "SUMMARY.yaml"), [
    "artifact: .openworkflow/prototypes/proto-1/EVIDENCE.yaml",
    "summary: Keep this low-context summary.",
    "",
  ].join("\n"), "utf8");
  await writeFile(join(target, ".openworkflow", "notes", "handoff.md"), "Preserve user notes.\n", "utf8");
}

const SOURCE_ARTIFACT_PATHS = [
  ".openworkflow/validation/VALIDATION_INDEX.yaml",
  ".openworkflow/validation/val-1/VALIDATION.yaml",
  ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
  ".openworkflow/prototypes/proto-1/EVIDENCE.yaml",
  ".openworkflow/prototypes/proto-1/SUMMARY.yaml",
  ".openworkflow/notes/handoff.md",
];

async function readSourceSnapshots(target: string): Promise<Map<string, string>> {
  const snapshots = new Map<string, string>();
  for (const relativePath of SOURCE_ARTIFACT_PATHS) {
    snapshots.set(relativePath, await read(join(target, relativePath)));
  }
  return snapshots;
}

async function assertSourceSnapshots(target: string, snapshots: Map<string, string>): Promise<void> {
  for (const [relativePath, before] of snapshots) {
    const after = await read(join(target, relativePath));
    assert(after === before, `source artifact changed during clean/sync recovery: ${relativePath}`);
  }
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

async function assertFile(path: string): Promise<void> {
  const info = await stat(path);
  assert(info.isFile(), `missing file: ${path}`);
}

async function read(path: string): Promise<string> {
  return readFile(path, "utf8");
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function parseJsonReport(output: string, expectedCommand: string): Record<string, unknown> {
  const parsed = JSON.parse(output) as unknown;
  assert(isRecord(parsed), `${expectedCommand} --json did not return an object`);
  assert(parsed.command === expectedCommand, `${expectedCommand} --json returned unexpected command`);
  return parsed;
}

function arrayIncludesPath(value: unknown, suffix: string): boolean {
  return Array.isArray(value) && value.some((item) => typeof item === "string" && item.endsWith(suffix));
}

function record(value: unknown, label: string): Record<string, unknown> {
  assert(isRecord(value), `${label} must be an object`);
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
