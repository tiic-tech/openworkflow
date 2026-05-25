# M137 C003 Publication Evidence

## Registry state

- `npm view @tiic-tech/openworkflow@0.1.2 version gitHead time --json` returns E404.
- `npm whoami` returns E401 in this shell.

## Publish attempt

Command:

```sh
npm publish --access public
```

Result:

- `prepublishOnly` ran `npm run validate`, `npm run verify:runtime-surface`, `npm run verify:e2e-workflow`, and `npm run verify:clean`.
- The second publish attempt passed those checks and reached the registry upload phase.
- npm produced tarball `tiic-tech-openworkflow-0.1.2.tgz` for `@tiic-tech/openworkflow@0.1.2`.
- Upload failed with E404 on `PUT https://registry.npmjs.org/@tiic-tech%2fopenworkflow`: not found or no permission.

Interpretation: public npm publication is blocked by npm authentication or `@tiic-tech` package permission, not by local build or release-gate validation.

## Local update

Command:

```sh
npm install -g .
```

Result:

```txt
/opt/homebrew/lib
└── @tiic-tech/openworkflow@0.1.2 -> ./../../../Users/archy/Projects/StartUp/openworkflow
```

System `openworkflow --help` exposes the current command surface, and
`openworkflow resume --root . --json` returns `ok: true`.
