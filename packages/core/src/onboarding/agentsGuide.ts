import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { isNotFound, readTextFile } from "../fs/index.js";
import type { CleanResult, CleanTarget } from "../workflow/cleanOpenWorkflow.js";

export const AGENTS_GUIDE_PATH = "AGENTS.md";
export const AGENTS_GUIDE_TEMPLATE_ID = "openworkflow.agents-guide.v1";
export const AGENTS_GUIDE_BEGIN = `<!-- BEGIN OPENWORKFLOW AGENT GUIDE generated-by: openworkflow; template-id: ${AGENTS_GUIDE_TEMPLATE_ID} -->`;
export const AGENTS_GUIDE_END = "<!-- END OPENWORKFLOW AGENT GUIDE -->";

export interface AgentsGuideSyncResult {
  path: string;
  action: "created" | "appended" | "updated" | "unchanged";
}

export interface AgentsGuideDoctorResult {
  ok: boolean;
  warnings: string[];
  errors: string[];
}

export function renderAgentsGuide(): string {
  return `${AGENTS_GUIDE_BEGIN}
## OpenWorkflow

- Run \`openworkflow --help\` first when you need current CLI capabilities, workflow command boundaries, or maintenance commands.
- Prefer \`--json\` for structured command output; every OpenWorkflow CLI command supports a JSON report envelope for Agent consumption.
- Treat JSON \`ok:false\` as a failed command: OpenWorkflow exits nonzero but still writes the parseable JSON report to stdout. Read \`health_errors\` for blocking health/readiness failures, \`errors\` for command/runtime failures, and \`warnings\` for non-blocking guidance.
- Start with \`openworkflow inspect --root . --json\` for the aggregated Agent entry read model, health, next-command readiness, and read order; add \`--strict\` when current-but-thin summary quality should block handoff trust.
- Start every workflow turn by reading \`.openworkflow/CURRENT_STATE.yaml\`, then follow its \`read_this_first\` pointers before loading full evidence.
- CLI commands maintain and summarize the repo-local workflow surface: \`init\`, \`sync\`, \`validate\`, \`doctor\`, \`inspect\`, \`context\`, \`draft\`, \`register\`, \`status\`, \`brief\`, \`check\`, \`summaries\`, and \`clean\`.
- Use \`openworkflow context --root . --json\` to materialize a compact startup packet for \`CURRENT_STATE.next_command\`; compact mode returns a structured \`command_audit\` slice instead of full audit source. Add \`--for /ow:<command>\`, \`--max-bytes <n>\`, or \`--mode full\` when you need a specific workflow command, tighter budget, or full managed audit source.
- Use \`openworkflow draft --root . --artifact <type> --id <id> --json\` to preview a contract-shaped source artifact; add \`--write\` only when the active \`/ow:*\` workflow step should create that artifact.
- Use \`openworkflow register --root . --artifact <path> --json\` after a source artifact exists to preview index registration; add \`--write\` to make it visible to read models, and \`--current\` only when it should become the active pointer.
- Use \`openworkflow brief --root .\` or \`openworkflow status --root .\` for a low-context Agent read model before deciding what to inspect next; use \`--json\` when another tool needs structured data.
- Use \`openworkflow check /ow:<command> --root . --json\` before uncertain workflow work to verify required context, forbidden context, output boundaries, current artifact usability, and next actions.
- Use \`openworkflow summaries --root . --json\` before loading raw evidence when artifact summaries or current slices may be missing, stale, or current-but-thin; add \`--strict\` to make draft/thin source quality return \`ok:false\`. Freshness and source artifact quality are separate signals.
- Use \`openworkflow summarize --root . --artifact <path> --json\` to preview SUMMARY.yaml refreshes; add \`--write\` only when you intend to update summary files without changing source artifacts.
- Use \`openworkflow validate --root . --json\` for contract shape; SUMMARY.yaml trust is checked by \`summaries\`, not by \`validate\`.
- Use \`openworkflow clean --root . --tools codex --json\` to preview managed/generated cleanup; \`--yes\` removes OpenWorkflow managed metadata and generated adapter files while preserving source artifacts, SUMMARY.yaml, evidence, notes, and user AGENTS.md content.
- Repo-local workflow commands are delivered as Agent skills under \`.agents/skills/ow-*/SKILL.md\` and map to semantic commands: \`/ow:vision\`, \`/ow:validation\`, \`/ow:proto\`, \`/ow:tune\`, \`/ow:design\`, \`/ow:spec\`, \`/ow:change\`, and \`/ow:team\`.
- Respect lazy creation: \`openworkflow init\` only creates the minimal workflow root; stage artifacts must be created only by the first matching \`/ow:*\` command.
- Prefer summary/current-state files for orientation, and load raw evidence only when the current task requires it.
${AGENTS_GUIDE_END}
`;
}

