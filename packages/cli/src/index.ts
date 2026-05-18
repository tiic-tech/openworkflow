#!/usr/bin/env node
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { generateCodexAdapter } from "../../adapters/codex/src/generateCodexAdapter.js";
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
  }

  console.log(`Initialized OpenWorkflow at ${root}`);
  console.log(`.openworkflow written: ${result.written.length}, skipped: ${result.skipped.length}`);
  if (tools.includes("codex")) {
    console.log(`.codex adapter written: ${adapterWritten}, skipped: ${adapterSkipped}`);
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

function printHelp(): void {
  console.log(`OpenWorkflow CLI

Usage:
  openworkflow init <folder> --tools codex [--force]
  openworkflow validate --root <folder>

Commands:
  init       Initialize .openworkflow contracts and optional tool adapters.
  validate   Validate .openworkflow contract files.
`);
}

main().then((code) => {
  process.exitCode = code;
}).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
