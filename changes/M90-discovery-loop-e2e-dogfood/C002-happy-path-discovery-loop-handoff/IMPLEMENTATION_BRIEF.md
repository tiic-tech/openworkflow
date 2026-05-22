# C002 Happy-Path Discovery-Loop Handoff

## Selected Change

Verify that generated command surfaces and context packets guide an agent
through the synchronous discovery loop using the canonical C001 fixture chain:
vision, validation, proto, vision2prompt, prompt2proto metadata, tune, and
internal decision audit.

## Scope

In scope:

- Generated skill/context/command-audit checks for discovery-loop ordering.
- Runtime assertions that the fixture chain reaches benchmark-selection
  readiness.
- Explicit guard that the happy path does not enter proto2html.

Out of scope:

- Negative failure routing; C003 owns that.
- Real image generation or browser visual review.
- Async subagent orchestration.
- Proto2html, html2spec, build, or archive.

## Verification

- `npm run build`
- `npm run validate`
- `npm run verify:e2e-workflow`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`
