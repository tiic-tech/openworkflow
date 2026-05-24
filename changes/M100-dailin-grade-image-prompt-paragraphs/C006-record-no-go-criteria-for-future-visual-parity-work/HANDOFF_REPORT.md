# M100 Downstream Handoff

## Status

M100 is a prompt-text-quality pass.

The real smart city target replay now has dailin-grade direction and
screen-level prompt paragraphs, recorded at target commit `66f6a38` in
`/tmp/smart-city-m99-e2e-worktree`.

## Go

Future visual/provider work may start from this M100 prompt text baseline if a
new queue explicitly authorizes it. The prompt pack is ready to be used as input
for later provider-backed generation or visual parity experiments.

Allowed next queues:

- `M101-build-proto-prompt-command-split`, for command-boundary separation.
- `M102-prototype-visual-reference-parity-gate`, for visual parity methods.
- `M101-provider-image-generation-benchmark` or equivalent, for provider-backed
  output testing.

## No-Go

Do not treat M100 as evidence of generated image quality.

M100 does not include:

- provider-backed image generation
- human visual review
- visual reference parity scoring
- proto2html
- storyboard or motion modeling
- claim that output images match dailin or the dashboard video

## Boundary

The pass condition is text-level: generated prompt paragraphs must contain
product context, target user, journey purpose, screen components, user actions,
system response, concrete copy/data, trust controls, anti-goals, visual
direction, and desired user feeling.

The next visual work must carry its own evidence type and must not reuse M100
as a visual-quality verdict.
