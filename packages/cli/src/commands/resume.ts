import { resolve } from "node:path";
import { buildSummaryQualitySummary, evaluateSummaryQualityGate, type SummaryQualitySummary } from "../../../core/src/workflow/summaryHealth.js";
import { booleanFlag, stringFlag } from "../args.js";
import { emptyEffects, printJsonReport } from "../report.js";
import { buildBriefModel, type BriefModel } from "./brief.js";
import { buildReadiness, type ReadinessModel } from "./check.js";
import { buildHandoffModel, type HandoffModel } from "./handoff.js";
import { buildInspectModel, type ReadOrder } from "./inspect.js";
import { parseTools } from "./shared.js";

export interface ResumeModel {
  resume_version: "0.1.0";
  project: BriefModel["project"];
  command_boundary: {
    read_only: true;
    writes: [];
    allowed_commands: string[];
    forbidden_operations: string[];
    deferred_capabilities: string[];
  };
  trust: {
    handoff_ok: boolean;
    blocking_reasons: string[];
    managed_surface_ok: boolean;
    adapter_ok: boolean;
    summary_freshness_ok: boolean;
    summary_quality_ok: boolean;
    next_command_ready: boolean | null;
    quality_summary: SummaryQualitySummary;
  };
  workflow: {
    active_stage: string | null;
    next_command: string | null;
    active_pointers: Record<string, string | null>;
    read_order: ReadOrder;
    next_command_check: ReadinessModel | null;
  };
  active_queue: DeferredResumeSection;
  current_work_item: DeferredResumeSection;
  actions: {
    immediate: string[];
    allowed_next_steps: string[];
    stop_if: string[];
  };
  evidence: {
    primary_context: string[];
    raw_evidence_only_if: string[];
    missing_or_unknown: string[];
  };
  git: BriefModel["git"];
  sources: string[];
}

export interface DeferredResumeSection {
  status: "unknown";
  reason: string;
  deferred_to: string;
  known_fields: Record<string, string | null>;
}

export async function resumeCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const json = booleanFlag(flags, "json");
  const brief = await buildBriefModel(root, parseTools(stringFlag(flags, "tools")));
  const nextCommand = brief.workflow.next_command;
  const nextCommandCheck = nextCommand ? await buildReadiness(root, nextCommand) : null;
  const strictQuality = evaluateSummaryQualityGate(brief.health.summaries, true);
  const inspect = buildInspectModel(brief, nextCommandCheck, strictQuality);
  const qualitySummary = buildSummaryQualitySummary(brief.health.summaries, strictQuality);
  const handoff = buildHandoffModel(brief, nextCommandCheck, inspect.read_order, qualitySummary);
  const model = buildResumeModel(brief, nextCommandCheck, handoff);
  const warnings = warningsFor(brief, nextCommandCheck, model);
  const healthErrors = model.trust.handoff_ok ? [] : model.trust.blocking_reasons;

  if (json) {
    printJsonReport({
      command: "resume",
      ok: model.trust.handoff_ok,
      root,
      data: model,
      warnings,
      errors: healthErrors,
      health_errors: healthErrors,
      effects: emptyEffects(),
      next_actions: model.actions.immediate,
    });
  } else {
    printResume(model);
  }
  return model.trust.handoff_ok ? 0 : 1;
}

function buildResumeModel(brief: BriefModel, nextCommandCheck: ReadinessModel | null, handoff: HandoffModel): ResumeModel {
  const activeQueue = deferredSection("active queue detection is deferred to C003", "M106-C003-detect-active-planning-queue-and-current-work-item", {
    next_command: handoff.next_command,
    active_stage: handoff.active_stage,
  });
  const currentWorkItem = deferredSection("current work item detection is deferred to C003", "M106-C003-detect-active-planning-queue-and-current-work-item", {
    selected_change_id: null,
    candidate_id: null,
  });
  return {
    resume_version: "0.1.0",
    project: brief.project,
    command_boundary: {
      read_only: true,
      writes: [],
      allowed_commands: [
        "openworkflow handoff --root . --json",
        "openworkflow inspect --root . --strict --json",
        "openworkflow context --root . --handoff --json",
        "openworkflow check <next_command> --root . --json",
        "openworkflow summaries --root . --strict --json",
        "git status --short --branch",
      ],
      forbidden_operations: [
        "mutate .openworkflow/CURRENT_STATE.yaml",
        "refresh SUMMARY.yaml files",
        "select, reprioritize, or complete candidate changes",
        "stage or commit files",
        "push, open PRs, or mutate remote state",
      ],
      deferred_capabilities: [
        "active planning queue detection",
        "selected-change/current-work-item detection",
        "Agent action and evidence classification",
        "runtime documentation beyond the executable CLI surface",
      ],
    },
    trust: {
      handoff_ok: handoff.handoff_ok,
      blocking_reasons: handoff.blocking_reasons,
      managed_surface_ok: handoff.managed_surface_ok,
      adapter_ok: handoff.adapter_ok,
      summary_freshness_ok: handoff.summary_freshness_ok,
      summary_quality_ok: handoff.summary_quality_ok,
      next_command_ready: handoff.next_command_ready,
      quality_summary: handoff.quality_summary,
    },
    workflow: {
      active_stage: handoff.active_stage,
      next_command: handoff.next_command,
      active_pointers: handoff.active_pointers,
      read_order: handoff.read_order,
      next_command_check: nextCommandCheck,
    },
    active_queue: activeQueue,
    current_work_item: currentWorkItem,
    actions: {
      immediate: immediateActionsFor(handoff, brief),
      allowed_next_steps: allowedNextStepsFor(handoff),
      stop_if: stopConditionsFor(handoff, brief),
    },
    evidence: {
      primary_context: primaryContextFor(handoff.read_order),
      raw_evidence_only_if: handoff.read_order.raw_evidence_only_if,
      missing_or_unknown: [
        "active planning queue",
        "selected candidate/current work item",
        "candidate-specific validation evidence",
      ],
    },
    git: brief.git,
    sources: [
      "brief",
      "inspect --strict",
      "handoff",
      ...(nextCommandCheck ? ["check <next_command>"] : []),
      "summaries --strict",
      "git status --porcelain",
    ],
  };
}

