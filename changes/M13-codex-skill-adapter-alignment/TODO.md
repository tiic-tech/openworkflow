# M13 TODO

M13 aligns the Codex adapter with Codex Skill registration. It corrects the M12
assumption that global prompt files should be the primary Codex command surface.

## Plan

1. [x] Generate `.agents/skills/ow-*` as the primary Codex adapter surface.
2. [x] Put each OpenWorkflow command protocol into its `SKILL.md`.
3. [x] Add `agents/openai.yaml` display metadata for each skill.
4. [x] Update config, manifest, doctor, and runtime verification.
5. [x] Rename code-level M12 verification identifiers to semantic runtime-surface names.
6. [x] Run full validation.

## Completion Checklist

- [x] `.agents/skills/ow-*/SKILL.md` generated.
- [x] `.agents/skills/ow-*/agents/openai.yaml` generated.
- [x] No default `$CODEX_HOME/prompts/ow-*.md` generation.
- [x] No default `.codex/commands/ow` generation.
- [x] Config identifies `.agents/skills` as primary Codex surface.
- [x] Doctor validates skill surface.
- [x] Runtime surface verification uses semantic names.
- [x] Full validation passes.
