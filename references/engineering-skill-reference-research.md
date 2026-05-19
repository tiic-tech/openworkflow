# Engineering Skill Reference Research

M08 studies `mattpocock/skills` as a reference for improving OpenWorkflow skill
and command design before M09 deepens the discovery loop.

Reference clone:

- Source: `https://github.com/mattpocock/skills/tree/main/skills/engineering`
- Local path: `/tmp/mattpocock-skills`
- Inspected commit: `e74f0061bb67222181640effa98c675bdb2fdaa7`

## Reference Skill Inventory

The engineering set is intentionally small and composable:

- `grill-with-docs`: one-question-at-a-time interrogation that updates domain
  glossary and ADRs when decisions crystallize.
- `prototype`: throwaway prototypes that answer one question, split into logic
  and UI branches.
- `tdd`: red-green-refactor through vertical slices, with strong warnings
  against bulk horizontal test writing.
- `diagnose`: disciplined bug loop: feedback loop, reproduce, hypothesize,
  instrument, fix, regression-test, cleanup.
- `triage`: issue state machine with explicit categories, states, and
  maintainer checkpoints.
- `to-prd`: synthesize current context into a PRD without re-interviewing.
- `to-issues`: break a PRD or plan into vertical-slice issues.
- `zoom-out`: ask for a higher-level system view when local context is not
  enough.
- `improve-codebase-architecture`: look for deepening opportunities using
  shared architectural vocabulary.
- `setup-matt-pocock-skills`: repo setup for issue tracker and domain docs.

## Distinctive Patterns

### 1. Small Skills, Strong Boundaries

Each skill has a narrow job and refuses adjacent work. `prototype` does not
become production implementation. `diagnose` does not hypothesize before it has
a feedback loop. `tdd` does not write all tests before implementation.

OpenWorkflow should adopt this boundary style for command protocols. Each
`/ow:*` command should state:

- what question it answers
- what it may read
- what it may write
- what it must not create
- which command may follow

### 2. Feedback Loops Are First-Class

The reference skills are strongest when they define the feedback loop before
work starts:

- `diagnose` requires a deterministic pass/fail loop before cause analysis.
- `tdd` requires one failing behavior test before implementation.
- `prototype` requires one explicit question and one command to run.

OpenWorkflow should encode this directly in M09. `/ow:prototype` should not be
"build a demo"; it should be "build the smallest runnable artifact that answers
the current validation question."

### 3. Progressive Disclosure

Several skills use small entrypoint files with focused supporting references:

- `prototype/SKILL.md` routes to `LOGIC.md` or `UI.md`.
- `tdd/SKILL.md` links to test, mocking, interface-design, and refactoring
  references.
- `grill-with-docs/SKILL.md` links to context and ADR formats.

OpenWorkflow should keep generated command files short, but allow each command
to point at focused protocol references. This avoids giant command files while
still giving agents precise rules when needed.

### 4. Anti-Patterns Are Explicit

The reference skills repeatedly say what not to do:

- Do not leave prototypes rotting in the repo.
- Do not write horizontal test suites.
- Do not proceed with diagnosis without a repro loop.
- Do not create ADRs unless the decision is hard to reverse, surprising, and
  trade-off driven.

OpenWorkflow should add explicit anti-pattern sections to command protocols.
This is especially important for preventing artifact drift and token bloat.

### 5. Human Checkpoints Are Concrete

The skills do not ask vague approval questions. They ask for specific
checkpoint decisions:

- Which interface should be tested?
- Which vertical slices are too coarse or too fine?
- Which architecture candidate should be explored?
- Is this issue ready for an AFK agent?

OpenWorkflow should use the same style: each `/ow:*` command should know when
to ask the user and what kind of answer is needed.

## Adopt

OpenWorkflow should adopt these patterns directly:

- one-question-at-a-time clarification for `/ow:vision`
- explicit "question being answered" for `/ow:validation` and `/ow:prototype`
- prototype branches by question type: logic/state vs UI/experience
- one command to run a prototype
- anti-pattern sections in generated command protocols
- vertical-slice thinking for later `/ow:change`
- diagnosis-style feedback-loop discipline for future bug workflows
- sparing ADR logic: record only decisions that are hard to reverse,
  surprising, and trade-off driven

## Adapt

These patterns are useful but must be adapted:

- `CONTEXT.md` should map to `.openworkflow/context/CONTEXT.md` and
  `.openworkflow/context/CONTEXT_MAP.yaml`, not become a separate root-level
  source of truth.
- ADRs can inform future decisions, but OpenWorkflow's primary durable records
  are `.openworkflow/decisions/` contracts.
- `to-prd` and `to-issues` map conceptually to `/ow:spec` and `/ow:change`,
  but M09 should not implement those yet.
- `prototype` should keep its throwaway mindset, but OpenWorkflow should still
  write durable prototype evidence under `.openworkflow/prototypes/`.
- Issue tracker states are useful for later team execution, but OpenWorkflow
  should first express state in local contracts before integrating GitHub,
  Linear, or other trackers.

## Reject For Now

OpenWorkflow should not adopt these as M09 defaults:

- GitHub issue tracker as the central planning artifact.
- Root-level `CONTEXT.md` and `docs/adr/` as mandatory structure.
- Skill-specific setup command as a prerequisite for core workflow use.
- Broad production implementation protocols before the discovery loop is
  stable.
- Copying reference skill content verbatim into generated OpenWorkflow command
  files.

## M09 Implications

M09 should deepen the discovery loop:

```txt
/ow:vision -> /ow:validation -> /ow:prototype -> /ow:decision
```

### /ow:vision

Adopt `grill-with-docs` style:

- ask one question at a time
- recommend an answer for each question
- inspect repo context when the answer can be discovered
- sharpen fuzzy language into canonical terms
- update `.openworkflow/vision/` and `.openworkflow/context/` only when the
  concept is stable
- avoid creating validation, prototype, spec, change, or runtime artifacts

### /ow:validation

Borrow the "answer one question" discipline:

- identify the core validation question
- classify features as existential, supporting, later, or out of scope
- define what evidence would prove or disprove the current product direction
- produce a prototype brief, not a production plan

### /ow:prototype

Adapt `prototype` directly:

- choose a branch based on the validation question:
  - logic/state prototype
  - UI/experience prototype
- make the prototype obviously throwaway
- provide one command or URL to run it
- surface the relevant state or variants
- write durable evidence and result artifacts under `.openworkflow/prototypes/`
- forbid spec, change, team, persistence, and production hardening

### /ow:decision

Combine prototype cleanup and ADR selectivity:

- record what the prototype answered
- choose `continue`, `pivot`, `stop`, or `needs_more_evidence`
- keep only the decision-rich evidence
- only authorize `/ow:spec` when the prototype evidence supports continuation
- archive or mark throwaway prototype artifacts instead of letting them rot

## Key Design Rule

OpenWorkflow should learn from the reference repo's engineering discipline, but
keep its own core contract:

> Commands may be small and composable, but durable truth lives in
> `.openworkflow/`, not in chat memory, issue comments, or tool-specific files.
