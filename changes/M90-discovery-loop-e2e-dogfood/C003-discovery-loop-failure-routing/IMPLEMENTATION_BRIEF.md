# C003 Discovery-Loop Failure Routing

## Selected Change

Verify that bad discovery-loop artifacts stop at the correct repair route:
thin vision returns to `/ow:vision`, blocked validation prevents proto, failed
prompt post-validation prevents image generation, and tune drift or missing
baseline inheritance fails before downstream handoff.

## Scope

In scope:

- Negative runtime fixtures and assertions.
- Repair-route or artifact-section failure messages.
- Validator tightening only where a failure is silent.

Out of scope:

- Human interview transcript simulation.
- Generated images or browser visual review.
- Production implementation.

## Verification

- `npm run build`
- `npm run validate`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`
