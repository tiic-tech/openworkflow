# M34 Acceptance

- `openworkflow context --root <folder> --json` defaults to `CURRENT_STATE.next_command`.
- `openworkflow context --root <folder> --for /ow:<command> --json` returns an Agent-readable context packet with readiness, packet metadata, included content, omissions, warnings, blockers, and next actions.
- Packet content is budgeted and deterministic.
- SUMMARY.yaml/current_slice content is preferred before full source artifacts.
- Raw evidence and forbidden context are omitted by default with explicit reasons.
- The command is read-only and does not create lazy stage directories.
- Non-OpenWorkflow roots return an explicit JSON error.
- Help and AGENTS.md managed block document the command and its boundary.

Validation target:

```bash
npm run build
npm run validate
npm run verify:runtime-surface
npm run verify:e2e-workflow
npm run verify:clean
```

Manual consumer E2E should cover:

```bash
openworkflow init <tmp> --tools codex --force --json
openworkflow context --root <tmp> --json
openworkflow context --root <tmp> --for /ow:proto --json
openworkflow summaries --root <tmp> --json
openworkflow summarize --root <tmp> --all --write --json
openworkflow context --root <tmp> --for /ow:design --max-bytes 12000 --json
```
