# M122 High-Risk Decision Report

## Trigger

`resume --root . --json` identified `C002` as the next ready candidate, but
`C002` is marked `risk: high`. The select-change protocol requires a concrete
decision report before selection or implementation. This report is evidence, not
approval.

## Change

- Candidate: `C002`
- Title: Prepare M71 push decision and isolated execution preflight
- Current status: `ready`
- Target branch: `codex/m71-git-version-governance`
- Target base: `main`
- Target remote: `origin`
- Local target head: `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`
- Current `origin/main`: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Commits ahead of `origin/main`: `66`
- Remote target branch: absent
- Existing PRs for the target head branch: none

`C002` is high risk because it prepares the exact boundary for a later remote
branch push. The later push would mutate the shared GitHub repository state.

## Concrete Risks

- Pushing `codex/m71-git-version-governance` publishes a 66-commit historical
  stack for remote review.
- A mistaken refspec could publish the wrong branch or head.
- A stale local ref could push a different head than the one captured by C001.
- A stale remote state could overwrite or conflict with a branch created after
  the last read-only preflight.
- Draft PR creation is a separate high-risk GitHub mutation and must not be
  bundled into the branch push approval.

## Decision Options

- Defer: leave `C002` ready and do not prepare selection artifacts.
- Design-only: keep this report as the decision packet and make no selection.
- Narrow preflight: approve selecting `C002` only to prepare local-only isolated
  execution preflight artifacts. This does not approve push or PR creation.
- Full push execution: approve the later `C003` remote push using exactly this
  command after C002 is selected and completed:

```sh
git push origin refs/heads/codex/m71-git-version-governance:refs/heads/codex/m71-git-version-governance
```

## Recommended Path

Approve the narrow preflight option for `C002`. That allows the next agent step
to select `C002`, write the local-only implementation brief, and prepare the
isolated execution model without mutating remote state.

Do not approve full push execution yet. C003 should re-check the local head,
remote branch absence or exact remote head, and PR state immediately before any
remote mutation.

Status update: the narrow C002 preflight option was approved on 2026-05-23 and
completed as local-only evidence in
`changes/M122-m71-historical-stack-publication/C002-prepare-m71-push-decision-preflight/WORKTREE_PREFLIGHT.md`.
This does not approve the C003 push.

Second status update: C003 was separately approved on 2026-05-23 and executed
with exactly this command:

```bash
git -C /Users/archy/Projects/StartUp/openworkflow-m71-publish push origin HEAD:refs/heads/codex/m71-git-version-governance
```

The remote branch now exists at
`a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`. This does not approve draft PR
creation.

Third status update: the user asked to advance C004 on 2026-05-23. This was
interpreted as approval to prepare the local draft-PR approval packet, not as
approval to create a GitHub PR. The C004 PR body is prepared at
`changes/M122-m71-historical-stack-publication/C004-draft-pr-approval-packet/PR_BODY.md`.

The exact C004 draft PR command that remains unapproved is:

```bash
gh pr create --repo tiic-tech/openworkflow --head codex/m71-git-version-governance --base main --draft --title "M71: Git version control governance" --body-file changes/M122-m71-historical-stack-publication/C004-draft-pr-approval-packet/PR_BODY.md
```

Fourth status update: C004 was separately approved on 2026-05-23 and executed
with exactly the command above. Draft PR #6 was created:
`https://github.com/tiic-tech/openworkflow/pull/6`. The PR is `OPEN` and
`isDraft:true`. This does not approve ready-for-review conversion, merge, PR
edit after creation, PR close, Issue mutation, another push, force-push, or
branch deletion.

## Guardrails

- Do not run `git push` during C002.
- Do not create a draft PR during C002.
- Use the fully qualified push refspec above if C003 is later approved.
- Re-check `git rev-parse origin/main codex/m71-git-version-governance`,
  `git ls-remote --heads origin codex/m71-git-version-governance`, and existing
  PR state immediately before any approved push.
- Stop if the local M71 head differs from
  `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`.
- Stop if the remote target branch appears before approval.
- Stop if any PR already exists for `codex/m71-git-version-governance`.
- Keep draft PR creation as a separate approval boundary after a successful
  approved branch push.
- Do not create the M71 draft PR unless the user separately approves the exact
  C004 `gh pr create` command.

## Go Criteria

To select and implement `C002`, the user must explicitly approve this concrete
option:

```text
Approve M122 C002 narrow preflight: select C002 and prepare local-only isolated execution preflight; do not push.
```

To execute the later remote branch push under `C003`, the user must separately
approve the exact command:

```text
Approve M122 C003 push: run git push origin refs/heads/codex/m71-git-version-governance:refs/heads/codex/m71-git-version-governance
```

To create the C004 draft PR, the user must separately approve the exact command:

```text
Approve M122 C004 draft PR: run gh pr create --repo tiic-tech/openworkflow --head codex/m71-git-version-governance --base main --draft --title "M71: Git version control governance" --body-file changes/M122-m71-historical-stack-publication/C004-draft-pr-approval-packet/PR_BODY.md
```

## Stop Criteria

- Approval text is ambiguous or says only "continue".
- The working tree contains unrelated dirty paths.
- Current branch no longer matches `codex/m122-m71-historical-stack-publication`
  for planning work.
- Local M71 head, remote branch state, or PR state differs from this report.
- The next action would push, create a PR, edit a PR, mark a PR ready, merge,
  mutate an Issue, rebase, reset, force-push, or delete a branch without exact
  operation-level approval.

## Validation Expectations

For C002 local-only preflight:

- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

For any later approved C003 push:

- `git status --short --branch`
- `git rev-parse origin/main codex/m71-git-version-governance`
- `git ls-remote --heads origin codex/m71-git-version-governance`
- `gh pr list --repo tiic-tech/openworkflow --head codex/m71-git-version-governance --state all --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid`
- `git diff --check`

For any later approved C004 draft PR:

- `gh pr list --repo tiic-tech/openworkflow --head codex/m71-git-version-governance --base main --state all --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid`
- `gh pr view <created-pr> --repo tiic-tech/openworkflow --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup`
- `git diff --check`
