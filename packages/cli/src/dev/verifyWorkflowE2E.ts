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
  currentState: Record<string, unknown>;
  commands: Record<string, unknown>[];
  packets: Record<string, unknown>[];
  artifacts: Record<string, unknown>[];
}

async function main(): Promise<number> {
  await assertFile(CLI);
  const tempRoot = await mkdtemp(join(tmpdir(), "openworkflow-e2e-workflow-"));
  try {
    const target = join(tempRoot, "target");
    const codexHome = join(tempRoot, "codex-home");
    const env = { ...process.env, CODEX_HOME: codexHome };

    await run(["node", CLI, "init", target, "--tools", "codex", "--force"], env);
    await run(["node", CLI, "sync", "--root", target], env);
    await run(["node", CLI, "doctor", "--root", target, "--tools", "codex"], env);
    await run(["node", CLI, "validate", "--root", target], env);
    await verifyAgentOnboarding(target, env);

    const runtime = await loadRuntime(target);
    await verifyCurrentState(runtime);
    await verifyVisionPhase(runtime);
    await verifyValidationPhase(runtime);
    await verifyPrototypePhase(runtime);
    await verifyTunePhase(runtime);
    await verifyInternalDecisionPhase(runtime);
    await verifyProductionCommandPhases(runtime);
    await verifyDisplayLabels(runtime);
    await verifyBriefReadModel(runtime);
    await verifyCommandReadiness(runtime);
    await verifySummaryReadModel(runtime);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }

  console.log("OpenWorkflow workflow E2E regression verification passed.");
  return 0;
}

async function loadRuntime(target: string): Promise<Runtime> {
  const commandIndex = await readYaml(join(target, ".openworkflow", "audit", "COMMAND_AUDIT_INDEX.yaml"));
  const currentState = await readYaml(join(target, ".openworkflow", "CURRENT_STATE.yaml"));
  const contextPackets = await readYaml(join(target, ".openworkflow", "audit", "CONTEXT_PACKETS.yaml"));
  const artifactContracts = await readYaml(join(target, ".openworkflow", "audit", "ARTIFACT_CONTRACTS.yaml"));
  return {
    target,
    currentState,
    commands: records(commandIndex, "commands", "runtime"),
    packets: records(contextPackets, "packets", "runtime"),
    artifacts: records(artifactContracts, "artifacts", "runtime"),
  };
}

async function verifyCurrentState(runtime: Runtime): Promise<void> {
  const phase = "current-state";
  assertPhase(phase, runtime.currentState.contract_id === "workflow:current-state", "current state contract id mismatch");
  assertPhase(phase, runtime.currentState.active_stage === "workflow", "initial active stage should be workflow");
  assertPhase(phase, runtime.currentState.next_command === "/ow:vision", "initial next command should be /ow:vision");
  assertListIncludes(phase, stringList(runtime.currentState, "read_this_first", phase), ".openworkflow/CURRENT_STATE.yaml", "current state does not point to itself");
  const lastDecision = recordField(runtime.currentState, "last_decision", phase);
  assertPhase(phase, "outcome" in lastDecision, "current state last_decision missing outcome");
}

