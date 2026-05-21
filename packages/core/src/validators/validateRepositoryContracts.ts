import { readdir, readFile, stat } from "node:fs/promises";
import { statSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { getWorkflowCommands, type WorkflowCommand } from "../commands/registry.js";
import { SCHEMA_VERSION } from "../contracts/index.js";
import { parseYaml } from "../contracts/yaml.js";
import { isNotFound } from "../fs/index.js";
import type { ValidationResult } from "./validateOpenWorkflow.js";

const REQUIRED_FILES = [
  "AGENT.md",
  "README.md",
  "LICENSE",
  "build_system_vision.md",
  "references/contract-graph.md",
  "references/npm-cli-architecture.md",
  "references/engineering-skill-reference-research.md",
  "references/audit-first-discovery-loop.md",
  "references/discovery-artifact-contracts.md",
  "references/artifact-authoring-templates.md",
  "references/runtime-command-surface.md",
  "references/proto2html-artifact-contracts.md",
  "schemas/openworkflow-contract.schema.json",
  "schemas/current-state.schema.json",
  "schemas/workflow-index.schema.json",
  "schemas/contract-graph.schema.json",
  "schemas/artifact-contracts.schema.json",
  "schemas/disclosure-levels.schema.json",
  "schemas/vision-session.schema.json",
  "schemas/validation-target.schema.json",
  "schemas/prototype-evidence.schema.json",
  "schemas/html-prototype.schema.json",
  "schemas/decision-record.schema.json",
  "schemas/product-design.schema.json",
  "schemas/change.schema.json",
  "schemas/validation.schema.json",
  "schemas/prototype.schema.json",
  "schemas/work-items.schema.json",
  "package.json",
  "tsconfig.json",
  "packages/cli/src/index.ts",
  "packages/cli/src/report.ts",
  "packages/cli/src/commands/brief.ts",
  "packages/cli/src/commands/check.ts",
  "packages/cli/src/commands/clean.ts",
  "packages/cli/src/commands/context.ts",
  "packages/cli/src/commands/draft.ts",
  "packages/cli/src/commands/init.ts",
  "packages/cli/src/commands/inspect.ts",
  "packages/cli/src/commands/register.ts",
  "packages/cli/src/commands/summaries.ts",
  "packages/cli/src/commands/summarize.ts",
  "packages/cli/src/commands/validate.ts",
  "packages/cli/src/commands/sync.ts",
  "packages/cli/src/commands/doctor.ts",
  "packages/cli/src/dev/validateRepositoryContractsCli.ts",
  "packages/cli/src/dev/verifyRuntimeSurface.ts",
  "packages/cli/src/dev/verifyWorkflowE2E.ts",
  "packages/cli/src/dev/verifyAgentE2E.ts",
  "packages/cli/src/dev/verifyCleanCommand.ts",
  "packages/adapters/src/registry.ts",
  "packages/core/src/artifacts/registry.ts",
  "packages/core/src/artifacts/readiness.ts",
  "packages/core/src/contracts/index.ts",
  "packages/core/src/contracts/yaml.ts",
  "packages/core/src/commands/registry.ts",
  "packages/core/src/fs/index.ts",
  "packages/core/src/onboarding/agentsGuide.ts",
  "packages/core/src/workflow/doctorOpenWorkflow.ts",
  "packages/core/src/workflow/initOpenWorkflow.ts",
  "packages/core/src/workflow/readWorkflowConfig.ts",
  "packages/core/src/workflow/cleanOpenWorkflow.ts",
  "packages/core/src/workflow/summaryHealth.ts",
  "packages/core/src/workflow/syncOpenWorkflow.ts",
  "packages/core/src/validators/validateOpenWorkflow.ts",
  "packages/core/src/validators/validateRepositoryContracts.ts",
  "packages/core/src/graph/README.md",
  "packages/adapters/codex/src/generateCodexAdapter.ts",
  "packages/adapters/codex/src/generateCommands.ts",
  "packages/adapters/codex/src/generateSkills.ts",
  "packages/adapters/codex/src/doctorCodexAdapter.ts",
  "packages/adapters/codex/src/cleanCodexAdapter.ts",
  "packages/adapters/codex/src/templates.ts",
  "templates/openworkflow/README.md",
  "templates/codex/README.md",
  "skills/build-vision/SKILL.md",
  "skills/build-validation/SKILL.md",
  "skills/build-validation/scripts/init_validation.py",
  "skills/build-prototype/SKILL.md",
  "skills/build-prototype/scripts/init_prototype.py",
  "skills/build-workflow/SKILL.md",
  "skills/build-workflow/scripts/init_workflow.py",
  "skills/build-team/SKILL.md",
  "skills/run-team/SKILL.md",
  "changes/M01-contract-foundation/CHANGE.yaml",
  "changes/M01-contract-foundation/WORK_ITEMS.yaml",
  "changes/M02-validation-first-prioritization/CHANGE.yaml",
  "changes/M02-validation-first-prioritization/WORK_ITEMS.yaml",
  "changes/M03-prototype-discovery-loop/CHANGE.yaml",
  "changes/M03-prototype-discovery-loop/WORK_ITEMS.yaml",
  "changes/M04-npm-first-cli-architecture/CHANGE.yaml",
  "changes/M04-npm-first-cli-architecture/WORK_ITEMS.yaml",
  "changes/M05-codex-adapter-sync/CHANGE.yaml",
  "changes/M05-codex-adapter-sync/WORK_ITEMS.yaml",
  "changes/M06-repository-architecture-scaffold/CHANGE.yaml",
  "changes/M06-repository-architecture-scaffold/WORK_ITEMS.yaml",
  "changes/M07-command-namespace-contract/CHANGE.yaml",
  "changes/M07-command-namespace-contract/WORK_ITEMS.yaml",
  "changes/M08-engineering-skill-reference-research/CHANGE.yaml",
  "changes/M08-engineering-skill-reference-research/WORK_ITEMS.yaml",
  "changes/M09-audit-first-discovery-loop/CHANGE.yaml",
  "changes/M09-audit-first-discovery-loop/WORK_ITEMS.yaml",
  "changes/M10-discovery-artifact-contracts/CHANGE.yaml",
  "changes/M10-discovery-artifact-contracts/WORK_ITEMS.yaml",
  "changes/M11-artifact-authoring-templates/CHANGE.yaml",
  "changes/M11-artifact-authoring-templates/WORK_ITEMS.yaml",
  "changes/M12-runtime-command-surface/CHANGE.yaml",
  "changes/M12-runtime-command-surface/WORK_ITEMS.yaml",
  "changes/M13-codex-skill-adapter-alignment/CHANGE.yaml",
  "changes/M13-codex-skill-adapter-alignment/WORK_ITEMS.yaml",
  "changes/M14-python-to-typescript-script-migration/CHANGE.yaml",
  "changes/M14-python-to-typescript-script-migration/WORK_ITEMS.yaml",
  "changes/M14-python-to-typescript-script-migration/LEGACY_SKILL_SCRIPTS.md",
  "changes/M15-interactive-vision-design-flow/CHANGE.yaml",
  "changes/M15-interactive-vision-design-flow/WORK_ITEMS.yaml",
  "changes/M16-prototype-creation-skill-upgrade/CHANGE.yaml",
  "changes/M16-prototype-creation-skill-upgrade/WORK_ITEMS.yaml",
  "changes/M17-tune-orchestration-internal-decision/CHANGE.yaml",
  "changes/M17-tune-orchestration-internal-decision/WORK_ITEMS.yaml",
  "changes/M18-e2e-friction-fixes/CHANGE.yaml",
  "changes/M18-e2e-friction-fixes/WORK_ITEMS.yaml",
  "changes/M19-command-display-label-cleanup/CHANGE.yaml",
  "changes/M19-command-display-label-cleanup/WORK_ITEMS.yaml",
  "changes/M20-workflow-e2e-regression/CHANGE.yaml",
  "changes/M20-workflow-e2e-regression/WORK_ITEMS.yaml",
  "changes/M21-npm-package-release-readiness/CHANGE.yaml",
  "changes/M21-npm-package-release-readiness/WORK_ITEMS.yaml",
  "changes/M22-project-clean-command/CHANGE.yaml",
  "changes/M22-project-clean-command/WORK_ITEMS.yaml",
  "changes/M23-production-command-lazy-contracts/CHANGE.yaml",
  "changes/M23-production-command-lazy-contracts/WORK_ITEMS.yaml",
  "changes/M24-agent-context-state-and-summaries/CHANGE.yaml",
  "changes/M24-agent-context-state-and-summaries/WORK_ITEMS.yaml",
  "changes/M25-agent-onboarding-entrypoint/CHANGE.yaml",
  "changes/M25-agent-onboarding-entrypoint/WORK_ITEMS.yaml",
  "changes/M26-non-destructive-multi-platform-sync/CHANGE.yaml",
  "changes/M26-non-destructive-multi-platform-sync/WORK_ITEMS.yaml",
  "changes/M27-agent-brief-status/CHANGE.yaml",
  "changes/M27-agent-brief-status/WORK_ITEMS.yaml",
  "changes/M28-cli-json-report-surface/CHANGE.yaml",
  "changes/M28-cli-json-report-surface/WORK_ITEMS.yaml",
  "changes/M29-command-readiness-check/CHANGE.yaml",
  "changes/M29-command-readiness-check/WORK_ITEMS.yaml",
  "changes/M30-artifact-summary-health/CHANGE.yaml",
  "changes/M30-artifact-summary-health/WORK_ITEMS.yaml",
  "changes/M31-unified-health-semantics/CHANGE.yaml",
  "changes/M31-unified-health-semantics/WORK_ITEMS.yaml",
  "changes/M32-agent-inspect-entry/CHANGE.yaml",
  "changes/M32-agent-inspect-entry/WORK_ITEMS.yaml",
  "changes/M33-summary-refresh-command/CHANGE.yaml",
  "changes/M33-summary-refresh-command/WORK_ITEMS.yaml",
  "changes/M34-agent-context-packet/CHANGE.yaml",
  "changes/M34-agent-context-packet/WORK_ITEMS.yaml",
  "changes/M35-artifact-draft-command/CHANGE.yaml",
  "changes/M35-artifact-draft-command/WORK_ITEMS.yaml",
  "changes/M36-artifact-register-command/CHANGE.yaml",
  "changes/M36-artifact-register-command/WORK_ITEMS.yaml",
  "changes/M37-managed-clean-boundary/CHANGE.yaml",
  "changes/M37-managed-clean-boundary/WORK_ITEMS.yaml",
  "changes/M38-json-exit-code-semantics/CHANGE.yaml",
  "changes/M38-json-exit-code-semantics/WORK_ITEMS.yaml",
  "changes/M39-stage-readiness-gates/CHANGE.yaml",
  "changes/M39-stage-readiness-gates/WORK_ITEMS.yaml",
  "changes/M40-compact-context-default/CHANGE.yaml",
  "changes/M40-compact-context-default/WORK_ITEMS.yaml",
  "changes/M41-compact-command-audit-slice/CHANGE.yaml",
  "changes/M41-compact-command-audit-slice/WORK_ITEMS.yaml",
  "changes/M42-health-errors-surface/CHANGE.yaml",
  "changes/M42-health-errors-surface/WORK_ITEMS.yaml",
  "changes/M43-summary-quality-signals/CHANGE.yaml",
  "changes/M43-summary-quality-signals/WORK_ITEMS.yaml",
  "changes/M44-clean-sync-recovery-e2e/CHANGE.yaml",
  "changes/M44-clean-sync-recovery-e2e/WORK_ITEMS.yaml",
  "changes/M45-sync-state-reconciliation/CHANGE.yaml",
  "changes/M45-sync-state-reconciliation/WORK_ITEMS.yaml",
  "changes/M46-strict-summary-quality/CHANGE.yaml",
  "changes/M46-strict-summary-quality/WORK_ITEMS.yaml",
  "changes/M47-doctor-handoff-quality-split/CHANGE.yaml",
  "changes/M47-doctor-handoff-quality-split/WORK_ITEMS.yaml",
  "changes/M48-handoff-quality-summary/CHANGE.yaml",
  "changes/M48-handoff-quality-summary/WORK_ITEMS.yaml",
  "changes/M49-single-handoff-entry/CHANGE.yaml",
  "changes/M49-single-handoff-entry/WORK_ITEMS.yaml",
  "changes/M50-context-handoff-mode/CHANGE.yaml",
  "changes/M50-context-handoff-mode/WORK_ITEMS.yaml",
  "changes/M51-agent-first-e2e-suite/CHANGE.yaml",
  "changes/M51-agent-first-e2e-suite/WORK_ITEMS.yaml",
  "changes/M52-default-sync-adapter-recovery/CHANGE.yaml",
  "changes/M52-default-sync-adapter-recovery/WORK_ITEMS.yaml",
];

const IGNORED_DIRS = new Set([".git", "node_modules", "dist", "build", "coverage"]);
const COMMON_REQUIRED = ["schema_version", "contract_id", "contract_type", "title", "status"];
const CODEX_SKILL_METADATA_FIELDS = [
  "generated_by",
  "adapter",
  "adapter_version",
  "template_id",
  "source_command_id",
  "semantic_trigger",
  "skill_name",
] as const;
const REQUIRED_CODEX_SKILL_BLOCKS = [
  "user_behavior",
  "agent_protocol",
  "working_protocol",
  "artifact_checkpoint",
  "codex_skill",
] as const;
const HIGH_RISK_REPORT_SECTIONS = [
  "Trigger",
  "Change",
  "Concrete Risks",
  "Decision Options",
  "Recommended Path",
  "Guardrails",
  "Go Criteria",
  "Stop Criteria",
  "Validation Expectations",
] as const;

export async function validateRepositoryContracts(rootInput: string): Promise<ValidationResult> {
  const root = resolve(rootInput);
  const errors: string[] = [];
  await validateRequiredFiles(root, errors);
  await validateJsonSchemas(root, errors);
  await validateYamlContracts(root, errors);
  await validateGeneratedCodexSkills(root, errors);
  await validateGeneratedSurfaceParity(root, errors);
  await validateHighRiskDecisionReports(root, errors);
  return { ok: errors.length === 0, errors };
}

async function validateRequiredFiles(root: string, errors: string[]): Promise<void> {
  for (const item of REQUIRED_FILES) {
    if (!(await exists(join(root, item)))) {
      errors.push(`missing required file: ${item}`);
    }
  }
}

async function validateJsonSchemas(root: string, errors: string[]): Promise<void> {
  const schemasRoot = join(root, "schemas");
  for (const path of await findFiles(schemasRoot, (entry) => entry.endsWith(".json"))) {
    let data: unknown;
    try {
      data = JSON.parse(await readFile(path, "utf8"));
    } catch (error) {
      errors.push(`${relative(root, path)} is not valid JSON: ${messageFor(error)}`);
      continue;
    }
    if (!isRecord(data)) {
      errors.push(`${relative(root, path)} must be a JSON object`);
      continue;
    }
    for (const key of ["$schema", "title", "type"]) {
      if (!(key in data)) {
        errors.push(`${relative(root, path)} missing JSON schema key ${key}`);
      }
    }
  }
}

async function validateYamlContracts(root: string, errors: string[]): Promise<void> {
  for (const path of await findFiles(root, (entry) => entry.endsWith(".yaml") || entry.endsWith(".yml"))) {
    let data: unknown;
    try {
      data = parseYaml(await readFile(path, "utf8"));
    } catch (error) {
      errors.push(`${relative(root, path)} is not valid YAML: ${messageFor(error)}`);
      continue;
    }
    validateCommonContract(root, path, data, errors);
    if (isRecord(data)) {
      validateChange(root, path, data, errors);
      validateWorkItems(root, path, data, errors);
      validateValidation(root, path, data, errors);
      validatePrototype(root, path, data, errors);
      validateArtifactContracts(root, path, data, errors);
      validateDisclosureLevels(root, path, data, errors);
      validateConfig(root, path, data, errors);
      validateCurrentState(root, path, data, errors);
      validateActivePointer(root, path, data, errors);
      validateDiscoveryArtifact(root, path, data, errors);
      validateWorkflowIndex(root, path, data, errors);
      validateContractGraph(root, path, data, errors);
      validateCandidateChanges(root, path, data, errors);
    }
  }
}

async function validateGeneratedCodexSkills(root: string, errors: string[]): Promise<void> {
  const manifestPath = join(root, ".agents", "openworkflow-adapter.yaml");
  if (!(await exists(manifestPath))) {
    return;
  }

  const label = relative(root, manifestPath);
  let manifest: unknown;
  try {
    manifest = parseYaml(await readFile(manifestPath, "utf8"));
  } catch (error) {
    errors.push(`${label} is not valid YAML for generated skill validation: ${messageFor(error)}`);
    return;
  }
  if (!isRecord(manifest)) {
    errors.push(`${label} must be a mapping`);
    return;
  }
  if (manifest.generated_by !== "openworkflow") {
    errors.push(`${label} generated_by must be openworkflow for Codex skill validation`);
  }
  if (manifest.adapter !== "codex") {
    errors.push(`${label} adapter must be codex for Codex skill validation`);
  }
  const adapterVersion = typeof manifest.adapter_version === "string" ? manifest.adapter_version : null;
  if (!adapterVersion) {
    errors.push(`${label} adapter_version must be a non-empty string`);
  }
  const namespace = typeof manifest.command_namespace === "string" ? manifest.command_namespace : "ow";
  validateManifestSkillSurface(label, manifest.skill_surface, errors);

  const commands = manifest.commands;
  if (!Array.isArray(commands) || commands.length === 0) {
    errors.push(`${label} commands must be a non-empty list`);
    return;
  }
  for (const [index, command] of commands.entries()) {
    if (!isRecord(command)) {
      errors.push(`${label} command ${index} must be a mapping`);
      continue;
    }
    await validateGeneratedCodexSkill(root, label, command, namespace, adapterVersion ?? "", errors);
  }
}

function validateManifestSkillSurface(label: string, value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${label} skill_surface must be a mapping`);
    return;
  }
  const frontmatter = value.frontmatter;
  if (!Array.isArray(frontmatter) || !["name", "description", "metadata"].every((field) => frontmatter.includes(field))) {
    errors.push(`${label} skill_surface.frontmatter must include name, description, and metadata`);
  }
  const metadataFields = value.metadata_fields;
  if (!Array.isArray(metadataFields)) {
    errors.push(`${label} skill_surface.metadata_fields must list generated metadata fields`);
    return;
  }
  for (const field of CODEX_SKILL_METADATA_FIELDS) {
    if (!metadataFields.includes(field)) {
      errors.push(`${label} skill_surface.metadata_fields missing ${field}`);
    }
  }
}

async function validateGeneratedCodexSkill(
  root: string,
  manifestLabel: string,
  command: Record<string, unknown>,
  namespace: string,
  adapterVersion: string,
  errors: string[],
): Promise<void> {
  const commandId = stringField(command, "id");
  const trigger = stringField(command, "trigger");
  const skillName = stringField(command, "skill_name");
  const skillPath = stringField(command, "skill_path");
  const commandLabel = `${manifestLabel} command ${commandId || "<unknown>"}`;
  if (!commandId || !trigger || !skillName || !skillPath) {
    errors.push(`${commandLabel} must include id, trigger, skill_name, and skill_path`);
    return;
  }
  const absoluteSkillPath = join(root, skillPath);
  if (!existsSyncSafe(absoluteSkillPath)) {
    errors.push(`${commandLabel} references missing generated skill ${skillPath}; update adapter source and run openworkflow sync --tools codex`);
    return;
  }

  let content: string;
  try {
    if (!statSync(absoluteSkillPath).isFile()) {
      errors.push(`${skillPath} must be a generated skill file`);
      return;
    }
    content = await readFile(absoluteSkillPath, "utf8");
  } catch (error) {
    errors.push(`${skillPath} could not be read for generated skill validation: ${messageFor(error)}`);
    return;
  }
  const frontmatter = parseSkillFrontmatter(skillPath, content, errors);
  if (!frontmatter) {
    return;
  }
  validateSkillFrontmatter(skillPath, frontmatter, {
    adapterVersion,
    commandId,
    namespace,
    skillName,
    trigger,
  }, errors);
  validateSkillGeneratedMarker(skillPath, content, namespace, commandId, errors);
  validateSkillProtocolBlocks(skillPath, content, errors);
}

function parseSkillFrontmatter(
  skillPath: string,
  content: string,
  errors: string[],
): Record<string, unknown> | null {
  if (!content.startsWith("---\n")) {
    errors.push(`${skillPath} missing SKILL.md frontmatter; update adapter source and run openworkflow sync --tools codex`);
    return null;
  }
  const frontmatterEnd = content.indexOf("\n---\n", 4);
  if (frontmatterEnd === -1) {
    errors.push(`${skillPath} has unterminated SKILL.md frontmatter`);
    return null;
  }
  let frontmatter: unknown;
  try {
    frontmatter = parseYaml(content.slice(4, frontmatterEnd));
  } catch (error) {
    errors.push(`${skillPath} has invalid SKILL.md frontmatter YAML: ${messageFor(error)}`);
    return null;
  }
  if (!isRecord(frontmatter)) {
    errors.push(`${skillPath} SKILL.md frontmatter must be a mapping`);
    return null;
  }
  return frontmatter;
}

function validateSkillFrontmatter(
  skillPath: string,
  frontmatter: Record<string, unknown>,
  expected: {
    adapterVersion: string;
    commandId: string;
    namespace: string;
    skillName: string;
    trigger: string;
  },
  errors: string[],
): void {
  if (frontmatter.name !== expected.skillName) {
    errors.push(`${skillPath} frontmatter.name must be ${expected.skillName}`);
  }
  if (!nonEmptyString(frontmatter.description)) {
    errors.push(`${skillPath} frontmatter.description must be a non-empty string`);
  }
  const metadata = frontmatter.metadata;
  if (!isRecord(metadata)) {
    errors.push(`${skillPath} missing generated metadata; update adapter source and run openworkflow sync --tools codex`);
    return;
  }
  const expectedMetadata: Record<string, string> = {
    generated_by: "openworkflow",
    adapter: "codex",
    adapter_version: expected.adapterVersion,
    template_id: `codex.skill.${expected.namespace}.${expected.commandId}`,
    source_command_id: expected.commandId,
    semantic_trigger: expected.trigger,
    skill_name: expected.skillName,
  };
  for (const field of CODEX_SKILL_METADATA_FIELDS) {
    if (metadata[field] !== expectedMetadata[field]) {
      errors.push(`${skillPath} metadata.${field} must be ${expectedMetadata[field]}`);
    }
  }
}

function validateSkillGeneratedMarker(
  skillPath: string,
  content: string,
  namespace: string,
  commandId: string,
  errors: string[],
): void {
  if (!content.includes("generated-by: openworkflow")) {
    errors.push(`${skillPath} missing generated marker; update adapter source and run openworkflow sync --tools codex`);
  }
  const templateMarker = `template-id: codex.skill.${namespace}.${commandId}`;
  if (!content.includes(templateMarker)) {
    errors.push(`${skillPath} missing generated marker ${templateMarker}`);
  }
}

function validateSkillProtocolBlocks(skillPath: string, content: string, errors: string[]): void {
  if (/<\/?skill(?:\s|>)/.test(content)) {
    errors.push(`${skillPath} must not use a top-level <skill> XML wrapper; generated skills are Markdown with YAML frontmatter and XML-like protocol blocks`);
  }
  for (const tag of REQUIRED_CODEX_SKILL_BLOCKS) {
    validateRequiredSkillBlock(skillPath, content, tag, errors);
  }
}

function validateRequiredSkillBlock(skillPath: string, content: string, tag: string, errors: string[]): void {
  const openTag = `<${tag}>`;
  const closeTag = `</${tag}>`;
  const openCount = countOccurrences(content, openTag);
  const closeCount = countOccurrences(content, closeTag);
  if (openCount === 0 || closeCount === 0 || openCount !== closeCount) {
    errors.push(`${skillPath} must contain a balanced <${tag}> protocol block`);
    return;
  }
  if (tag !== "artifact_checkpoint" && (openCount !== 1 || closeCount !== 1)) {
    errors.push(`${skillPath} must contain exactly one <${tag}> protocol block`);
    return;
  }
  if (content.indexOf(openTag) > content.indexOf(closeTag)) {
    errors.push(`${skillPath} <${tag}> protocol block closes before it opens`);
  }
}

function countOccurrences(content: string, needle: string): number {
  return content.split(needle).length - 1;
}

function stringField(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

async function validateGeneratedSurfaceParity(root: string, errors: string[]): Promise<void> {
  const commands = [...getWorkflowCommands()];
  const commandAudit = await readYamlRecordForParity(root, ".openworkflow/audit/COMMAND_AUDIT_INDEX.yaml", errors);
  if (commandAudit) {
    validateCommandAuditParity(".openworkflow/audit/COMMAND_AUDIT_INDEX.yaml", commandAudit.commands, commands, errors);
  }
  const contextPackets = await readYamlRecordForParity(root, ".openworkflow/audit/CONTEXT_PACKETS.yaml", errors);
  if (contextPackets) {
    validateContextPacketParity(".openworkflow/audit/CONTEXT_PACKETS.yaml", contextPackets.packets, commands, errors);
  }
  const codexManifest = await readYamlRecordForParity(root, ".agents/openworkflow-adapter.yaml", errors);
  if (codexManifest) {
    await validateCodexManifestParity(root, ".agents/openworkflow-adapter.yaml", codexManifest, commands, errors);
  }
}

async function readYamlRecordForParity(
  root: string,
  relativePath: string,
  errors: string[],
): Promise<Record<string, unknown> | null> {
  const path = join(root, relativePath);
  if (!(await exists(path))) {
    return null;
  }
  try {
    const data = parseYaml(await readFile(path, "utf8"));
    if (isRecord(data)) {
      return data;
    }
    errors.push(`${relativePath} must be a mapping for generated-surface parity validation`);
  } catch (error) {
    errors.push(`${relativePath} is not valid YAML for generated-surface parity validation: ${messageFor(error)}`);
  }
  return null;
}

function validateCommandAuditParity(
  label: string,
  value: unknown,
  commands: WorkflowCommand[],
  errors: string[],
): void {
  const records = recordsById(label, "commands", value, "id", errors);
  if (!records) {
    return;
  }
  assertCommandIds(label, records, commands, errors);
  for (const command of commands) {
    const actual = records.get(command.id);
    if (!actual) {
      continue;
    }
    assertField(label, command.id, actual, "trigger", command.trigger, errors);
    assertField(label, command.id, actual, "stage", command.stage, errors);
    assertField(label, command.id, actual, "visibility", command.visibility, errors);
    assertField(label, command.id, actual, "depth", command.protocol?.depth ?? "shallow", errors);
    assertField(label, command.id, actual, "context_packet", `context:${command.id}`, errors);
    assertStringArray(label, command.id, actual, "allowed_outputs", command.protocol?.allowedOutputs ?? command.targetArtifacts, errors);
    assertStringArray(label, command.id, actual, "conditional_outputs", command.protocol?.conditionalOutputs ?? [], errors);
    assertStringArray(label, command.id, actual, "forbidden_outputs", command.protocol?.forbiddenOutputs ?? [], errors);
    assertStringArray(label, command.id, actual, "handoff_commands", command.protocol?.handoffCommands ?? [], errors);
  }
}

function validateContextPacketParity(
  label: string,
  value: unknown,
  commands: WorkflowCommand[],
  errors: string[],
): void {
  const records = recordsById(label, "packets", value, "packet_id", errors);
  if (!records) {
    return;
  }
  const expectedIds = new Set(commands.map((command) => `context:${command.id}`));
  assertIdSet(label, "packets", records, expectedIds, errors);
  for (const command of commands) {
    const packetId = `context:${command.id}`;
    const actual = records.get(packetId);
    if (!actual) {
      continue;
    }
    assertField(label, packetId, actual, "command", command.trigger, errors);
    assertField(label, packetId, actual, "visibility", command.visibility, errors);
    assertStringArray(label, packetId, actual, "required", command.protocol?.requiredContext ?? [".openworkflow/workflow/WORKFLOW_INDEX.yaml"], errors);
    assertStringArray(label, packetId, actual, "optional", command.protocol?.optionalContext ?? [], errors);
    assertStringArray(label, packetId, actual, "forbidden", command.protocol?.forbiddenContext ?? [], errors);
    assertStringArray(label, packetId, actual, "conditional_outputs", command.protocol?.conditionalOutputs ?? [], errors);
  }
}

async function validateCodexManifestParity(
  root: string,
  label: string,
  manifest: Record<string, unknown>,
  commands: WorkflowCommand[],
  errors: string[],
): Promise<void> {
  const records = recordsById(label, "commands", manifest.commands, "id", errors);
  if (!records) {
    return;
  }
  assertCommandIds(label, records, commands, errors);
  const expectedGeneratedFiles = new Set<string>();
  for (const command of commands) {
    const actual = records.get(command.id);
    if (!actual) {
      continue;
    }
    const skillName = `ow-${command.id}`;
    const skillPath = `.agents/skills/${skillName}/SKILL.md`;
    const interfacePath = `.agents/skills/${skillName}/agents/openai.yaml`;
    expectedGeneratedFiles.add(skillPath);
    expectedGeneratedFiles.add(interfacePath);
    assertField(label, command.id, actual, "trigger", command.trigger, errors);
    assertField(label, command.id, actual, "visibility", command.visibility, errors);
    assertField(label, command.id, actual, "skill_name", skillName, errors);
    assertField(label, command.id, actual, "explicit_invocation", `$${skillName}`, errors);
    assertField(label, command.id, actual, "skill_path", skillPath, errors);
    assertField(label, command.id, actual, "interface_path", interfacePath, errors);
    assertStringArray(label, command.id, actual, "legacy_triggers", command.legacyTriggers, errors);
  }
  await validateManifestGeneratedFiles(root, label, manifest.generated_files, expectedGeneratedFiles, errors);
}

async function validateManifestGeneratedFiles(
  root: string,
  label: string,
  value: unknown,
  expectedGeneratedFiles: Set<string>,
  errors: string[],
): Promise<void> {
  if (!Array.isArray(value)) {
    errors.push(`${label} generated_files must be a list; update adapter source and run openworkflow sync --tools codex`);
    return;
  }
  const actual = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string") {
      errors.push(`${label} generated_files contains a non-string path`);
      continue;
    }
    actual.add(item);
    const path = join(root, item);
    if (!existsSyncSafe(path)) {
      errors.push(`${label} generated_files references missing ${item}; update adapter source and run openworkflow sync --tools codex`);
      continue;
    }
    const content = await readFile(path, "utf8");
    if (!content.includes("generated-by: openworkflow")) {
      errors.push(`${label} generated_files ${item} is missing generated marker; update adapter source and run openworkflow sync --tools codex`);
    }
  }
  for (const expected of expectedGeneratedFiles) {
    if (!actual.has(expected)) {
      errors.push(`${label} generated_files missing ${expected}; update adapter source and run openworkflow sync --tools codex`);
    }
  }
}

function recordsById(
  label: string,
  collectionName: string,
  value: unknown,
  idKey: string,
  errors: string[],
): Map<string, Record<string, unknown>> | null {
  if (!Array.isArray(value)) {
    errors.push(`${label} ${collectionName} must be a list for generated-surface parity validation`);
    return null;
  }
  const records = new Map<string, Record<string, unknown>>();
  value.forEach((item, index) => {
    if (!isRecord(item)) {
      errors.push(`${label} ${collectionName}[${index}] must be a mapping`);
      return;
    }
    const id = item[idKey];
    if (typeof id !== "string" || id.length === 0) {
      errors.push(`${label} ${collectionName}[${index}] missing ${idKey}`);
      return;
    }
    if (records.has(id)) {
      errors.push(`${label} ${collectionName} duplicate ${idKey} ${id}`);
      return;
    }
    records.set(id, item);
  });
  return records;
}

function assertCommandIds(
  label: string,
  records: Map<string, Record<string, unknown>>,
  commands: WorkflowCommand[],
  errors: string[],
): void {
  assertIdSet(label, "commands", records, new Set(commands.map((command) => command.id)), errors);
}

function assertIdSet(
  label: string,
  collectionName: string,
  records: Map<string, Record<string, unknown>>,
  expectedIds: Set<string>,
  errors: string[],
): void {
  for (const expected of expectedIds) {
    if (!records.has(expected)) {
      errors.push(`${label} ${collectionName} missing ${expected}; update source registry and run openworkflow sync --tools codex`);
    }
  }
  for (const actual of records.keys()) {
    if (!expectedIds.has(actual)) {
      errors.push(`${label} ${collectionName} has unexpected ${actual}; update source registry and run openworkflow sync --tools codex`);
    }
  }
}

function assertField(
  label: string,
  id: string,
  record: Record<string, unknown>,
  field: string,
  expected: string,
  errors: string[],
): void {
  if (record[field] !== expected) {
    errors.push(`${label} ${id} ${field} must be ${expected}; update source registry and run openworkflow sync --tools codex`);
  }
}

function assertStringArray(
  label: string,
  id: string,
  record: Record<string, unknown>,
  field: string,
  expected: readonly string[],
  errors: string[],
): void {
  const actual = record[field];
  if (!Array.isArray(actual) || !actual.every((item) => typeof item === "string")) {
    errors.push(`${label} ${id} ${field} must be a string list; update source registry and run openworkflow sync --tools codex`);
    return;
  }
  if (!stringArraysEqual(actual, expected)) {
    errors.push(`${label} ${id} ${field} drifted from source registry; update source registry and run openworkflow sync --tools codex`);
  }
}

function stringArraysEqual(actual: string[], expected: readonly string[]): boolean {
  return actual.length === expected.length && actual.every((item, index) => item === expected[index]);
}

async function validateHighRiskDecisionReports(root: string, errors: string[]): Promise<void> {
  for (const path of await findFiles(root, (entry) => entry === "HIGH_RISK_DECISION_REPORT.md")) {
    const label = relative(root, path);
    const content = await readFile(path, "utf8");
    for (const section of HIGH_RISK_REPORT_SECTIONS) {
      if (!hasMarkdownHeading(content, section)) {
        errors.push(`${label} missing high-risk report section: ${section}`);
      }
    }
    if (!content.includes("explicit") || !content.includes("approval")) {
      errors.push(`${label} must state that implementation resumes only after explicit approval`);
    }
  }
}

function hasMarkdownHeading(content: string, heading: string): boolean {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^#{2,4}\\s+.*${escaped}.*$`, "m").test(content);
}

