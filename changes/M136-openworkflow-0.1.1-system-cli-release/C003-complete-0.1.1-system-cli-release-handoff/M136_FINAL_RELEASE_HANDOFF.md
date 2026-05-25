# M136 Final Release Handoff

Date: 2026-05-25

## Result

M136 is complete locally.

System-level OpenWorkflow CLI is now available from:

- `/opt/homebrew/bin/openworkflow`

Global npm reports:

- `@tiic-tech/openworkflow@0.1.1`
- Install source: `/Users/archy/Projects/StartUp/openworkflow`

## Verified Command Surface

The system command now exposes current commands including:

- `resume`
- `handoff`
- `inspect`
- `context`
- `summaries`
- `summarize`
- `git-automation`

`openworkflow resume --root . --json` succeeds with `ok: true` and `handoff_ok: true`.

## Validation

- `npm run build`: passed
- `npm run validate`: passed
- `npm install -g .`: passed
- `openworkflow --help`: passed, current command surface visible
- `openworkflow resume --root . --json`: passed
- `git diff --check`: passed

## npm Registry Boundary

`@tiic-tech/openworkflow@0.1.1` already exists on npm:

- Registry gitHead: `b460bca063aa3c67855dd0f7512613c70c0f6195`
- Published at: `2026-05-19T09:30:38.852Z`

M136 did not run `npm publish` for `0.1.1` because published npm versions are immutable. A future
public registry release for the current capability surface should use a new version number, such as
`0.1.2`.
