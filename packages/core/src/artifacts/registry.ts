export type DiscoveryArtifactType =
  | "vision_session"
  | "validation_target"
  | "prototype_evidence"
  | "decision_record"
  | "product_design";

export interface DiscoveryArtifactContract {
  artifactType: DiscoveryArtifactType;
  contractType: "vision" | "validation" | "prototype" | "decision" | "design";
  command: string;
  title: string;
  sourceOfTruthPath: string;
  templatePath: string;
  indexPath: string;
  indexCollectionKey: string;
  notePath: string;
  reviewPath: string | null;
  disclosureLevel: 2;
  requiredKeys: string[];
  readPolicy: ArtifactReadPolicy;
  activePointer: ActivePointer;
  evidencePolicy: string;
  handoffKey: string;
  template: Record<string, unknown>;
  conditionalPackets?: readonly ConditionalPacketMetadata[];
}

export interface ConditionalPacketMetadata {
  artifactType: string;
  path: string;
  requiredByDefault: boolean;
  when: string;
}

export interface ArtifactReadPolicy {
  loadByDefault: boolean;
  agentReadOrder: number;
  maxYamlLines: number;
  maxNoteLines: number;
  rawEvidence: "never_by_default" | "only_when_referenced" | "human_review_only";
}

export interface ActivePointer {
  indexPath: string;
  pointerKey: string;
  collectionKey: string;
  idKey: string;
  pathKey: string;
}

export interface DisclosureLevel {
  level: 0 | 1 | 2 | 3 | 4;
  name: string;
  defaultForAgents: boolean;
  purpose: string;
  examples: string[];
}

export const DISCLOSURE_LEVELS: readonly DisclosureLevel[] = [
  {
    level: 0,
    name: "workflow indexes",
    defaultForAgents: true,
    purpose: "Find the active workflow state without recursively reading stage folders.",
    examples: [
      ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
      ".openworkflow/audit/COMMAND_AUDIT_INDEX.yaml",
    ],
  },
  {
    level: 1,
    name: "command and artifact packets",
    defaultForAgents: true,
    purpose: "Know required, optional, and forbidden context before doing command work.",
    examples: [
      ".openworkflow/audit/CONTEXT_PACKETS.yaml",
      ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
    ],
  },
  {
    level: 2,
    name: "current YAML artifact",
    defaultForAgents: true,
    purpose: "Load the one source-of-truth artifact named by the current index.",
    examples: [
      ".openworkflow/validation/<id>/VALIDATION.yaml",
      ".openworkflow/prototypes/<id>/EVIDENCE.yaml",
    ],
  },
  {
    level: 3,
    name: "short human note",
    defaultForAgents: false,
    purpose: "Explain intent or user feedback when the YAML state is not enough.",
    examples: [
      ".openworkflow/validation/<id>/NOTE.md",
      ".openworkflow/decisions/<id>/NOTE.md",
    ],
  },
  {
    level: 4,
    name: "review UI and raw evidence",
    defaultForAgents: false,
    purpose: "Inspect screenshots, logs, prototype URLs, generated HTML, or recordings when evidence must be reviewed directly.",
    examples: [
      ".openworkflow/prototypes/<id>/review.html",
      ".openworkflow/prototypes/<id>/evidence/",
    ],
  },
] as const;

