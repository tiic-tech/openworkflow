---
name: build-workflow
description: Initialize or reconcile OpenWorkflow repo-local contract infrastructure. Use when the user invokes /build-workflow CONTENT or asks Codex to set up workflow indexes, contract graph files, context, vision, decision, spec, and change folders before build-team or run-team execution.
---

# Build Workflow

## Purpose

Create the upstream OpenWorkflow contract foundation for a repository. This
skill initializes durable files that later skills can consume instead of relying
on chat history.

It owns workflow infrastructure only:

- `.codex/workflow/WORKFLOW_INDEX.yaml`
- `.codex/workflow/CONTRACT_GRAPH.yaml`
- `.codex/context/`
- `.codex/vision/`
- `.codex/decisions/`
- `.codex/spec/`
- `.codex/validation/`
- `.codex/changes/`

It must not initialize `.codex/runtime/`; runtime remains owned by `build-team`
and `run-team`.

## Required Scan

Before writing, inspect:

```bash
pwd
git status --short
rg --files -g '!node_modules' -g '!dist' -g '!build' -g '!coverage'
```

Read the likely source artifacts:

- `AGENT.md`
- `README*`
- `build_system_vision.md`
- `docs/**`
- existing `.codex/workflow/**`, `.codex/context/**`, `.codex/vision/**`,
  `.codex/decisions/**`, `.codex/spec/**`, and `.codex/changes/**`

## Workflow

1. Infer a project title from the repo or user content.
2. Load `references/workflow-layout.md`.
3. Run `scripts/init_workflow.py` from the repo root, or from the installed
   skill path when the script is not repo-local.
4. Preserve existing contract files unless the user explicitly asks to
   regenerate them.
5. Validate with the repository validator when available:

```bash
python3 scripts/validate_openworkflow.py --root .
```

## Handoff

After `/build-workflow`, the next upstream skills may create context, vision,
decision, spec, change, and work item contracts. `build-team` should consume the
change and work item contracts when they exist.
