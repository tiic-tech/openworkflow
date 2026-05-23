# M121 High-Risk Decision Report: M117 Branch Push

## Trigger

M121 C001 completed the read-only M117 publication preflight and named C002 as
the next recommended candidate. C002 concerns a remote branch push, which is a
high-risk GitHub mutation under `references/gh-operation-governance.md`.

This report stops before execution. It is evidence, not approval.

## Change

- Candidate: C002
- Title: Prepare exact high-risk push decision report
- Status at report creation: candidate
- Target plan: `M117-git-automation-remote-readiness`
- Target local branch: `codex/m117-git-automation-remote-readiness`
- Target remote branch: `origin/codex/m117-git-automation-remote-readiness`
- Target base: `main`
- Local branch head: `898f0152a4e3e026ee5dcc78d4ef585c722a37b7`
- Existing remote branch: absent
- Existing PR: none

The high-risk boundary is exactly one future branch push:

```bash
git -C ../openworkflow-m117-publish push origin HEAD:refs/heads/codex/m117-git-automation-remote-readiness
```

This command is not approved by this report.

## Concrete Risks

- The push creates a new remote branch and changes shared repository state.
- The M117 branch is 263 commits ahead of `origin/main`; reviewers will see a broad historical branch even though merge readiness is clean.
- Pushing from the wrong current branch could publish M121 governance commits instead of the intended M117 branch.
- The current M121 working tree cannot clear M117 branch-identity gates because `git-automation remote-plan` and `simulate` expect the current branch to match `codex/m117-git-automation-remote-readiness`.
- The remote-plan evidence model still reports `simulator evidence is missing`. This must be addressed or explicitly accepted before push approval.
- A later draft PR is a separate GitHub mutation and must not be bundled into the push approval.
- Rollback should avoid force-push or remote deletion unless a later separate high-risk report and exact approval exist.

## Decision Options

### Defer

Do not publish M117 yet. Keep M121 at the high-risk stop until branch-stack
review, simulator evidence policy, or review strategy is clarified.

### Design-Only

Keep this report as the durable approval packet and do no local worktree or
remote work. This preserves the plan but does not improve readiness.

### Narrow Spike

Create an isolated M117 worktree and run only read-only preflight commands from
that worktree. Do not push. Use the result to decide whether the simulator
evidence binding gap is resolved or remains an explicit approval exception.

Suggested read-only commands:

```bash
git worktree add ../openworkflow-m117-publish codex/m117-git-automation-remote-readiness
node ../openworkflow-m117-publish/dist/cli/src/index.js git-automation remote-plan --root ../openworkflow-m117-publish --queue changes/M117-git-automation-remote-readiness/CANDIDATE_CHANGES.yaml --base origin/main --remote origin --target-base main --json
node ../openworkflow-m117-publish/dist/cli/src/index.js git-automation simulate --root ../openworkflow-m117-publish --queue changes/M117-git-automation-remote-readiness/CANDIDATE_CHANGES.yaml --base main --json
git -C ../openworkflow-m117-publish status --short --branch
```

### Full Implementation

After exact user approval, create or reuse the isolated M117 worktree, run fresh
M117-context preflight, then push exactly the M117 branch to origin.

The exact future push command would be:

```bash
git -C ../openworkflow-m117-publish push origin HEAD:refs/heads/codex/m117-git-automation-remote-readiness
```

Draft PR creation remains out of scope for this push approval and belongs to
C004 after C003 succeeds.

## Recommended Path

Recommended option: narrow spike first, then return for exact push approval.

Reasoning:

- It honors C001's isolated-worktree execution model.
- It avoids publishing from the M121 governance branch.
- It gives `git-automation remote-plan` and `simulate` a current branch that matches M117's branch boundary.
- It can determine whether the `simulator evidence is missing` blocker is still real before the remote push approval is requested.

## Guardrails

- Keep M121 governance evidence on `codex/m121-m117-remote-publication`.
- Use an isolated worktree path: `../openworkflow-m117-publish`.
- The isolated worktree must be on `codex/m117-git-automation-remote-readiness`.
- Do not run `git push` during the narrow spike.
- Do not create, edit, mark ready, close, or merge any PR during C002.
- Do not mutate Issues, labels, milestones, or assignments.
- Do not rebase, reset, force-push, delete branches, or rewrite history.
- Do not publish M71 or the shared M101-derived branch group.
- If the isolated worktree is dirty or on the wrong branch, stop.

## Go Criteria

Implementation may proceed beyond this report only if the user explicitly names
one concrete option:

- "Approve M121 C002 narrow spike for isolated M117 worktree preflight."
- "Approve M121 C003 push using: git -C ../openworkflow-m117-publish push origin HEAD:refs/heads/codex/m117-git-automation-remote-readiness"

Generic approval such as "continue" is not enough to execute the push.

## Stop Criteria

Stop even after approval if any of these occur:

- Current branch or isolated worktree branch is not `codex/m117-git-automation-remote-readiness` for the M117-context preflight or push.
- The M117 local branch head differs from `898f0152a4e3e026ee5dcc78d4ef585c722a37b7` and the difference is not explained in local evidence.
- The remote branch already exists and points somewhere unexpected.
- A PR for M117 already exists.
- `git-automation remote-plan` reports blockers other than the already-known simulator evidence binding gap, unless the user explicitly accepts the exact blocker.
- Merge readiness reports conflicts.
- The working tree is dirty with unrelated changes.
- The command would push any branch other than `codex/m117-git-automation-remote-readiness`.
- The operation would require force-push, remote deletion, rebase, reset, merge, PR mutation, or Issue mutation.

## Validation Expectations

Before any approved push, collect fresh evidence:

```bash
git -C ../openworkflow-m117-publish status --short --branch
git -C ../openworkflow-m117-publish rev-parse HEAD
git -C ../openworkflow-m117-publish ls-remote --heads origin codex/m117-git-automation-remote-readiness
gh pr list --repo tiic-tech/openworkflow --head codex/m117-git-automation-remote-readiness --base main --json number,url,state,isDraft,title,headRefName,baseRefName
node ../openworkflow-m117-publish/dist/cli/src/index.js git-automation remote-plan --root ../openworkflow-m117-publish --queue changes/M117-git-automation-remote-readiness/CANDIDATE_CHANGES.yaml --base origin/main --remote origin --target-base main --json
node ../openworkflow-m117-publish/dist/cli/src/index.js git-automation simulate --root ../openworkflow-m117-publish --queue changes/M117-git-automation-remote-readiness/CANDIDATE_CHANGES.yaml --base main --json
git -C ../openworkflow-m117-publish merge-tree --write-tree origin/main HEAD
git diff --check
```

After any approved push, record local audit evidence in M121 before any draft PR
work:

- approval text
- exact command
- local branch head
- previous remote branch state
- resulting remote branch ref
- timestamp
- rollback guidance

Rollback preference: use a follow-up revert PR after review. Do not force-push or
delete the remote branch without a new high-risk report and exact approval.
