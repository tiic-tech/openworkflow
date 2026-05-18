import type { CodexTemplate } from "./templates.js";

export function generateCommandTemplates(): CodexTemplate[] {
  return [
    {
      id: "codex.command.build-workflow",
      path: ".codex/commands/build-workflow.md",
      content: buildWorkflowCommand(),
    },
    ...stageCommandTemplates(),
  ];
}

function stageCommandTemplates(): CodexTemplate[] {
  const commands = [
    ["build-vision", "Use one-question-at-a-time collaboration to create or refine `.openworkflow/vision/VISION_CONTRACT.yaml`."],
    ["build-validation", "Read vision artifacts and create validation-first prioritization under `.openworkflow/validation/`."],
    ["build-prototype", "Read validation artifacts and create a focused local prototype under `.openworkflow/prototypes/`."],
    ["build-decision", "Record user review outcomes from prototype or production slices under `.openworkflow/decisions/`."],
    ["build-spec", "Create one focused production spec from an accepted prototype decision."],
    ["build-change", "Create one focused production change from a spec for the current core feature."],
    ["run-team", "Execute approved production runtime work after spec and change contracts exist."],
  ] as const;

  return commands.map(([name, purpose]) => ({
    id: `codex.command.${name}`,
    path: `.codex/commands/${name}.md`,
    content: commandDoc(name, purpose),
  }));
}

function buildWorkflowCommand(): string {
  return `# /build-workflow

Initialize or reconcile OpenWorkflow contracts. Use \`.openworkflow/\` as the platform-independent source of truth and \`.codex/\` only as this tool adapter.

Recommended CLI:

\`\`\`bash
openworkflow init . --tools codex
openworkflow sync --tools codex
openworkflow validate --root .
\`\`\`
`;
}

function commandDoc(name: string, purpose: string): string {
  return `# /${name}

${purpose}

Source of truth: \`.openworkflow/\`.

Load only the contract files required for this stage. Keep artifacts short, scoped, and traceable through \`.openworkflow/workflow/CONTRACT_GRAPH.yaml\`.
`;
}
