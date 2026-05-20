import { mkdir, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { getDiscoveryArtifactContracts, type DiscoveryArtifactContract } from "../../../core/src/artifacts/registry.js";
import { SCHEMA_VERSION } from "../../../core/src/contracts/index.js";
import { dumpYaml, parseYaml } from "../../../core/src/contracts/yaml.js";
import { isNotFound, readTextFile } from "../../../core/src/fs/index.js";
import { booleanFlag, stringFlag } from "../args.js";
import { emptyEffects, printJsonReport, type CliEffects } from "../report.js";

interface RegisterModel {
  artifact_path: string;
  artifact_type: string;
  id: string;
  write: boolean;
  current: boolean;
  next_command: string | null;
  index_path: string;
  index_entry: Record<string, unknown>;
  current_state_patch: Record<string, unknown> | null;
}

interface RegisterPlan {
  model: RegisterModel;
  indexContent: string;
  currentStateContent: string | null;
  indexExists: boolean;
}

export async function registerCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const json = booleanFlag(flags, "json");
  const write = booleanFlag(flags, "write");
  const current = booleanFlag(flags, "current");
  const artifactInput = stringFlag(flags, "artifact");
  const nextCommand = stringFlag(flags, "next-command") ?? null;

  if (!(await exists(join(root, ".openworkflow", "audit", "ARTIFACT_CONTRACTS.yaml")))) {
    return finishError(root, json, "missing OpenWorkflow artifact contracts: .openworkflow/audit/ARTIFACT_CONTRACTS.yaml", [
      "run openworkflow init <folder> --tools codex, or run openworkflow sync on an initialized project",
    ]);
  }
  if (!artifactInput) {
    return finishError(root, json, "missing --artifact <path>", [
      "run openworkflow register --root . --artifact .openworkflow/validation/val-1/VALIDATION.yaml --json",
    ]);
  }
  if (nextCommand && !current) {
    return finishError(root, json, "--next-command requires --current", ["rerun with --current, or omit --next-command"]);
  }
  if (nextCommand && !nextCommand.startsWith("/ow:")) {
    return finishError(root, json, "invalid --next-command; expected /ow:<command>", ["rerun with --next-command /ow:proto"]);
  }

  let plan: RegisterPlan;
  try {
    plan = await buildRegisterPlan(root, artifactInput, write, current, nextCommand);
  } catch (error) {
    return finishError(root, json, error instanceof Error ? error.message : String(error), [
      "run openworkflow draft --root . --artifact <type> --id <id> --write --json before registering a new artifact",
    ]);
  }

  const effects = await applyPlan(root, plan, write);
  if (json) {
    printJsonReport({
      command: "register",
      ok: true,
      root,
      data: plan.model,
      warnings: [],
      errors: [],
      effects,
      next_actions: ["run openworkflow validate --root . --json", "run openworkflow inspect --root . --json"],
    });
  } else {
    printRegister(plan.model, effects);
  }
  return 0;
}

async function buildRegisterPlan(
  root: string,
  artifactInput: string,
  write: boolean,
  current: boolean,
  nextCommand: string | null,
): Promise<RegisterPlan> {
  const artifactPath = normalizeRelativePath(root, artifactInput);
  const contract = contractForPath(artifactPath);
  if (!contract) {
    throw new Error(`artifact path does not match a source-of-truth contract: ${artifactInput}`);
  }
  const id = artifactIdForPath(artifactPath, contract.sourceOfTruthPath);
  if (!id) {
    throw new Error(`could not resolve artifact id from path: ${artifactInput}`);
  }
  const artifact = await readYamlRecord(join(root, artifactPath));
  if (artifact.artifact_type !== contract.artifactType) {
    throw new Error(`artifact_type mismatch: expected ${contract.artifactType}, found ${String(artifact.artifact_type)}`);
  }

  const entry = indexEntryFor(contract, id, artifactPath, artifact);
  const existingIndex = await readYamlRecordOptional(join(root, contract.indexPath));
  const index = updateIndex(contract, id, entry, existingIndex, current);
  const currentStatePatch = current ? currentStatePatchFor(contract, artifactPath, nextCommand) : null;
  const currentStateContent = current
    ? dumpYaml(updateCurrentState(await readYamlRecord(join(root, ".openworkflow", "CURRENT_STATE.yaml")), currentStatePatch ?? {}))
    : null;

  return {
    model: {
      artifact_path: artifactPath,
      artifact_type: contract.artifactType,
      id,
      write,
      current,
      next_command: nextCommand,
      index_path: contract.indexPath,
      index_entry: entry,
      current_state_patch: currentStatePatch,
    },
    indexContent: dumpYaml(index),
    currentStateContent,
    indexExists: existingIndex !== null,
  };
}

