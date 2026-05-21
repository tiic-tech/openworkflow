# Analysis Protocol

Use this protocol to produce `CHANGE_ANALYSIS.yaml` and `CHANGE_ANALYSIS.md`.

## Inputs

Accepted inputs:

- explicit `CANDIDATE_CHANGES.yaml` paths
- a `changes/<plan_id>/` folder
- a request to analyze all obvious queues under `changes/`
- Issue references only when they are already linked from candidate queues or
  supplied by the user

Do not load generated runtime surfaces or unrelated source code unless a queue's
candidate explicitly needs that context for readiness analysis.

## Candidate Evaluation

For each candidate considered, capture:

- `plan_id`
- `candidate_id`
- `status`
- `risk`
- dependencies and whether they are satisfied
- branch boundary and whether it matches the current branch
- dirty-tree conflict risk
- owned paths
- validation commands
- downstream unlocks
- Issue refs when present
- high-risk report status when risk is high

## Priority Signals

Use these signals in order:

1. User-explicit target or most recent instruction.
2. Candidate readiness and dependency satisfaction.
3. Queue `next_recommended_candidate_id`.
4. Risk gate: high-risk candidates require report and explicit approval.
5. Unlock value for downstream candidates.
6. Branch and dirty-tree fit.
7. Validation realism.
8. Issue or PR urgency when documented in the queue.

Do not hide tradeoffs. Name rejected alternatives and why they were not chosen.

## YAML Shape

`CHANGE_ANALYSIS.yaml` should include:

```yaml
schema_version: 0.1.0
contract_id: change_analysis:<analysis-id>
contract_type: planning
planning_artifact_type: change_analysis
analysis_id: <analysis-id>
status: complete
source:
  queues:
    - changes/<plan_id>/CANDIDATE_CHANGES.yaml
git_state:
  branch: <branch-name>
  dirty: false
recommendation:
  target_plan_id: <plan-id>
  target_candidate_id: <candidate-id>
  action: handoff_to_select_change
  reason: <short reason>
rejected_alternatives:
  - plan_id: <plan-id>
    candidate_id: <candidate-id>
    reason: <short reason>
high_risk_stop:
  required: false
validation:
  commands_run:
    - git status --short --branch
```

If no candidate should be selected yet, set `recommendation.action` to
`queue_maintenance`, `high_risk_report`, or `commit_current_work` and explain
the blocker.

## Markdown Shape

`CHANGE_ANALYSIS.md` should include:

- source-of-truth notice
- queues analyzed
- git state
- recommended target
- rejected alternatives
- blockers or high-risk stop conditions
- exact handoff instruction for `select-change`

## High-Risk Handling

If the top candidate is high risk:

- do not recommend selection
- name the high-risk candidate and report path
- state whether the report exists
- recommend creating or updating `HIGH_RISK_DECISION_REPORT.md` if missing
- state the resume condition as explicit user approval of a concrete option