function validateConfig(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "config.yaml") {
    return;
  }
  const label = relative(root, path);
  if (!nonEmptyString(data.project_slug) || data.project_slug === "project") {
    errors.push(`${label} project_slug must be a useful non-empty slug`);
  }
  if (!nonEmptyString(data.project_title) || data.project_title === ".") {
    errors.push(`${label} project_title must be a useful non-empty title`);
  }
}

function validateCurrentState(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "CURRENT_STATE.yaml") {
    return;
  }
  const label = relative(root, path);
  for (const key of ["active_stage", "next_command", "blocked_by", "read_this_first", "last_decision"]) {
    if (!(key in data)) {
      errors.push(`${label} missing current state key ${key}`);
    }
  }
  if (!nonEmptyString(data.active_stage)) {
    errors.push(`${label} active_stage must be a non-empty string`);
  }
  if (typeof data.next_command !== "string" && data.next_command !== null) {
    errors.push(`${label} next_command must be a string or null`);
  }
  for (const key of ["blocked_by", "read_this_first"]) {
    if (!Array.isArray(data[key])) {
      errors.push(`${label} ${key} must be an array`);
    }
  }
  if (!isRecord(data.last_decision)) {
    errors.push(`${label} last_decision must be a mapping`);
  }
}

function validateCandidateChanges(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "CANDIDATE_CHANGES.yaml") {
    return;
  }
  const label = relative(root, path);
  if (data.planning_artifact_type !== "candidate_changes") {
    return;
  }
  const queuePolicy = data.queue_policy;
  if (isRecord(queuePolicy) && "branch_boundary" in queuePolicy) {
    validateBranchBoundary(label, queuePolicy.branch_boundary, errors);
  }
  if (!Array.isArray(data.changes)) {
    errors.push(`${label} changes must be a list`);
    return;
  }
  for (const candidate of data.changes) {
    if (!isRecord(candidate)) {
      errors.push(`${label} changes entries must be mappings`);
      continue;
    }
    validateCandidateCompletionEvidence(label, candidate, errors);
  }
}

