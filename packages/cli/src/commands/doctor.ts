import { resolve } from "node:path";
import { detectAdapterPlatforms, getAdapterEntry, getSupportedAdapterIds } from "../../../adapters/src/registry.js";
import { doctorAgentsGuide } from "../../../core/src/onboarding/agentsGuide.js";
import { doctorOpenWorkflow } from "../../../core/src/workflow/doctorOpenWorkflow.js";
import { readWorkflowConfig } from "../../../core/src/workflow/readWorkflowConfig.js";
import { evaluateSummaryHealth, evaluateSummaryQualityGate } from "../../../core/src/workflow/summaryHealth.js";
import { booleanFlag, stringFlag } from "../args.js";
import { emptyEffects, printJsonReport } from "../report.js";
import { basenameForTitle, parseTools, slugify } from "./shared.js";

export async function doctorCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const json = booleanFlag(flags, "json");
  const explicitTools = parseTools(stringFlag(flags, "tools"));
  const autoTools = isAutoTools(explicitTools);
  const detection = await detectAdapterPlatforms(root);
  const tools = autoTools ? detection.detected : explicitTools;
  const workflowTools = autoTools ? uniqueTools([...tools, ...detection.unknownConfigured]) : tools;
  const supported = new Set(getSupportedAdapterIds());
  const unsupportedRequested = tools.filter((tool) => !supported.has(tool));

  if (unsupportedRequested.length > 0) {
    if (json) {
      printJsonReport({
        command: "doctor",
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

  const config = await readWorkflowConfig(root);
  const projectTitle = config?.projectTitle ?? basenameForTitle(root);
  const projectSlug = slugify(config?.projectSlug ?? projectTitle);
  const workflow = await doctorOpenWorkflow({
    root,
    projectTitle,
    projectSlug,
    tools: workflowTools,
    force: false,
  });
  const agentsGuide = await doctorAgentsGuide(root);
  const summaryHealth = await evaluateSummaryHealth(root);
  const handoffQuality = evaluateSummaryQualityGate(summaryHealth, true);
  const adapterResults = [];
  for (const tool of tools) {
    const adapter = getAdapterEntry(tool);
    if (!adapter) {
      continue;
    }
    adapterResults.push({ tool, result: await adapter.doctor(root) });
  }
  const warnings = [
    ...workflow.warnings,
    ...agentsGuide.warnings,
    ...summaryHealth.warnings.map((warning) => `summary health: ${warning}`),
    ...detection.unknownConfigured.map((tool) => `Configured tool is not supported by this OpenWorkflow version and was not checked: ${tool}`),
    ...adapterResults.flatMap((entry) => entry.result.warnings),
  ];
  const errors = [...workflow.errors, ...agentsGuide.errors, ...adapterResults.flatMap((entry) => entry.result.errors)];
  const managedSurfaceOk = workflow.ok && agentsGuide.ok;
  const adapterOk = adapterResults.every((entry) => entry.result.ok);
  const summaryFreshnessOk = summaryHealth.ok;
  const handoffQualityOk = handoffQuality.ok;
  const ok = managedSurfaceOk && adapterOk;
  if (json) {
    printJsonReport({
      command: "doctor",
      ok,
      root,
      data: {
        workflow,
        agents_md: agentsGuide,
        summary_health: summaryHealth,
        strict_quality: handoffQuality,
        managed_surface_ok: managedSurfaceOk,
        adapter_ok: adapterOk,
        summary_freshness_ok: summaryFreshnessOk,
        handoff_quality_ok: handoffQualityOk,
        scope: {
          managed_surfaces: "doctor ok covers generated workflow files, AGENTS.md managed block, and selected adapters",
          artifact_summaries: "summary freshness and handoff quality are reported separately; use openworkflow summaries --strict --json for artifact summary trust",
        },
        detection,
        tools,
        adapters: Object.fromEntries(adapterResults.map((entry) => [entry.tool, entry.result])),
      },
      warnings,
      errors,
      effects: emptyEffects(),
      next_actions: doctorNextActions(ok, summaryHealth.ok, handoffQuality.ok),
    });
    return ok ? 0 : 1;
  }
  for (const warning of warnings) {
    console.warn(`Warning: ${warning}`);
  }
  if (!ok) {
    console.error("OpenWorkflow doctor found issues:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    return 1;
  }
  console.log(warnings.length > 0 ? "OpenWorkflow doctor passed with warnings." : "OpenWorkflow doctor passed.");
  if (!handoffQuality.ok) {
    console.log("handoff_quality: warnings; run openworkflow summaries --root . --strict --json");
  }
  return 0;
}

function doctorNextActions(ok: boolean, summariesOk: boolean, handoffQualityOk: boolean): string[] {
  if (!ok) {
    return ["run openworkflow sync, then openworkflow doctor"];
  }
  if (!summariesOk) {
    return ["run openworkflow summaries --json before relying on low-context artifact reads"];
  }
  if (!handoffQualityOk) {
    return ["run openworkflow summaries --root . --strict --json before trusting artifact handoff quality"];
  }
  return [];
}

function isAutoTools(tools: string[]): boolean {
  return tools.length === 0 || tools.includes("auto");
}

function uniqueTools(tools: string[]): string[] {
  return [...new Set(tools)];
}
