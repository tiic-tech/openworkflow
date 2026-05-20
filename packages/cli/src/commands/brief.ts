import { execFile } from "node:child_process";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { detectAdapterPlatforms, getAdapterEntry } from "../../../adapters/src/registry.js";
import { parseYaml } from "../../../core/src/contracts/yaml.js";
import { isNotFound, readTextFile } from "../../../core/src/fs/index.js";
import { doctorAgentsGuide } from "../../../core/src/onboarding/agentsGuide.js";
import { doctorOpenWorkflow } from "../../../core/src/workflow/doctorOpenWorkflow.js";
import { readWorkflowConfig } from "../../../core/src/workflow/readWorkflowConfig.js";
import { booleanFlag, stringFlag } from "../args.js";
import { basenameForTitle, parseTools, slugify } from "./shared.js";

const execFileAsync = promisify(execFile);

interface BriefModel {
  project: {
    title: string;
    slug: string;
    root: string;
    tools: string[];
    detected_tools: string[];
    unknown_configured_tools: string[];
  };
  workflow: {
    active_stage: string | null;
    next_command: string | null;
    blocked_by: string[];
    last_decision: Record<string, unknown> | null;
  };
  read_this_first: string[];
  active_pointers: Record<string, string | null>;
  health: {
    ok: boolean;
    workflow: HealthSection;
    adapters: Record<string, HealthSection>;
    agents_md: HealthSection;
    recommended_maintenance: string | null;
  };
  git: {
    available: boolean;
    branch: string | null;
    dirty: boolean;
    changed_files: string[];
  };
  agent_guidance: {
    recommended_next_action: string;
    safe_to_modify: string[];
    do_not_touch: string[];
  };
}

interface HealthSection {
  ok: boolean;
  warnings: string[];
  errors: string[];
}

export async function briefCommand(flags: Map<string, string | boolean>): Promise<number> {
  const root = resolve(stringFlag(flags, "root", ".") ?? ".");
  const json = booleanFlag(flags, "json");
  const model = await buildBriefModel(root, parseTools(stringFlag(flags, "tools")));
  if (json) {
    console.log(JSON.stringify(model, null, 2));
  } else {
    printBrief(model);
  }
  return 0;
}

async function buildBriefModel(root: string, explicitTools: string[]): Promise<BriefModel> {
  const config = await readWorkflowConfig(root);
  const detection = await detectAdapterPlatforms(root);
  const autoTools = explicitTools.length === 0 || explicitTools.includes("auto");
  const tools = autoTools ? detection.detected : explicitTools;
  const workflowTools = autoTools ? uniqueTools([...tools, ...detection.unknownConfigured]) : tools;
  const projectTitle = config?.projectTitle ?? basenameForTitle(root);
  const projectSlug = slugify(config?.projectSlug ?? projectTitle);
  const currentState = await readCurrentState(root);
  const workflowHealth = await doctorOpenWorkflow({
    root,
    projectTitle,
    projectSlug,
    tools: workflowTools,
    force: false,
  });
  const agentsGuideHealth = await doctorAgentsGuide(root);
  const adapterHealth: Record<string, HealthSection> = {};
  for (const tool of tools) {
    const adapter = getAdapterEntry(tool);
    if (!adapter) {
      adapterHealth[tool] = {
        ok: false,
        warnings: [],
        errors: [`unsupported adapter platform: ${tool}`],
      };
      continue;
    }
    adapterHealth[tool] = await adapter.doctor(root);
  }
  for (const tool of detection.unknownConfigured) {
    adapterHealth[tool] = {
      ok: false,
      warnings: [`configured tool is not supported by this OpenWorkflow version: ${tool}`],
      errors: [],
    };
  }

  const health = {
    ok: workflowHealth.ok && agentsGuideHealth.ok && Object.values(adapterHealth).every((item) => item.ok),
    workflow: workflowHealth,
    adapters: adapterHealth,
    agents_md: agentsGuideHealth,
    recommended_maintenance: maintenanceAction(workflowHealth, agentsGuideHealth, adapterHealth),
  };

  return {
    project: {
      title: projectTitle,
      slug: projectSlug,
      root,
      tools: config?.tools ?? [],
      detected_tools: detection.detected,
      unknown_configured_tools: detection.unknownConfigured,
    },
    workflow: {
      active_stage: stringOrNull(currentState?.active_stage),
      next_command: stringOrNull(currentState?.next_command),
      blocked_by: stringList(currentState?.blocked_by),
      last_decision: isRecord(currentState?.last_decision) ? currentState.last_decision : null,
    },
    read_this_first: stringList(currentState?.read_this_first),
    active_pointers: activePointers(currentState),
    health,
    git: await gitState(root),
    agent_guidance: {
      recommended_next_action: recommendedNextAction(currentState, health),
      safe_to_modify: ["Files required by the current task after checking git status and active pointers."],
      do_not_touch: [
        "Existing user artifacts or notes unless the current task explicitly requires them.",
        "Stage artifacts not produced by the current /ow:* command.",
      ],
    },
  };
}

