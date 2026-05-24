# Discovery Loop Upgrade Plan

Status: planning source
Date: 2026-05-22

Note: the filename keeps the requested spelling `DISCOVER_LOOP_UPGRATE_PLAN.md`.
This document uses "Discovery Loop Upgrade" for the concept.

## Why This Plan Exists

OpenWorkflow's discovery loop currently has the right safety instincts but the
wrong interaction rhythm for human-intensive product discovery.

The current `/ow:vision` behavior is too eager to persist artifacts. In real use
it can write `.openworkflow/vision/**` after each answer, forcing the user to
wait for file edits and review before the next question. That protects audit
evidence, but it breaks the core product discovery experience: thinking,
answering, being challenged, and following a line of inquiry without losing
flow.

The second failure is depth. A vision command can satisfy the current artifact
shape after a small number of questions, then write `VISION.md` before the
product intent has been stress-tested. That is operationally dangerous because
vision quality controls everything downstream. If the vision is wrong or thin,
validation, prototype prompts, generated prototypes, tuning, specs, and build
work all become expensive execution against weak intent.

The Discovery Loop should therefore treat vision as the highest-leverage stage:
the place where OW acts as product partner, requirements interrogator, and
intent compiler.

## Product Principle

Vision quality is upstream leverage.

`VISION.md` should not be considered acceptable merely because it is readable,
structured, or complete enough for a schema. It is acceptable only when it gives
downstream workflow commands enough product intelligence to act without
inventing strategy.

The primary downstream consumer of vision is `/ow:proto`. Therefore one core
acceptance test for `VISION.md` is:

> Can `/ow:proto` use this vision to produce extremely high-quality prototype
> prompts without inventing the core product strategy?

This makes vision a source artifact for prototype prompt quality.

## Role Model For /ow:vision

`/ow:vision` should embody three roles at once:

- Product partner: understands product leverage, positioning, user behavior,
  differentiation, and sequencing.
- Requirements interrogator: challenges shallow answers, exposes assumptions,
  detects contradictions, and keeps asking until the user intent is durable.
- Intent compiler: turns messy human answers into structured product intent that
  downstream Agents can consume.

This role model is not decorative. It should directly shape command protocol,
artifact shape, readiness gates, verification, and user experience.

## Reference Skill Evidence

Two external reference skills informed this plan:

- `/Users/archy/Downloads/vision_to_strategic_prototype_prompt_skill.zip`
- `/Users/archy/Downloads/prototype_tune_to_refined_prompt_skill.zip`

The first reference skill shows what `/ow:proto` needs from vision in order to
create strategic prototype prompt packs. It extracts:

- target user
- usage context
- current alternative
- pain
- desired behavior change
- strongest success signal
- core differentiator
- emotional value
- functional value
- trust requirements
- privacy requirements
- non-goals
- future opportunities
- validation target

The second reference skill shows what `/ow:tune` needs after prototypes exist:
it extracts a product system from a screen group, then protects that system
through inheritance and delta rules. It needs:

- product thesis
- core user behavior
- primary product loop
- brand promise
- interaction model
- information architecture
- feature system
- design language
- component vocabulary
- copywriting system
- trust and boundary system
- anti-goals
- stable constants
- adaptable variables

Together these references imply that `/ow:vision` cannot stop at a high-level
vision summary. It must produce enough strategic structure for prototype
generation and enough product-system seed material for later tuning to avoid
drift.

## Reference Skill Absorption

The two reference skills should not remain only external examples. Their core
capabilities should be absorbed into OW's native `/ow:proto` and `/ow:tune`
commands.

### Absorb vision_to_strategic_prototype_prompt Into /ow:proto

`vision_to_strategic_prototype_prompt` should become the behavioral foundation
for `/ow:proto`.

The absorbed `/ow:proto` should:

- treat `VISION.md`, `VISION_CONTRACT.yaml`, and validation context as source
  truth
- extract product strategy before writing UI prompts
- generate multiple strategic hypotheses before selecting prompt directions
- reject prompt directions that differ only by visual style
- preserve non-goals, trust boundaries, privacy requirements, and user-control
  mechanisms from vision
