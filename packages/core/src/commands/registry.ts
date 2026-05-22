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
    "Compile proto-ready vision into one prototype validation target.",
    "validation",
    [".openworkflow/validation/"],
    validationProtocol(),
  ),
  command(
    "build-proto-prompt",
    ["build-prototype-prompt"],
    "Internally compile ready vision and validation into ready prototype prompt packs.",
    "prototype",
    [".openworkflow/prototypes/"],
    buildProtoPromptProtocol(),
    "internal",
  ),
  command(
    "vision2prompt",
    ["vision-to-strategic-prototype-prompt"],
    "Internally compile ready vision and validation into strategic prototype prompt text.",
    "prototype",
    [".openworkflow/prototypes/"],
    vision2PromptProtocol(),
    "internal",
  ),
  command(
    "prompt2proto",
    ["prompt-to-prototype-images"],
    "Internally generate high-fidelity prototype image groups from prepared prompt text.",
    "prototype",
    [".openworkflow/prototypes/"],
    prompt2ProtoProtocol(),
    "internal",
  ),
  command(
    "proto",
    ["build-prototype", "ow:prototype"],
    "Create image-first strategic prototype prompt packs from vision or validation context.",
    "prototype",
    [".openworkflow/prototypes/"],
    prototypeProtocol(),
  ),
  command(
    "tune",
    ["tune-prototype", "ow:tune:proto"],
    "Refine accepted prototype screens or prompt packs and record the decision audit automatically.",
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
  command(
    "spec",
    ["build-spec"],
    "Create one focused production spec from accepted product design.",
    "spec",
    [".openworkflow/specs/"],
    specProtocol(),
  ),
  command(
    "change",
    ["build-change"],
    "Create one focused production change for the current core feature.",
    "change",
    [".openworkflow/changes/"],
    changeProtocol(),
  ),
  command(
    "team",
    ["run-team", "build-team"],
    "Execute approved production work through the Agent Team runtime.",
    "runtime",
    [".openworkflow/runtime/"],
    teamProtocol(),
  ),
  command(
    "decompose-to-changes",
    [],
    "Create, update, query, or maintain an OpenWorkflow candidate change queue.",
    "planning",
    [
      "changes/<plan_id>/CANDIDATE_CHANGES.yaml",
      "changes/<plan_id>/CANDIDATE_CHANGES.md",
      "changes/<plan_id>/SUMMARY.yaml",
    ],
    decomposeToChangesProtocol(),
  ),
  command(
    "analyze-changes",
    [],
    "Analyze multiple candidate change queues and recommend the next queue and candidate without selecting it.",
    "planning",
    ["changes/<analysis_id>/CHANGE_ANALYSIS.yaml", "changes/<analysis_id>/CHANGE_ANALYSIS.md"],
    analyzeChangesProtocol(),
  ),
  command(
    "select-change",
    [],
    "Select one implementable candidate change and create implementation-ready planning artifacts.",
    "planning",
    [
      "changes/<plan_id>/<candidate-id>-<slug>/SELECTED_CHANGE.yaml",
      "changes/<plan_id>/<candidate-id>-<slug>/ATOM_TASKS.yaml",
      "changes/<plan_id>/<candidate-id>-<slug>/IMPLEMENTATION_BRIEF.md",
    ],
    selectChangeProtocol(),
  ),
  command(
    "git-automation",
    [],
    "Operate the managed git lifecycle shell for local branch, commit, PR-ready summary, and remote approval gates.",
    "governance",
    ["changes/<plan_id>/CANDIDATE_CHANGES.yaml", "changes/<plan_id>/PR_READY_SUMMARY.md"],
    gitAutomationProtocol(),
  ),
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

function decomposeToChangesProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "candidate-queue-decomposition-and-maintenance",
    requiredContext: [
      "references/planning-artifact-contracts.md",
      "skills/decompose-to-changes/references/decomposition-protocol.md",
    ],
    optionalContext: [
      "changes/<plan_id>/CANDIDATE_CHANGES.yaml",
      "changes/<plan_id>/SUMMARY.yaml",
      "changes/<plan_id>/HIGH_RISK_DECISION_REPORT.md",
      "docs/OW_DEVELOP_PLAN.md",
      "docs/OW_DEVELOP_PLAN_Phase2.md",
      "user-provided planning source",
    ],
    forbiddenContext: [],
    allowedOutputs: [
      "changes/<plan_id>/CANDIDATE_CHANGES.yaml",
      "changes/<plan_id>/CANDIDATE_CHANGES.md",
      "changes/<plan_id>/SUMMARY.yaml",
      "changes/<plan_id>/HIGH_RISK_DECISION_REPORT.md when the next actionable work is high risk",
    ],
    conditionalOutputs: [
      "high-risk decision report when a risk: high candidate becomes the next actionable work",
      "queue maintenance operation entries for add, update, split, merge, defer, block, supersede, restore, or complete",
    ],
    forbiddenOutputs: [
      "SELECTED_CHANGE.yaml",
      "ATOM_TASKS.yaml",
      "IMPLEMENTATION_BRIEF.md",
      "implementation code changes",
      "generated .agents/** or .openworkflow/** edits unless selected and explicitly approved",
    ],
    auditCheckpoints: {
      before: [
        "Run git status --short --branch and record branch and dirty-tree state.",
        "Decide whether this is new decomposition or maintenance of an existing queue.",
        "Run the queue scope gate: choose one feature, bounded module, command surface, artifact family, or workflow slice for this queue.",
        "Read existing queue YAML before changing candidate ids or statuses.",
      ],
      during: [
        "Preserve stable candidate ids and branch_boundary when updating an existing queue.",
        "Record features outside the current queue boundary as deferred refs instead of current candidates.",
        "Keep candidates focused, dependency-aware, and bounded by owned paths.",
        "Append an operation entry for every queue maintenance edit.",
      ],
      after: [
        "Refresh CANDIDATE_CHANGES.md as a readable view of YAML source truth.",
        "Refresh SUMMARY.yaml with candidate count, next recommended candidate, risks, and validation evidence.",
        "Stop with a high-risk report instead of selecting or implementing risk: high candidates.",
      ],
    },
    antiPatterns: [
      "Do not select a candidate from decompose-to-changes.",
      "Do not implement code from decompose-to-changes.",
      "Do not create a new top-level changes folder for every small candidate inside the same feat boundary.",
      "Do not turn one CANDIDATE_CHANGES queue into a roadmap bucket for multiple features or a large module family.",
      "Do not delete historical candidate ids; use status transitions and operation evidence.",
    ],
    handoffCommands: ["/ow:analyze-changes", "/ow:select-change"],
  };
}

function analyzeChangesProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "read-only-cross-queue-priority-analysis",
    requiredContext: [
      "references/planning-artifact-contracts.md",
      "skills/analyze-changes/references/analysis-protocol.md",
      "changes/<plan_id>/CANDIDATE_CHANGES.yaml",
    ],
    optionalContext: [
      "references/git-version-control-governance.md",
      "references/issue-governance.md",
      "changes/*/CANDIDATE_CHANGES.yaml when the user asks for global or cross-queue analysis",
      "changes/<plan_id>/SUMMARY.yaml",
      "changes/<plan_id>/HIGH_RISK_DECISION_REPORT.md",
    ],
    forbiddenContext: [],
    allowedOutputs: [
      "changes/<analysis_id>/CHANGE_ANALYSIS.yaml",
      "changes/<analysis_id>/CHANGE_ANALYSIS.md",
    ],
    conditionalOutputs: [
      "high-risk stop recommendation that points to the needed HIGH_RISK_DECISION_REPORT.md",
      "queue maintenance recommendation when no candidate is safe to select",
    ],
    forbiddenOutputs: [
      "CANDIDATE_CHANGES.yaml mutations unless the user separately requests maintenance",
      "SELECTED_CHANGE.yaml",
      "ATOM_TASKS.yaml",
      "IMPLEMENTATION_BRIEF.md",
      "implementation code changes",
      "high-risk implementation approval",
    ],
    auditCheckpoints: {
      before: [
        "Run git status --short --branch and record branch and dirty-tree state.",
        "Confirm this is a cross-queue decision; when only one queue is active, hand off to select-change.",
        "Discover only user-provided queues, or obvious changes/*/CANDIDATE_CHANGES.yaml files when global analysis is requested.",
        "Read YAML queues as source truth and Markdown views only as aids.",
      ],
      during: [
        "Score candidates by readiness, dependency unlock value, risk, branch fit, dirty-tree fit, Issue linkage, validation realism, and user recency.",
        "Treat high-risk candidates as stop recommendations unless a concrete high-risk option is already approved.",
        "Recommend exactly one target plan id and candidate id only when evidence supports selection.",
      ],
      after: [
        "Write CHANGE_ANALYSIS.yaml before CHANGE_ANALYSIS.md.",
        "Record rejected alternatives with plan id, candidate id, and concise reasons.",
        "Hand off to select-change without mutating selection artifacts.",
      ],
    },
    antiPatterns: [
      "Do not select candidates from analyze-changes.",
      "Do not implement candidates from analyze-changes.",
      "Do not treat CHANGE_ANALYSIS.yaml as approval for high-risk implementation.",
      "Do not discover every queue unless the user requests global comparison.",
      "Do not use analyze-changes as a mandatory pre-step for single-queue selection.",
    ],
    handoffCommands: ["/ow:select-change", "/ow:decompose-to-changes"],
  };
}

function selectChangeProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "single-candidate-selection-and-atomization",
    requiredContext: [
      "references/planning-artifact-contracts.md",
      "skills/select-change/references/selection-protocol.md",
      "changes/<plan_id>/CANDIDATE_CHANGES.yaml",
    ],
    optionalContext: [
      "changes/<plan_id>/CANDIDATE_CHANGES.md",
      "changes/<analysis_id>/CHANGE_ANALYSIS.yaml only for cross-queue recommendations",
      "changes/<plan_id>/SUMMARY.yaml",
      "changes/<plan_id>/HIGH_RISK_DECISION_REPORT.md",
    ],
    forbiddenContext: [],
    allowedOutputs: [
      "changes/<plan_id>/<candidate-id>-<slug>/SELECTED_CHANGE.yaml",
      "changes/<plan_id>/<candidate-id>-<slug>/ATOM_TASKS.yaml",
      "changes/<plan_id>/<candidate-id>-<slug>/IMPLEMENTATION_BRIEF.md",
      "selection and operation entries in changes/<plan_id>/CANDIDATE_CHANGES.yaml",
      "refreshed changes/<plan_id>/CANDIDATE_CHANGES.md",
    ],
    conditionalOutputs: [
      "rejected alternatives copied from CHANGE_ANALYSIS.yaml when consuming cross-queue analysis",
      "targeted readiness report when the user asks to inspect a candidate without selecting it",
    ],
    forbiddenOutputs: [
      "implementation code changes",
      "local commits, stashes, resets, branch switches, or destructive git operations",
      "risk: high selection without explicit approval of a concrete option from HIGH_RISK_DECISION_REPORT.md",
      "generated .agents/** or .openworkflow/** edits unless selected and explicitly approved",
    ],
    auditCheckpoints: {
      before: [
        "Run git status --short --branch and compare current branch with queue_policy.branch_boundary.",
        "Check dirty-tree state and stop if unrelated work would contaminate the selected change.",
        "For a single active queue, rank candidates directly without requiring analyze-changes.",
        "Confirm candidate dependencies, readiness, risk, owned paths, validation, and acceptance.",
      ],
      during: [
        "Use next_recommended_candidate_id, dependency satisfaction, unlock value, selection_policy, risk, owned paths, and validation realism to choose inside one queue.",
        "Select exactly one candidate inside the owning queue folder.",
        "Re-check high-risk approval before writing selection artifacts for risk: high candidates.",
        "Keep atom tasks small enough for one focused implementation pass.",
      ],
      after: [
        "Update candidate status to selected and append a selection operation.",
        "Refresh the readable Markdown queue view.",
        "Stop before implementation unless the user explicitly asks to continue.",
      ],
    },
    antiPatterns: [
      "Do not silently select a high-risk candidate.",
      "Do not select on the wrong branch without an explicit planning-only exception.",
      "Do not mark the candidate done from select-change.",
      "Do not create a new top-level changes folder for a candidate inside an existing feat queue.",
    ],
    handoffCommands: ["/ow:change", "/ow:team", "/ow:git-automation"],
  };
}

function gitAutomationProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "managed-git-lifecycle-shell",
    requiredContext: [
      "references/git-version-control-governance.md",
      "references/gh-operation-governance.md",
      "changes/<plan_id>/CANDIDATE_CHANGES.yaml",
    ],
    optionalContext: [
      "changes/<plan_id>/HIGH_RISK_DECISION_REPORT.md",
      "changes/<plan_id>/PR_READY_SUMMARY.md",
      "changes/<plan_id>/<candidate-id>/LOCAL_COMMIT_EVIDENCE.yaml",
    ],
    forbiddenContext: [],
    allowedOutputs: [
      "local branch checkout or creation through openworkflow git-automation branch",
      "local selected-change commit through openworkflow git-automation commit",
      "local PR_READY_SUMMARY.md through openworkflow git-automation summary",
      "remote operation plan through openworkflow git-automation remote",
      "remote read-only PR-ready plan through openworkflow git-automation remote-plan",
      "draft PR pilot preview or explicitly gated mutation through openworkflow git-automation draft-pr",
      "local evidence artifacts under changes/<plan_id>/",
    ],
    conditionalOutputs: [
      "high-risk decision report when remote mutation or autonomous mode is requested",
      "follow-up CANDIDATE_CHANGES entry for autonomous git automation",
    ],
    forbiddenOutputs: [
      "git push without explicit operation-level user approval",
      "gh pr create/edit/merge without explicit operation-level user approval",
      "gh issue create/edit/close without explicit operation-level user approval",
      "git reset, rebase, force-push, or destructive branch deletion",
    ],
    auditCheckpoints: {
      before: [
        "Read the queue branch boundary and confirm current git state.",
        "Confirm whether the requested mode is managed or autonomous.",
        "Stop on autonomous or remote mutation requests unless a high-risk approval exists for exact operations.",
      ],
      during: [
        "Use dry-run or preview before any local mutation.",
        "Record plan id, candidate id, branch, dirty paths, command preview, validation evidence, and affected paths.",
        "Keep local branch, commit, and summary actions scoped to the selected queue.",
      ],
      after: [
        "Record commit hash and evidence path when a local commit is created.",
        "Regenerate PR_READY_SUMMARY.md after commit evidence changes when appropriate.",
        "Report remote operations as gated and include ordered commit or queue evidence for push, PR, and merge planning.",
      ],
    },
    antiPatterns: [
      "Do not treat git-automation enabled as permission to push, merge, or mutate GitHub in this G015 shell.",
      "Do not hide dirty paths or omit command previews from evidence.",
      "Do not create a selected change with no local commit when implementation changed files.",
      "Do not amend only to force a commit to contain its own hash.",
    ],
    handoffCommands: [
      "openworkflow git-automation branch --root . --queue changes/<plan_id>/CANDIDATE_CHANGES.yaml --json",
      "openworkflow git-automation commit --root . --queue changes/<plan_id>/CANDIDATE_CHANGES.yaml --candidate <id> --message <msg> --validation-evidence <cmds> --json",
      "openworkflow git-automation summary --root . --queue changes/<plan_id>/CANDIDATE_CHANGES.yaml --json",
      "openworkflow git-automation simulate --root . --queue changes/<plan_id>/CANDIDATE_CHANGES.yaml --base <base-ref> --json",
      "openworkflow git-automation remote-plan --root . --queue changes/<plan_id>/CANDIDATE_CHANGES.yaml --base <base-ref> --remote <remote> --target-base <branch> --json",
      "openworkflow git-automation draft-pr --root . --queue changes/<plan_id>/CANDIDATE_CHANGES.yaml --base <base-ref> --remote <remote> --target-base <branch> --json",
    ],
    internalSections: [
      {
        tag: "mode_policy",
        items: [
          "managed mode may perform approved local branch, commit, and summary operations with previews and evidence.",
          "managed mode must gate remote push, PR, Issue, and merge operations behind explicit user approval while producing a clear operation plan.",
          "remote-plan mode may read remote refs and PR metadata, but must not push, create PRs, edit PRs, merge, or mutate Issues.",
          "draft-pr mode is disabled by default; mutation requires --write, --allow-draft-pr, current remote-plan evidence, and rollback guidance.",
          "autonomous mode is a future high-risk path and is not implemented by the G015 command shell.",
        ],
      },
      {
        tag: "evidence_policy",
        items: [
          "Every git operation must be traceable to a plan id, candidate id, command preview, before and after state, and validation evidence when applicable.",
          "Remote approval handoff must include branch, target base, ordered local commits, PR-ready summary path, conflict-resolution checkpoint, and merge evidence expectations.",
          "A selected change must have at least one local commit when implementation changed files.",
          "Follow-up evidence commits are allowed when they preserve the selected-change HEAD relationship.",
        ],
      },
    ],
  };
}

function visionProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "delayed-compile-product-interrogation",
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
        "Load CURRENT_STATE.yaml when present to avoid stale stage routing.",
        "Enter interview mode as product partner, requirements interrogator, and intent compiler.",
        "Ask the next useful vision question before writing artifacts; do not start by creating or updating durable vision files.",
        "If resuming, load only current vision/context state needed to continue the conversation and identify any stale current_question.",
      ],
      during: [
        "Ask one focused question at a time and make each question depend on the previous answer.",
        "Keep brainstorming in conversation memory until a meaningful checkpoint, pause request, or compile readiness boundary.",
        "Challenge thin, generic, contradictory, or implementation-shaped answers until the strategic product intent is clear.",
        "Cover mandatory vision and proto-readiness dimensions before validation handoff.",
        "Provide concrete examples or options when the user is stuck.",
      ],
      after: [
        "Persist artifacts only in checkpoint mode or compile mode after stable answers, explicit save request, or readiness checkpoint.",
        "Compile durable VISION artifacts only after proto_readiness.status can be ready or blockers are explicit and the user confirms the interview can stop.",
        "Handoff to validation only after mandatory coverage, proto-readiness, unresolved blockers, and user readiness are explicit.",
        "When handing off, mark the vision session active or reviewed, clear stale current_question when answered, and update CURRENT_STATE.yaml.",
        "Confirm no validation, prototype, spec, change, or runtime artifacts were created.",
      ],
    },
    antiPatterns: [
      "Do not write durable vision artifacts after every user answer.",
      "Do not open by writing vision artifacts before the conversation has stable answers.",
      "Do not create validation rankings during vision work.",
      "Do not create prototype prompt packs during vision work; record proto-readiness inputs and hand off to /ow:proto later.",
      "Do not create specs, changes, tasks, or teams from a vision session.",
      "Do not batch many interview questions into one turn.",
      "Do not hand off to validation after a fixed small number of questions.",
      "Do not hide thin or conflicted answers as polished product truth.",
    ],
    internalSections: [
      {
        tag: "vision_role",
        items: [
          "Act as product partner: improve the product thesis, surface sharper alternatives, and protect the user from weak strategic defaults.",
          "Act as requirements interrogator: probe unclear assumptions, contradictions, target user ambiguity, trust boundaries, and success criteria.",
          "Act as intent compiler: convert conversation into structured strategic_core, product_system_seed, proto_readiness, and coverage fields only when the intent is stable.",
        ],
      },
      {
        tag: "interaction_modes",
        items: [
          "Interview mode is the default: ask one focused question at a time and do not write durable .openworkflow/vision artifacts after each answer.",
          "Checkpoint mode writes a lightweight durable snapshot only when the user asks to save, the session is pausing, a topic has closed, or a load-bearing ambiguity must not be lost.",
          "Compile mode writes VISION.md, VISION_CONTRACT.yaml, VISION_SESSION.yaml, and NOTE.md only after mandatory discovery coverage and proto-readiness are sufficient or explicitly blocked.",
        ],
      },
      {
        tag: "agent_first_consumer",
        items: [
          "Treat the next implementing Agent as the first consumer of vision artifacts.",
          "Before persistence or handoff, make the compact vision state answer: current state, read-first pointers, source-of-truth artifact, unresolved blockers, safe write boundary, proto-readiness, validation target, and next command.",
          "The vision_delta must preserve enough handoff intelligence for a low-context Agent: one sentence, users, core problem, goals, non-goals, quality bar, AI-native role, success signals, and failure signals.",
          "The strategic_core and product_system_seed must let /ow:proto generate prototype directions without inventing the core strategy.",
          "If those handoff fields are thin, continue the conversation or record explicit unresolved questions instead of presenting the artifact as ready.",
        ],
      },
      {
        tag: "conversation_first",
        items: [
          "Treat /ow:vision as a focused product conversation, not an artifact fill-out task.",
          "Ask exactly one question unless the user explicitly requests a summary or save checkpoint.",
          "Let each answer drive the next deeper question; do not run a generic questionnaire mechanically.",
          "A long interview is acceptable when it improves product truth; auditability is preserved through checkpoints and compile, not per-answer file churn.",
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
          "Cover prototype direction seeds and prompt constraints needed by /ow:proto.",
        ],
      },
      {
        tag: "proto_readiness_gate",
        items: [
          "VISION.md is ready only when /ow:proto can derive 3-5 strategically distinct prototype directions without inventing the product strategy.",
          "Before compile, verify target user, behavior change, mechanism, differentiator, boundary conditions, trust controls, anti-goals, strongest success signal, failure signals, prototype direction seeds, prompt constraints, and validation target.",
          "If proto_readiness.status is missing or thin, keep interviewing or record explicit blockers; do not hand off as ready.",
          "If the user asks for prototype prompts directly and proto-readiness is ready, hand off to /ow:proto; otherwise continue the vision interview.",
        ],
      },
      {
        tag: "readiness_gate",
        items: [
          "Do not hand off to /ow:validation until mandatory coverage is addressed, proto-readiness is ready or explicitly blocked, unresolved questions are explicit, and the user confirms readiness.",
          "If a dimension is thin, ask another targeted question instead of writing a final artifact.",
          "Vision readiness is based on strategic depth, proto-readiness, and user confirmation, not on a fixed number of turns.",
        ],
      },
      {
        tag: "artifact_checkpoint",
        items: [
          "Write VISION_SESSION.yaml, VISION_CONTRACT.yaml, VISION.md, or context updates only after stable answers, explicit checkpoint request, pause boundary, or compile readiness.",
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
    interactionMode: "prototype-validation-target-compiler",
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
      before: [
        "Confirm a vision contract exists and is proto-ready enough to validate.",
        "Load CURRENT_STATE.yaml when present.",
        "Load only vision, validation index, and build-validation context.",
        "Return to /ow:vision when missing vision fields would force /ow:proto to invent product strategy.",
      ],
      during: [
        "Select exactly one central uncertainty for the next prototype to reduce.",
        "Define target_behavior and the minimum prototype_experiment needed to observe it.",
        "Write observable_signals for pass, fail, and ambiguous evidence.",
        "Write decision_rules for continue, revise, pivot, stop, and needs_more_evidence.",
        "Record vision_gaps and agent_readiness_gate without generating prototype artifacts.",
      ],
      after: [
        "Record central_uncertainty, hypothesis, target_behavior, prototype_experiment, observable_signals, decision_rules, vision_gaps, and agent_readiness_gate.",
        "Set agent_readiness_gate.status to ready_for_proto, thin_validation, stale_validation, or return_to_vision.",
        "Update CURRENT_STATE.yaml with current_validation, active_stage validation, and the next command.",
        "Mark superseded validation targets accordingly when a new validation target replaces them.",
        "Confirm no prototype, spec, change, or runtime artifacts were created.",
      ],
    },
    antiPatterns: [
      "Do not treat feature classification or backlog ranking as the validation outcome.",
      "Do not generate prototype prompts, images, HTML, specs, changes, or runtime artifacts.",
      "Do not hide missing vision evidence by writing a polished but unsupported validation target.",
      "Do not select multiple unrelated validation targets in one artifact.",
    ],
    handoffCommands: ["/ow:proto", "/ow:vision"],
  };
}

function prototypeProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "image-first-strategic-proto-prompt-pack",
    requiredContext: [
      ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
      ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
    ],
    optionalContext: [
      ".openworkflow/vision/VISION_CONTRACT.yaml",
      ".openworkflow/vision/VISION.md",
      ".openworkflow/validation/VALIDATION_INDEX.yaml",
      ".openworkflow/validation/**/VALIDATION.yaml",
      ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
      ".openworkflow/context/CONTEXT.md",
      ".openworkflow/context/CONTEXT_MAP.yaml",
      "package.json",
    ],
    forbiddenContext: [".openworkflow/runtime/**", ".openworkflow/changes/**", ".openworkflow/specs/**"],
    allowedOutputs: [
      ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
      ".openworkflow/prototypes/<id>/PROTO_PROMPT_PACK.yaml",
      ".openworkflow/prototypes/<id>/PROTO_PROMPT_PACK.md",
      ".openworkflow/prototypes/<id>/REVIEW_PLAN.md",
      ".openworkflow/prototypes/<id>/EVIDENCE.yaml",
      ".openworkflow/prototypes/<id>/NOTE.md",
      ".openworkflow/prototypes/<id>/images/**",
      ".openworkflow/decisions/DECISION_INDEX.yaml",
      ".openworkflow/decisions/<id>/DECISION.yaml",
      ".openworkflow/decisions/<id>/NOTE.md",
    ],
    conditionalOutputs: [
      ".openworkflow/validation/VALIDATION_INDEX.yaml",
      ".openworkflow/validation/<id>/VALIDATION.yaml",
      ".openworkflow/validation/<id>/NOTE.md",
    ],
    forbiddenOutputs: [
      ".openworkflow/prototypes/<id>/review.html",
      ".openworkflow/specs/**",
      ".openworkflow/changes/**",
      ".openworkflow/runtime/**",
    ],
    auditCheckpoints: {
      before: [
        "Act as the user-facing orchestrator for the internal proto pipeline: proto-preflight, /ow:vision2prompt, then /ow:prompt2proto.",
        "Load vision and current validation context; validation is required before prototype generation.",
        "If current_validation is missing, auto-run /ow:validation first and write VALIDATION.yaml, NOTE.md, and VALIDATION_INDEX.yaml with trigger.mode agent_auto, requested_command /ow:proto, and reason missing_current_validation.",
        "Proceed only after validation_input.mode can reference a durable validation artifact; do not use ephemeral vision_only validation context.",
        "Verify vision and validation artifact quality before prompt work; if either is missing, thin, stale, or not strong enough for high-quality prototype prompts, route back to /ow:vision with focused follow-up questions instead of generating prompts.",
        "If the user has not specified the number of strategically different prototype directions, askUserQuestion for the count; use 3 only when the user explicitly delegates that decision to the agent.",
        "Extract the strategic core: target user, behavior change, mechanism, differentiator, boundary conditions, and central uncertainty.",
      ],
      during: [
        "Before strategic directions, require /ow:vision2prompt to infer product_experience_model: product archetype, primary canvas, information architecture, domain objects, task loop, interaction states, data realism, visual language, and anti-generic constraints.",
        "Treat scenarios such as planning, incident, or capacity as possible modules, layers, workflows, or states inside one product shell unless they truly imply different product forms.",
        "Internally trigger /ow:vision2prompt to generate 5-8 strategic prototype hypotheses, select the resolved direction count, and write all multi-direction, multi-image prompt text.",
        "Do not internally trigger /ow:prompt2proto until prompt_text_manifest.status is ready_for_image_generation and every selected direction has concrete screen prompts.",
        "Do not internally trigger /ow:prompt2proto until prompt_pack_integrity_gate.status and prototype_reality_gate.status are pass and quality_rubric.prompt_executability is pass.",
        "Do not internally trigger /ow:prompt2proto until post_validate.status is pass for resolved_count 2 or more, or skipped when the user explicitly requested exactly one strategic direction.",
        "If post_validate, prompt_pack_integrity_gate, prototype_reality_gate, or prompt executability fails, route back through /ow:vision2prompt prompt repair instead of starting image generation.",
        "Internally trigger /ow:prompt2proto to Batch-generate prototype images from the prepared prompt text and collect generated image paths, direction ids, prompt ids, metadata, and notes into EVIDENCE.yaml.",
        "Recommend the first direction to generate based on risk reduction, observability, feasibility, and closeness to the success signal.",
      ],
      after: [
        "Write PROTO_PROMPT_PACK.yaml, PROTO_PROMPT_PACK.md, REVIEW_PLAN.md, compact EVIDENCE.yaml, prompt_text_manifest, and image_generation collection state.",
        "Record review evidence and a decision audit record internally after prompt-pack evidence changes.",
        "Refresh prototype SUMMARY.yaml when summary_policy is configured and update CURRENT_STATE.yaml with current_prototype, last_decision, and next_command.",
        "Confirm no HTML, design, spec, change, team, persistence, or production hardening was created.",
      ],
    },
    antiPatterns: [
      "Do not generate HTML, CSS, local runnable apps, or implementation tasks from /ow:proto.",
      "Do not treat visual style variants as strategic directions.",
      "Do not hide missing validation or proceed in ephemeral vision_only mode.",
      "Do not convert prompt packs into production specs or change backlogs.",
      "Do not create design, specs, changes, or teams from unaccepted prompt-pack evidence.",
      "Do not ask the user to manually invoke /ow:decision after prototype work; record the decision audit internally.",
    ],
    internalSections: [
      {
        tag: "internal_proto_pipeline",
        items: [
          "/ow:proto is the only user-facing command in this chain; /ow:vision2prompt and /ow:prompt2proto are internal commands.",
          "Run proto-preflight first, then /ow:vision2prompt, then /ow:prompt2proto.",
          "Record internal_pipeline.stages with stage ids proto-preflight, vision2prompt, and prompt2proto in EVIDENCE.yaml.",
          "Do not expose /ow:vision2prompt or /ow:prompt2proto as normal user-facing handoffs.",
        ],
      },
      {
        tag: "validation_consumption",
        items: [
          "If validation artifacts are absent but a vision exists, auto-run /ow:validation first and persist VALIDATION.yaml, NOTE.md, and VALIDATION_INDEX.yaml.",
          "Auto validation must set trigger.mode: agent_auto, trigger.requested_command: /ow:proto, and trigger.reason: missing_current_validation.",
          "If VALIDATION.yaml exists, consume it and preserve central_uncertainty, prototype_experiment, observable_signals, decision_rules, and include/exclude boundaries.",
          "Before prompt generation, verify that both VISION.md or VISION_CONTRACT.yaml and VALIDATION.yaml are high-quality enough to produce high-quality prototype prompts.",
          "If source quality is insufficient, record preflight_quality_gate.can_proceed false and hand back to /ow:vision with targeted missing questions.",
          "If validation conflicts with vision, stop for a decision instead of broadening scope silently.",
        ],
      },
      {
        tag: "preflight_quality_gate",
        items: [
          "Set preflight_quality_gate.vision_status and validation_status to missing, thin, or ready before prompt work.",
          "Set preflight_quality_gate.can_proceed true only when vision and validation can support high-quality prototype prompt generation without agent invention.",
          "When can_proceed is false, set next_command_when_blocked: /ow:vision and include required_followup_questions for the user's supplemental interview.",
        ],
      },
      {
        tag: "direction_count_policy",
        items: [
          "If the user did not specify NUMBER_OF_TYPES or a strategic direction count, askUserQuestion before generating prompt directions.",
          "If the user answers with a count, set source: user_input and resolved_count to that number.",
          "If the user delegates direction count to the agent, set source: agent_default_after_user_delegation and resolved_count: 3.",
          "Do not silently default to 3 before the user either provides a count or delegates the choice.",
        ],
      },
      {
        tag: "strategic_prompt_pack",
        items: [
          "Write prompt_pack_type: strategic_proto_prompt_pack.",
          "Normalize product domain, primary user, usage context, current alternative, core pain, desired behavior change, strongest success signal, core differentiator, emotional value, functional value, trust requirements, privacy requirements, non-goals, future opportunities, and validation target.",
          "Represent strategic_core as target user plus behavior change plus mechanism plus differentiator plus boundary conditions.",
          "Write product_experience_model before directions: product_archetype, primary_canvas, information_architecture, domain_object_model, primary_task_loop, interaction_state_model, data_realism_requirements, visual_language, anti_generic_constraints, and category_quality_bar.",
          "Use product_experience_model to decide whether source concepts are separate strategic directions or modules, scenarios, layers, states, or workflows inside one product shell.",
          "Convert non-goals and category anti-patterns into negative_constraints; explicitly block generic AI dashboards, consulting-report layouts, and card walls when the target product category implies a richer product shell.",
          "Generate more candidate hypotheses than needed, then select the resolved direction count with maximum strategic diversity.",
          "Each direction must include direction_id, name, strategic_hypothesis, validates, main_risk, distinctness_rationale, prototype_prompt, screen_prompts, and pm_judgment.",
        ],
      },
      {
        tag: "prompt_text_manifest",
        items: [
          "Write complete prompt text for every selected direction before invoking image generation.",
          "Each direction should include multi-image screen prompt text with prompt_id, screen_name, image_role, prompt, and acceptance_criteria.",
          "Set prompt_text_manifest.status: ready_for_image_generation only after every selected direction has concrete, directly executable prompt text and screen-bound prompt refs.",
          "Do not set prompt_text_manifest.status: ready_for_image_generation when prompt_pack_integrity_gate, prototype_reality_gate, screen_manifest coverage, or quality_rubric.prompt_executability is missing or failing.",
        ],
      },
      {
        tag: "prompt_pack_handoff_gate",
        items: [
          "Before /ow:prompt2proto, require prompt_pack_integrity_gate.status: pass.",
          "Before /ow:prompt2proto, require prototype_reality_gate.status: pass.",
          "Before /ow:prompt2proto, require screen_manifest entries and direction screen_prompts to resolve by target_screen_id.",
          "Before /ow:prompt2proto, require quality_rubric.prompt_executability.status: pass.",
          "If any required gate fails or is missing, keep image_generation.status: not_started and repair inside /ow:vision2prompt.",
        ],
      },
      {
        tag: "post_validate_gate",
        items: [
          "Run prompt asset post-validation after prompt_text_manifest.status is ready_for_image_generation and before /ow:prompt2proto.",
          "Require post_validate.status: pass when direction_count_policy.resolved_count is 2 or more.",
          "Set post_validate.status: skipped only when direction_count_policy.resolved_count is 1 because the user explicitly requested exactly one strategic direction.",
          "Do not start image_generation or invoke /ow:prompt2proto when post_validate.status is fail; route back to /ow:vision2prompt prompt repair.",
        ],
      },
      {
        tag: "image_generation",
        items: [
          "After prompt_text_manifest.status is ready_for_image_generation and post_validate.status is pass or skipped, Batch-generate prototype images from the prepared prompt text.",
          "Generate image groups by direction and screen prompt; keep each generated image linked to direction_id and prompt_id.",
          "Record image_generation.status, batch_strategy, generated_images, and collection_notes in EVIDENCE.yaml.",
          "Do not use image generation as a substitute for missing strategy or incomplete prompt text.",
        ],
      },
      {
        tag: "image_only_boundary",
        items: [
          "/ow:proto creates prompt packs and image groups for high-fidelity static prototype images.",
          "Do not write HTML, CSS, runnable prototypes, production code, deployment config, auth, persistence, or team runtime.",
          "Hand off to /ow:tune when generated images or accepted baseline screens need refinement.",
        ],
      },
      {
        tag: "review_evidence",
        items: [
          "Record selected direction, user feedback, accepted elements, rejected elements, tune requests, and recommendation.",
          "Use recommendation continue, tune, pivot, stop, or needs_more_evidence.",
          "Reference generated images by path when present; do not embed large binary evidence.",
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

function vision2PromptProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "internal-vision-to-strategic-prompt-text",
    requiredContext: [
      ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
      ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
      ".openworkflow/vision/VISION_CONTRACT.yaml",
      ".openworkflow/vision/VISION.md",
      ".openworkflow/validation/**/VALIDATION.yaml",
    ],
    optionalContext: [
      ".openworkflow/context/CONTEXT.md",
      ".openworkflow/context/CONTEXT_MAP.yaml",
      ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
    ],
    forbiddenContext: [".openworkflow/runtime/**", ".openworkflow/changes/**", ".openworkflow/specs/**"],
    allowedOutputs: [
      ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
      ".openworkflow/prototypes/<id>/PROTO_PROMPT_PACK.yaml",
      ".openworkflow/prototypes/<id>/PROTO_PROMPT_PACK.md",
      ".openworkflow/prototypes/<id>/REVIEW_PLAN.md",
      ".openworkflow/prototypes/<id>/EVIDENCE.yaml",
      ".openworkflow/prototypes/<id>/NOTE.md",
    ],
    forbiddenOutputs: [
      ".openworkflow/prototypes/<id>/images/**",
      ".openworkflow/prototypes/<id>/review.html",
      ".openworkflow/specs/**",
      ".openworkflow/changes/**",
      ".openworkflow/runtime/**",
    ],
    auditCheckpoints: {
      before: [
        "Run only as an internal stage after /ow:proto preflight has confirmed vision and validation are ready.",
        "Consume durable VISION and VALIDATION artifacts; do not ask broad product questions or generate images.",
        "Adopt the co-founder plus senior product-manager perspective engine before running references; the references are tools, not a checklist that proves quality by itself.",
        "Load skills/build-prototype/references/strategic-prompt-pack-protocol.md, then run references/vision2prompt/01_input_contract.md through 07_quality_rubric.md in order before writing PROTO_PROMPT_PACK.",
        "Resolve direction_count_policy before writing prompt text; use resolved_count from /ow:proto preflight.",
        "Prepare to infer product_experience_model before strategic directions; do not start directions from scenario labels or visual style variants.",
        "Prepare to write dailin-grade long-form prompt paragraphs; direction and screen prompt text must include journey, interaction behavior, system response, trust controls, anti-goals, visual direction, desired user feeling, and concrete content.",
        "Prepare to run prompt_pack_integrity_gate, prototype_reality_gate, quality_rubric.prompt_executability, and post_validate after prompt assets are complete; do not hand off to /ow:prompt2proto while any required gate is missing or failing.",
      ],
      during: [
        "Apply the OW vision2prompt reference pipeline inside OW artifacts and keep intermediate reasoning outputs compactly represented in PROTO_PROMPT_PACK.yaml or NOTE.md.",
        "Record the intermediate pipeline outputs: perspective engine, normalized input contract, vision decomposition, candidate strategic hypotheses, product experience model, screen_manifest, prototype prompt schema, output manifest, and quality rubric.",
        "Each selected direction must carry product_thesis, user_transformation, reason_to_exist, differentiated product form, and pm_judgment before screen prompt anatomy.",
        "Infer product_experience_model from VISION and VALIDATION: product archetype, primary canvas, information architecture, domain object model, primary task loop, interaction state model, data realism requirements, visual language, anti-generic constraints, and category quality bar.",
        "Decide whether scenario names are separate strategic product forms or modules, layers, workflows, or states inside one product shell; do not split directions by scenario labels alone.",
        "Generate more candidate hypotheses than needed and select the resolved direction count for maximum strategic diversity.",
        "Only select directions that differ by product form, product loop, initiation trigger, interaction model, emotional driver, retention mechanism, validation metric, or main risk.",
        "Write complete multi-image prompt text for every selected direction with screen_prompts, negative_prompt, example_copy, and acceptance criteria tied to screen_manifest target_screen_id values.",
        "Populate quality_rubric.prompt_paragraph_quality and prompt_text_manifest.paragraph_quality_status before handoff; fail closed when paragraph_quality_dimensions are missing.",
        "Do not set prompt_text_manifest.status to ready_for_image_generation until prompt_pack_integrity_gate.status, prototype_reality_gate.status, quality_rubric.prompt_executability.status, and prompt_text_manifest.paragraph_quality_status are pass.",
        "After prompt text is ready, run the deterministic post_validate gate over strategic_fingerprint dimensions when resolved_count is 2 or more.",
        "When the user explicitly requested exactly one strategic direction, set post_validate.status: skipped and record the skip reason instead of running diversity comparison.",
      ],
      after: [
        "Write PROTO_PROMPT_PACK.yaml, PROTO_PROMPT_PACK.md, REVIEW_PLAN.md, and EVIDENCE.yaml with product_experience_model, screen_manifest, screen_prompts, prompt_pack_integrity_gate, prototype_reality_gate, quality_rubric, prompt_text_manifest.status ready_for_image_generation, and post_validate status.",
        "Hand internally to /ow:prompt2proto only when prompt_pack_integrity_gate.status and prototype_reality_gate.status are pass, quality_rubric.prompt_executability.status is pass, prompt_text_manifest.paragraph_quality_status is pass, and post_validate.status is pass or skipped.",
        "If any readiness gate fails, keep handoff blocked and repair prompt directions through /ow:vision2prompt.",
        "Record internal_pipeline stage vision2prompt status and outputs.",
        "Do not generate images; hand internally to /ow:prompt2proto.",
      ],
    },
    antiPatterns: [
      "Do not expose /ow:vision2prompt as a user-facing workflow step.",
      "Do not generate prototype images from this stage.",
      "Do not invent strategy when vision or validation is thin; return control to /ow:proto preflight.",
      "Do not treat dailin-derived references or YAML field completion as quality when the prompt lacks product thesis, user transformation, reason-to-exist, or design philosophy.",
      "Do not treat screen_prompts[].prompt as image-generation-ready when it reads like a screen-state instruction instead of a dailin-grade prototype-generation brief.",
      "Do not hand off to /ow:prompt2proto when post_validate.status is fail or missing for multi-direction prompt packs.",
      "Do not hand off to /ow:prompt2proto when prompt_pack_integrity_gate, prototype_reality_gate, screen_manifest coverage, or prompt executability is missing or failing.",
      "Do not create HTML, specs, changes, or runtime artifacts.",
    ],
    internalSections: [
      {
        tag: "internal_command_boundary",
        items: [
          "/ow:vision2prompt is internal and is invoked by /ow:proto, not by the user.",
          "Its only job is strategic prompt text generation from ready vision and validation artifacts.",
          "Its output must be ready for /ow:prompt2proto consumption.",
        ],
      },
      {
        tag: "perspective_engine",
        items: [
          "Start from a co-founder plus 15-year senior product-manager perspective before executing the reference pipeline.",
          "Treat dailin-derived references as tools for judgment, not a checklist whose completion alone proves quality.",
          "Ask what product should exist, why this prototype matters, which form best expresses the vision, and what user transformation should become visible.",
          "Every selected direction must include product_thesis, user_transformation, differentiated product form, reason_to_exist, and pm_judgment.",
          "Reject complete-but-soulless prompt paragraphs that list screens but do not make a product argument.",
        ],
      },
      {
        tag: "vision2prompt_reference_pipeline",
        items: [
          "Run skills/build-prototype/references/strategic-prompt-pack-protocol.md as the governing protocol.",
          "Load references/vision2prompt/01_input_contract.md to normalize vision, validation, direction count, target tool, fidelity, constraints, and missing inputs.",
          "Load references/vision2prompt/02_vision_decomposition.md before strategic hypotheses.",
          "Load references/vision2prompt/03_strategy_hypothesis_generation.md to create 5-8 candidates and select materially distinct directions.",
          "Load references/vision2prompt/04_product_system_extraction.md before writing screen_manifest or product_experience_model.",
          "Load references/vision2prompt/05_prototype_prompt_schema.md before writing direction screen_prompts.",
          "Load references/vision2prompt/06_output_templates.md so YAML remains source of truth and Markdown remains a readable view.",
          "Load references/vision2prompt/07_quality_rubric.md before marking prompt_text_manifest ready.",
        ],
      },
      {
        tag: "prompt_paragraph_quality",
        items: [
          "Before writing prompt text, run the mapped OW equivalents of dailin 01-06 references in order; references are mandatory generation tools, not optional background.",
          "Every direction prototype_prompt must be a dailin-grade long-form prototype-generation brief, not a short image prompt.",
          "Every screen_prompts[].prompt must include journey stage, interaction behavior, system response, trust controls, anti-goals, visual direction, desired user feeling, concrete content, and screen-bound acceptance criteria.",
          "quality_rubric.prompt_paragraph_quality must record pass/fail evidence for product context, target user, journey, screens/components, interaction/system response, concrete content, trust/user control, visual direction, anti-goals, desired user feeling, and the perspective engine.",
          "prompt_text_manifest.paragraph_quality_status must be pass before /ow:prompt2proto handoff, with paragraph_quality_dimensions listing the dimensions that were checked.",
        ],
      },
      {
        tag: "product_experience_model",
        items: [
          "Before directions, write product_experience_model with product_archetype, primary_canvas, information_architecture, domain_object_model, primary_task_loop, interaction_state_model, data_realism_requirements, visual_language, anti_generic_constraints, and category_quality_bar.",
          "Use the model to preserve target product category reality from VISION-only input.",
          "Do not treat modules, scenarios, layers, workflows, or interaction states as separate strategic directions unless they imply different product forms or loops.",
          "Block generic AI dashboard, report-screen, or card-wall drift through anti_generic_constraints and negative_constraints.",
        ],
      },
      {
        tag: "prompt_pack_readiness_gate",
        items: [
          "prompt_text_manifest.status cannot become ready_for_image_generation until prompt_pack_integrity_gate.status is pass.",
          "prompt_text_manifest.status cannot become ready_for_image_generation until prototype_reality_gate.status is pass.",
          "prompt_text_manifest.status cannot become ready_for_image_generation until quality_rubric.prompt_executability.status is pass.",
          "prompt_text_manifest.status cannot become ready_for_image_generation until prompt_text_manifest.paragraph_quality_status is pass.",
          "prompt_text_manifest.status cannot become ready_for_image_generation until every direction screen_prompt target_screen_id resolves to screen_manifest.",
          "When a gate fails or is missing, set image_generation.status: not_started and repair through /ow:vision2prompt before handoff.",
        ],
      },
      {
        tag: "post_validate_gate",
        items: [
          "Run post_validate after prompt assets are ready and before /ow:prompt2proto handoff.",
          "For resolved_count 2 or more, require post_validate.status: pass before image generation.",
          "For resolved_count 1 from explicit user input, set post_validate.status: skipped and record why the diversity gate did not run.",
          "For post_validate.status: fail, repair strategic prompt directions inside /ow:vision2prompt instead of invoking /ow:prompt2proto.",
        ],
      },
    ],
    handoffCommands: ["/ow:prompt2proto"],
  };
}

function buildProtoPromptProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "internal-build-proto-prompt-pack-compiler",
    requiredContext: [
      ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
      ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
      ".openworkflow/vision/VISION_CONTRACT.yaml",
      ".openworkflow/vision/VISION.md",
      ".openworkflow/validation/**/VALIDATION.yaml",
    ],
    optionalContext: [
      ".openworkflow/context/CONTEXT.md",
      ".openworkflow/context/CONTEXT_MAP.yaml",
      ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
      "skills/build-proto-prompt/SKILL.md",
      "skills/build-proto-prompt/references/prompt-pack-compiler-protocol.md",
      "skills/build-proto-prompt/references/output-boundary.md",
    ],
    forbiddenContext: [".openworkflow/runtime/**", ".openworkflow/changes/**", ".openworkflow/specs/**"],
    allowedOutputs: [
      ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
      ".openworkflow/prototypes/<id>/PROTO_PROMPT_PACK.yaml",
      ".openworkflow/prototypes/<id>/PROTO_PROMPT_PACK.md",
      ".openworkflow/prototypes/<id>/REVIEW_PLAN.md",
      ".openworkflow/prototypes/<id>/EVIDENCE.yaml",
      ".openworkflow/prototypes/<id>/NOTE.md",
    ],
    forbiddenOutputs: [
      ".openworkflow/prototypes/<id>/images/**",
      ".openworkflow/prototypes/<id>/review.html",
      ".openworkflow/specs/**",
      ".openworkflow/changes/**",
      ".openworkflow/runtime/**",
    ],
    auditCheckpoints: {
      before: [
        "Run only as an internal prompt-pack compiler stage after /ow:proto preflight has confirmed vision and validation are ready.",
        "Load skills/build-proto-prompt/SKILL.md and its references before compiling PROTO_PROMPT_PACK.",
        "Adopt the Co-Founder plus Chief PM / senior product strategist perspective engine before generating directions.",
        "Resolve direction_count_policy before writing prompt text; do not silently default the direction count.",
        "Prepare to infer product_experience_model before strategic directions, including product archetype, primary canvas, information architecture, domain objects, state model, data realism, visual language, anti-generic constraints, and category quality bar.",
        "Prepare to write dailin-grade long-form prompt paragraphs; prompt text must include journey, interaction behavior, system response, trust controls, anti-goals, visual direction, desired user feeling, and concrete content.",
      ],
      during: [
        "Compile durable vision and validation into strategic_core, prototype_brief, product_experience_model, screen_manifest, global_design_system_prompt, directions, screen_prompts, review_plan, and readiness gates.",
        "Each selected direction must carry product_thesis, user_transformation, differentiated product form, reason_to_exist, and pm_judgment before screen prompt anatomy.",
        "Decide whether source concepts are separate strategic product forms or modules, layers, workflows, or states inside one product shell; do not split directions by scenario labels alone.",
        "Write complete multi-image prompt text for every selected direction with screen_prompts, negative_prompt, example_copy, and acceptance criteria tied to screen_manifest target_screen_id values.",
        "Populate prompt_pack_integrity_gate, prototype_reality_gate, quality_rubric.prompt_executability, quality_rubric.prompt_paragraph_quality, prompt_text_manifest.paragraph_quality_status, and post_validate before handoff.",
        "Keep image_generation.status: not_started while this compiler stage runs.",
      ],
      after: [
        "Write PROTO_PROMPT_PACK.yaml, PROTO_PROMPT_PACK.md, REVIEW_PLAN.md, and EVIDENCE.yaml with prompt_text_manifest.status ready_for_image_generation only when all readiness gates pass.",
        "Hand internally to /ow:prompt2proto only when prompt_pack_integrity_gate.status and prototype_reality_gate.status are pass, quality_rubric.prompt_executability.status is pass, prompt_text_manifest.paragraph_quality_status is pass, and post_validate.status is pass or skipped.",
        "If any readiness gate fails, keep handoff blocked and repair prompt directions through /ow:build-proto-prompt.",
        "Do not generate images; do not consume provider image output or prototype review artifacts.",
      ],
    },
    antiPatterns: [
      "Do not expose /ow:build-proto-prompt as a user-facing workflow step.",
      "Do not generate prototype images from this stage.",
      "Do not consume provider image output, human visual review, visual parity scores, proto2html artifacts, specs, changes, or runtime state.",
      "Do not invent strategy when vision or validation is thin; return control to /ow:proto preflight.",
      "Do not treat YAML field completion as quality when the prompt lacks product thesis, user transformation, reason-to-exist, or design philosophy.",
      "Do not hand off to /ow:prompt2proto when post_validate.status is fail or missing for multi-direction prompt packs.",
      "Do not hand off to /ow:prompt2proto when prompt_pack_integrity_gate, prototype_reality_gate, screen_manifest coverage, paragraph quality, or prompt executability is missing or failing.",
    ],
    internalSections: [
      {
        tag: "internal_command_boundary",
        items: [
          "/ow:build-proto-prompt is internal and is invoked by /ow:proto orchestration, not by the user.",
          "Its only job is prompt-pack compilation from ready vision and validation artifacts.",
          "Its output must be ready for prompt2proto consumption.",
          "Keep /ow:vision2prompt compatibility until a later migration candidate explicitly removes or aliases it.",
        ],
      },
      {
        tag: "prompt_pack_compiler_role",
        items: [
          "Start from a Co-Founder plus Chief PM / senior product strategist perspective before executing the prompt-pack compiler references.",
          "Ask what product should exist, why this prototype matters, which form best expresses the vision, and what user transformation should become visible.",
          "Every selected direction must include product_thesis, user_transformation, differentiated product form, reason_to_exist, and pm_judgment.",
          "Reject complete-but-soulless prompt paragraphs that list screens but do not make a product argument.",
        ],
      },
      {
        tag: "source_skill_reference",
        items: [
          "Load skills/build-proto-prompt/SKILL.md as the source behavior for this command.",
          "Load skills/build-proto-prompt/references/prompt-pack-compiler-protocol.md before writing prompt-pack outputs.",
          "Load skills/build-proto-prompt/references/output-boundary.md before handoff.",
          "The legacy vision2prompt references may be reused as detailed prompt-generation tools until the compiler references are fully split.",
        ],
      },
      {
        tag: "prompt_pack_readiness_gate",
        items: [
          "prompt_text_manifest.status cannot become ready_for_image_generation until prompt_pack_integrity_gate.status is pass.",
          "prompt_text_manifest.status cannot become ready_for_image_generation until prototype_reality_gate.status is pass.",
          "prompt_text_manifest.status cannot become ready_for_image_generation until quality_rubric.prompt_executability.status is pass.",
          "prompt_text_manifest.status cannot become ready_for_image_generation until prompt_text_manifest.paragraph_quality_status is pass.",
          "prompt_text_manifest.status cannot become ready_for_image_generation until every direction screen_prompt target_screen_id resolves to screen_manifest.",
          "When a gate fails or is missing, set image_generation.status: not_started and repair through /ow:build-proto-prompt before handoff.",
        ],
      },
      {
        tag: "downstream_boundary",
        items: [
          "Do not generate images.",
          "Do not perform human visual review.",
          "Do not claim visual reference parity.",
          "Do not create proto2html, specs, changes, or runtime artifacts.",
          "Do not narrow build-prototype behavior in this command-boundary candidate.",
        ],
      },
    ],
    handoffCommands: ["/ow:prompt2proto"],
  };
}

