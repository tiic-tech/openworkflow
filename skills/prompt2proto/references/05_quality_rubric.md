# 05 Quality Rubric

Use this reference before handoff.

## Pass Criteria

Pass only when:

- prompt-pack readiness gates pass or blockers are explicitly recorded;
- translation preserves product thesis, target user transformation, primary
  loop, trust boundaries, and non-goals;
- screen coherence is consumed from the prompt pack or blocked when missing;
- density decisions are justified by industry, role, risk, screen size, task
  frequency, and user attention;
- every screen instruction names user decision, layout hierarchy, visible
  content, state behavior, system response, trust controls, negative
  constraints, and acceptance checks;
- output clearly states that provider generation, human visual review, visual
  parity, proto2html, storyboard, motion, specs, changes, and runtime work are
  out of scope unless separately authorized.

## Failures

Fail when:

- the output invents product strategy;
- density is treated as more text rather than design prioritization;
- multi-screen consistency is repaired downstream instead of sourced from the
  prompt pack;
- the prototype looks like a generic dashboard, card wall, report, chatbot, or
  poster without strategic justification;
- trust controls are mentioned but not placed in UI;
- generated image quality or visual parity is claimed without evidence.

## Final Check

Before completing, search the output for unsupported claims:

- "generated image quality passed"
- "visual parity passed"
- "human reviewed"
- "ready for proto2html"
- "storyboard complete"
- "motion model"

Remove or block those claims unless a later authorized artifact proves them.
