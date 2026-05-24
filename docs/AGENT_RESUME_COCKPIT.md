# Agent Resume Cockpit

`openworkflow resume --root . --json` is the first command a fresh Agent should
run when a development session was interrupted and the human says to continue.
Typical interruption cases include network loss, context overflow, compaction
failure, app termination, or any handoff where the previous conversation cannot
be trusted as the current state.

## Success Standard

The human operator should not need to remember the branch, queue, selected
candidate, breakpoint, allowed paths, or validation commands. The resume packet
must be sufficient for a new Agent to understand:

- project overview and trust state
- active planning queue and current work item when available
- breakpoint since the last selected change, atom task, or commit evidence
- allowed actions, forbidden actions, and stop conditions
- owned paths and behavior boundaries
- validation and git-governance expectations
- missing or conflicting evidence
- the smallest correct OW-maintained next action

When those facts cannot be established, resume must report the unknowns and the
read-only check that should happen before implementation continues.

## Command Roles

Use `resume --json` for interrupted-session recovery. It is the precision
entrypoint for a fresh Agent that needs the current project state, queue-local
breakpoint, action boundary, evidence boundary, and next action in one packet.

Use `handoff --json` when the only question is whether the repo is trustworthy
enough to continue. Handoff is the strict trust gate; resume consumes that
signal but adds queue, work item, evidence, and git context.

Use `context --json` when a known `/ow:*` workflow command needs a bounded
startup packet. Add `--handoff` when the packet should fail on strict handoff
quality blockers.

Use `inspect --json` when the Agent needs the aggregated read model, health,
read order, and command readiness without the resume-specific queue breakpoint.

Use `status` or `brief` when a lightweight state summary is enough.

## Operating Model

Resume is not a generic autonomous retry loop. It should route the Agent back
to the least sufficient trusted context, then into corrected and ranked
atom-task continuation inside explicit boundaries. A resumed Agent should prefer
the queue's selected change, atom tasks, owned paths, validation commands,
commit-evidence expectations, and product-alignment signals over broad repo
rediscovery.

The packet is read-only. It must not update `CURRENT_STATE.yaml`, select a
candidate, mark atom tasks complete, refresh summaries, create commits, push to
remote, or mutate generated adapters.

Future project-local `SOUL.md` and `MEMORY.md` files are separate governed
learning artifacts. Resume may eventually surface trusted signals from them,
but it does not create or evolve persistent project personality or memory.
