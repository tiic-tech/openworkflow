# M22 Acceptance

M22 is accepted when users can safely remove OpenWorkflow-generated project files
with `openworkflow clean` while npm install/uninstall remains responsible for
the global CLI package lifecycle.

## Required Outcomes

- `openworkflow help` lists `clean`.
- `openworkflow clean --root <folder> --tools codex` defaults to dry-run.
- `openworkflow clean --root <folder> --tools codex --yes` removes `.openworkflow`.
- Generated Codex adapter files under `.agents` are removed.
- Non-generated `.agents` files are skipped unless future explicit policy says otherwise.
- Legacy generated `.codex` files may be cleaned when they carry the OpenWorkflow generated marker.
- The command prints planned, removed, skipped, and warning counts.
- README distinguishes npm uninstall from project clean.

## Validation

- `npm run build` passes.
- `npm run validate` passes.
- `npm run verify:runtime-surface` passes.
- `npm run verify:e2e-workflow` passes.
- Clean-specific verifier passes.
- `npm run smoke:init` passes.
- `node dist/cli/src/index.js sync --root /tmp/openworkflow-m04-smoke --tools codex` passes.
- `node dist/cli/src/index.js doctor --root /tmp/openworkflow-m04-smoke --tools codex` passes.
- `npm run validate:cli` passes.
- `npm pack --dry-run` passes.
