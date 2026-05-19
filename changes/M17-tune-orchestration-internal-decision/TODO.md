# M17 TODO

M17 adds `ow:tune` as the user-facing prototype iteration command and moves
`ow:decision` into internal audit behavior for normal discovery loops.

## Plan

1. [x] Define `/ow:tune`, `/ow:tune:proto`, and `/ow:tune:<target>` semantics.
2. [x] Update command registry so tune defaults to the current prototype.
3. [x] Make decision internal/audit-only in normal proto/tune handoffs.
4. [x] Require proto and tune to write decision audit records automatically.
5. [x] Extend decision outcome with `revise`.
6. [x] Generate `ow-tune` Codex skill with XML output isolation.
7. [x] Update validators and runtime surface verification.
8. [x] Run full validation and E2E smoke.

## Completion Checklist

- [x] Users can iterate with `ow:tune` without manually invoking decision.
- [x] Tune can create a prototype through proto behavior when no current prototype exists.
- [x] Decision audit artifacts remain durable and validator-backed.
- [x] `revise` is represented distinctly from `needs_more_evidence`.
- [x] Generated skills keep inner thinking isolated from user output.
- [x] Full validation passes.