async function readCurrentState(root: string): Promise<Record<string, unknown> | null> {
  try {
    const data = parseYaml(await readTextFile(join(root, ".openworkflow", "CURRENT_STATE.yaml")));
    return isRecord(data) ? data : null;
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }
}

function printBrief(model: BriefModel): void {
  console.log(`OpenWorkflow brief for ${model.project.title}`);
  console.log(`root: ${model.project.root}`);
  console.log(`tools: ${formatList(model.project.detected_tools.length > 0 ? model.project.detected_tools : model.project.tools)}`);
  console.log("");
  console.log("Workflow:");
  console.log(`  active_stage: ${model.workflow.active_stage ?? "unknown"}`);
  console.log(`  next_command: ${model.workflow.next_command ?? "none"}`);
  console.log(`  blocked_by: ${formatList(model.workflow.blocked_by)}`);
  console.log(`  last_decision: ${formatRecord(model.workflow.last_decision)}`);
  console.log("");
  console.log("Read this first:");
  for (const item of model.read_this_first.length > 0 ? model.read_this_first : ["none"]) {
    console.log(`  - ${item}`);
  }
  console.log("");
  console.log("Active pointers:");
  for (const [key, value] of Object.entries(model.active_pointers)) {
    console.log(`  ${key}: ${value ?? "none"}`);
  }
  console.log("");
  console.log("Health:");
  console.log(`  ok: ${model.health.ok}`);
  console.log(`  workflow: ${healthLabel(model.health.workflow)}`);
  console.log(`  agents_md: ${healthLabel(model.health.agents_md)}`);
  for (const [tool, section] of Object.entries(model.health.adapters)) {
    console.log(`  adapter:${tool}: ${healthLabel(section)}`);
  }
  console.log(`  recommended_maintenance: ${model.health.recommended_maintenance ?? "none"}`);
  console.log("");
  console.log("Git:");
  console.log(`  available: ${model.git.available}`);
  console.log(`  branch: ${model.git.branch ?? "none"}`);
  console.log(`  dirty: ${model.git.dirty}`);
  console.log(`  changed_files: ${formatList(model.git.changed_files)}`);
  console.log("");
  console.log("Agent guidance:");
  console.log(`  recommended_next_action: ${model.agent_guidance.recommended_next_action}`);
}

function healthLabel(section: HealthSection): string {
  if (section.errors.length > 0) {
    return `errors=${section.errors.length}, warnings=${section.warnings.length}`;
  }
  if (section.warnings.length > 0) {
    return `warnings=${section.warnings.length}`;
  }
  return "ok";
}

function maintenanceAction(
  workflow: HealthSection,
  agentsGuide: HealthSection,
  adapters: Record<string, HealthSection>,
): string | null {
  const hasSyncFixableDrift = workflow.errors.length > 0
    || workflow.warnings.length > 0
    || agentsGuide.warnings.length > 0
    || Object.values(adapters).some((section) => section.errors.length > 0 || section.warnings.length > 0);
  return hasSyncFixableDrift ? "run openworkflow sync, then openworkflow doctor" : null;
}

function recommendedNextAction(currentState: Record<string, unknown> | null, health: BriefModel["health"]): string {
  if (health.recommended_maintenance) {
    return health.recommended_maintenance;
  }
  const nextCommand = stringOrNull(currentState?.next_command);
  return nextCommand ? `continue with ${nextCommand}` : "inspect CURRENT_STATE.yaml and choose the next workflow command";
}

function activePointers(currentState: Record<string, unknown> | null): Record<string, string | null> {
  const keys = [
    "current_vision",
    "current_validation",
    "current_prototype",
    "current_decision",
    "current_design",
    "current_spec",
    "current_change",
    "current_run",
  ];
  return Object.fromEntries(keys.map((key) => [key, stringOrNull(currentState?.[key])]));
}

async function gitState(root: string): Promise<BriefModel["git"]> {
  try {
    await execGit(root, ["rev-parse", "--is-inside-work-tree"]);
    const branch = await gitBranch(root);
    const status = await execGit(root, ["status", "--porcelain"]);
    const changedFiles = status.split("\n").filter(Boolean).map((line) => line.slice(3).trim()).filter(Boolean);
    return {
      available: true,
      branch,
      dirty: changedFiles.length > 0,
      changed_files: changedFiles,
    };
  } catch {
    return {
      available: false,
      branch: null,
      dirty: false,
      changed_files: [],
    };
  }
}

async function gitBranch(root: string): Promise<string | null> {
  try {
    const branch = (await execGit(root, ["branch", "--show-current"])).trim();
    return branch.length > 0 ? branch : null;
  } catch {
    return null;
  }
}

async function execGit(root: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args, { cwd: root });
  return stdout;
}

function formatList(items: string[]): string {
  return items.length > 0 ? items.join(", ") : "none";
}

function formatRecord(value: Record<string, unknown> | null): string {
  if (!value) {
    return "none";
  }
  const outcome = value.outcome;
  return typeof outcome === "string" && outcome.length > 0 ? outcome : "none";
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function uniqueTools(tools: string[]): string[] {
  return [...new Set(tools)];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
