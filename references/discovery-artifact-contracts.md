# Discovery Artifact Contracts

M10 defines the artifact layer consumed by the audit-first discovery loop. The
artifact layer must answer one question:

> What is the smallest durable state an agent needs to continue accurately?

## Format Responsibilities

- YAML is the source of truth. Agents load YAML first because it is structured,
  diffable, compact, and validateable.
- Markdown is a short human audit note. It explains why a state changed, but it
  must not be the only source of a decision.
- HTML is an optional generated review surface. It is useful for humans when
  comparing evidence, screenshots, and diagrams, but it must be generated from
  YAML or evidence manifests and should not be loaded by default by agents.
- Raw evidence is referenced by path or URL from YAML. Screenshots, logs,
  recordings, prototype URLs, and browser notes stay outside the source-of-truth
  contract.

## Progressive Disclosure

Agents should load context in this order:

1. Level 0: workflow and audit indexes.
2. Level 1: command context packet and artifact contract registry.
3. Level 2: the current stage YAML artifact named by the index.
4. Level 3: short Markdown note when the YAML does not explain intent enough.
5. Level 4: generated HTML and raw evidence only for human review or evidence
   inspection.

The first two levels must be enough to know what not to load.

## Discovery Artifact Types

### vision_session

Produced by `/ow:vision`.

Source of truth path:
`.openworkflow/vision/sessions/<id>/VISION_SESSION.yaml`

Purpose:
Capture one focused vision clarification session without turning it into a
feature ranking or prototype task list.

Required facts:

- current question
- stable answers
- unresolved questions
- vision delta
- handoff readiness

### validation_target

Produced by `/ow:validation`.

Source of truth path:
`.openworkflow/validation/<id>/VALIDATION.yaml`

Purpose:
Name the highest-leverage thing to validate first and explain why it is
existential, supporting, later, or out of scope.

Required facts:

- core question
- feature classification
- critical assumptions
- prototype scope
- acceptance criteria
- decision options

### prototype_evidence

Produced by `/ow:proto`.

Source of truth path:
`.openworkflow/prototypes/<id>/EVIDENCE.yaml`

Purpose:
Record the prototype mode, reference analysis, static concept direction,
runnable implementation, verification evidence, self-critique, and what remains
unknown.

Required facts:

- validation target
- core question
- prototype mode
- reference analysis
- visual direction
- static concept evidence
- prototype artifact
- run command or URL
- implementation evidence
- observations
- evidence references
- verification
- self-critique
- known limits
- result status

### decision_record

Produced by `/ow:decision`.

Source of truth path:
`.openworkflow/decisions/<id>/DECISION.yaml`

Purpose:
Record the user-reviewed outcome of the prototype loop and the authorized next
command.

Required facts:

- reviewed evidence
- outcome
- rationale
- accepted scope
- rejected scope
- next command
- follow-up questions

## First-Consumer Rules

As an agent, I want every artifact to be readable in under one screen before I
open any evidence. To make that possible:

- Use stable identifiers and paths.
- Put the current decision state near the top.
- Keep narrative in Markdown notes, not YAML fields.
- Reference evidence instead of embedding it.
- Record what is forbidden or deferred so later agents do not reopen scope.
- Include a handoff field that names the next command.
