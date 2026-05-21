# C013 Workflow Blueprint Reassessment

## Decision

Do not treat DTC/AC/SC as the whole OpenWorkflow workflow.

C010 and C011 completed the planning command delivery for the `/ow:change`
planning intelligence loop:

- `/ow:decompose-to-changes`
- `/ow:analyze-changes`
- `/ow:select-change`

That loop is now formally available as Codex repo-local command skills, but it
is only one part of the intended product-to-implementation workflow.

## Correct Workflow Shape

The long-term workflow remains:

```text
/ow:vision
  -> /ow:validation
  -> /ow:proto
  -> /ow:tune          # optional, repeatable
  -> /ow:proto2html    # benchmark image to high-fidelity HTML prototype
  -> /ow:html2spec     # locked HTML to SPEC artifacts
  -> /ow:build         # project-specific agent team and skills
  -> /ow:change        # DTC / AC / SC loop
  -> /ow:archive       # verify, close, and archive completed change
```

Supporting advanced commands:

```text
/ow:build-agent
/ow:build-skill
/ow:review            # async review pipeline triggered by change implementation
```

## What Is Complete

- DTC/AC/SC source behavior exists and is dogfooded.
- DTC/AC/SC are accepted as formal `/ow:*` semantic command ids.
- Codex generated surfaces exist for DTC/AC/SC.
- Runtime surface and Agent E2E checks cover the generated planning command
  delivery.

## What Is Not Complete

- `/ow:proto2html` runtime exposure remains separate and high risk.
- `/ow:html2spec` is not implemented as a runtime command or artifact contract.
- `/ow:build` does not yet create project-specific agent teams and skills from
  locked specs.
- `/ow:archive` is not yet a formal completion transaction for verified
  implementation changes.
- `/ow:review` is not yet an async review pipeline that monitors implementation
  outputs and feeds findings into the next change loop.
- `/ow:build-agent` and `/ow:build-skill` are not yet formal registry-backed
  creation commands.

## Boundary Correction

`/ow:change` should use DTC/AC/SC as its planning intelligence layer. DTC/AC/SC
must not replace `/ow:change`, `/ow:build`, or the post-change review/archive
loop.

`/ow:review` outputs should become input artifacts for the next
`/ow:analyze-changes` or `/ow:select-change` pass. Review findings are not a
parallel implementation plan; they are evidence that influences the next
candidate choice.

`/ow:archive` should be treated as a completion transaction. It should verify
SPEC consistency, review findings, validation evidence, changed files, and
artifact closure before marking a change archived.

## Recommended Next Queue

Create a new top-level planning queue for the overall workflow blueprint rather
than continuing to overload M54.

Suggested plan id:

```text
M73-workflow-blueprint-runtime-alignment
```

Suggested first candidates:

- Define the updated command taxonomy and stage graph.
- Reassess `/ow:proto2html` runtime exposure against the accepted benchmark
  image to HTML contract.
- Design `/ow:html2spec` artifacts and summary-first read model.
- Design `/ow:build` as project-specific agent team and skill creation.
- Design `/ow:review` as an async implementation review pipeline.
- Design `/ow:archive` as verified change completion transaction.
- Define `/ow:build-agent` and `/ow:build-skill` registry semantics.

## C004 Readiness Result

The original C004 runtime exposure goal is partially complete:

- complete for DTC/AC/SC Codex command delivery;
- incomplete for full OpenWorkflow runtime exposure across the intended
  product-to-implementation chain.

Therefore, do not mark the broader runtime exposure architecture as complete.
Use a new queue to align the full workflow blueprint before adding more runtime
commands.
