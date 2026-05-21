# G010 - Analyze Changes Skill

## Goal

Create a read-only planning skill that compares one or more candidate queues and
recommends the next `plan_id` and `candidate_id` for `select-change`.

## Read First

- `skills/analyze-changes/SKILL.md`
- `skills/analyze-changes/references/analysis-protocol.md`
- `references/planning-artifact-contracts.md`
- `changes/M71-git-version-control-governance/CANDIDATE_CHANGES.yaml`

## Do

- Define the skill workflow and boundaries.
- Define `CHANGE_ANALYSIS.yaml` and `CHANGE_ANALYSIS.md` output expectations.
- Keep the skill read-only and handoff-oriented.
- Validate the skill and repository.

## Do Not

- Do not create `SELECTED_CHANGE.yaml` as part of analyze-changes.
- Do not implement candidates.
- Do not mutate git or gh state.
- Do not replace decompose-to-changes or select-change.

## Owned Paths

- `skills/analyze-changes/SKILL.md`
- `skills/analyze-changes/references/analysis-protocol.md`
- `references/planning-artifact-contracts.md`
- `changes/M71-git-version-control-governance/G010-analyze-changes-skill/`

## Validation

- `python3 /Users/archy/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/analyze-changes`
- `npm run validate`
- `git diff --check`

## Stop Conditions

- Stop if the skill would need to select or implement a candidate.
- Stop if the top recommendation is high risk and lacks a decision report.