function validateBranchBoundary(label: string, value: unknown, errors: string[]): void {
  if (!nonEmptyString(value)) {
    errors.push(`${label} queue_policy.branch_boundary must be a non-empty string when present`);
    return;
  }
  const branch = String(value).trim();
  if (branch !== value || branch.includes(" ") || branch.startsWith("/") || branch.endsWith("/")) {
    errors.push(`${label} queue_policy.branch_boundary must be a branch-like string without spaces or leading/trailing slashes`);
  }
}

function validateCandidateCompletionEvidence(
  label: string,
  candidate: Record<string, unknown>,
  errors: string[],
): void {
  if (candidate.status !== "done") {
    return;
  }
  const id = typeof candidate.id === "string" ? candidate.id : "<unknown>";
  const completion = candidate.completion;
  if (!isRecord(completion)) {
    errors.push(`${label} ${id} done candidate must include completion evidence`);
    return;
  }
  const evidence = completion.evidence;
  if (!Array.isArray(evidence) || evidence.length === 0) {
    errors.push(`${label} ${id} completion.evidence must be a non-empty list`);
    return;
  }
  for (const item of evidence) {
    if (typeof item !== "string") {
      errors.push(`${label} ${id} completion.evidence values must be strings`);
      continue;
    }
    if (item.startsWith("commit:") && !/^commit:\s+[0-9a-f]{7,40}$/i.test(item)) {
      errors.push(`${label} ${id} completion commit evidence must use 'commit: <7-40 hex chars>'`);
    }
  }
}

