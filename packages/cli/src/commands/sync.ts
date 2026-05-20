import { resolve } from "node:path";
import { detectAdapterPlatforms, getAdapterEntry, getSupportedAdapterIds } from "../../../adapters/src/registry.js";
import { syncAgentsGuide } from "../../../core/src/onboarding/agentsGuide.js";
import { readWorkflowConfig } from "../../../core/src/workflow/readWorkflowConfig.js";
import { syncOpenWorkflow } from "../../../core/src/workflow/syncOpenWorkflow.js";
import { booleanFlag, stringFlag } from "../args.js";
import { emptyEffects, printJsonReport } from "../report.js";
import { basenameForTitle, parseTools, printWarnings, slugify } from "./shared.js";

export async function syncCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const rawTools = stringFlag(flags, "tools");
  const explicitTools = parseTools(rawTools);
  const autoTools = isAutoTools(explicitTools);
  const detection = await detectAdapterPlatforms(root);
  const fallbackTools = autoTools && detection.detected.length === 0 && detection.configured.length === 0 ? ["codex"] : [];
  const tools = resolveSyncTools(explicitTools, detection.detected, fallbackTools);
  const workflowTools = autoTools ? uniqueTools([...tools, ...detection.unknownConfigured]) : tools;
  const force = booleanFlag(flags, "force");
  const json = booleanFlag(flags, "json");
  const config = await readWorkflowConfig(root);
  const projectTitle = stringFlag(flags, "project-title") ?? config?.projectTitle ?? basenameForTitle(root);
  const projectSlug = slugify(stringFlag(flags, "project-slug") ?? config?.projectSlug ?? projectTitle);
  const supported = new Set(getSupportedAdapterIds());
  const unsupportedRequested = tools.filter((tool) => !supported.has(tool));

  if (unsupportedRequested.length > 0) {
    if (json) {
      printJsonReport({
        command: "sync",
        ok: false,
        root,
        data: { requested_tools: tools, supported_tools: getSupportedAdapterIds() },
        warnings: [],
        errors: [`Unsupported tools selected: ${unsupportedRequested.join(", ")}.`],
        effects: emptyEffects(),
        next_actions: [`use --tools ${getSupportedAdapterIds().join(",") || "auto"}`],
      });
      return 1;
    }
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

  const warnings = [
    ...workflow.warnings,
    ...detection.unknownConfigured.map((tool) => `Configured tool is not supported by this OpenWorkflow version and was not synced: ${tool}`),
    ...adapterResults.flatMap((entry) => entry.result.warnings),
  ];
  const ok = !adapterResults.some((entry) => entry.result.skipped.length > 0);
  if (json) {
    printJsonReport({
      command: "sync",
      ok,
      root,
      data: {
        workflow,
        state_reconciliation: workflow.stateReconciliation,
        agents_md: agentsGuide,
        detection: detectionWithFallback(detection, fallbackTools),
        tools,
        adapters: Object.fromEntries(adapterResults.map((entry) => [entry.tool, entry.result])),
      },
      warnings,
      errors: [],
      effects: {
        ...emptyEffects(),
        written: [...workflow.added, ...(adapterResults.flatMap((entry) => entry.result.written))],
        updated: [
          ...workflow.updated,
          ...(agentsGuide.action === "updated" || agentsGuide.action === "appended" || agentsGuide.action === "created" ? [agentsGuide.path] : []),
        ],
        removed: adapterResults.flatMap((entry) => entry.result.removed),
        skipped: adapterResults.flatMap((entry) => entry.result.skipped),
        unchanged: [...workflow.unchanged, ...adapterResults.flatMap((entry) => entry.result.unchanged)],
        preserved: workflow.preserved,
        migration_notes: workflow.migrationNotes,
      },
      next_actions: ok ? ["run openworkflow brief --root . --json"] : ["inspect skipped files, then rerun openworkflow sync"],
    });
    return ok ? 0 : 1;
  }

  printWarnings(warnings);
  console.log(`Synced OpenWorkflow at ${root}`);
  console.log(`Workflow files added: ${workflow.added.length}, updated: ${workflow.updated.length}, unchanged: ${workflow.unchanged.length}, preserved: ${workflow.preserved.length}`);
  if (workflow.stateReconciliation.reconciled || workflow.stateReconciliation.warnings.length > 0) {
    console.log(`CURRENT_STATE reconciliation: ${workflow.stateReconciliation.reconciled ? "reconciled" : workflow.stateReconciliation.reason}`);
  }
  console.log(`AGENTS.md: ${agentsGuide.action}`);
  const displayedDetection = detectionWithFallback(detection, fallbackTools);
  if (displayedDetection.evidence.length > 0 && autoTools) {
    console.log(`Detected tools: ${tools.length > 0 ? tools.join(", ") : "none"} (${displayedDetection.evidence.join("; ")})`);
  } else if (autoTools) {
    console.log("Detected tools: none");
  }
  for (const entry of adapterResults) {
    console.log(`${entry.tool} adapter written: ${entry.result.written.length}, skipped: ${entry.result.skipped.length}, unchanged: ${entry.result.unchanged.length}, removed: ${entry.result.removed.length}`);
  }
  for (const note of workflow.migrationNotes) {
    console.log(`migration: ${note}`);
  }
  return ok ? 0 : 1;
}

function resolveSyncTools(explicitTools: string[], detectedTools: string[], fallbackTools: string[]): string[] {
  if (isAutoTools(explicitTools)) {
    return detectedTools.length > 0 ? detectedTools : fallbackTools;
  }
  return explicitTools;
}

function detectionWithFallback(
  detection: Awaited<ReturnType<typeof detectAdapterPlatforms>>,
  fallbackTools: string[],
): Awaited<ReturnType<typeof detectAdapterPlatforms>> {
  if (fallbackTools.length === 0) {
    return detection;
  }
  return {
    ...detection,
    detected: uniqueTools([...detection.detected, ...fallbackTools]),
    evidence: [
      ...detection.evidence,
      `default auto sync fallback tool: ${fallbackTools.join(", ")}; no configured or detected adapter surface remained`,
    ],
  };
}

function isAutoTools(tools: string[]): boolean {
  return tools.length === 0 || tools.includes("auto");
}

function uniqueTools(tools: string[]): string[] {
  return [...new Set(tools)];
}
