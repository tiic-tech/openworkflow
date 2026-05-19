import { resolve } from "node:path";
import { validateOpenWorkflow } from "../../../core/src/validators/validateOpenWorkflow.js";
import { stringFlag } from "../args.js";

export async function validateCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const result = await validateOpenWorkflow(root);
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
