import type { CodexTemplate } from "./templates.js";

export function generateSkillTemplates(): CodexTemplate[] {
  return [
    {
      id: "codex.skill.openworkflow",
      path: ".codex/skills/openworkflow.md",
      content: codexSkill(),
    },
  ];
}

function codexSkill(): string {
  return `# OpenWorkflow Codex Adapter

Use this adapter to operate OpenWorkflow from Codex. The durable workflow contracts live in \`.openworkflow/\`.

Rules:

- Do not create production specs before validation, prototype decision, and design readiness.
- Do not create Agent Team runtime before a focused change exists.
- Keep \`.codex/\` generated or tool-facing; keep product truth in \`.openworkflow/\`.
- Run \`openworkflow sync --tools codex\` after upgrading the npm package or changing adapter templates.
`;
}
