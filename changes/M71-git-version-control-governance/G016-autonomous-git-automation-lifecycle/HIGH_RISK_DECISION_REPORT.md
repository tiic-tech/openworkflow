# High-Risk Decision Report - G016 Autonomous Git Automation Lifecycle

## Trigger

Execution reached `G016`, the next recommended candidate in
`changes/M71-git-version-control-governance/CANDIDATE_CHANGES.yaml`. The
candidate is explicitly marked `risk: high`.

G015 completed the managed git automation shell. Managed mode can automate local
branch, local commit, and local PR-ready summary work, while remote push, PR,
Issue, and merge operations remain approval-gated and produce operation plans
instead of executing.

G016 asks whether OW should define the fully autonomous mode that can perform
remote git and GitHub lifecycle operations without per-step user approval after
the user explicitly enables that mode.

## Change

Candidate: `G016`

Title: Define autonomous git automation lifecycle

Status: `ready`

This is high risk because autonomous mode would eventually allow an agent to run
remote-impacting operations without stopping for user approval at each step:

- push local branches
- create or update pull requests
- interpret merge readiness
- resolve or guide conflict handling
- merge pull requests
- record remote evidence and rollback guidance
- potentially coordinate hundreds or thousands of local commits

This report is evidence, not approval. Implementation may resume only after the
user approves one concrete option below.

## Concrete Risks

- Autonomous push could publish incomplete, private, stale, or incorrectly
  scoped local work.
- Autonomous PR creation or update could expose misleading summaries, missing
  validation, or incomplete candidate status.
- Autonomous merge could bypass human review, repository protection intent, or
  unresolved product decisions.
- Large local histories could be pushed or merged in the wrong order if the
  base ref, branch boundary, or commit evidence is misread.
- Conflict resolution could silently prefer the wrong side and corrupt
  behavior even when tests pass.
- Remote branch state could drift between planning and execution, creating race
  conditions or non-fast-forward failures.
- GitHub Issue mutation could damage an external source of truth or close work
  before local audit evidence is complete.
- Rollback may be impossible or expensive after merge, especially on protected
  branches or shared release branches.
- A broad autonomous implementation could normalize dangerous operations such
  as force-push, reset, rebase, or branch deletion.
- Poor evidence could make it impossible to explain which local commit,
  candidate, validation run, PR, and merge commit caused a later regression.

## Decision Options

### Option A - Keep Managed Mode Only

Do not design autonomous mode yet. Keep OW in managed mode: local automation is
available, remote operations produce ordered operation plans, and the user must
approve push, PR, Issue mutation, and merge operations.

Impact: safest. Preserves G015 behavior and avoids new remote mutation risk.

### Option B - Design-Only Autonomous Contract

Define the autonomous mode contract, configuration, operation matrix, evidence
requirements, rollback rules, merge-readiness gates, and refusal criteria. Do
not implement autonomous remote mutation.

Impact: recommended. It lets OW reason about autonomous lifecycle safety before
any command can perform remote work without approval.

### Option C - Read-Only Autonomous Simulator

Implement or plan a simulator that reads local git state and remote metadata,
then produces the exact push, PR, conflict, and merge plan that autonomous mode
would execute. No remote mutation is performed.

Impact: useful for proving evidence and sequencing over large histories, with
limited blast radius.

### Option D - Narrow Autonomous Remote Pilot

Allow one exact autonomous remote operation class after configuration, such as
creating or updating a draft PR for a protected branch, but still prohibit
merge, force-push, Issue mutation, and destructive history operations.

Impact: moderate to high risk. Requires exact target repository, branch,
payload class, evidence contract, and rollback path before implementation.

### Option E - Full Autonomous Git Lifecycle

Allow autonomous push, PR creation or update, merge-readiness interpretation,
merge, Issue mutation, and evidence recording once `git-automation` is enabled.

Impact: highest risk. This should not proceed until Options B and C prove the
policy, simulator, evidence, and rollback model.

