# Decomposition Protocol

Use this reference when turning planning input into `CANDIDATE_CHANGES.yaml`,
`CANDIDATE_CHANGES.md`, and `SUMMARY.yaml`.

## Input Normalization

Capture the source as one of:

- `user_input`: direct instruction or pasted plan
- `planning_discussion`: latest session discussion
- `artifact`: named repo files such as `VISION.md` or `OW_DEVELOP_PLAN.md`
- `mixed`: a small set of explicit files plus session discussion

Prefer a narrow source set. Do not load archives, generated runtime state, or
unrelated implementation history unless the user names them.

## Candidate Shape

Each candidate should answer:

- What one outcome changes?
- Which paths own that outcome?
- What is explicitly out of scope?
- What must happen first?
- What downstream work does it unlock?
- How will an implementer verify it?
- What acceptance facts prove it is done?

Good candidates are small enough for one focused implementation pass. A
candidate is too broad when it owns multiple unrelated modules, mixes source
skill authoring with runtime command exposure, or requires both product design
and production implementation.

## Status Guidance

Use these statuses:

- `ready`: dependencies are satisfied and the candidate can be selected.
- `candidate`: valid but blocked by incomplete dependencies or sequencing.
- `blocked`: cannot be clarified or implemented without an explicit decision.
- `deferred`: useful but intentionally postponed.
- `superseded`: replaced by a newer candidate; keep evidence.

When updating an existing queue, never renumber stable ids. If a candidate
changes meaningfully, add a note or create a new candidate rather than reusing
the old id for a different scope.

## Output Checklist

`CANDIDATE_CHANGES.yaml` must include:

- `schema_version: 0.1.0`
- `contract_id: candidate_changes:<plan_id>`
- `contract_type: planning`
- `planning_artifact_type: candidate_changes`
- `plan_id`
- `title`
- `status`
- `source`
- `queue_policy`
- `selection_policy`
- `next_recommended_candidate_id` when appropriate
- `changes`

`CANDIDATE_CHANGES.md` should include:

- source-of-truth notice
- selection policy summary
- next recommended candidate when present
- one compact section per candidate

`SUMMARY.yaml` should include:

- source summary
- output paths
- candidate count
- next recommended candidate
- unresolved questions
- validation commands run

## Review Before Finishing

Check that:

- every candidate has focused `owned_paths`
- includes and excludes are both present
- dependencies reference stable candidate ids
- validation commands are realistic for this repo
- no candidate silently starts implementation
- generated or runtime paths are protected unless explicitly in scope
