# /ow:vision Agent-First Audit

## Finding

`/ow:vision` already has a strong conversation-first protocol, but its compact
handoff quality was too easy to over-trust. Summary quality checked only that
`vision_delta` was non-empty, so a session with one partial field could appear
usable even when it lacked the details a downstream Agent needs.

The generated skill also lacked an explicit first-consumer review section. It
described how to conduct the conversation, but did not directly require the
Agent to shape the artifact as a compact development instrument for the next
Agent.

## Fix Direction

- Add an `agent_first_consumer` protocol section to `/ow:vision`.
- Expand the default `vision_delta` template with problem, AI-native role,
  success signals, and failure signals.
- Add handoff blockers and readiness notes to the vision template.
- Make summary quality inspect nested `vision_delta` fields instead of treating
  the whole object as one sufficient field.
- Update workflow/runtime verification so the generated `ow-vision` surface
  keeps this guidance.
