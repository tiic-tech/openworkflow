# C014 Implementation Brief

## Goal

Define the deferred feature handoff map that closes M73 without creating future
queues prematurely.

## Read First

- `references/workflow-blueprint-runtime-alignment.md`
- `changes/M73-workflow-blueprint-runtime-alignment/C014-deferred-feature-handoff-map/SELECTED_CHANGE.yaml`

## Do

- Add a future DTC handoff map to `references/workflow-blueprint-runtime-alignment.md`.
- Put front-chain command quality review before proto2html.
- Preserve proto2html, html2spec, build, change, review, archive, build-agent,
  build-skill, lifecycle, and read model work as future queue boundaries.
- Mark high-risk future runtime surfaces as approval-gated.

## Do Not

- Do not create future queues.
- Do not select or approve high-risk candidates.
- Do not implement runtime surfaces.
- Do not edit runtime command registry, generated `.agents/**`, or `.openworkflow/**`.

## Validation

```bash
npm run validate
git diff --check
```
