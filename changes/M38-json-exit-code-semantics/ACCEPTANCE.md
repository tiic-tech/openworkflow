# M38 Acceptance

- `openworkflow summaries --root <initialized-unhealthy> --json` emits `ok:false` and exits nonzero.
- `openworkflow inspect --root <initialized-unhealthy> --json` emits `ok:false` and exits nonzero.
- `openworkflow brief --root <initialized-unhealthy> --json` and `status --json` emit `ok:false` and exit nonzero.
- Healthy read-model commands continue to exit 0.
- Help and AGENTS.md managed block explain that JSON `ok:false` maps to a nonzero exit and stdout remains parseable.

Validation target:

```bash
npm run build
npm run validate
npm run verify:runtime-surface
```
