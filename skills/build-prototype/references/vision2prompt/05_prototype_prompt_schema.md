# 05 Prototype Prompt Schema

Use this reference when writing the human-readable `PROTO_PROMPT_PACK.md` and
the prompt text embedded in `PROTO_PROMPT_PACK.yaml`.

## Required Prompt Structure

```text
Design a high-fidelity [platform] prototype for a product called "[Product Name]".

Product positioning:
[What the product is and what it is not.]

Target user:
[Specific user segment, context, pain, and motivation.]

Core product idea:
[Main mechanism, differentiator, and trust boundary.]

Design the following screens:

1. [Screen Name]
- Purpose: [why this screen exists]
- Components: [visible UI elements]
- State: [current and alternate states]
- Data: [concrete fields, values, example content]
- Actions: [what the user can do]
- System response: [what the product or AI does next]
- Acceptance: [what must be visible for this screen to pass]

Interaction requirements:
- [Complete flow]
- [Critical states]
- [Error, stuck, blocked, rescue, or approval behavior]

System / AI behavior requirements:
- [Behavior rules]
- [Adaptation logic]
- [Boundary rules]

Trust, privacy, and user control:
- [What is visible]
- [What is editable, deletable, optional, or blocked]
- [What cannot happen automatically]

Visual direction:
- [Product-category layout]
- [Component vocabulary]
- [Information density]
- [What to avoid]

Anti-goals:
- [Things the prototype must not imply or include]

Prototype journey:
Show the complete flow:
[Step 1] -> [Step 2] -> [Step 3] -> [Step 4]

The prototype should make the user feel:
[Desired emotional and behavioral response.]
```

## Screen Specification Rules

Each screen must specify:

- purpose
- components
- states
- actions
- system response
- example content
- acceptance criteria

## AI/System Behavior Rules

If the product involves AI, memory, personalization, recommendation, coaching,
workflow automation, or decision support, behavior must be explicit:

- The AI should...
- The AI must not...
- When the user...
- When data is stale, missing, private, or synthetic...
- Before action is executed...
- If the user is stuck, silent, blocked, or nervous...

## Concrete Content Requirement

Include examples of cards, messages, data fields, metrics, settings labels,
buttons, empty states, notifications, privacy controls, audit rows, owners,
timestamps, selected objects, and sample copy as appropriate for the domain.

## Visual Direction Rule

Visual direction must encode product strategy. Avoid vague prompts like
"modern and beautiful." Name the layout system, component vocabulary,
information density, primary canvas, and anti-generic patterns.

## Anti-Goals as Constraints

Convert non-goals into design prohibitions. If a product must not feel like a
course, chatbot, governance report, card wall, romantic companion, autonomous
approval system, or slide deck, state that directly in the prompt.