async function verifyVisionPhase(runtime: Runtime): Promise<void> {
  const phase = "vision";
  const source = command("vision", phase);
  const protocol = protocolFor(source, phase);
  assertPhase(phase, protocol.interactionMode === "delayed-compile-product-interrogation", "source protocol is not delayed-compile product interrogation");
  assertExactList(phase, protocol.handoffCommands, ["/ow:validation"], "vision source handoffs changed");
  assertListIncludes(phase, protocol.forbiddenOutputs, ".openworkflow/validation/**", "vision can create validation artifacts");
  assertListIncludes(phase, protocol.forbiddenOutputs, ".openworkflow/prototypes/**", "vision can create prototype artifacts");
  assertSomeIncludes(phase, protocol.auditCheckpoints.before, "product partner, requirements interrogator, and intent compiler", "vision source missing three-role framing");
  assertSomeIncludes(phase, protocol.auditCheckpoints.before, "do not start by creating or updating durable vision files", "vision does not start conversation-first");
  assertSomeIncludes(phase, protocol.auditCheckpoints.during, "make each question depend on the previous answer", "vision does not enforce progressive questioning");
  assertSomeIncludes(phase, protocol.auditCheckpoints.after, "proto_readiness.status", "vision compile does not require proto-readiness");
  assertSomeIncludes(phase, protocol.auditCheckpoints.after, "user readiness", "vision handoff does not require user readiness confirmation");

  const generated = commandRecord(runtime, "vision", phase);
  assertPhase(phase, stringField(generated, "visibility", phase) === "user", "generated vision command is not user visible");
  assertExactList(phase, stringList(generated, "handoff_commands", phase), ["/ow:validation"], "generated vision handoffs changed");
  assertListIncludes(phase, stringList(generated, "forbidden_outputs", phase), ".openworkflow/prototypes/**", "generated vision can create prototypes");

  const packet = packetRecord(runtime, "/ow:vision", phase);
  assertSomeIncludes(phase, nestedStringList(packet, ["audit_checkpoints", "before"], phase), "Ask the next useful vision question", "context packet lost conversation-first checkpoint");
  assertSomeIncludes(phase, nestedStringList(packet, ["audit_checkpoints", "during"], phase), "Cover mandatory vision and proto-readiness dimensions", "context packet lost mandatory proto-readiness checkpoint");
  assertSomeIncludes(phase, nestedStringList(packet, ["audit_checkpoints", "after"], phase), "proto-readiness", "context packet lost proto-readiness gate");

  const skill = await readSkill(runtime, "ow-vision");
  assertIncludes(phase, skill, ".openworkflow/CURRENT_STATE.yaml", "skill missing current state loading guidance");
  assertIncludes(phase, skill, "clear stale current_question", "skill missing stale question closure guidance");
  assertIncludes(phase, skill, "summary_policy", "skill missing summary policy guidance");
  assertIncludes(phase, skill, "<vision_role>", "skill missing vision role block");
  assertIncludes(phase, skill, "Act as product partner", "skill missing product partner role");
  assertIncludes(phase, skill, "Act as requirements interrogator", "skill missing requirements interrogator role");
  assertIncludes(phase, skill, "Act as intent compiler", "skill missing intent compiler role");
  assertIncludes(phase, skill, "<interaction_modes>", "skill missing delayed compile modes");
  assertIncludes(phase, skill, "Interview mode is the default", "skill missing interview mode");
  assertIncludes(phase, skill, "Checkpoint mode writes", "skill missing checkpoint mode");
  assertIncludes(phase, skill, "Compile mode writes", "skill missing compile mode");
  assertIncludes(phase, skill, "<agent_first_consumer>", "skill missing Agent-first consumer guidance");
  assertIncludes(phase, skill, "Treat the next implementing Agent as the first consumer", "skill missing first-consumer framing");
  assertIncludes(phase, skill, "vision_delta must preserve enough handoff intelligence", "skill missing compact handoff intelligence guidance");
  assertIncludes(phase, skill, "<conversation_first>", "skill missing conversation_first block");
  assertIncludes(phase, skill, "Ask exactly one question", "skill no longer limits vision to one focused question");
  assertIncludes(phase, skill, "<mandatory_coverage>", "skill missing mandatory coverage block");
  assertIncludes(phase, skill, "<proto_readiness_gate>", "skill missing proto-readiness gate");
  assertIncludes(phase, skill, "VISION.md is ready only when /ow:proto can derive", "skill missing proto-readiness acceptance");
  assertIncludes(phase, skill, "Do not hand off to /ow:validation until mandatory coverage is addressed, proto-readiness", "skill lost validation handoff gate");
  assertIncludes(phase, skill, "not on a fixed number of turns", "skill permits fixed-turn readiness");
  assertIncludes(phase, skill, "<artifact_checkpoint>", "skill missing artifact checkpoint separation");

  const template = recordField(artifactRecord(runtime, "vision_session", phase), "template", phase);
  const visionDelta = recordField(template, "vision_delta", phase);
  assertPhase(phase, Object.hasOwn(visionDelta, "problem"), "vision template missing problem field");
  assertPhase(phase, Object.hasOwn(visionDelta, "ai_native_role"), "vision template missing ai_native_role field");
  assertPhase(phase, Object.hasOwn(visionDelta, "success_signals"), "vision template missing success_signals field");
  assertPhase(phase, Object.hasOwn(visionDelta, "failure_signals"), "vision template missing failure_signals field");
  const strategicCore = recordField(template, "strategic_core", phase);
  assertPhase(phase, Object.hasOwn(strategicCore, "target_user"), "vision template missing strategic_core.target_user");
  assertPhase(phase, Object.hasOwn(strategicCore, "core_differentiator"), "vision template missing strategic_core.core_differentiator");
  const productSystemSeed = recordField(template, "product_system_seed", phase);
  assertPhase(phase, Object.hasOwn(productSystemSeed, "primary_loop"), "vision template missing product_system_seed.primary_loop");
  assertPhase(phase, Object.hasOwn(productSystemSeed, "anti_goals"), "vision template missing product_system_seed.anti_goals");
  const protoReadiness = recordField(template, "proto_readiness", phase);
  assertPhase(phase, protoReadiness.status === "missing", "vision proto_readiness should default to missing");
  assertPhase(phase, Object.hasOwn(protoReadiness, "missing_for_proto"), "vision template missing proto_readiness.missing_for_proto");
  assertPhase(phase, Object.hasOwn(protoReadiness, "prototype_direction_seeds"), "vision template missing proto_readiness.prototype_direction_seeds");
  assertPhase(phase, Object.hasOwn(protoReadiness, "validation_target"), "vision template missing proto_readiness.validation_target");
  const coverage = recordField(template, "coverage", phase);
  assertPhase(phase, Object.hasOwn(coverage, "proto_readiness"), "vision template missing coverage.proto_readiness");
  const handoff = recordField(template, "handoff", phase);
  assertPhase(phase, handoff.ready === false, "vision template should default to not ready");
  assertPhase(phase, handoff.next_command === null, "vision template should not default to validation handoff");
  assertPhase(phase, Object.hasOwn(handoff, "blockers"), "vision handoff template missing blockers field");
  assertPhase(phase, Object.hasOwn(handoff, "readiness_notes"), "vision handoff template missing readiness_notes field");
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

  const template = recordField(artifactRecord(runtime, "validation_target", phase), "template", phase);
  assertPhase(phase, "prototype_scope" in template, "validation template missing prototype_scope");
  assertPhase(phase, stringList(template, "decision_options", phase).includes("needs_more_evidence"), "validation template missing decision options");
}

