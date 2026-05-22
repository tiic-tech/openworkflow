# M102 Selected-Change Commit Gate

Source of truth: `CANDIDATE_CHANGES.yaml`

Status: active

Branch boundary: `codex/m102-selected-change-commit-gate`

Next recommended candidate: `C001`

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
| C001 | ready | high | Decide selected-change commit enforcement policy and migration guardrails | none |
| C002 | candidate | high | Add selected-change commit evidence contract and queue audit validator | C001 |
| C003 | candidate | high | Wire commit evidence enforcement into handoff and summaries strict trust gates | C001, C002 |
| C004 | candidate | medium | Integrate git-automation commit evidence into selected-change completion workflow | C001, C002, C003 |

## High-Risk Stop

The next actionable work is high risk because it changes trust gates. See:

- `HIGH_RISK_DECISION_REPORT.md`

## Recommended Path

1. Select C001 through `/ow:select-change`.
2. Keep C001 design-only and approve the exact enforcement policy.
3. Implement C002 and C003 before returning to M101 C006.
4. Finish each selected candidate through a per-candidate local commit.

## Out Of Scope

- remote git push
- PR creation or merge
- GitHub Issue mutation
- rewriting historical commits
- M101 prompt/prototype behavior
