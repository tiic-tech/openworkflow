import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { generateCodexAdapter } from "../../../adapters/codex/src/generateCodexAdapter.js";
import { initOpenWorkflow } from "../../../core/src/workflow/initOpenWorkflow.js";
import { booleanFlag, stringFlag } from "../args.js";
import { basenameForTitle, parseTools, printWarnings, slugify } from "./shared.js";

export async function initCommand(positional: string[], flags: Map<string, string | boolean>): Promise<number> {
  const folder = positional[0];
  if (!folder) {
    console.error("Missing folder argument.");
    console.error("Usage: openworkflow init <folder> --tools codex");
    return 1;
  }

  const root = resolve(folder);
  const tools = parseTools(stringFlag(flags, "tools", ""));
  const force = booleanFlag(flags, "force");
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

  let adapterWritten = 0;
  let adapterSkipped = 0;
  let adapterUnchanged = 0;
  let adapterRemoved = 0;
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
    printWarnings(adapter.warnings);
  }

  console.log(`Initialized OpenWorkflow at ${root}`);
  console.log(`.openworkflow written: ${result.written.length}, skipped: ${result.skipped.length}`);
  if (tools.includes("codex")) {
    console.log(`.codex adapter written: ${adapterWritten}, skipped: ${adapterSkipped}, unchanged: ${adapterUnchanged}, removed: ${adapterRemoved}`);
  }
  return 0;
}
