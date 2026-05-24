# M64 Implementation Brief

Implement P003 by upgrading `build-prototype` with a refinement source mode.

The refined path starts from a baseline screen group or accepted prompt pack and
a tune request. It must audit baseline screens, extract the product system,
convert feedback into explicit deltas, and output a screen-bound refined prompt
pack. This keeps `/ow:proto` useful for iterative image-first work without
turning tune feedback into untraceable visual drift.

Out of scope: runtime command exposure, generated Codex adapter changes, HTML
conversion, automatic validation triggers, and production implementation work.
