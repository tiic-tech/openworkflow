import { resolve } from "node:path";
import { cleanCodexAdapter } from "../../../adapters/codex/src/cleanCodexAdapter.js";
import { cleanOpenWorkflow, type CleanResult, type CleanTarget } from "../../../core/src/workflow/cleanOpenWorkflow.js";
import { booleanFlag, stringFlag } from "../args.js";
import { parseTools, printWarnings } from "./shared.js";

export async function cleanCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const tools = parseTools(stringFlag(flags, "tools", "codex"));
  const yes = booleanFlag(flags, "yes");
  const force = booleanFlag(flags, "force");
  const results: CleanResult[] = [];

  if (tools.length > 0 && !tools.includes("codex")) {
    console.error("No supported tools selected. M22 supports --tools codex.");
    return 1;
  }

  results.push(await cleanOpenWorkflow({ root, yes }));

  if (tools.includes("codex")) {
    results.push(await cleanCodexAdapter({ root, yes, force }));
  }

  const merged = mergeResults(results);
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
  for (const path of result.skipped) {
    console.log(`skipped: ${path}`);
  }
  console.log(`planned: ${result.planned.length}, removed: ${result.removed.length}, skipped: ${result.skipped.length}, warnings: ${result.warnings.length}`);
}

function printTargets(label: string, targets: CleanTarget[]): void {
  for (const target of targets) {
    console.log(`${label}: ${target.path} (${target.reason})`);
  }
}
