# M135 C003 Implementation Brief

## Goal

Repair historical `LOCAL_COMMIT_EVIDENCE.yaml` metadata shape failures in M87, M88, and M92 without
fabricating audit facts.

## Output

- Add full local implementation commit hashes where the historical evidence already named a short
  commit.
- Add repo-local evidence commit hashes for M92 records whose implementation happened in the target
  smart city repository.
- Add top-level `validation_evidence` summaries derived from existing recorded validation or
  verification fields.
- Record the repair boundary in `LOCAL_COMMIT_EVIDENCE_METADATA_REPAIR.md`.

## Boundaries

C003 must not rewrite git history, invent validation commands, convert target-repo commits into
local implementation commits, or change selected-change meaning.
