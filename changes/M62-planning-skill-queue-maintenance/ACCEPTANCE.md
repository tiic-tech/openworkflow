# M62 Acceptance

- Existing `CANDIDATE_CHANGES.yaml` queues can be maintained by stable candidate
  id.
- Mutating queue operations have an auditable top-level `operations` entry.
- `select-change` can perform targeted candidate readiness review.
- Queue deletion semantics prefer `superseded`, `deferred`, or `blocked` over
  hard deletion.
- `npm run validate` passes.
