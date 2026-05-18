#!/usr/bin/env node
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { doctorCodexAdapter, generateCodexAdapter } from "../../adapters/codex/src/generateCodexAdapter.js";
import { initOpenWorkflow } from "../../core/src/initOpenWorkflow.js";
import { validateOpenWorkflow } from "../../core/src/validateOpenWorkflow.js";
import { booleanFlag, parseArgs, stringFlag } from "./args.js";

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

async function initCommand(positional: string[], flags: Map<string, string | boolean>): Promise<number> {
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
    printWarnings(adapter.warnings);
  }

  console.log(`Initialized OpenWorkflow at ${root}`);
  console.log(`.openworkflow written: ${result.written.length}, skipped: ${result.skipped.length}`);
  if (tools.includes("codex")) {
    console.log(`.codex adapter written: ${adapterWritten}, skipped: ${adapterSkipped}, unchanged: ${adapterUnchanged}`);
  }
  return 0;
}

async function validateCommand(flags: Map<string, string | boolean>): Promise<number> {
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

async function syncCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const tools = parseTools(stringFlag(flags, "tools", "codex"));
  const force = booleanFlag(flags, "force");
  const projectTitle = stringFlag(flags, "project-title") ?? basenameForTitle(root);
  const projectSlug = slugify(stringFlag(flags, "project-slug") ?? projectTitle);

  if (!tools.includes("codex")) {
    console.error("No supported tools selected. M05 supports --tools codex.");
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

async function doctorCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const tools = parseTools(stringFlag(flags, "tools", "codex"));

  if (!tools.includes("codex")) {
    console.error("No supported tools selected. M05 supports --tools codex.");
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

function parseTools(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }
  return raw.split(",").map((tool) => tool.trim()).filter(Boolean);
}

function basenameForTitle(path: string): string {
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts.at(-1) ?? "OpenWorkflow Project";
}

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "project";
}

function printWarnings(warnings: string[]): void {
  for (const warning of warnings) {
    console.warn(`Warning: ${warning}`);
  }
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
