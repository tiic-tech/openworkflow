# C004 Implementation Brief

## Goal

Make the git-automation commit path the obvious way to complete an
implementation selected change with per-candidate local commit evidence.

## Read First

- `changes/M102-selected-change-commit-gate/C004-git-automation-commit-evidence-workflow/SELECTED_CHANGE.yaml`
- `packages/core/src/commands/registry.ts`
- `packages/cli/src/commands/gitAutomation.ts`
- `packages/core/src/git/localGitAutomation.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `references/git-version-control-governance.md`

## Do

- Update the source registry so generated git-automation skill guidance names
  `changes/<plan_id>/<candidate-id>-<slug>/LOCAL_COMMIT_EVIDENCE.yaml`.
- Keep remote operations explicitly gated.
- Make commit evidence recording easy to use from `git-automation commit`.
- Run `sync` after registry updates instead of hand-editing generated files.
- Include only generated `ow-git-automation` skill/audit updates produced by
  `sync`; do not manually patch managed surfaces.
- Verify runtime fixtures and strict trust gates.

## Do Not

- Do not push, create PRs, merge, or mutate GitHub Issues.
- Do not edit managed `.openworkflow/**` surfaces directly.
- Do not treat one checkpoint commit for multiple selected changes as valid.
- Do not alter C001-C003 policy or trust-gate semantics.

## Owned Paths

- `packages/core/src/commands/registry.ts`
- `packages/core/src/git/`
- `packages/cli/src/commands/gitAutomation.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `references/git-version-control-governance.md`
- `.agents/skills/ow-git-automation/SKILL.md`
- `.openworkflow/audit/COMMAND_AUDIT_INDEX.yaml`
- `.openworkflow/audit/CONTEXT_PACKETS.yaml`
- `changes/M102-selected-change-commit-gate/`

## Validation

```bash
npm run build
node dist/cli/src/index.js sync --root . --json
npm run verify:runtime-surface
node dist/cli/src/index.js validate --root . --json
node dist/cli/src/index.js summaries --root . --strict --json
git diff --check
```

## Stop Conditions

- Stop if remote mutation becomes necessary.
- Stop if generated surfaces would need manual edits instead of sync.
- Stop if the implementation would permit batched checkpoint commits to satisfy selected-change completion.
