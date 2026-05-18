import { join } from "node:path";
import { getDiscoveryArtifactContracts, getDisclosureLevels } from "../artifacts/registry.js";
import { getWorkflowCommands } from "../commands/registry.js";
import { SCHEMA_VERSION, type InitOptions } from "../contracts/index.js";
import { dumpYaml } from "../contracts/yaml.js";
import { ensureDir, writeTextFile } from "../fs/index.js";

export interface InitResult {
  root: string;
  written: string[];
  skipped: string[];
}

export async function initOpenWorkflow(options: InitOptions): Promise<InitResult> {
  const root = options.root;
  const written: string[] = [];
  const skipped: string[] = [];
  const dirs = [
    ".openworkflow/workflow/archive",
    ".openworkflow/context/archive",
    ".openworkflow/vision/archive",
    ".openworkflow/vision/_templates",
    ".openworkflow/vision/sessions/archive",
    ".openworkflow/validation/_templates",
    ".openworkflow/validation/archive",
    ".openworkflow/prototypes/_templates",
    ".openworkflow/prototypes/archive",
    ".openworkflow/decisions/_templates",
    ".openworkflow/decisions/archive",
    ".openworkflow/specs/archive",
    ".openworkflow/changes/archive",
    ".openworkflow/runtime/archive",
    ".openworkflow/adapters/archive",
    ".openworkflow/audit/archive",
  ];

  for (const dir of dirs) {
    await ensureDir(join(root, dir));
    const marker = join(root, dir, ".gitkeep");
    const action = await writeTextFile(marker, "", options.force);
    track(action, marker, written, skipped);
  }

  await writeContract(root, ".openworkflow/workflow/WORKFLOW_INDEX.yaml", workflowIndex(options), options.force, written, skipped);
  await writeContract(root, ".openworkflow/workflow/CONTRACT_GRAPH.yaml", contractGraph(options), options.force, written, skipped);
  await writeContract(root, ".openworkflow/config.yaml", workflowConfig(options), options.force, written, skipped);
  await writeContract(root, ".openworkflow/audit/COMMAND_AUDIT_INDEX.yaml", commandAuditIndex(options), options.force, written, skipped);
  await writeContract(root, ".openworkflow/audit/CONTEXT_PACKETS.yaml", contextPackets(options), options.force, written, skipped);
  await writeContract(root, ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml", artifactContracts(options), options.force, written, skipped);
  await writeContract(root, ".openworkflow/audit/DISCLOSURE_LEVELS.yaml", disclosureLevels(options), options.force, written, skipped);
  for (const artifact of getDiscoveryArtifactContracts()) {
    await writeContract(root, artifact.templatePath, artifactTemplate(artifact.template), options.force, written, skipped);
  }
  await writeContract(root, ".openworkflow/context/CONTEXT.md", contextDoc(options.projectTitle), options.force, written, skipped);
  await writeContract(root, ".openworkflow/context/CONTEXT_MAP.yaml", contextMap(options), options.force, written, skipped);
  await writeContract(root, ".openworkflow/vision/VISION.md", visionDoc(options.projectTitle), options.force, written, skipped);
  await writeContract(root, ".openworkflow/vision/VISION_CONTRACT.yaml", visionContract(options), options.force, written, skipped);
  await writeContract(root, ".openworkflow/validation/VALIDATION_INDEX.yaml", validationIndex(options), options.force, written, skipped);
  await writeContract(root, ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml", prototypeIndex(options), options.force, written, skipped);
  await writeContract(root, ".openworkflow/decisions/DECISION_INDEX.yaml", decisionIndex(options), options.force, written, skipped);
  await writeContract(root, ".openworkflow/specs/SPEC_INDEX.yaml", specIndex(options), options.force, written, skipped);
  await writeContract(root, ".openworkflow/changes/CHANGE_INDEX.yaml", changeIndex(options), options.force, written, skipped);
  await writeContract(root, ".openworkflow/runtime/RUNTIME_INDEX.yaml", runtimeIndex(options), options.force, written, skipped);

  return { root, written, skipped };
}

function workflowConfig(options: InitOptions): string {
  return dumpYaml({
    project_slug: options.projectSlug,
    project_title: options.projectTitle,
    workflow_root: ".openworkflow",
    tools: options.tools,
    adapter_policy: {
      source_of_truth: ".openworkflow",
      default_delivery: "project-local",
      generated_surfaces: [".codex/commands", ".codex/skills", ".codex/agents"],
    },
  });
}

async function writeContract(
  root: string,
  relativePath: string,
  content: string,
  force: boolean,
  written: string[],
  skipped: string[],
): Promise<void> {
  const path = join(root, relativePath);
  const action = await writeTextFile(path, content, force);
  track(action, path, written, skipped);
}

function track(action: "write" | "skip", path: string, written: string[], skipped: string[]): void {
  if (action === "write") {
    written.push(path);
  } else {
    skipped.push(path);
  }
}

function common(contractId: string, contractType: string, title: string, status = "active"): Record<string, unknown> {
  return {
    schema_version: SCHEMA_VERSION,
    contract_id: contractId,
    contract_type: contractType,
    title,
    status,
  };
}

function workflowIndex(options: InitOptions): string {
  const workflowId = `workflow:${options.projectSlug}`;
  return dumpYaml({
    ...common(workflowId, "workflow", `${options.projectTitle} workflow index`),
    workflow_root: ".openworkflow",
    active_change: null,
    tools: options.tools,
    contracts: [
      contractEntry(workflowId, "workflow", ".openworkflow/workflow/WORKFLOW_INDEX.yaml", "active"),
      contractEntry("workflow:contract-graph", "workflow", ".openworkflow/workflow/CONTRACT_GRAPH.yaml", "active"),
      contractEntry("audit:command-index", "workflow", ".openworkflow/audit/COMMAND_AUDIT_INDEX.yaml", "active"),
      contractEntry("audit:context-packets", "workflow", ".openworkflow/audit/CONTEXT_PACKETS.yaml", "active"),
      contractEntry("audit:artifact-contracts", "workflow", ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml", "active"),
      contractEntry("audit:disclosure-levels", "workflow", ".openworkflow/audit/DISCLOSURE_LEVELS.yaml", "active"),
      contractEntry("context:default", "context", ".openworkflow/context/CONTEXT_MAP.yaml", "draft"),
      contractEntry("vision:default", "vision", ".openworkflow/vision/VISION_CONTRACT.yaml", "draft"),
      contractEntry("validation:index", "validation", ".openworkflow/validation/VALIDATION_INDEX.yaml", "active"),
      contractEntry("prototype:index", "prototype", ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml", "active"),
      contractEntry("decision:index", "decision", ".openworkflow/decisions/DECISION_INDEX.yaml", "active"),
      contractEntry("spec:index", "spec", ".openworkflow/specs/SPEC_INDEX.yaml", "active"),
      contractEntry("change:index", "change", ".openworkflow/changes/CHANGE_INDEX.yaml", "active"),
      contractEntry("runtime:index", "runtime", ".openworkflow/runtime/RUNTIME_INDEX.yaml", "active"),
    ],
    updated_at: null,
  });
}

function commandAuditIndex(options: InitOptions): string {
  return dumpYaml({
    ...common("audit:command-index", "workflow", `${options.projectTitle} command audit index`),
    source_of_truth: ".openworkflow",
    commands: getWorkflowCommands().map((command) => ({
      id: command.id,
      trigger: command.trigger,
      stage: command.stage,
      depth: command.protocol?.depth ?? "shallow",
      context_packet: `context:${command.id}`,
      allowed_outputs: command.protocol?.allowedOutputs ?? command.targetArtifacts,
      forbidden_outputs: command.protocol?.forbiddenOutputs ?? [],
      handoff_commands: command.protocol?.handoffCommands ?? [],
    })),
    updated_at: null,
  });
}

function contextPackets(options: InitOptions): string {
  return dumpYaml({
    ...common("audit:context-packets", "workflow", `${options.projectTitle} context packets`),
    packets: getWorkflowCommands().map((command) => ({
      packet_id: `context:${command.id}`,
      command: command.trigger,
      required: command.protocol?.requiredContext ?? [".openworkflow/workflow/WORKFLOW_INDEX.yaml"],
      optional: command.protocol?.optionalContext ?? [],
      forbidden: command.protocol?.forbiddenContext ?? [],
      audit_checkpoints: command.protocol?.auditCheckpoints ?? {
        before: ["Confirm workflow index exists."],
        during: ["Stay inside command scope."],
        after: ["Record outputs in the relevant index."],
      },
    })),
    updated_at: null,
  });
}

function artifactContracts(options: InitOptions): string {
  return dumpYaml({
    ...common("audit:artifact-contracts", "workflow", `${options.projectTitle} artifact contracts`),
    source_of_truth: ".openworkflow",
    artifacts: getDiscoveryArtifactContracts().map((artifact) => ({
      artifact_type: artifact.artifactType,
      contract_type: artifact.contractType,
      command: artifact.command,
      title: artifact.title,
      source_of_truth_path: artifact.sourceOfTruthPath,
      template_path: artifact.templatePath,
      index_path: artifact.indexPath,
      index_collection_key: artifact.indexCollectionKey,
      note_path: artifact.notePath,
      review_path: artifact.reviewPath,
      disclosure_level: artifact.disclosureLevel,
      required_keys: artifact.requiredKeys,
      read_policy: {
        load_by_default: artifact.readPolicy.loadByDefault,
        agent_read_order: artifact.readPolicy.agentReadOrder,
        max_yaml_lines: artifact.readPolicy.maxYamlLines,
        max_note_lines: artifact.readPolicy.maxNoteLines,
        raw_evidence: artifact.readPolicy.rawEvidence,
      },
      active_pointer: {
        index_path: artifact.activePointer.indexPath,
        pointer_key: artifact.activePointer.pointerKey,
        collection_key: artifact.activePointer.collectionKey,
        id_key: artifact.activePointer.idKey,
        path_key: artifact.activePointer.pathKey,
      },
      evidence_policy: artifact.evidencePolicy,
      handoff_key: artifact.handoffKey,
    })),
    updated_at: null,
  });
}

function artifactTemplate(template: Record<string, unknown>): string {
  return dumpYaml(template);
}

function disclosureLevels(options: InitOptions): string {
  return dumpYaml({
    ...common("audit:disclosure-levels", "workflow", `${options.projectTitle} disclosure levels`),
    levels: getDisclosureLevels().map((level) => ({
      level: level.level,
      name: level.name,
      default_for_agents: level.defaultForAgents,
      purpose: level.purpose,
      examples: level.examples,
    })),
    updated_at: null,
  });
}

function contractGraph(options: InitOptions): string {
  const workflowId = `workflow:${options.projectSlug}`;
  return dumpYaml({
    ...common("workflow:contract-graph", "workflow", "OpenWorkflow contract graph"),
    nodes: [
      node(workflowId, "workflow", ".openworkflow/workflow/WORKFLOW_INDEX.yaml"),
      node("audit:command-index", "workflow", ".openworkflow/audit/COMMAND_AUDIT_INDEX.yaml"),
      node("audit:context-packets", "workflow", ".openworkflow/audit/CONTEXT_PACKETS.yaml"),
      node("audit:artifact-contracts", "workflow", ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml"),
      node("audit:disclosure-levels", "workflow", ".openworkflow/audit/DISCLOSURE_LEVELS.yaml"),
      node("context:default", "context", ".openworkflow/context/CONTEXT_MAP.yaml"),
      node("vision:default", "vision", ".openworkflow/vision/VISION_CONTRACT.yaml"),
      node("validation:index", "validation", ".openworkflow/validation/VALIDATION_INDEX.yaml"),
      node("prototype:index", "prototype", ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml"),
      node("decision:index", "decision", ".openworkflow/decisions/DECISION_INDEX.yaml"),
      node("spec:index", "spec", ".openworkflow/specs/SPEC_INDEX.yaml"),
      node("change:index", "change", ".openworkflow/changes/CHANGE_INDEX.yaml"),
      node("runtime:index", "runtime", ".openworkflow/runtime/RUNTIME_INDEX.yaml"),
    ],
    edges: [
      edge(workflowId, "context:default", "initializes"),
      edge(workflowId, "audit:command-index", "audits"),
      edge("audit:command-index", "audit:context-packets", "defines_context"),
      edge("audit:command-index", "audit:artifact-contracts", "defines_outputs"),
      edge("audit:artifact-contracts", "audit:disclosure-levels", "uses_disclosure"),
      edge("context:default", "vision:default", "informs"),
      edge("vision:default", "validation:index", "prioritizes"),
      edge("validation:index", "prototype:index", "prototypes"),
      edge("prototype:index", "decision:index", "awaits_decision"),
      edge("decision:index", "spec:index", "authorizes"),
      edge("spec:index", "change:index", "scopes"),
      edge("change:index", "runtime:index", "executes"),
    ],
    updated_at: null,
  });
}

function contextMap(options: InitOptions): string {
  return dumpYaml({
    ...common("context:default", "context", `${options.projectTitle} shared context`, "draft"),
    depends_on: ["workflow:contract-graph"],
    produces: ["vision:default"],
    glossary: ".openworkflow/context/GLOSSARY.yaml",
    repo_map: [],
    source_references: [],
    updated_at: null,
  });
}

function visionContract(options: InitOptions): string {
  return dumpYaml({
    ...common("vision:default", "vision", `${options.projectTitle} vision`, "draft"),
    depends_on: ["context:default"],
    produces: ["validation:index"],
    artifact_contracts: ["vision_session"],
    current_session: null,
    sessions: [],
    one_sentence: "",
    goals: [],
    non_goals: [],
    users: [],
    quality_bar: [],
    updated_at: null,
  });
}

function validationIndex(options: InitOptions): string {
  return dumpYaml({
    ...common("validation:index", "validation", `${options.projectTitle} validation index`),
    depends_on: ["vision:default"],
    produces: ["prototype:index"],
    artifact_contracts: ["validation_target"],
    current_validation: null,
    validations: [],
    updated_at: null,
  });
}

function prototypeIndex(options: InitOptions): string {
  return dumpYaml({
    ...common("prototype:index", "prototype", `${options.projectTitle} prototype index`),
    depends_on: ["validation:index"],
    produces: ["decision:index"],
    artifact_contracts: ["prototype_evidence"],
    current_prototype: null,
    prototypes: [],
    updated_at: null,
  });
}

function decisionIndex(options: InitOptions): string {
  return dumpYaml({
    ...common("decision:index", "decision", `${options.projectTitle} decision index`),
    depends_on: ["prototype:index"],
    produces: ["spec:index"],
    artifact_contracts: ["decision_record"],
    current_decision: null,
    decisions: [],
    updated_at: null,
  });
}

function specIndex(options: InitOptions): string {
  return dumpYaml({
    ...common("spec:index", "spec", `${options.projectTitle} spec index`),
    depends_on: ["decision:index"],
    produces: ["change:index"],
    specs: [],
    updated_at: null,
  });
}

function changeIndex(options: InitOptions): string {
  return dumpYaml({
    ...common("change:index", "change", `${options.projectTitle} change index`),
    depends_on: ["spec:index"],
    produces: ["runtime:index"],
    changes: [],
    updated_at: null,
  });
}

function runtimeIndex(options: InitOptions): string {
  return dumpYaml({
    ...common("runtime:index", "runtime", `${options.projectTitle} runtime index`),
    depends_on: ["change:index"],
    active_scope: null,
    scopes: [],
    updated_at: null,
  });
}

function contextDoc(projectTitle: string): string {
  return `# ${projectTitle} Context\n\nShared context for OpenWorkflow agents. Keep durable machine-readable context in \`CONTEXT_MAP.yaml\`.\n`;
}

function visionDoc(projectTitle: string): string {
  return `# ${projectTitle} Vision\n\nHuman-readable vision notes. Keep the durable contract in \`VISION_CONTRACT.yaml\`.\n`;
}

function contractEntry(contract_id: string, contract_type: string, path: string, status: string): Record<string, string> {
  return { contract_id, contract_type, path, status };
}

function node(contract_id: string, contract_type: string, path: string): Record<string, string> {
  return { contract_id, contract_type, path };
}

function edge(from: string, to: string, relation: string): Record<string, string> {
  return { from, to, relation };
}
