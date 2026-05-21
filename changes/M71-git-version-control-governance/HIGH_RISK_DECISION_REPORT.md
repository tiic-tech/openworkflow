# High-Risk Decision Report - M71 Git And Gh Mutation Automation

## Trigger

Execution reached `G007`, the next recommended candidate in
`changes/M71-git-version-control-governance/CANDIDATE_CHANGES.yaml`. The
candidate is explicitly marked `risk: high`, and the queue now has the
prerequisite contracts for git governance, Issue governance, PR-ready summaries,
and gh operation tiers.

## Change

Candidate: `G007`

Title: Decide whether OW should automate git and gh mutation operations

Status: `ready`

This is high risk because it concerns moving from planning guidance into actions
that can mutate local git state or authenticated remote GitHub state: branch
creation, commits, pushes, Issue edits, Issue closure, PR creation, PR updates,
and PR merge operations.

This report is evidence, not approval. Implementation may resume only after the
user gives explicit approval for one concrete option below.

## Concrete Risks

- Local git automation could create commits with the wrong scope, mix multiple
  selected changes, or record misleading audit evidence.
- Branch automation could switch context unexpectedly and cause subsequent
  changes to land on the wrong feat branch.
- Push or force-push automation could publish incomplete, private, or mistaken
  work.
- Issue body edits or closure could damage the remote source of truth when
  GitHub Issues are configured as authoritative.
- PR creation or body edits could expose draft work, stale validation evidence,
  or incorrect candidate status.
- Remote comments or labels could become a second audit system that drifts from
  OW local artifacts.
- Merge automation could bypass human review and collapse the PR boundary.
- A broad implementation could blur the difference between read-only analysis,
  evidence-writing operations, and high-risk mutation.

## Decision Options

### Option A - Defer All Automation

Keep OW limited to local planning artifacts, local commits explicitly performed
by the agent under the current dogfood workflow, and read-only git inspection.

Impact: safest. No new git or gh mutation surfaces are implemented.

### Option B - Design-Only Governance

Do not implement automation. Add more contracts, examples, or validation rules
that clarify future approval models for branch creation, local commits, push,
Issue mutation, PR creation, and merge.

Impact: improves audit quality while preserving current safety boundary.

### Option C - Narrow Read-Only Spike

Allow a future candidate to inspect git or gh state only, such as branch
status, open PRs, or Issue metadata, and write local analysis artifacts. No
remote mutation, local branch switching, commit creation, push, PR creation, or
Issue edit.

Impact: useful for decision support with limited blast radius.

### Option D - Explicit Evidence-Writing Spike

Allow one narrow evidence-writing gh operation, such as adding a decomposition
comment to a specific Issue or updating a draft PR body, only after the user
approves the exact remote target and message.

Impact: moderate risk. Requires strong local audit records and a dry-run or
preview step before mutation.

### Option E - Full Automation

Implement automated branch creation, local commit, push, Issue updates, PR
creation, or merge behavior.

Impact: highest risk. This should not proceed until OW has a mature permission,
preview, rollback, and audit model.

## Recommended Path

Choose Option B now.

Reason: M71 has already established the local governance model and gh operation
tiers. The next best step is to keep mutation automation out of scope while
hardening the approval model, dry-run expectations, and local audit artifacts.
This preserves OW as an audit-first dogfood system and avoids prematurely
granting it remote mutation authority.

After Option B, a later queue can consider Option C for read-only gh inspection.
Evidence-writing or mutation should remain separate high-risk candidates.

## Guardrails

- No automatic branch switching.
- No automatic push.
- No force-push.
- No Issue creation, body edit, closure, or destructive label change.
- No PR creation, PR update, PR close, PR merge, or release operation.
- No mutation based only on inferred user intent.
- Every remote-impacting operation must have a previewable payload, explicit
  user approval, local audit evidence, and a target URL or identifier.
- `select-change` must not select a high-risk mutation candidate unless the
  approved option is named in the selection reason.
- Any approved follow-up must be narrower than G007 and should become a new
  candidate or replacement queue before implementation.

## Go Criteria

Implementation may resume only when the user explicitly approves one concrete
option:

- `Approve Option A`
- `Approve Option B`
- `Approve Option C`
- `Approve Option D` with an exact remote target and payload class
- `Approve Option E` with exact operations and guardrails

Ambiguous instructions such as "continue" or "go ahead" are not enough for git
or gh mutation automation.

## Stop Criteria

Stop again if:

- the implementation scope expands from design-only into mutation behavior
- a proposed change would run `gh` mutation commands
- a proposed change would push, force-push, create a PR, or merge a PR
- a proposed change would edit or close a GitHub Issue
- the working tree contains unrelated uncommitted work
- the current branch does not match `queue_policy.branch_boundary`
- validation requires rewriting historical queues or generated surfaces outside
  the selected scope

## Validation Expectations

Any approved follow-up must run:

- `npm run validate`
- `git diff --check`

If it touches runtime verification, validators, generated surfaces, or command
behavior, it must also run:

- `npm run verify:runtime-surface`

If it touches planning skills, it must run the relevant skill validation, such
as:

- `python3 /Users/archy/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/decompose-to-changes`
- `python3 /Users/archy/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/select-change`
- `python3 /Users/archy/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/analyze-changes`
