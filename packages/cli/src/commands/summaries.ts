import { resolve } from "node:path";
import { evaluateSummaryHealth, type SummaryHealthModel } from "../../../core/src/workflow/summaryHealth.js";
import { booleanFlag, stringFlag } from "../args.js";
import { emptyEffects, printJsonReport } from "../report.js";

export async function summariesCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const json = booleanFlag(flags, "json");
  const health = await evaluateSummaryHealth(root);
  if (json) {
    printJsonReport({
      command: "summaries",
      ok: health.ok,
      root,
      data: health,
      warnings: health.warnings,
      errors: [],
      effects: emptyEffects(),
      next_actions: health.next_actions,
    });
  } else {
    printSummaries(health);
  }
  return 0;
}

function printSummaries(health: SummaryHealthModel): void {
  console.log("OpenWorkflow summary health");
  console.log(`ok: ${health.ok}`);
  console.log(
    `counts: current=${health.counts.current}, missing=${health.counts.missing}, stale_unknown=${health.counts.stale_unknown}, not_instantiated=${health.counts.not_instantiated}, not_applicable=${health.counts.not_applicable}`,
  );
  for (const entry of health.entries) {
    if (entry.strategy === "none") {
      continue;
    }
    console.log(`${entry.artifact_type}: ${entry.status} (${entry.instantiated_count} instantiated, ${entry.strategy})`);
  }
  if (health.next_actions.length > 0) {
    console.log("next_actions:");
    for (const action of health.next_actions) {
      console.log(`  - ${action}`);
    }
  }
}
