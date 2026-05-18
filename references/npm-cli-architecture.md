# npm-first CLI Architecture

OpenWorkflow should be distributed as an npm package with an `openworkflow`
binary.

Primary initialization flow:

```bash
npx openworkflow init <folder> --tools codex
openworkflow validate --root <folder>
```

## Source Of Truth

Initialized projects use `.openworkflow/` as the platform-independent source of
truth:

```txt
.openworkflow/
  workflow/
  context/
  vision/
  validation/
  prototypes/
  decisions/
  specs/
  changes/
  runtime/
```

Tool-specific folders are adapters. For Codex:

```txt
.codex/
  agents/
  skills/
  commands/
```

The adapter can be regenerated from `.openworkflow/`; it must not become the
canonical workflow state.

## Package Layout

```txt
packages/
  cli/
    src/
  core/
    src/
  adapters/
    codex/
      src/
```

`core` owns contract generation and validation. `cli` owns argument parsing and
command routing. `adapters/*` generate tool-specific surfaces.

## M04 Scope

M04 provides a minimal working CLI foundation. It does not publish to npm or
replace every existing Python prototype helper.

