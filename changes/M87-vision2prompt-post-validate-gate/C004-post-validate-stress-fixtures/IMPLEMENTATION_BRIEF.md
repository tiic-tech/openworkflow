# C004 Implementation Brief

## Goal

Complete the post-validate gate stress matrix. C002 already introduced exact
duplicate, strategically distinct, style-only, and single-direction fixtures;
C004 should add the missing near-duplicate strategic rephrase case and make the
failure reason explicit enough for `/ow:vision2prompt` repair.

## Scope

Use local deterministic validation fixtures only. Do not generate prototype
images, add browser checks, or broaden into `/ow:tune` coverage.

## Acceptance Focus

- Exact duplicate fingerprints fail.
- Near-duplicate strategy rephrases fail even when not byte-identical.
- Distinct multi-direction fingerprints pass.
- Explicit one-direction requests skip diversity comparison.
- Failure output names the over-threshold pair, threshold, score, and shared
  dimensions.
