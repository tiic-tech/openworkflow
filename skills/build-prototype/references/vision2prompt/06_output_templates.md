# 06 Output Templates

Use these shapes when writing `PROTO_PROMPT_PACK.md`. The YAML source artifact
should carry the same content structurally.

## Strategic Prompt Pack View

```text
# [N] Strategic Prototype Directions

These directions are not the same product with different styling. They test
different product hypotheses and validation risks.

## Direction Map

| Direction | Strategic Hypothesis | Validates | Main Risk |
| --- | --- | --- | --- |
| D1 | ... | ... | ... |
| D2 | ... | ... | ... |

## Global Product System

- Product thesis:
- Target user:
- Current alternative:
- Primary loop:
- Product experience model:
- Trust and privacy boundaries:
- Anti-goals:

## Direction D1: [Name]

### Strategic Hypothesis

...

### What This Validates

...

### Prototype Brief

```text
[Full high-fidelity prototype prompt]
```

### Screen Manifest

| Screen | Journey Stage | User Goal | System State | Required Data | Primary Actions |
| --- | --- | --- | --- | --- | --- |

### Screen Prompts

#### D1-S1: [Screen name]

```text
[Standalone screen prompt]
```

Negative prompt:
[What this screen must not show]

Acceptance:
- ...

### PM Judgment

...

## Build Recommendation

- First direction:
- Why first:
- Success signals:
- Failure signals:
- Next test if it works:
```

## Compact View

Use only when output budget is tight. Keep the full YAML source complete.

```text
# Strategic Prototype Prompts

## D1: [Name]
Hypothesis: ...
Prompt: ...
Acceptance: ...

## D2: [Name]
...

Recommendation: ...
```

## Tool Adaptation

- Figma or image tools: emphasize screens, layout, components, state, visual
  direction, and acceptance criteria.
- v0 or frontend generators: include responsive layout, component hierarchy,
  route assumptions, stateful examples, and realistic sample data.
- App builders: include user flows, data objects, persistence assumptions,
  settings, and simple backend expectations.
- Human designers: include rationale, design principles, user emotions,
  research questions, and validation plan.

## Source Parity Rule

`PROTO_PROMPT_PACK.md` is a readable view. `PROTO_PROMPT_PACK.yaml` remains the
source of truth. If the Markdown contains richer direction, screen, state,
copy, or acceptance content than YAML, the prompt pack is incomplete.
