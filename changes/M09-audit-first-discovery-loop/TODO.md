# M09 TODO

M09 must proceed in order. Do not deepen implementation commands before the
discovery loop audit structure is stable.

## Plan

1. Define the audit-first discovery loop reference.
2. Extend the command registry with protocol fields.
3. Generate `.openworkflow/audit/` files during init.
4. Deepen generated Codex commands for the discovery loop.
5. Update validator and project guide.
6. Run full verification.

## Task Decomposition

- `M09-T001`: Write the protocol reference and keep it scoped to discovery.
- `M09-T002`: Add structured protocol metadata to `WorkflowCommand`.
- `M09-T003`: Generate audit indexes and context packets into target repos.
- `M09-T004`: Render discovery commands from structured metadata.
- `M09-T005`: Make validation enforce the new architecture.
- `M09-T006`: Verify build, init, sync, doctor, CLI validate, and repo validate.

## Completion Checklist

- [x] Reference document exists.
- [x] Registry contains context packets for `/ow:vision`, `/ow:validation`,
      `/ow:prototype`, and `/ow:decision`.
- [x] Init creates `.openworkflow/audit/COMMAND_AUDIT_INDEX.yaml`.
- [x] Init creates `.openworkflow/audit/CONTEXT_PACKETS.yaml`.
- [x] Generated discovery commands include allowed and forbidden outputs.
- [x] Generated discovery commands include audit checkpoints.
- [x] Generated discovery commands explicitly prevent spec/change/team creation.
- [x] Full validation passes.
