# M18 TODO

M18 fixes E2E friction found after M17.

## Plan

1. [x] Move tune prototype index from required context to optional context.
2. [x] Remove `/ow:decision` from design handoffs.
3. [x] Generate advertised artifact template files during init.
4. [x] Make `--help` and `-h` exit with code 0.
5. [x] Add runtime verification for the fixes.
6. [x] Run full validation.

## Completion Checklist

- [x] Tune can start from validation without an existing prototype index.
- [x] Design does not leak manual decision handoff.
- [x] All `template_path` files exist after init.
- [x] CLI help exits successfully.
- [x] Full validation passes.
