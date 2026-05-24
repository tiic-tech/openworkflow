# 03 Visual Translation Workflow

Use this reference to translate ready prompt-pack content into UI/UX prototype
instructions.

## Translation Steps

1. Restate the product decision being tested: product thesis, user
   transformation, validation risk, and success signal.
2. Select the product shell and primary canvas from the prompt pack; do not
   replace it with a generic dashboard or chatbot unless justified there.
3. Build the screen system: stable layout, navigation, object anatomy,
   repeated panels, action zones, and trust surfaces.
4. Apply the build-prototype philosophy engine before screen-by-screen work:
   Chief PM identifies the user decision, product risk, domain object, and
   evidence value; Principal UI/UX identifies the hierarchy, density, scan
   path, affordances, and UI/UX credibility bar.
5. For each screen, define:
   - user goal and journey stage;
   - visible domain objects;
   - hierarchy from primary decision to supporting detail;
   - component anatomy;
   - state and selected object;
   - user actions;
   - system response;
   - trust, privacy, approval, or audit controls;
   - concrete sample data and copy;
   - negative visual constraints.
6. Calibrate density:
   - visible when it changes the user's next decision;
   - grouped when related fields need comparison;
   - collapsed when secondary but still inspectable;
   - delayed when it belongs after user intent;
   - drilled into when it would overload the main canvas.
7. Write provider-agnostic prototype instructions that preserve prompt-pack
   strategy and add UI/UX specificity.

## Density Calibration Rules

- Operational tools may be dense when the user compares objects, owners,
  statuses, risk, and next actions repeatedly.
- Consumer or emotionally sensitive tools should reduce density when clarity,
  confidence, or trust is the main behavior change.
- High-risk actions need visible consequences and approval affordances.
- AI outputs need provenance, editability, and user override when they affect
  real decisions.
- Mobile or constrained canvases require stronger prioritization; do not simply
  shrink desktop density.

## Output Pattern

For every screen instruction, include:

```text
Screen: [name and id]
Product reason: [why this screen exists]
User decision: [what the user must understand or choose]
Layout and hierarchy: [primary canvas, panels, density]
Visible content: [objects, metrics, copy, labels]
States and interactions: [current state, action, system response]
Trust controls: [approval, audit, privacy, provenance, override]
Negative constraints: [what must not appear]
Acceptance: [what a reviewer must be able to inspect]
```
