# M138 Orchestrator SC Dispatch Protocol

Status: complete.

## Completed

- Added `references/orchestrator-selected-change-dispatch.md` as the protocol
  source of truth.
- Linked the protocol from planning artifact contracts, git governance, coder
  governance, decomposition, selection, and Team references.
- Preserved current OW hierarchy:
  - CC is the Orchestrator-owned queue and branch boundary.
  - SC is the subagent authority boundary.
  - Orchestrator owns final review, validation, evidence, commits, remote gates,
    and CC completion.
  - Subagents only receive selected-change scoped authority.

## Out Of Scope

- No new CLI command.
- No new generated adapter surface.
- No runtime scheduler.
- No schema or validator enforcement.
- No remote mutation automation.
