# M137 OpenWorkflow 0.1.2 npm release

Status: complete.

## Completed

- Bumped `package.json` and `package-lock.json` from `0.1.1` to `0.1.2`.
- Ran `npm run build`, `npm run validate`, and `npm pack --dry-run --json`.
- Fixed `/ow:proto` release-gate drift in `packages/core/src/commands/registry.ts`.
- Ran `npm run verify:e2e-workflow` and `npm run verify:clean`.
- Ran `openworkflow sync --root . --tools codex --json` to refresh generated proto surfaces.
- Installed the local repository globally with `npm install -g .`.
- Verified system `openworkflow` resolves to `@tiic-tech/openworkflow@0.1.2`.
- Published `@tiic-tech/openworkflow@0.1.2` to npm.
- Reinstalled the system CLI from the npm registry package.

## Publication

`npm view @tiic-tech/openworkflow@0.1.2 version gitHead time --json` confirms the package is
published with gitHead `cb767e5ffe3c5dd93b4f3b5b182c5b5d9da77425`.
