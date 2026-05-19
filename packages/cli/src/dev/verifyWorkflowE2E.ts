#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getDiscoveryArtifactContractsForCommand } from "../../../core/src/artifacts/registry.js";
import { getWorkflowCommands, type WorkflowCommand } from "../../../core/src/commands/registry.js";
import { parseYaml } from "../../../core/src/contracts/yaml.js";

const CURRENT_FILE = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(dirname(CURRENT_FILE), "../../../..");
const CLI = join(REPO_ROOT, "dist", "cli", "src", "index.js");
const USER_FACING_DISCOVERY_HANDOFFS = ["/ow:tune", "/ow:design", "/ow:validation"];

interface Runtime {
  target: string;
  commands: Record<string, unknown>[];
  packets: Record<string, unknown>[];
}

async function main(): Promise<number> {
  await assertFile(CLI);
  const tempRoot = await mkdtemp(join(tmpdir(), "openworkflow-e2e-workflow-"));
  try {
    const target = join(tempRoot, "target");
    const codexHome = join(tempRoot, "codex-home");
    const env = { ...process.env, CODEX_HOME: codexHome };

    await run(["node", CLI, "init", target, "--tools", "codex", "--force"], env);
    await run(["node", CLI, "sync", "--root", target, "--tools", "codex"], env);
    await run(["node", CLI, "doctor", "--root", target, "--tools", "codex"], env);
    await run(["node", CLI, "validate", "--root", target], env);

    const runtime = await loadRuntime(target);
    await verifyVisionPhase(runtime);
    await verifyValidationPhase(runtime);
    await verifyPrototypePhase(runtime);
    await verifyTunePhase(runtime);
    await verifyInternalDecisionPhase(runtime);
    await verifyDisplayLabels(runtime);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }

  console.log("OpenWorkflow workflow E2E regression verification passed.");
  return 0;
}

async function loadRuntime(target: string): Promise<Runtime> {
  const commandIndex = await readYaml(join(target, ".openworkflow", "audit", "COMMAND_AUDIT_INDEX.yaml"));
  const contextPackets = await readYaml(join(target, ".openworkflow", "audit", "CONTEXT_PACKETS.yaml"));
  return {
    target,
    commands: records(commandIndex, "commands", "runtime"),
    packets: records(contextPackets, "packets", "runtime"),
  };
}

async function verifyVisionPhase(runtime: Runtime): Promise<void> {
  const phase = "vision";
  const source = command("vision", phase);
  const protocol = protocolFor(source, phase);
  assertPhase(phase, protocol.interactionMode === "conversation-first-sustained-grill", "source protocol is not sustained grill");
  assertExactList(phase, protocol.handoffCommands, ["/ow:validation"], "vision source handoffs changed");
  assertListIncludes(phase, protocol.forbiddenOutputs, ".openworkflow/validation/**", "vision can create validation artifacts");
  assertListIncludes(phase, protocol.forbiddenOutputs, ".openworkflow/prototypes/**", "vision can create prototype artifacts");
  assertListIncludes(phase, protocol.auditCheckpoints.before, "Start in conversation mode and ask the next useful vision question before writing artifacts.", "vision does not start conversation-first");
  assertSomeIncludes(phase, protocol.auditCheckpoints.during, "make each question depend on the previous answer", "vision does not enforce progressive questioning");
  assertSomeIncludes(phase, protocol.auditCheckpoints.after, "user confirms readiness", "vision handoff does not require user readiness confirmation");

  const generated = commandRecord(runtime, "vision", phase);
  assertPhase(phase, stringField(generated, "visibility", phase) === "user", "generated vision command is not user visible");
  assertExactList(phase, stringList(generated, "handoff_commands", phase), ["/ow:validation"], "generated vision handoffs changed");
  assertListIncludes(phase, stringList(generated, "forbidden_outputs", phase), ".openworkflow/prototypes/**", "generated vision can create prototypes");

  const packet = packetRecord(runtime, "/ow:vision", phase);
  assertSomeIncludes(phase, nestedStringList(packet, ["audit_checkpoints", "before"], phase), "ask the next useful vision question", "context packet lost conversation-first checkpoint");
  assertSomeIncludes(phase, nestedStringList(packet, ["audit_checkpoints", "during"], phase), "Cover mandatory vision dimensions", "context packet lost mandatory coverage checkpoint");
  assertSomeIncludes(phase, nestedStringList(packet, ["audit_checkpoints", "after"], phase), "user confirms readiness", "context packet lost readiness gate");

  const skill = await readSkill(runtime, "ow-vision");
  assertIncludes(phase, skill, "<conversation_first>", "skill missing conversation_first block");
  assertIncludes(phase, skill, "Ask exactly one question", "skill no longer limits vision to one focused question");
  assertIncludes(phase, skill, "<mandatory_coverage>", "skill missing mandatory coverage block");
  assertIncludes(phase, skill, "Do not hand off to /ow:validation until mandatory coverage is addressed", "skill lost validation handoff gate");
  assertIncludes(phase, skill, "not on a fixed number of turns", "skill permits fixed-turn readiness");
  assertIncludes(phase, skill, "<artifact_checkpoint>", "skill missing artifact checkpoint separation");

  const template = await readYaml(join(runtime.target, ".openworkflow", "vision", "_templates", "VISION_SESSION.yaml"));
  const handoff = recordField(template, "handoff", phase);
  assertPhase(phase, handoff.ready === false, "vision template should default to not ready");
  assertPhase(phase, handoff.next_command === null, "vision template should not default to validation handoff");
}

