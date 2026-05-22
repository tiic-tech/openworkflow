# C006 Implementation Brief

## Goal

Close M100 with a precise downstream handoff: prompt paragraph quality is now
dailin-grade after C005, but M100 still does not authorize or claim provider
image quality, visual reference parity, proto2html readiness, or storyboard
coverage.

## Read First

- `changes/M100-dailin-grade-image-prompt-paragraphs/C005-replay-smart-city-copilot-with-dailin-grade-prompt-paragraphs/IMPLEMENTATION_EVIDENCE.md`
- `docs/M97_PRODUCT_REALITY_E2E_SYNTHESIS_REPORT.md`
- `changes/M100-dailin-grade-image-prompt-paragraphs/CANDIDATE_CHANGES.yaml`

## Do

- Write a concise handoff report with explicit go/no-go facts.
- Update the synthesis report so future work starts from the correct boundary.
- Mark M100 complete and C006 done.

## Do Not

- Do not run provider-backed image generation.
- Do not perform human visual review.
- Do not score visual reference parity.
- Do not implement proto2html.
- Do not implement M101 command split.

## Validation

- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`
