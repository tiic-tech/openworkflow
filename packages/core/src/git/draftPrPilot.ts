import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { promisify } from "node:util";
import { planRemoteReadonly } from "./remoteReadonlyPlanner.js";

const execFileAsync = promisify(execFile);

export interface DraftPrPilotOptions {
  root: string;
  queuePath: string;
  baseRef?: string;
  targetRemote?: string;
  targetBase?: string;
  targetBranch?: string;
  prSummaryPath?: string;
  title?: string;
  allowDraftPr?: boolean;
  dryRun: boolean;
}

export interface DraftPrPilotResult {
  ok: boolean;
  mode: "draft-pr-pilot";
  mutation_performed: boolean;
  remotePlanOk: boolean;
  blockers: string[];
  warnings: string[];
  target: {
    remote: string;
    base: string;
    branch: string;
  };
  bodyDigest: string | null;
  managedBodyPreview: string | null;
  preview: {
    command: "gh";
    args: string[];
  } | null;
  prUrl: string | null;
  rollbackPlan: string[];
}

export async function pilotDraftPr(options: DraftPrPilotOptions): Promise<DraftPrPilotResult> {
  const remotePlan = await planRemoteReadonly(options);
  const target = {
    remote: remotePlan.targetIdentity.remote,
    base: remotePlan.targetIdentity.base,
    branch: remotePlan.targetIdentity.branch,
  };
  const prSummaryPath = remotePlan.localState.prSummaryPath;
  const prSummary = remotePlan.localState.prSummaryExists ? await readFile(join(options.root, prSummaryPath), "utf8") : "";
  const managedBody = prSummary ? managedPrBody(remotePlan.planId, prSummary) : null;
  const bodyDigest = managedBody ? digest(managedBody) : null;
  const existingPr = remotePlan.prState.items[0];
  const title = options.title ?? `OpenWorkflow ${remotePlan.planId}`;
  const preview = managedBody ? previewCommand(existingPr, target.branch, target.base, title) : null;
  const blockers = [
    ...remotePlan.blockers,
    ...(!remotePlan.remoteState.branchHead ? [`remote branch head is required before draft PR pilot: ${target.remote}/${target.branch}`] : []),
    ...(!managedBody ? [`PR-ready summary body is required: ${prSummaryPath}`] : []),
    ...(!options.dryRun && !options.allowDraftPr ? ["draft PR mutation requires --allow-draft-pr together with --write"] : []),
  ];
  if (blockers.length > 0 || options.dryRun) {
    return {
      ok: blockers.length === 0,
      mode: "draft-pr-pilot",
      mutation_performed: false,
      remotePlanOk: remotePlan.ok,
      blockers,
      warnings: [
        ...remotePlan.warnings,
        ...(options.dryRun ? ["draft-pr pilot dry-run did not create or edit a PR"] : []),
      ],
      target,
      bodyDigest,
      managedBodyPreview: managedBody,
      preview,
      prUrl: null,
      rollbackPlan: rollbackPlan(existingPr),
    };
  }

  const prUrl = await runGhPrMutation(options.root, preview, managedBody);
  return {
    ok: true,
    mode: "draft-pr-pilot",
    mutation_performed: true,
    remotePlanOk: remotePlan.ok,
    blockers: [],
    warnings: remotePlan.warnings,
    target,
    bodyDigest,
    managedBodyPreview: managedBody,
    preview,
    prUrl,
    rollbackPlan: rollbackPlan(existingPr),
  };
}

function previewCommand(existingPr: Record<string, unknown> | undefined, branch: string, base: string, title: string): DraftPrPilotResult["preview"] {
  if (existingPr?.number) {
    return {
      command: "gh",
      args: ["pr", "edit", String(existingPr.number), "--title", title, "--body-file", "<managed-body-file>"],
    };
  }
  return {
    command: "gh",
    args: ["pr", "create", "--draft", "--base", base, "--head", branch, "--title", title, "--body-file", "<managed-body-file>"],
  };
}

async function runGhPrMutation(root: string, preview: DraftPrPilotResult["preview"], managedBody: string | null): Promise<string | null> {
  if (!preview || !managedBody) {
    return null;
  }
  const tempRoot = await mkdtemp(join(tmpdir(), "openworkflow-draft-pr-"));
  const bodyPath = join(tempRoot, "body.md");
  try {
    await writeFile(bodyPath, managedBody, "utf8");
    const args = preview.args.map((arg) => arg === "<managed-body-file>" ? bodyPath : arg);
    const { stdout } = await execFileAsync(preview.command, args, { cwd: root });
    return stdout.trim().split("\n").find((line) => line.startsWith("http")) ?? null;
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

function managedPrBody(planId: string, summary: string): string {
  const content = summary.trim();
  const contentDigest = digest(content);
  return [
    `<!-- openworkflow:managed:start plan=${planId} digest=${contentDigest} -->`,
    content,
    "<!-- openworkflow:managed:end -->",
    "",
  ].join("\n");
}

function digest(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function rollbackPlan(existingPr: Record<string, unknown> | undefined): string[] {
  if (existingPr?.number) {
    return [
      `restore the previous managed PR body section for PR #${String(existingPr.number)}`,
      "if restore is unsafe, leave a follow-up comment and stop for human review",
    ];
  }
  return [
    "close the draft PR if it was created with the wrong branch, base, or body",
    "do not merge or mark ready for review from the pilot",
  ];
}
