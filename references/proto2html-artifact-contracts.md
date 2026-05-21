# Proto2html Artifact Contracts

This reference defines the artifact vocabulary for `/ow:proto2html`. It is a
contract-only change: it does not add a command, source skill, generated
adapter surface, or HTML implementation.

## Purpose

`/ow:proto2html` converts an accepted benchmark prototype image or accepted
screen group into one HTML reconstruction. It is a fidelity reconstruction
step, not product exploration.

The command boundary is intentionally narrow:

- Input: accepted benchmark image evidence, source prompt lineage, and relevant
  prototype review notes.
- Output: one local HTML prototype plus structured fidelity evidence.
- Handoff: a locked HTML prototype that can later feed `/ow:html2spec`.

## Source Of Truth

The source artifact is:

```text
.openworkflow/html-prototypes/<id>/HTML_PROTOTYPE.yaml
```

Supporting evidence lives next to it:

```text
.openworkflow/html-prototypes/<id>/
  HTML_PROTOTYPE.yaml
  prototype.html
  FIDELITY_REPORT.yaml
  screenshots/
  SUMMARY.yaml
```

`HTML_PROTOTYPE.yaml` is the compact source of truth. `prototype.html`,
screenshots, and visual diffs are evidence refs, not embedded YAML content.

## Required Input

Proto2html must start from accepted prototype evidence. At least one benchmark
source is required:

- accepted benchmark image path
- accepted generated image set with selected benchmark id
- accepted baseline screen group
- accepted refined prompt pack with generated image refs

The input record must preserve:

- source prototype evidence ref
- source prompt pack ref, when available
- benchmark image or screen refs
- decision or review evidence that accepted the benchmark
- reconstruction scope
- explicit exclusions

If no accepted benchmark evidence exists, proto2html should stop and return to
`/ow:proto` or `/ow:tune`.

## HTML Output

The output contract describes one single-file HTML reconstruction:

- `html_artifact.path`: local path to `prototype.html`
- `html_artifact.type`: `single_file_html`
- `html_artifact.entrypoint`: relative path opened for review
- `render_targets`: viewport targets used for reconstruction
- `implementation_notes`: reconstruction choices that affect fidelity

The HTML artifact should be reviewable locally and should not become a
production app. Application architecture, persistence, auth, backend APIs, and
deployment config are out of scope.

## Fidelity Evidence

Fidelity evidence records how closely the HTML reconstruction matches the
accepted benchmark:

- benchmark refs
- rendered screenshot refs
- visual comparison notes
- matched elements
- fidelity gaps
- browser or rendering checks
- known limits

Fidelity gaps should be actionable and bounded. They should explain whether the
gap is acceptable for spec extraction or requires another reconstruction pass.

## Decision And Handoff

The artifact result should be one of:

- `accepted`: HTML is good enough to lock for spec extraction.
- `needs_reconstruction`: HTML needs another proto2html pass.
- `return_to_tune`: benchmark image is not stable enough.
- `blocked`: required benchmark or rendering evidence is missing.

The normal accepted handoff is `/ow:html2spec`.

## Non-Goals

- Do not explore new product directions.
- Do not generate new prototype images.
- Do not tune the visual concept; return to `/ow:tune` for that.
- Do not create engineering specs.
- Do not create production implementation tasks.
- Do not add `/ow:proto2html` runtime command or adapter surfaces from this
  contract-only change.
