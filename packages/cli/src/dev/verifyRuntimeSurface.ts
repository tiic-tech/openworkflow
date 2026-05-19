#!/usr/bin/env node
import { mkdtemp, readdir, readFile, rm, stat } from "node:fs/promises";
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
    await run(["node", CLI, "sync", "--root", target, "--tools", "codex"], env);
    await run(["node", CLI, "doctor", "--root", target, "--tools", "codex"], env);
    await run(["node", CLI, "validate", "--root", target], env);

    await verifyMinimalOpenWorkflow(target);
    await verifyConfig(target);
    await verifySkills(target);
    await verifyNoDefaultPrompts(codexHome);
    await verifyDesignContract(target);
    await verifyTuneDecisionSurface(target);
    await verifyNoDefaultCodexCommands(target);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }

  console.log("OpenWorkflow runtime surface verification passed.");
  return 0;
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

async function verifyMinimalOpenWorkflow(root: string): Promise<void> {
  const actualFiles = new Set(
    (await collectPaths(join(root, ".openworkflow"), "file")).map((path) => relative(root, path)),
  );
  assertSetEqual(
    actualFiles,
    new Set([
      ".openworkflow/config.yaml",
      ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
      ".openworkflow/audit/COMMAND_AUDIT_INDEX.yaml",
      ".openworkflow/audit/CONTEXT_PACKETS.yaml",
      ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
      ".openworkflow/audit/DISCLOSURE_LEVELS.yaml",
      ".openworkflow/decisions/_templates/DECISION.yaml",
      ".openworkflow/design/_templates/PRODUCT_DESIGN.yaml",
      ".openworkflow/prototypes/_templates/EVIDENCE.yaml",
      ".openworkflow/validation/_templates/VALIDATION.yaml",
      ".openworkflow/vision/_templates/VISION_SESSION.yaml",
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
      ".openworkflow/decisions",
      ".openworkflow/decisions/_templates",
      ".openworkflow/design",
      ".openworkflow/design/_templates",
      ".openworkflow/prototypes",
      ".openworkflow/prototypes/_templates",
      ".openworkflow/validation",
      ".openworkflow/validation/_templates",
      ".openworkflow/vision",
      ".openworkflow/vision/_templates",
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
}

async function verifyNoDefaultPrompts(codexHome: string): Promise<void> {
  for (const name of ["ow-vision.md", "ow-validation.md", "ow-proto.md", "ow-tune.md", "ow-design.md", "ow-spec.md"]) {
    assert(!(await exists(join(codexHome, "prompts", name))), `default global prompt generated unexpectedly: ${name}`);
  }
}

async function verifySkills(root: string): Promise<void> {
  for (const name of ["ow-vision", "ow-validation", "ow-proto", "ow-tune", "ow-decision", "ow-design", "ow-spec"]) {
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
    if (name === "ow-proto") {
      verifyProtoSkill(skillContent);
    }
    if (name === "ow-tune") {
      verifyTuneSkill(skillContent);
    }
    if (name === "ow-decision") {
      verifyDecisionSkill(skillContent);
    }
    assert(interfaceContent.includes("display_name:"), `${name} missing display name`);
    assert(interfaceContent.includes("default_prompt:"), `${name} missing default prompt`);
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

async function verifyDesignContract(root: string): Promise<void> {
  const commandIndex = await read(join(root, ".openworkflow", "audit", "COMMAND_AUDIT_INDEX.yaml"));
  assert(commandIndex.includes("trigger: /ow:design"), "command audit missing /ow:design");
  const designSection = commandIndex.split("trigger: /ow:design", 2)[1]?.split("  - id:", 1)[0] ?? "";
  assert(designSection.includes("PRODUCT_DESIGN.yaml"), "design allowed outputs missing PRODUCT_DESIGN");
  assert(!extractBlock(designSection, "allowed_outputs").includes("TECH_SPEC.yaml"), "design allowed outputs include TECH_SPEC");
  assert(extractBlock(designSection, "conditional_outputs").includes("TECH_SPEC.yaml"), "design conditional outputs missing TECH_SPEC");

  const artifacts = await read(join(root, ".openworkflow", "audit", "ARTIFACT_CONTRACTS.yaml"));
  assert(artifacts.includes("artifact_type: product_design"), "artifact contracts missing product_design");
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
  for (const templatePath of [
    ".openworkflow/vision/_templates/VISION_SESSION.yaml",
    ".openworkflow/validation/_templates/VALIDATION.yaml",
    ".openworkflow/prototypes/_templates/EVIDENCE.yaml",
    ".openworkflow/decisions/_templates/DECISION.yaml",
    ".openworkflow/design/_templates/PRODUCT_DESIGN.yaml",
  ]) {
    await assertFile(join(root, templatePath));
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
