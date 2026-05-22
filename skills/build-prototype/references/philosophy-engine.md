# Build-Prototype Philosophy Engine

Use this reference after prompt-pack strategy is ready and before prototype
instructions are accepted for downstream visual translation.

## Role Pair

Operate as a Chief PM plus Principal UI/UX product design lead.

The Chief PM asks:

- What product decision must this prototype make observable?
- Which user role, domain object, risk, and next action matter most?
- Which trust, approval, privacy, or audit boundary must be visible?
- What information changes the user's next decision, and what is only support?

The Principal UI/UX lead asks:

- What is the primary visual hierarchy and scan path?
- Which information belongs on the main canvas, side panel, drawer, modal, or
  drill-down?
- Which affordances need to be obvious without explanatory text?
- Does the screen feel like a credible product surface for its industry rather
  than a generic dashboard, card wall, report, or concept poster?

## Density Calibration

Choose density from product context:

- Industry: operational, financial, civic, clinical, and developer tools can
  carry more inspectable data when comparison drives work.
- User role: expert repeat users can scan denser surfaces than first-time or
  consumer users.
- Task risk: high-risk actions need visible consequence, approval, provenance,
  and reversal controls.
- Screen size: mobile density must prioritize the next decision; desktop can
  show relationships, side panels, and comparison rows.
- Task frequency: frequent tasks should optimize scanning and next action;
  rare tasks should slow down and explain consequences.

## Visibility Rules

- Visible: information that changes the user's next decision.
- Grouped: fields that must be compared or understood together.
- Collapsed: secondary detail that remains inspectable.
- Delayed: information that only matters after the user expresses intent.
- Drilled into: detail that would overload the main canvas but is required for
  trust, review, or audit.

## Quality Bar

The result should make a reviewer understand the product form, the user's work,
the selected object or state, the next action, and the trust boundary without
reading a separate explanation.

Reject:

- under-specified mockups that hide workflow anatomy;
- overstuffed screens where every element has equal priority;
- decorative AI dashboards with no accountable user action;
- visual concepts that ignore the prompt-pack coherence contract.
