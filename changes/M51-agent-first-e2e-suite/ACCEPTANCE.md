# M51 Acceptance

- `npm run verify:agent-e2e` exists and runs successfully.
- The suite verifies minimal init does not create lazy stage artifacts.
- The suite verifies handoff and `context --handoff` fail on current-but-thin summaries.
- The suite verifies default context remains non-strict.
- The suite verifies clean preserves source artifacts and user AGENTS.md content.
- The suite verifies sync recovers `CURRENT_STATE` pointers and next command after clean.
- Repository validation requires M51 contracts.

Validation target:

```bash
npm run build
npm run verify:agent-e2e
npm run validate
```
