export const COMMAND_NAMESPACE = "ow";

export interface WorkflowCommand {
  id: string;
  namespace: typeof COMMAND_NAMESPACE;
  trigger: string;
  legacyTriggers: string[];
  description: string;
  stage: string;
  targetArtifacts: string[];
}

export const WORKFLOW_COMMANDS: readonly WorkflowCommand[] = [
  command("workflow", ["build-workflow"], "Initialize or reconcile OpenWorkflow contracts.", "workflow", [
    ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
    ".openworkflow/workflow/CONTRACT_GRAPH.yaml",
  ]),
  command("context", ["build-context"], "Map the repo context needed for vision and downstream workflow decisions.", "context", [
    ".openworkflow/context/CONTEXT.md",
    ".openworkflow/context/CONTEXT_MAP.yaml",
  ]),
  command("vision", ["build-vision"], "Create or refine the product vision contract through focused collaboration.", "vision", [
    ".openworkflow/vision/VISION.md",
    ".openworkflow/vision/VISION_CONTRACT.yaml",
  ]),
  command("validation", ["build-validation"], "Prioritize the core feature or assumption that must be validated first.", "validation", [
    ".openworkflow/validation/",
  ]),
  command("prototype", ["build-prototype"], "Build the smallest prototype needed to validate the current core feature.", "prototype", [
    ".openworkflow/prototypes/",
  ]),
  command("decision", ["build-decision"], "Record user review outcomes and decide whether the current evidence is accepted.", "decision", [
    ".openworkflow/decisions/",
  ]),
  command("spec", ["build-spec"], "Create one focused production spec from an accepted decision.", "spec", [
    ".openworkflow/specs/",
  ]),
  command("change", ["build-change"], "Create one focused production change for the current core feature.", "change", [
    ".openworkflow/changes/",
  ]),
  command("team", ["run-team", "build-team"], "Execute approved production work through the Agent Team runtime.", "runtime", [
    ".openworkflow/runtime/",
  ]),
] as const;

export function getWorkflowCommands(): readonly WorkflowCommand[] {
  return WORKFLOW_COMMANDS;
}

function command(
  id: string,
  legacyIds: string[],
  description: string,
  stage: string,
  targetArtifacts: string[],
): WorkflowCommand {
  return {
    id,
    namespace: COMMAND_NAMESPACE,
    trigger: `/${COMMAND_NAMESPACE}:${id}`,
    legacyTriggers: legacyIds.map((legacyId) => `/${legacyId}`),
    description,
    stage,
    targetArtifacts,
  };
}
