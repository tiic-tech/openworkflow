import { resolve } from "node:path";
import { doctorCodexAdapter } from "../../../adapters/codex/src/doctorCodexAdapter.js";
import { stringFlag } from "../args.js";
import { parseTools } from "./shared.js";

export async function doctorCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const tools = parseTools(stringFlag(flags, "tools", "codex"));

  if (!tools.includes("codex")) {
    console.error("No supported tools selected. M06 supports --tools codex.");
    return 1;
  }

  const adapter = await doctorCodexAdapter(root);
  for (const warning of adapter.warnings) {
    console.warn(`Warning: ${warning}`);
  }
  if (!adapter.ok) {
    console.error("OpenWorkflow doctor found adapter issues:");
    for (const error of adapter.errors) {
      console.error(`- ${error}`);
    }
    return 1;
  }
  console.log(adapter.warnings.length > 0 ? "OpenWorkflow doctor passed with warnings." : "OpenWorkflow doctor passed.");
  return 0;
}
