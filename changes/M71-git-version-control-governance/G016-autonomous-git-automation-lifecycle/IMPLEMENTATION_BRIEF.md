# G016 - Autonomous Git Automation Lifecycle

## Goal

Define the autonomous git automation lifecycle contract without implementing
remote mutation.

## Approved Option

G016 Option B: Design-Only Autonomous Contract.

## Do

- Document explicit autonomous enablement.
- Define allowed and denied operation tiers.
- Define preflight and completion evidence.
- Define merge-readiness gates.
- Define conflict and rollback policy.
- Add the read-only autonomous simulator as the next candidate.

## Do Not

- Do not push.
- Do not create or update remote PRs.
- Do not merge PRs.
- Do not mutate GitHub Issues.
- Do not implement autonomous mode execution.
- Do not change generated skill surfaces.

## Validation

- `npm run validate`
- `git diff --check`
