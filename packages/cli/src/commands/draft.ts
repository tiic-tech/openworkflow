import { mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { getDiscoveryArtifactContracts, type DiscoveryArtifactContract } from "../../../core/src/artifacts/registry.js";
import { dumpYaml } from "../../../core/src/contracts/yaml.js";
import { isNotFound } from "../../../core/src/fs/index.js";
import { booleanFlag, stringFlag } from "../args.js";
import { emptyEffects, printJsonReport, type CliEffects } from "../report.js";

interface DraftModel {
  artifact_type: string;
  id: string;
  write: boolean;
  force: boolean;
  path: string;
  contract: {
    command: string;
    source_of_truth_path: string;
    index_path: string;
    summary_policy: string | null;
  };
  content: string;
}

export async function draftCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const json = booleanFlag(flags, "json");
  const write = booleanFlag(flags, "write");
  const force = booleanFlag(flags, "force");
  const artifactType = stringFlag(flags, "artifact");
  const id = stringFlag(flags, "id");

  if (!(await isInitialized(root))) {
    return finishError(root, json, "missing OpenWorkflow artifact contracts: .openworkflow/audit/ARTIFACT_CONTRACTS.yaml", [
      "run openworkflow init <folder> --tools codex, or run openworkflow sync on an initialized project",
    ]);
  }
  if (!artifactType) {
    return finishError(root, json, "missing --artifact <type>", ["run openworkflow draft --root . --artifact validation_target --id val-1 --json"]);
  }
  if (!id || !isSafeId(id)) {
    return finishError(root, json, "invalid --id; use lowercase letters, numbers, dots, underscores, or hyphens", [
      "rerun with an id like val-1 or proto-2026-05-20",
    ]);
  }

  const contract = getDiscoveryArtifactContracts().find((item) => item.artifactType === artifactType);
  if (!contract) {
    return finishError(root, json, `unknown artifact type: ${artifactType}`, [
      `supported artifact types: ${getDiscoveryArtifactContracts().map((item) => item.artifactType).join(", ")}`,
    ]);
  }

  const model = buildDraftModel(contract, id, write, force);
  const effects = await applyDraft(root, model, write, force);
  const ok = effects.skipped.length === 0;
  const warnings = effects.skipped.map((item) => item);
  const errors = ok ? [] : effects.skipped;
  if (json) {
    printJsonReport({
      command: "draft",
      ok,
      root,
      data: model,
      warnings,
      errors,
      effects,
      next_actions: ok
        ? [`edit ${model.path} with task-specific content`, "run openworkflow validate --root . --json"]
        : ["rerun with --force only if replacing the existing draft is intended"],
    });
  } else {
    printDraft(model, effects);
  }
  return ok ? 0 : 1;
}

function buildDraftModel(contract: DiscoveryArtifactContract, id: string, write: boolean, force: boolean): DraftModel {
  const path = replaceId(contract.sourceOfTruthPath, id);
  return {
    artifact_type: contract.artifactType,
    id,
    write,
    force,
    path,
    contract: {
      command: contract.command,
      source_of_truth_path: contract.sourceOfTruthPath,
      index_path: contract.indexPath,
      summary_policy: contract.summaryPolicy?.strategy ?? null,
    },
    content: dumpYaml(replacePlaceholders(contract.template, id)),
  };
}

async function applyDraft(root: string, model: DraftModel, write: boolean, force: boolean): Promise<CliEffects> {
  const effects = emptyEffects();
  const absolutePath = join(root, model.path);
  const normalized = relative(root, absolutePath);
  if (normalized.startsWith("..")) {
    effects.skipped.push(`draft path escapes root: ${model.path}`);
    return effects;
  }
  if (await exists(absolutePath)) {
    if (!force) {
      effects.skipped.push(`artifact already exists: ${model.path}`);
      return effects;
    }
    if (!write) {
      effects.planned.push(model.path);
      return effects;
    }
    await writeArtifact(absolutePath, model.content);
    effects.updated.push(model.path);
    return effects;
  }
  if (!write) {
    effects.planned.push(model.path);
    return effects;
  }
  await writeArtifact(absolutePath, model.content);
  effects.written.push(model.path);
  return effects;
}

async function writeArtifact(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
}

async function isInitialized(root: string): Promise<boolean> {
  return exists(join(root, ".openworkflow", "audit", "ARTIFACT_CONTRACTS.yaml"));
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (isNotFound(error)) {
      return false;
    }
    throw error;
  }
}

function replacePlaceholders(value: unknown, id: string): unknown {
  if (typeof value === "string") {
    return replaceId(value, id);
  }
  if (Array.isArray(value)) {
    return value.map((item) => replacePlaceholders(item, id));
  }
  if (isRecord(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replacePlaceholders(item, id)]));
  }
  return value;
}

function replaceId(value: string, id: string): string {
  return value.replaceAll("<id>", id);
}

function isSafeId(value: string): boolean {
  return /^[a-z0-9][a-z0-9._-]*$/u.test(value) && !value.includes("..") && !value.includes("/") && !value.includes("\\");
}

function printDraft(model: DraftModel, effects: CliEffects): void {
  console.log("OpenWorkflow draft");
  console.log(`artifact_type: ${model.artifact_type}`);
  console.log(`id: ${model.id}`);
  console.log(`path: ${model.path}`);
  console.log(`write: ${model.write}`);
  console.log(`force: ${model.force}`);
  console.log(`planned: ${effects.planned.length}, written: ${effects.written.length}, updated: ${effects.updated.length}, skipped: ${effects.skipped.length}`);
  if (!model.write) {
    console.log("---");
    console.log(model.content.trimEnd());
  }
}

function finishError(root: string, json: boolean, error: string, nextActions: string[]): number {
  if (json) {
    printJsonReport({
      command: "draft",
      ok: false,
      root,
      data: { ok: false },
      warnings: [],
      errors: [error],
      effects: emptyEffects(),
      next_actions: nextActions,
    });
  } else {
    console.error(error);
  }
  return 1;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
