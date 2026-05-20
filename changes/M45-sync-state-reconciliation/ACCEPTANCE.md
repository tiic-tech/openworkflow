# M45 Acceptance

- After clean removes CURRENT_STATE.yaml, sync restores current_validation/current_prototype from preserved indexes.
- After recovery, CURRENT_STATE.active_stage and next_command match the latest recoverable current artifact.
- Sync JSON includes structured state_reconciliation status and warnings.
- Sync does not overwrite an existing non-default CURRENT_STATE.yaml.
- Clean/sync verification covers the recovered continuity path.

Validation target:

```bash
npm run build
npm run verify:clean
npm run validate
```
