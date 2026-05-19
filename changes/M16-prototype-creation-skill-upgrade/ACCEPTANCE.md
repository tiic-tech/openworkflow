# M16 Acceptance

M16 is accepted when `/ow:proto` reliably behaves like a design-capable
prototype creation workflow, not just a quick HTML proof generator.

## Required Checks

- `npm run build`
- `npm run validate`
- `npm run verify:runtime-surface`
- `npm run smoke:init`
- `node dist/cli/src/index.js sync --root /tmp/openworkflow-m04-smoke --tools codex`
- `node dist/cli/src/index.js doctor --root /tmp/openworkflow-m04-smoke --tools codex`
- `npm run validate:cli`

## Product Checks

- `/ow:proto` classifies the prototype type before choosing implementation tactics.
- Visual-first prototypes produce or request a high-fidelity static concept before HTML unless explicitly skipped.
- Reference images, URLs, screenshots, and HTML/CSS trigger pattern extraction before creative work.
- Prototype artifacts preserve visual concept evidence separately from runnable evidence.
- The skill performs a self-critique and repair pass before handoff.
- HTML/3D prototypes include browser or screenshot verification expectations.
- The change does not implement `/ow:tune`; that remains a separate command-surface change.