function validateCommonContract(root: string, path: string, data: unknown, errors: string[]): void {
  if (!isRecord(data)) {
    return;
  }
  if (!("contract_type" in data) && !("schema_version" in data)) {
    return;
  }
  const label = relative(root, path);
  for (const key of COMMON_REQUIRED) {
    if (!(key in data)) {
      errors.push(`${label} missing contract key ${key}`);
    }
  }
  if (data.schema_version !== SCHEMA_VERSION) {
    errors.push(`${label} must use schema_version ${SCHEMA_VERSION}`);
  }
  for (const listKey of ["depends_on", "produces"]) {
    const value = data[listKey];
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item !== "string") {
          errors.push(`${label} has non-string ${listKey} value`);
        }
      }
    }
  }
}

function validateChange(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "CHANGE.yaml") {
    return;
  }
  for (const key of ["problem", "goals", "non_goals", "affected_paths", "acceptance", "validation"]) {
    if (!(key in data)) {
      errors.push(`${relative(root, path)} missing change key ${key}`);
    }
  }
  if (data.contract_type !== "change") {
    errors.push(`${relative(root, path)} contract_type must be change`);
  }
}

function validateWorkItems(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "WORK_ITEMS.yaml") {
    return;
  }
  const label = relative(root, path);
  if (data.contract_type !== "work_items") {
    errors.push(`${label} contract_type must be work_items`);
  }
  const changeContract = data.change_contract;
  if (typeof changeContract !== "string") {
    errors.push(`${label} missing change_contract`);
  } else if (!(existsSyncSafe(join(contractRootFor(root, path), changeContract)) || existsSyncSafe(join(root, changeContract)))) {
    errors.push(`${label} references missing change_contract ${changeContract}`);
  }
  const items = data.items;
  if (!Array.isArray(items) || items.length === 0) {
    errors.push(`${label} must contain non-empty items`);
    return;
  }
  const seen = new Set<string>();
  items.forEach((item, index) => {
    if (!isRecord(item)) {
      errors.push(`${label} item ${index} is not a mapping`);
      return;
    }
    const taskId = item.task_id;
    if (typeof taskId !== "string" || taskId.length === 0) {
      errors.push(`${label} item ${index} missing task_id`);
      return;
    }
    if (seen.has(taskId)) {
      errors.push(`${label} duplicate task_id ${taskId}`);
    }
    seen.add(taskId);
    for (const key of ["title", "status", "owned_paths", "acceptance"]) {
      if (!(key in item)) {
        errors.push(`${label} ${taskId} missing ${key}`);
      }
    }
  });
}

