#!/usr/bin/env node
import { booleanFlag, parseArgs } from "./args.js";
import { briefCommand } from "./commands/brief.js";
import { checkCommand } from "./commands/check.js";
import { cleanCommand } from "./commands/clean.js";
import { contextCommand } from "./commands/context.js";
import { doctorCommand } from "./commands/doctor.js";
import { initCommand } from "./commands/init.js";
import { inspectCommand } from "./commands/inspect.js";
import { summariesCommand } from "./commands/summaries.js";
import { summarizeCommand } from "./commands/summarize.js";
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

  if (parsed.command === "check") {
    return checkCommand(parsed.positional, parsed.flags);
  }

  if (parsed.command === "context") {
    return contextCommand(parsed.flags);
  }

  if (parsed.command === "inspect") {
    return inspectCommand(parsed.flags);
  }

  if (parsed.command === "summaries") {
    return summariesCommand(parsed.flags);
  }

  if (parsed.command === "summarize") {
    return summarizeCommand(parsed.flags);
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
  openworkflow inspect --root <folder> [--json]
  openworkflow context --root <folder> [--for <ow-command>] [--max-bytes <n>] [--json]
  openworkflow check <ow-command> --root <folder> [--json]
  openworkflow summaries --root <folder> [--json]
  openworkflow summarize --root <folder> (--artifact <path>|--all) [--write] [--json]
  openworkflow clean --root <folder> --tools codex [--yes] [--force]

Commands:
  init       Initialize .openworkflow contracts and optional tool adapters.
  validate   Validate .openworkflow contract files and source artifact shape.
  sync       Non-destructively refresh workflow contracts and detected adapters.
  doctor     Check managed workflow and adapter files for missing or stale templates.
  status     Print a low-context Agent read model for current workflow state.
  brief      Alias for status, named for Agent entry and handoff.
  inspect    Aggregate Agent entry context, health, next-command readiness, and read order.
  context    Materialize a bounded Agent context packet for a /ow:* workflow command.
  check      Check readiness for a repo-local /ow:* workflow command.
  summaries  Inspect summary/current-slice health for workflow artifacts.
  summarize  Dry-run or write deterministic SUMMARY.yaml refreshes.
  clean      Remove OpenWorkflow-generated project files. Dry-run unless --yes is passed.

Agent quick start:
  Read AGENTS.md, then run openworkflow inspect --root . --json. Inspect starts
  from .openworkflow/CURRENT_STATE.yaml and returns read_order before loading
  full evidence. Prefer SUMMARY.yaml/current_slice guidance when a long artifact
  offers it. Use --json when an Agent needs structured command output.
  Use openworkflow context --root . --json when you want OpenWorkflow to package
  the next command's bounded startup context instead of reading files one by one.

Two command surfaces:
  CLI maintenance commands keep OpenWorkflow installed and current:
    init       Create the minimal workflow root, AGENTS.md guide, and tool adapters.
    sync       Detect current platforms, refresh managed workflow files, and sync adapters.
    validate   Check .openworkflow contract shape and source-of-truth artifacts; SUMMARY.yaml freshness is checked by summaries.
    doctor     Report missing or stale generated surfaces, and surface summary-health warnings.
    inspect    Recommended Agent entry command; aggregates state, health, readiness, and read order.
    context    Read-only packet materializer for Agent startup. Defaults to CURRENT_STATE.next_command; use --for /ow:<command> and --max-bytes to bound included content.
    status     Summarize current state, health, read order, and git state.
    brief      Same read model as status; use when entering a repo as an Agent.
    check      Verify required/forbidden context before starting a /ow:* command.
    summaries  Check whether low-context summaries can be trusted before raw evidence; requires an initialized .openworkflow root.
    summarize  Preview SUMMARY.yaml refreshes; pass --write to update summary files without touching source artifacts.
    clean      Remove generated OpenWorkflow surfaces without touching user content.

  Agent-readable JSON:
    Every command supports --json. In JSON mode stdout is a single report object
    with schema_version, command, ok, root, data, warnings, errors, effects, and
    next_actions.
    Use summaries --json before loading raw evidence when summary/current-slice
    health is unknown.

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
