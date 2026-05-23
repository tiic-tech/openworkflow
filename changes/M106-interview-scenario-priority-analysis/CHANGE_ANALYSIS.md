# M106 Interview Scenario Priority Analysis

Source of truth: `CHANGE_ANALYSIS.yaml`

## Queues And Sources

- `docs/M104_AGENT_CONSUMER_INTERVIEW.md`
- `changes/M105-m104-direct-trust-gate-fixes/SUMMARY.yaml`
- `changes/M105-m104-direct-trust-gate-fixes/CANDIDATE_CHANGES.yaml`

Git state: clean on `codex/m101-build-proto-prompt-command-split`.

## Recommendation

Create `M106-agent-resume-cockpit` and start with C001.

Reason: `resume --json` has the highest immediate Agent-consumer value after
M105. It is read-only, builds on the repaired trust gates, and directly solves
the cross-session recovery problem exposed by M104.

## Scenario Ranking

1. Agent resume cockpit / `resume --json`: recommended for M106.
2. Automatic commit evidence closure: completed in M105 C003.
3. Artifact lineage graph: defer to M107.
4. Prompt2Proto strategy engine: defer to M108.
5. Boundary preflight compiler: defer to M110 after resume clarifies the current work packet.

## Rejected Alternatives

- M107 lineage graph: valuable but broader than the immediate recovery read model.
- M108 prompt2proto strategy: valuable but should be backed by lineage and provider capability metadata.
- M110 boundary preflight compiler: useful, but M105 C004 already improved commit-time diagnostics.

## Handoff

Use `/ow:decompose-to-changes` to create `changes/M106-agent-resume-cockpit/`
with C001 as the first ready candidate.
