import { resolve } from "node:path";
import { buildSummaryQualitySummary, evaluateSummaryQualityGate, type SummaryQualitySummary } from "../../../core/src/workflow/summaryHealth.js";
import { booleanFlag, stringFlag } from "../args.js";
import { emptyEffects, printJsonReport } from "../report.js";
import { buildBriefModel, healthErrorsForBrief, type BriefModel } from "./brief.js";
import { buildReadiness, type ReadinessModel } from "./check.js";
import { buildInspectModel, type ReadOrder } from "./inspect.js";
import { parseTools } from "./shared.js";

export interface HandoffModel {
  handoff_ok: boolean;
  blocking_reasons: string[];
  managed_surface_ok: boolean;
  adapter_ok: boolean;
  summary_freshness_ok: boolean;
  summary_quality_ok: boolean;
  next_command_ready: boolean | null;
  next_command: string | null;
  active_stage: string | null;
  active_pointers: Record<string, string | null>;
  quality_summary: SummaryQualitySummary;
  read_order: ReadOrder;
  next_command_check: ReadinessModel | null;
  next_actions: string[];
}

export async function handoffCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const json = booleanFlag(flags, "json");
  const brief = await buildBriefModel(root, parseTools(stringFlag(flags, "tools")));
  const nextCommand = brief.workflow.next_command;
  const nextCommandCheck = nextCommand ? await buildReadiness(root, nextCommand) : null;
  const strictQuality = evaluateSummaryQualityGate(brief.health.summaries, true);
  const inspect = buildInspectModel(brief, nextCommandCheck, strictQuality);
  const qualitySummary = buildSummaryQualitySummary(brief.health.summaries, strictQuality);
  const model = buildHandoffModel(brief, nextCommandCheck, inspect.read_order, qualitySummary);
  const warnings = warningsFor(brief, nextCommandCheck);
  const healthErrors = model.handoff_ok ? [] : model.blocking_reasons;

  if (json) {
    printJsonReport({
      command: "handoff",
      ok: model.handoff_ok,
      root,
      data: model,
      warnings,
      errors: healthErrors,
      health_errors: healthErrors,
      effects: emptyEffects(),
      next_actions: model.next_actions,
    });
  } else {
    printHandoff(model);
  }
  return model.handoff_ok ? 0 : 1;
}

export function buildHandoffModel(
  brief: BriefModel,
  nextCommandCheck: ReadinessModel | null,
  readOrder: ReadOrder,
  qualitySummary: SummaryQualitySummary,
): HandoffModel {
  const managedSurfaceOk = brief.health.workflow.ok && brief.health.agents_md.ok;
  const adapterOk = Object.values(brief.health.adapters).every((section) => section.ok);
  const summaryFreshnessOk = brief.health.summaries.ok;
  const summaryQualityOk = qualitySummary.strict_quality_ok;
  const nextCommandReady = nextCommandCheck ? nextCommandCheck.ready : null;
  const blockingReasons = blockingReasonsFor(brief, nextCommandCheck, qualitySummary, managedSurfaceOk, adapterOk, summaryFreshnessOk, summaryQualityOk);
  const handoffOk = blockingReasons.length === 0;
  return {
    handoff_ok: handoffOk,
    blocking_reasons: blockingReasons,
    managed_surface_ok: managedSurfaceOk,
    adapter_ok: adapterOk,
    summary_freshness_ok: summaryFreshnessOk,
    summary_quality_ok: summaryQualityOk,
    next_command_ready: nextCommandReady,
    next_command: brief.workflow.next_command,
    active_stage: brief.workflow.active_stage,
    active_pointers: brief.active_pointers,
    quality_summary: qualitySummary,
    read_order: readOrder,
    next_command_check: nextCommandCheck,
    next_actions: nextActionsFor(brief, nextCommandCheck, qualitySummary, handoffOk),
  };
}

function blockingReasonsFor(
  brief: BriefModel,
  nextCommandCheck: ReadinessModel | null,
  qualitySummary: SummaryQualitySummary,
  managedSurfaceOk: boolean,
  adapterOk: boolean,
  summaryFreshnessOk: boolean,
  summaryQualityOk: boolean,
): string[] {
  const briefHealthErrors = healthErrorsForBrief({ ...brief, health: { ...brief.health, ok: false } });
  return unique([
    ...(!managedSurfaceOk ? briefHealthErrors.filter((item) => item.startsWith("workflow:") || item.startsWith("agents_md:")) : []),
    ...(!adapterOk ? briefHealthErrors.filter((item) => item.startsWith("adapter:")) : []),
    ...(!summaryFreshnessOk ? briefHealthErrors.filter((item) => !item.startsWith("workflow:") && !item.startsWith("agents_md:") && !item.startsWith("adapter:")) : []),
    ...(!summaryQualityOk ? (qualitySummary.next_actions.length > 0 ? qualitySummary.next_actions : ["summary quality is not trustworthy for handoff"]) : []),
    ...(qualitySummary.strict_quality_health_error_count > 0 ? strictQualityErrors(brief) : []),
    ...(nextCommandCheck ? nextCommandCheck.blockers : ["missing CURRENT_STATE.next_command"]),
    ...brief.workflow.blocked_by.map((item) => `CURRENT_STATE blocked_by: ${item}`),
  ]);
}

function strictQualityErrors(brief: BriefModel): string[] {
  return evaluateSummaryQualityGate(brief.health.summaries, true).health_errors;
}

function nextActionsFor(
  brief: BriefModel,
  nextCommandCheck: ReadinessModel | null,
  qualitySummary: SummaryQualitySummary,
  handoffOk: boolean,
): string[] {
  if (handoffOk) {
    return unique([
      "run openworkflow context --root . --json before loading full evidence",
      brief.workflow.next_command ? `continue with ${brief.workflow.next_command}` : "",
    ]);
  }
  return unique([
    ...qualitySummary.next_actions,
    ...(!brief.health.workflow.ok || !brief.health.agents_md.ok ? ["run openworkflow sync, then openworkflow doctor"] : []),
    ...nextCommandCheck?.next_actions ?? [],
    brief.agent_guidance.recommended_next_action,
  ]);
}

function warningsFor(brief: BriefModel, nextCommandCheck: ReadinessModel | null): string[] {
  return unique([
    ...brief.health.workflow.warnings,
    ...brief.health.agents_md.warnings,
    ...Object.values(brief.health.adapters).flatMap((section) => section.warnings),
    ...brief.health.summaries.warnings,
    ...nextCommandCheck?.warnings ?? [],
  ]);
}

function printHandoff(model: HandoffModel): void {
  console.log("OpenWorkflow handoff");
  console.log(`handoff_ok: ${model.handoff_ok}`);
  console.log(`active_stage: ${model.active_stage ?? "unknown"}`);
  console.log(`next_command: ${model.next_command ?? "none"}`);
  console.log(`next_command_ready: ${model.next_command_ready ?? "unknown"}`);
  console.log(`quality_summary: ${model.quality_summary.status}`);
  printList("blocking_reasons", model.blocking_reasons);
  printList("must_read", model.read_order.must_read);
  printList("next_actions", model.next_actions);
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