- translate strategy into screens, flows, states, interactions, AI/system
  behavior, example content, visual direction, anti-goals, and desired user
  feeling
- recommend the first prototype to generate based on validation value, risk
  reduction, observability, and feasibility

This means `/ow:proto` should become a strategy-to-prompt compiler, not a
generic prototype prompt writer.

The relevant source concepts to absorb are:

- input normalization contract
- vision decomposition schema
- strategic hypothesis generation
- prototype prompt schema
- output template shape
- quality rubric
- AI English Friend case as a dogfood fixture or regression reference

### Absorb prototype_tune_to_refined_prompt Into /ow:tune

`prototype_tune_to_refined_prompt` should become the behavioral foundation for
`/ow:tune`.

The absorbed `/ow:tune` should:

- treat the accepted prototype screen group as the baseline, not a single image
- audit all baseline screens before generating refined prompts
- extract the product system behind the screens
- preserve product thesis, core user behavior, primary loop, brand promise,
  interaction model, feature system, design language, copywriting tone, trust
  boundaries, and anti-goals
- build explicit `MUST_INHERIT`, `MUST_ADD`, `MUST_REMOVE`, and
  `FLEXIBLE_CHANGE` rules
- bind every refined prompt to stable source and target screen IDs
- support form-factor transformation without stretching one layout into another
- prevent multi-round prototype drift
- emit acceptance criteria for generated refined screens

This means `/ow:tune` should become a product-system-preserving prompt refiner,
not a loose visual edit instruction generator.

The relevant source concepts to absorb are:

- baseline screen audit
- product system extraction
- tune request interpretation
- delta and inheritance matrix
- screen binding and prompt manifest
- refined prompt pack schema
- form-factor transformation patterns
- quality rubric
- Daily English Call case as a dogfood fixture or regression reference

### Absorption Boundary

The absorption should happen through OW source contracts, schemas, command
protocols, verification, and generated skill surfaces. Do not copy the external
zip contents wholesale into generated surfaces. Treat them as design evidence
and extract stable native OW behavior.

The correct sequence is:

1. Make vision proto-ready.
2. Absorb the vision-to-strategic-prototype behavior into `/ow:proto`.
3. Absorb product-system inheritance and screen-bound refined prompts into
   `/ow:tune`.
4. Add end-to-end dogfood fixtures that prove the chain from vision interview
   to benchmark prototype selection.

## Target Discovery Loop

The upgraded discovery loop is:

```text
/ow:vision
  -> VISION.md + VISION_CONTRACT.yaml
  -> /ow:validation
  -> VALIDATION.yaml
  -> /ow:proto
  -> strategic prototype prompt pack
  -> generate prototype image groups
  -> /ow:tune
  -> refined prompt pack
  -> refine prototype image groups
  -> select benchmark prototype
```

The loop should optimize for two consumers:

1. The human user during discovery.
2. The downstream Agent consuming artifacts after discovery.

Those consumers need different interaction modes. Human discovery needs
low-latency conversation. Agent handoff needs durable, structured, auditable
artifacts. OW must support both without making one destroy the other.

## Required /ow:vision Mode Change

`/ow:vision` should become delayed-compile instead of eager-persistence.

## Native Source Skill Gap

OW currently has native source skills for validation, prototype, tune,
workflow, team, planning, and other behavior under `skills/`, but it does not
yet have `skills/build-vision/`. That is a structural gap: `/ow:vision` has a
generated `ow-vision` adapter skill, but the source behavior that should guide
vision discovery is not represented as a native skill alongside
`build-validation`, `build-prototype`, and `tune-prototype`.

This upgrade should add `skills/build-vision/` as the native source skill for
vision discovery. It should encode the delayed-compile model and the role model
of product partner, requirements interrogator, and intent compiler. The
generated `/ow:vision` adapter should continue to come from registry/source
contracts and `openworkflow sync`, but `build-vision` should be the human-
readable source behavior for maintainers and future command upgrades.

### Interview Mode

