import { resolve } from "node:path";
import { booleanFlag, stringFlag } from "../args.js";
import { emptyEffects, printJsonReport } from "../report.js";
import { buildBriefModel, healthErrorsForBrief, type BriefModel } from "./brief.js";
import { buildReadiness, type ReadinessModel } from "./check.js";
import { parseTools } from "./shared.js";
import { evaluateSummaryQualityGate, type SummaryQualityGate } from "../../../core/src/workflow/summaryHealth.js";

export interface InspectModel {
  project: BriefModel["project"];
  workflow: BriefModel["workflow"];
  health: BriefModel["health"] & {
    next_command_ready: boolean | null;
  };
  summaries: BriefModel["health"]["summaries"];
  strict_quality: SummaryQualityGate;
  next_command_check: ReadinessModel | null;
  read_order: ReadOrder;
  recommended_next_actions: string[];
}

export interface ReadOrder {
  must_read: string[];
  read_if_missing_context: string[];
  avoid_by_default: string[];
  raw_evidence_only_if: string[];
}

export async function inspectCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const json = booleanFlag(flags, "json");
  const strict = booleanFlag(flags, "strict");
  const brief = await buildBriefModel(root, parseTools(stringFlag(flags, "tools")));
  const nextCommand = brief.workflow.next_command;
  const nextCommandCheck = nextCommand ? await buildReadiness(root, nextCommand) : null;
  const qualityGate = evaluateSummaryQualityGate(brief.health.summaries, strict);
  const model = buildInspectModel(brief, nextCommandCheck, qualityGate);
  const warnings = warningsFor(brief, nextCommandCheck);
  const errors = errorsFor(brief, nextCommandCheck);
  const healthErrors = healthErrorsForInspect(brief, nextCommandCheck, qualityGate);

  if (json) {
    printJsonReport({
      command: "inspect",
      ok: model.health.ok,
      root,
      data: model,
      warnings,
      errors,
      health_errors: healthErrors,
      effects: emptyEffects(),
      next_actions: model.recommended_next_actions,
    });
  } else {
    printInspect(model);
  }
  return model.health.ok ? 0 : 1;
}

function healthErrorsForInspect(brief: BriefModel, nextCommandCheck: ReadinessModel | null, qualityGate: SummaryQualityGate): string[] {
  if (brief.health.ok && (nextCommandCheck?.ready ?? true) && qualityGate.ok) {
    return [];
  }
  return unique([
    ...healthErrorsForBrief({ ...brief, health: brief.health }),
    ...(nextCommandCheck && !nextCommandCheck.ready ? nextCommandCheck.blockers : []),
    ...qualityGate.health_errors,
  ]);
}

export function buildInspectModel(brief: BriefModel, nextCommandCheck: ReadinessModel | null, qualityGate: SummaryQualityGate): InspectModel {
  const nextCommandReady = nextCommandCheck ? nextCommandCheck.ready : null;
  const health = {
    ...brief.health,
    ok: brief.health.ok && (nextCommandReady ?? true) && qualityGate.ok,
    next_command_ready: nextCommandReady,
  };
  return {
    project: brief.project,
    workflow: brief.workflow,
    health,
    summaries: brief.health.summaries,
    strict_quality: qualityGate,
    next_command_check: nextCommandCheck,
    read_order: readOrderFor(brief, nextCommandCheck),
    recommended_next_actions: recommendedNextActions(brief, nextCommandCheck),
  };
}

function readOrderFor(brief: BriefModel, nextCommandCheck: ReadinessModel | null): ReadOrder {
  const missingRequired = nextCommandCheck?.required_context.filter((item) => !item.exists).map((item) => item.path) ?? [];
  const optionalMissing = nextCommandCheck?.optional_context.filter((item) => !item.exists).map((item) => item.path) ?? [];
  return {
    must_read: unique([
      "AGENTS.md",
      ".openworkflow/CURRENT_STATE.yaml",
      ...brief.read_this_first,
      ...Object.values(brief.active_pointers).filter(isString),
    ]),
    read_if_missing_context: unique([
      ...missingRequired,
      ...optionalMissing,
      "openworkflow check <next_command> --root . --json",
      "openworkflow summaries --root . --json",
    ]),
    avoid_by_default: unique([
      ...(nextCommandCheck?.forbidden_context.map((item) => item.path) ?? []),
      ".openworkflow/**/evidence/**",
      ".openworkflow/**/review.html",
    ]),
    raw_evidence_only_if: [
      "A summary/current_slice is missing, stale, or too thin for the task.",
      "The active command explicitly requires raw evidence or visual review.",
      "Verification, debugging, or user review depends on the raw artifact.",
    ],
  };
}

function recommendedNextActions(brief: BriefModel, nextCommandCheck: ReadinessModel | null): string[] {
  if (!brief.health.summaries.initialized) {
    return ["run openworkflow init <folder> --tools codex, or run openworkflow sync on an initialized project"];
  }
  const actions = [brief.agent_guidance.recommended_next_action];
  if (!brief.health.summaries.ok) {
    actions.push("run openworkflow summaries --root . --json before loading raw evidence");
  }
  if (brief.health.summaries.ok && brief.health.summaries.warnings.length > 0) {
    actions.push("run openworkflow summaries --root . --strict --json before trusting thin summaries");
  }
  if (nextCommandCheck) {
    actions.push(...nextCommandCheck.next_actions);
  } else {
    actions.push("inspect CURRENT_STATE.yaml and choose the next workflow command");
  }
  return unique(actions);
}

function warningsFor(brief: BriefModel, nextCommandCheck: ReadinessModel | null): string[] {
  return unique([
    ...brief.health.workflow.warnings,
    ...brief.health.agents_md.warnings,
    ...Object.values(brief.health.adapters).flatMap((section) => section.warnings),
    ...brief.health.summaries.warnings,
    ...(nextCommandCheck?.warnings ?? []),
  ]);
}

function errorsFor(brief: BriefModel, nextCommandCheck: ReadinessModel | null): string[] {
  return unique([
    ...brief.health.workflow.errors,
    ...brief.health.agents_md.errors,
    ...Object.values(brief.health.adapters).flatMap((section) => section.errors),
    ...(nextCommandCheck?.blockers ?? []),
  ]);
}

function printInspect(model: InspectModel): void {
  console.log(`OpenWorkflow inspect for ${model.project.title}`);
  console.log(`root: ${model.project.root}`);
  console.log(`ok: ${model.health.ok}`);
  console.log(`next_command: ${model.workflow.next_command ?? "none"}`);
  console.log(`next_command_ready: ${model.health.next_command_ready ?? "unknown"}`);
  console.log(`summary_health: ok=${model.summaries.ok}, initialized=${model.summaries.initialized}`);
  console.log(`strict_quality: ok=${model.strict_quality.ok}, enabled=${model.strict_quality.strict}`);
  console.log("must_read:");
  for (const item of model.read_order.must_read.length > 0 ? model.read_order.must_read : ["none"]) {
    console.log(`  - ${item}`);
  }
  console.log("recommended_next_actions:");
  for (const action of model.recommended_next_actions.length > 0 ? model.recommended_next_actions : ["none"]) {
    console.log(`  - ${action}`);
  }
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}