async function verifyValidationPhase(runtime: Runtime): Promise<void> {
  const phase = "validation";
  const source = command("validation", phase);
  const protocol = protocolFor(source, phase);
  assertListIncludes(phase, protocol.requiredContext, ".openworkflow/vision/VISION_CONTRACT.yaml", "validation no longer requires vision contract");
  assertListIncludes(phase, protocol.forbiddenOutputs, ".openworkflow/prototypes/**", "validation can create prototype artifacts");
  assertExactList(phase, protocol.handoffCommands, ["/ow:proto", "/ow:vision"], "validation source handoffs changed");

  const generated = commandRecord(runtime, "validation", phase);
  const handoffs = stringList(generated, "handoff_commands", phase);
  assertListIncludes(phase, handoffs, "/ow:proto", "generated validation does not hand off to prototype");
  assertListExcludes(phase, handoffs, "/ow:decision", "generated validation exposes manual decision");

  const packet = packetRecord(runtime, "/ow:validation", phase);
  assertListIncludes(phase, stringList(packet, "required", phase), ".openworkflow/vision/VISION_CONTRACT.yaml", "context packet does not require vision contract");
  assertSomeIncludes(phase, nestedStringList(packet, ["audit_checkpoints", "during"], phase), "single highest-risk validation question", "validation does not focus the core risk");
  assertSomeIncludes(phase, nestedStringList(packet, ["audit_checkpoints", "after"], phase), "prototype brief", "validation does not produce prototype brief");

  const template = await readYaml(join(runtime.target, ".openworkflow", "validation", "_templates", "VALIDATION.yaml"));
  assertPhase(phase, "prototype_scope" in template, "validation template missing prototype_scope");
  assertPhase(phase, stringList(template, "decision_options", phase).includes("needs_more_evidence"), "validation template missing decision options");
}

