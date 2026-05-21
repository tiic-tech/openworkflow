# Change Analysis: M73 Workflow Blueprint Runtime Alignment

Recommendation: select `M73-workflow-blueprint-runtime-alignment / C001`.

Reason: `C001` is the lowest-risk first move. It defines the command taxonomy
and stage graph so later runtime work for `proto2html`, `html2spec`, `build`,
`review`, `archive`, `build-agent`, and `build-skill` does not drift from the
approved OW blueprint.

Scope-control review narrowed M73 to one workflow slice. The later runtime
surfaces are deferred feature refs, not rejected candidates in this queue.

High-risk stop: not required for `C001`.