function validateValidation(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "VALIDATION.yaml") {
    return;
  }
  const label = relative(root, path);
  if (data.contract_type !== "validation") {
    errors.push(`${label} contract_type must be validation`);
  }
  validateValidationTarget(label, data, errors);
  for (const key of [
    "core_question",
    "feature_classification",
    "critical_assumptions",
    "prototype_scope",
    "acceptance",
    "decision_options",
  ]) {
    if (!(key in data)) {
      errors.push(`${label} missing validation key ${key}`);
    }
  }
  const decisionOptions = data.decision_options;
  if (Array.isArray(decisionOptions)) {
    const allowed = new Set(["continue", "revise", "pivot", "stop", "needs_more_evidence"]);
    for (const option of decisionOptions) {
      if (typeof option !== "string" || !allowed.has(option)) {
        errors.push(`${label} has invalid decision option ${String(option)}`);
      }
    }
  }
}

function validatePrototype(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "TODO.yaml" || data.contract_type !== "prototype") {
    return;
  }
  const label = relative(root, path);
  for (const key of [
    "validation_contract",
    "core_question",
    "prototype_scope",
    "todo",
    "acceptance",
    "artifact",
    "decision_handoff",
  ]) {
    if (!(key in data)) {
      errors.push(`${label} missing prototype key ${key}`);
    }
  }
  validatePrototypeScope(label, data.prototype_scope, errors);
  validatePrototypeTodo(label, data.todo, errors);
  const artifact = data.artifact;
  if (isRecord(artifact) && typeof artifact.path === "string" && !existsSyncSafe(join(contractRootFor(root, path), artifact.path))) {
    errors.push(`${label} references missing artifact path ${artifact.path}`);
  }
  const decisionHandoff = data.decision_handoff;
  if (isRecord(decisionHandoff) && decisionHandoff.requires_user_review !== true) {
    errors.push(`${label} decision_handoff.requires_user_review must be true`);
  }
}

function validateArtifactContracts(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "ARTIFACT_CONTRACTS.yaml") {
    return;
  }
  const label = relative(root, path);
  const artifacts = data.artifacts;
  if (!Array.isArray(artifacts) || artifacts.length === 0) {
    errors.push(`${label} must contain artifacts`);
    return;
  }
  const missing = new Set([
    "vision_session",
    "validation_target",
    "prototype_evidence",
    "decision_record",
    "product_design",
    "production_spec",
    "production_change",
    "team_runtime",
  ]);
  artifacts.forEach((artifact, index) => {
    if (!isRecord(artifact)) {
      errors.push(`${label} artifact ${index} is not a mapping`);
      return;
    }
    if (typeof artifact.artifact_type === "string") {
      missing.delete(artifact.artifact_type);
    }
    for (const key of [
      "artifact_type",
      "contract_type",
      "command",
      "source_of_truth_path",
      "template_path",
      "read_policy",
      "active_pointer",
      "required_keys",
    ]) {
      if (!(key in artifact)) {
        errors.push(`${label} artifact ${index} missing ${key}`);
      }
    }
    validateArtifactContractMetadata(label, index, artifact, errors);
  });
  for (const artifactType of [...missing].sort()) {
    errors.push(`${label} missing artifact_type ${artifactType}`);
  }
}

function validateArtifactContractMetadata(
  label: string,
  index: number,
  artifact: Record<string, unknown>,
  errors: string[],
): void {
  const readPolicy = artifact.read_policy;
  if (isRecord(readPolicy)) {
    for (const key of ["load_by_default", "agent_read_order", "max_yaml_lines", "max_note_lines", "raw_evidence"]) {
      if (!(key in readPolicy)) {
        errors.push(`${label} artifact ${index} read_policy missing ${key}`);
      }
    }
  } else {
    errors.push(`${label} artifact ${index} read_policy must be a mapping`);
  }
  const activePointer = artifact.active_pointer;
  if (isRecord(activePointer)) {
    for (const key of ["index_path", "pointer_key", "collection_key", "id_key", "path_key"]) {
      if (!(key in activePointer)) {
        errors.push(`${label} artifact ${index} active_pointer missing ${key}`);
      }
    }
  } else {
    errors.push(`${label} artifact ${index} active_pointer must be a mapping`);
  }
  const summaryPolicy = artifact.summary_policy;
  if (summaryPolicy !== null && summaryPolicy !== undefined) {
    if (!isRecord(summaryPolicy)) {
      errors.push(`${label} artifact ${index} summary_policy must be null or a mapping`);
    } else {
      for (const key of ["strategy", "path", "load_before_full", "refresh_when"]) {
        if (!(key in summaryPolicy)) {
          errors.push(`${label} artifact ${index} summary_policy missing ${key}`);
        }
      }
    }
  }
}

function validateDisclosureLevels(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "DISCLOSURE_LEVELS.yaml") {
    return;
  }
  const label = relative(root, path);
  const levels = data.levels;
  if (!Array.isArray(levels) || levels.length < 5) {
    errors.push(`${label} must contain disclosure levels 0 through 4`);
    return;
  }
  const seen = new Set<number>();
  levels.forEach((level, index) => {
    if (!isRecord(level)) {
      errors.push(`${label} level ${index} is not a mapping`);
      return;
    }
    if (typeof level.level === "number") {
      seen.add(level.level);
    }
    for (const key of ["name", "default_for_agents", "purpose", "examples"]) {
      if (!(key in level)) {
        errors.push(`${label} level ${index} missing ${key}`);
      }
    }
  });
  for (let level = 0; level <= 4; level += 1) {
    if (!seen.has(level)) {
      errors.push(`${label} missing disclosure level ${level}`);
    }
  }
}

