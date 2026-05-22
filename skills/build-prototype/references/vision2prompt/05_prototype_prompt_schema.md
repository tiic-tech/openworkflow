# 05 Prototype Prompt Schema

Use this reference when writing the human-readable `PROTO_PROMPT_PACK.md` and
the prompt text embedded in `PROTO_PROMPT_PACK.yaml`.

## Dailin Workflow Mapping

This file is the OW-owned equivalent of dailin
`vision_to_strategic_prototype_prompt/reference/04_prototype_prompt_schema.md`.
It maps dailin Step 5, "Write Each Prototype Prompt", into the concrete text
requirements for `directions[].prototype_prompt` and
`screen_prompts[].prompt`.

The dailin `OUTPUT_PROMPT.md` examples are the minimum paragraph quality bar.
They are not examples of length for its own sake; they are complete
prototype-generation briefs with positioning, user context, required screens,
journey, interaction behavior, system response, trust controls, visual
direction, anti-goals, and desired user feeling. OW prompt text must meet or
exceed that level before it can be treated as image-generation-ready.

Prompt text must also carry a senior product-manager point of view. The
paragraph should not merely enumerate UI. It should express the product thesis,
why the chosen form deserves to exist, how the user should transform, and what
design philosophy governs the prototype.

## Required Prompt Structure

```text
Design a high-fidelity [platform] prototype for a product called "[Product Name]".

Product positioning:
[What the product is and what it is not.]

Target user:
[Specific user segment, context, pain, and motivation.]

Core product idea:
[Main mechanism, differentiator, and trust boundary.]

Product thesis and reason-to-exist:
[Why this product form should exist, what it tests, and why it is not a
generic dashboard, chatbot, card wall, report screen, or visual skin unless
that form is strategically necessary.]

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

## Long-Form Prompt Paragraph Anatomy

Each direction-level `prototype_prompt` must read like a complete
high-fidelity prototype brief, not a caption for one image. It must include, in
natural prompt text or clearly equivalent structured sections:

- product name and product positioning, including what the product is not;
- target user, usage context, pain, motivation, and behavior change;
- core product idea, mechanism, differentiator, and trust boundary;
- product thesis, reason-to-exist, and target user transformation;
- required screen group with journey stages, not unrelated screenshots;
- interaction requirements, including user actions and critical state changes;
- system, AI, workflow, or automation response after meaningful user actions;
- concrete example copy, data, metrics, objects, labels, owners, timestamps, or
  messages appropriate to the domain;
- trust, privacy, safety, approval, memory, or user-control surfaces when
  relevant;
- visual direction tied to product category, primary canvas, component
  vocabulary, density, and anti-generic patterns;
- anti-goals converted into explicit prohibitions;
- prototype journey and the intended user feeling or behavioral reaction.

Each screen-level `screen_prompts[].prompt` must be standalone enough for an
image-generation agent to create that screen without reading chat history. It
may inherit from the direction, but it still must name the journey stage, user
goal, system state, selected object when relevant, required components, example
content, primary actions, system response, trust controls, negative prompt
relationship, and acceptance criteria.

The old M99-style screen-state prompt is insufficient:

```text
Show the same map shell with the incident detail panel open.
```

A dailin-grade screen prompt instead explains why the screen exists, what the
operator or user is trying to do, what data and controls are visible, what the
system does next, what must not be implied, and what feeling or behavior the
image should create.

The prompt should also be opinionated enough that another agent understands why
this prototype is worth generating. If the paragraph can be moved to a
different product by swapping names and labels, it has not carried the
co-founder/senior-PM engine forward.

## Screen Specification Rules

Each screen must specify:

- purpose
- components
- states
- actions
- system response
- example content
- acceptance criteria

The screen prompt should bind these fields into image-generation text. Merely
having the fields elsewhere in YAML is not enough when the prompt paragraph
itself remains terse.

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

When the obvious default would be a dashboard, chatbot, card wall, report page,
or SaaS shell, state whether that default is strategically correct. If it is
not, name the alternative product form and why it better serves the user
transformation.

## Anti-Goals as Constraints

Convert non-goals into design prohibitions. If a product must not feel like a
course, chatbot, governance report, card wall, romantic companion, autonomous
approval system, or slide deck, state that directly in the prompt.
