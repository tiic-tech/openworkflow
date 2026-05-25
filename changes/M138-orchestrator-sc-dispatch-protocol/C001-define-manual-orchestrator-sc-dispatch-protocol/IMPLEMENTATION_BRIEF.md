# C001 Implementation Brief

Define the manual Orchestrator selected-change dispatch protocol.

## Boundary

This is a docs/protocol selected change. It must not add a CLI command, schema,
validator, generated adapter, runtime scheduler, or remote automation.

## Source Truth

`references/orchestrator-selected-change-dispatch.md` is the protocol source.
Other references should link to it rather than restating the full protocol.

## Validation

Run:

```sh
npm run validate
openworkflow handoff --root . --json
git diff --check
```

## Completion

Record local commit evidence under this selected-change folder and reference it
from the M138 queue completion.