async function verifyPrototypePhase(runtime: Runtime): Promise<void> {
  const phase = "prototype";
  const source = command("proto", phase);
  const protocol = protocolFor(source, phase);
  assertPhase(phase, protocol.interactionMode === "classified-prototype-creation", "prototype source protocol is not classified creation");
  assertDiscoveryHandoffs(phase, protocol.handoffCommands, "source prototype handoffs");
  assertListIncludes(phase, protocol.allowedOutputs, ".openworkflow/decisions/<id>/DECISION.yaml", "prototype cannot write decision audit");
  assertSomeIncludes(phase, protocol.auditCheckpoints.before, "Classify prototype mode", "prototype does not classify mode first");
  assertSomeIncludes(phase, protocol.auditCheckpoints.before, "Detect reference inputs", "prototype does not detect references");
  assertSomeIncludes(phase, protocol.auditCheckpoints.during, "high-fidelity static concept", "prototype does not require static concept");
  assertSomeIncludes(phase, protocol.auditCheckpoints.after, "decision audit record internally", "prototype does not write decision audit internally");
  assertSomeIncludes(phase, protocol.antiPatterns, "Do not ask the user to manually invoke /ow:decision", "prototype permits manual decision handoff");

  const generated = commandRecord(runtime, "proto", phase);
  assertDiscoveryHandoffs(phase, stringList(generated, "handoff_commands", phase), "generated prototype handoffs");
  assertListIncludes(phase, stringList(generated, "allowed_outputs", phase), ".openworkflow/decisions/<id>/DECISION.yaml", "generated prototype cannot write decision audit");

  const packet = packetRecord(runtime, "/ow:proto", phase);
  assertSomeIncludes(phase, nestedStringList(packet, ["audit_checkpoints", "during"], phase), "before HTML", "context packet lost visual-first ordering");
  assertSomeIncludes(phase, nestedStringList(packet, ["audit_checkpoints", "after"], phase), "decision audit record internally", "context packet lost internal decision audit");

  const skill = await readSkill(runtime, "ow-proto");
  for (const tag of [
    "prototype_classification",
    "reference_extraction",
    "visual_first_path",
    "design_seed_protocol",
    "verification_protocol",
    "self_critique",
    "internal_decision_audit",
  ]) {
    assertIncludes(phase, skill, `<${tag}>`, `skill missing ${tag} block`);
  }
  assertIncludes(phase, skill, "image generation before HTML", "skill lost image generation before HTML rule");
  assertIncludes(phase, skill, "reference-pattern extraction", "skill lost reference-pattern extraction wording");
  assertIncludes(phase, skill, "repair pass before evidence handoff", "skill lost critique repair gate");
  assertIncludes(phase, skill, "decision_record", "skill does not expose decision artifact contract for internal audit");
  assertNotIncludes(phase, extractBlock(skill, "handoff_commands"), "/ow:decision", "skill exposes decision in prototype handoffs");

  const artifacts = getDiscoveryArtifactContractsForCommand("/ow:proto").map((artifact) => artifact.artifactType);
  assertListIncludes(phase, artifacts, "prototype_evidence", "source proto artifacts missing prototype evidence");
  assertListIncludes(phase, artifacts, "decision_record", "source proto artifacts missing decision record");

  const template = await readYaml(join(runtime.target, ".openworkflow", "prototypes", "_templates", "EVIDENCE.yaml"));
  assertPhase(phase, "reference_analysis" in template, "prototype template missing reference analysis");
  assertPhase(phase, "visual_concept_policy" in template, "prototype template missing visual concept policy");
  assertPhase(phase, "concept_evidence" in template, "prototype template missing concept evidence");
  assertPhase(phase, "implementation_evidence" in template, "prototype template missing implementation evidence");
  assertPhase(phase, "verification" in template, "prototype template missing verification evidence");
  assertPhase(phase, "self_critique" in template, "prototype template missing self critique");
  const conceptPolicy = recordField(template, "visual_concept_policy", phase);
  assertPhase(phase, conceptPolicy.image_generation === "generated|skipped_by_user|not_applicable", "prototype template lost image generation policy");
  const critique = recordField(template, "self_critique", phase);
  for (const key of ["philosophy", "hierarchy", "execution", "specificity", "restraint", "accessibility", "responsive_behavior", "repairs"]) {
    assertPhase(phase, key in critique, `prototype critique missing ${key}`);
  }
  const handoff = recordField(template, "handoff", phase);
  assertPhase(phase, handoff.next_command !== "/ow:decision", "prototype template exposes manual decision as next command");
  assertListIncludes(phase, USER_FACING_DISCOVERY_HANDOFFS, String(handoff.next_command), "prototype template next command is not user-facing");
}

