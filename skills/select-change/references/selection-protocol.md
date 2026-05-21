# Selection Protocol

Use this reference when selecting one candidate from `CANDIDATE_CHANGES.yaml`
and preparing implementation artifacts.

## Selection Inputs

Required:

- `CANDIDATE_CHANGES.yaml`

Optional:

- `CANDIDATE_CHANGES.md` as a readable view
- upstream source artifacts named by the queue
- user constraints such as "choose C004" or "avoid runtime changes"

If the user names a candidate id, verify that its dependencies are satisfied
before selecting it. If the id is blocked or not ready, report why and stop
unless the user explicitly overrides the risk.

## Decision Order

1. Exclude `done`, `blocked`, `deferred`, and `superseded` candidates.
2. Prefer `ready` candidates over plain `candidate` entries.
3. Honor `next_recommended_candidate_id` when it is ready and coherent.
4. Prefer candidates that unlock other candidates.
5. Prefer focused owned paths over cross-module changes.
6. Prefer clear validation over unclear or manual-only acceptance.
7. Prefer lower-risk dogfood or source behavior before runtime exposure.

When two candidates are close, pick the one that produces better evidence for
the next planning decision.

## SELECTED_CHANGE.yaml

Include:

- source plan id and source candidate id
- concise selection reasons
- rejected alternatives when the choice is not obvious
- includes and excludes copied from the selected candidate
- owned paths copied from the selected candidate
- forbidden paths inferred from the candidate exclusions and repo rules
- acceptance and validation copied from the selected candidate

Do not copy the entire candidate queue into this artifact.

## ATOM_TASKS.yaml

Break the selected change into tasks in this order:

1. `read`: inspect existing context only when needed
2. `edit` or `document`: make the core source/artifact change
3. `verify`: run validation
4. `document`: update queue status or handoff evidence when applicable

Each task should have:

- stable `task_id`
- clear `title`
- initial `status`
- `type`
- focused `owned_paths`
- concrete `done_when`

## IMPLEMENTATION_BRIEF.md

Keep the brief short and operational. Include:

- `Goal`
- `Read First`
- `Do`
- `Do Not`
- `Owned Paths`
- `Validation`
- `Stop Conditions`

The brief is for the next implementation agent. It should not explain the
entire planning conversation.

## Queue Update

After selecting:

- set candidate `status` to `selected` or `in_progress`
- add `selection.selected_change_id`
- add `selection.reason`
- add `selection.selected_at` when the date is known
- update `next_recommended_candidate_id` only if the queue has another obvious
  ready candidate

After implementation completes, the implementation agent should set status to
`done` and add completion evidence.
