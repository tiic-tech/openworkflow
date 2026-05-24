# OpenWorkflow Strategic Prototype Prompt Pack

Source mode: `vision_only`

Validation note: no dedicated `VALIDATION.yaml` or `PROTOTYPE_BRIEF.md` was
present for this dogfood run. The pack proceeds from `build_system_vision.md`
and `docs/OW_DEVELOP_PLAN.md`; validation is not treated as completed.

## Strategic Core

OpenWorkflow is a repo-local workflow control plane for AI coding agents and
human developers. It turns ambiguous intent into bounded, auditable workflow
steps through contracts, handoff JSON, artifact lineage, command guidance, and
non-destructive recovery.

Central uncertainty: which visual product form best communicates trust, next
action, and audit continuity to an AI agent as first consumer while remaining
legible to the human developer?

## Directions

### D01: Agent Handoff Command Center

Hypothesis: a compact handoff command center can reduce orientation cost by
showing trusted facts, blockers, forbidden surfaces, and the next action at
once.

Validates: agent-first trust, next-command clarity, and recovery confidence.

Main risk: it may look like a static status dashboard instead of an active
workflow control plane.

### D02: Prototype Discovery Flight Deck

Hypothesis: a visual pipeline from vision to proto, tune, decision, and change
can keep image-first exploration separate from implementation because every
artifact handoff and boundary is visible before code begins.

Validates: the redesigned `/ow:proto -> /ow:tune -> decision -> change`
workflow and whether visual exploration feels operational rather than
decorative.

Main risk: it may feel too product-design focused and underemphasize agent
trust/recovery guarantees.

### D03: Contract Ledger Replay

Hypothesis: an operation ledger with artifact lineage and recovery checkpoints
can help agents recover from context loss because every state transition is
queryable by stable id.

Validates: queue maintenance, operation logs, artifact lineage, replay, and
non-destructive recovery semantics.

Main risk: it may over-index on audit history and underrepresent the actual
next-action workflow.

## Recommendation

Generate `D02 Prototype Discovery Flight Deck` first.

Reason: D02 directly tests the redesigned image-first proto/tune workflow. It
makes the `build-prototype` and `tune-prototype` boundary visible, includes
prompt lineage and evidence, and avoids drifting into runtime or HTML work.

## Prompt

Create a high-fidelity desktop web app screen group for OpenWorkflow's
redesigned visual discovery workflow.

Product positioning: "A repo-local control plane that turns product vision into
auditable prototype evidence before implementation starts."

Target user: a human founder/developer and an AI coding agent co-developing a
product through `/ow:vision`, `/ow:proto`, `/ow:tune`, `/ow:decision`,
`/ow:html2spec`, `/ow:build`, and `/ow:change`.

Required screens:

- Discovery Pipeline Map: a left-to-right workflow from Vision to Proto to Tune
  to Decision to Spec/Build/Change. Each stage shows status, source artifacts,
  allowed outputs, forbidden outputs, and next command.
- Proto Prompt Pack Workspace: three strategic prototype directions with
  hypothesis, validation target, main risk, prompt preview, and first-generation
  recommendation.
- Tune Boundary Workspace: accepted baseline direction, tune request area,
  `MUST_INHERIT`, `MUST_ADD`, `MUST_REMOVE`, `FLEXIBLE_CHANGE` panels, screen
  manifest preview, and handoff to `tune-prototype`.
- Decision Evidence Ledger: accepted elements, rejected elements, tune
  requests, recommendation, linked candidate ids, and the rule "no HTML until
  benchmark image is accepted."

Anti-goals: do not show HTML editing, CSS repair, deployment, auth, billing,
social collaboration, generic Kanban boards, or completed validation artifacts.

## Next Step

After baseline images exist, use `tune-prototype` to create
`REFINED_PROTO_PROMPT_PACK` from the accepted screens and user feedback.
