export const COMMAND_NAMESPACE = "ow";

export interface WorkflowCommand {
  id: string;
  namespace: typeof COMMAND_NAMESPACE;
  trigger: string;
  legacyTriggers: string[];
  description: string;
  stage: string;
  visibility: "user" | "internal";
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
  internalSections?: CommandProtocolSection[];
}

export interface CommandProtocolSection {
  tag: string;
  items: string[];
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
    "tune",
    ["ow:tune:proto"],
    "Revise the current prototype and record the decision audit automatically.",
    "prototype",
    [".openworkflow/prototypes/", ".openworkflow/decisions/"],
    tuneProtocol(),
  ),
  command(
    "decision",
    ["build-decision"],
    "Internally record prototype review outcomes for audit.",
    "decision",
    [".openworkflow/decisions/"],
    decisionProtocol(),
    "internal",
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
  visibility: WorkflowCommand["visibility"] = "user",
): WorkflowCommand {
  return {
    id,
    namespace: COMMAND_NAMESPACE,
    trigger: `/${COMMAND_NAMESPACE}:${id}`,
    legacyTriggers: legacyIds.map((legacyId) => `/${legacyId}`),
    description,
    stage,
    visibility,
    targetArtifacts,
    protocol,
  };
}

function visionProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "conversation-first-sustained-grill",
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
      before: [
        "Confirm workflow and context indexes exist.",
        "Start in conversation mode and ask the next useful vision question before writing artifacts.",
      ],
      during: [
        "Ask one focused question at a time and make each question depend on the previous answer.",
        "Cover mandatory vision dimensions before validation handoff.",
        "Provide concrete examples or options when the user is stuck.",
      ],
      after: [
        "Persist artifacts only after stable answers, explicit save request, or readiness checkpoint.",
        "Handoff to validation only after mandatory coverage, unresolved blockers are named, and the user confirms readiness.",
        "Confirm no validation, prototype, spec, change, or runtime artifacts were created.",
      ],
    },
    antiPatterns: [
      "Do not open by writing vision artifacts before the conversation has stable answers.",
      "Do not create validation rankings during vision work.",
      "Do not create specs, changes, tasks, or teams from a vision session.",
      "Do not batch many interview questions into one turn.",
      "Do not hand off to validation after a fixed small number of questions.",
    ],
    internalSections: [
      {
        tag: "conversation_first",
        items: [
          "Treat /ow:vision as a focused product conversation, not an artifact fill-out task.",
          "Ask exactly one question unless the user explicitly requests a summary or save checkpoint.",
          "Let each answer drive the next deeper question; do not run a generic questionnaire mechanically.",
        ],
      },
      {
        tag: "mandatory_coverage",
        items: [
          "Cover target user and beneficiary.",
          "Cover the problem, motivation, and emotional or quality bar.",
          "Cover the core product surface and primary job to be done.",
          "Cover explicit non-goals and exclusions.",
          "Cover AI-native role, boundaries, and failure modes.",
          "Cover privacy, data, sharing, and retention assumptions.",
          "Cover alternatives or competing mental models.",
          "Cover success signals and failure signals.",
        ],
      },
      {
        tag: "readiness_gate",
        items: [
          "Do not hand off to /ow:validation until mandatory coverage is addressed, unresolved questions are explicit, and the user confirms readiness.",
          "If a dimension is thin, ask another targeted question instead of writing a final artifact.",
          "Vision readiness is based on coverage and user confirmation, not on a fixed number of turns.",
        ],
      },
      {
        tag: "artifact_checkpoint",
        items: [
          "Write VISION_SESSION.yaml, VISION_CONTRACT.yaml, VISION.md, or context updates only after stable answers or an explicit checkpoint request.",
          "Keep brainstorming and tentative hypotheses in NOTE.md or unresolved_questions rather than presenting them as stable product truth.",
          "Summarize at meaningful checkpoints before persisting durable vision state.",
        ],
      },
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
    interactionMode: "classified-prototype-creation",
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
      ".openworkflow/decisions/DECISION_INDEX.yaml",
      ".openworkflow/decisions/<id>/DECISION.yaml",
      ".openworkflow/decisions/<id>/NOTE.md",
      ".openworkflow/decisions/<id>/review.html",
    ],
    forbiddenOutputs: [".openworkflow/specs/**", ".openworkflow/changes/**", ".openworkflow/runtime/**"],
    auditCheckpoints: {
      before: [
        "Confirm validation target exists.",
        "Classify prototype mode before implementation: visual, interaction, technical feasibility, 3D/material, workflow, or data/logic.",
        "Detect reference inputs: image, URL, screenshot, HTML/CSS source, existing artifact, or design-system hint.",
      ],
      during: [
        "For visual-first prototypes, extract reference patterns and create a high-fidelity static concept with image generation before HTML unless the user explicitly skips it.",
        "Derive a compact visual direction and token packet before implementation.",
        "Build only what answers the validation question and keep one command or URL to run the prototype.",
        "Verify rendered prototypes with browser and screenshot checks before handoff.",
      ],
      after: [
        "Record reference analysis, static concept evidence, runnable implementation evidence, verification, self-critique, and known limits separately.",
        "Write a decision audit record internally after prototype evidence changes.",
        "Write evidence and result artifacts.",
        "Confirm no design, spec, change, team, persistence, or production hardening was created.",
      ],
    },
    antiPatterns: [
      "Do not jump directly to HTML for a visual-first prototype before a visual direction or static concept unless the user explicitly skips it.",
      "Do not ignore user-provided reference images, URLs, screenshots, or HTML/CSS source.",
      "Do not force image generation for logic-only, data-flow, API, or technical feasibility prototypes.",
      "Do not polish the prototype into production code.",
      "Do not add persistence unless persistence is the validation question.",
      "Do not create design, specs, changes, or teams from unaccepted prototype work.",
      "Do not ask the user to manually invoke /ow:decision after prototype work; record the decision audit internally.",
    ],
    internalSections: [
      {
        tag: "prototype_classification",
        items: [
          "Classify the prototype as visual, interaction, technical feasibility, 3D/material, workflow, or data/logic before choosing tools or writing files.",
          "Name the validation question, the riskiest assumption, and the smallest success signal.",
          "If classification is ambiguous, ask one clarifying question; otherwise proceed with the most likely mode and record the assumption.",
        ],
      },
      {
        tag: "reference_extraction",
        items: [
          "When the user provides a target image, URL, screenshot, HTML/CSS, or reference artifact, perform reference-pattern extraction before visual generation or HTML implementation.",
          "Extract transferable patterns: information architecture, layout rhythm, component grammar, typography posture, palette, motion, interaction details, and anti-patterns to avoid.",
          "Record reference analysis as evidence by path or URL; do not paste bulky source or screenshots into YAML.",
        ],
      },
      {
        tag: "visual_first_path",
        items: [
          "For visual, product-experience, 3D/material, and aesthetic-sensitive interaction prototypes, default to a high-fidelity static concept before runnable HTML.",
          "Use image generation as the default first visual pass for composition, mood, material, visual hierarchy, and brand direction unless the user asks to skip image generation.",
          "Record visual_concept_policy.image_generation as generated, skipped_by_user, or not_applicable; skipped_by_user requires a concrete skip reason.",
          "Discuss or confirm the static concept before spending implementation effort when the user is actively collaborating; if the user asked for autonomous execution, proceed after the concept establishes clear direction.",
          "Do not require image generation for data/logic, API, or pure technical feasibility prototypes.",
        ],
      },
      {
        tag: "design_seed_protocol",
        items: [
          "Do not design from a blank aesthetic when a direction, design system, template seed, or reference exists.",
          "Derive a compact visual packet before implementation: background, surface, foreground, muted, border, accent, display font, body font, radius, spacing, motion, and density.",
          "Choose domain-appropriate posture: operational tools should be dense and restrained, editorial surfaces can be expressive, games can be playful, and dashboards should avoid marketing hero treatment.",
        ],
      },
      {
        tag: "implementation_protocol",
        items: [
          "Implement the smallest runnable artifact that validates the current question, not a production app.",
          "For HTML prototypes, keep final review surfaces free of designer-only controls unless those controls are part of the validation target.",
          "Keep generated assets, screenshots, logs, and review HTML in the prototype evidence folder.",
        ],
      },
      {
        tag: "verification_protocol",
        items: [
          "For rendered HTML or 3D prototypes, run browser verification and capture screenshots or notes for desktop and mobile when practical.",
          "Verify that the page is nonblank, core interactions work, primary assets render, text does not overlap, and responsive layout remains coherent.",
          "Record known limits separately from observations so downstream decision work can judge evidence quality.",
        ],
      },
      {
        tag: "self_critique",
        items: [
          "Before handoff, critique the prototype across philosophy, hierarchy, execution, specificity, restraint, accessibility, and responsive behavior.",
          "Any weak dimension must trigger one repair pass before evidence handoff unless the weakness is intentionally out of scope for the validation question.",
          "Record critique findings and repairs as compact evidence references or YAML summary fields.",
        ],
      },
      {
        tag: "internal_decision_audit",
        items: [
          "After creating or revising prototype evidence, write or update a decision audit record without asking the user to invoke /ow:decision.",
          "Use revise when the user asks for another tuning pass, continue when the user explicitly accepts evidence for design, pivot or stop when explicitly directed, and needs_more_evidence when evidence is inconclusive.",
          "Keep decision audit output in .openworkflow/decisions/** and do not expose internal bookkeeping as the user-facing workflow step.",
        ],
      },
    ],
    handoffCommands: ["/ow:tune", "/ow:design", "/ow:validation"],
  };
}

function tuneProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "prototype-revision-orchestration",
    requiredContext: [
      ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
      ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
    ],
    optionalContext: [
      ".openworkflow/validation/VALIDATION_INDEX.yaml",
      ".openworkflow/validation/**/VALIDATION.yaml",
      ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
      ".openworkflow/prototypes/**/EVIDENCE.yaml",
      ".openworkflow/prototypes/**/NOTE.md",
      ".openworkflow/decisions/DECISION_INDEX.yaml",
      ".openworkflow/decisions/**/DECISION.yaml",
      "package.json",
    ],
    forbiddenContext: [".openworkflow/runtime/**", ".openworkflow/changes/**", ".openworkflow/specs/**"],
    allowedOutputs: [
      ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
      ".openworkflow/prototypes/<id>/EVIDENCE.yaml",
      ".openworkflow/prototypes/<id>/NOTE.md",
      ".openworkflow/prototypes/<id>/review.html",
      ".openworkflow/prototypes/<id>/evidence/**",
      ".openworkflow/decisions/DECISION_INDEX.yaml",
      ".openworkflow/decisions/<id>/DECISION.yaml",
      ".openworkflow/decisions/<id>/NOTE.md",
      ".openworkflow/decisions/<id>/review.html",
    ],
    forbiddenOutputs: [".openworkflow/specs/**", ".openworkflow/changes/**", ".openworkflow/runtime/**"],
    auditCheckpoints: {
      before: [
        "Resolve tune target: /ow:tune and /ow:tune:proto default to the current prototype.",
        "If no current prototype exists but a current validation target exists, orchestrate prototype creation through /ow:proto behavior.",
        "Load only the current prototype evidence, relevant validation target, and latest decision audit context.",
      ],
      during: [
        "Apply exactly one focused revision loop from user feedback.",
        "Preserve M16 prototype evidence separation for concept, implementation, verification, self-critique, and known limits.",
        "Run required verification for changed rendered artifacts.",
        "Record decision audit outcome as revise, continue, pivot, stop, or needs_more_evidence.",
      ],
      after: [
        "Write updated prototype evidence and review artifacts.",
        "Write or update the internal decision audit record.",
        "Show the user only the tuning result, unresolved question if any, and the next user-facing command.",
      ],
    },
    antiPatterns: [
      "Do not ask the user to manually invoke /ow:decision during a tune loop.",
      "Do not restart full prototype discovery when a focused revision is enough.",
      "Do not create design, specs, changes, or runtime work from unaccepted tune evidence.",
      "Do not tune outside the current validation scope unless the user explicitly changes the target or validation.",
    ],
    internalSections: [
      {
        tag: "target_resolution",
        items: [
          "/ow:tune resolves to the current prototype by default.",
          "/ow:tune:proto is an explicit alias for tuning the current prototype.",
          "/ow:tune:<target> reserves routing for explicit future artifact targets; in M17, implement prototype target behavior and record unsupported targets as unresolved.",
        ],
      },
      {
        tag: "proto_orchestration",
        items: [
          "When no current prototype exists but a current validation target exists, use /ow:proto behavior to create the first prototype evidence before tuning.",
          "When a current prototype exists, revise it in place unless the user explicitly requests a new prototype branch.",
          "Keep the revision scoped to the user's feedback and the active validation question.",
        ],
      },
      {
        tag: "revision_protocol",
        items: [
          "Treat user feedback as the tune brief; ask one clarifying question only when the requested revision is ambiguous or unsafe.",
          "Update the smallest artifact set needed: prototype evidence, note, review surface, and evidence files.",
          "Preserve visual concept policy, evidence refs, verification, and self-critique integrity from the prototype evidence contract.",
        ],
      },
      {
        tag: "internal_decision_audit",
        items: [
          "Every tune pass must write or update a decision audit record internally.",
          "Use outcome revise when the user asks for another iteration, continue when the user explicitly accepts the prototype for design, pivot or stop when explicitly directed, and needs_more_evidence when evidence is inconclusive.",
          "Do not expose /ow:decision as the next manual user step; expose /ow:tune, /ow:design, or /ow:validation as appropriate.",
        ],
      },
    ],
    handoffCommands: ["/ow:tune", "/ow:design", "/ow:validation"],
  };
}

function decisionProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "internal-audit-recording",
    requiredContext: [
      ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
      ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
      ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
    ],
    optionalContext: [
      ".openworkflow/decisions/DECISION_INDEX.yaml",
      ".openworkflow/prototypes/**/EVIDENCE.yaml",
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
      before: ["Confirm prototype evidence exists.", "Load only prototype evidence, user feedback summary, and decision index context."],
      during: ["Record audit outcome as continue, revise, pivot, stop, or needs_more_evidence.", "Keep only decision-rich evidence."],
      after: ["Write the decision record.", "Authorize /ow:design only when outcome is continue.", "Return control to the user-facing proto or tune command."],
    },
    antiPatterns: [
      "Do not infer acceptance without user review or explicit evidence.",
      "Do not create design, specs, or changes during decision capture.",
      "Do not leave unresolved prototype evidence as accepted.",
      "Do not present /ow:decision as a normal user handoff; this is an internal audit command.",
    ],
    internalSections: [
      {
        tag: "internal_audit_only",
        items: [
          "/ow:decision is preserved for durable audit records, not as a normal user-facing workflow step.",
          "Proto and tune flows invoke this audit behavior internally after evidence changes or user review outcomes.",
          "Visible user handoffs should name /ow:tune, /ow:design, /ow:validation, or /ow:vision instead of asking for manual /ow:decision.",
        ],
      },
    ],
    handoffCommands: ["/ow:design", "/ow:tune", "/ow:validation", "/ow:vision"],
  };
}

function designProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "conversation-first-product-design",
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
      before: [
        "Confirm accepted prototype evidence or a continue decision exists.",
        "Start by clarifying product behavior and UX gaps before writing PRODUCT_DESIGN.yaml.",
      ],
      during: [
        "Ask one focused design question at a time when behavior, states, edge cases, or scope are thin.",
        "Cover mandatory design dimensions before spec handoff.",
        "Create conditional packets only when explicitly needed.",
      ],
      after: [
        "Write PRODUCT_DESIGN.yaml only after enough design meaning is stable.",
        "Hand off to /ow:spec only when spec readiness is true and blockers are explicit.",
      ],
    },
    antiPatterns: [
      "Do not treat unreviewed prototype evidence as accepted.",
      "Do not convert thin prototype evidence into design artifacts prematurely.",
      "Do not create production specs or changes during design.",
      "Do not generate conditional technical packets by default.",
    ],
    internalSections: [
      {
        tag: "conversation_first",
        items: [
          "Treat /ow:design as product-design clarification before specification.",
          "Ask one focused question when accepted evidence does not yet support durable product design.",
          "Do not begin by authoring PRODUCT_DESIGN.yaml when journey, states, flows, or scope are still unclear.",
        ],
      },
      {
        tag: "mandatory_coverage",
        items: [
          "Cover personas and usage context.",
          "Cover journey map and key flows.",
          "Cover UX states, state transitions, and feedback timing.",
          "Cover interaction details and recovery behavior.",
          "Cover edge cases and failure states.",
          "Cover responsive behavior and accessibility expectations.",
          "Cover scope boundaries, priority, and what remains out of scope.",
          "Cover spec readiness and blockers.",
        ],
      },
      {
        tag: "readiness_gate",
        items: [
          "Do not hand off to /ow:spec until design coverage is sufficient, blockers are explicit, and spec_readiness.ready is true.",
          "If accepted prototype evidence is thin, ask targeted design questions or hand back to /ow:tune.",
          "Design readiness depends on behavior clarity, not on having a long document.",
        ],
      },
      {
        tag: "artifact_checkpoint",
        items: [
          "Persist PRODUCT_DESIGN.yaml after stable design answers or explicit checkpoint request.",
          "Use conditional packets only when implementation constraints genuinely need a separate packet.",
          "Keep unresolved design questions visible instead of silently inventing product behavior.",
        ],
      },
    ],
    handoffCommands: ["/ow:spec", "/ow:tune", "/ow:validation"],
  };
}
