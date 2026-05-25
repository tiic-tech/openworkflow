# PR Ready Summary - M136 OpenWorkflow 0.1.1 System CLI Release

## Scope

M136 records the post-M134/M135 0.1.1 release state and makes the current main build available
through the system-level `openworkflow` command.

## Completed Changes

- C001: recorded registry release feasibility and npm 0.1.1 immutability.
  - Primary: `f916bcd`
  - Evidence: `23dddbe`
- C002: installed current main 0.1.1 as the system-level CLI.
  - Primary: `9df75d5`
  - Evidence: `adb30e4`
- C003: completed the release handoff.
  - Primary: `c3980a5`
  - Evidence: `a4ca8e4`

## Release Result

- `/opt/homebrew/bin/openworkflow` now resolves to the current repository install.
- `openworkflow --help` exposes the current command surface including `resume`, `handoff`,
  `context`, `summaries`, and `git-automation`.
- `openworkflow resume --root . --json` passes.

## Registry Boundary

`@tiic-tech/openworkflow@0.1.1` already exists on npm with registry gitHead
`b460bca063aa3c67855dd0f7512613c70c0f6195`, published on `2026-05-19T09:30:38.852Z`.

M136 did not run `npm publish` for `0.1.1` because npm versions are immutable. A future public npm
release for the current capability surface needs a new version number, such as `0.1.2`.

## Validation

- `npm run build`: passed
- `npm run validate`: passed
- `npm install -g .`: passed
- `openworkflow --help`: passed
- `openworkflow resume --root . --json`: passed
- `git diff --check`: passed

Draft PR: https://github.com/tiic-tech/openworkflow/pull/11
