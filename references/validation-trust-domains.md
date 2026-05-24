# Validation Trust Domains

OpenWorkflow exposes several green or red signals to Agents. Those signals must
not imply the same scope unless they actually validate the same domain.

This reference defines the initial trust-domain taxonomy for engineering
quality governance. It is taxonomy only: it does not change CLI JSON shape,
validator pass or fail behavior, generated surfaces, or historical artifacts.

## Core Rule

A command may be green for its domain while a broader domain is red. When that
happens, the command should be interpreted as scoped trust, not global
repository readiness.

The product failure to avoid is false readiness: a fresh Agent sees a green
entry command and assumes release-grade validation is clean.

## Domains

### Entry Trust

Purpose: decide whether a fresh Agent can safely enter the repository and load
bounded context.

Primary commands:

- `handoff --json`
- `inspect --strict --json`
- `context --handoff --json`

Proves:

- managed workflow surfaces are present and current enough for entry
- generated adapter surfaces are present and current enough for entry
- summary freshness and strict quality are acceptable for instantiated workflow
  artifacts
- current next command readiness can be checked
- read order and blockers are available

Does not prove:

- broad repository validation is clean
- historical planning artifacts are contract-current
- all fixtures are release-ready
- release packaging is ready
- all quality-debt baselines are resolved

### Summary Health

Purpose: decide whether instantiated workflow artifacts have trusted summaries
or current slices before raw evidence is loaded.

Primary commands:

- `summaries --json`
- `summaries --strict --json`

Proves:

- summary or current-slice presence for instantiated artifact contracts
- freshness status
- strict source quality when `--strict` is enabled

Does not prove:

- candidate queues outside registered workflow artifacts are globally clean
- historical archives have modern selected-change evidence
- example fixtures match the current release gate

### Managed Surface Health

Purpose: decide whether OpenWorkflow-owned files and generated adapters are
missing, stale, or repairable through source-driven sync.

Primary commands:

- `doctor --json`
- `sync --root . --tools codex --json` as a preview or mutation command

Proves:

- managed files and adapters match the current generators
- `AGENTS.md` managed block is current when present
- repair guidance is available for generated-surface drift

Does not prove:

- artifact handoff quality
- repository contract validation
- release readiness

### Source Contract Validation

Purpose: validate source-of-truth artifacts, schemas, and repository contracts.

Primary commands:

- `validate --root . --json`
- `npm run validate`

Proves:

- repository contract files and source artifacts meet the current validation
  rules for the validator's release-oriented scope
- malformed YAML, missing contract keys, missing evidence fields, high-risk
  report section drift, and fixture shape problems are visible

Does not prove:

- generated adapter parity unless that validator explicitly includes it
- runtime workflow behavior
- Agent entry trust when failures are known historical or release-domain debt

### Active Queue Health

Purpose: decide whether the current queue or selected change can safely
continue.

Primary commands and surfaces:

- `resume --json`
- `changes/<plan_id>/SUMMARY.yaml`
- `changes/<plan_id>/CANDIDATE_CHANGES.yaml`
- selected-change artifacts
- `git-automation commit` evidence

Proves:

- active queue boundary, selected candidate, next candidate, owned paths,
  forbidden paths, validation expectations, and commit-evidence expectations
  when the evidence is present

Does not prove:

- unrelated historical queues are clean
- release readiness
- all future candidate dependencies are satisfied

### Historical Archive Health

Purpose: classify older planning and evidence artifacts that may predate the
current contract.

Primary consumers:

- broad repository validation
- release readiness checks
- migration tools

Proves:

- archive compatibility with current validation rules when it passes

Does not prove:

- active continuation blockers by itself

Interpretation rule:

Historical archive failures must remain visible, but entry commands should not
silently collapse them into the same category as active selected-change
blockers. They should be reported as archive or release-readiness debt until a
specific migration candidate owns them.

### Fixture Corpus Health

Purpose: ensure examples, stress fixtures, and dev fixtures match the current
runtime and validator contracts.

Primary commands:

- `npm run verify:runtime-surface`
- targeted dev verifiers
- broad `npm run validate` when examples are part of repository validation

Proves:

- selected fixtures still exercise current behavior
- known negative and positive cases remain meaningful

Does not prove:

- every production path is covered
- historical artifacts are migrated

### Release Readiness

Purpose: decide whether the repository is clean enough to package, publish, or
promote as a coherent tool release.

Primary commands:

- `npm run validate`
- `npm run verify:runtime-surface`
- `npm run verify:e2e-workflow`
- `npm run verify:agent-e2e`
- `npm run verify:clean`
- `npm pack` or publish gates when applicable

Proves:

- the broadest available local release gate is clean for the configured checks

Does not prove:

- that no deferred product feature remains
- that external providers or remote integrations are healthy unless those gates
  explicitly run them

## Current Baseline Red Domains

As of 2026-05-23, `handoff --json`, `inspect --strict --json`, and
`summaries --strict --json` can pass while `npm run validate` fails.

Current `npm run validate` failure classes:

- selected-change atom task shape drift in historical planning folders
- malformed YAML in a planning queue
- missing completion evidence in older done candidates
- missing or incomplete local commit evidence fields
- high-risk decision report section drift
- stale example prompt-pack shape

These are baseline quality debt. They are not acceptable release health, but
they also should not be confused with the active entry-trust domain unless a
current queue or selected change depends on them.

## Report Categories

Future trust reports should classify findings into these categories when the
domain distinction matters:

- `blocking_active`: blocks the current selected change, current command, or
  entry trust.
- `blocking_release`: blocks release readiness but not necessarily local Agent
  continuation.
- `historical_debt`: older artifact or archive incompatibility that must remain
  visible but needs a migration owner.
- `fixture_debt`: example or stress fixture mismatch.
- `generated_surface_drift`: managed or generated surface mismatch repairable
  through source-driven sync or generator changes.
- `new_regression`: failure introduced by the current candidate or dirty paths.
- `advisory`: non-blocking guidance with a concrete follow-up.

## Command Mapping

| Command | Intended domain | Important non-domain |
| --- | --- | --- |
| `handoff --json` | Entry trust | Release readiness |
| `inspect --strict --json` | Entry trust and strict summary quality | Historical archive migration |
| `context --handoff --json` | Command-specific startup packet plus entry trust | Broad repository validation |
| `summaries --strict --json` | Summary health | Queue archive health |
| `doctor --json` | Managed surface health | Artifact handoff quality |
| `validate --root . --json` | Source contract validation | Agent entry trust by itself |
| `npm run validate` | Build plus broad source contract validation | Runtime E2E behavior |
| `verify:runtime-surface` | Runtime and generated-surface regression coverage | Release readiness by itself |
| `resume --json` | Active queue and recovery packet | Mutation authorization |

## Agent Interpretation Rules

1. If entry trust is red, stop before implementation.
2. If entry trust is green and broad validation is red, continue only inside
   the active queue or selected-change boundary and record the red broad domain
   as residual debt.
3. If broad validation red classes touch the files or artifact family being
   edited, treat them as in-scope until proven historical.
4. If a command is green for a narrow domain, do not report global readiness.
5. If a candidate changes validation behavior, it must state which domain's
   pass/fail semantics changed and how Agents should interpret the result.
6. Historical debt must not be hidden to make a quality gate look healthy.

## Migration Direction

The next implementation candidates should move from this taxonomy toward
structured output:

- domain-classified validation sections
- shared path safety helpers
- extracted validator modules by domain
- structural verifier assertions
- typed protocol source models
- scan-budget reporting for entry commands

Each step should preserve the distinction between scoped Agent trust and broad
release readiness.