function validateDiscoveryArtifact(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (typeof data.artifact_type !== "string") {
    return;
  }
  const label = relative(root, path);
  const required = artifactRequiredKeys(data.artifact_type);
  if (!required) {
    errors.push(`${label} has unknown artifact_type ${data.artifact_type}`);
    return;
  }
  for (const key of required) {
    if (!(key in data)) {
      errors.push(`${label} missing artifact key ${key}`);
    }
  }
  if (data.artifact_type === "validation_target") {
    validateValidationTarget(label, data, errors);
  } else if (data.artifact_type === "prototype_evidence") {
    validatePrototypeEvidence(root, label, data, errors);
  } else if (data.artifact_type === "decision_record") {
    validateDecisionRecord(label, data, errors);
  } else if (data.artifact_type === "product_design") {
    validateProductDesign(label, data, errors);
  } else if (data.artifact_type === "production_spec") {
    validateProductionSpec(label, data, errors);
  } else if (data.artifact_type === "production_change") {
    validateProductionChange(label, data, errors);
  } else if (data.artifact_type === "team_runtime") {
    validateTeamRuntime(label, data, errors);
  }
}

function artifactRequiredKeys(artifactType: string): string[] | null {
  const requiredByType: Record<string, string[]> = {
    vision_session: ["current_question", "stable_answers", "unresolved_questions", "vision_delta", "handoff"],
    validation_target: [
      "trigger",
      "core_question",
      "central_uncertainty",
      "hypothesis",
      "target_behavior",
      "feature_classification",
      "critical_assumptions",
      "prototype_scope",
      "prototype_experiment",
      "observable_signals",
      "acceptance",
      "decision_rules",
      "decision_options",
      "vision_gaps",
      "agent_readiness_gate",
    ],
    prototype_evidence: [
      "validation_target",
      "core_question",
      "prototype_mode",
      "prompt_pack_type",
      "validation_input",
      "source",
      "negative_constraints",
      "review_plan",
      "result",
      "handoff",
    ],
    decision_record: [
      "reviewed_evidence",
      "outcome",
      "rationale",
      "accepted_scope",
      "rejected_scope",
      "revision_scope",
      "next_command",
      "follow_up_questions",
    ],
    product_design: [
      "accepted_prototype_evidence",
      "personas",
      "journey_map",
      "user_stories",
      "feature_matrix",
      "kano_classification",
      "behavior_model",
      "ux_states",
      "scope",
      "open_questions",
      "conditional_packets",
      "spec_readiness",
    ],
    production_spec: [
      "source_design",
      "goal",
      "scope",
      "requirements",
      "interfaces",
      "acceptance",
      "verification",
      "risks",
      "change_readiness",
    ],
    production_change: [
      "source_spec",
      "problem",
      "goals",
      "non_goals",
      "affected_paths",
      "acceptance",
      "validation",
      "work_items",
      "risks",
      "runtime_readiness",
    ],
    team_runtime: [
      "source_change",
      "active_work_item",
      "execution_mode",
      "work_queue",
      "agents",
      "verification",
      "issues",
      "checkpoints",
      "handoff",
    ],
  };
  return requiredByType[artifactType] ?? null;
}

function validateValidationTarget(label: string, data: Record<string, unknown>, errors: string[]): void {
  validateValidationTrigger(label, data.trigger, errors);
  const featureClassification = data.feature_classification;
  if (isRecord(featureClassification)) {
    for (const key of ["existential", "supporting", "later", "out_of_scope"]) {
      if (!(key in featureClassification)) {
        errors.push(`${label} feature_classification missing ${key}`);
      }
    }
  }
  validatePrototypeScope(label, data.prototype_scope, errors);
  validatePrototypeExperiment(label, data.prototype_experiment, errors);
  validateSignalSet(label, "observable_signals", data.observable_signals, ["pass", "fail", "ambiguous"], errors);
  validateSignalSet(label, "decision_rules", data.decision_rules, ["continue", "revise", "pivot", "stop", "needs_more_evidence"], errors);
  validateAgentReadinessGate(label, data.agent_readiness_gate, errors);
}

function validateValidationTrigger(label: string, value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    return;
  }
  for (const key of ["mode", "requested_command", "reason"]) {
    if (!(key in value)) {
      errors.push(`${label} trigger missing ${key}`);
    }
  }
  const mode = String(value.mode ?? "");
  if (mode && !["user_explicit", "agent_auto"].includes(mode)) {
    errors.push(`${label} trigger.mode has invalid value ${mode}`);
  }
}

function validatePrototypeExperiment(label: string, value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    return;
  }
  for (const key of ["scenario", "must_show", "must_not_show"]) {
    if (!(key in value)) {
      errors.push(`${label} prototype_experiment missing ${key}`);
    }
  }
}

function validateSignalSet(label: string, field: string, value: unknown, keys: string[], errors: string[]): void {
  if (!isRecord(value)) {
    return;
  }
  for (const key of keys) {
    if (!(key in value)) {
      errors.push(`${label} ${field} missing ${key}`);
    }
  }
}

function validateAgentReadinessGate(label: string, value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    return;
  }
  for (const key of ["status", "blockers", "warnings", "write_authority"]) {
    if (!(key in value)) {
      errors.push(`${label} agent_readiness_gate missing ${key}`);
    }
  }
  const status = String(value.status ?? "");
  if (status && !["missing_validation", "thin_validation", "stale_validation", "ready_for_proto", "return_to_vision"].includes(status)) {
    errors.push(`${label} agent_readiness_gate.status has invalid value ${status}`);
  }
}

function validatePrototypeScope(label: string, value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    return;
  }
  for (const key of ["include", "exclude"]) {
    if (!(key in value)) {
      errors.push(`${label} prototype_scope missing ${key}`);
    }
  }
}

