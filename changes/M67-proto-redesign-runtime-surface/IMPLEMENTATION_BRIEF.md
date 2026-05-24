# M67 Implementation Brief

Expose the accepted image-first proto redesign through runtime surfaces.

## Boundaries

- `/ow:proto` creates strategic prototype prompt packs from vision or validation context.
- `/ow:tune` refines accepted prototype screens or prompt packs into screen-bound refined prompt packs.
- Validation is optional for proto start. If `CURRENT_STATE.current_validation` is set, it must be a usable validation artifact before proto consumes it.
- Generated adapter files must come from `openworkflow sync`, not manual edits.
- HTML, CSS, runnable prototypes, specs, changes, and runtime work stay out of proto/tune.

## Verification Focus

- Command registry protocol text and generated skills contain the prompt-pack blocks.
- Artifact contracts, templates, validators, summaries, and schema agree on prompt-pack evidence fields.
- Existing init, sync, clean, check, summary health, workflow e2e, and agent e2e behavior still passes.
