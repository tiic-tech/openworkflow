# Gh Operation Governance

This reference classifies `gh` and GitHub operations for OpenWorkflow dogfood
work. It is a governance contract, not an implementation plan.

## Preconditions

Any gh-dependent workflow requires:

- explicit user authorization
- a configured `gh` CLI or GitHub connector
- a known repository remote
- clear source-of-truth mode for Issues and PRs
- local audit evidence for remote-impacting operations

If these preconditions are missing, OW should use local planning artifacts and
avoid remote mutation.

## Operation Tiers

### Read-Only

Read-only operations inspect remote state and do not mutate GitHub.

Examples:

- list or view issues
- list or view PRs
- inspect labels, milestones, assignees, or review state
- read CI/check status
- resolve issue or PR URLs for local linkage

Read-only operations may be used for analysis when the user has authorized gh
access or explicitly provided the remote data.

### Evidence-Writing

Evidence-writing operations add audit breadcrumbs but do not change the core
truth of an Issue or PR.

Examples:

- add a comment linking an Issue to a plan id or PR
- add a non-destructive label that marks decomposition state
- update a draft PR body with OW-generated summary text

These operations require explicit user approval for the specific action. The
local OW artifact remains the audit record and should capture the remote URL,
timestamp, operation kind, and summary of the mutation.

### High-Risk Mutation

High-risk mutations change remote state in ways that can affect collaboration,
delivery, or user trust.

Examples:

- create or close an Issue
- edit an Issue body
- close or reopen a PR
- create a PR
- push a branch
- merge a PR
- force-push
- remove labels, milestones, or assignments used by humans

These operations require a `HIGH_RISK_DECISION_REPORT.md` until OW has an
approved remote operation model. Approval must name the concrete action and
guardrails.

## Audit Requirements

For any evidence-writing or high-risk mutation, record locally:

- remote target URL or number
- operation type
- user approval source
- local plan id and candidate id
- branch name when relevant
- commit hash when relevant
- timestamp
- result or remote URL after mutation

Do not rely on remote comments alone as the OW audit record.

## Relationship To Issues And PRs

GitHub Issues may be the source of truth for issue bodies and comments when the
user configures GitHub mode. OW local artifacts should store linkage and audit
metadata, not duplicate issue bodies as authoritative text.

PR-ready summaries are local handoff artifacts. Opening or updating a remote PR
is a separate gh operation and must follow the tiers above.
