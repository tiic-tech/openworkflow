# M27 Acceptance

- `openworkflow status --root <folder>` prints a concise Agent-readable project status.
- `openworkflow brief --root <folder>` is available as the Agent-oriented alias.
- `--json` emits parseable JSON with stable top-level keys: `project`, `workflow`, `read_this_first`, `active_pointers`, `health`, `git`, and `agent_guidance`.
- The read model composes existing workflow/config/current-state/doctor/platform/git information without writing artifacts.
- `openworkflow --help` and the AGENTS.md managed block both mention `status` and `brief`.
- The command preserves lazy-create boundaries and does not create stage directories.
- Health output identifies sync-fixable workflow or adapter drift.
- Git state is best-effort and works both inside and outside git repositories.

Validation target:

```bash
npm run validate
npm run verify:runtime-surface
npm run verify:e2e-workflow
npm run verify:clean
```
