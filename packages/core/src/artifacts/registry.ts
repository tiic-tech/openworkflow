export type DiscoveryArtifactType =
  | "vision_session"
  | "validation_target"
  | "prototype_evidence"
  | "decision_record"
  | "product_design"
  | "production_spec"
  | "production_change"
  | "team_runtime";

export interface DiscoveryArtifactContract {
  artifactType: DiscoveryArtifactType;
  contractType: "vision" | "validation" | "prototype" | "decision" | "design" | "spec" | "change" | "runtime";
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
  summaryPolicy?: SummaryPolicy;
  template: Record<string, unknown>;
  conditionalPackets?: readonly ConditionalPacketMetadata[];
}

export interface SummaryPolicy {
  strategy: "summary_file" | "current_slice";
  path: string;
  loadBeforeFull: boolean;
  refreshWhen: string;
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
    summaryPolicy: {
      strategy: "current_slice",
      path: "vision_delta",
      loadBeforeFull: true,
      refreshWhen: "Update the current slice when stable_answers or unresolved_questions change.",
    },
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
        problem: "",
        goals: [],
        non_goals: [],
        users: [],
        quality_bar: [],
        ai_native_role: "",
        success_signals: [],
        failure_signals: [],
      },
      strategic_core: {
        target_user: "",
        context: "",
        current_alternative: "",
        pain: "",
        desired_behavior_change: "",
        core_mechanism: "",
        core_differentiator: "",
        strongest_success_signal: "",
        failure_signals: [],
      },
      product_system_seed: {
        product_thesis: "",
        primary_loop: [],
        interaction_model: "",
        feature_system: [],
        emotional_value: "",
        functional_value: "",
        trust_boundary: "",
        privacy_boundary: "",
        anti_goals: [],
        future_opportunities: [],
      },
      proto_readiness: {
        status: "missing",
        missing_for_proto: [],
        prototype_direction_seeds: [],
        prompt_constraints: [],
        validation_target: "",
        downstream_notes: [],
      },
      coverage: {
        target_user: {
          status: "missing",
          evidence: [],
          follow_up_question: "",
        },
        differentiator: {
          status: "missing",
          evidence: [],
          follow_up_question: "",
        },
        success_signal: {
          status: "missing",
          evidence: [],
          follow_up_question: "",
        },
        trust_boundary: {
          status: "missing",
          evidence: [],
          follow_up_question: "",
        },
        proto_readiness: {
          status: "missing",
          evidence: [],
          follow_up_question: "",
        },
      },
      handoff: {
        ready: false,
        next_command: null,
        blockers: [],
        readiness_notes: [],
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
      "trigger",
      "core_question",
      "central_uncertainty",
      "hypothesis",
      "target_behavior",
      "feature_classification",
      "critical_assumptions",
      "prototype_scope",
      "prototype_experiment",
      "observable_signals",
      "acceptance",
      "decision_rules",
      "decision_options",
      "vision_gaps",
      "agent_readiness_gate",
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
    evidencePolicy: "Compile one prototype validation target in YAML; keep rationale compact and defer examples to NOTE.md.",
    handoffKey: "prototype_scope",
    summaryPolicy: {
      strategy: "current_slice",
      path: "core_question + central_uncertainty + target_behavior + prototype_experiment + observable_signals + decision_rules + agent_readiness_gate",
      loadBeforeFull: true,
      refreshWhen: "Update the current slice when the experiment target, evidence signals, decision rules, or readiness gate changes.",
    },
    template: {
      schema_version: "0.1.0",
      contract_id: "validation:<id>",
      contract_type: "validation",
      artifact_type: "validation_target",
      title: "<short validation target title>",
      status: "draft",
      trigger: {
        mode: "user_explicit",
        requested_command: "/ow:validation",
        reason: "user_invoked_validation",
      },
      core_question: "",
      central_uncertainty: "",
      hypothesis: "",
      target_behavior: "",
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
      prototype_experiment: {
        scenario: "",
        must_show: [],
        must_not_show: [],
      },
      observable_signals: {
        pass: [],
        fail: [],
        ambiguous: [],
      },
      acceptance: [],
      decision_rules: {
        continue: [],
        revise: [],
        pivot: [],
        stop: [],
        needs_more_evidence: [],
      },
      decision_options: ["continue", "revise", "pivot", "stop", "needs_more_evidence"],
      vision_gaps: [],
      agent_readiness_gate: {
        status: "thin_validation",
        blockers: [],
        warnings: [],
        write_authority: "/ow:validation",
      },
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
    reviewPath: null,
    disclosureLevel: 2,
    requiredKeys: [
      "artifact_type",
      "validation_target",
      "core_question",
      "prototype_mode",
      "prompt_pack_type",
      "validation_input",
      "source",
      "internal_pipeline",
      "preflight_quality_gate",
      "direction_count_policy",
      "normalized_input",
      "strategic_core",
      "directions",
      "build_recommendation",
      "prompt_text_manifest",
      "image_generation",
      "negative_constraints",
      "review_plan",
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
      "Reference strategic prompt packs, refined prompt packs, generated images, review notes, and decision evidence by path; keep image binaries out of YAML and do not turn prompt packs into production tasks.",
    handoffKey: "handoff.next_command",
    summaryPolicy: {
      strategy: "summary_file",
      path: ".openworkflow/prototypes/<id>/SUMMARY.yaml",
      loadBeforeFull: true,
      refreshWhen: "Refresh after prompt pack, review evidence, result, or handoff changes.",
    },
    template: {
      schema_version: "0.1.0",
      contract_id: "prototype:<id>",
      contract_type: "prototype",
      artifact_type: "prototype_evidence",
      title: "<short prototype evidence title>",
      status: "draft",
      validation_target: null,
      core_question: "",
      prototype_mode: "image_prompt_pack",
      prompt_pack_type: "strategic_proto_prompt_pack",
      validation_input: {
        mode: "validation_present|agent_auto_generated",
        refs: [],
        notes: [],
      },
      source: {
        refs: [],
        target_tool: "image_generation",
        output_language: "",
      },
      internal_pipeline: {
        orchestrator_command: "/ow:proto",
        user_visible_command: "/ow:proto",
        current_stage: "proto-preflight",
        stages: [
          {
            stage_id: "proto-preflight",
            command: "/ow:proto",
            visibility: "user",
            status: "pending",
            outputs: [],
          },
          {
            stage_id: "vision2prompt",
            command: "/ow:vision2prompt",
            visibility: "internal",
            status: "pending",
            outputs: [],
          },
          {
            stage_id: "prompt2proto",
            command: "/ow:prompt2proto",
            visibility: "internal",
            status: "pending",
            outputs: [],
          },
        ],
      },
      preflight_quality_gate: {
        vision_status: "missing|thin|ready",
        validation_status: "missing|thin|ready",
        can_proceed: false,
        blockers: [],
        next_command_when_blocked: "/ow:vision",
        required_followup_questions: [],
      },
      direction_count_policy: {
        requested_count: null,
        resolved_count: 3,
        source: "user_input|agent_default_after_user_delegation",
        ask_user_question_required: true,
        ask_user_question: "How many strategically different prototype directions should /ow:proto generate?",
      },
      normalized_input: {
        product_domain: "",
        primary_user: "",
        usage_context: "",
        current_alternative: "",
        core_pain: "",
        desired_behavior_change: "",
        strongest_success_signal: "",
        core_differentiator: "",
        emotional_value: "",
        functional_value: "",
        trust_requirements: [],
        privacy_requirements: [],
        non_goals: [],
        future_opportunities: [],
        validation_target: "",
      },
      strategic_core: {
        target_user: "",
        behavior_change: "",
        mechanism: "",
        differentiator: "",
        boundary_conditions: [],
        central_uncertainty: "",
      },
      directions: [
        {
          direction_id: "",
          name: "",
          strategic_hypothesis: "",
          validates: "",
          main_risk: "",
          distinctness_rationale: "",
          prototype_prompt: "",
          screen_prompts: [],
          pm_judgment: "",
        },
      ],
      build_recommendation: {
        first_direction_id: "",
        why_first: "",
        success_signals: [],
        failure_signals: [],
        next_test_if_it_works: "",
      },
      baseline_audit: [],
      product_system: {},
      delta_rules: {
        must_inherit: [],
        must_add: [],
        must_remove: [],
        flexible_change: [],
      },
      screen_manifest: [],
      global_design_prompt: "",
      screen_prompts: [
        {
          prompt_id: "",
          screen_name: "",
          image_role: "",
          prompt: "",
          acceptance_criteria: [],
        },
      ],
      prompt_text_manifest: {
        status: "draft",
        directions_ready: false,
        direction_count: 0,
        prompt_text_refs: [],
      },
      image_generation: {
        status: "not_started",
        batch_strategy: "Generate each selected direction as a coherent multi-image screen group after prompt_text_manifest.status is ready_for_image_generation.",
        generated_images: [],
        collection_notes: [],
      },
      negative_constraints: [],
      review_plan: {},
      observations: [],
      evidence: [],
      generated_images: [],
      known_limits: [],
      result: "not_reviewed",
      handoff: {
        next_command: "/ow:tune",
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
      "revision_scope",
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
    summaryPolicy: {
      strategy: "current_slice",
      path: "outcome + rationale + next_command + follow_up_questions",
      loadBeforeFull: true,
      refreshWhen: "Update whenever the decision outcome or next command changes.",
    },
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
      revision_scope: [],
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
    summaryPolicy: {
      strategy: "summary_file",
      path: ".openworkflow/design/<id>/SUMMARY.yaml",
      loadBeforeFull: true,
      refreshWhen: "Refresh after product design scope, open questions, or spec readiness changes.",
    },
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
  {
    artifactType: "production_spec",
    contractType: "spec",
    command: "/ow:spec",
    title: "Production spec",
    sourceOfTruthPath: ".openworkflow/specs/<id>/SPEC.yaml",
    templatePath: ".openworkflow/specs/_templates/SPEC.yaml",
    indexPath: ".openworkflow/specs/SPEC_INDEX.yaml",
    indexCollectionKey: "specs",
    notePath: ".openworkflow/specs/<id>/NOTE.md",
    reviewPath: null,
    disclosureLevel: 2,
    requiredKeys: [
      "artifact_type",
      "source_design",
      "goal",
      "scope",
      "requirements",
      "interfaces",
      "acceptance",
      "verification",
      "risks",
      "change_readiness",
    ],
    readPolicy: {
      loadByDefault: true,
      agentReadOrder: 70,
      maxYamlLines: 220,
      maxNoteLines: 60,
      rawEvidence: "only_when_referenced",
    },
    activePointer: {
      indexPath: ".openworkflow/specs/SPEC_INDEX.yaml",
      pointerKey: "current_spec",
      collectionKey: "specs",
      idKey: "spec_id",
      pathKey: "path",
    },
    evidencePolicy: "Reference product design and conditional design packets by path; keep implementation requirements concrete and bounded.",
    handoffKey: "change_readiness.next_command",
    summaryPolicy: {
      strategy: "summary_file",
      path: ".openworkflow/specs/<id>/SUMMARY.yaml",
      loadBeforeFull: true,
      refreshWhen: "Refresh after scope, interfaces, acceptance, verification, risks, or change readiness changes.",
    },
    template: {
      schema_version: "0.1.0",
      contract_id: "spec:<id>",
      contract_type: "spec",
      artifact_type: "production_spec",
      title: "<short production spec title>",
      status: "draft",
      source_design: "",
      goal: "",
      scope: {
        in: [],
        out: [],
      },
      requirements: {
        user_facing: [],
        functional: [],
        non_functional: [],
      },
      interfaces: {
        ui: [],
        api: [],
        data: [],
        integrations: [],
      },
      acceptance: [],
      verification: {
        commands: [],
        manual_checks: [],
      },
      risks: [],
      change_readiness: {
        ready: false,
        blockers: [],
        next_command: null,
      },
      updated_at: null,
    },
  },
  {
    artifactType: "production_change",
    contractType: "change",
    command: "/ow:change",
    title: "Production change",
    sourceOfTruthPath: ".openworkflow/changes/<id>/CHANGE.yaml",
    templatePath: ".openworkflow/changes/_templates/CHANGE.yaml",
    indexPath: ".openworkflow/changes/CHANGE_INDEX.yaml",
    indexCollectionKey: "changes",
    notePath: ".openworkflow/changes/<id>/NOTE.md",
    reviewPath: null,
    disclosureLevel: 2,
    requiredKeys: [
      "artifact_type",
      "source_spec",
      "problem",
      "goals",
      "non_goals",
      "affected_paths",
      "acceptance",
      "validation",
      "work_items",
      "risks",
      "runtime_readiness",
    ],
    readPolicy: {
      loadByDefault: true,
      agentReadOrder: 80,
      maxYamlLines: 220,
      maxNoteLines: 60,
      rawEvidence: "only_when_referenced",
    },
    activePointer: {
      indexPath: ".openworkflow/changes/CHANGE_INDEX.yaml",
      pointerKey: "current_change",
      collectionKey: "changes",
      idKey: "change_id",
      pathKey: "path",
    },
    evidencePolicy: "Reference the source spec and repo inspection notes; keep implementation planning traceable and scoped.",
    handoffKey: "runtime_readiness.next_command",
    summaryPolicy: {
      strategy: "summary_file",
      path: ".openworkflow/changes/<id>/SUMMARY.yaml",
      loadBeforeFull: true,
      refreshWhen: "Refresh after affected paths, work items, validation, risks, or runtime readiness changes.",
    },
    conditionalPackets: [
      {
        artifactType: "work_items",
        path: ".openworkflow/changes/<id>/WORK_ITEMS.yaml",
        requiredByDefault: true,
        when: "Use for ordered implementation tasks with owned paths, dependencies, acceptance, and verification.",
      },
    ],
    template: {
      schema_version: "0.1.0",
      contract_id: "change:<id>",
      contract_type: "change",
      artifact_type: "production_change",
      title: "<short production change title>",
      status: "draft",
      source_spec: "",
      problem: "",
      goals: [],
      non_goals: [],
      affected_paths: [],
      acceptance: [],
      validation: [],
      work_items: {
        path: ".openworkflow/changes/<id>/WORK_ITEMS.yaml",
        summary: [],
      },
      risks: [],
      runtime_readiness: {
        ready: false,
        blockers: [],
        next_command: null,
      },
      updated_at: null,
    },
  },
  {
    artifactType: "team_runtime",
    contractType: "runtime",
    command: "/ow:team",
    title: "Team runtime",
    sourceOfTruthPath: ".openworkflow/runtime/<id>/STATE.yaml",
    templatePath: ".openworkflow/runtime/_templates/STATE.yaml",
    indexPath: ".openworkflow/runtime/RUNTIME_INDEX.yaml",
    indexCollectionKey: "runs",
    notePath: ".openworkflow/runtime/<id>/NOTE.md",
    reviewPath: null,
    disclosureLevel: 2,
    requiredKeys: [
      "artifact_type",
      "source_change",
      "active_work_item",
      "execution_mode",
      "work_queue",
      "agents",
      "verification",
      "issues",
      "checkpoints",
      "handoff",
    ],
    readPolicy: {
      loadByDefault: true,
      agentReadOrder: 90,
      maxYamlLines: 220,
      maxNoteLines: 80,
      rawEvidence: "only_when_referenced",
    },
    activePointer: {
      indexPath: ".openworkflow/runtime/RUNTIME_INDEX.yaml",
      pointerKey: "current_run",
      collectionKey: "runs",
      idKey: "run_id",
      pathKey: "path",
    },
    evidencePolicy: "Reference change, work items, verification logs, issues, and checkpoints by path; keep current execution state compact.",
    handoffKey: "handoff.next_action",
    summaryPolicy: {
      strategy: "summary_file",
      path: ".openworkflow/runtime/<id>/SUMMARY.yaml",
      loadBeforeFull: true,
      refreshWhen: "Refresh after active work item, verification, issues, checkpoints, or handoff changes.",
    },
    conditionalPackets: [
      {
        artifactType: "runtime_issues",
        path: ".openworkflow/runtime/<id>/ISSUES.yaml",
        requiredByDefault: false,
        when: "Use when implementation or verification finds blockers, regressions, or follow-up issues.",
      },
      {
        artifactType: "runtime_checkpoints",
        path: ".openworkflow/runtime/<id>/CHECKPOINTS.yaml",
        requiredByDefault: false,
        when: "Use when recording commits, verification gates, QA checkpoints, or release readiness.",
      },
    ],
    template: {
      schema_version: "0.1.0",
      contract_id: "runtime:<id>",
      contract_type: "runtime",
      artifact_type: "team_runtime",
      title: "<short runtime title>",
      status: "active",
      source_change: "",
      active_work_item: null,
      execution_mode: "single_agent|agent_team|reconcile|qa_fix",
      work_queue: [],
      agents: [],
      verification: {
        commands: [],
        results: [],
      },
      issues: [],
      checkpoints: [],
      handoff: {
        status: "in_progress",
        next_action: null,
        blockers: [],
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
  if (command === "/ow:proto" || command === "/ow:tune") {
    return DISCOVERY_ARTIFACT_CONTRACTS.filter((contract) =>
      ["prototype_evidence", "decision_record"].includes(contract.artifactType),
    );
  }
  return DISCOVERY_ARTIFACT_CONTRACTS.filter((contract) => contract.command === command);
}
