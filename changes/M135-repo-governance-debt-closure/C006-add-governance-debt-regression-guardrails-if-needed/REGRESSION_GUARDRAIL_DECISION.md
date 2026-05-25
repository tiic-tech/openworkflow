# M135 C006 Regression Guardrail Decision

## Decision

No additional validator or fixture source change is needed in C006.

## Rationale

C001 classified the debt families, and C002-C005 repaired the artifacts rather than weakening the
validators. After the C005 evidence hash normalization, `npm run validate` passed. That means the
existing validators already detect the repaired failure classes:

- historical planning artifact shape debt;
- historical local commit evidence metadata debt;
- high-risk decision report section and approval-boundary debt;
- YAML parse failures;
- prompt-pack `prototype_system_contract` schema shape failures.

## Guardrails Preserved

- No parser or validator was relaxed.
- No generated `.agents/**` or `.openworkflow/**` surface was manually patched.
- No source behavior change was made for C006.
- Future regression protection remains the existing repository validation gate: `npm run validate`.

## Validation

- `npm run validate` passed after C002-C005 repairs.
- `git diff --check` passed.
