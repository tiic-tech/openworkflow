# High-Risk Decision Report: M115 C006 Optional Coder Evidence Contract

## Trigger

M115 C005 is complete and proved the stable read-model field for `coder_gate`
using guidance-only semantics. M115 C006 is now the next M115 candidate, but it
is high risk because it can change artifact contracts, validators, and future
Agent expectations around implementation evidence.

## Change

- Candidate: `C006`
- Title: `Introduce optional coder evidence artifact contract`
- Current status: `candidate`
- Risk: `high`

C006 should define the shape of optional coder evidence for preflight,
RED/GREEN evidence, post-write self-check, validation ladder selection, and
learned quality lessons. It must not make `CODER_EVIDENCE.yaml` mandatory and
must not migrate historical queues.

## Concrete Risks

- A mandatory evidence contract could turn existing valid queues red.
- A broad artifact registry change could expose `/ow:coder` as a normal
  user-facing workflow artifact.
- Validator changes could confuse missing optional evidence with malformed
  present evidence.
- Duplicating fields already present in `LOCAL_COMMIT_EVIDENCE.yaml` could make
  future Agents reconcile two competing sources of truth.
- A large schema or generated-surface change would exceed C006's commit-sized
  boundary.

## Options

### Option A: Optional Embedded Contract

Define `coder_evidence` as an optional object embedded in
`LOCAL_COMMIT_EVIDENCE.yaml`. Validators check the object only when present.

Pros:
- Reuses the evidence file that git-automation already creates.
- Avoids a new required artifact path.
- Keeps commit evidence as the single binding point for source-edit work.

Cons:
- Less discoverable as a standalone artifact.
- Future multi-agent runs may still want a separate evidence file.

### Option B: Optional Standalone Contract

Define `CODER_EVIDENCE.yaml` as an optional standalone evidence artifact.
Validators check `CODER_EVIDENCE.yaml` only when the file exists, and queue
completion may reference it as supporting evidence but must not require it.

Pros:
- Clear shape for future Agent-authored coder evidence.
- Easier to inspect independently from local git evidence.

Cons:
- Introduces another artifact name before enforcement is proven.
- Requires careful documentation that absence is valid.

### Option C: Defer C006

Keep `LOCAL_COMMIT_EVIDENCE.yaml.coder_gate` as the only binding point and
defer any `CODER_EVIDENCE.yaml` contract until another real queue proves a
missing need.

Pros:
- Lowest risk.
- Avoids premature artifact proliferation.

Cons:
- Leaves `/ow:coder` adaptation without a reusable optional evidence shape.

## Recommended Option

Approve Option A for implementation now.

The current proven path is commit evidence, and C005 already added a
guidance-only `coder_gate` field there. Option A extends that same binding point
with optional `coder_evidence` details while avoiding a new required artifact or
user-facing workflow surface.

## Guardrails

- Do not require `CODER_EVIDENCE.yaml`.
- Do not add `coder_evidence` to discovery workflow artifact indexes.
- Do not fail validation when coder evidence is absent.
- Do fail validation when present coder evidence is malformed.
- Do not change remote git, PR, or push behavior.
- Do not migrate historical queues.
- Keep generated `.agents/**` and `.openworkflow/**` untouched unless a source
  generator change requires explicit sync evidence.

## Go Criteria

- The user explicitly approves Option A, Option B, or Option C.
- The implementation stays within C006 owned paths.
- RED evidence demonstrates malformed present evidence is currently unchecked.
- GREEN evidence proves malformed present evidence is rejected while absent
  evidence remains valid.

## Stop Criteria

- The implementation would make coder evidence mandatory.
- The implementation would expose `/ow:coder` as a user-facing command.
- The implementation would require migrating historical planning artifacts.
- The implementation would create broad schema or generated-surface churn
  outside the selected option.
