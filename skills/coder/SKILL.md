---
name: coder
description: Internal Agent-only code execution governance for OpenWorkflow source edits. Use as the source skill for future internal /ow:coder protocol work, not as a user-facing coding command.
---

# Coder

## Purpose

`coder` is the repo-owned source skill for OpenWorkflow's internal code quality
governance protocol. It turns source-edit work into a governed engineering
loop: recover trust, map ownership, produce RED/GREEN evidence when applicable,
self-check the diff, choose an honest validation ladder, and bind evidence back
to the current selected change or run.

This is not a generated runtime surface and not a public workflow command. The
semantic command boundary is defined in `references/internal-coder-protocol.md`.

## Boundary

Internal only:

- Agent-only engineering quality protocol
- source-edit preflight
- RED/GREEN evidence discipline
- post-write self-check
- validation ladder selection
- evidence binding and quality lesson promotion

Not owned here:

- user-facing "write code" behavior
- `/ow:change` selected-change planning
- `/ow:team` runtime orchestration
- command registry exposure
- generated `.agents/**` output
- mandatory `CODER_EVIDENCE.yaml`
- public CLI JSON changes

## Read First

- `references/internal-coder-protocol.md`
- `references/validation-trust-domains.md`
- `references/skill-system-lifecycle.md`
- `references/git-version-control-governance.md`

Use the system-level `ow-code-quality-governor` material only as migration
source and benchmark context. Durable OW behavior should live in this repo.

## Trust Recovery

Before source edits, establish the current trust surface with the repo-local
CLI:

```bash
node dist/cli/src/index.js resume --root . --json
node dist/cli/src/index.js handoff --root . --json
node dist/cli/src/index.js inspect --root . --strict --json
git status --short --branch
```

Use `resume` first after interruption, context loss, network failure, or
unexpected termination. Use `handoff` and `inspect --strict` as trust gates, not
as release-readiness proof.

## Owner Map

Before non-trivial edits, identify the source owner and the derived surfaces.

Owner map:

- command behavior: `packages/core/src/commands/registry.ts` or the matching
  CLI command module
- artifact shape: artifact registry, schema, validator, and summary policy
- generated Codex surfaces: source registry or adapter template followed by
  `sync`
- summary and handoff trust: `packages/core/src/workflow/summaryHealth.ts`
- planning queue state: `changes/<plan_id>/CANDIDATE_CHANGES.yaml`
- git evidence: selected-change `LOCAL_COMMIT_EVIDENCE.yaml`
- docs or source skills: repo-owned `references/` and `skills/`

If the same rule appears in two owners, either collapse the duplication or
record the temporary compatibility boundary in the selected change.

## File Map

For changes touching more than one concern, name the intended file set before
editing:

- core model or helper files for source truth
- CLI files for command/report wiring only
- adapter files for generated formatting only
- dev verifier or fixture files for structural checks
- planning artifacts for queue status and evidence

Do not patch generated `.agents/**` as the durable fix. Change the source owner
and regenerate through the repo-local CLI when generated surfaces are in scope.

## RED Evidence

For behavior, validator, CLI report, generated-surface, path-safety, summary,
queue, or git-evidence changes, prefer RED evidence before production edits.

Valid RED evidence:

- failing parsed JSON or YAML assertion
- failing valid or invalid fixture
- failing generated-surface parity check
- failing summary, handoff, or resume health assertion
- targeted compile or runtime verifier failure

RED can be marked not applicable for docs-only contract work, mechanical
renames, or exploratory spikes. In those cases, use the nearest structural
check and record why RED is not useful.

## GREEN Evidence

After edits, rerun the RED evidence or nearest equivalent. Then run the rest of
the validation ladder that matches the touched trust domain.

Do not treat `npm run build` alone as validation. Do not hide existing broad
repo failures; classify them as active-change failures, historical archive
debt, fixture debt, or release-readiness debt.

## Post-Write Self-Check

Before final validation, inspect the diff for:

- accidental second source of truth
- hidden dependency or broad scan
- generated-surface edits without source changes
- oversized files gaining a new unrelated concern
- comments that explain what instead of why
- validation that does not match the touched trust domain
- queue completion without selected-change commit evidence when implementation
  files changed

Fix any issue immediately or record it as explicit residual quality debt tied
to a follow-up candidate.

## Validation Ladder

Use the narrowest honest ladder:

- docs or planning contract: YAML parse when relevant, `handoff`, `inspect
  --strict`, `resume`, and `git diff --check`
- source skill or generated protocol: `npm run build`, `sync --root . --tools
  codex --json`, generated diff review, `inspect --strict`, and `git diff
  --check`
- command registry or generated runtime surface: build, sync, runtime-surface
  verifier, and generated diff review
- artifact/schema/validator: build, validate, and targeted valid/invalid
  fixtures
- recovery or summary trust: handoff, inspect, summaries, resume, and targeted
  fixture or command packet
- git evidence: git-automation preview/write plus strict read-model commands

## Evidence Binding

Bind implementation evidence to the current OW selected change:

- `SELECTED_CHANGE.yaml` owns scope, acceptance, owned paths, forbidden paths,
  and expected validation.
- `ATOM_TASKS.yaml` owns task status and verification results.
- `IMPLEMENTATION_BRIEF.md` owns the handoff for the next implementation Agent.
- `LOCAL_COMMIT_EVIDENCE.yaml` records local commit hashes and validation
  evidence when implementation files changed.
- Optional `LOCAL_COMMIT_EVIDENCE.yaml.coder_evidence` records coder preflight,
  RED/GREEN, self-check, validation ladder, and lessons when those details are
  useful. Missing `coder_evidence` is valid; malformed present evidence is not.

Do not batch multiple completed selected changes into one checkpoint commit.
Remote push, PR creation, Issue mutation, and merge require separate explicit
approval.

## Continuous Growth Loop

Promote a quality lesson into source policy only when it is repeated,
high-leverage, and backed by implementation or validation evidence.

Use `references/coder-continuous-growth-loop.md` as the source policy for
promotion criteria, evidence requirements, and boundaries. Session notes,
unreviewed memories, or one-off fixes are not enough to change durable coder
policy by themselves.

Promotion targets:

- role or stance: this skill
- source-of-truth or architecture rule: `references/`
- validation ladder or evidence rule: this skill plus the relevant reference
- generated-surface behavior: command registry or adapter source, then sync

Do not write project-local SOUL or MEMORY artifacts from this skill. Future
project memory promotion needs its own governed persistence and pruning rules.

## Handoff

When coder governance is satisfied, report:

- source truth changed
- generated surfaces refreshed or intentionally untouched
- validation commands run
- commit evidence path when implementation files changed
- residual quality debt and next candidate, if any
