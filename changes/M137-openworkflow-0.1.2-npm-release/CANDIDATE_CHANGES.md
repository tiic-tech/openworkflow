# M137 OpenWorkflow 0.1.2 npm release

Status: active, blocked only on npm registry authentication or scope permission.

## Completed

- Bumped `package.json` and `package-lock.json` from `0.1.1` to `0.1.2`.
- Ran `npm run build`, `npm run validate`, and `npm pack --dry-run --json`.
- Fixed `/ow:proto` release-gate drift in `packages/core/src/commands/registry.ts`.
- Ran `npm run verify:e2e-workflow` and `npm run verify:clean`.
- Ran `openworkflow sync --root . --tools codex --json` to refresh generated proto surfaces.
- Installed the local repository globally with `npm install -g .`.
- Verified system `openworkflow` resolves to `@tiic-tech/openworkflow@0.1.2`.

## Blocked

`npm publish --access public` passed `prepublishOnly` and reached registry upload, then failed with
E404 for `PUT https://registry.npmjs.org/@tiic-tech%2fopenworkflow`: not found or no permission.
Earlier `npm whoami` returned E401.

Public npm release requires an authenticated npm identity with publish rights for
`@tiic-tech/openworkflow`.
