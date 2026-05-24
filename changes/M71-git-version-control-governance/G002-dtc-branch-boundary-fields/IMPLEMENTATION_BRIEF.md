# G002 - DTC Branch Boundary Fields

## Goal

Teach `decompose-to-changes` to record the owning feat branch when it creates a
new candidate queue.

## Read First

- `references/git-version-control-governance.md`
- `skills/decompose-to-changes/SKILL.md`
- `skills/decompose-to-changes/references/decomposition-protocol.md`

## Do

- Add branch boundary guidance to the DTC workflow.
- Add output checklist expectations for `queue_policy.branch_boundary`.
- Keep branch creation and switching outside the skill's own behavior.
- Record G002 completion evidence.

## Do Not

- Do not change `select-change`.
- Do not add runtime validation.
- Do not create or switch branches from inside the skill.

## Owned Paths

- `skills/decompose-to-changes/SKILL.md`
- `skills/decompose-to-changes/references/decomposition-protocol.md`
- `changes/M71-git-version-control-governance/G002-dtc-branch-boundary-fields/`

## Validation

- `python3 /Users/archy/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/decompose-to-changes`
- `npm run validate`
- `git diff --check`

## Stop Conditions

- Stop if branch governance would require automatic git mutations.
- Stop if existing queue maintenance would need candidate renumbering.
