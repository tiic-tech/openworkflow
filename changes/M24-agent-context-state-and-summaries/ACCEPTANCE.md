# M24 Acceptance

- New projects expose a single low-context current-state packet at `.openworkflow/CURRENT_STATE.yaml`.
- Agents can determine the active workflow stage, relevant current artifacts, last decision outcome, next command, blockers, and first files to read without recursively scanning stage directories.
- Artifact lifecycle statuses are explicit enough to avoid stale `draft` and stale `current_question` ambiguity after downstream stages are created.
- Long artifact contracts expose summary or current-slice metadata so agents default to compact context and load raw evidence only when referenced.
- Init metadata produces useful `project_slug` and `project_title` values, not `"."`.
- The M23 minimal-init constraint remains intact: no stage directories or stage artifacts are eagerly created.

Validation target:

```bash
npm run validate
npm run verify:runtime-surface
npm run verify:e2e-workflow
npm run verify:clean
npm run smoke:init
npm run validate:cli
```
