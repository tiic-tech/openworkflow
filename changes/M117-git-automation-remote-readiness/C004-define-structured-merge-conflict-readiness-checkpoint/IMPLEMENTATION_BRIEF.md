# M117 C004 Implementation Brief

## Goal

Expose structured merge-conflict readiness data in remote-plan and simulator
without running merge, rebase, reset, force-push, PR merge, or working-tree
conflict resolution.

## Read First

- `changes/M117-git-automation-remote-readiness/HIGH_RISK_DECISION_REPORT.md`
- `packages/core/src/git/remoteReadonlyPlanner.ts`
- `packages/core/src/git/autonomousSimulator.ts`
- `references/git-version-control-governance.md`
- `references/gh-operation-governance.md`

## Do

- Add a shared merge-readiness checkpoint source for read-only git probing.
- Report target base/branch heads, merge base, fast-forward state, conflict
  probe result, conflict files, required validations, and stop reasons.
- Add runtime-surface coverage for clean and conflicting temporary repositories.
- Update governance references for isolated conflict resolution evidence.

## Do Not

- Do not run `git merge`, `git rebase`, `git reset`, force-push, PR merge, or
  conflict resolution in the user's working tree.
- Do not execute real remote mutation.
- Do not expand into C005 integrated story verification.
- Do not hand-edit generated `.agents/**` or `.openworkflow/**` surfaces.

## Validation

- `npm run build`
- targeted merge-conflict checkpoint fixture
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`

## Completion Notes

- Remote-plan and simulator now report `mergeReadiness`.
- Clean cases report fast-forward state and an empty conflict file list.
- Conflict cases stop with the conflicting files and isolated worktree evidence
  requirements.
- The next queue-local action after commit evidence is C005.
