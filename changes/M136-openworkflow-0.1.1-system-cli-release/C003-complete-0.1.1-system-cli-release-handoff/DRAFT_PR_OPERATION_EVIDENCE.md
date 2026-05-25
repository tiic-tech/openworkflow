# M136 Draft PR Operation Evidence

Date: 2026-05-25

## Operation

The M136 release evidence branch was pushed and a draft PR was opened after local validation passed.

## Remote

- Remote: `origin`
- Repository: `tiic-tech/openworkflow`
- Base: `main`
- Head: `codex/m136-openworkflow-0.1.1-system-cli-release`
- PR: #11
- URL: https://github.com/tiic-tech/openworkflow/pull/11
- State: open
- Draft: true
- Head OID at creation: `ba69fee3dc69a88cf45b0b5ed27c1416647f8426`

## Commands

- `git push -u origin codex/m136-openworkflow-0.1.1-system-cli-release`
- `gh pr create --repo tiic-tech/openworkflow --base main --head codex/m136-openworkflow-0.1.1-system-cli-release --draft --title "M136 OpenWorkflow 0.1.1 system CLI release" --body-file changes/M136-openworkflow-0.1.1-system-cli-release/PR_READY_SUMMARY.md`
- `gh pr view 11 --repo tiic-tech/openworkflow --json number,state,isDraft,url,headRefName,baseRefName,headRefOid,title`

## Boundaries

No merge, ready-for-review mutation, Issue mutation, rebase, reset, force-push, destructive branch
operation, or npm publish was performed in this PR operation.
