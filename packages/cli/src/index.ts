#!/usr/bin/env node
import { booleanFlag, parseArgs } from "./args.js";
import { briefCommand } from "./commands/brief.js";
import { checkCommand } from "./commands/check.js";
import { cleanCommand } from "./commands/clean.js";
import { contextCommand } from "./commands/context.js";
import { doctorCommand } from "./commands/doctor.js";
import { draftCommand } from "./commands/draft.js";
import { gitAutomationCommand } from "./commands/gitAutomation.js";
import { handoffCommand } from "./commands/handoff.js";
import { initCommand } from "./commands/init.js";
import { inspectCommand } from "./commands/inspect.js";
import { registerCommand } from "./commands/register.js";
import { resumeCommand } from "./commands/resume.js";
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

  if (parsed.command === "handoff") {
    return handoffCommand(parsed.flags);
  }

  if (parsed.command === "resume") {
    return resumeCommand(parsed.flags);
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

  if (parsed.command === "draft") {
    return draftCommand(parsed.flags);
  }

  if (parsed.command === "register") {
    return registerCommand(parsed.flags);
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

  if (parsed.command === "git-automation") {
    return gitAutomationCommand(parsed.positional, parsed.flags);
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
  openworkflow handoff --root <folder> [--tools auto|codex] [--json]
  openworkflow resume --root <folder> [--tools auto|codex] [--json]
  openworkflow status --root <folder> [--json]
  openworkflow brief --root <folder> [--json]
  openworkflow inspect --root <folder> [--strict] [--json]
  openworkflow context --root <folder> [--for <ow-command>] [--mode compact|full] [--max-bytes <n>] [--handoff] [--json]
  openworkflow draft --root <folder> --artifact <type> --id <id> [--write] [--force] [--json]
  openworkflow register --root <folder> --artifact <path> [--current] [--next-command <ow-command>] [--write] [--json]
  openworkflow check <ow-command> --root <folder> [--json]
  openworkflow summaries --root <folder> [--strict] [--json]
  openworkflow summarize --root <folder> (--artifact <path>|--all) [--write] [--json]
  openworkflow git-automation <branch|commit|summary|remote|simulate|remote-plan|draft-pr> --root <folder> --queue <CANDIDATE_CHANGES.yaml> [--write] [--json]
  openworkflow clean --root <folder> --tools codex [--yes] [--force]

Commands:
  init       Initialize .openworkflow contracts and optional tool adapters.
  validate   Validate .openworkflow contract files and source artifact shape.
  sync       Non-destructively refresh workflow contracts and detected adapters.
  doctor     Check managed workflow and adapter files for missing or stale templates.
  handoff    Strict Agent trust gate for deciding whether current repo context is safe to continue.
  resume     Read-only Agent recovery cockpit for one low-context continuation packet.
  status     Print a low-context Agent read model for current workflow state.
  brief      Alias for status, named for Agent entry and handoff.
  inspect    Aggregate Agent entry context, health, next-command readiness, and read order.
  context    Materialize a bounded Agent context packet for a /ow:* workflow command.
  draft      Preview or create a contract-shaped source artifact draft.
  register   Preview or apply index/current-state registration for a source artifact.
  check      Check readiness for a repo-local /ow:* workflow command.
  summaries  Inspect summary/current-slice health for workflow artifacts.
  summarize  Dry-run or write deterministic SUMMARY.yaml refreshes.
  git-automation  Managed git lifecycle shell, read-only remote planning, and autonomous simulator; remote mutation is gated.
  clean      Remove OpenWorkflow-managed/generated files while preserving source artifacts. Dry-run unless --yes is passed.

Agent quick start:
  Read AGENTS.md. If this is a fresh Agent continuing after network loss,
  context overflow, compaction failure, or unexpected termination, run
  openworkflow resume --root . --json first. Resume gives one low-context
  recovery packet with project overview, trust state, active queue/work item,
  breakpoint, behavior boundaries, allowed work, validation expectations,
  git state, and the smallest correct OW-maintained next action.
  Run openworkflow handoff --root . --json when you only need the strict Agent
  trust gate before context loading. If you need a command-specific packet and
  the trust gate in one call, run openworkflow context --root . --handoff --json.
  Otherwise, run openworkflow context --root . --json after handoff passes.
  Inspect starts from .openworkflow/CURRENT_STATE.yaml and returns read_order
  before loading full evidence. Status and brief are lightweight summaries.
  Doctor confirms managed surface health, not handoff quality.
  Prefer SUMMARY.yaml/current_slice guidance when a long artifact offers it,
  but check summary quality fields before treating a current summary
  as a complete handoff. In context --json and doctor --json, read
  data.handoff_quality_ok and data.quality_summary for compact trust signals.
  Add --strict to summaries or inspect when thin source quality should block the Agent handoff.
  Use --json when an Agent needs structured command output.
  Use openworkflow context --root . --json when you want OpenWorkflow to package
  the next command's compact startup context instead of reading files one by one.

Two command surfaces:
  CLI maintenance commands keep OpenWorkflow installed and current:
    init       Create the minimal workflow root, AGENTS.md guide, and tool adapters.
    sync       Detect current platforms, refresh managed workflow files, and sync adapters.
    validate   Check .openworkflow contract shape and source-of-truth artifacts; SUMMARY.yaml freshness is checked by summaries.
    doctor     Report missing or stale generated surfaces, and separately report summary freshness and handoff quality.
    handoff    Strict read-only Agent trust gate; aggregates doctor-style surface health, inspect --strict quality, summaries --strict quality, and next-command readiness.
    resume     Read-only Agent recovery cockpit; aggregates handoff, inspect,
               summaries, check, current pointers, read order, evidence boundaries,
               active planning queue/work item, action boundaries, validation
               expectations, and git state into one continuation packet.
               Use it as the first command for interrupted-session recovery,
               not as a generic autonomous retry loop.
    inspect    Recommended Agent entry command; aggregates state, health, readiness, and read order. Add --strict to fail on current-but-thin summaries.
    context    Read-only packet materializer for Agent startup. Defaults to CURRENT_STATE.next_command and compact mode with a structured command_audit slice plus quality_summary; add --handoff to fail on strict handoff-quality blockers, or use --for /ow:<command>, --max-bytes, and --mode full when needed.
    draft      Preview a contract-shaped source artifact; pass --write to create it and --force only to replace an existing draft.
    register   Preview index registration for an existing source artifact; pass --write to update the index, and --current to update active pointers.
    status     Summarize current state, health, read order, and git state.
    brief      Same read model as status; use when entering a repo as an Agent.
    handoff    Use before context loading when you need one boolean for Agent continuation trust.
    check      Verify required/forbidden context, output boundaries, and current artifact usability before starting a /ow:* command.
    summaries  Check summary freshness and source quality before raw evidence; requires an initialized .openworkflow root. Add --strict to fail on current-but-thin source quality.
    summarize  Preview SUMMARY.yaml refreshes; pass --write to update summary files without touching source artifacts.
    git-automation  Preview or apply managed local git operations. In managed mode,
               branch, commit, and summary actions are local-only; remote push,
               PR creation, Issue mutation, and merge require explicit approval
               and are refused by this command shell. Use remote-plan for
               remote read-only PR-ready planning, draft-pr for the disabled-by-default
               draft PR pilot, and simulate for read-only autonomous push/PR/merge planning.
    clean      Remove generated OpenWorkflow surfaces and managed metadata without touching user content or source artifacts.

  Contract-defined read-only recovery:
    resume     Agent startup cockpit. The \`resume --json\` packet aggregates
               existing handoff, inspect, summaries, check, current pointers,
               read-order, planning queue, current work item, action/evidence
               boundaries, product-alignment signals, and git signals without
               mutating workflow state. It should route a fresh Agent into
               corrected, ranked atom-task continuation with explicit stop
               conditions instead of broad free-form replanning.

  Agent-readable JSON:
    Every command supports --json. In JSON mode stdout is a single report object
    with schema_version, command, ok, root, data, warnings, errors,
    health_errors, effects, and next_actions. When ok is false, the command
    exits nonzero but still prints the JSON report to stdout. Use health_errors
    for blocking health/readiness failures, errors for command/runtime failures,
    and warnings for non-blocking guidance.
    Use summaries --json before loading raw evidence when summary/current-slice
    health or source quality is unknown. Use summaries --strict --json, or
    inspect --strict --json at repo entry, when draft/thin sources must block trust.
    Use context --handoff --json when an Agent needs a bounded context packet and
    strict handoff-quality blocking in the same command.
    The resume packet contract uses the same report envelope and reserves
    data.command_boundary, data.trust, data.workflow, data.active_queue,
    data.current_work_item, data.actions, data.evidence, data.git, and
    data.sources for the read-only recovery model. Future project-local
    SOUL.md and MEMORY.md learning artifacts are separate governed features;
    resume does not create or evolve persistent project personality or memory.

  Repo-local workflow commands are Agent skills, not CLI subcommands:
    /ow:vision      clarify product vision through conversation-first discovery
    /ow:validation  define and assess the highest-risk validation target
    /ow:proto       create evidence-producing prototypes
    /ow:tune        revise the current prototype/design target
    /ow:design      turn accepted evidence into product design contracts
    /ow:spec        write production-ready implementation specs
    /ow:change      plan a concrete implementation change
    /ow:team        execute an approved change with runtime tracking
    /ow:decompose-to-changes  create or maintain candidate change queues
    /ow:analyze-changes       recommend the next candidate without selecting it
    /ow:select-change         prepare one selected change for implementation
    /ow:git-automation  operate the managed git lifecycle shell with remote approval gates

Lazy creation boundary:
  openworkflow init creates only the minimal .openworkflow setup. Stage artifacts
  are created by the first matching /ow:* workflow command, not by init.

Clean safety:
  clean removes managed .openworkflow metadata and generated tool adapters, but
  preserves source artifacts, SUMMARY.yaml, evidence, notes, and user AGENTS.md
  content. Use --json to inspect planned, removed, skipped, and preserved paths.

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