async function verifyTunePhase(runtime: Runtime): Promise<void> {
  const phase = "tune";
  const source = command("tune", phase);
  const protocol = protocolFor(source, phase);
  assertPhase(phase, protocol.interactionMode === "prototype-revision-orchestration", "tune source protocol is not revision orchestration");
  assertDiscoveryHandoffs(phase, protocol.handoffCommands, "source tune handoffs");
  assertListIncludes(phase, protocol.allowedOutputs, ".openworkflow/decisions/<id>/DECISION.yaml", "tune cannot write decision audit");
  assertListExcludes(phase, protocol.requiredContext, ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml", "tune requires prototype index and cannot bootstrap from validation");
  assertListIncludes(phase, protocol.optionalContext, ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml", "tune optional context missing prototype index");
  assertSomeIncludes(phase, protocol.auditCheckpoints.before, "/ow:tune:proto default to the current prototype", "tune does not default to current prototype");
  assertSomeIncludes(phase, protocol.auditCheckpoints.before, "no current prototype exists", "tune does not orchestrate proto when prototype is absent");
  assertSomeIncludes(phase, protocol.auditCheckpoints.after, "internal decision audit record", "tune does not record decision audit internally");
  assertSomeIncludes(phase, protocol.antiPatterns, "Do not ask the user to manually invoke /ow:decision", "tune permits manual decision handoff");

  const generated = commandRecord(runtime, "tune", phase);
  assertDiscoveryHandoffs(phase, stringList(generated, "handoff_commands", phase), "generated tune handoffs");
  assertListIncludes(phase, stringList(generated, "allowed_outputs", phase), ".openworkflow/decisions/<id>/DECISION.yaml", "generated tune cannot write decision audit");

  const packet = packetRecord(runtime, "/ow:tune", phase);
  assertListExcludes(phase, stringList(packet, "required", phase), ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml", "context packet requires prototype index");
  assertListIncludes(phase, stringList(packet, "optional", phase), ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml", "context packet optional context missing prototype index");

  const skill = await readSkill(runtime, "ow-tune");
  for (const tag of ["target_resolution", "proto_orchestration", "revision_protocol", "internal_decision_audit"]) {
    assertIncludes(phase, skill, `<${tag}>`, `skill missing ${tag} block`);
  }
  assertIncludes(phase, skill, "/ow:tune resolves to the current prototype by default.", "skill lost default target behavior");
  assertIncludes(phase, skill, "Every tune pass must write or update a decision audit record internally.", "skill lost decision audit requirement");
  assertIncludes(phase, skill, "Do not expose /ow:decision as the next manual user step", "skill exposes decision as user step");
  assertNotIncludes(phase, extractBlock(skill, "handoff_commands"), "/ow:decision", "skill exposes decision in tune handoffs");

  const artifacts = getDiscoveryArtifactContractsForCommand("/ow:tune").map((artifact) => artifact.artifactType);
  assertListIncludes(phase, artifacts, "prototype_evidence", "source tune artifacts missing prototype evidence");
  assertListIncludes(phase, artifacts, "decision_record", "source tune artifacts missing decision record");
}

async function verifyInternalDecisionPhase(runtime: Runtime): Promise<void> {
  const phase = "internal-decision";
  const source = command("decision", phase);
  assertPhase(phase, source.visibility === "internal", "source decision command is not internal");
  const generated = commandRecord(runtime, "decision", phase);
  assertPhase(phase, stringField(generated, "visibility", phase) === "internal", "generated decision command is not internal");

  for (const id of ["proto", "tune", "design", "validation"]) {
    const handoffs = stringList(commandRecord(runtime, id, phase), "handoff_commands", phase);
    assertListExcludes(phase, handoffs, "/ow:decision", `${id} exposes manual decision handoff`);
  }

  const skill = await readSkill(runtime, "ow-decision");
  assertIncludes(phase, skill, "<command_visibility>internal</command_visibility>", "decision skill is not internal");
  assertIncludes(phase, skill, "<internal_audit_only>", "decision skill missing internal audit block");
  assertIncludes(phase, skill, "not as a normal user-facing workflow step", "decision skill exposes normal user workflow");
}

async function verifyDisplayLabels(runtime: Runtime): Promise<void> {
  const phase = "display-labels";
  for (const id of ["vision", "validation", "proto", "tune", "decision", "design", "spec"]) {
    const skillName = `ow-${id}`;
    const semanticCommand = `/ow:${id}`;
    const displayName = `ow:${id}`;
    const interfaceContent = await read(join(runtime.target, ".agents", "skills", skillName, "agents", "openai.yaml"));
    const skill = await readSkill(runtime, skillName);
    assertPhase(phase, hasYamlScalar(interfaceContent, "display_name", displayName), `${skillName} missing slashless display name`);
    assertPhase(phase, !hasYamlScalar(interfaceContent, "display_name", semanticCommand), `${skillName} display name includes semantic slash`);
    assertIncludes(phase, skill, `Semantic command: ${semanticCommand}`, `${skillName} missing semantic command`);
    assertIncludes(phase, interfaceContent, `Use ${semanticCommand}`, `${skillName} default prompt lost semantic command`);
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

function command(id: string, phase: string): WorkflowCommand {
  const found = getWorkflowCommands().find((item) => item.id === id);
  if (!found) {
    throw phaseError(phase, `source command missing ${id}`);
  }
  return found;
}

function protocolFor(command: WorkflowCommand, phase: string): NonNullable<WorkflowCommand["protocol"]> {
  if (!command.protocol) {
    throw phaseError(phase, `${command.id} source command missing protocol`);
  }
  return command.protocol;
}

function commandRecord(runtime: Runtime, id: string, phase: string): Record<string, unknown> {
  return findRecord(runtime.commands, "id", id, phase, `generated command missing ${id}`);
}

function packetRecord(runtime: Runtime, command: string, phase: string): Record<string, unknown> {
  return findRecord(runtime.packets, "command", command, phase, `context packet missing ${command}`);
}

function findRecord(records: Record<string, unknown>[], key: string, value: string, phase: string, message: string): Record<string, unknown> {
  const found = records.find((record) => record[key] === value);
  if (!found) {
    throw phaseError(phase, message);
  }
  return found;
}

async function readSkill(runtime: Runtime, name: string): Promise<string> {
  return read(join(runtime.target, ".agents", "skills", name, "SKILL.md"));
}

async function readYaml(path: string): Promise<Record<string, unknown>> {
  const parsed = parseYaml(await read(path));
  assert(isRecord(parsed), `${path} must be a YAML mapping`);
  return parsed;
}

async function read(path: string): Promise<string> {
  return readFile(path, "utf8");
}

async function assertFile(path: string): Promise<void> {
  const info = await stat(path);
  assert(info.isFile(), `missing file: ${path}`);
}

function records(data: Record<string, unknown>, key: string, phase: string): Record<string, unknown>[] {
  const value = data[key];
  assertPhase(phase, Array.isArray(value), `${key} must be a list`);
  return value.map((item, index) => {
    assertPhase(phase, isRecord(item), `${key}[${index}] must be a mapping`);
    return item;
  });
}

function recordField(data: Record<string, unknown>, key: string, phase: string): Record<string, unknown> {
  const value = data[key];
  assertPhase(phase, isRecord(value), `${key} must be a mapping`);
  return value;
}

function stringField(data: Record<string, unknown>, key: string, phase: string): string {
  const value = data[key];
  assertPhase(phase, typeof value === "string", `${key} must be a string`);
  return value;
}

function stringList(data: Record<string, unknown>, key: string, phase: string): string[] {
  const value = data[key];
  assertPhase(phase, Array.isArray(value), `${key} must be a list`);
  return value.map((item, index) => {
    assertPhase(phase, typeof item === "string", `${key}[${index}] must be a string`);
    return item;
  });
}

function nestedStringList(data: Record<string, unknown>, keys: string[], phase: string): string[] {
  let current: unknown = data;
  for (const key of keys.slice(0, -1)) {
    assertPhase(phase, isRecord(current), `${keys.join(".")} parent must be a mapping`);
    current = current[key];
  }
  assertPhase(phase, isRecord(current), `${keys.join(".")} parent must be a mapping`);
  return stringList(current, keys[keys.length - 1] ?? "", phase);
}

function assertDiscoveryHandoffs(phase: string, actual: string[], label: string): void {
  for (const command of USER_FACING_DISCOVERY_HANDOFFS) {
    assertListIncludes(phase, actual, command, `${label} missing ${command}`);
  }
  assertListExcludes(phase, actual, "/ow:decision", `${label} exposes manual decision`);
}

function assertExactList(phase: string, actual: string[], expected: string[], message: string): void {
  assertPhase(phase, JSON.stringify(actual) === JSON.stringify(expected), `${message}: ${actual.join(", ")}`);
}

function assertListIncludes(phase: string, list: string[], item: string, message: string): void {
  assertPhase(phase, list.includes(item), message);
}

function assertListExcludes(phase: string, list: string[], item: string, message: string): void {
  assertPhase(phase, !list.includes(item), message);
}

function assertSomeIncludes(phase: string, list: string[], needle: string, message: string): void {
  assertPhase(phase, list.some((item) => item.includes(needle)), message);
}

function assertIncludes(phase: string, content: string, needle: string, message: string): void {
  assertPhase(phase, content.includes(needle), message);
}

function assertNotIncludes(phase: string, content: string, needle: string, message: string): void {
  assertPhase(phase, !content.includes(needle), message);
}

function hasYamlScalar(content: string, key: string, value: string): boolean {
  return content.includes(`${key}: ${value}`) || content.includes(`${key}: "${value}"`);
}

function extractBlock(content: string, key: string): string {
  const openTag = `<${key}>`;
  const closeTag = `</${key}>`;
  if (!content.includes(openTag) || !content.includes(closeTag)) {
    return "";
  }
  return content.split(openTag, 2)[1]?.split(closeTag, 1)[0] ?? "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertPhase(phase: string, condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw phaseError(phase, message);
  }
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function phaseError(phase: string, message: string): Error {
  return new Error(`[${phase}] ${message}`);
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
