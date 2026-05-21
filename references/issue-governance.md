# Issue Governance

This reference defines how OpenWorkflow treats Issues in the dogfood development
model. It covers source-of-truth rules and audit linkage only. It does not
authorize `gh` commands or remote GitHub mutation.

## Issue Role

An Issue is an intent source. It can represent a bug, problem report, user
request, product idea, external task, or review finding.

An Issue is not automatically:

- a `CANDIDATE_CHANGES.yaml` queue
- a selected change
- a commit
- a branch
- a PR

One Issue can decompose into multiple candidate queues. One candidate queue can
reference multiple Issues. One selected change can address part of an Issue
without closing it.

## Source Of Truth Modes

Use one source-of-truth mode per Issue stream.

### Local Mode

Use local mode when the repo has no configured or authorized `gh` workflow, or
when the user explicitly wants a git-tracked local backlog.

Local issue artifacts may be tracked in git. Suggested locations are:

```text
issues/<issue-id>.yaml
issues/ISSUES.yaml
```

Local issue artifacts may own:

- title or problem statement
- status
- labels or classification
- source links
- affected queues
- acceptance or reproduction notes
- audit history

### GitHub Mode

Use GitHub mode when the user authorizes `gh` and the repository is configured
to use GitHub Issues as the issue source of truth.

In GitHub mode:

- the GitHub Issue body and comments are the remote source of truth
- OW local artifacts should not copy the remote Issue body as authoritative text
- local artifacts should store linkage, decomposition, and audit evidence
- remote mutation requires explicit gh operation governance

Local OW artifacts can still be tracked in git, but they should be linkage
records rather than duplicated Issues.

## Linkage Metadata

When an Issue is decomposed or addressed, OW artifacts should record stable
references that support audit without over-copying remote content.

Recommended fields:

- `issue_source`: `local` or `github`
- `issue_ref`: local id, GitHub issue number, or URL
- `source_title`: short title or snapshot label
- `source_captured_at`: date when the link was captured
- `plan_ids`: related `CANDIDATE_CHANGES` queues
- `candidate_ids`: related candidates
- `selected_change_ids`: related selected changes
- `commit_refs`: local commit hashes when available
- `branch_refs`: owning feat branches
- `pr_refs`: pull request URLs or numbers when available
- `status_note`: open, partially addressed, addressed, deferred, or superseded

For GitHub mode, `source_title` is a convenience snapshot. It is not the source
of truth when it differs from GitHub.

## Drift Prevention

Avoid maintaining two authoritative Issue bodies.

When GitHub is configured as the source of truth:

- prefer storing URLs, numbers, labels, and audit linkage locally
- summarize only the minimum context needed for planning
- do not rewrite local linkage just because a remote Issue body changes unless
  the linkage itself changed
- treat comments, labels, closures, and body edits as gh operations with their
  own risk tier

When local mode is used, local issue artifacts are normal repo artifacts and
should follow the same commit, branch, and PR governance as other OW planning
contracts.

## Relationship To Candidate Queues

`decompose-to-changes` may use Issues as planning input. The resulting
`CANDIDATE_CHANGES.yaml` should reference the Issue source in `source.refs` and
should keep the queue as the feat boundary.

`select-change` should not select an Issue directly. It should select a
candidate from a queue that may reference one or more Issues.

Cross-queue analysis may use Issue linkage as one signal, but it should report
the target `plan_id` and `candidate_id` rather than an Issue alone.