async function verifyPrototypePhase(runtime: Runtime): Promise<void> {
  const phase = "prototype";
  const source = command("proto", phase);
  const protocol = protocolFor(source, phase);
  assertPhase(phase, protocol.interactionMode === "image-first-strategic-proto-prompt-pack", "prototype source protocol is not image-first prompt pack");
  assertDiscoveryHandoffs(phase, protocol.handoffCommands, "source prototype handoffs");
  assertListIncludes(phase, protocol.allowedOutputs, ".openworkflow/decisions/<id>/DECISION.yaml", "prototype cannot write decision audit");
  assertSomeIncludes(phase, protocol.auditCheckpoints.before, "validation_input.mode", "prototype does not record validation mode");
  assertSomeIncludes(phase, protocol.auditCheckpoints.during, "5-8 strategic prototype hypotheses", "prototype does not generate strategic hypotheses");
  assertSomeIncludes(phase, protocol.auditCheckpoints.after, "PROTO_PROMPT_PACK.yaml", "prototype does not write prompt pack");
  assertSomeIncludes(phase, protocol.auditCheckpoints.after, "decision audit record internally", "prototype does not write decision audit internally");
  assertSomeIncludes(phase, protocol.antiPatterns, "Do not ask the user to manually invoke /ow:decision", "prototype permits manual decision handoff");
  assertSomeIncludes(phase, protocol.antiPatterns, "Do not generate HTML", "prototype permits HTML generation");

  const generated = commandRecord(runtime, "proto", phase);
  assertDiscoveryHandoffs(phase, stringList(generated, "handoff_commands", phase), "generated prototype handoffs");
  assertListIncludes(phase, stringList(generated, "allowed_outputs", phase), ".openworkflow/decisions/<id>/DECISION.yaml", "generated prototype cannot write decision audit");
  assertListIncludes(phase, stringList(generated, "allowed_outputs", phase), ".openworkflow/prototypes/<id>/PROTO_PROMPT_PACK.yaml", "generated prototype missing prompt pack output");

  const packet = packetRecord(runtime, "/ow:proto", phase);
  assertSomeIncludes(phase, nestedStringList(packet, ["audit_checkpoints", "during"], phase), "strategic prototype hypotheses", "context packet lost strategic prompt behavior");
  assertSomeIncludes(phase, nestedStringList(packet, ["audit_checkpoints", "after"], phase), "decision audit record internally", "context packet lost internal decision audit");

  const skill = await readSkill(runtime, "ow-proto");
  for (const tag of [
    "validation_consumption",
    "strategic_prompt_pack",
    "image_only_boundary",
    "review_evidence",
    "internal_decision_audit",
  ]) {
    assertIncludes(phase, skill, `<${tag}>`, `skill missing ${tag} block`);
  }
  assertIncludes(phase, skill, "prompt_pack_type: strategic_proto_prompt_pack", "skill lost strategic prompt pack rule");
  assertIncludes(phase, skill, "Do not write HTML, CSS, runnable prototypes", "skill lost image-only boundary");
  assertIncludes(phase, skill, "decision_record", "skill does not expose decision artifact contract for internal audit");
  assertNotIncludes(phase, extractBlock(skill, "handoff_commands"), "/ow:decision", "skill exposes decision in prototype handoffs");

  const artifacts = getDiscoveryArtifactContractsForCommand("/ow:proto").map((artifact) => artifact.artifactType);
  assertListIncludes(phase, artifacts, "prototype_evidence", "source proto artifacts missing prototype evidence");
  assertListIncludes(phase, artifacts, "decision_record", "source proto artifacts missing decision record");

  const template = recordField(artifactRecord(runtime, "prototype_evidence", phase), "template", phase);
  assertPhase(phase, "prompt_pack_type" in template, "prototype template missing prompt pack type");
  assertPhase(phase, "validation_input" in template, "prototype template missing validation input");
  assertPhase(phase, "directions" in template, "prototype template missing directions");
  assertPhase(phase, "build_recommendation" in template, "prototype template missing build recommendation");
  assertPhase(phase, "negative_constraints" in template, "prototype template missing negative constraints");
  assertPhase(phase, "review_plan" in template, "prototype template missing review plan");
  const handoff = recordField(template, "handoff", phase);
  assertPhase(phase, handoff.next_command !== "/ow:decision", "prototype template exposes manual decision as next command");
  assertListIncludes(phase, USER_FACING_DISCOVERY_HANDOFFS, String(handoff.next_command), "prototype template next command is not user-facing");
}

