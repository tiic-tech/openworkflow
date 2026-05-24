# C002 Implementation Brief

## Goal

Wire the `prototype_tune_to_refined_prompt` methodology into native generated
`/ow:tune` protocol surfaces. Source of truth is `packages/core/src/commands/registry.ts`;
generated `.agents` and `.openworkflow/audit` files must come from
`openworkflow sync`.

## Required Protocol Flow

1. Normalize tuning inputs and assign stable source/target screen IDs.
2. Audit baseline screens before refined prompt writing.
3. Extract product-system constants and adaptable variables.
4. Interpret the tune request and conflicts against product boundaries.
5. Build inheritance and delta rules, including screen-level delta matrix.
6. Output screen-bound refined prompts, generation order, and acceptance checklist.

## Boundaries

Keep `/ow:tune` text/prompt-pack focused. Do not generate images, HTML, runnable
apps, implementation tasks, or async subagent behavior in this change.
