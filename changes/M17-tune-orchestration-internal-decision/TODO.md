# M17 TODO

M17 adds `ow:tune` as the user-facing prototype iteration command and moves
`ow:decision` into internal audit behavior for normal discovery loops.

## Plan

1. [ ] Define `/ow:tune`, `/ow:tune:proto`, and `/ow:tune:<target>` semantics.
2. [ ] Update command registry so tune defaults to the current prototype.
3. [ ] Make decision internal/audit-only in normal proto/tune handoffs.
4. [ ] Require proto and tune to write decision audit records automatically.
5. [ ] Extend decision outcome with `revise`.
6. [ ] Generate `ow-tune` Codex skill with XML output isolation.
7. [ ] Update validators and runtime surface verification.
8. [ ] Run full validation and E2E smoke.

## Completion Checklist

- [ ] Users can iterate with `ow:tune` without manually invoking decision.
- [ ] Tune can create a prototype through proto behavior when no current prototype exists.
- [ ] Decision audit artifacts remain durable and validator-backed.
- [ ] `revise` is represented distinctly from `needs_more_evidence`.
- [ ] Generated skills keep inner thinking isolated from user output.
- [ ] Full validation passes.
