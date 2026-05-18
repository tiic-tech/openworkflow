---
name: build-prototype
description: Turn a validation artifact into a focused prototype discovery plan and todo list. Use when the user wants to build the smallest local prototype for a core assumption before creating specs, changes, Agent Teams, runtime state, or production implementation plans.
---

# Build Prototype

## Purpose

Create and execute the prototype discovery loop for one validation target. This
skill turns `VALIDATION.yaml` and `PROTOTYPE_BRIEF.md` into a constrained
prototype plan and todo contract.

Prototype work is not production work. It should answer the validation
question quickly, often with hardcoded data, a single HTML file, or a small
local demo.

## Inputs

Required:

- `.codex/validation/<validation_id>/VALIDATION.yaml`
- `.codex/validation/<validation_id>/PROTOTYPE_BRIEF.md`

Optional:

- `.codex/context/CONTEXT_MAP.yaml`
- `.codex/vision/VISION_CONTRACT.yaml`
- direct user constraints about the prototype medium or acceptance bar

Do not load unrelated specs, changes, runtime state, reviews, archives, or
implementation history unless the validation question explicitly depends on
them.

## Output

Write prototype artifacts under:

```txt
.codex/prototypes/<prototype_id>/
  PROTOTYPE_PLAN.md
  TODO.yaml
  RESULT.md
  EVIDENCE.md
  artifact/
  archive/
```

`TODO.yaml` is the machine-readable prototype contract. `PROTOTYPE_PLAN.md` is
the human-readable execution plan. `RESULT.md` and `EVIDENCE.md` are updated
after local review or user feedback.

## Workflow

1. Load the validation contract and prototype brief.
2. Keep the core question unchanged.
3. Convert prototype `include` scope into a short todo list.
4. Preserve `exclude` scope as hard boundaries.
5. Prefer the smallest artifact that a user can experience locally.
6. Initialize artifacts with `scripts/init_prototype.py`.
7. Implement the prototype directly when the user asks for execution and the
   scope remains small enough for the main agent.
8. Use subagents only for narrow parallel work; prototype orchestration does not
   require `build-team`.
9. Record what was tested in `EVIDENCE.md` and the user-facing outcome in
   `RESULT.md`.

## Forbidden Defaults

- Do not create `SPEC.yaml`, `CHANGE.yaml`, `.codex/runtime/`, or Agent Team
  artifacts from this skill.
- Do not add auth, persistence, deployment, billing, admin, upload, or full AI
  integration unless the validation contract names that as the core assumption.
- Do not expand the prototype to cover later features.
- Do not treat code completeness as validation success; success means the core
  question can be answered.

## Handoff

After user review, hand off to `/build-decision`.

Expected decision outcomes:

- `continue`: prototype is strong enough to become a focused production slice
- `pivot`: adjust the vision or validation target
- `stop`: archive or clean the prototype path
- `needs_more_evidence`: revise the prototype scope and test again

