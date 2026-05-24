---
name: proto2html
description: Reconstruct an accepted benchmark prototype image or screen group into a single-file HTML prototype with fidelity evidence. Use when the user wants the post-proto `/ow:proto2html` source behavior, benchmark-to-HTML reconstruction, screenshot comparison, or fidelity-report handoff before html2spec or production work.
---

# Proto2html

## Purpose

Reconstruct an accepted benchmark prototype image or accepted screen group into
one local single-file HTML prototype with fidelity evidence.

Proto2html is a reconstruction step. It should preserve the accepted benchmark
as faithfully as practical. It must not explore new product directions, generate
new prototype images, create specs, or start production implementation.

## Inputs

Required:

- accepted benchmark prototype image, accepted generated image set, accepted
  screen group, or accepted refined prompt output
- source prototype evidence or review notes that explain why the benchmark was
  accepted

Optional:

- `references/proto2html-artifact-contracts.md`
- `schemas/html-prototype.schema.json`
- source `PROTO_PROMPT_PACK.yaml` or `REFINED_PROTO_PROMPT_PACK.yaml`
- decision record or review evidence with accepted/rejected elements
- target viewport constraints, browser constraints, language, or accessibility
  requirements

Do not load unrelated specs, changes, runtime state, generated adapters, build
plans, or production implementation history unless the reconstruction question
explicitly depends on them.

## Output

Write artifacts under the active HTML prototype or change path chosen by the
workflow. The source artifact should match `schemas/html-prototype.schema.json`.

Expected files:

```text
HTML_PROTOTYPE.yaml
prototype.html
FIDELITY_REPORT.yaml
screenshots/
SUMMARY.yaml
```

For source-level dogfood before runtime exposure, the same evidence may live
under the selected change folder.

## Workflow

1. Resolve benchmark input. Require accepted image or screen-group evidence.
   If acceptance is missing, stop and return to `/ow:proto` or `/ow:tune`.
2. Load prompt lineage and review notes only as needed to preserve intent.
3. Define reconstruction scope: screens, states, viewport targets, include
   rules, and explicit exclusions.
4. Implement one single-file `prototype.html` focused on visual and interaction
   fidelity to the accepted benchmark.
5. Avoid production architecture: no app scaffolding, backend, persistence,
   auth, deployment config, package installs, or broad component systems.
6. Render the HTML locally when practical and capture screenshot evidence.
7. Compare screenshots to benchmark refs and write fidelity gaps.
8. Write `HTML_PROTOTYPE.yaml` and `FIDELITY_REPORT.yaml`.
9. Run repository validation when available.

## Reconstruction Rules

- Preserve benchmark information architecture, hierarchy, layout rhythm,
  component vocabulary, copy tone, states, and trust controls.
- Use static or hardcoded sample data from the benchmark unless the user
  explicitly asks for lightweight interaction.
- Implement only interactions visible or implied by the benchmark review.
- Prefer direct HTML/CSS/JS in one file for reviewability.
- Keep code readable enough for later spec extraction, but do not turn it into
  production architecture.
- Record deviations as fidelity gaps instead of silently changing the product.

## Evidence Rules

`HTML_PROTOTYPE.yaml` should capture:

- source prototype evidence and accepted decision refs
- benchmark image or screen refs
- reconstruction include/exclude scope
- `html_artifact.path`, `html_artifact.type: single_file_html`, and entrypoint
- render targets
- fidelity benchmark refs, screenshot refs, matched elements, gaps, and browser
  checks
- known limits
- result and handoff

`FIDELITY_REPORT.yaml` should be optimized for review:

- what matches the benchmark
- what differs
- severity of each gap
- whether gaps block `/ow:html2spec`
- recommended next command

## Quality Gate

Revise before finishing if:

- no accepted benchmark evidence is named
- the HTML introduces a new product direction
- key benchmark hierarchy, copy, states, trust controls, or layout are missing
- fidelity gaps are hidden or too vague to act on
- the artifact becomes a production app or spec instead of a reconstruction
- screenshots or review notes are absent when local rendering was practical

## Forbidden Defaults

- Do not generate new prototype images.
- Do not tune visual direction; return to `tune-prototype` for that.
- Do not create `TECH_SPEC`, `FRONTEND_SPEC`, `BACKEND_SPEC`, `API_SPEC`, or
  build plans.
- Do not add `/ow:proto2html` runtime command surfaces.
- Do not edit generated `.agents/` or `.openworkflow/` surfaces.
- Do not add auth, persistence, deployment, package scaffolding, or backend
  behavior.

## Handoff

Expected outcomes:

- `accepted`: hand off to `/ow:html2spec`
- `needs_reconstruction`: run another proto2html pass
- `return_to_tune`: benchmark needs visual refinement first
- `blocked`: accepted benchmark or rendering evidence is missing
