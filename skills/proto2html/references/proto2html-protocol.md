# Proto2html Protocol

Use this reference when converting accepted benchmark prototype evidence into a
single-file HTML reconstruction.

## Input Resolution

Require one accepted benchmark source:

- accepted benchmark image path
- accepted generated image set with selected benchmark id
- accepted screen group
- accepted refined prompt pack with generated image refs

Also capture:

- source prototype evidence ref
- prompt pack ref when available
- decision or review evidence that accepted the benchmark
- include and exclude reconstruction scope
- viewport targets

If acceptance is unclear, stop. Do not infer acceptance from the mere existence
of images or prompts.

## Reconstruction Scope

Before writing HTML, state:

- screens and states to reconstruct
- viewport targets
- interaction states that matter for fidelity
- benchmark elements that must be preserved
- elements explicitly excluded
- assumptions caused by missing evidence

Scope should be smaller than a product app. It should be enough to reconstruct
the accepted benchmark for review and later spec extraction.

## Single-File HTML Rules

Prefer one `prototype.html` with inline CSS and small inline JavaScript only
when needed for benchmark-visible interaction states.

Allowed:

- static hardcoded content
- local image refs
- CSS responsive rules for named render targets
- minimal JS for visible states, toggles, tabs, or prototype-only transitions

Avoid:

- package managers
- framework scaffolds
- backend or API calls
- persistence
- auth
- deployment files
- production component architecture

## Fidelity Report

Capture fidelity evidence in a compact YAML report:

```yaml
schema_version: 0.1.0
artifact_type: fidelity_report
benchmark_refs: []
screenshot_refs: []
matched_elements: []
gaps:
  - gap_id: FID001
    severity: low|medium|high|blocking
    description: ""
    disposition: accept|repair|return_to_tune
browser_checks: []
known_limits: []
recommendation: accepted|needs_reconstruction|return_to_tune|blocked
```

Gaps should be concrete enough for the next agent to repair or accept without
re-reading all raw evidence.

## HTML Prototype Artifact

`HTML_PROTOTYPE.yaml` should follow
`schemas/html-prototype.schema.json` and include:

- `artifact_type: html_prototype`
- `source_prototype`
- `benchmark`
- `reconstruction_scope`
- `html_artifact`
- `render_targets`
- `fidelity`
- `known_limits`
- `result`
- `handoff.next_command`

Use `result: accepted` only when fidelity gaps do not block spec extraction.
The normal accepted handoff is `/ow:html2spec`.

## Quality Gate

Revise before finishing if:

- benchmark evidence is not explicitly accepted
- HTML output is not single-file
- visual hierarchy diverges from the benchmark without a recorded reason
- important benchmark copy or trust controls are missing
- viewport targets are undefined
- screenshot or browser evidence is missing when rendering was practical
- fidelity gaps are absent, generic, or unactionable
- output drifts into engineering spec or production implementation
