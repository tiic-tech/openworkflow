# G003 - Select-Change Branch And Dirty-Tree Guards

## Goal

Teach `select-change` to check branch boundary and dirty-tree state before
creating selected-change artifacts.

## Read First

- `references/git-version-control-governance.md`
- `skills/select-change/SKILL.md`
- `skills/select-change/references/selection-protocol.md`

## Do

- Add current branch and queue branch-boundary checks.
- Add dirty-tree contamination handling.
- Preserve read-only behavior for git state checks.
- Record G003 completion evidence.

## Do Not

- Do not create commits automatically.
- Do not switch branches.
- Do not implement validation code.
- Do not edit `decompose-to-changes`.

## Owned Paths

- `skills/select-change/SKILL.md`
- `skills/select-change/references/selection-protocol.md`
- `changes/M71-git-version-control-governance/G003-select-branch-dirty-guards/`

## Validation

- `python3 /Users/archy/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/select-change`
- `npm run validate`
- `git diff --check`

## Stop Conditions

- Stop if branch mismatch would require an automatic checkout.
- Stop if dirty tree appears to contain unrelated uncommitted implementation work.