## Recommended Path

Choose **Option B - Design-Only Autonomous Contract**, then optionally follow
with Option C as a later candidate.

Reason: the user's target state is valid, but the safety model must be explicit
before implementation. Autonomous mode needs configuration, permission tiers,
remote state checks, ordered commit handling, conflict policy, validation gates,
and rollback evidence. Designing those contracts first prevents a broad command
implementation from becoming the policy by accident.

## Approved Decision

Approved on 2026-05-21: proceed with **Option B - Design-Only Autonomous
Contract**.

The approved work may define autonomous-mode contracts, configuration,
operation matrices, evidence, rollback, conflict handling, and merge-readiness
rules. It must not implement autonomous push, PR creation or update, merge,
Issue mutation, force-push, reset, rebase, or destructive branch deletion.

The next recommended follow-up after Option B is **Option C - Read-Only
Autonomous Simulator**.

## Required Autonomous Contract

If Option B is approved, the contract should define:

- `git_automation.mode: managed | autonomous`
- allowed autonomous operations by tier:
  - local branch and commit operations
  - push
  - draft PR create or update
  - ready PR create or update
  - merge
  - Issue mutation
- prohibited operations by default:
  - force-push
  - reset
  - rebase shared branches
  - destructive branch deletion
  - protected branch direct commit
- required repository constraints:
  - branch boundary
  - target base
  - clean working tree
  - no untracked unrelated files
  - fast-forward or conflict state understood
  - required validation commands passing
  - repository protection checks discoverable or explicitly waived
- required evidence:
  - operation id
  - plan id and candidate ids
  - local branch and target remote branch
  - base ref and ordered local commits
  - PR-ready summary path
  - validation evidence and timestamps
  - exact commands or API calls
  - before and after refs
  - remote URLs and PR ids
  - conflict-resolution notes
  - rollback or recovery path

## Guardrails

- Autonomous mode must be explicitly enabled by configuration, not inferred
  from conversation tone.
- Managed mode remains the default.
- Every autonomous run must produce preview evidence before mutation, even if
  it does not stop for user approval.
- Autonomous mode must refuse operation when the queue branch boundary does not
  match current branch.
- Autonomous mode must refuse operation when validation evidence is missing,
  stale, or failing.
- Autonomous mode must refuse operation when remote state has changed since the
  operation plan was built.
- Autonomous mode must refuse operation when conflicts cannot be resolved by an
  explicit policy.
- Merge requires repository protection checks or an explicit documented waiver.
- Issue mutation remains disabled unless a separate Issue governance policy
  grants a specific operation class.
- Destructive history operations remain out of scope unless a separate
  high-risk report approves exact commands and recovery steps.

## Go Criteria

Implementation may resume only when the user explicitly approves one concrete
option:

- `Approve G016 Option A`
- `Approve G016 Option B`
- `Approve G016 Option C`
- `Approve G016 Option D` with exact operation class, repository, branch, and
  rollback requirements
- `Approve G016 Option E` with exact remote operation matrix and safety
  requirements

Ambiguous instructions such as "continue", "go ahead", or "do it" are not
enough for autonomous git or GitHub mutation work.

## Stop Criteria

Stop again if:

- the work moves from design-only into remote mutation without explicit
  approval
- a proposed change would run `git push`, `gh pr create`, `gh pr merge`, or
  any `gh issue` mutation
- autonomous mode can be enabled without an explicit local configuration
- evidence is optional for any git or GitHub mutation
- rollback or recovery guidance is missing
- conflict handling is underspecified
- repository protection checks are bypassed by default
- implementation requires rewriting history or force-pushing
- validation requires rewriting unrelated historical queues or generated
  surfaces outside the selected scope

## Validation Expectations

Any approved follow-up must run:

- `npm run validate`
- `git diff --check`

If it touches runtime verification, validators, generated surfaces, or command
behavior, it must also run:

- `npm run verify:runtime-surface`

If it touches planning skills, it must run the relevant skill validation.
