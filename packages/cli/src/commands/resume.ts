import { resolve } from "node:path";
import { buildPlanningQueueResume, type ActivePlanningQueue, type CurrentWorkItem, type UnknownCurrentWorkItem, type UnknownPlanningQueue } from "../../../core/src/workflow/planningQueueResume.js";
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
  active_queue: ActivePlanningQueue | UnknownPlanningQueue;
  current_work_item: CurrentWorkItem | UnknownCurrentWorkItem;
  actions: {
    immediate: string[];
    allowed_next_steps: string[];
    allowed_actions: string[];
    forbidden_actions: string[];
    stop_conditions: string[];
    stop_if: string[];
  };
  evidence: {
    primary_context: string[];
    primary: string[];
    auxiliary: string[];
    comparison: string[];
    raw_evidence_only_if: string[];
    missing_or_unknown: string[];
  };
  product_alignment: {
    active_pointers: Record<string, string | null>;
    available_context: string[];
    missing_context: string[];
  };
  git: BriefModel["git"];
  sources: string[];
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
  const planningQueue = await buildPlanningQueueResume(root, brief.git.branch);
  const model = buildResumeModel(brief, nextCommandCheck, handoff, planningQueue);
  const warnings = warningsFor(brief, nextCommandCheck, model, planningQueue.warnings);
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

function buildResumeModel(
  brief: BriefModel,
  nextCommandCheck: ReadinessModel | null,
  handoff: HandoffModel,
  planningQueue: Awaited<ReturnType<typeof buildPlanningQueueResume>>,
): ResumeModel {
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
    active_queue: planningQueue.active_queue,
    current_work_item: planningQueue.current_work_item,
    actions: {
      immediate: immediateActionsFor(handoff, brief, planningQueue.current_work_item),
      allowed_next_steps: allowedNextStepsFor(handoff),
      allowed_actions: allowedActionsFor(handoff, planningQueue.current_work_item),
      forbidden_actions: forbiddenActionsFor(nextCommandCheck, planningQueue.current_work_item),
      stop_conditions: stopConditionsFor(handoff, brief, planningQueue.current_work_item),
      stop_if: stopConditionsFor(handoff, brief, planningQueue.current_work_item),
    },
    evidence: {
      primary_context: primaryContextFor(handoff.read_order),
      primary: primaryEvidenceFor(planningQueue.active_queue, planningQueue.current_work_item),
      auxiliary: auxiliaryEvidenceFor(planningQueue.active_queue, planningQueue.current_work_item),
      comparison: comparisonEvidenceFor(planningQueue.active_queue),
      raw_evidence_only_if: handoff.read_order.raw_evidence_only_if,
      missing_or_unknown: missingOrUnknownFor(planningQueue.active_queue, planningQueue.current_work_item),
    },
    product_alignment: productAlignmentFor(handoff.active_pointers),
    git: brief.git,
    sources: [
      "brief",
      "inspect --strict",
      "handoff",
      ...(nextCommandCheck ? ["check <next_command>"] : []),
      "summaries --strict",
      "git status --porcelain",
      ...planningQueue.sources,
    ],
  };
}

function missingOrUnknownFor(activeQueue: ResumeModel["active_queue"], currentWorkItem: ResumeModel["current_work_item"]): string[] {
  return unique([
    activeQueue.status === "unknown" ? "active planning queue" : "",
    currentWorkItem.status === "unknown" ? "selected candidate/current work item" : "",
    ...(activeQueue.status === "found" && activeQueue.commit_evidence.missing.length > 0 ? ["candidate-specific commit evidence"] : []),
  ]);
}

function immediateActionsFor(handoff: HandoffModel, brief: BriefModel, currentWorkItem: ResumeModel["current_work_item"]): string[] {
  if (handoff.handoff_ok) {
    return unique([
      currentWorkItem.status !== "unknown" ? currentWorkItem.next_action ?? "" : "",
      ...handoff.next_actions,
      brief.git.dirty ? "inspect git.changed_files before editing; preserve existing uncommitted work" : "",
    ]);
  }
  return unique([
    "stop implementation until trust blockers are resolved",
    currentWorkItem.status !== "unknown" ? currentWorkItem.next_action ?? "" : "",
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
    "use current_work_item.next_action when active_queue.status is found",
    "continue with workflow.next_command only when no queue-local action is available",
    "load raw evidence only when evidence.raw_evidence_only_if applies",
  ]);
}

function allowedActionsFor(handoff: HandoffModel, currentWorkItem: ResumeModel["current_work_item"]): string[] {
  if (!handoff.handoff_ok) {
    return ["repair trust blockers before implementation"];
  }
  if (currentWorkItem.status === "unknown") {
    return ["run read-only diagnostics until behavior boundary is known"];
  }
  return unique([
    currentWorkItem.next_action ?? "",
    currentWorkItem.status === "selected" ? "continue only the selected change" : "",
    currentWorkItem.status === "next_ready" ? "select the ready candidate before implementation" : "",
    ...currentWorkItem.owned_paths.map((path) => `edit owned path: ${path}`),
    ...currentWorkItem.validation_commands.map((command) => `run validation: ${command}`),
    currentWorkItem.commit_evidence.required ? "record local commit evidence through openworkflow git-automation commit" : "",
  ]);
}

