# Git Automation Governance

## Purpose

OpenWorkflow git automation has two policy modes:

- `managed`: OW may automate local branch, local commit, and local PR-ready
  summary actions while asking for approval at remote-impacting boundaries.
- `autonomous`: OW may eventually run the full git lifecycle without stepwise
  approval, but only after a separate high-risk candidate defines exact
  operations, evidence, rollback, and safety limits.

G015 implements the managed command shell. It does not implement autonomous
push, PR creation, PR merge, or GitHub Issue mutation.

## Managed Mode

Managed mode can:

- create or check out the local feat branch recorded in
  `queue_policy.branch_boundary`
- create local selected-change commits when validation evidence exists
- create local follow-up evidence commits
- generate local `PR_READY_SUMMARY.md`
- recommend when remote PR or merge review is appropriate

Managed mode must gate:

- `git push`
- `gh pr create`, `gh pr edit`, and `gh pr merge`
- `gh issue create`, `gh issue edit`, and `gh issue close`
- destructive operations such as reset, rebase, force-push, or branch deletion

When a user approves a remote operation, the agent must be able to reconstruct
the correct operation sequence from local evidence even when a branch contains
hundreds or thousands of local commits. Managed mode should prepare a remote
operation plan before execution:

1. confirm clean working tree and current validation evidence
2. identify the feat branch and target base
3. list ordered local commits from the approved base to HEAD, or fall back to
   commit evidence recorded in `CANDIDATE_CHANGES.yaml`
4. push the feat branch to the approved remote branch
5. create or update the PR using the local `PR_READY_SUMMARY.md`
6. wait for checks and resolve conflicts against the target base
7. merge only after user approval and repository protection checks pass
8. record remote URL, PR id, merge commit, and rollback guidance

## Autonomous Mode

Autonomous mode is a future high-risk capability. Before implementation, OW
must define:

- explicit configuration that enables autonomous mode
- exact allowed git and gh operations
- evidence required before and after every operation
- rollback or recovery guidance for each mutation class
- repository protection checks and branch constraints
- refusal behavior for unclean state, unknown remote state, and failed
  validation

## Evidence

Every git operation should record enough evidence to reconstruct what happened:

- operation id or command invocation
- plan id and candidate id when applicable
- current branch and branch boundary
- dirty paths included or rejected
- command preview
- validation evidence
- before and after commit or ref state when applicable
- ordered local commits for remote push, PR, and merge planning
- output artifact path when generated
- refusal reason when blocked

Remote operations require separate operation-level approval until autonomous
mode is explicitly designed and accepted.
