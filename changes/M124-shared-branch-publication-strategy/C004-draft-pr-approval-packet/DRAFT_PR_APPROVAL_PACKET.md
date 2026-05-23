# M124 C004 Draft PR Approval Packet

Captured at: `2026-05-23T22:43:17+08:00`

## Scope

This packet prepares C004 for approval. It does not create a PR, edit a PR,
mark a PR ready for review, merge, mutate Issues, push, or perform branch
surgery.

## Current Remote State

- Remote branch: `refs/heads/codex/m101-build-proto-prompt-command-split`
- Remote head: `f8bf087211316506f48155859f3e18edbc7224e4`
- Existing PRs for head `codex/m101-build-proto-prompt-command-split`: `[]`
- Draft PR body path:
  `changes/M124-shared-branch-publication-strategy/C004-draft-pr-approval-packet/PR_BODY.md`

## Proposed Draft PR

- Repository: `tiic-tech/openworkflow`
- Head: `codex/m101-build-proto-prompt-command-split`
- Base: `main`
- Draft: yes
- Title: `M101 shared stack: M105/M106/M115 governance updates`

## Exact Approval Command

Approve only this command if you want C004 to create the draft PR:

```bash
gh pr create --repo tiic-tech/openworkflow --head codex/m101-build-proto-prompt-command-split --base main --draft --title "M101 shared stack: M105/M106/M115 governance updates" --body-file changes/M124-shared-branch-publication-strategy/C004-draft-pr-approval-packet/PR_BODY.md
```

Suggested approval text:

`Approve M124 C004 draft PR: run gh pr create --repo tiic-tech/openworkflow --head codex/m101-build-proto-prompt-command-split --base main --draft --title "M101 shared stack: M105/M106/M115 governance updates" --body-file changes/M124-shared-branch-publication-strategy/C004-draft-pr-approval-packet/PR_BODY.md`

## Guardrails

- Create one draft PR only.
- Do not mark it ready for review.
- Do not edit the PR after creation unless separately approved.
- Do not close or merge the PR.
- Do not mutate Issues.
- Do not push again.
- Do not cherry-pick, rebase, reset, force-push, delete branches, move branch
  pointers, or split history.

## Post-Approval Evidence To Record

If the exact command is approved and succeeds, record:

- PR URL and number
- PR state and draft status
- Head and base refs
- Head and base OIDs
- Mergeability and check status when available
- Confirmation that no ready-for-review, merge, Issue, or branch-surgery
  operation occurred
