# 07 Quality Rubric

Use this reference before marking `prompt_text_manifest.status` as
`ready_for_image_generation`.

## Strategic Differentiation

Verify:

- Each direction has a distinct strategic hypothesis.
- Each direction changes product form, trigger, interaction model, emotional
  driver, retention mechanism, validation metric, trust model, privacy model,
  or main risk.
- Directions are not visual style variants.
- Scenario labels are not mistaken for strategic directions.
- The selected directions cover the most important uncertainty space.

## Vision Alignment

Verify:

- Target user from the vision is preserved.
- Desired behavior change is explicit.
- Strongest success signal is explicit.
- Core differentiator appears in every direction.
- Future opportunities are not treated as first-version requirements.
- Non-goals become anti-goals in prompt text.
- Trust/privacy requirements appear as UI or interaction controls.

## Prompt Executability

Verify:

- Product name is included.
- Product positioning is clear.
- Target user is concrete.
- Core product idea is stated.
- Required screens are listed.
- Every screen has concrete UI requirements.
- Every screen has meaningful state or an explicit reason it does not need one.
- Required data fields and example copy are present.
- Primary actions and system responses are present.
- AI/system behavior is specified when relevant.
- Negative prompts and anti-goals are explicit.
- Desired user feeling is clear.
- Acceptance criteria are screen-bound and checkable.

## Product Specificity

Verify:

- `product_experience_model` names the product archetype and primary canvas.
- The artifact names domain objects, not just generic UI components.
- The screen_manifest includes selected objects, states, or workflow stages
  when the product category requires them.
- The prompt contains realistic fields, values, labels, owners, timestamps,
  copy, or metrics.

## Trust And Safety

Verify:

- No manipulative guilt language.
- No fake human identity unless explicitly safe and required.
- No intrusive intimacy or overattachment mechanics.
- No empty praise as the main feedback mechanism.
- No overpromising real-world outcomes.
- User controls are visible where memory, personalization, automation, or
  sensitive data are involved.
- Sensitive data defaults are conservative.
- Autonomous action is blocked when human approval is required.

## Integrity And Readiness

Verify:

- `prompt_pack_integrity_gate.status` is `pass`.
- `prototype_reality_gate.status` is `pass`.
- `post_validate.status` is `pass` for multi-direction packs or `skipped` for
  explicit single-direction packs.
- `prompt_text_manifest.direction_count` equals `directions.length`.
- `prompt_text_manifest.prompt_text_refs` resolve to source directions or
  screen prompts.
- `image_generation.status` is `not_started` until all gates pass.

## Common Failure Modes

- Strategy collapsed into UI style.
- Prompt is too abstract for a design tool.
- Vision non-goals are ignored.
- AI behavior is unspecified.
- Trust controls are described in prose but absent from UI.
- Markdown prompt is richer than YAML source.
- EVIDENCE references prompts that do not exist in the prompt pack.

Revise before final if any required check fails.