Interview mode is the default. It asks one question at a time, follows the
user's answers, and keeps the conversation moving. It does not write durable
`.openworkflow/vision/**` files after every answer.

The Agent may maintain temporary working memory in conversation context, but it
should not create review-heavy artifacts until a meaningful checkpoint.

Interview mode should feel like a strong product partner:

- ask a focused next question
- summarize only enough to maintain continuity
- challenge shallow or contradictory answers
- branch into deeper questions when a load-bearing assumption appears
- keep the user in flow

### Checkpoint Mode

Checkpoint mode writes lightweight evidence only at meaningful moments:

- the user explicitly asks to record
- a topic closes
- a long interview reaches a natural pause
- the Agent needs to preserve a high-risk ambiguity
- the user asks to pause and resume later

Checkpoint artifacts are not the final `VISION.md`. They are auditable notes or
draft session state that preserve progress without pretending the vision is
ready.

### Compile Mode

Compile mode writes durable vision artifacts only when:

- the mandatory discovery dimensions have enough evidence
- proto-readiness is sufficient
- unresolved blockers are explicit
- the user confirms that the interview can stop

Compile mode creates or updates:

- `.openworkflow/vision/VISION.md`
- `.openworkflow/vision/VISION_CONTRACT.yaml`
- `.openworkflow/vision/sessions/<id>/VISION_SESSION.yaml`
- optional `.openworkflow/context/**` when context has stabilized

## Proto-Readiness As Vision Acceptance

`VISION.md` is ready only when `/ow:proto` can turn it into high-quality
prototype prompt packs.

Proto-ready vision must support these outputs:

- 3-5 strategically distinct prototype directions
- each direction grounded in a different hypothesis, not a visual style variant
- concrete screens, flows, states, interactions, and example content
- explicit AI/system behavior when AI is part of the differentiator
- trust, privacy, safety, and user-control requirements
- anti-goals converted into prototype constraints
- strongest success and failure signals
- validation target for the next prototype pass

If `/ow:proto` would need to invent the target user, differentiator, success
signal, core mechanism, trust boundary, or non-goals, then `/ow:vision` is not
ready to compile.

## Vision Artifact Shape

The vision contract should evolve from a simple compact summary into a source
artifact that can feed prototype generation.

Recommended structured sections:

```yaml
strategic_core:
  target_user:
  context:
  current_alternative:
  pain:
  desired_behavior_change:
  core_mechanism:
  core_differentiator:
  strongest_success_signal:
  failure_signals:

product_system_seed:
  product_thesis:
  primary_loop:
  interaction_model:
  feature_system:
  emotional_value:
  functional_value:
  copywriting_tone:
  trust_boundary:
  privacy_boundary:
  anti_goals:
  future_opportunities:

proto_readiness:
  status: missing|thin|ready|blocked
  missing_for_proto:
  prototype_direction_seeds:
  prompt_constraints:
  validation_target:
  downstream_notes:

coverage:
  target_user:
    status: missing|thin|solid|conflicted
    evidence:
    follow_up_question:
  differentiator:
    status: missing|thin|solid|conflicted
    evidence:
    follow_up_question:
```

The exact schema can be refined, but the artifact must preserve both human
intent and downstream prompt-generation readiness.

## Vision Quality Gate

Before writing final vision artifacts, `/ow:vision` should run an internal
quality gate.

The gate asks:

- Can I name the target user without ambiguity?
- Can I name the current alternative?
- Can I name the desired behavior change?
- Can I name the core mechanism and differentiator?
- Can I name the strongest success signal?
- Can I name the key failure signals?
- Can I state trust, privacy, and safety boundaries?
- Can I turn non-goals into prompt constraints?
- Can I seed multiple strategic prototype hypotheses?
- Can `/ow:proto` generate a prompt pack without inventing strategy?
- Has the user explicitly allowed compile to begin?

If any load-bearing answer is missing, thin, or conflicted, `/ow:vision` should
continue the interview instead of compiling.

## Validation Repositioning

`/ow:validation` should consume a proto-ready vision, not repair a thin one.

Validation should answer:

