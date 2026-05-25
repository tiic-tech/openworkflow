# M136 OpenWorkflow 0.1.1 System CLI Release

Status: active

## Scope

M136 makes the current post-M134/M135 `0.1.1` build available through the system-level
`openworkflow` command.

The npm registry already contains `@tiic-tech/openworkflow@0.1.1` from 2026-05-19 with gitHead
`b460bca063aa3c67855dd0f7512613c70c0f6195`, so M136 must not attempt to overwrite that package.

## Candidates

### C001 - Record 0.1.1 release feasibility and registry immutability

Status: done

Confirm the registry state and record that the same npm version cannot be republished.

Result:

- npm registry already has `@tiic-tech/openworkflow@0.1.1`.
- The registry artifact gitHead is `b460bca063aa3c67855dd0f7512613c70c0f6195`.
- M136 will not overwrite npm `0.1.1`; it will install the current main build as the system CLI.

### C002 - Install current main 0.1.1 as system-level CLI

Status: done

Install the current repository build globally so `/opt/homebrew/bin/openworkflow` exposes the current
command surface.

Result:

- `npm run build` passed.
- `npm run validate` passed.
- `npm install -g .` succeeded.
- `/opt/homebrew/bin/openworkflow` now exposes current commands including `resume`, `handoff`,
  `context`, `summaries`, and `git-automation`.

### C003 - Complete 0.1.1 system CLI release handoff

Status: ready

Record final validation, system CLI evidence, and next-version guidance.
