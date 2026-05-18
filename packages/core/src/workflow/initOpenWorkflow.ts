import { join } from "node:path";
import { getDiscoveryArtifactContracts, getDisclosureLevels } from "../artifacts/registry.js";
import { getWorkflowCommands } from "../commands/registry.js";
import { SCHEMA_VERSION, type InitOptions } from "../contracts/index.js";
import { dumpYaml } from "../contracts/yaml.js";
import { writeTextFile } from "../fs/index.js";

export interface InitResult {
  root: string;
  written: string[];
  skipped: string[];
}

export async function initOpenWorkflow(options: InitOptions): Promise<InitResult> {
  const root = options.root;
  const written: string[] = [];
  const skipped: string[] = [];

  await writeContract(root, ".openworkflow/workflow/WORKFLOW_INDEX.yaml", workflowIndex(options), options.force, written, skipped);
  await writeContract(root, ".openworkflow/config.yaml", workflowConfig(options), options.force, written, skipped);
  await writeContract(root, ".openworkflow/audit/COMMAND_AUDIT_INDEX.yaml", commandAuditIndex(options), options.force, written, skipped);
  await writeContract(root, ".openworkflow/audit/CONTEXT_PACKETS.yaml", contextPackets(options), options.force, written, skipped);
  await writeContract(root, ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml", artifactContracts(options), options.force, written, skipped);
  await writeContract(root, ".openworkflow/audit/DISCLOSURE_LEVELS.yaml", disclosureLevels(options), options.force, written, skipped);

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
      default_command_delivery: options.tools.includes("codex") ? "codex-repo-skills" : "project-local",
      generated_surfaces: generatedSurfaces(options.tools),
      codex_skill_surface: options.tools.includes("codex")
        ? {
            directory: ".agents/skills",
            path_pattern: ".agents/skills/ow-<id>/SKILL.md",
            interface_metadata: "agents/openai.yaml",
            explicit_invocation: "$ow-<id>",
          }
        : null,
    },
  });
}

function generatedSurfaces(tools: string[]): string[] {
  const surfaces = [".openworkflow"];
  if (tools.includes("codex")) {
    surfaces.push(".agents/skills", ".agents/openworkflow-adapter.yaml");
  }
  return surfaces;
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
      contractEntry("audit:command-index", "workflow", ".openworkflow/audit/COMMAND_AUDIT_INDEX.yaml", "active"),
      contractEntry("audit:context-packets", "workflow", ".openworkflow/audit/CONTEXT_PACKETS.yaml", "active"),
      contractEntry("audit:artifact-contracts", "workflow", ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml", "active"),
      contractEntry("audit:disclosure-levels", "workflow", ".openworkflow/audit/DISCLOSURE_LEVELS.yaml", "active"),
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
      conditional_outputs: command.protocol?.conditionalOutputs ?? [],
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
      conditional_outputs: command.protocol?.conditionalOutputs ?? [],
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
      conditional_packets: artifact.conditionalPackets ?? [],
    })),
    updated_at: null,
  });
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

function contractEntry(contract_id: string, contract_type: string, path: string, status: string): Record<string, string> {
  return { contract_id, contract_type, path, status };
}