function validatePrototypeTodo(label: string, value: unknown, errors: string[]): void {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${label} must contain non-empty todo list`);
    return;
  }
  const seen = new Set<string>();
  value.forEach((item, index) => {
    if (!isRecord(item)) {
      errors.push(`${label} todo item ${index} is not a mapping`);
      return;
    }
    const taskId = item.task_id;
    if (typeof taskId !== "string" || taskId.length === 0) {
      errors.push(`${label} todo item ${index} missing task_id`);
      return;
    }
    if (seen.has(taskId)) {
      errors.push(`${label} duplicate prototype task_id ${taskId}`);
    }
    seen.add(taskId);
    for (const key of ["title", "status", "acceptance"]) {
      if (!(key in item)) {
        errors.push(`${label} ${taskId} missing ${key}`);
      }
    }
  });
}

function validatePrototypeEvidence(root: string, label: string, data: Record<string, unknown>, errors: string[]): void {
  if (!["image_prompt_pack", "visual", "interaction", "technical_feasibility", "3d_material", "workflow", "data_logic"].includes(String(data.prototype_mode))) {
    errors.push(`${label} has invalid prototype_mode ${String(data.prototype_mode)}`);
  }
  for (const key of ["reference_analysis", "concept_evidence", "implementation_evidence", "known_limits"]) {
    if (key in data && !Array.isArray(data[key])) {
      errors.push(`${label} ${key} must be an array`);
    }
  }
  if ("visual_direction" in data && !isRecord(data.visual_direction)) {
    errors.push(`${label} visual_direction must be a mapping`);
  }
  if ("visual_concept_policy" in data) {
    validateVisualConceptPolicy(label, data, errors);
  }
  if ("verification" in data && !isRecord(data.verification)) {
    errors.push(`${label} verification must be a mapping`);
  }
  if ("self_critique" in data && !isRecord(data.self_critique)) {
    errors.push(`${label} self_critique must be a mapping`);
  } else {
    validateSelfCritique(label, data.self_critique, errors);
  }
  const prototypeArtifact = data.prototype_artifact;
  if (isRecord(prototypeArtifact)) {
    for (const key of ["path", "type"]) {
      if (!(key in prototypeArtifact)) {
        errors.push(`${label} prototype_artifact missing ${key}`);
      }
    }
    validateLocalRef(root, label, "prototype_artifact.path", prototypeArtifact.path, errors);
  }
  validateEvidenceRefs(root, label, data, errors);
  if ("validation_input" in data && !isRecord(data.validation_input)) {
    errors.push(`${label} validation_input must be a mapping`);
  } else {
    validatePrototypeValidationInput(label, data.validation_input, errors);
  }
  if ("source" in data && !isRecord(data.source)) {
    errors.push(`${label} source must be a mapping`);
  }
  if ("negative_constraints" in data && !Array.isArray(data.negative_constraints)) {
    errors.push(`${label} negative_constraints must be an array`);
  }
  if ("review_plan" in data && !isRecord(data.review_plan)) {
    errors.push(`${label} review_plan must be a mapping`);
  }
  if ("directions" in data && !Array.isArray(data.directions)) {
    errors.push(`${label} directions must be an array`);
  }
  if ("screen_manifest" in data && !Array.isArray(data.screen_manifest)) {
    errors.push(`${label} screen_manifest must be an array`);
  }
  if ("screen_prompts" in data && !Array.isArray(data.screen_prompts)) {
    errors.push(`${label} screen_prompts must be an array`);
  }
  if ("prompt_pack_type" in data && !["strategic_proto_prompt_pack", "refined_proto_prompt_pack", "proto_review_evidence"].includes(String(data.prompt_pack_type))) {
    errors.push(`${label} has invalid prompt_pack_type ${String(data.prompt_pack_type)}`);
  }
  if (data.prompt_pack_type === "strategic_proto_prompt_pack") {
    validateStrategicPrototypePromptPack(label, data, errors);
  }
  if (!["pass", "fail", "unclear", "not_reviewed"].includes(String(data.result))) {
    errors.push(`${label} has invalid result ${String(data.result)}`);
  }
}

const STRATEGIC_NORMALIZED_FIELDS = [
  "product_domain",
  "primary_user",
  "usage_context",
  "current_alternative",
  "core_pain",
  "desired_behavior_change",
  "strongest_success_signal",
  "core_differentiator",
  "emotional_value",
  "functional_value",
  "trust_requirements",
  "privacy_requirements",
  "non_goals",
  "future_opportunities",
  "validation_target",
];

const STRATEGIC_CORE_FIELDS = [
  "target_user",
  "behavior_change",
  "mechanism",
  "differentiator",
  "boundary_conditions",
  "central_uncertainty",
];

const STRATEGIC_DIRECTION_FIELDS = [
  "direction_id",
  "name",
  "strategic_hypothesis",
  "validates",
  "main_risk",
  "distinctness_rationale",
  "prototype_prompt",
  "screen_prompts",
  "pm_judgment",
];

function validatePrototypeValidationInput(label: string, value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    return;
  }
  const mode = String(value.mode ?? "");
  if (mode && !["validation_present", "agent_auto_generated"].includes(mode)) {
    errors.push(`${label} validation_input.mode has invalid value ${mode}`);
  }
  if (mode === "vision_only" || mode === "internally_derived") {
    errors.push(`${label} validation_input.mode must reference durable validation, not ${mode}`);
  }
  if (!Array.isArray(value.refs)) {
    errors.push(`${label} validation_input.refs must be an array`);
  } else if (mode && value.refs.length === 0) {
    errors.push(`${label} validation_input.refs must include durable validation artifact refs`);
  }
}

function validateStrategicPrototypePromptPack(label: string, data: Record<string, unknown>, errors: string[]): void {
  validatePreflightQualityGate(label, data.preflight_quality_gate, errors);
  validateDirectionCountPolicy(label, data.direction_count_policy, errors);
  validateRequiredObjectFields(label, "normalized_input", data.normalized_input, STRATEGIC_NORMALIZED_FIELDS, errors);
  validateRequiredObjectFields(label, "strategic_core", data.strategic_core, STRATEGIC_CORE_FIELDS, errors);
  validateStrategicDirections(label, data.directions, data.direction_count_policy, errors);
  validateBuildRecommendation(label, data.build_recommendation, errors);
  validatePromptTextManifest(label, data.prompt_text_manifest, errors);
  validateImageGeneration(label, data.image_generation, errors);
}

function validatePreflightQualityGate(label: string, value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${label} preflight_quality_gate must be a mapping`);
    return;
  }
  for (const key of ["vision_status", "validation_status", "can_proceed", "blockers", "next_command_when_blocked"]) {
    if (!(key in value)) {
      errors.push(`${label} preflight_quality_gate missing ${key}`);
    }
  }
  for (const key of ["vision_status", "validation_status"]) {
    const status = String(value[key] ?? "");
    if (status && !["missing", "thin", "ready"].includes(status)) {
      errors.push(`${label} preflight_quality_gate.${key} has invalid value ${status}`);
    }
  }
  if (value.can_proceed !== true && value.next_command_when_blocked !== "/ow:vision") {
    errors.push(`${label} preflight_quality_gate must route blocked prototype work back to /ow:vision`);
  }
}

function validateDirectionCountPolicy(label: string, value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${label} direction_count_policy must be a mapping`);
    return;
  }
  const source = String(value.source ?? "");
  if (source && !["user_input", "agent_default_after_user_delegation"].includes(source)) {
    errors.push(`${label} direction_count_policy.source has invalid value ${source}`);
  }
  if (typeof value.resolved_count !== "number" || value.resolved_count < 1) {
    errors.push(`${label} direction_count_policy.resolved_count must be a positive number`);
  }
  if (source === "agent_default_after_user_delegation" && value.resolved_count !== 3) {
    errors.push(`${label} direction_count_policy delegated default must resolve to 3`);
  }
  if (value.ask_user_question_required === true && !nonEmptyString(value.ask_user_question)) {
    errors.push(`${label} direction_count_policy.ask_user_question must be set when askUserQuestion is required`);
  }
}

function validateRequiredObjectFields(label: string, field: string, value: unknown, keys: string[], errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${label} ${field} must be a mapping`);
    return;
  }
  for (const key of keys) {
    if (!hasUsefulValue(value[key])) {
      errors.push(`${label} ${field}.${key} must be non-empty`);
    }
  }
}

function validateStrategicDirections(label: string, value: unknown, countPolicy: unknown, errors: string[]): void {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${label} directions must contain strategic prompt directions`);
    return;
  }
  const resolvedCount = isRecord(countPolicy) && typeof countPolicy.resolved_count === "number" ? countPolicy.resolved_count : null;
  if (resolvedCount !== null && value.length < resolvedCount) {
    errors.push(`${label} directions must include at least direction_count_policy.resolved_count items`);
  }
  value.forEach((item, index) => {
    if (!isRecord(item)) {
      errors.push(`${label} directions[${index}] must be a mapping`);
      return;
    }
    for (const key of STRATEGIC_DIRECTION_FIELDS) {
      if (!hasUsefulValue(item[key])) {
        errors.push(`${label} directions[${index}].${key} must be non-empty`);
      }
    }
    const screenPrompts = item.screen_prompts;
    if (Array.isArray(screenPrompts) && screenPrompts.length < 2) {
      errors.push(`${label} directions[${index}].screen_prompts must include multi-image prompt text`);
    }
  });
}

function validateBuildRecommendation(label: string, value: unknown, errors: string[]): void {
  validateRequiredObjectFields(label, "build_recommendation", value, ["first_direction_id", "why_first", "success_signals", "failure_signals", "next_test_if_it_works"], errors);
}

function validatePromptTextManifest(label: string, value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${label} prompt_text_manifest must be a mapping`);
    return;
  }
  const status = String(value.status ?? "");
  if (status && !["draft", "ready_for_image_generation", "generated"].includes(status)) {
    errors.push(`${label} prompt_text_manifest.status has invalid value ${status}`);
  }
  if (status !== "draft" && value.directions_ready !== true) {
    errors.push(`${label} prompt_text_manifest.directions_ready must be true before image generation`);
  }
  if (!Array.isArray(value.prompt_text_refs)) {
    errors.push(`${label} prompt_text_manifest.prompt_text_refs must be an array`);
  }
}

