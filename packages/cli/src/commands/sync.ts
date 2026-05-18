import { resolve } from "node:path";
import { generateCodexAdapter } from "../../../adapters/codex/src/generateCodexAdapter.js";
import { booleanFlag, stringFlag } from "../args.js";
import { basenameForTitle, parseTools, printWarnings, slugify } from "./shared.js";

export async function syncCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const tools = parseTools(stringFlag(flags, "tools", "codex"));
  const force = booleanFlag(flags, "force");
  const projectTitle = stringFlag(flags, "project-title") ?? basenameForTitle(root);
  const projectSlug = slugify(stringFlag(flags, "project-slug") ?? projectTitle);

  if (!tools.includes("codex")) {
    console.error("No supported tools selected. M06 supports --tools codex.");
    return 1;
  }

  const adapter = await generateCodexAdapter({
    root,
    projectTitle,
    projectSlug,
    tools,
    force,
  });

  printWarnings(adapter.warnings);
  console.log(`Synced Codex adapter at ${root}`);
  console.log(`written: ${adapter.written.length}, skipped: ${adapter.skipped.length}, unchanged: ${adapter.unchanged.length}`);
  return adapter.skipped.length > 0 ? 1 : 0;
}