export async function syncAgentsGuide(root: string): Promise<AgentsGuideSyncResult> {
  const path = join(root, AGENTS_GUIDE_PATH);
  const existing = await readOptional(path);
  const next = upsertAgentsGuide(existing);
  if (!next.changed) {
    return { path, action: "unchanged" };
  }
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, next.content, "utf8");
  return { path, action: next.action };
}

export async function doctorAgentsGuide(root: string): Promise<AgentsGuideDoctorResult> {
  const path = join(root, AGENTS_GUIDE_PATH);
  const content = await readOptional(path);
  if (content === null) {
    return {
      ok: true,
      warnings: [`${AGENTS_GUIDE_PATH} is missing; run openworkflow sync to create the Agent onboarding guide.`],
      errors: [],
    };
  }
  if (!hasAgentsGuide(content)) {
    return {
      ok: true,
      warnings: [`${AGENTS_GUIDE_PATH} has no OpenWorkflow managed block; run openworkflow sync to append it without changing existing content.`],
      errors: [],
    };
  }
  if (!isAgentsGuideCurrent(content)) {
    return {
      ok: true,
      warnings: [`${AGENTS_GUIDE_PATH} OpenWorkflow managed block is stale; run openworkflow sync to refresh it.`],
      errors: [],
    };
  }
  return { ok: true, warnings: [], errors: [] };
}

export async function cleanAgentsGuide(options: { root: string; yes: boolean }): Promise<CleanResult> {
  const dryRun = !options.yes;
  const path = join(options.root, AGENTS_GUIDE_PATH);
  const planned: CleanTarget[] = [];
  const removed: string[] = [];
  const updated: string[] = [];
  const skipped: string[] = [];
  const preserved: string[] = [];
  const warnings: string[] = [];
  const content = await readOptional(path);

  if (content === null || !hasAgentsGuide(content)) {
    return { planned, removed, updated, skipped, preserved, warnings, dryRun };
  }

  planned.push({ path, reason: "OpenWorkflow AGENTS.md managed block" });
  if (dryRun) {
    return { planned, removed, updated, skipped, preserved, warnings, dryRun };
  }

  const next = removeAgentsGuide(content);
  if (!next.changed) {
    return { planned, removed, updated, skipped, preserved, warnings, dryRun };
  }
  await writeFile(path, next.content, "utf8");
  updated.push(path);
  preserved.push(path);
  return { planned, removed, updated, skipped, preserved, warnings, dryRun };
}

export function hasAgentsGuide(content: string): boolean {
  return content.includes(AGENTS_GUIDE_BEGIN) && content.includes(AGENTS_GUIDE_END);
}

export function isAgentsGuideCurrent(content: string): boolean {
  return hasAgentsGuide(content) && replaceAgentsGuideBlock(content, renderAgentsGuide()) === normalizeFinalNewline(content);
}

export function upsertAgentsGuide(existing: string | null): {
  content: string;
  changed: boolean;
  action: "created" | "appended" | "updated" | "unchanged";
} {
  const guide = renderAgentsGuide();
  if (existing === null || existing.trim() === "") {
    return { content: guide, changed: true, action: "created" };
  }
  if (hasAgentsGuide(existing)) {
    const content = replaceAgentsGuideBlock(existing, guide);
    if (content === normalizeFinalNewline(existing)) {
      return { content, changed: false, action: "unchanged" };
    }
    return { content, changed: true, action: "updated" };
  }
  return {
    content: `${existing.replace(/\s+$/u, "")}\n\n${guide}`,
    changed: true,
    action: "appended",
  };
}

export function removeAgentsGuide(existing: string): { content: string; changed: boolean } {
  if (!hasAgentsGuide(existing)) {
    return { content: existing, changed: false };
  }
  const content = existing.replace(blockPattern(), "").replace(/\n{3,}/gu, "\n\n").trim();
  return {
    content: content.length > 0 ? `${content}\n` : "",
    changed: true,
  };
}

async function readOptional(path: string): Promise<string | null> {
  try {
    return await readTextFile(path);
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }
}

function replaceAgentsGuideBlock(content: string, replacement: string): string {
  return normalizeFinalNewline(content.replace(blockPattern(), replacement.trimEnd()));
}

function blockPattern(): RegExp {
  return new RegExp(`${escapeRegExp(AGENTS_GUIDE_BEGIN)}[\\s\\S]*?${escapeRegExp(AGENTS_GUIDE_END)}\\n?`, "u");
}

function normalizeFinalNewline(content: string): string {
  return content.endsWith("\n") ? content : `${content}\n`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
