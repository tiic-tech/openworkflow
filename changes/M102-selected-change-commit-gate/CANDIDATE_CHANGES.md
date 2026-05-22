# M102 Selected-Change Commit Gate

Source of truth: `CANDIDATE_CHANGES.yaml`

Status: active

Branch boundary: `codex/m102-selected-change-commit-gate`

Next recommended candidate: `C002`

Selected change: `M102-C001-selected-change-commit-enforcement-policy`

## Scope

Fix the major governance bug where a selected change can be marked done after
implementation file edits without a per-candidate local commit or
`LOCAL_COMMIT_EVIDENCE.yaml`.

The queue is limited to local selected-change commit enforcement. Remote push,
PR creation, merge, and GitHub Issue mutation remain out of scope.

## Why This Is Critical

Current guidance already says selected changes with implementation changes must
finish with at least one local commit. The enforcement only exists inside the
explicit `git-automation commit` command path. It is not a global queue
completion, summary, validate, or handoff gate.

M101 exposed the gap when C001-C004 were completed inside one checkpoint commit
instead of one selected-change commit per completed candidate.

## Candidates

| ID | Status | Risk | Title | Dependencies |
| --- | --- | --- | --- | --- |
| C001 | done | high | Decide selected-change commit enforcement policy and migration guardrails | none |
| C002 | candidate | high | Add selected-change commit evidence contract and queue audit validator | C001 |
| C003 | candidate | high | Wire commit evidence enforcement into handoff and summaries strict trust gates | C001, C002 |
| C004 | candidate | medium | Integrate git-automation commit evidence into selected-change completion workflow | C001, C002, C003 |

## C001 Selection

C001 is completed as a design-only policy change. The approved enforcement
option is:

`Option 1: Strict Evidence Gate With Migration Mode`

C001 updated only queue artifacts, selection artifacts, implementation brief
artifacts, and the high-risk decision report. It did not edit implementation
source, generated adapters, or managed `.agents/**` / `.openworkflow/**`
surfaces. It must receive standalone local commit evidence before C002 begins.

Strict enforcement targets for follow-up implementation:

- `validate`
- `summaries --strict`
- `handoff`

Migration behavior:

- active and new branch-governed queues fail strict gates when completed
  implementation selected changes lack required commit evidence
- historical queues may warn until touched, selected again, or explicitly
  opted into the new contract
- planning-only selected changes may complete without an implementation commit
  only with `implementation_changed_files: false` and
  `commit_not_required_reason`

## High-Risk Decision

The next actionable work is high risk because it changes trust gates. See:

- `HIGH_RISK_DECISION_REPORT.md`

## Recommended Path

1. Commit C001 as its own local selected-change commit.
2. Implement C002.
3. Implement C003.
4. Implement C004.
5. Return to M101 only after the selected-change commit evidence gate exists.

## Out Of Scope

- remote git push
- PR creation or merge
- GitHub Issue mutation
- rewriting historical commits
- M101 prompt/prototype behavior
