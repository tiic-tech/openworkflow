# M137 C003 Publication Evidence

## Registry state

- `npm whoami` returns `tiic-tech`.
- `npm access list packages @tiic-tech --json` reports `@tiic-tech/openworkflow` as `read-write`.
- `npm view @tiic-tech/openworkflow@0.1.2 version gitHead time --json` confirms:
  - version: `0.1.2`
  - gitHead: `cb767e5ffe3c5dd93b4f3b5b182c5b5d9da77425`
  - published_at: `2026-05-25T01:44:22.571Z`

## Publish attempt

Command:

```sh
npm publish --access public
```

Initial result:

- `prepublishOnly` ran `npm run validate`, `npm run verify:runtime-surface`, `npm run verify:e2e-workflow`, and `npm run verify:clean`.
- The second publish attempt passed those checks and reached the registry upload phase.
- npm produced tarball `tiic-tech-openworkflow-0.1.2.tgz` for `@tiic-tech/openworkflow@0.1.2`.
- Upload failed with E404 on `PUT https://registry.npmjs.org/@tiic-tech%2fopenworkflow`: not found or no permission.

Follow-up result:

- User completed npm CLI browser authentication.
- `npm publish --access public` completed and published `+ @tiic-tech/openworkflow@0.1.2`.

## Local update

Initial local command:

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

Registry install command:

```sh
npm install -g @tiic-tech/openworkflow@0.1.2
```

Result:

```txt
/opt/homebrew/lib
└── @tiic-tech/openworkflow@0.1.2
```

`node -p "require('/opt/homebrew/lib/node_modules/@tiic-tech/openworkflow/package.json').version"`
returns `0.1.2`, and `openworkflow resume --root . --json` returns `ok: true`.
