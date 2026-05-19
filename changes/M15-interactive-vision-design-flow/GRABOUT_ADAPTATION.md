# Grabout Adaptation Notes

M15 uses the local `~/.claude/skills/grabout` skill as a behavioral reference for
interactive clarification. The goal is to adapt its questioning discipline into
OpenWorkflow, not to copy its document output or broad project-planning scope.

## Principles To Reuse

- Ask one question at a time.
- Make questions progressive: each answer should influence the next question.
- Do not skip mandatory dimensions.
- When the user cannot answer, provide concrete examples or decision options.
- Treat stopping as a gated condition, not a fixed number of turns.
- Separate user-led product exploration from agent-assisted technical proposals.

## Vision Adaptation

`/ow:vision` should focus on durable product intent before validation:

- target user and beneficiary
- problem and emotional motivation
- primary product surface
- core job to be done
- non-goals and explicit exclusions
- AI-native role and boundary
- privacy, data, and sharing assumptions
- alternatives or competing mental models
- success and failure signals

The agent should persist artifacts only after a stable checkpoint, such as a
summary accepted by the user or an explicit request to capture the current state.

## Design Adaptation

`/ow:design` should focus on product behavior before specification:

- personas and usage context
- journey and key flows
- UX states and state transitions
- interaction details and feedback timing
- edge cases and recovery behavior
- responsive and accessibility expectations
- feature scope and priority
- readiness for spec handoff

The agent should keep asking until the design can support concrete specification
work, then write the design artifact as a checkpoint.

## What Not To Reuse

- Do not output `grabout_mind_record.md`.
- Do not make vision/design cover every technical architecture detail by default.
- Do not require web verification for every vision/design turn.
- Do not use "infinite" questioning literally; use mandatory coverage plus user
  confirmation as the stop gate.
