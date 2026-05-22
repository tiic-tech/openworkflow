# M102 High-Risk Decision Report

## Decision Context

OpenWorkflow currently says selected changes that implement file changes must
complete with at least one local commit. The rule exists in git governance and
the git-automation skill, but it is not enforced by queue completion, strict
summaries, handoff, or validate.

M101 exposed the failure mode: C001-C004 were completed in a single checkpoint
commit instead of one local commit per completed selected change.

## Risk

This is high risk because fixing it changes the trust model for planning queues
and can make previously trusted handoff output fail.

Affected surfaces:

- candidate queue lifecycle
- selected-change completion evidence
- strict summary quality
- handoff trust
- runtime-surface verification
- git automation guidance

## Options

### Option 1: Strict Evidence Gate With Migration Mode

Require completed selected changes with implementation file edits to have either:

- `LOCAL_COMMIT_EVIDENCE.yaml` with a local commit hash, or
- explicit `implementation_changed_files: false` and
  `commit_not_required_reason`.

Apply hard failure in strict trust gates for active/new queues. Apply warning or
documented migration mode for historical queues until they are touched again.

Recommendation: choose this option.

### Option 2: Warning-Only Gate

Report missing commit evidence as warnings in summaries and handoff, but do not
fail strict trust gates.

This is safer for historical queues but does not close the bug. Agents can
still continue with unauditable completed candidates.

### Option 3: Git-Automation-Only Education

Improve generated skill text and examples but leave validation and handoff
unchanged.

This preserves compatibility but leaves the current failure mode intact.

## Recommended Decision

Approve Option 1.

Implementation guardrails:

- C001 is design-only.
- Do not rewrite historical commits.
- Do not require remote push or PR creation.
- Do not make planning-only selected changes require implementation commits.
- Do not mark a candidate done from implementation work unless the commit
  evidence requirement is satisfied or explicitly waived for no-file-change work.

## Go Criteria

- The selected-change evidence rule is explicit.
- Historical queue migration behavior is explicit.
- The strict gate target is explicit.
- Runtime fixtures cover a batched-commit regression like M101 C001-C004.

## Stop Criteria

- The implementation would require rewriting local git history.
- The implementation would require remote mutation.
- The gate cannot distinguish implementation candidates from planning-only
  candidates.
- The proposed validator would block all existing historical queues without a
  migration path.

## Out Of Scope

- remote push
- PR creation or merge
- GitHub Issue mutation
- unrelated branch policy
- M101 prompt/prototype implementation
