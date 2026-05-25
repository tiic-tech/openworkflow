# M136 C002 System CLI Install Evidence

## Install

Command run:

- `npm run build`
- `npm run validate`
- `npm install -g .`

Result:

- Build passed.
- Repository validation passed.
- Global install succeeded.

Global npm state:

- Global root: `/opt/homebrew/lib/node_modules`
- Installed package: `@tiic-tech/openworkflow@0.1.1`
- Install target: `/Users/archy/Projects/StartUp/openworkflow`
- System command path: `/opt/homebrew/bin/openworkflow`

## Command Surface

`openworkflow --help` now includes current commands:

- `handoff`
- `resume`
- `status`
- `brief`
- `inspect`
- `context`
- `draft`
- `register`
- `check`
- `summaries`
- `summarize`
- `git-automation`
- `clean`

This replaces the stale system capability surface that only exposed init, validate, sync, doctor,
and clean.

## Runtime Check

`openworkflow resume --root . --json` succeeded with `ok: true` and `handoff_ok: true`.

## Registry Boundary

This was a system CLI install from the current repository. It did not publish or overwrite
`@tiic-tech/openworkflow@0.1.1` on npm.
