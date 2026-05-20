import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { generateCodexAdapter } from "../../../adapters/codex/src/generateCodexAdapter.js";
import { syncAgentsGuide } from "../../../core/src/onboarding/agentsGuide.js";
import { initOpenWorkflow } from "../../../core/src/workflow/initOpenWorkflow.js";
import { booleanFlag, stringFlag } from "../args.js";
import { emptyEffects, printJsonReport } from "../report.js";
import { basenameForTitle, parseTools, printWarnings, slugify } from "./shared.js";

export async function initCommand(positional: string[], flags: Map<string, string | boolean>): Promise<number> {
  const folder = positional[0];
  if (!folder) {
    if (booleanFlag(flags, "json")) {
      printJsonReport({
        command: "init",
        ok: false,
        root: null,
        data: {},
        warnings: [],
        errors: ["Missing folder argument."],
        effects: emptyEffects(),
        next_actions: ["run openworkflow init <folder> --tools codex"],
      });
      return 1;
    }
    console.error("Missing folder argument.");
    console.error("Usage: openworkflow init <folder> --tools codex");
    return 1;
  }

  const root = resolve(folder);
  const tools = parseTools(stringFlag(flags, "tools", ""));
  const force = booleanFlag(flags, "force");
  const json = booleanFlag(flags, "json");
  const projectTitle = stringFlag(flags, "project-title") ?? basenameForTitle(folder);
  const projectSlug = slugify(stringFlag(flags, "project-slug") ?? projectTitle);

  await mkdir(root, { recursive: true });

  const result = await initOpenWorkflow({
    root,
    projectTitle,
    projectSlug,
    tools,
    force,
  });
  const agentsGuide = await syncAgentsGuide(root);

  let adapterWritten = 0;
  let adapterSkipped = 0;
  let adapterUnchanged = 0;
  let adapterRemoved = 0;
  let adapterWarnings: string[] = [];
  let adapterResult = null;
  if (tools.includes("codex")) {
    const adapter = await generateCodexAdapter({
      root,
      projectTitle,
      projectSlug,
      tools,
      force,
    });
    adapterWritten = adapter.written.length;
    adapterSkipped = adapter.skipped.length;
    adapterUnchanged = adapter.unchanged.length;
    adapterRemoved = adapter.removed.length;
    adapterWarnings = adapter.warnings;
    adapterResult = adapter;
    if (!json) {
      printWarnings(adapter.warnings);
    }
  }

  if (json) {
    printJsonReport({
      command: "init",
      ok: true,
      root,
      data: {
        workflow: result,
        agents_md: agentsGuide,
        adapters: adapterResult ? { codex: adapterResult } : {},
      },
      warnings: adapterWarnings,
      errors: [],
      effects: {
        ...emptyEffects(),
        written: [
          ...result.written,
          ...(agentsGuide.action === "created" || agentsGuide.action === "appended" || agentsGuide.action === "updated" ? [agentsGuide.path] : []),
          ...(adapterResult?.written ?? []),
        ],
        skipped: [...result.skipped, ...(adapterResult?.skipped ?? [])],
        unchanged: adapterResult?.unchanged ?? [],
        removed: adapterResult?.removed ?? [],
      },
      next_actions: ["run openworkflow brief --root <folder> --json"],
    });
    return 0;
  }

  console.log(`Initialized OpenWorkflow at ${root}`);
  console.log(`.openworkflow written: ${result.written.length}, skipped: ${result.skipped.length}`);
  console.log(`AGENTS.md: ${agentsGuide.action}`);
  if (tools.includes("codex")) {
    console.log(`Codex adapter written: ${adapterWritten}, skipped: ${adapterSkipped}, unchanged: ${adapterUnchanged}, removed: ${adapterRemoved}`);
  }
  return 0;
}
