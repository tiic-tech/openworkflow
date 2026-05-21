# C001 Implementation Brief

Update native `build-prototype` behavior so `/ow:proto` is framed as a
strategy-to-prompt compiler, not a generic prompt writer or local runnable
prototype shortcut.

The important correction after M85 is validation consumption: `/ow:proto` may
not proceed in ephemeral `vision_only` mode. If a durable validation artifact is
missing, the proto command must first trigger the same artifact-producing
validation pass recorded in M85.

Implementation is limited to:

- `skills/build-prototype/SKILL.md`
- `skills/build-prototype/references/strategic-prompt-pack-protocol.md`
- M86 planning evidence

Do not change schemas, generated `.agents/**` skills, generated
`.openworkflow/**` audit files, or runtime behavior in this change.
