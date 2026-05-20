import { resolve } from "node:path";
import { detectAdapterPlatforms, getAdapterEntry, getSupportedAdapterIds } from "../../../adapters/src/registry.js";
import { doctorAgentsGuide } from "../../../core/src/onboarding/agentsGuide.js";
import { doctorOpenWorkflow } from "../../../core/src/workflow/doctorOpenWorkflow.js";
import { readWorkflowConfig } from "../../../core/src/workflow/readWorkflowConfig.js";
import { stringFlag } from "../args.js";
import { basenameForTitle, parseTools, slugify } from "./shared.js";

export async function doctorCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const explicitTools = parseTools(stringFlag(flags, "tools"));
  const autoTools = isAutoTools(explicitTools);
  const detection = await detectAdapterPlatforms(root);
  const tools = autoTools ? detection.detected : explicitTools;
  const workflowTools = autoTools ? uniqueTools([...tools, ...detection.unknownConfigured]) : tools;
  const supported = new Set(getSupportedAdapterIds());
  const unsupportedRequested = tools.filter((tool) => !supported.has(tool));

  if (unsupportedRequested.length > 0) {
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
    ...detection.unknownConfigured.map((tool) => `Configured tool is not supported by this OpenWorkflow version and was not checked: ${tool}`),
    ...adapterResults.flatMap((entry) => entry.result.warnings),
  ];
  const errors = [...workflow.errors, ...agentsGuide.errors, ...adapterResults.flatMap((entry) => entry.result.errors)];
  for (const warning of warnings) {
    console.warn(`Warning: ${warning}`);
  }
  if (!workflow.ok || !agentsGuide.ok || adapterResults.some((entry) => !entry.result.ok)) {
    console.error("OpenWorkflow doctor found issues:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    return 1;
  }
  console.log(warnings.length > 0 ? "OpenWorkflow doctor passed with warnings." : "OpenWorkflow doctor passed.");
  return 0;
}

function isAutoTools(tools: string[]): boolean {
  return tools.length === 0 || tools.includes("auto");
}

function uniqueTools(tools: string[]): string[] {
  return [...new Set(tools)];
}
