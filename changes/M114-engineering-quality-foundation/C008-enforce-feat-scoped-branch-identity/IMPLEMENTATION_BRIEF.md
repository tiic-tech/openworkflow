# M114 C008 Implementation Brief

## Goal

Close the branch governance defect where a candidate queue can record an
unrelated continuation branch as `queue_policy.branch_boundary`, then have
`resume` and `git-automation commit` treat current-branch equality as valid feat
ownership.

## Read First

- `changes/M114-engineering-quality-foundation/CANDIDATE_CHANGES.yaml`
- `references/git-version-control-governance.md`
- `skills/decompose-to-changes/SKILL.md`
- `skills/select-change/SKILL.md`
- `skills/coder/SKILL.md`
- `packages/core/src/workflow/planningQueueResume.ts`
- `packages/core/src/git/localGitAutomation.ts`
- `packages/cli/src/commands/gitAutomation.ts`
- `packages/core/src/validators/validateRepositoryContracts.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`

## Do

- Define the branch identity invariant for branch-governed queues.
- Add RED evidence for a queue whose `plan_id` and `branch_boundary` point to
  different feat identities.
- Make `resume` distinguish branch equality from feat ownership.
- Make `git-automation commit` unable to silently bless a stale continuation
  branch as the owning feat branch.
- Document a narrow explicit exception path for temporary continuation branches.

## Do Not

- Do not rewrite existing git history.
- Do not push, open PRs, merge, or mutate remote state.
- Do not migrate every historical stale queue in this candidate.
- Do not hand-edit generated `.agents/**` or `.openworkflow/**`.

## Owner And Dependency Map

- Source policy: `references/git-version-control-governance.md`
- Source skills: `skills/decompose-to-changes/`, `skills/select-change/`
- Runtime read model: `packages/core/src/workflow/planningQueueResume.ts`
- Git automation: `packages/core/src/git/`, `packages/cli/src/commands/gitAutomation.ts`
- Structural checks: `packages/core/src/validators/validateRepositoryContracts.ts`, `packages/cli/src/dev/verifyRuntimeSurface.ts`
- Queue evidence: `changes/M114-engineering-quality-foundation/`

Dependency order:

```text
RED fixture -> branch identity model/policy -> resume/git-automation reporting -> validator/runtime verifier -> GREEN -> commit evidence
```

## Validation

- `npm run build`
- targeted branch-identity fixture
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js resume --root . --json`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

## Stop Conditions

- The implementation requires changing remote state.
- The fix depends on rewriting M114/M115/M106 historical commits.
- The change grows into broad historical branch migration instead of preventing
  future false branch trust.
