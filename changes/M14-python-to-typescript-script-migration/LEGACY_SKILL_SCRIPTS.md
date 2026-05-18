# Legacy Skill Script Inventory

M14 intentionally migrates only the active npm workflow path. The following
repo-local skill helper scripts remain as legacy prototypes because they encode
early `.codex/skills` assumptions and should be redesigned around the M13
`.agents/skills/ow-*` adapter contract before translation:

- `skills/build-workflow/scripts/init_workflow.py`
- `skills/build-validation/scripts/init_validation.py`
- `skills/build-prototype/scripts/init_prototype.py`
- `skills/build-team/scripts/init_team_runtime.py`
- `skills/run-team/scripts/audit_team_runtime.py`
- `skills/run-team/scripts/init_next_scope.py`

Future migration should move durable behavior into TypeScript package modules
or generated OpenWorkflow runtime contracts, not perform a line-for-line
translation of these helpers.
