# Prototype Discovery Protocol

Use this reference when creating or executing prototypes.

## Prototype Is Not Production

A prototype answers one validation question. It should not become a hidden
production implementation plan.

Allowed shortcuts:

- hardcoded sample data
- single HTML files
- local-only assets
- mocked LLM output
- fake persistence in memory
- narrow UI paths

Avoid by default:

- production database schemas
- authentication
- deployment setup
- full component architecture
- complete API design
- broad test matrices
- team runtime state

## Prototype Todo Shape

Todos should map directly to the validation include scope. Keep each item
experience-facing when possible:

```txt
create interactive globe
place sample flags
show hover thumbnails
open detail panel
verify user can answer the core question
```

Do not turn prototype todos into a full backlog.

## Evidence

Evidence can be lightweight:

- local URL or file path
- screenshot path
- user feedback summary
- known constraints
- decision recommendation

Evidence should be enough for `/ow:decision` to record continue, pivot,
stop, or needs_more_evidence.