export const DISCOVERY_ARTIFACT_CONTRACTS: readonly DiscoveryArtifactContract[] = [
  {
    artifactType: "vision_session",
    contractType: "vision",
    command: "/ow:vision",
    title: "Vision session",
    sourceOfTruthPath: ".openworkflow/vision/sessions/<id>/VISION_SESSION.yaml",
    templatePath: ".openworkflow/vision/_templates/VISION_SESSION.yaml",
    indexPath: ".openworkflow/vision/VISION_CONTRACT.yaml",
    indexCollectionKey: "sessions",
    notePath: ".openworkflow/vision/sessions/<id>/NOTE.md",
    reviewPath: null,
    disclosureLevel: 2,
    requiredKeys: [
      "artifact_type",
      "current_question",
      "stable_answers",
      "unresolved_questions",
      "vision_delta",
      "handoff",
    ],
    readPolicy: {
      loadByDefault: true,
      agentReadOrder: 20,
      maxYamlLines: 90,
      maxNoteLines: 40,
      rawEvidence: "never_by_default",
    },
    activePointer: {
      indexPath: ".openworkflow/vision/VISION_CONTRACT.yaml",
      pointerKey: "current_session",
      collectionKey: "sessions",
      idKey: "session_id",
      pathKey: "path",
    },
    evidencePolicy: "Reference human notes when intent needs explanation; do not embed long brainstorming transcript.",
    handoffKey: "handoff.next_command",
    template: {
      schema_version: "0.1.0",
      contract_id: "vision:<id>",
      contract_type: "vision",
      artifact_type: "vision_session",
      title: "<short vision session title>",
      status: "draft",
      current_question: "",
      stable_answers: [],
      unresolved_questions: [],
      vision_delta: {
        one_sentence: "",
        goals: [],
        non_goals: [],
        users: [],
        quality_bar: [],
      },
      handoff: {
        ready: false,
        next_command: null,
      },
      updated_at: null,
    },
  },
  {
    artifactType: "validation_target",
    contractType: "validation",
    command: "/ow:validation",
    title: "Validation target",
    sourceOfTruthPath: ".openworkflow/validation/<id>/VALIDATION.yaml",
    templatePath: ".openworkflow/validation/_templates/VALIDATION.yaml",
    indexPath: ".openworkflow/validation/VALIDATION_INDEX.yaml",
    indexCollectionKey: "validations",
    notePath: ".openworkflow/validation/<id>/NOTE.md",
    reviewPath: null,
    disclosureLevel: 2,
    requiredKeys: [
      "artifact_type",
      "core_question",
      "feature_classification",
      "critical_assumptions",
      "prototype_scope",
      "acceptance",
      "decision_options",
    ],
    readPolicy: {
      loadByDefault: true,
      agentReadOrder: 30,
      maxYamlLines: 120,
      maxNoteLines: 40,
      rawEvidence: "never_by_default",
    },
    activePointer: {
      indexPath: ".openworkflow/validation/VALIDATION_INDEX.yaml",
      pointerKey: "current_validation",
      collectionKey: "validations",
      idKey: "validation_id",
      pathKey: "path",
    },
    evidencePolicy: "Rank features and assumptions in YAML; keep rationale compact and defer examples to NOTE.md.",
    handoffKey: "prototype_scope",
    template: {
      schema_version: "0.1.0",
      contract_id: "validation:<id>",
      contract_type: "validation",
      artifact_type: "validation_target",
      title: "<short validation target title>",
      status: "draft",
      core_question: "",
      feature_classification: {
        existential: [],
        supporting: [],
        later: [],
        out_of_scope: [],
      },
      critical_assumptions: [],
      prototype_scope: {
        include: [],
        exclude: [],
      },
      acceptance: [],
      decision_options: ["continue", "pivot", "stop", "needs_more_evidence"],
      updated_at: null,
    },
  },
  {
    artifactType: "prototype_evidence",
    contractType: "prototype",
    command: "/ow:proto",
    title: "Prototype evidence",
    sourceOfTruthPath: ".openworkflow/prototypes/<id>/EVIDENCE.yaml",
    templatePath: ".openworkflow/prototypes/_templates/EVIDENCE.yaml",
    indexPath: ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
    indexCollectionKey: "prototypes",
    notePath: ".openworkflow/prototypes/<id>/NOTE.md",
    reviewPath: ".openworkflow/prototypes/<id>/review.html",
    disclosureLevel: 2,
    requiredKeys: [
      "artifact_type",
      "validation_target",
      "core_question",
      "prototype_mode",
      "reference_analysis",
      "visual_direction",
      "concept_evidence",
      "prototype_artifact",
      "run",
      "implementation_evidence",
      "observations",
      "evidence",
      "verification",
      "self_critique",
      "known_limits",
      "result",
      "handoff",
    ],
    readPolicy: {
      loadByDefault: true,
      agentReadOrder: 40,
      maxYamlLines: 190,
      maxNoteLines: 50,
      rawEvidence: "only_when_referenced",
    },
    activePointer: {
      indexPath: ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
      pointerKey: "current_prototype",
      collectionKey: "prototypes",
      idKey: "prototype_id",
      pathKey: "path",
    },
    evidencePolicy:
      "Reference visual concepts, reference analyses, runnable artifacts, screenshots, logs, critique, and URLs by path; keep concept evidence distinct from implementation evidence and do not paste bulky evidence into YAML.",
    handoffKey: "handoff.next_command",
    template: {
      schema_version: "0.1.0",
      contract_id: "prototype:<id>",
      contract_type: "prototype",
      artifact_type: "prototype_evidence",
      title: "<short prototype evidence title>",
      status: "draft",
      validation_target: "validation:<id>",
      core_question: "",
      prototype_mode: "visual|interaction|technical_feasibility|3d_material|workflow|data_logic",
      reference_analysis: [],
      visual_direction: {
        source: null,
        summary: "",
        tokens: {
          background: "",
          surface: "",
          foreground: "",
          muted: "",
          border: "",
          accent: "",
          display_font: "",
          body_font: "",
          radius: "",
          spacing: "",
          motion: "",
          density: "",
        },
      },
      concept_evidence: [],
      prototype_artifact: {
        path: "",
        type: "",
      },
      run: {
        command: "",
        url: null,
      },
      implementation_evidence: [],
      observations: [],
      evidence: [],
      verification: {
        browser_checks: [],
        screenshots: [],
        logs: [],
      },
      self_critique: {
        philosophy: "",
        hierarchy: "",
        execution: "",
        specificity: "",
        restraint: "",
        accessibility: "",
        responsive_behavior: "",
        repairs: [],
      },
      known_limits: [],
      result: "not_reviewed",
      handoff: {
        next_command: "/ow:decision",
      },
      updated_at: null,
    },
  },
  {
    artifactType: "decision_record",
    contractType: "decision",
    command: "/ow:decision",
    title: "Decision record",
    sourceOfTruthPath: ".openworkflow/decisions/<id>/DECISION.yaml",
    templatePath: ".openworkflow/decisions/_templates/DECISION.yaml",
    indexPath: ".openworkflow/decisions/DECISION_INDEX.yaml",
    indexCollectionKey: "decisions",
    notePath: ".openworkflow/decisions/<id>/NOTE.md",
    reviewPath: ".openworkflow/decisions/<id>/review.html",
    disclosureLevel: 2,
    requiredKeys: [
      "artifact_type",
      "reviewed_evidence",
      "outcome",
      "rationale",
      "accepted_scope",
      "rejected_scope",
      "next_command",
      "follow_up_questions",
    ],
    readPolicy: {
      loadByDefault: true,
      agentReadOrder: 50,
      maxYamlLines: 120,
      maxNoteLines: 50,
      rawEvidence: "human_review_only",
    },
    activePointer: {
      indexPath: ".openworkflow/decisions/DECISION_INDEX.yaml",
      pointerKey: "current_decision",
      collectionKey: "decisions",
      idKey: "decision_id",
      pathKey: "path",
    },
    evidencePolicy: "Reference reviewed evidence and user feedback; summarize rationale without copying full review transcripts.",
    handoffKey: "next_command",
    template: {
      schema_version: "0.1.0",
      contract_id: "decision:<id>",
      contract_type: "decision",
      artifact_type: "decision_record",
      title: "<short decision title>",
      status: "draft",
      reviewed_evidence: [],
      outcome: "needs_more_evidence",
      rationale: "",
      accepted_scope: [],
      rejected_scope: [],
      next_command: null,
      follow_up_questions: [],
      updated_at: null,
    },
  },
  {
    artifactType: "product_design",
    contractType: "design",
    command: "/ow:design",
    title: "Product design",
    sourceOfTruthPath: ".openworkflow/design/<id>/PRODUCT_DESIGN.yaml",
    templatePath: ".openworkflow/design/_templates/PRODUCT_DESIGN.yaml",
    indexPath: ".openworkflow/design/DESIGN_INDEX.yaml",
    indexCollectionKey: "designs",
    notePath: ".openworkflow/design/<id>/NOTE.md",
    reviewPath: null,
    disclosureLevel: 2,
    requiredKeys: [
      "artifact_type",
      "accepted_prototype_evidence",
      "personas",
      "journey_map",
      "user_stories",
      "feature_matrix",
      "kano_classification",
      "behavior_model",
      "ux_states",
      "scope",
      "open_questions",
      "conditional_packets",
      "spec_readiness",
    ],
    readPolicy: {
      loadByDefault: true,
      agentReadOrder: 60,
      maxYamlLines: 220,
      maxNoteLines: 60,
      rawEvidence: "only_when_referenced",
    },
    activePointer: {
      indexPath: ".openworkflow/design/DESIGN_INDEX.yaml",
      pointerKey: "current_design",
      collectionKey: "designs",
      idKey: "design_id",
      pathKey: "path",
    },
    evidencePolicy: "Reference accepted prototype evidence and decision records by path; keep product design decisions in PRODUCT_DESIGN.yaml.",
    handoffKey: "spec_readiness.next_command",
    conditionalPackets: [
      {
        artifactType: "tech_spec",
        path: ".openworkflow/design/<id>/TECH_SPEC.yaml",
        requiredByDefault: false,
        when: "Use when implementation constraints, architecture, integrations, or non-functional requirements must be clarified before /ow:spec.",
      },
      {
        artifactType: "frontend_spec",
        path: ".openworkflow/design/<id>/FRONTEND_SPEC.yaml",
        requiredByDefault: false,
        when: "Use when UI structure, component behavior, visual states, or accessibility details need a dedicated packet.",
      },
      {
        artifactType: "backend_spec",
        path: ".openworkflow/design/<id>/BACKEND_SPEC.yaml",
        requiredByDefault: false,
        when: "Use when server behavior, jobs, services, permissions, or operational boundaries need a dedicated packet.",
      },
      {
        artifactType: "api_contract",
        path: ".openworkflow/design/<id>/API_CONTRACT.yaml",
        requiredByDefault: false,
        when: "Use when external or internal API request, response, error, or compatibility contracts are needed.",
      },
      {
        artifactType: "db_schema_model",
        path: ".openworkflow/design/<id>/DB_SCHEMA_MODEL.yaml",
        requiredByDefault: false,
        when: "Use when persistent entities, relationships, migrations, or retention rules need explicit modeling.",
      },
    ],
    template: {
      schema_version: "0.1.0",
      contract_id: "design:<id>",
      contract_type: "design",
      artifact_type: "product_design",
      title: "<short product design title>",
      status: "draft",
      accepted_prototype_evidence: [],
      personas: [],
      journey_map: [],
      user_stories: [],
      feature_matrix: [],
      kano_classification: {
        must_have: [],
        performance: [],
        delighters: [],
        indifferent: [],
        reverse: [],
      },
      behavior_model: {
        entities: [],
        states: [],
        transitions: [],
        rules: [],
      },
      ux_states: {
        empty: [],
        loading: [],
        success: [],
        error: [],
        edge_cases: [],
      },
      scope: {
        in: [],
        out: [],
        deferred: [],
      },
      open_questions: [],
      conditional_packets: [],
      spec_readiness: {
        ready: false,
        blockers: [],
        next_command: null,
      },
      updated_at: null,
    },
  },
] as const;

export function getDiscoveryArtifactContracts(): readonly DiscoveryArtifactContract[] {
  return DISCOVERY_ARTIFACT_CONTRACTS;
}

export function getDisclosureLevels(): readonly DisclosureLevel[] {
  return DISCLOSURE_LEVELS;
}

export function getDiscoveryArtifactContractsForCommand(command: string): DiscoveryArtifactContract[] {
  return DISCOVERY_ARTIFACT_CONTRACTS.filter((contract) => contract.command === command);
}