function validateImageGeneration(label: string, value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${label} image_generation must be a mapping`);
    return;
  }
  const status = String(value.status ?? "");
  if (status && !["not_started", "queued", "in_progress", "complete", "blocked"].includes(status)) {
    errors.push(`${label} image_generation.status has invalid value ${status}`);
  }
  if (!nonEmptyString(value.batch_strategy)) {
    errors.push(`${label} image_generation.batch_strategy must be non-empty`);
  }
  if (!Array.isArray(value.generated_images)) {
    errors.push(`${label} image_generation.generated_images must be an array`);
  }
  if (!Array.isArray(value.collection_notes)) {
    errors.push(`${label} image_generation.collection_notes must be an array`);
  }
}

function hasUsefulValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (isRecord(value)) {
    return Object.keys(value).length > 0;
  }
  return nonEmptyString(value);
}

function validateVisualConceptPolicy(label: string, data: Record<string, unknown>, errors: string[]): void {
  const policy = data.visual_concept_policy;
  if (!isRecord(policy)) {
    errors.push(`${label} visual_concept_policy must be a mapping`);
    return;
  }
  const imageGeneration = policy.image_generation;
  if (!["generated", "skipped_by_user", "not_applicable"].includes(String(imageGeneration))) {
    errors.push(`${label} visual_concept_policy.image_generation has invalid value ${String(imageGeneration)}`);
    return;
  }
  if (imageGeneration === "skipped_by_user" && !nonEmptyString(policy.skip_reason)) {
    errors.push(`${label} visual_concept_policy.skip_reason is required when image generation is skipped`);
  }
  if (["visual", "interaction", "3d_material"].includes(String(data.prototype_mode))) {
    if (imageGeneration === "not_applicable") {
      errors.push(`${label} visual_concept_policy.image_generation cannot be not_applicable for ${String(data.prototype_mode)} prototypes`);
    }
    if (imageGeneration === "generated" && (!Array.isArray(data.concept_evidence) || data.concept_evidence.length === 0)) {
      errors.push(`${label} concept_evidence is required when image generation is generated`);
    }
  }
}

function validateSelfCritique(label: string, value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    return;
  }
  for (const key of ["philosophy", "hierarchy", "execution", "specificity", "restraint", "accessibility", "responsive_behavior"]) {
    if (!nonEmptyString(value[key])) {
      errors.push(`${label} self_critique.${key} must be a non-empty string`);
    }
  }
  if (!Array.isArray(value.repairs)) {
    errors.push(`${label} self_critique.repairs must be an array`);
  }
}

function validateEvidenceRefs(root: string, label: string, data: Record<string, unknown>, errors: string[]): void {
  for (const key of ["reference_analysis", "concept_evidence", "implementation_evidence", "evidence"]) {
    const items = data[key];
    if (!Array.isArray(items)) {
      continue;
    }
    items.forEach((item, index) => {
      if (isRecord(item)) {
        validateLocalRef(root, label, `${key}[${index}].ref`, item.ref, errors);
      }
    });
  }
  const verification = data.verification;
  if (!isRecord(verification)) {
    return;
  }
  for (const key of ["screenshots", "logs"]) {
    const refs = verification[key];
    if (!Array.isArray(refs)) {
      continue;
    }
    refs.forEach((ref, index) => validateLocalRef(root, label, `verification.${key}[${index}]`, ref, errors));
  }
}

function validateLocalRef(root: string, label: string, field: string, value: unknown, errors: string[]): void {
  if (typeof value !== "string" || value.length === 0 || isExternalRef(value)) {
    return;
  }
  const resolved = resolve(root, value);
  if (resolved !== root && !resolved.startsWith(`${root}/`)) {
    errors.push(`${label} ${field} references path outside root: ${value}`);
    return;
  }
  if (!existsSyncSafe(resolved)) {
    errors.push(`${label} ${field} references missing path ${value}`);
  }
}

function isExternalRef(value: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function nonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function validateDecisionRecord(label: string, data: Record<string, unknown>, errors: string[]): void {
  if (!["continue", "revise", "pivot", "stop", "needs_more_evidence"].includes(String(data.outcome))) {
    errors.push(`${label} has invalid outcome ${String(data.outcome)}`);
  }
}

function validateProductDesign(label: string, data: Record<string, unknown>, errors: string[]): void {
  const specReadiness = data.spec_readiness;
  if (isRecord(specReadiness)) {
    for (const key of ["ready", "next_command"]) {
      if (!(key in specReadiness)) {
        errors.push(`${label} spec_readiness missing ${key}`);
      }
    }
  }
}

function validateProductionSpec(label: string, data: Record<string, unknown>, errors: string[]): void {
  for (const key of ["scope", "requirements", "interfaces", "verification", "change_readiness"]) {
    if (key in data && !isRecord(data[key])) {
      errors.push(`${label} ${key} must be a mapping`);
    }
  }
  const changeReadiness = data.change_readiness;
  if (isRecord(changeReadiness)) {
    for (const key of ["ready", "next_command"]) {
      if (!(key in changeReadiness)) {
        errors.push(`${label} change_readiness missing ${key}`);
      }
    }
  }
}

function validateProductionChange(label: string, data: Record<string, unknown>, errors: string[]): void {
  for (const key of ["goals", "non_goals", "affected_paths", "acceptance", "validation", "risks"]) {
    if (key in data && !Array.isArray(data[key])) {
      errors.push(`${label} ${key} must be an array`);
    }
  }
  const runtimeReadiness = data.runtime_readiness;
  if (isRecord(runtimeReadiness)) {
    for (const key of ["ready", "next_command"]) {
      if (!(key in runtimeReadiness)) {
        errors.push(`${label} runtime_readiness missing ${key}`);
      }
    }
  }
}

function validateTeamRuntime(label: string, data: Record<string, unknown>, errors: string[]): void {
  if (typeof data.execution_mode === "string" && !["single_agent", "agent_team", "reconcile", "qa_fix"].includes(data.execution_mode)) {
    errors.push(`${label} has invalid execution_mode ${data.execution_mode}`);
  }
  for (const key of ["work_queue", "agents", "issues", "checkpoints"]) {
    if (key in data && !Array.isArray(data[key])) {
      errors.push(`${label} ${key} must be an array`);
    }
  }
  if ("verification" in data && !isRecord(data.verification)) {
    errors.push(`${label} verification must be a mapping`);
  }
  if ("handoff" in data && !isRecord(data.handoff)) {
    errors.push(`${label} handoff must be a mapping`);
  }
}

function validateActivePointer(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  const rule = [
    pointerRule("VISION_CONTRACT.yaml", "current_session", "sessions", "session_id", "path"),
    pointerRule("VALIDATION_INDEX.yaml", "current_validation", "validations", "validation_id", "path"),
    pointerRule("PROTOTYPE_INDEX.yaml", "current_prototype", "prototypes", "prototype_id", "path"),
    pointerRule("DECISION_INDEX.yaml", "current_decision", "decisions", "decision_id", "path"),
    pointerRule("DESIGN_INDEX.yaml", "current_design", "designs", "design_id", "path"),
    pointerRule("SPEC_INDEX.yaml", "current_spec", "specs", "spec_id", "path"),
    pointerRule("CHANGE_INDEX.yaml", "current_change", "changes", "change_id", "path"),
    pointerRule("RUNTIME_INDEX.yaml", "current_run", "runs", "run_id", "path"),
  ].find((item) => basename(path) === item.fileName);
  if (!rule) {
    return;
  }
  const label = relative(root, path);
  const pointer = data[rule.pointerKey];
  if (pointer === null || pointer === undefined) {
    return;
  }
  if (typeof pointer !== "string" || pointer.length === 0) {
    errors.push(`${label} ${rule.pointerKey} must be null or a non-empty string`);
    return;
  }
  const collection = data[rule.collectionKey];
  if (!Array.isArray(collection)) {
    errors.push(`${label} ${rule.collectionKey} must be a list when ${rule.pointerKey} is set`);
    return;
  }
  const entry = collection.find((item) => isRecord(item) && item[rule.idKey] === pointer);
  if (!isRecord(entry)) {
    errors.push(`${label} ${rule.pointerKey} references missing ${rule.collectionKey} entry ${pointer}`);
    return;
  }
  const artifactPath = entry[rule.pathKey];
  if (typeof artifactPath !== "string" || artifactPath.length === 0) {
    errors.push(`${label} ${pointer} missing ${rule.pathKey}`);
    return;
  }
  if (!existsSyncSafe(join(contractRootFor(root, path), artifactPath))) {
    errors.push(`${label} ${rule.pointerKey} references missing artifact path ${artifactPath}`);
  }
}

function validateWorkflowIndex(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "WORKFLOW_INDEX.yaml") {
    return;
  }
  const label = relative(root, path);
  const contracts = data.contracts;
  if (!Array.isArray(contracts) || contracts.length === 0) {
    errors.push(`${label} must contain contracts`);
    return;
  }
  const projectRoot = workflowRootFor(path);
  for (const entry of contracts) {
    if (!isRecord(entry)) {
      errors.push(`${label} has non-mapping contract entry`);
      continue;
    }
    const entryPath = entry.path;
    if (typeof entryPath === "string" && !existsSyncSafe(join(projectRoot, entryPath))) {
      errors.push(`${label} references missing contract path ${entryPath}`);
    }
  }
}

function validateContractGraph(root: string, path: string, data: Record<string, unknown>, errors: string[]): void {
  if (basename(path) !== "CONTRACT_GRAPH.yaml") {
    return;
  }
  const label = relative(root, path);
  const nodes = data.nodes;
  const edges = data.edges;
  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    errors.push(`${label} must contain nodes and edges lists`);
    return;
  }
  const nodeIds = new Set(
    nodes.flatMap((node) => (isRecord(node) && typeof node.contract_id === "string" ? [node.contract_id] : [])),
  );
  for (const edge of edges) {
    if (!isRecord(edge)) {
      errors.push(`${label} has non-mapping edge`);
      continue;
    }
    for (const key of ["from", "to"]) {
      const value = edge[key];
      if (typeof value !== "string" || !nodeIds.has(value)) {
        errors.push(`${label} edge ${key} references missing node ${String(value)}`);
      }
    }
  }
}

function pointerRule(fileName: string, pointerKey: string, collectionKey: string, idKey: string, pathKey: string) {
  return { fileName, pointerKey, collectionKey, idKey, pathKey };
}

function contractRootFor(root: string, path: string): string {
  const parts = path.split("/");
  const codexIndex = parts.indexOf(".codex");
  if (codexIndex <= 0) {
    return root;
  }
  return parts.slice(0, codexIndex).join("/");
}

function workflowRootFor(path: string): string {
  return resolve(path, "..", "..", "..");
}

async function findFiles(root: string, predicate: (entryName: string) => boolean): Promise<string[]> {
  if (!(await exists(root))) {
    return [];
  }
  const found: string[] = [];
  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && IGNORED_DIRS.has(entry.name)) {
        continue;
      }
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
      } else if (entry.isFile() && predicate(entry.name)) {
        found.push(path);
      }
    }
  }
  await walk(root);
  return found.sort();
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

function existsSyncSafe(path: string): boolean {
  try {
    statSync(path);
    return true;
  } catch (error) {
    if (isNotFound(error)) {
      return false;
    }
    throw error;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function messageFor(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