function prompt2ProtoProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "internal-prompt-text-to-prototype-images",
    requiredContext: [
      ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
      ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
      ".openworkflow/prototypes/**/PROTO_PROMPT_PACK.yaml",
      ".openworkflow/prototypes/**/EVIDENCE.yaml",
    ],
    optionalContext: [
      ".openworkflow/validation/**/VALIDATION.yaml",
      ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
      ".openworkflow/prototypes/**/NOTE.md",
    ],
    forbiddenContext: [".openworkflow/runtime/**", ".openworkflow/changes/**", ".openworkflow/specs/**"],
    allowedOutputs: [
      ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
      ".openworkflow/prototypes/<id>/EVIDENCE.yaml",
      ".openworkflow/prototypes/<id>/NOTE.md",
      ".openworkflow/prototypes/<id>/images/**",
      ".openworkflow/decisions/DECISION_INDEX.yaml",
      ".openworkflow/decisions/<id>/DECISION.yaml",
      ".openworkflow/decisions/<id>/NOTE.md",
    ],
    forbiddenOutputs: [
      ".openworkflow/prototypes/<id>/review.html",
      ".openworkflow/specs/**",
      ".openworkflow/changes/**",
      ".openworkflow/runtime/**",
    ],
    auditCheckpoints: {
      before: [
        "Run only as an internal stage after /ow:vision2prompt has written prompt_text_manifest.status ready_for_image_generation, prompt_text_manifest.paragraph_quality_status pass, and post_validate.status pass or skipped.",
        "Load prepared prompt text and verify every selected direction has screen_prompts before image generation.",
        "Verify prompt_pack_integrity_gate.status: pass, prototype_reality_gate.status: pass, quality_rubric.prompt_executability.status: pass, prompt_text_manifest.paragraph_quality_status: pass, and screen_manifest linkage before image generation.",
        "Block image generation when prompt_pack_integrity_gate, prototype_reality_gate, prompt executability, paragraph quality, screen_manifest linkage, or post_validate is fail or missing.",
      ],
      during: [
        "Batch-generate high-fidelity prototype images by direction_id and prompt_id.",
        "Write one metadata record for every generated image with image_id, direction_id, prompt_id, screen_name, path, source_prompt_ref, generator, and status.",
        "Do not revise product strategy or prompt text during image generation.",
      ],
      after: [
        "Update image_generation.status, generated_images, collection_notes, and internal_pipeline stage prompt2proto outputs.",
        "Record decision audit internally after image evidence changes.",
        "Hand the user-facing flow back to /ow:proto for summary and next command.",
      ],
    },
    antiPatterns: [
      "Do not expose /ow:prompt2proto as a user-facing workflow step.",
      "Do not start image generation when prompt text is not ready.",
      "Do not start image generation when prompt_text_manifest.paragraph_quality_status is missing, fail, or unchecked.",
      "Do not start image generation when prompt_pack_integrity_gate or prototype_reality_gate is missing or failing.",
      "Do not start image generation when screen prompts are detached from screen_manifest or prompt executability has not passed.",
      "Do not create HTML, specs, changes, or runtime artifacts.",
      "Do not allow generated images without per-image metadata.",
    ],
    internalSections: [
      {
        tag: "prompt_pack_readiness_gate",
        items: [
          "Refuse prompt packs whose prompt_pack_integrity_gate.status is not pass.",
          "Refuse prompt packs whose prototype_reality_gate.status is not pass.",
          "Refuse prompt packs whose quality_rubric.prompt_executability.status is not pass.",
          "Refuse prompt packs whose prompt_text_manifest.paragraph_quality_status is not pass.",
          "Refuse prompt packs whose screen_prompts[].prompt paragraphs omit journey, interaction behavior, system response, trust controls, anti-goals, visual direction, desired user feeling, or concrete content.",
          "Refuse prompt packs whose direction screen_prompts do not resolve to screen_manifest target_screen_id values.",
          "When a prompt pack is refused, keep image_generation.status: not_started and hand back to /ow:vision2prompt repair.",
        ],
      },
      {
        tag: "image_metadata_contract",
        items: [
          "Every generated image must record image_id, direction_id, prompt_id, screen_name, path, and metadata.",
          "metadata must include source_prompt_ref, generated_at, generator, generation_status, and review_status.",
          "Images without metadata are not valid prototype evidence.",
        ],
      },
    ],
    handoffCommands: ["/ow:proto"],
  };
}

function tuneProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "screen-bound-prototype-refinement",
    requiredContext: [
      ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
      ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
    ],
    optionalContext: [
      ".openworkflow/validation/VALIDATION_INDEX.yaml",
      ".openworkflow/validation/**/VALIDATION.yaml",
      ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
      ".openworkflow/prototypes/**/EVIDENCE.yaml",
      ".openworkflow/prototypes/**/PROTO_PROMPT_PACK.yaml",
      ".openworkflow/prototypes/**/REFINED_PROTO_PROMPT_PACK.yaml",
      ".openworkflow/prototypes/**/NOTE.md",
      ".openworkflow/decisions/DECISION_INDEX.yaml",
      ".openworkflow/decisions/**/DECISION.yaml",
      "package.json",
    ],
    forbiddenContext: [".openworkflow/runtime/**", ".openworkflow/changes/**", ".openworkflow/specs/**"],
    allowedOutputs: [
      ".openworkflow/prototypes/PROTOTYPE_INDEX.yaml",
      ".openworkflow/prototypes/<id>/REFINED_PROTO_PROMPT_PACK.yaml",
      ".openworkflow/prototypes/<id>/REFINED_PROTO_PROMPT_PACK.md",
      ".openworkflow/prototypes/<id>/REVIEW_PLAN.md",
      ".openworkflow/prototypes/<id>/EVIDENCE.yaml",
      ".openworkflow/prototypes/<id>/NOTE.md",
      ".openworkflow/prototypes/<id>/images/**",
      ".openworkflow/decisions/DECISION_INDEX.yaml",
      ".openworkflow/decisions/<id>/DECISION.yaml",
      ".openworkflow/decisions/<id>/NOTE.md",
    ],
    forbiddenOutputs: [
      ".openworkflow/prototypes/<id>/review.html",
      ".openworkflow/specs/**",
      ".openworkflow/changes/**",
      ".openworkflow/runtime/**",
    ],
    auditCheckpoints: {
      before: [
        "Resolve tune target: /ow:tune defaults to the latest approved prototype prompt pack, refined prompt pack, or accepted baseline screen group.",
        "Require baseline screens, screenshots, screen descriptions, generated images, or an accepted PROTO_PROMPT_PACK plus a tune request.",
        "Normalize tune inputs before baseline audit: baseline source type, baseline refs, tune request, target form factor, regeneration scope, screen count, locked screens, locked elements, and constraints.",
        "Record baseline_resolution before auditing: latest approved baseline group id, latest approved baseline ref, lineage, resolution rule, and stale source guard.",
        "Assign stable source screen ids and target screen ids when the baseline or request does not provide them.",
        "Load only the baseline prompt pack, current prototype evidence, relevant validation or vision context, and latest decision audit context.",
      ],
      during: [
        "Audit the full baseline screen group before writing refined prompts.",
        "Carry forward locked screens, locked elements, and accepted improvements from previous tune passes unless the current user request explicitly unlocks them.",
        "Extract the product system and preserve product thesis, primary loop, component vocabulary, copy tone, AI/system behavior, trust boundaries, and user controls.",
        "Interpret the tune request as visual refinement, brand alignment, screen-specific correction, feature addition, feature removal, form-factor transformation, group expansion, group compression, IA adaptation, copy/localization adjustment, interaction-state coverage, design-system pass, or selected-screen regeneration.",
        "Detect conflicts between the tune request, locked elements, product boundaries, non-goals, privacy controls, safety boundaries, and accepted prototype evidence before prompt writing.",
        "Write MUST_INHERIT, MUST_ADD, MUST_REMOVE, and FLEXIBLE_CHANGE rules globally and per target screen.",
        "Build a screen_delta_matrix that binds each target screen to source screen ids, preserve/add/remove/transform/flexible rules, and acceptance criteria.",
        "Bind every refined prompt to target screen id, source screen id(s), generation scope, target form factor, negative constraints, and acceptance criteria.",
        "Write generation_order and acceptance_checklist so downstream generation agents can run the refined prompt pack without guessing.",
        "Record decision audit outcome as revise, continue, pivot, stop, or needs_more_evidence.",
      ],
      after: [
        "Write REFINED_PROTO_PROMPT_PACK.yaml, REFINED_PROTO_PROMPT_PACK.md, REVIEW_PLAN.md, and compact EVIDENCE.yaml.",
        "Write or update the internal decision audit record.",
        "Refresh prototype SUMMARY.yaml and CURRENT_STATE.yaml after the revision outcome is known.",
        "Show the user only the tuning result, unresolved question if any, and the next user-facing command.",
      ],
    },
    antiPatterns: [
      "Do not ask the user to manually invoke /ow:decision during a tune loop.",
      "Do not restart full strategic prototype discovery when a focused refinement is enough.",
      "Do not tune from one representative screen when the input is a screen group unless the user explicitly limits scope.",
      "Do not silently drop accepted baseline controls, privacy affordances, memory controls, or non-goals.",
      "Do not generate HTML, CSS, or runnable app work from /ow:tune.",
      "Do not create design, specs, changes, or runtime work from unaccepted tune evidence.",
      "Do not ignore the current validation scope when one is explicitly present and accepted for the prototype.",
    ],
    internalSections: [
      {
        tag: "target_resolution",
        items: [
          "/ow:tune resolves to the latest approved prototype prompt pack, refined prompt pack, or accepted baseline screen group by default.",
          "/ow:tune:proto is an explicit alias for tuning the current prototype.",
          "If no baseline prototype exists, return to /ow:proto instead of inventing refinement context.",
        ],
      },
      {
        tag: "multi_round_baseline_inheritance",
        items: [
          "Before baseline audit, write baseline_resolution with latest_approved_baseline_group_id, latest_approved_baseline_ref, baseline_lineage, resolution_rule, and stale_source_guard.",
          "Use the latest approved baseline group by default; only use an older source screen group when the user explicitly names it.",
          "Write carry_forward with locked_screens, locked_elements, preserved_improvements, explicit_unlocks, and cumulative_drift_guard.",
          "Carry forward accepted improvements and locked elements across tune rounds unless the tune request explicitly unlocks or removes them.",
          "Never silently regenerate from stale source screens when a newer accepted tune pass exists.",
        ],
      },
      {
        tag: "input_normalization",
        items: [
          "Normalize baseline_source_type, baseline_refs, tune_request, target_form_factor, regeneration_scope, target_screen_count, locked_screens, locked_elements, output_language, target_tool, and constraints before audit.",
          "Assign source ids such as SRC_M01, SRC_W01, or SRC_01 when baseline screens lack stable ids.",
          "Assign target ids such as MOB_S01, WEB_S01, TAB_S01, or VAR_A_S01 before writing screen-bound prompts.",
        ],
      },
      {
        tag: "baseline_screen_audit",
        items: [
          "For each source screen, record screen id, screen name, journey stage, user goal, system state, components, copy tone, represented feature, AI/system behavior, trust controls, visual cues, must-preserve elements, platform artifacts to transform or remove, and assumptions.",
          "Treat the screen group as one product system, not unrelated images.",
          "State excluded source screens explicitly when the user limits scope.",
        ],
      },
      {
        tag: "product_system_extraction",
        items: [
          "Extract product thesis, target user, core behavior, primary product loop, brand promise, interaction model, information architecture, design language, component vocabulary, copywriting style, feature system, trust and boundary system, and anti-goals.",
          "Separate stable_constants from adaptable_variables before interpreting the tune request.",
          "Preserve product meaning and interaction logic over raw geometry when adapting form factors.",
        ],
      },
      {
        tag: "tune_request_interpretation",
        items: [
          "Classify the request into visual refinement, brand alignment, screen-specific correction, feature addition, feature removal, form-factor transformation, screen group expansion, screen group compression, layout or IA adaptation, copy/localization adjustment, interaction-state coverage, design-system pass, or selected-screen regeneration.",
          "Apply conflict priority in this order: latest explicit user request, hard constraints, product vision/non-goals/privacy/safety/trust boundaries, locked screens or elements, baseline product system, original upstream prompt, then agent aesthetic judgment.",
          "If a request conflicts with a product boundary or locked constraint, record the conflict and generate the closest valid alternative instead of drifting silently.",
        ],
      },
      {
        tag: "inheritance_delta_rules",
        items: [
          "Build MUST_INHERIT, MUST_ADD, MUST_REMOVE, and FLEXIBLE_CHANGE buckets before writing prompts.",
          "Requested removals must appear in global negative constraints, per-screen negative constraints, and acceptance checks.",
          "Flexible changes must remain inside the product thesis, brand promise, non-goals, and screen purpose.",
          "Build screen_delta_matrix rows with target screen id, source screen ids, preserve, add, remove, transform, flexible, and acceptance criteria.",
        ],
      },
      {
        tag: "screen_manifest",
        items: [
          "Preserve target screen ids across rounds unless screens are deleted, split, merged, or explicitly renamed.",
          "Every screen prompt must include prompt_id, target_screen_id, screen_name, source_screen_ids, target form factor, generation scope, dependencies, prompt, negative prompt, and acceptance criteria.",
          "Do not output anonymous prompts that downstream generation cannot map back to screens.",
        ],
      },
      {
        tag: "refined_prompt_pack_output",
        items: [
          "Output Baseline System Summary, Tuning Intent Summary, Inheritance and Delta Rules, Screen Mapping / Prompt Manifest, Global Design System Prompt, Screen-Specific Refined Prompts, Negative Prompt / Exclusion Rules, Generation Order, and Acceptance Checklist.",
          "Every screen-specific refined prompt must be standalone and bound to a target screen id plus source screen ids.",
          "Output prompt text only unless a later internal generation stage is explicitly selected; /ow:tune itself does not generate images.",
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
      after: [
        "Write the decision record.",
        "Update CURRENT_STATE.yaml last_decision and next_command.",
        "Set prototype status to accepted only when outcome is continue, revise_requested when outcome is revise, or superseded when pivoted.",
        "Authorize /ow:design only when outcome is continue.",
        "Return control to the user-facing proto or tune command.",
      ],
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
        "Refresh design SUMMARY.yaml when summary_policy is configured and update CURRENT_STATE.yaml with current_design and spec readiness.",
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

function specProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "accepted-design-to-production-spec",
    requiredContext: [
      ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
      ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
      ".openworkflow/design/DESIGN_INDEX.yaml",
    ],
    optionalContext: [
      ".openworkflow/design/**/PRODUCT_DESIGN.yaml",
      ".openworkflow/design/**/TECH_SPEC.yaml",
      ".openworkflow/design/**/FRONTEND_SPEC.yaml",
      ".openworkflow/design/**/BACKEND_SPEC.yaml",
      ".openworkflow/design/**/API_CONTRACT.yaml",
      ".openworkflow/design/**/DB_SCHEMA_MODEL.yaml",
      ".openworkflow/specs/SPEC_INDEX.yaml",
      "AGENT.md",
      "package.json",
    ],
    forbiddenContext: [".openworkflow/runtime/**", ".openworkflow/changes/**"],
    allowedOutputs: [
      ".openworkflow/specs/SPEC_INDEX.yaml",
      ".openworkflow/specs/<id>/SPEC.yaml",
      ".openworkflow/specs/<id>/NOTE.md",
    ],
    forbiddenOutputs: [".openworkflow/changes/**", ".openworkflow/runtime/**"],
    auditCheckpoints: {
      before: [
        "Confirm a product design exists and spec_readiness.ready is true.",
        "Load only the current design and any conditional design packets named by that design.",
        "Lazy-create the specs index and spec artifact only when /ow:spec is invoked.",
      ],
      during: [
        "Translate accepted product behavior into one implementable production slice.",
        "Preserve traceability to design evidence, accepted scope, and known blockers.",
        "Separate user-facing requirements, technical constraints, interfaces, acceptance criteria, and verification plan.",
      ],
      after: [
        "Write the spec artifact and update SPEC_INDEX.yaml.",
        "Refresh spec SUMMARY.yaml when summary_policy is configured and update CURRENT_STATE.yaml with current_spec and change readiness.",
        "Hand off to /ow:change only when the spec has bounded scope, acceptance, and verification.",
        "Confirm no change or runtime artifacts were created.",
      ],
    },
    antiPatterns: [
      "Do not create specs from unaccepted or unready product design.",
      "Do not turn a broad product design into a multi-feature implementation plan.",
      "Do not create change or runtime artifacts during spec work.",
      "Do not precreate spec artifacts during init or sync; create them only on /ow:spec.",
    ],
    internalSections: [
      {
        tag: "lazy_create",
        items: [
          "OpenWorkflow init is minimal: it creates only workflow, audit, and config files.",
          "If .openworkflow/specs/ or SPEC_INDEX.yaml is absent, create it during /ow:spec from ARTIFACT_CONTRACTS.yaml.",
          "Do not create unrelated stage directories, templates, changes, or runtime files while authoring the spec.",
        ],
      },
      {
        tag: "spec_quality_bar",
        items: [
          "A production spec must be enough for an implementation agent to work without rereading the full discovery history.",
          "Name the exact scope, affected user behavior, interface contracts, non-goals, acceptance checks, verification commands, and risks.",
          "Keep rationale compact and reference source artifacts by path instead of copying long evidence.",
        ],
      },
      {
        tag: "readiness_gate",
        items: [
          "Do not hand off to /ow:change until implementation scope, acceptance, and test plan are explicit.",
          "If design packets are missing or contradictory, ask one focused question or hand back to /ow:design.",
        ],
      },
    ],
    handoffCommands: ["/ow:change", "/ow:design"],
  };
}

function changeProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "production-change-planning",
    requiredContext: [
      ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
      ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
      ".openworkflow/specs/SPEC_INDEX.yaml",
    ],
    optionalContext: [
      ".openworkflow/specs/**/SPEC.yaml",
      ".openworkflow/specs/**/NOTE.md",
      ".openworkflow/changes/CHANGE_INDEX.yaml",
      "AGENT.md",
      "package.json",
    ],
    forbiddenContext: [".openworkflow/runtime/**"],
    allowedOutputs: [
      ".openworkflow/changes/CHANGE_INDEX.yaml",
      ".openworkflow/changes/<id>/CHANGE.yaml",
      ".openworkflow/changes/<id>/NOTE.md",
      ".openworkflow/changes/<id>/WORK_ITEMS.yaml",
    ],
    forbiddenOutputs: [".openworkflow/runtime/**"],
    auditCheckpoints: {
      before: [
        "Confirm a focused production spec exists.",
        "Inspect the repository just enough to identify affected paths, integration points, and verification commands.",
        "Lazy-create the changes index, change artifact, and work items only when /ow:change is invoked.",
      ],
      during: [
        "Convert the spec into one bounded implementation change with non-goals and rollback notes.",
        "Split work into ordered items with owned paths, dependencies, acceptance, and verification.",
        "Record unresolved implementation risks instead of expanding scope.",
      ],
      after: [
        "Write CHANGE.yaml, WORK_ITEMS.yaml, and CHANGE_INDEX.yaml.",
        "Refresh change SUMMARY.yaml when summary_policy is configured and update CURRENT_STATE.yaml with current_change and runtime readiness.",
        "Hand off to /ow:team only when work items are implementable and verification is explicit.",
        "Confirm no runtime artifacts were created.",
      ],
    },
    antiPatterns: [
      "Do not implement product code during /ow:change.",
      "Do not create runtime or agent team files before the change plan is accepted.",
      "Do not plan work that is not traceable to the current spec.",
      "Do not precreate change artifacts during init or sync; create them only on /ow:change.",
    ],
    internalSections: [
      {
        tag: "lazy_create",
        items: [
          "OpenWorkflow init is minimal and does not create .openworkflow/changes/.",
          "If CHANGE_INDEX.yaml is absent, create it together with the first change artifact during /ow:change.",
          "Create WORK_ITEMS.yaml only for the active change, not as a global task backlog.",
        ],
      },
      {
        tag: "planning_quality_bar",
        items: [
          "A change plan must let an implementation agent start with bounded files, ordered tasks, acceptance checks, and rollback awareness.",
          "Prefer small coherent work items with explicit owned_paths and verification over broad task buckets.",
          "Keep the user-facing summary short and keep detailed implementation intelligence in the artifacts.",
        ],
      },
      {
        tag: "readiness_gate",
        items: [
          "Do not hand off to /ow:team until CHANGE.yaml and WORK_ITEMS.yaml agree on scope and verification.",
          "If the spec is too broad or thin, ask one focused question or hand back to /ow:spec.",
        ],
      },
    ],
    handoffCommands: ["/ow:team", "/ow:spec"],
  };
}