async function applyPlan(root: string, plan: RegisterPlan, write: boolean): Promise<CliEffects> {
  const effects = emptyEffects();
  if (!write) {
    effects.planned.push(plan.model.index_path);
    if (plan.currentStateContent !== null) {
      effects.planned.push(".openworkflow/CURRENT_STATE.yaml");
    }
    return effects;
  }

  await writeText(join(root, plan.model.index_path), plan.indexContent);
  if (plan.indexExists) {
    effects.updated.push(plan.model.index_path);
  } else {
    effects.written.push(plan.model.index_path);
  }
  if (plan.currentStateContent !== null) {
    await writeText(join(root, ".openworkflow", "CURRENT_STATE.yaml"), plan.currentStateContent);
    effects.updated.push(".openworkflow/CURRENT_STATE.yaml");
  }
  return effects;
}

function updateIndex(
  contract: DiscoveryArtifactContract,
  id: string,
  entry: Record<string, unknown>,
  existing: Record<string, unknown> | null,
  current: boolean,
): Record<string, unknown> {
  const pointer = contract.activePointer;
  const index = existing ?? {
    schema_version: SCHEMA_VERSION,
    contract_id: `index:${contract.contractType}`,
    contract_type: contract.contractType,
    title: `${contract.title} index`,
    status: "active",
    [pointer.pointerKey]: null,
    [pointer.collectionKey]: [],
    updated_at: null,
  };
  const existingCollection = index[pointer.collectionKey];
  const collection = Array.isArray(existingCollection) ? [...existingCollection] : [];
  const nextCollection = collection.filter((item) => !isRecord(item) || item[pointer.idKey] !== id);
  nextCollection.push(entry);
  index[pointer.collectionKey] = nextCollection;
  if (current) {
    index[pointer.pointerKey] = id;
  } else if (!(pointer.pointerKey in index)) {
    index[pointer.pointerKey] = null;
  }
  return index;
}

function indexEntryFor(
  contract: DiscoveryArtifactContract,
  id: string,
  artifactPath: string,
  artifact: Record<string, unknown>,
): Record<string, unknown> {
  return {
    [contract.activePointer.idKey]: id,
    [contract.activePointer.pathKey]: artifactPath,
    artifact_type: contract.artifactType,
    title: typeof artifact.title === "string" ? artifact.title : contract.title,
    status: typeof artifact.status === "string" ? artifact.status : "draft",
  };
}

function currentStatePatchFor(
  contract: DiscoveryArtifactContract,
  artifactPath: string,
  nextCommand: string | null,
): Record<string, unknown> {
  return {
    active_stage: contract.contractType,
    [contract.activePointer.pointerKey]: artifactPath,
    ...(nextCommand ? { next_command: nextCommand } : {}),
  };
}

function updateCurrentState(currentState: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  return { ...currentState, ...patch };
}

function contractForPath(artifactPath: string): DiscoveryArtifactContract | null {
  return getDiscoveryArtifactContracts().find((contract) => artifactMatchesContract(artifactPath, contract)) ?? null;
}

function artifactMatchesContract(artifactPath: string, contract: DiscoveryArtifactContract): boolean {
  const [prefix, suffix = ""] = contract.sourceOfTruthPath.split("<id>");
  return Boolean(prefix && artifactPath.startsWith(prefix) && artifactPath.endsWith(suffix));
}

function artifactIdForPath(artifactPath: string, sourcePath: string): string | null {
  const [prefix, suffix = ""] = sourcePath.split("<id>");
  if (!prefix || !artifactPath.startsWith(prefix) || !artifactPath.endsWith(suffix)) {
    return null;
  }
  const id = artifactPath.slice(prefix.length, artifactPath.length - suffix.length);
  return id.length > 0 && !id.includes("/") ? id : null;
}

async function readYamlRecord(path: string): Promise<Record<string, unknown>> {
  const parsed = parseYaml(await readTextFile(path));
  if (!isRecord(parsed)) {
    throw new Error(`${basename(path)} must contain a YAML mapping`);
  }
  return parsed;
}

async function readYamlRecordOptional(path: string): Promise<Record<string, unknown> | null> {
  try {
    return await readYamlRecord(path);
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }
}

function normalizeRelativePath(root: string, path: string): string {
  const absolute = resolve(root, path);
  const relativePath = relative(root, absolute);
  if (relativePath.startsWith("..")) {
    throw new Error(`artifact path is outside root: ${path}`);
  }
  return relativePath;
}

async function writeText(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
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

function printRegister(model: RegisterModel, effects: CliEffects): void {
  console.log("OpenWorkflow register");
  console.log(`artifact_path: ${model.artifact_path}`);
  console.log(`artifact_type: ${model.artifact_type}`);
  console.log(`id: ${model.id}`);
  console.log(`index_path: ${model.index_path}`);
  console.log(`current: ${model.current}`);
  console.log(`next_command: ${model.next_command ?? "unchanged"}`);
  console.log(`planned: ${effects.planned.length}, written: ${effects.written.length}, updated: ${effects.updated.length}`);
}

function finishError(root: string, json: boolean, error: string, nextActions: string[]): number {
  if (json) {
    printJsonReport({
      command: "register",
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
