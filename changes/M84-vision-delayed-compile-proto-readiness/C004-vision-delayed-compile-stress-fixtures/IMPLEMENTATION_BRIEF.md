# C004 Vision Delayed-Compile Stress Fixtures

## Goal

Add verification that distinguishes three vision states:

- interview/thin: not compile-ready and must remain `current_but_thin`
- blocked: explicitly blocked and still not handoff-ready
- ready: complete proto-readiness fields and usable handoff quality

Also keep generated `/ow:vision` drift checks strict enough to catch loss of
no-eager-write, delayed compile, or proto-readiness guidance.

## Non-Goals

- Do not fix the unrelated `/ow:analyze-changes` runtime-surface wording drift.
- Do not implement validation, proto, tune, or full discovery-loop fixtures.
- Do not create prototype image or browser tests.

## Verification

- `npm run build`
- `npm run validate`
- `npm run verify:e2e-workflow`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`
