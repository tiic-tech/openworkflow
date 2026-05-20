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
    "title: Validation fixture",
    "status: active",
    "",
  ].join("\n"), "utf8");
  await writeFile(join(target, ".openworkflow", "prototypes", "proto-1", "EVIDENCE.yaml"), [
    "schema_version: 0.1.0",
    "contract_id: prototype:proto-1",
    "contract_type: prototype",
    "title: Prototype fixture",
    "status: active",
    "",
  ].join("\n"), "utf8");
  await writeFile(join(target, ".openworkflow", "prototypes", "proto-1", "SUMMARY.yaml"), [
    "artifact: .openworkflow/prototypes/proto-1/EVIDENCE.yaml",
    "summary: Keep this low-context summary.",
    "",
  ].join("\n"), "utf8");
  await writeFile(join(target, ".openworkflow", "notes", "handoff.md"), "Preserve user notes.\n", "utf8");
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

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
