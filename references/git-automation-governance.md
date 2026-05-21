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

G016 defines the contract for this mode. It does not make autonomous remote
mutation executable.

### Enablement Contract

Autonomous mode must be enabled by an explicit local configuration. It must not
be inferred from conversation wording or from the existence of a candidate
queue.

Minimum configuration shape:

```yaml
git_automation:
  mode: managed # managed | autonomous
  autonomous:
    enabled: false
    target_remote: origin
    target_base: main
    allowed_operations:
      local_branch: true
      local_commit: true
      push: false
      draft_pr: false
      ready_pr: false
      merge: false
      issue_mutation: false
    required_validation:
      - npm run validate
    evidence_dir: changes/<plan_id>/git-automation/
    conflict_policy: stop
    rollback_policy: record_recovery_plan
```

The only default-safe autonomous operations are local branch, local commit, and
local summary generation. Push, PR creation or update, merge, and Issue
mutation must each be explicitly allowed by configuration and supported by the
current operation contract.

### Operation Matrix

| Operation | Default | Required gate | Evidence |
| --- | --- | --- | --- |
| Local branch create or checkout | allowed | branch boundary and clean tree | before branch, after branch, command preview |
| Local selected-change commit | allowed | validation evidence and allowed paths | dirty paths, commit message, commit hash |
| Local PR-ready summary | allowed | queue exists | output path and validation summary |
| Push feat branch | denied | autonomous push enabled, clean tree, target remote and base known | before ref, after ref, ordered commits |
| Draft PR create or update | denied | push completed, PR summary exists | PR URL, payload digest, branch and base |
| Ready PR create or update | denied | validation current, blockers absent | PR URL, validation, review notes |
| Merge PR | denied | checks pass, protection satisfied or waiver recorded | merge method, merge commit, rollback path |
| Issue mutation | denied | separate Issue operation policy | target issue, payload digest, before and after state |
| Reset, rebase, force-push, destructive branch deletion | denied | separate high-risk report only | exact command and recovery plan |

### Autonomous Run Record

Every autonomous run must produce an operation record before and after mutation.
The preflight record must be written before any remote action and include:

- operation id
- requested mode and allowed operation set
- plan id, candidate ids, and source queue
- current branch, branch boundary, target remote, and target base
- local HEAD and target base ref
- ordered local commits from base to HEAD
- dirty paths and rejected paths
- validation commands and status
- PR-ready summary path and digest when relevant
- remote state snapshot when available
- planned commands or API calls
- refusal criteria evaluated

The completion record must include:

- commands or API calls that actually ran
- before and after refs
- pushed branch or remote ref
- PR URL and id when created or updated
- merge method and merge commit when merged
- conflict-resolution notes when conflicts were encountered
- rollback or recovery instructions
- validation status after operation
- final status: `completed`, `refused`, `failed`, or `needs_human`

### Merge Readiness

Autonomous merge is not allowed unless all configured gates pass:

- local validation is current
- remote checks are passing or explicitly waived
- PR branch is up to date with target base or the conflict policy has handled it
- PR-ready summary is current after the last local commit
- no candidate in the queue is blocked unless explicitly excluded from the PR
- high-risk reports are resolved or intentionally deferred
- repository protection is satisfied or the waiver is recorded

When any gate is unknown, autonomous mode must stop with status `needs_human`.

### Conflict Policy

The default conflict policy is `stop`. Autonomous conflict resolution can only
run when a later high-risk candidate defines exact file classes, resolution
rules, validation requirements, and rollback behavior.

Allowed conflict policies:

- `stop`: stop and emit conflict evidence.
- `manual_resolution_required`: prepare instructions and wait for human or
  agent-directed resolution.
- `policy_driven_resolution`: future high-risk mode only.

### Rollback And Recovery

Rollback guidance must be recorded before any remote mutation. The recovery path
depends on operation class:

- Push: name the previous remote ref and recovery command or PR-based revert
  strategy.
- PR create or update: record PR URL, previous body digest when available, and
  close or edit-back guidance.
- Merge: record merge commit, revert command or follow-up revert PR plan, and
  affected target branch.
- Issue mutation: record before state, after state, target issue URL, and edit
  recovery guidance.

Rollback must not rely on force-push by default.

### Implementation Path

The safe implementation path is:

1. Design-only autonomous contract.
2. Read-only autonomous simulator that produces full plans and evidence without
   remote mutation.
3. Narrow autonomous pilot for one remote operation class, such as draft PR
   creation.
4. Full autonomous lifecycle only after the simulator and pilot prove evidence,
   conflict, and rollback behavior.

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
