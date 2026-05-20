#!/usr/bin/env node
import { booleanFlag, parseArgs } from "./args.js";
import { briefCommand } from "./commands/brief.js";
import { cleanCommand } from "./commands/clean.js";
import { doctorCommand } from "./commands/doctor.js";
import { initCommand } from "./commands/init.js";
import { syncCommand } from "./commands/sync.js";
import { validateCommand } from "./commands/validate.js";

async function main(): Promise<number> {
  const parsed = parseArgs(process.argv.slice(2));

  if (!parsed.command || parsed.command === "help" || parsed.command === "--help" || parsed.command === "-h" || booleanFlag(parsed.flags, "help")) {
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

  if (parsed.command === "clean") {
    return cleanCommand(parsed.flags);
  }

  if (parsed.command === "status" || parsed.command === "brief") {
    return briefCommand(parsed.command, parsed.flags);
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
  openworkflow sync --root <folder> [--tools auto|codex] [--force]
  openworkflow doctor --root <folder> [--tools auto|codex]
  openworkflow status --root <folder> [--json]
  openworkflow brief --root <folder> [--json]
  openworkflow clean --root <folder> --tools codex [--yes] [--force]

Commands:
  init       Initialize .openworkflow contracts and optional tool adapters.
  validate   Validate .openworkflow contract files.
  sync       Non-destructively refresh workflow contracts and detected adapters.
  doctor     Check managed workflow and adapter files for missing or stale templates.
  status     Print a low-context Agent read model for current workflow state.
  brief      Alias for status, named for Agent entry and handoff.
  clean      Remove OpenWorkflow-generated project files. Dry-run unless --yes is passed.

Agent quick start:
  Read AGENTS.md, then .openworkflow/CURRENT_STATE.yaml. Follow read_this_first
  before loading full evidence. Prefer SUMMARY.yaml/current_slice guidance when a
  long artifact offers it. Use --json when an Agent needs structured command output.

Two command surfaces:
  CLI maintenance commands keep OpenWorkflow installed and current:
    init       Create the minimal workflow root, AGENTS.md guide, and tool adapters.
    sync       Detect current platforms, refresh managed workflow files, and sync adapters.
    validate   Check .openworkflow contract shape.
    doctor     Report missing or stale generated surfaces.
    status     Summarize current state, health, read order, and git state.
    brief      Same read model as status; use when entering a repo as an Agent.
    clean      Remove generated OpenWorkflow surfaces without touching user content.

  Agent-readable JSON:
    Every command supports --json. In JSON mode stdout is a single report object
    with schema_version, command, ok, root, data, warnings, errors, effects, and
    next_actions.

  Repo-local workflow commands are Agent skills, not CLI subcommands:
    /ow:vision      clarify product vision through conversation-first discovery
    /ow:validation  define and assess the highest-risk validation target
    /ow:proto       create evidence-producing prototypes
    /ow:tune        revise the current prototype/design target
    /ow:design      turn accepted evidence into product design contracts
    /ow:spec        write production-ready implementation specs
    /ow:change      plan a concrete implementation change
    /ow:team        execute an approved change with runtime tracking

Lazy creation boundary:
  openworkflow init creates only the minimal .openworkflow setup. Stage artifacts
  are created by the first matching /ow:* workflow command, not by init.

Sync safety:
  sync may add missing managed workflow files and refresh audit/index metadata,
  but it preserves CURRENT_STATE pointers and never creates or rewrites stage
  artifacts such as validation, prototype, design, spec, change, or runtime files.
`);
}

main().then((code) => {
  process.exitCode = code;
}).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