function deferredSection(reason: string, deferredTo: string, knownFields: Record<string, string | null>): DeferredResumeSection {
  return {
    status: "unknown",
    reason,
    deferred_to: deferredTo,
    known_fields: knownFields,
  };
}

function immediateActionsFor(handoff: HandoffModel, brief: BriefModel): string[] {
  if (handoff.handoff_ok) {
    return unique([
      ...handoff.next_actions,
      brief.git.dirty ? "inspect git.changed_files before editing; preserve existing uncommitted work" : "",
    ]);
  }
  return unique([
    "stop implementation until trust blockers are resolved",
    ...handoff.next_actions,
  ]);
}

function allowedNextStepsFor(handoff: HandoffModel): string[] {
  if (!handoff.handoff_ok) {
    return [
      "read blocking_reasons",
      "run the recommended maintenance/read-only diagnostics",
      "resume only after handoff_ok is true",
    ];
  }
  return unique([
    "load only workflow.read_order.must_read first",
    "continue with workflow.next_command after checking output boundaries",
    "load raw evidence only when evidence.raw_evidence_only_if applies",
  ]);
}

function stopConditionsFor(handoff: HandoffModel, brief: BriefModel): string[] {
  return unique([
    ...handoff.blocking_reasons,
    ...brief.workflow.blocked_by.map((item) => `CURRENT_STATE blocked_by: ${item}`),
    brief.git.dirty ? "git worktree has uncommitted changes; classify ownership before editing" : "",
    "active_queue.status is unknown and the task requires queue-specific mutation",
  ]);
}

function primaryContextFor(readOrder: ReadOrder): string[] {
  return unique([
    ...readOrder.must_read,
    "openworkflow resume --root . --json",
  ]);
}

function warningsFor(brief: BriefModel, nextCommandCheck: ReadinessModel | null, model: ResumeModel): string[] {
  return unique([
    ...brief.health.workflow.warnings,
    ...brief.health.agents_md.warnings,
    ...Object.values(brief.health.adapters).flatMap((section) => section.warnings),
    ...brief.health.summaries.warnings,
    ...nextCommandCheck?.warnings ?? [],
    model.active_queue.reason,
    model.current_work_item.reason,
  ]);
}

function printResume(model: ResumeModel): void {
  console.log(`OpenWorkflow resume for ${model.project.title}`);
  console.log(`root: ${model.project.root}`);
  console.log(`handoff_ok: ${model.trust.handoff_ok}`);
  console.log(`active_stage: ${model.workflow.active_stage ?? "unknown"}`);
  console.log(`next_command: ${model.workflow.next_command ?? "none"}`);
  console.log(`next_command_ready: ${model.trust.next_command_ready ?? "unknown"}`);
  console.log(`active_queue: ${model.active_queue.status} (${model.active_queue.reason})`);
  console.log(`current_work_item: ${model.current_work_item.status} (${model.current_work_item.reason})`);
  console.log(`git: available=${model.git.available}, branch=${model.git.branch ?? "none"}, dirty=${model.git.dirty}`);
  printList("blocking_reasons", model.trust.blocking_reasons);
  printList("must_read", model.workflow.read_order.must_read);
  printList("immediate_actions", model.actions.immediate);
}

function printList(label: string, values: string[]): void {
  console.log(`${label}:`);
  for (const value of values.length > 0 ? values : ["none"]) {
    console.log(`  - ${value}`);
  }
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}
