# Git Version Control Governance

This reference defines OpenWorkflow's git governance hierarchy for dogfood
development. It is a planning and audit contract, not an automation mandate.

## Hierarchy

Use these boundaries when planning and implementing work:

- Atom task: an implementation checklist item inside one selected change.
- Selected change: one commit-sized implementation unit.
- `CANDIDATE_CHANGES.yaml`: one feature-sized planning queue.
- Feat branch: the git branch that owns one candidate queue.
- Pull request: the integration review boundary for one feat branch.
- Merge or release: the boundary where accepted PR work enters the target line.

An Issue is an intent, problem, request, bug, or external tracking source. It
can decompose into one or more candidate queues, and one candidate queue can
reference one or more Issues. An Issue is not automatically a selected change.
Use `references/issue-governance.md` for local and GitHub-backed
source-of-truth rules.

## Commit Boundary

A selected candidate should normally complete as one coherent git commit. The
commit should include:

- selection artifacts under `changes/<plan_id>/<candidate-id>-<slug>/`
- source, reference, or fixture edits owned by the selected candidate
- queue status and completion evidence for that selected candidate
- validation evidence in the queue or selected change artifact

Commit messages should include the plan id and candidate id when practical:

```text
M71/G001 Formalize git governance hierarchy
```

If a candidate is discovered to be too broad for one commit, split or supersede
it in the owning queue before implementation continues.

## Feat Branch Boundary

Each new `CANDIDATE_CHANGES.yaml` queue should have an owning branch. The branch
name should be stable and scoped to the feat, for example:

```text
codex/m71-git-version-governance
```

The queue should record the branch in `queue_policy.branch_boundary` when the
queue opts into branch governance. Work for selected candidates should happen on
that branch unless the user explicitly approves an exception.

For new branch-governed queues, the branch boundary should carry the same
feat identity as the queue plan id, normally the leading milestone token such
as `M114` in both `M114-engineering-quality-foundation` and
`codex/m114-engineering-quality-foundation`. A branch boundary that names
another plan id is not feat ownership even when it equals the current branch.
If a queue must temporarily continue on an older branch, record an explicit
`queue_policy.branch_identity_exception` with:

- `mode: temporary_continuation_branch`
- `approved: true`
- `allowed_operations` limited to the specific local operations being allowed
- `reason` explaining why the exception is temporary

Queue maintenance can happen before strict branch validation exists, but the
maintenance operation should record the current branch and reason when it
touches a branch-governed queue from a different branch.

New branch-governed queues should opt into
`queue_policy.git_lifecycle_gate: strict`. In strict lifecycle mode, the queue
must record a plan-owned `queue_policy.branch_boundary` before selected work is
treated as ready. When the whole queue is marked `completed` or `done`, it must
also record PR/publication evidence such as `DRAFT_PR_OPERATION_EVIDENCE.yaml`,
or remain explicitly blocked/deferred before PR creation. This keeps the branch
and PR boundary visible to low-context Agents instead of relying on chat
memory.

## Pull Request Boundary

A pull request should normally represent one feat branch, not one atom task.
Use `changes/<plan_id>/PR_READY_SUMMARY.md` to prepare the branch for review
before any remote PR operation. The PR-ready summary should explain:

- the owning candidate queue
- completed selected changes and commit evidence
- deferred, blocked, superseded, or high-risk candidates
- validation commands and results
- unresolved risks or follow-up queues

Opening, editing, or merging PRs is not implied by either the planning contract
or `PR_READY_SUMMARY.md`. Those remote operations are governed by
`references/gh-operation-governance.md`.

## Issue Boundary

Issues sit before decomposition in the governance hierarchy:

```text
Issue -> CANDIDATE_CHANGES -> selected change -> commit -> branch -> PR
```

The arrow is not one-to-one. A single Issue can lead to multiple feat queues,
and a single feat queue can aggregate several related Issues.

When local issue artifacts are the source of truth, they are git-tracked
planning artifacts. When GitHub Issues are the source of truth, local OW
artifacts should record linkage such as issue URLs, plan ids, candidate ids,
commit hashes, branch names, and PR refs.

