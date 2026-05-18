#!/usr/bin/env node
import { resolve } from "node:path";
import { validateRepositoryContracts } from "../../../core/src/validators/validateRepositoryContracts.js";

async function main(): Promise<number> {
  const root = resolve(stringOption(process.argv.slice(2), "root", "."));
  const result = await validateRepositoryContracts(root);
  if (!result.ok) {
    console.error("OpenWorkflow repository validation failed:");
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    return 1;
  }
  console.log("OpenWorkflow repository validation passed.");
  return 0;
}

function stringOption(args: string[], name: string, defaultValue: string): string {
  const flag = `--${name}`;
  const index = args.indexOf(flag);
  if (index === -1) {
    return defaultValue;
  }
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    return defaultValue;
  }
  return value;
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
