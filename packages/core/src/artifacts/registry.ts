export type DiscoveryArtifactType =
  | "vision_session"
  | "validation_target"
  | "prototype_evidence"
  | "decision_record";

export interface DiscoveryArtifactContract {
  artifactType: DiscoveryArtifactType;
  contractType: "vision" | "validation" | "prototype" | "decision";
  command: string;
  title: string;
  sourceOfTruthPath: string;
  indexPath: string;
  notePath: string;
  reviewPath: string | null;
  disclosureLevel: 2;
  requiredKeys: string[];
  evidencePolicy: string;
  handoffKey: string;
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
    indexPath: ".openworkflow/vision/VISION_CONTRACT.yaml",
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
    evidencePolicy: "Reference human notes when intent needs explanation; do not embed long brainstorming transcript.",
    handoffKey: "handoff.next_command",
  },
  {
    artifactType: "validation_target",
    contractType: "validation",
    command: "/ow:validation",
    title: "Validation target",
    sourceOfTruthPath: ".openworkflow/validation/<id>/VALIDATION.yaml",
    indexPath: ".openworkflow/validation/VALIDATION_INDEX.yaml",
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
    evidencePolicy: "Rank features and assumptions in YAML; keep rationale compact and defer examples to NOTE.md.",
    handoffKey: "prototype_scope",
  },
  {
    artifactType: "prototype_evidence",
    contractType: "prototype",
    command: "/ow:prototype",
    title: "Prototype evidence",
    sourceOfTruthPath: ".openworkflow/prototypes/<id>/EVIDENCE.yaml",
    indexPath: ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
    notePath: ".openworkflow/prototypes/<id>/NOTE.md",
    reviewPath: ".openworkflow/prototypes/<id>/review.html",
    disclosureLevel: 2,
    requiredKeys: [
      "artifact_type",
      "validation_target",
      "core_question",
      "prototype_artifact",
      "run",
      "observations",
      "evidence",
      "result",
      "handoff",
    ],
    evidencePolicy: "Reference runnable artifacts, screenshots, logs, and URLs by path; do not paste bulky evidence into YAML.",
    handoffKey: "handoff.next_command",
  },
  {
    artifactType: "decision_record",
    contractType: "decision",
    command: "/ow:decision",
    title: "Decision record",
    sourceOfTruthPath: ".openworkflow/decisions/<id>/DECISION.yaml",
    indexPath: ".openworkflow/decisions/DECISION_INDEX.yaml",
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
    evidencePolicy: "Reference reviewed evidence and user feedback; summarize rationale without copying full review transcripts.",
    handoffKey: "next_command",
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
