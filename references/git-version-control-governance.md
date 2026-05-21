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

Queue maintenance can happen before strict branch validation exists, but the
maintenance operation should record the current branch and reason when it
touches a branch-governed queue from a different branch.

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

## Evidence

When a selected change completes, the owning queue should record enough
evidence to audit the work later:

- selected change id
- completion timestamp
- changed paths or artifact paths
- validation commands
- commit hash when available

Older queues may not contain all fields. New branch-governed queues should move
toward explicit branch and commit evidence as validation support is added.
