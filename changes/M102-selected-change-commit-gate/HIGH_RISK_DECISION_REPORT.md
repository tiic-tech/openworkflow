# M102 High-Risk Decision Report

## Trigger

OpenWorkflow currently says selected changes that implement file changes must
complete with at least one local commit, but the rule is not enforced by queue
completion, strict summaries, handoff, or validate.

M101 exposed the failure mode: C001-C004 were completed in a single checkpoint
commit instead of one local commit per completed selected change.

## Change

Candidate: C001

Title: Decide selected-change commit enforcement policy and migration guardrails

Status: completed

C001 is high risk because it changes trust-gate semantics for planning queues.
It must remain design-only and must not edit implementation source, generated
adapters, or managed `.agents/**` / `.openworkflow/**` surfaces.

## Concrete Risks

- Strict gates may begin failing historical queues that have no
  `LOCAL_COMMIT_EVIDENCE.yaml`.
- A weak warning-only gate would leave selected-change auditability dependent on
  agent discipline.
- An overly broad validator could block planning-only selected changes that
  correctly changed no implementation files.
- A validator that cannot distinguish active/new queues from historical queues
  could make handoff unusable during migration.

## Decision Options

### Option 1: Strict Evidence Gate With Migration Mode

Require completed selected changes with implementation file edits to have
either:

- `LOCAL_COMMIT_EVIDENCE.yaml` with at least one local commit hash, or
- explicit `implementation_changed_files: false` and
  `commit_not_required_reason`.

Apply hard failure in strict trust gates for active/new queues. Apply warning or
documented migration mode for historical queues until they are touched again.

Decision: selected.

### Option 2: Warning-Only Gate

Report missing commit evidence as warnings in summaries and handoff, but do not
fail strict trust gates.

Decision: rejected because it does not close the M101-style failure mode.

### Option 3: Git-Automation-Only Education

Improve generated skill text and examples but leave validation and handoff
unchanged.

Decision: rejected because it leaves current trust gates blind to missing
commit evidence.

## Recommended Path

Proceed with Option 1.

Implementation order:

1. Commit C001 as a standalone design-only selected change.
2. Implement C002 to add the evidence contract and queue audit validator.
3. Implement C003 to wire the evidence gate into validate, summaries --strict,
   and handoff.
4. Implement C004 to make git-automation commit evidence visible in the
   selected-change completion workflow.

Do not return to M101 implementation work until the selected-change commit
evidence gate exists.

## Guardrails

- Do not rewrite historical commits.
- Do not require remote push, PR creation, Issue mutation, or merge.
- Do not make planning-only selected changes require implementation commits.
- Do not mark an implementation selected change done unless commit evidence is
  present.
- Use `LOCAL_COMMIT_EVIDENCE.yaml` in the selected-change folder as the commit
  evidence source of truth.
- Treat the latest local HEAD produced for the selected change as the
  selected-change relationship anchor when follow-up evidence commits are used.

## Go Criteria

- Option 1 is recorded as the selected policy.
- Strict gate targets are validate, summaries --strict, and handoff.
- Migration mode is explicit for historical queues.
- Planning-only no-commit completion requires
  `implementation_changed_files: false` and `commit_not_required_reason`.

## Stop Criteria

- The implementation would require rewriting local git history.
- The implementation would require remote mutation.
- The gate cannot distinguish implementation candidates from planning-only
  candidates.
- The validator would block all existing historical queues without a migration
  path.
- The work would require implementation source edits during C001.

## Validation Expectations

C001 validation:

- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`

C002 through C004 validation must add runtime fixture coverage for a batched
commit regression like M101 C001-C004.

## Out Of Scope

- remote push
- PR creation or merge
- GitHub Issue mutation
- unrelated branch policy
- M101 prompt/prototype implementation
