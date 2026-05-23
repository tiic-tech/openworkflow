# M114 C002 Implementation Brief

## Goal

Introduce a shared core helper for root-contained path resolution and
repo-local reference checks, then replace one narrow validator call site while
preserving behavior-compatible diagnostics.

## Read First

- `changes/M114-engineering-quality-foundation/CANDIDATE_CHANGES.yaml`
- `changes/M114-engineering-quality-foundation/SUMMARY.yaml`
- `skills/coder/SKILL.md`
- `references/internal-coder-protocol.md`
- `references/validation-trust-domains.md`
- `/Users/archy/.codex/skills/ow-code-quality-governor/SKILL.md`
- `/Users/archy/.codex/skills/ow-code-quality-governor/references/01_openworkflow_quality_model.md`
- `/Users/archy/.codex/skills/ow-code-quality-governor/references/02_refactor_execution_protocol.md`
- `/Users/archy/.codex/skills/ow-code-quality-governor/references/03_validation_ladder.md`

## Do

- Add one shared helper under `packages/core/src/fs/` for root containment and
  local-reference resolution.
- Prove RED with a targeted path-safety fixture or dev verifier that covers
  relative escapes, prefix collisions, absolute paths, external refs, missing
  paths, and valid refs.
- Replace one narrow validator call site in `packages/core/src/validators/`
  without changing public CLI JSON shape or broad validator policy.
- Bind RED/GREEN/self-check/validation evidence in
  `LOCAL_COMMIT_EVIDENCE.yaml`.

## Do Not

- Do not refactor all validator path checks.
- Do not alter generated `.agents/**` or `.openworkflow/**`.
- Do not change public CLI JSON semantics.
- Do not fix unrelated historical validation debt.

## Owner And Dependency Map

- Source truth: `packages/core/src/fs/`
- Validator consumer: one call site in `packages/core/src/validators/`
- Targeted verifier: `packages/cli/src/dev/verifyRuntimeSurface.ts` or an
  equivalent targeted build-time fixture
- Planning and evidence: `changes/M114-engineering-quality-foundation/`

Dependency order:

```text
RED verifier -> fs helper -> validator call site -> GREEN verifier -> OW validation/trust commands -> commit evidence
```

## Validation

- `npm run build`
- targeted path-safety fixture or `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js resume --root . --json`
- `node dist/cli/src/index.js handoff --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`

## Stop Conditions

- The helper requires broad validator rewrites to be useful.
- The targeted replacement changes public diagnostics beyond compatibility.
- The work requires generated-surface edits.
- The working tree gains unrelated dirty paths.
