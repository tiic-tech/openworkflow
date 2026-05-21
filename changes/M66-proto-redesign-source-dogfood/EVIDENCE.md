# Evidence

## Dogfood Result

`build-prototype` was used as a source-level behavior guide to produce a
strategic proto prompt pack from OpenWorkflow's own vision.

The run operated in `vision_only` mode because no dedicated validation artifact
exists for this dogfood scope.

## Accepted

- The prompt pack can proceed without validation while explicitly recording the
  validation gap.
- The output directions differ by product form and strategic hypothesis:
  handoff trust, visual discovery workflow, and audit replay.
- `D02 Prototype Discovery Flight Deck` is the best first generation direction
  because it tests the redesigned proto/tune boundary directly.
- Runtime exposure and HTML conversion remain outside this change.

## Needs Tune After Image Generation

- Strengthen first-consumer trust cues if D02 becomes too product-design
  focused.
- Preserve visible `vision_only` validation status.
- Keep `/ow:tune` as a separate source skill in the UI.
- Add stronger forbidden-output affordances if the generated image implies HTML
  or production work.

## Recommendation

`continue_to_first_image_generation`, then use `tune-prototype` for refinement.

## Follow-Up

P006 can now be considered for runtime exposure after this source-level dogfood
evidence, but it should still preserve the source/runtime boundary and avoid
generated adapter hand edits.
