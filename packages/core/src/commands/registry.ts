export const COMMAND_NAMESPACE = "ow";

export interface WorkflowCommand {
  id: string;
  namespace: typeof COMMAND_NAMESPACE;
  trigger: string;
  legacyTriggers: string[];
  description: string;
  stage: string;
  targetArtifacts: string[];
  protocol?: CommandProtocol;
}

export interface CommandProtocol {
  depth: "deep" | "shallow";
  interactionMode: string;
  requiredContext: string[];
  optionalContext: string[];
  forbiddenContext: string[];
  allowedOutputs: string[];
  conditionalOutputs?: string[];
  forbiddenOutputs: string[];
  auditCheckpoints: {
    before: string[];
    during: string[];
    after: string[];
  };
  antiPatterns: string[];
  handoffCommands: string[];
}

export const WORKFLOW_COMMANDS: readonly WorkflowCommand[] = [
  command("workflow", ["build-workflow"], "Initialize or reconcile OpenWorkflow contracts.", "workflow", [
    ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
    ".openworkflow/audit/",
  ]),
  command("context", ["build-context"], "Map the repo context needed for vision and downstream workflow decisions.", "context", [
    ".openworkflow/context/CONTEXT.md",
    ".openworkflow/context/CONTEXT_MAP.yaml",
  ]),
  command(
    "vision",
    ["build-vision"],
    "Create or refine the product vision contract through focused collaboration.",
    "vision",
    [".openworkflow/vision/VISION.md", ".openworkflow/vision/VISION_CONTRACT.yaml"],
    visionProtocol(),
  ),
  command(
    "validation",
    ["build-validation"],
    "Prioritize the core feature or assumption that must be validated first.",
    "validation",
    [".openworkflow/validation/"],
    validationProtocol(),
  ),
  command(
    "proto",
    ["build-prototype", "ow:prototype"],
    "Build the smallest prototype needed to validate the current core feature.",
    "prototype",
    [".openworkflow/prototypes/"],
    prototypeProtocol(),
  ),
  command(
    "decision",
    ["build-decision"],
    "Record user review outcomes and decide whether the current evidence is accepted.",
    "decision",
    [".openworkflow/decisions/"],
    decisionProtocol(),
  ),
  command(
    "design",
    ["build-design"],
    "Convert accepted prototype evidence into product design for production specification.",
    "design",
    [".openworkflow/design/"],
    designProtocol(),
  ),
  command("spec", ["build-spec"], "Create one focused production spec from accepted product design.", "spec", [
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
  protocol?: CommandProtocol,
): WorkflowCommand {
  return {
    id,
    namespace: COMMAND_NAMESPACE,
    trigger: `/${COMMAND_NAMESPACE}:${id}`,
    legacyTriggers: legacyIds.map((legacyId) => `/${legacyId}`),
    description,
    stage,
    targetArtifacts,
    protocol,
  };
}

function visionProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "one-question-at-a-time",
    requiredContext: [
      ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
      ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
    ],
    optionalContext: [
      ".openworkflow/vision/VISION_CONTRACT.yaml",
      ".openworkflow/context/CONTEXT.md",
      ".openworkflow/context/CONTEXT_MAP.yaml",
      ".openworkflow/context/GLOSSARY.yaml",
      "AGENT.md",
    ],
    forbiddenContext: [".openworkflow/runtime/**", ".openworkflow/changes/**"],
    allowedOutputs: [
      ".openworkflow/vision/VISION.md",
      ".openworkflow/vision/VISION_CONTRACT.yaml",
      ".openworkflow/vision/sessions/<id>/VISION_SESSION.yaml",
      ".openworkflow/vision/sessions/<id>/NOTE.md",
      ".openworkflow/context/CONTEXT.md",
      ".openworkflow/context/CONTEXT_MAP.yaml",
    ],
    forbiddenOutputs: [
      ".openworkflow/validation/**",
      ".openworkflow/prototypes/**",
      ".openworkflow/specs/**",
      ".openworkflow/changes/**",
      ".openworkflow/runtime/**",
    ],
    auditCheckpoints: {
      before: ["Confirm workflow and context indexes exist.", "Load only the vision context packet."],
      during: ["Ask one question at a time.", "Update only stable vision or context terms."],
      after: ["Summarize unresolved questions.", "Confirm no validation, prototype, spec, change, or runtime artifacts were created."],
    },
    antiPatterns: [
      "Do not create validation rankings during vision work.",
      "Do not create specs, changes, tasks, or teams from a vision session.",
      "Do not batch many interview questions into one turn.",
    ],
    handoffCommands: ["/ow:validation"],
  };
}

function validationProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "audit-and-rank",
    requiredContext: [
      ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
      ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
      ".openworkflow/vision/VISION_CONTRACT.yaml",
    ],
    optionalContext: [
      ".openworkflow/validation/VALIDATION_INDEX.yaml",
      ".openworkflow/vision/VISION.md",
      ".openworkflow/context/CONTEXT.md",
      ".openworkflow/context/CONTEXT_MAP.yaml",
    ],
    forbiddenContext: [".openworkflow/runtime/**", ".openworkflow/changes/**"],
    allowedOutputs: [
      ".openworkflow/validation/VALIDATION_INDEX.yaml",
      ".openworkflow/validation/<id>/VALIDATION.yaml",
      ".openworkflow/validation/<id>/NOTE.md",
    ],
    forbiddenOutputs: [
      ".openworkflow/prototypes/**",
      ".openworkflow/specs/**",
      ".openworkflow/changes/**",
      ".openworkflow/runtime/**",
    ],
    auditCheckpoints: {
      before: ["Confirm a vision contract exists.", "Load only vision and validation index context."],
      during: ["Classify features as existential, supporting, later, or out of scope.", "Name the single highest-risk validation question."],
      after: ["Record the validation target and prototype brief.", "Confirm no prototype, spec, change, or runtime artifacts were created."],
    },
    antiPatterns: [
      "Do not turn feature ranking into a production task list.",
      "Do not prototype before naming the validation question.",
      "Do not treat supporting features as blockers for existential validation.",
    ],
    handoffCommands: ["/ow:proto", "/ow:vision"],
  };
}

function prototypeProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "smallest-runnable-evidence",
    requiredContext: [
      ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
      ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
      ".openworkflow/validation/VALIDATION_INDEX.yaml",
    ],
    optionalContext: [
      ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
      ".openworkflow/validation/**/VALIDATION.yaml",
      ".openworkflow/vision/VISION_CONTRACT.yaml",
      "package.json",
    ],
    forbiddenContext: [".openworkflow/runtime/**", ".openworkflow/changes/**", ".openworkflow/specs/**"],
    allowedOutputs: [
      ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
      ".openworkflow/prototypes/<id>/EVIDENCE.yaml",
      ".openworkflow/prototypes/<id>/NOTE.md",
      ".openworkflow/prototypes/<id>/review.html",
      ".openworkflow/prototypes/<id>/evidence/**",
    ],
    forbiddenOutputs: [".openworkflow/specs/**", ".openworkflow/changes/**", ".openworkflow/runtime/**"],
    auditCheckpoints: {
      before: ["Confirm validation target exists.", "Choose logic/state or UI/experience prototype branch."],
      during: ["Build only what answers the validation question.", "Keep one command or URL to run the prototype."],
      after: ["Write evidence and result artifacts.", "Confirm no design, spec, change, team, persistence, or production hardening was created."],
    },
    antiPatterns: [
      "Do not polish the prototype into production code.",
      "Do not add persistence unless persistence is the validation question.",
      "Do not create design, specs, changes, or teams from unaccepted prototype work.",
    ],
    handoffCommands: ["/ow:decision", "/ow:design", "/ow:validation"],
  };
}

function decisionProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "review-and-record",
    requiredContext: [
      ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
      ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
      ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
    ],
    optionalContext: [
      ".openworkflow/decisions/DECISION_INDEX.yaml",
      ".openworkflow/prototypes/**/RESULT.md",
      ".openworkflow/prototypes/**/EVIDENCE.md",
      ".openworkflow/validation/**/VALIDATION.yaml",
    ],
    forbiddenContext: [".openworkflow/runtime/**"],
    allowedOutputs: [
      ".openworkflow/decisions/DECISION_INDEX.yaml",
      ".openworkflow/decisions/<id>/DECISION.yaml",
      ".openworkflow/decisions/<id>/NOTE.md",
      ".openworkflow/decisions/<id>/review.html",
      ".openworkflow/prototypes/<id>/EVIDENCE.yaml",
    ],
    forbiddenOutputs: [".openworkflow/specs/**", ".openworkflow/changes/**", ".openworkflow/runtime/**"],
    auditCheckpoints: {
      before: ["Confirm prototype evidence exists.", "Load only prototype result and decision index context."],
      during: ["Record user review outcome as continue, pivot, stop, or needs_more_evidence.", "Keep only decision-rich evidence."],
      after: ["Write the decision record.", "Authorize /ow:design only when outcome is continue."],
    },
    antiPatterns: [
      "Do not infer acceptance without user review or explicit evidence.",
      "Do not create design, specs, or changes during decision capture.",
      "Do not leave unresolved prototype evidence as accepted.",
    ],
    handoffCommands: ["/ow:design", "/ow:proto", "/ow:vision"],
  };
}

function designProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "evidence-to-product-design",
    requiredContext: [
      ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
      ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
      ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
      ".openworkflow/decisions/DECISION_INDEX.yaml",
    ],
    optionalContext: [
      ".openworkflow/prototypes/**/EVIDENCE.yaml",
      ".openworkflow/decisions/**/DECISION.yaml",
      ".openworkflow/validation/**/VALIDATION.yaml",
      ".openworkflow/vision/VISION_CONTRACT.yaml",
      ".openworkflow/context/CONTEXT_MAP.yaml",
    ],
    forbiddenContext: [".openworkflow/runtime/**", ".openworkflow/changes/**", ".openworkflow/specs/**"],
    allowedOutputs: [
      ".openworkflow/design/DESIGN_INDEX.yaml",
      ".openworkflow/design/<id>/PRODUCT_DESIGN.yaml",
      ".openworkflow/design/<id>/NOTE.md",
    ],
    conditionalOutputs: [
      ".openworkflow/design/<id>/TECH_SPEC.yaml",
      ".openworkflow/design/<id>/FRONTEND_SPEC.yaml",
      ".openworkflow/design/<id>/BACKEND_SPEC.yaml",
      ".openworkflow/design/<id>/API_CONTRACT.yaml",
      ".openworkflow/design/<id>/DB_SCHEMA_MODEL.yaml",
    ],
    forbiddenOutputs: [".openworkflow/specs/**", ".openworkflow/changes/**", ".openworkflow/runtime/**"],
    auditCheckpoints: {
      before: ["Confirm accepted prototype evidence or a continue decision exists.", "Load only the accepted evidence needed for product design."],
      during: ["Translate evidence into product behavior, UX states, scope, and readiness.", "Create conditional packets only when explicitly needed."],
      after: ["Write PRODUCT_DESIGN.yaml.", "Hand off to /ow:spec only when spec readiness is true."],
    },
    antiPatterns: [
      "Do not treat unreviewed prototype evidence as accepted.",
      "Do not create production specs or changes during design.",
      "Do not generate conditional technical packets by default.",
    ],
    handoffCommands: ["/ow:spec", "/ow:proto", "/ow:decision"],
  };
}
