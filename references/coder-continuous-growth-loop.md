# Coder Continuous Growth Loop

This reference defines when implementation lessons discovered under internal
coder governance can become durable OW source policy.

## Promotion Criteria

A lesson can be promoted only when it is:

- repeated across more than one implementation, validation, or review episode
- high leverage for future low-context Agents
- backed by auditable evidence such as a selected-change artifact, verifier
  failure, GREEN validation result, review finding, or local commit evidence
- narrow enough to live in an existing source owner without creating a second
  source of truth

Do not promote one-off preferences, temporary workarounds, unsupported memory
notes, or lessons whose evidence cannot be inspected from repo artifacts.

## Evidence Requirements

Every promoted lesson must name:

- the source event or selected change where it was observed
- the failure mode it prevents
- the source owner that should carry the policy
- the validation command or review evidence that proves the policy is useful
- the expected generated surfaces, if any, after sync

Implementation evidence can live in `LOCAL_COMMIT_EVIDENCE.yaml`,
`ATOM_TASKS.yaml`, `IMPLEMENTATION_BRIEF.md`, runtime checkpoints, or a focused
reference update. A future `CODER_EVIDENCE.yaml` may become a binding point only
after a later candidate defines that contract.

## Promotion Targets

Use the smallest durable owner:

- coder behavior and validation ladder: `skills/coder/SKILL.md`
- source-of-truth architecture rules: `references/`
- generated command behavior: `packages/core/src/commands/registry.ts`, then
  `node dist/cli/src/index.js sync --root . --tools codex --json`
- adapter rendering behavior: adapter source or templates, then sync
- verifier expectations: `packages/cli/src/dev/verifyRuntimeSurface.ts`

Generated `.agents/**` and `.openworkflow/**` files are evidence of sync
results, not the durable source owner.

## Boundary With Future Project Memory

Coder policy is not project personality, product memory, or autonomous memory.
Do not write project-local `SOUL.md`, `MEMORY.md`, or free-form durable memory
from coder governance.

Future project memory work must define separate rules for consent, privacy,
retention, pruning, conflict resolution, and promotion from transient notes into
governed source policy.

## Review Gate

Before committing a promoted lesson, verify:

- the lesson is phrased as an actionable rule, not a vague preference
- the rule has one source owner
- generated surfaces are updated only through source-driven sync
- validation evidence is recorded in the selected change or commit evidence
- the policy does not create a new hard gate unless the selected candidate
  explicitly owns enforcement
