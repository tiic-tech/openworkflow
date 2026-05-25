# M136 C002 Implementation Brief

## Goal

Install the current main `0.1.1` build as the system-level `openworkflow` command.

## Output

- Run build and validation.
- Run `npm install -g .`.
- Verify `/opt/homebrew/bin/openworkflow` exposes current commands and `resume` works.
- Record `SYSTEM_CLI_INSTALL_EVIDENCE.md`.

## Boundary

C002 does not publish to npm registry and does not change package version.