function forbiddenActionsFor(nextCommandCheck: ReadinessModel | null, currentWorkItem: ResumeModel["current_work_item"]): string[] {
  const commandForbidden = nextCommandCheck?.forbidden_outputs.map((path) => `write forbidden command output: ${path}`) ?? [];
  if (currentWorkItem.status === "unknown") {
    return unique([
      "select or implement work before active queue/current work item is known",
      ...commandForbidden,
    ]);
  }
  return unique([
    ...currentWorkItem.forbidden_paths.map((path) => `edit forbidden path: ${path}`),
    ...currentWorkItem.scope.excludes.map((item) => `out of scope: ${item}`),
    ...commandForbidden,
    "push, create PRs, merge, or mutate remote state without explicit approval",
  ]);
}

function stopConditionsFor(handoff: HandoffModel, brief: BriefModel, currentWorkItem: ResumeModel["current_work_item"]): string[] {
  return unique([
    ...handoff.blocking_reasons,
    ...brief.workflow.blocked_by.map((item) => `CURRENT_STATE blocked_by: ${item}`),
    brief.git.dirty ? "git worktree has uncommitted changes; classify ownership before editing" : "",
    ...(currentWorkItem.status === "unknown" ? ["active_queue.status is unknown and the task requires queue-specific mutation"] : []),
    ...(currentWorkItem.status !== "unknown" ? currentWorkItem.stop_if : []),
  ]);
}

function primaryContextFor(readOrder: ReadOrder): string[] {
  return unique([
    ...readOrder.must_read,
    "openworkflow resume --root . --json",
  ]);
}

function primaryEvidenceFor(activeQueue: ResumeModel["active_queue"], currentWorkItem: ResumeModel["current_work_item"]): string[] {
  return unique([
    activeQueue.status === "found" ? activeQueue.queue_path : "",
    currentWorkItem.status !== "unknown" ? currentWorkItem.selected_change_path ?? "" : "",
    currentWorkItem.status !== "unknown" ? currentWorkItem.atom_tasks_path ?? "" : "",
    currentWorkItem.status !== "unknown" ? currentWorkItem.implementation_brief_path ?? "" : "",
  ]);
}

function auxiliaryEvidenceFor(activeQueue: ResumeModel["active_queue"], currentWorkItem: ResumeModel["current_work_item"]): string[] {
  return unique([
    activeQueue.status === "found" ? activeQueue.summary_path ?? "" : "",
    currentWorkItem.status !== "unknown" ? currentWorkItem.commit_evidence.expected_path ?? "" : "",
    ...(activeQueue.status === "found" && activeQueue.completed_candidate?.selected_change_id
      ? [`completed candidate ${activeQueue.completed_candidate.id}: ${activeQueue.completed_candidate.selected_change_id}`]
      : []),
  ]);
}

function comparisonEvidenceFor(activeQueue: ResumeModel["active_queue"]): string[] {
  return activeQueue.status === "found"
    ? activeQueue.alternatives.map((item) => `${item.queue_path}: ${item.reason}`)
    : [];
}

function productAlignmentFor(activePointers: Record<string, string | null>): ResumeModel["product_alignment"] {
  const available = Object.entries(activePointers)
    .filter(([, value]) => typeof value === "string" && value.length > 0)
    .map(([key, value]) => `${key}: ${value}`);
  return {
    active_pointers: activePointers,
    available_context: available,
    missing_context: available.length === 0 ? ["no active vision, validation, design, spec, decision, or accepted evidence pointer is registered"] : [],
  };
}

function warningsFor(
  brief: BriefModel,
  nextCommandCheck: ReadinessModel | null,
  model: ResumeModel,
  planningQueueWarnings: string[],
): string[] {
  return unique([
    ...brief.health.workflow.warnings,
    ...brief.health.agents_md.warnings,
    ...Object.values(brief.health.adapters).flatMap((section) => section.warnings),
    ...brief.health.summaries.warnings,
    ...nextCommandCheck?.warnings ?? [],
    ...planningQueueWarnings,
    ...(model.active_queue.status === "unknown" ? model.active_queue.uncertainty : []),
    ...(model.current_work_item.status === "unknown" ? model.current_work_item.uncertainty : []),
  ]);
}

function printResume(model: ResumeModel): void {
  console.log(`OpenWorkflow resume for ${model.project.title}`);
  console.log(`root: ${model.project.root}`);
  console.log(`handoff_ok: ${model.trust.handoff_ok}`);
  console.log(`active_stage: ${model.workflow.active_stage ?? "unknown"}`);
  console.log(`next_command: ${model.workflow.next_command ?? "none"}`);
  console.log(`next_command_ready: ${model.trust.next_command_ready ?? "unknown"}`);
  console.log(`active_queue: ${activeQueueLabel(model.active_queue)}`);
  console.log(`current_work_item: ${currentWorkItemLabel(model.current_work_item)}`);
  console.log(`git: available=${model.git.available}, branch=${model.git.branch ?? "none"}, dirty=${model.git.dirty}`);
  printList("blocking_reasons", model.trust.blocking_reasons);
  printList("must_read", model.workflow.read_order.must_read);
  printList("immediate_actions", model.actions.immediate);
}

function activeQueueLabel(queue: ResumeModel["active_queue"]): string {
  if (queue.status === "unknown") {
    return `unknown (${queue.reason})`;
  }
  return `${queue.plan_id} (${queue.breakpoint.status})`;
}

function currentWorkItemLabel(workItem: ResumeModel["current_work_item"]): string {
  if (workItem.status === "unknown") {
    return `unknown (${workItem.reason})`;
  }
  return `${workItem.status}${workItem.candidate_id ? ` ${workItem.candidate_id}` : ""}`;
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