function teamProtocol(): CommandProtocol {
  return {
    depth: "deep",
    interactionMode: "approved-change-team-execution",
    requiredContext: [
      ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
      ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
      ".openworkflow/changes/CHANGE_INDEX.yaml",
    ],
    optionalContext: [
      ".openworkflow/changes/**/CHANGE.yaml",
      ".openworkflow/changes/**/WORK_ITEMS.yaml",
      ".openworkflow/runtime/RUNTIME_INDEX.yaml",
      ".openworkflow/runtime/**/STATE.yaml",
      "AGENT.md",
      "package.json",
    ],
    forbiddenContext: [],
    allowedOutputs: [
      ".openworkflow/runtime/RUNTIME_INDEX.yaml",
      ".openworkflow/runtime/<id>/STATE.yaml",
      ".openworkflow/runtime/<id>/NOTE.md",
      ".openworkflow/runtime/<id>/ISSUES.yaml",
      ".openworkflow/runtime/<id>/CHECKPOINTS.yaml",
    ],
    forbiddenOutputs: [],
    auditCheckpoints: {
      before: [
        "Confirm an approved or active change plan and work items exist.",
        "Audit git status, relevant source files, and any existing runtime state before execution.",
        "Lazy-create runtime state only when /ow:team is invoked for an approved change.",
      ],
      during: [
        "Execute work items in dependency order and keep runtime state current.",
        "Delegate only when the task can run independently with clear owned paths and acceptance.",
        "Record issues, verification results, checkpoints, and residual risks as development proceeds.",
      ],
      after: [
        "Update runtime state, issues, and checkpoints.",
        "Refresh runtime SUMMARY.yaml when summary_policy is configured and update CURRENT_STATE.yaml with current_run, blockers, and next action.",
        "Run the verification named by the change plan when practical.",
        "Report changed artifacts, verification result, and remaining blockers.",
      ],
    },
    antiPatterns: [
      "Do not start runtime work without a current change plan and work items.",
      "Do not create team runtime during init, sync, spec, or change planning.",
      "Do not leave delegated work without ownership, acceptance, or status.",
      "Do not hide failed verification; record it in runtime issues or checkpoints.",
    ],
    internalSections: [
      {
        tag: "lazy_create",
        items: [
          "OpenWorkflow init is minimal and does not create .openworkflow/runtime/.",
          "Create RUNTIME_INDEX.yaml and the first runtime state only when /ow:team begins approved execution.",
          "If runtime already exists, reconcile it instead of replacing historical state.",
        ],
      },
      {
        tag: "execution_quality_bar",
        items: [
          "Team runtime must preserve enough state for another agent to continue without reading the full conversation.",
          "Track active change, active work item, assigned owner or agent, status, verification, issues, and checkpoints.",
          "Keep implementation and QA evidence linked to the change plan.",
        ],
      },
      {
        tag: "handoff_gate",
        items: [
          "When work is incomplete, leave the next action and blocker explicit in runtime state.",
          "When work is complete, record verification and checkpoint readiness before final handoff.",
        ],
      },
    ],
    handoffCommands: ["/ow:change"],
  };
}
