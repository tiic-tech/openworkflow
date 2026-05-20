import { resolve } from "node:path";
import { cleanCodexAdapter } from "../../../adapters/codex/src/cleanCodexAdapter.js";
import { cleanAgentsGuide } from "../../../core/src/onboarding/agentsGuide.js";
import { cleanOpenWorkflow, type CleanResult, type CleanTarget } from "../../../core/src/workflow/cleanOpenWorkflow.js";
import { booleanFlag, stringFlag } from "../args.js";
import { emptyEffects, printJsonReport } from "../report.js";
import { parseTools, printWarnings } from "./shared.js";

export async function cleanCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const tools = parseTools(stringFlag(flags, "tools", "codex"));
  const yes = booleanFlag(flags, "yes");
  const force = booleanFlag(flags, "force");
  const json = booleanFlag(flags, "json");
  const results: CleanResult[] = [];

  if (tools.length > 0 && !tools.includes("codex")) {
    if (json) {
      printJsonReport({
        command: "clean",
        ok: false,
        root,
        data: { tools },
        warnings: [],
        errors: ["No supported tools selected. M28 supports --tools codex."],
        effects: emptyEffects(),
        next_actions: ["use --tools codex or omit --tools"],
      });
      return 1;
    }
    console.error("No supported tools selected. M22 supports --tools codex.");
    return 1;
  }

  results.push(await cleanOpenWorkflow({ root, yes }));
  results.push(await cleanAgentsGuide({ root, yes }));

  if (tools.includes("codex")) {
    results.push(await cleanCodexAdapter({ root, yes, force }));
  }

  const merged = mergeResults(results);
  if (json) {
    printJsonReport({
      command: "clean",
      ok: true,
      root,
      data: { dry_run: merged.dryRun, tools },
      warnings: merged.warnings,
      errors: [],
      effects: {
        ...emptyEffects(),
        planned: merged.planned.map((target) => target.path),
        removed: merged.removed,
        updated: merged.updated,
        skipped: merged.skipped,
      },
      next_actions: yes ? [] : ["rerun with --yes to remove planned targets"],
    });
    return 0;
  }
  printCleanSummary(root, merged);
  printWarnings(merged.warnings);
  if (!yes) {
    console.log("Dry run only. Re-run with --yes to remove planned targets.");
  }
  return 0;
}

function mergeResults(results: CleanResult[]): CleanResult {
  return {
    dryRun: results.every((result) => result.dryRun),
    planned: results.flatMap((result) => result.planned),
    removed: results.flatMap((result) => result.removed),
    updated: results.flatMap((result) => result.updated),
    skipped: results.flatMap((result) => result.skipped),
    warnings: results.flatMap((result) => result.warnings),
  };
}

function printCleanSummary(root: string, result: CleanResult): void {
  console.log(`OpenWorkflow clean ${result.dryRun ? "plan" : "completed"} at ${root}`);
  printTargets("planned", result.planned);
  for (const path of result.removed) {
    console.log(`removed: ${path}`);
  }
  for (const path of result.updated) {
    console.log(`updated: ${path}`);
  }
  for (const path of result.skipped) {
    console.log(`skipped: ${path}`);
  }
  console.log(`planned: ${result.planned.length}, removed: ${result.removed.length}, updated: ${result.updated.length}, skipped: ${result.skipped.length}, warnings: ${result.warnings.length}`);
}

function printTargets(label: string, targets: CleanTarget[]): void {
  for (const target of targets) {
    console.log(`${label}: ${target.path} (${target.reason})`);
  }
}
