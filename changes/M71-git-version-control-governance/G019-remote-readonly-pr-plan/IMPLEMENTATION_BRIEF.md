# G019 Implementation Brief

G019 implements the approved B step from G018.

The new `remote-plan` action is read-only. It can inspect the target remote,
remote branch, target base, ordered local commits, queue commit evidence,
validation evidence, `PR_READY_SUMMARY.md`, and optional `gh pr list` metadata.

It must never call `git push`, `gh pr create`, `gh pr edit`, `gh pr merge`,
`gh issue *`, reset, rebase, force-push, or destructive branch deletion.

The next candidate is G020, which may pilot draft PR creation/update only after
G019 evidence is reviewed.
