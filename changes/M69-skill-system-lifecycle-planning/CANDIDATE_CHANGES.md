# Candidate Changes: Skill System Lifecycle Design

Source of truth: `CANDIDATE_CHANGES.yaml`

This Markdown file is the human-readable view. If it conflicts with the YAML,
the YAML wins.

## Selection Policy

Prefer source contracts before runtime generation changes, static skill format
contracts before platform adapter expansion, validator and drift evidence for
every generated-surface change, repo-local reproducibility over global prompt
installation, and agent-readable XML-like protocol blocks for OpenWorkflow trust
boundaries.

Avoid copying OpenSpec's lightweight Markdown-only skill format wholesale,
moving Codex command exposure to global prompts, editing generated `.agents` or
`.openworkflow` surfaces directly, mixing skill lifecycle architecture with
proto2html runtime exposure, and broad multi-platform adapter work before the
format contract is stable.

Next recommended candidate: `S004`.

Feat boundary: this queue owns the top-level
`changes/M69-skill-system-lifecycle-planning/` folder. Each `S###` candidate is
expected to land as a focused commit with selection artifacts under this feat
folder.

## S001 - Document Native Skill Format And Lifecycle Contract

Status: `done`

Purpose: define OpenWorkflow's first-class skill system contract after the
OpenSpec research, including source-of-truth ownership, static skill file shape,
XML-like protocol block semantics, generated-surface rules, and non-goals.

Owned paths:

- `references/skill-system-lifecycle.md`
- `references/planning-artifact-contracts.md`
- `changes/M69-skill-system-lifecycle-planning/S001-skill-lifecycle-contract/`

Validation:

- `npm run validate`
- `git diff --check`

Selection: `S001-skill-lifecycle-contract`

Selection reason: cross-queue selection compared `M68/H003` and `M69/S001`.
`S001` is the safer next step because it creates the native skill lifecycle
contract needed before more high-risk runtime and generated-surface changes.

Completion evidence:

- `references/skill-system-lifecycle.md`
- `references/planning-artifact-contracts.md`
- `changes/M69-skill-system-lifecycle-planning/S001-skill-lifecycle-contract/SELECTED_CHANGE.yaml`
- `changes/M69-skill-system-lifecycle-planning/S001-skill-lifecycle-contract/ATOM_TASKS.yaml`
- `npm run validate`
- `git diff --check`

## S002 - Add Structured Generated Metadata To Codex Skill Output

Status: `done`

Depends on: `S001`

Purpose: make generated skill files self-identifying through structured
frontmatter metadata so doctor, sync, and tests can detect stale or mismatched
skill surfaces without relying only on comments.

Selection: `S002-generated-skill-metadata`

Completion evidence:

- `packages/adapters/codex/src/constants.ts`
- `packages/adapters/codex/src/generateSkills.ts`
- `packages/adapters/codex/src/generatedFiles.ts`
- `packages/adapters/codex/src/manifest.ts`
- `packages/adapters/codex/src/templates.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `.agents/openworkflow-adapter.yaml`
- `.agents/skills/ow-proto/SKILL.md`
- `npm run validate`
- `npm run verify:runtime-surface`
- `git diff --check`

## S003 - Introduce Skill Registry And Adapter Delivery Model

Status: `candidate`

Depends on: `S001`

Purpose: separate "which OW workflows exist" from "how they are delivered" so
future tools can install skills, commands, or both without baking Codex
assumptions into the core workflow registry.

Risk: `high`

## Operation Audit

- `OP001`: select `S001` after cross-queue comparison with `M68/H003`
- `OP002`: complete `S001`
- `OP003`: mark `S002` ready and make it next recommended
- `OP004`: select `S002`
- `OP005`: complete `S002`
- `OP006`: mark `S004` ready and make it next recommended

## S004 - Validate Generated Skill Format And Protocol Blocks

Status: `ready`

Depends on: `S001`, `S002`

Purpose: add automated checks that generated OW skills conform to the native
skill format contract, including frontmatter, generated metadata, required
XML-like protocol blocks, and forbidden malformed top-level XML wrappers.

## S005 - Add Generated-Surface Drift And Parity Tests

Status: `candidate`

Depends on: `S002`, `S004`

Purpose: detect when command registry, artifact contracts, generated skill
files, audit indexes, and adapter manifests drift apart, using an OpenSpec-style
generatedBy and parity testing approach adapted to OW.

## S006 - Design Dynamic Instruction Envelope Model

Status: `candidate`

Depends on: `S001`

Purpose: decide whether OW should add an OpenSpec-like dynamic instruction
output layer for selected artifacts while keeping static runtime skills focused
on command protocol and context boundaries.

## S007 - Prototype Multi-Adapter Skill Delivery Without Changing Runtime Semantics

Status: `candidate`

Depends on: `S003`, `S006`

Purpose: spike a narrow adapter abstraction that can render the same OW skill
contract for another local agent skill directory while preserving the current
Codex behavior and avoiding global installation.

Risk: `high`
