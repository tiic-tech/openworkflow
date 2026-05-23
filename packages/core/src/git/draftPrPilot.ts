import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { createHash } from "node:crypto";
import { promisify } from "node:util";
import type { BranchIdentityAssessment } from "./branchIdentity.js";
import { planRemoteReadonly } from "./remoteReadonlyPlanner.js";
import { dumpYaml } from "../contracts/yaml.js";

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
  approvalEvidence?: string;
  auditEvidencePath?: string;
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
    branchMatchesCurrent: boolean | null;
    branchOwnsPlan: boolean | null;
  };
  branchIdentity: BranchIdentityAssessment;
  bodyDigest: string | null;
  managedBodyPreview: string | null;
  preview: {
    command: "gh";
    args: string[];
  } | null;
  operation: {
    kind: "create" | "edit" | "none";
    outcome: "blocked" | "preview" | "created" | "edited" | "no-op";
    approvalEvidence: string | null;
    auditEvidencePath: string | null;
    targetPr: string | null;
  };
  prUrl: string | null;
  rollbackPlan: string[];
}

export async function pilotDraftPr(options: DraftPrPilotOptions): Promise<DraftPrPilotResult> {
  const remotePlan = await planRemoteReadonly(options);
  const target = {
    remote: remotePlan.targetIdentity.remote,
    base: remotePlan.targetIdentity.base,
    branch: remotePlan.targetIdentity.branch,
    branchMatchesCurrent: remotePlan.targetIdentity.branchMatchesCurrent,
    branchOwnsPlan: remotePlan.targetIdentity.branchOwnsPlan,
  };
  const prSummaryPath = remotePlan.localState.prSummaryPath;
  const prSummary = remotePlan.localState.prSummaryExists ? await readFile(join(options.root, prSummaryPath), "utf8") : "";
  const managedBody = prSummary ? managedPrBody(remotePlan.planId, prSummary) : null;
  const bodyDigest = managedBody ? digest(managedBody) : null;
  const existingPr = remotePlan.prState.items[0];
  const title = options.title ?? `OpenWorkflow ${remotePlan.planId}`;
  const preview = managedBody ? previewCommand(existingPr, target.branch, target.base, title) : null;
  const operationKind = preview ? draftPrOperation(existingPr) : "none";
  const approvalEvidence = options.approvalEvidence?.trim() || null;
  const auditEvidencePath = options.auditEvidencePath ?? defaultAuditEvidencePath(options.queuePath);
  const blockers = [
    ...remotePlan.blockers,
    ...(!remotePlan.remoteState.branchHead ? [`remote branch head is required before draft PR pilot: ${target.remote}/${target.branch}`] : []),
    ...(!managedBody ? [`PR-ready summary body is required: ${prSummaryPath}`] : []),
    ...(!options.dryRun && !options.allowDraftPr ? ["draft PR mutation requires --allow-draft-pr together with --write"] : []),
    ...(!options.dryRun && !approvalEvidence ? ["draft PR mutation requires --approval-evidence naming explicit operation-level approval"] : []),
  ];
  if (blockers.length > 0 || options.dryRun) {
    const outcome = blockers.length > 0 ? "blocked" : options.dryRun ? "preview" : "no-op";
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
      branchIdentity: remotePlan.targetIdentity.branchIdentity,
      bodyDigest,
      managedBodyPreview: managedBody,
      preview,
      operation: {
        kind: operationKind,
        outcome,
        approvalEvidence,
        auditEvidencePath: null,
        targetPr: existingPrTarget(existingPr),
      },
      prUrl: null,
      rollbackPlan: rollbackPlan(existingPr),
    };
  }

  await ensurePathInsideRoot(options.root, auditEvidencePath);
  const prUrl = await runGhPrMutation(options.root, preview, managedBody);
  const operationOutcome = operationKind === "edit" ? "edited" : operationKind === "create" ? "created" : "no-op";
  await writeDraftPrAuditEvidence(options.root, auditEvidencePath, {
    schema_version: "0.1.0",
    contract_type: "audit",
    artifact_type: "draft_pr_operation_evidence",
    plan_id: remotePlan.planId,
    queue_path: options.queuePath,
    operation_kind: operationKind,
    target: {
      remote: target.remote,
      branch: target.branch,
      base: target.base,
      pr_url: prUrl ?? stringValue(existingPr?.url),
      pr_number: existingPr?.number ? String(existingPr.number) : null,
    },
    body_digest: bodyDigest,
    approval_source: approvalEvidence,
    timestamp: new Date().toISOString(),
    result: {
      mutation_performed: true,
      outcome: operationOutcome,
      pr_url: prUrl,
    },
    rollback_guidance: rollbackPlan(existingPr),
  });
  return {
    ok: true,
    mode: "draft-pr-pilot",
    mutation_performed: true,
    remotePlanOk: remotePlan.ok,
    blockers: [],
    warnings: remotePlan.warnings,
    target,
    branchIdentity: remotePlan.targetIdentity.branchIdentity,
    bodyDigest,
    managedBodyPreview: managedBody,
    preview,
    operation: {
      kind: operationKind,
      outcome: operationOutcome,
      approvalEvidence,
      auditEvidencePath,
      targetPr: prUrl ?? existingPrTarget(existingPr),
    },
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

function draftPrOperation(existingPr: Record<string, unknown> | undefined): "create" | "edit" {
  return existingPr?.number ? "edit" : "create";
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

async function writeDraftPrAuditEvidence(root: string, path: string, evidence: unknown): Promise<void> {
  const outputPath = await ensurePathInsideRoot(root, path);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, dumpYaml(evidence), "utf8");
}

async function ensurePathInsideRoot(root: string, path: string): Promise<string> {
  const rootPath = resolve(root);
  const outputPath = resolve(rootPath, path);
  const relativePath = relative(rootPath, outputPath);
  if (!relativePath || relativePath.startsWith("..") || isAbsolute(relativePath)) {
    throw new Error(`draft PR audit evidence path escapes root: ${path}`);
  }
  await mkdir(dirname(outputPath), { recursive: true });
  return outputPath;
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

function defaultAuditEvidencePath(queuePath: string): string {
  const parts = queuePath.split("/");
  parts[parts.length - 1] = "DRAFT_PR_OPERATION_EVIDENCE.yaml";
  return parts.join("/");
}

function existingPrTarget(existingPr: Record<string, unknown> | undefined): string | null {
  return stringValue(existingPr?.url) ?? (existingPr?.number ? `PR #${String(existingPr.number)}` : null);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
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