- Which assumption must be proven first?
- Which prototype direction best tests it?
- What observable user behavior decides continue, tune, pivot, or stop?
- What evidence is sufficient before prototype generation?
- What should remain out of scope for the first prototype?

Validation should not become a backlog ranking exercise. It should sharpen the
prototype target.

## Proto Repositioning

`/ow:proto` should become a strategy-to-prompt compiler.

Its job is not to invent the product. Its job is to:

- consume `VISION.md`, `VISION_CONTRACT.yaml`, and validation context
- generate strategic prototype directions
- make the directions meaningfully different
- write high-fidelity prompts that downstream generation tools can execute
- recommend which prototype to build first

Prototype prompt quality becomes the practical test of vision quality.

The first implementation source for this repositioning is the attached
`vision_to_strategic_prototype_prompt` skill. OW should absorb its decomposition,
hypothesis generation, prompt schema, and quality rubric into native proto
contracts rather than keeping the behavior as an external one-off skill.

## Tune Repositioning

`/ow:tune` should protect product continuity through refinement.

Its job is not to create another product direction. Its job is to:

- audit the full baseline screen group
- extract the product system
- define stable constants and adaptable variables
- create MUST_INHERIT, MUST_ADD, MUST_REMOVE, and FLEXIBLE_CHANGE rules
- bind refined prompts to target screen IDs
- prevent multi-round prototype drift
- preserve trust, privacy, safety, and user controls

Tune quality depends on vision and proto quality. If those upstream artifacts
are thin, tune will drift or overfit one screen.

The first implementation source for this repositioning is the attached
`prototype_tune_to_refined_prompt` skill. OW should absorb its baseline audit,
product-system extraction, delta matrix, screen binding, refined prompt schema,
and quality rubric into native tune contracts.

## Interaction Quality Requirements

For human users:

- No per-answer durable file write in normal interview mode.
- One focused question at a time.
- Low-latency continuation after each answer.
- The Agent should be willing to ask dozens of questions when needed.
- The Agent should not compile after an arbitrary small question count.
- The Agent should explain why it still needs to ask when it detects thinness.

For Agents:

- Artifacts must expose source-of-truth, summary, evidence, coverage, blockers,
  readiness, and next command.
- Thin or conflicted vision should be structured as not ready.
- Downstream commands should not need to scan notes or infer strategy from raw
  conversation.

## Acceptance Criteria For The Upgrade

The upgraded discovery loop is acceptable when:

- `/ow:vision` can conduct a long interview without writing durable files after
  each answer.
- `/ow:vision` compiles only after user confirmation and proto-readiness.
- `VISION.md` can drive `/ow:proto` to produce high-quality strategic prototype
  prompt packs.
- `/ow:proto` outputs strategically different directions, not visual variants.
- `/ow:tune` can preserve product system continuity across prototype refinement.
- The system remains auditable through checkpoints and final compiled artifacts.
- Low-context Agents can determine whether discovery is ready, blocked, thin,
  or safe to hand off.

## Risks

- Delayed persistence can lose audit evidence if the session is interrupted.
  Mitigation: support explicit checkpoint mode and lightweight pause/resume
  snapshots.
- Proto-readiness can become too strict and block productive exploration.
  Mitigation: distinguish exploratory vision drafts from final compile.
- Adding many fields can make artifacts noisy.
  Mitigation: keep detailed coverage structured and summarize default read
  models.
- Rebuilding vision, validation, proto, and tune together is too broad.
  Mitigation: use DTC to split the upgrade into bounded queues and candidates.

## DTC Guidance

Do not implement the entire discovery loop in one queue.

Recommended first queue:

- `vision delayed-compile and proto-readiness contract`

Deferred queues:

- validation target contract for proto-readiness
- proto strategy-to-prompt compiler alignment, including absorption of the
  `vision_to_strategic_prototype_prompt` reference skill
- tune product-system inheritance alignment, including absorption of the
  `prototype_tune_to_refined_prompt` reference skill
- cross-command discovery loop read model
- end-to-end dogfood fixture from vision interview to benchmark prototype
