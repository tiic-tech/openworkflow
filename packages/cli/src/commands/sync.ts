import { resolve } from "node:path";
import { detectAdapterPlatforms, getAdapterEntry, getSupportedAdapterIds } from "../../../adapters/src/registry.js";
import { syncAgentsGuide } from "../../../core/src/onboarding/agentsGuide.js";
import { readWorkflowConfig } from "../../../core/src/workflow/readWorkflowConfig.js";
import { syncOpenWorkflow } from "../../../core/src/workflow/syncOpenWorkflow.js";
import { booleanFlag, stringFlag } from "../args.js";
import { basenameForTitle, parseTools, printWarnings, slugify } from "./shared.js";

export async function syncCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const rawTools = stringFlag(flags, "tools");
  const explicitTools = parseTools(rawTools);
  const autoTools = isAutoTools(explicitTools);
  const detection = await detectAdapterPlatforms(root);
  const tools = resolveSyncTools(explicitTools, detection.detected);
  const workflowTools = autoTools ? uniqueTools([...tools, ...detection.unknownConfigured]) : tools;
  const force = booleanFlag(flags, "force");
  const config = await readWorkflowConfig(root);
  const projectTitle = stringFlag(flags, "project-title") ?? config?.projectTitle ?? basenameForTitle(root);
  const projectSlug = slugify(stringFlag(flags, "project-slug") ?? config?.projectSlug ?? projectTitle);
  const supported = new Set(getSupportedAdapterIds());
  const unsupportedRequested = tools.filter((tool) => !supported.has(tool));

  if (unsupportedRequested.length > 0) {
    console.error(`Unsupported tools selected: ${unsupportedRequested.join(", ")}. Supported tools: ${getSupportedAdapterIds().join(", ")}.`);
    return 1;
  }

  const workflow = await syncOpenWorkflow({
    root,
    projectTitle,
    projectSlug,
    tools: workflowTools,
    force,
  });
  const agentsGuide = await syncAgentsGuide(root);

  const adapterResults = [];
  for (const tool of tools) {
    const adapter = getAdapterEntry(tool);
    if (!adapter) {
      continue;
    }
    const result = await adapter.sync({
      root,
      projectTitle,
      projectSlug,
      tools,
      force,
    });
    adapterResults.push({ tool, result });
  }

  printWarnings([
    ...workflow.warnings,
    ...detection.unknownConfigured.map((tool) => `Configured tool is not supported by this OpenWorkflow version and was not synced: ${tool}`),
    ...adapterResults.flatMap((entry) => entry.result.warnings),
  ]);
  console.log(`Synced OpenWorkflow at ${root}`);
  console.log(`Workflow files added: ${workflow.added.length}, updated: ${workflow.updated.length}, unchanged: ${workflow.unchanged.length}, preserved: ${workflow.preserved.length}`);
  console.log(`AGENTS.md: ${agentsGuide.action}`);
  if (detection.evidence.length > 0 && autoTools) {
    console.log(`Detected tools: ${tools.length > 0 ? tools.join(", ") : "none"} (${detection.evidence.join("; ")})`);
  } else if (autoTools) {
    console.log("Detected tools: none");
  }
  for (const entry of adapterResults) {
    console.log(`${entry.tool} adapter written: ${entry.result.written.length}, skipped: ${entry.result.skipped.length}, unchanged: ${entry.result.unchanged.length}, removed: ${entry.result.removed.length}`);
  }
  for (const note of workflow.migrationNotes) {
    console.log(`migration: ${note}`);
  }
  return adapterResults.some((entry) => entry.result.skipped.length > 0) ? 1 : 0;
}

function resolveSyncTools(explicitTools: string[], detectedTools: string[]): string[] {
  if (isAutoTools(explicitTools)) {
    return detectedTools;
  }
  return explicitTools;
}

function isAutoTools(tools: string[]): boolean {
  return tools.length === 0 || tools.includes("auto");
}

function uniqueTools(tools: string[]): string[] {
  return [...new Set(tools)];
}
