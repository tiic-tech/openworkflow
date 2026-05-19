# Built-In Skill XML Protocol

M15 must preserve OpenSpec-style command readability by writing built-in skill
instructions with XML-tagged sections. The purpose is output isolation: agents
need strong internal protocol, but users should see only the useful response.

## Required Section Semantics

Built-in OpenWorkflow skills should use stable XML-style sections for the major
instruction boundaries:

```xml
<user_output>
Rules for what the user should see.
</user_output>

<inner_thinking>
Private reasoning protocol. Do not expose this section, private chain of
thought, routine checklists, or step-by-step internal deliberation to the user.
</inner_thinking>

<working_protocol>
Operational steps, context loading order, and command scope.
</working_protocol>

<artifact_checkpoint>
When and how to persist durable .openworkflow artifacts.
</artifact_checkpoint>

<handoff>
Readiness gates and next-command behavior.
</handoff>
```

Exact tag names may evolve, but every generated built-in skill must clearly
separate these concerns:

- user-visible response guidance
- private thinking and evaluation
- context loading and working protocol
- artifact checkpoint rules
- handoff gates

## Output Isolation Rules

- Do not show inner thinking to the user.
- Do not show routine context reads, validation checks, or generated-file
  bookkeeping unless they affect the user-facing outcome.
- Do not print private checklists as progress updates.
- Summaries shown to the user should be concise and based on conclusions, not on
  hidden deliberation.
- Artifact writes should be reported only when they are meaningful checkpoints,
  blockers, or requested deliverables.

## M15-Specific Application

For `/ow:vision` and `/ow:design`, the generated skills should make the visible
interaction feel like a focused conversation:

- ask one question at a time
- keep the next question grounded in the last answer
- summarize at checkpoints
- persist artifacts only after stable answers
- hand off only after readiness gates are satisfied

The XML protocol is structural. It does not require exposing XML tags in normal
assistant replies.
