# C001 Canonical Discovery-Loop Dogfood Fixture

## Selected Change

Create one canonical text-first discovery-loop dogfood fixture that can be used
by later M90 checks to prove the upgraded command chain works from proto-ready
vision through benchmark-selection readiness.

## Scope

In scope:

- One coherent product case with traceable artifact ids and refs.
- Vision, validation, strategic prompt pack, generated image metadata, refined
  tune prompt pack, and decision evidence fixture content.
- Helper builders or fixture writers in runtime/E2E verification code.
- Validator repair messages only if the fixture reveals silent gaps.

Out of scope:

- External image generation.
- Browser or visual review.
- Proto2html, html2spec, build, or archive artifacts.
- Async subagent runtime behavior.

## Implementation Notes

- Keep the fixture text-first. Generated image evidence should be metadata
  stubs, not real generated images.
- Prefer one recognizable product case that demonstrates vision, validation,
  strategic directions, generated image metadata, tune inheritance, and
  benchmark decision continuity.
- Artifact refs should form a readable chain so an agent can inspect the fixture
  without guessing which file came next.
- Do not broaden into command handoff assertions beyond what is needed to prove
  the fixture validates; C002 owns happy-path handoff checks.

## Verification

- `npm run build`
- `npm run validate`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

## Stop Conditions

- Stop if the fixture requires external generation, visual review, async
  runtime behavior, or proto2html artifacts.
- Stop for approval only if implementation requires high-risk runtime,
  provider, security, or external-service behavior.
