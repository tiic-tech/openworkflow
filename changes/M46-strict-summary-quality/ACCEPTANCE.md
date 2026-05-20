# M46 Acceptance

- Default `summaries --json` stays ok:true for fresh current_but_thin summaries.
- `summaries --strict --json` returns ok:false, nonzero exit, and health_errors for current_but_thin summaries.
- `inspect --strict --json` returns ok:false when summary quality is thin.
- Help and AGENTS.md explain when Agents should use strict quality mode.
- Runtime verification covers default and strict quality behavior.

Validation target:

```bash
npm run build
npm run verify:runtime-surface
npm run validate
```
