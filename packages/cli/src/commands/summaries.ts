import { resolve } from "node:path";
import {
  evaluateSummaryHealth,
  evaluateSummaryQualityGate,
  type SummaryHealthModel,
  type SummaryQualityGate,
} from "../../../core/src/workflow/summaryHealth.js";
import { booleanFlag, stringFlag } from "../args.js";
import { emptyEffects, printJsonReport } from "../report.js";

export async function summariesCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const json = booleanFlag(flags, "json");
  const strict = booleanFlag(flags, "strict");
  const health = await evaluateSummaryHealth(root);
  const qualityGate = evaluateSummaryQualityGate(health, strict);
  const ok = health.ok && qualityGate.ok;
  if (json) {
    const healthErrors = healthErrorsForSummaries(health, qualityGate);
    printJsonReport({
      command: "summaries",
      ok,
      root,
      data: {
        ...health,
        strict_quality: qualityGate,
      },
      warnings: health.warnings,
      errors: health.initialized ? [] : health.warnings,
      health_errors: healthErrors,
      effects: emptyEffects(),
      next_actions: nextActionsFor(health, qualityGate),
    });
  } else {
    printSummaries(health, qualityGate);
  }
  return ok ? 0 : 1;
}

function healthErrorsForSummaries(health: SummaryHealthModel, qualityGate: SummaryQualityGate): string[] {
  const freshnessErrors = health.ok
    ? []
    : health.warnings.length > 0 ? health.warnings : ["summary health is not ok"];
  return unique([...freshnessErrors, ...qualityGate.health_errors]);
}

function nextActionsFor(health: SummaryHealthModel, qualityGate: SummaryQualityGate): string[] {
  const strictActions = qualityGate.health_errors.length > 0
    ? ["repair thin source artifacts or inspect raw evidence before trusting summaries"]
    : [];
  return unique([...health.next_actions, ...strictActions]);
}

function printSummaries(health: SummaryHealthModel, qualityGate: SummaryQualityGate): void {
  console.log("OpenWorkflow summary health");
  console.log(`ok: ${health.ok && qualityGate.ok}`);
  console.log(`strict_quality: ${qualityGate.strict}`);
  console.log(`initialized: ${health.initialized}`);
  if (!health.initialized) {
    for (const warning of health.warnings) {
      console.log(`warning: ${warning}`);
    }
  }
  console.log(
    `counts: current=${health.counts.current}, missing=${health.counts.missing}, stale_unknown=${health.counts.stale_unknown}, not_instantiated=${health.counts.not_instantiated}, not_applicable=${health.counts.not_applicable}`,
  );
  for (const entry of health.entries) {
    if (entry.strategy === "none") {
      continue;
    }
    console.log(`${entry.artifact_type}: ${entry.status} (${entry.instantiated_count} instantiated, ${entry.strategy})`);
    for (const item of entry.items.filter((candidate) => candidate.quality_status === "current_but_thin")) {
      console.log(`  quality: ${item.quality_status} (${item.artifact_path})`);
    }
  }
  const nextActions = nextActionsFor(health, qualityGate);
  if (nextActions.length > 0) {
    console.log("next_actions:");
    for (const action of nextActions) {
      console.log(`  - ${action}`);
    }
  }
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}