async function verifyTunePhase(runtime: Runtime): Promise<void> {
  const phase = "tune";
  const source = command("tune", phase);
  const protocol = protocolFor(source, phase);
  assertPhase(phase, protocol.interactionMode === "screen-bound-prototype-refinement", "tune source protocol is not screen-bound refinement");
  assertDiscoveryHandoffs(phase, protocol.handoffCommands, "source tune handoffs");
  assertListIncludes(phase, protocol.allowedOutputs, ".openworkflow/decisions/<id>/DECISION.yaml", "tune cannot write decision audit");
  assertListExcludes(phase, protocol.requiredContext, ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml", "tune requires prototype index and cannot bootstrap from validation");
  assertListIncludes(phase, protocol.optionalContext, ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml", "tune optional context missing prototype index");
  assertSomeIncludes(phase, protocol.auditCheckpoints.before, "accepted baseline screen group", "tune does not require baseline screens");
  assertSomeIncludes(phase, protocol.auditCheckpoints.during, "MUST_INHERIT", "tune does not require delta rules");
  assertSomeIncludes(phase, protocol.auditCheckpoints.during, "target screen id", "tune does not bind screen prompts");
  assertSomeIncludes(phase, protocol.auditCheckpoints.after, "internal decision audit record", "tune does not record decision audit internally");
  assertSomeIncludes(phase, protocol.antiPatterns, "Do not ask the user to manually invoke /ow:decision", "tune permits manual decision handoff");

  const generated = commandRecord(runtime, "tune", phase);
  assertDiscoveryHandoffs(phase, stringList(generated, "handoff_commands", phase), "generated tune handoffs");
  assertListIncludes(phase, stringList(generated, "allowed_outputs", phase), ".openworkflow/decisions/<id>/DECISION.yaml", "generated tune cannot write decision audit");

  const packet = packetRecord(runtime, "/ow:tune", phase);
  assertListExcludes(phase, stringList(packet, "required", phase), ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml", "context packet requires prototype index");
  assertListIncludes(phase, stringList(packet, "optional", phase), ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml", "context packet optional context missing prototype index");

  const skill = await readSkill(runtime, "ow-tune");
  for (const tag of ["target_resolution", "baseline_screen_audit", "inheritance_delta_rules", "screen_manifest", "internal_decision_audit"]) {
    assertIncludes(phase, skill, `<${tag}>`, `skill missing ${tag} block`);
  }
  assertIncludes(phase, skill, "/ow:tune resolves to the current prototype prompt pack or accepted baseline screen group by default.", "skill lost default target behavior");
  assertIncludes(phase, skill, "Every screen prompt must include prompt_id", "skill lost screen manifest rule");
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

async function verifyProductionCommandPhases(runtime: Runtime): Promise<void> {
  await verifySpecPhase(runtime);
  await verifyChangePhase(runtime);
  await verifyTeamPhase(runtime);
}

async function verifySpecPhase(runtime: Runtime): Promise<void> {
  const phase = "spec";
  const source = command("spec", phase);
  const protocol = protocolFor(source, phase);
  assertPhase(phase, protocol.interactionMode === "accepted-design-to-production-spec", "spec source protocol is not production spec");
  assertListIncludes(phase, protocol.requiredContext, ".openworkflow/design/DESIGN_INDEX.yaml", "spec does not require design index");
  assertListIncludes(phase, protocol.allowedOutputs, ".openworkflow/specs/<id>/SPEC.yaml", "spec cannot write SPEC.yaml");
  assertListIncludes(phase, protocol.forbiddenOutputs, ".openworkflow/changes/**", "spec can create changes");
  assertExactList(phase, protocol.handoffCommands, ["/ow:change", "/ow:design"], "spec source handoffs changed");
  assertSomeIncludes(phase, protocol.auditCheckpoints.before, "Lazy-create", "spec missing lazy-create checkpoint");

  const generated = commandRecord(runtime, "spec", phase);
  assertPhase(phase, stringField(generated, "depth", phase) === "deep", "generated spec is not deep");
  assertListIncludes(phase, stringList(generated, "allowed_outputs", phase), ".openworkflow/specs/<id>/SPEC.yaml", "generated spec cannot write SPEC.yaml");

  const packet = packetRecord(runtime, "/ow:spec", phase);
  assertListIncludes(phase, stringList(packet, "required", phase), ".openworkflow/design/DESIGN_INDEX.yaml", "spec packet does not require design index");
  assertSomeIncludes(phase, nestedStringList(packet, ["audit_checkpoints", "before"], phase), "Lazy-create", "spec packet lost lazy-create checkpoint");

  const skill = await readSkill(runtime, "ow-spec");
  for (const required of ["<lazy_create>", "<spec_quality_bar>", "<readiness_gate>", "A production spec must be enough for an implementation agent"]) {
    assertIncludes(phase, skill, required, `spec skill missing ${required}`);
  }

  const artifact = artifactRecord(runtime, "production_spec", phase);
  assertPhase(phase, artifact.command === "/ow:spec", "production_spec command mismatch");
  assertPhase(phase, artifact.lazy_create === true, "production_spec is not marked lazy_create");
  assertPhase(phase, "summary_policy" in artifact, "production_spec missing summary policy");
  const template = recordField(artifact, "template", phase);
  assertPhase(phase, "change_readiness" in template, "production_spec template missing change_readiness");
}

async function verifyChangePhase(runtime: Runtime): Promise<void> {
  const phase = "change";
  const source = command("change", phase);
  const protocol = protocolFor(source, phase);
  assertPhase(phase, protocol.interactionMode === "production-change-planning", "change source protocol is not production planning");
  assertListIncludes(phase, protocol.requiredContext, ".openworkflow/specs/SPEC_INDEX.yaml", "change does not require spec index");
  assertListIncludes(phase, protocol.allowedOutputs, ".openworkflow/changes/<id>/WORK_ITEMS.yaml", "change cannot write work items");
  assertListIncludes(phase, protocol.forbiddenOutputs, ".openworkflow/runtime/**", "change can create runtime");
  assertExactList(phase, protocol.handoffCommands, ["/ow:team", "/ow:spec"], "change source handoffs changed");

  const generated = commandRecord(runtime, "change", phase);
  assertPhase(phase, stringField(generated, "depth", phase) === "deep", "generated change is not deep");

  const packet = packetRecord(runtime, "/ow:change", phase);
  assertListIncludes(phase, stringList(packet, "required", phase), ".openworkflow/specs/SPEC_INDEX.yaml", "change packet does not require spec index");
  assertSomeIncludes(phase, nestedStringList(packet, ["audit_checkpoints", "during"], phase), "owned paths", "change packet lost work-item planning guidance");

  const skill = await readSkill(runtime, "ow-change");
  for (const required of ["<lazy_create>", "<planning_quality_bar>", "<readiness_gate>", "owned_paths"]) {
    assertIncludes(phase, skill, required, `change skill missing ${required}`);
  }

  const artifact = artifactRecord(runtime, "production_change", phase);
  assertPhase(phase, artifact.command === "/ow:change", "production_change command mismatch");
  assertPhase(phase, artifact.lazy_create === true, "production_change is not marked lazy_create");
  assertPhase(phase, "summary_policy" in artifact, "production_change missing summary policy");
  const template = recordField(artifact, "template", phase);
  assertPhase(phase, "runtime_readiness" in template, "production_change template missing runtime_readiness");
}

async function verifyTeamPhase(runtime: Runtime): Promise<void> {
  const phase = "team";
  const source = command("team", phase);
  const protocol = protocolFor(source, phase);
  assertPhase(phase, protocol.interactionMode === "approved-change-team-execution", "team source protocol is not approved execution");
  assertListIncludes(phase, protocol.requiredContext, ".openworkflow/changes/CHANGE_INDEX.yaml", "team does not require change index");
  assertListIncludes(phase, protocol.allowedOutputs, ".openworkflow/runtime/<id>/STATE.yaml", "team cannot write runtime state");
  assertExactList(phase, protocol.handoffCommands, ["/ow:change"], "team source handoffs changed");

  const generated = commandRecord(runtime, "team", phase);
  assertPhase(phase, stringField(generated, "depth", phase) === "deep", "generated team is not deep");

  const packet = packetRecord(runtime, "/ow:team", phase);
  assertListIncludes(phase, stringList(packet, "required", phase), ".openworkflow/changes/CHANGE_INDEX.yaml", "team packet does not require change index");
  assertSomeIncludes(phase, nestedStringList(packet, ["audit_checkpoints", "before"], phase), "Lazy-create runtime state", "team packet lost lazy-create checkpoint");

  const skill = await readSkill(runtime, "ow-team");
  for (const required of ["<lazy_create>", "<execution_quality_bar>", "<handoff_gate>", "Track active change, active work item"]) {
    assertIncludes(phase, skill, required, `team skill missing ${required}`);
  }

  const artifact = artifactRecord(runtime, "team_runtime", phase);
  assertPhase(phase, artifact.command === "/ow:team", "team_runtime command mismatch");
  assertPhase(phase, artifact.lazy_create === true, "team_runtime is not marked lazy_create");
  assertPhase(phase, "summary_policy" in artifact, "team_runtime missing summary policy");
  const template = recordField(artifact, "template", phase);
  assertPhase(phase, "handoff" in template, "team_runtime template missing handoff");
}

async function verifyDisplayLabels(runtime: Runtime): Promise<void> {
  const phase = "display-labels";
  for (const id of ["vision", "validation", "proto", "tune", "decision", "design", "spec", "change", "team"]) {
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

async function verifyBriefReadModel(runtime: Runtime): Promise<void> {
  const phase = "brief-read-model";
  const report = JSON.parse(await runCapture(["node", CLI, "brief", "--root", runtime.target, "--json"], { ...process.env })) as Record<string, unknown>;
  assertPhase(phase, report.command === "brief", "brief report command mismatch");
  assertPhase(phase, report.ok === true, "brief report should be ok");
  const json = recordField(report, "data", phase);
  for (const key of ["project", "workflow", "read_this_first", "active_pointers", "health", "git", "agent_guidance"]) {
    assertPhase(phase, key in json, `brief missing key ${key}`);
  }
  const workflow = recordField(json, "workflow", phase);
  assertPhase(phase, workflow.active_stage === "workflow", "brief active_stage mismatch");
  assertPhase(phase, workflow.next_command === "/ow:vision", "brief next_command mismatch");
  const readThisFirst = json.read_this_first;
  assertPhase(phase, Array.isArray(readThisFirst), "brief read_this_first must be a list");
  assertPhase(phase, readThisFirst.includes(".openworkflow/CURRENT_STATE.yaml"), "brief does not include current state read pointer");
  const guidance = recordField(json, "agent_guidance", phase);
  assertPhase(phase, String(guidance.recommended_next_action).includes("/ow:vision"), "brief guidance does not point to next command");
}

async function verifyCommandReadiness(runtime: Runtime): Promise<void> {
  const phase = "command-readiness";
  const report = JSON.parse(await runCapture(["node", CLI, "check", "/ow:vision", "--root", runtime.target, "--json"], { ...process.env })) as Record<string, unknown>;
  assertPhase(phase, report.command === "check", "check report command mismatch");
  assertPhase(phase, report.ok === true, "vision check should be ok");
  const data = recordField(report, "data", phase);
  assertPhase(phase, data.ready === true, "vision should be ready");
  assertPhase(phase, Array.isArray(data.required_context), "check missing required_context");
  assertPhase(phase, Array.isArray(data.forbidden_context), "check missing forbidden_context");
  assertPhase(phase, Array.isArray(data.allowed_outputs), "check missing allowed_outputs");
  assertPhase(phase, Array.isArray(data.handoff_commands), "check missing handoff_commands");

  const spec = await runCaptureStatus(["node", CLI, "check", "ow-spec", "--root", runtime.target, "--json"], { ...process.env });
  assertPhase(phase, spec.code !== 0, "spec check should fail without product design");
  const specReport = JSON.parse(spec.output) as Record<string, unknown>;
  const specData = recordField(specReport, "data", phase);
  assertPhase(phase, Array.isArray(specData.blockers), "spec check missing blockers");
}

async function verifySummaryReadModel(runtime: Runtime): Promise<void> {
  const phase = "summary-read-model";
  const report = JSON.parse(await runCapture(["node", CLI, "summaries", "--root", runtime.target, "--json"], { ...process.env })) as Record<string, unknown>;
  assertPhase(phase, report.command === "summaries", "summaries report command mismatch");
  assertPhase(phase, report.ok === true, "fresh summaries report should be ok");
  const data = recordField(report, "data", phase);
  const counts = recordField(data, "counts", phase);
  assertPhase(phase, Number(counts.not_instantiated) > 0, "fresh summaries should report not_instantiated artifacts");
  assertPhase(phase, Array.isArray(data.entries), "summaries missing entries");

  const brief = JSON.parse(await runCapture(["node", CLI, "brief", "--root", runtime.target, "--json"], { ...process.env })) as Record<string, unknown>;
  const briefData = recordField(brief, "data", phase);
  const health = recordField(briefData, "health", phase);
  assertPhase(phase, "summaries" in health, "brief health missing summaries");

  const check = JSON.parse(await runCapture(["node", CLI, "check", "/ow:vision", "--root", runtime.target, "--json"], { ...process.env })) as Record<string, unknown>;
  const checkData = recordField(check, "data", phase);
  assertPhase(phase, Array.isArray(checkData.summary_guidance), "check missing summary_guidance");

  const inspect = JSON.parse(await runCapture(["node", CLI, "inspect", "--root", runtime.target, "--json"], { ...process.env })) as Record<string, unknown>;
  assertPhase(phase, inspect.command === "inspect", "inspect report command mismatch");
  assertPhase(phase, inspect.ok === true, "fresh inspect report should be ok");
  const inspectData = recordField(inspect, "data", phase);
  for (const key of ["project", "workflow", "health", "summaries", "next_command_check", "read_order", "recommended_next_actions"]) {
    assertPhase(phase, key in inspectData, `inspect missing key ${key}`);
  }
  const readOrder = recordField(inspectData, "read_order", phase);
  assertPhase(phase, Array.isArray(readOrder.must_read), "inspect read_order missing must_read");
  assertPhase(phase, readOrder.must_read.includes(".openworkflow/CURRENT_STATE.yaml"), "inspect must_read missing current state");

  const context = JSON.parse(await runCapture(["node", CLI, "context", "--root", runtime.target, "--json"], { ...process.env })) as Record<string, unknown>;
  assertPhase(phase, context.command === "context", "context report command mismatch");
  assertPhase(phase, context.ok === true, "fresh context report should be ok");
  const contextData = recordField(context, "data", phase);
  for (const key of ["normalized_command", "packet_id", "budget", "readiness", "inspect", "context_packet", "included", "omitted", "recommended_next_actions"]) {
    assertPhase(phase, key in contextData, `context missing key ${key}`);
  }
  assertPhase(phase, contextData.normalized_command === "/ow:vision", "context should default to CURRENT_STATE.next_command");
  assertPhase(phase, contextData.packet_id === "context:vision", "context missing packet id");
  assertPhase(phase, Array.isArray(contextData.included), "context included must be array");
  assertPhase(phase, Array.isArray(contextData.omitted), "context omitted must be array");
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

async function verifyAgentOnboarding(target: string, env: NodeJS.ProcessEnv): Promise<void> {
  const phase = "agent-onboarding";
  const guide = await read(join(target, "AGENTS.md"));
  assertIncludes(phase, guide, "openworkflow --help", "AGENTS.md does not point agents to CLI help");
  assertIncludes(phase, guide, "Prefer `--json`", "AGENTS.md does not mention JSON report mode");
  assertIncludes(phase, guide, "openworkflow inspect --root . --json", "AGENTS.md does not mention inspect command");
  assertIncludes(phase, guide, "openworkflow context --root . --json", "AGENTS.md does not mention context command");
  assertIncludes(phase, guide, "command_audit", "AGENTS.md does not mention compact command audit slice");
  assertIncludes(phase, guide, "--max-bytes <n>", "AGENTS.md does not mention context budget");
  assertIncludes(phase, guide, "--mode full", "AGENTS.md does not mention full context mode");
  assertIncludes(phase, guide, "openworkflow draft --root . --artifact <type> --id <id> --json", "AGENTS.md does not mention draft command");
  assertIncludes(phase, guide, "openworkflow register --root . --artifact <path> --json", "AGENTS.md does not mention register command");
  assertIncludes(phase, guide, ".openworkflow/CURRENT_STATE.yaml", "AGENTS.md does not point agents to current state");
  assertIncludes(phase, guide, "CLI commands maintain and summarize the repo-local workflow surface", "AGENTS.md does not distinguish CLI maintenance commands");
  assertIncludes(phase, guide, "openworkflow brief --root .", "AGENTS.md does not mention brief command");
  assertIncludes(phase, guide, "openworkflow status --root .", "AGENTS.md does not mention status command");
  assertIncludes(phase, guide, "openworkflow check /ow:<command> --root . --json", "AGENTS.md does not mention check command");
  assertIncludes(phase, guide, "openworkflow summaries --root . --json", "AGENTS.md does not mention summaries command");
  assertIncludes(phase, guide, "openworkflow summarize --root . --artifact <path> --json", "AGENTS.md does not mention summarize command");
  assertIncludes(phase, guide, "SUMMARY.yaml trust is checked by `summaries`, not by `validate`", "AGENTS.md does not explain validate/summaries boundary");
  assertIncludes(phase, guide, "Repo-local workflow commands are delivered as Agent skills", "AGENTS.md does not distinguish workflow skill commands");
  assertIncludes(phase, guide, "Respect lazy creation", "AGENTS.md does not preserve lazy artifact creation boundary");
  const help = await runCapture(["node", CLI, "--help"], env);
  assertIncludes(phase, help, "Agent quick start", "help missing Agent quick start");
  assertIncludes(phase, help, "Two command surfaces", "help missing command surface distinction");
  assertIncludes(phase, help, "Repo-local workflow commands are Agent skills", "help missing workflow skill explanation");
  assertIncludes(phase, help, "Lazy creation boundary", "help missing lazy creation boundary");
  assertIncludes(phase, help, "Every command supports --json", "help missing JSON report mode");
  assertIncludes(phase, help, "inspect", "help missing inspect command");
  assertIncludes(phase, help, "context", "help missing context command");
  assertIncludes(phase, help, "command_audit", "help missing compact command audit slice");
  assertIncludes(phase, help, "--max-bytes", "help missing context budget");
  assertIncludes(phase, help, "--mode full", "help missing full context mode");
  assertIncludes(phase, help, "draft", "help missing draft command");
  assertIncludes(phase, help, "contract-shaped source artifact", "help missing draft boundary");
  assertIncludes(phase, help, "register", "help missing register command");
  assertIncludes(phase, help, "index registration", "help missing register boundary");
  assertIncludes(phase, help, "check", "help missing check command");
  assertIncludes(phase, help, "summaries", "help missing summaries command");
  assertIncludes(phase, help, "summarize", "help missing summarize command");
  assertIncludes(phase, help, "pass --write to update summary files", "help missing summarize write boundary");
  assertIncludes(phase, help, "SUMMARY.yaml freshness is checked by summaries", "help missing validate/summaries boundary");
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

function artifactRecord(runtime: Runtime, artifactType: string, phase: string): Record<string, unknown> {
  return findRecord(runtime.artifacts, "artifact_type", artifactType, phase, `artifact contract missing ${artifactType}`);
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