## Non-Destructive Git Policy

OW skills may inspect git state as part of planning, selection, and audit.
Examples include:

- current branch
- dirty working tree
- recent commit hashes
- tracked and untracked paths

Skills must not perform destructive git operations unless the user explicitly
requests that specific operation. Destructive or remote-impacting operations
include:

- reset, checkout, restore, clean, or rebase actions that discard work
- branch deletion
- forced push
- push to a remote branch
- PR creation, update, merge, or close
- GitHub Issue creation, body edit, closure, or destructive label changes

Local commits may be created when the user has authorized the dogfood workflow
that treats each selected change as a commit. Remote mutation requires separate
authorization and should be governed by a high-risk decision report until OW has
an approved gh operation model. See `references/gh-operation-governance.md` for
read-only, evidence-writing, and high-risk mutation tiers.

## Approved Local Automation Boundary

The M71 high-risk decision approved a narrowed local automation path. A future
`ow:git-automation` command may automate local git actions only inside these
boundaries:

- create or check out the local feat branch recorded in
  `queue_policy.branch_boundary`
- commit one completed selected change as at least one local commit
- generate a local `PR_READY_SUMMARY.md` for a fully implemented and validated
  candidate queue

Every local mutation mode must support preview or dry-run output before it
changes the repository. The preview should show:

- target plan id and candidate id when applicable
- current branch and expected branch boundary
- dirty paths that would be included or rejected
- exact commit message or summary path when applicable
- validation evidence required before mutation

The command must refuse local mutation when:

- the working tree contains unrelated dirty paths
- the current branch conflicts with the queue's branch boundary
- the queue branch boundary names another plan id and no explicit temporary
  continuation exception allows the local operation
- the selected change is not complete
- required validation evidence is missing
- the operation would require push, remote PR creation, Issue mutation, or merge

Selected changes must not finish without a local commit. A selected change may
produce multiple local commits when traceability requires a follow-up evidence
commit. Do not amend solely to force a commit to contain its own hash. Treat the
latest local HEAD produced for the selected change as the relationship anchor,
and record the primary implementation commit hash when a follow-up evidence
commit is used.

The preferred local completion path is:

```text
openworkflow git-automation commit --root . --queue changes/<plan_id>/CANDIDATE_CHANGES.yaml --candidate <id> --message "<plan-id> <candidate-id> ..." --validation-evidence "<commands>" --commit-evidence --json
```

When `--commit-evidence` is used, the selected change should record
`LOCAL_COMMIT_EVIDENCE.yaml` under its own selected-change folder and the queue
completion should reference that repo-relative path. A checkpoint commit that
batches multiple completed selected changes is not valid per-candidate evidence.

Remote operations are outside the approved local boundary. Push, remote PR
creation or update, Issue mutation, and merge require explicit operation-level
approval and must follow `references/gh-operation-governance.md`.

## Merge Readiness And Conflict Checkpoints

Remote readiness may compute a structured merge checkpoint with read-only git
commands such as `git merge-base`, `git merge-base --is-ancestor`, and
`git merge-tree --write-tree`. This checkpoint may report target base, target
branch, merge base, fast-forward state, conflict files, required validations,
and stop reasons.

The checkpoint is not permission to merge and must not run `git merge`, modify
the user's working tree, auto-resolve conflicts, rebase, reset, force-push, or
mark a PR ready. If conflicts are reported, future work must use an isolated
worktree, explicit operation-level user approval, conflict-resolution evidence,
validation reruns, and local audit evidence before any later approved merge.

## Evidence

When a selected change completes, the owning queue should record enough
evidence to audit the work later:

- selected change id
- completion timestamp
- changed paths or artifact paths
- validation commands
- commit hash when available

New strict branch-governed queues should also record whether implementation
files changed:

- `implementation_changed_files: true` requires repo-relative
  `LOCAL_COMMIT_EVIDENCE.yaml` in completion evidence.
- `implementation_changed_files: false` requires `commit_not_required_reason`.

Older queues may not contain all fields. They remain migration-mode artifacts
until touched or intentionally opted into
`queue_policy.selected_change_commit_gate: strict`.
