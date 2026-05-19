# OpenWorkflow

OpenWorkflow is a contract-first workflow system for AI-assisted software
development. It initializes repository-local workflow contracts, generated Codex
repo skills, artifact templates, and validation utilities for the discovery loop
from vision through prototype tuning.

## Install

```bash
npm install -g @tiic-tech/openworkflow
```

The package installs the `openworkflow` CLI.

## Usage

```bash
openworkflow init . --tools codex
openworkflow sync --root . --tools codex
openworkflow doctor --root . --tools codex
openworkflow validate --root .
```

## Release Checks

Before publishing, run:

```bash
npm run validate
npm run verify:runtime-surface
npm run verify:e2e-workflow
npm pack --dry-run
```

`npm publish` runs the core validation gates through `prepublishOnly`; `npm pack`
rebuilds `dist` through `prepack`.
