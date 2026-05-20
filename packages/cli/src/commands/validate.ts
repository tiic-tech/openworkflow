import { resolve } from "node:path";
import { validateOpenWorkflow } from "../../../core/src/validators/validateOpenWorkflow.js";
import { booleanFlag, stringFlag } from "../args.js";
import { emptyEffects, printJsonReport } from "../report.js";

export async function validateCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const json = booleanFlag(flags, "json");
  const result = await validateOpenWorkflow(root);
  if (json) {
    printJsonReport({
      command: "validate",
      ok: result.ok,
      root,
      data: result,
      warnings: [],
      errors: result.errors,
      effects: emptyEffects(),
      next_actions: result.ok ? [] : ["fix validation errors and rerun openworkflow validate"],
    });
    return result.ok ? 0 : 1;
  }
  if (!result.ok) {
    console.error("OpenWorkflow validation failed:");
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    return 1;
  }
  console.log("OpenWorkflow validation passed.");
  return 0;
}
