#!/usr/bin/env node
import { booleanFlag, parseArgs } from "./args.js";
import { doctorCommand } from "./commands/doctor.js";
import { initCommand } from "./commands/init.js";
import { syncCommand } from "./commands/sync.js";
import { validateCommand } from "./commands/validate.js";

async function main(): Promise<number> {
  const parsed = parseArgs(process.argv.slice(2));

  if (!parsed.command || parsed.command === "help" || booleanFlag(parsed.flags, "help")) {
    printHelp();
    return 0;
  }

  if (parsed.command === "init") {
    return initCommand(parsed.positional, parsed.flags);
  }

  if (parsed.command === "validate") {
    return validateCommand(parsed.flags);
  }

  if (parsed.command === "sync") {
    return syncCommand(parsed.flags);
  }

  if (parsed.command === "doctor") {
    return doctorCommand(parsed.flags);
  }

  console.error(`Unknown command: ${parsed.command}`);
  printHelp();
  return 1;
}

function printHelp(): void {
  console.log(`OpenWorkflow CLI

Usage:
  openworkflow init <folder> --tools codex [--force]
  openworkflow validate --root <folder>
  openworkflow sync --root <folder> --tools codex [--force]
  openworkflow doctor --root <folder> --tools codex

Commands:
  init       Initialize .openworkflow contracts and optional tool adapters.
  validate   Validate .openworkflow contract files.
  sync       Regenerate project-local tool adapters from packaged templates.
  doctor     Check generated adapter files for missing or stale templates.
`);
}

main().then((code) => {
  process.exitCode = code;
}).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
