# Open Design Research For M16

Source repository: `/Users/archy/Projects/GitClone/open-design`

Commit inspected: `75498838a911d5d7ab4299ac817774ab5e560824`

This research was performed with local git commands against the cloned
`nexu-io/open-design` repository. The goal is to extract transferable patterns
for improving OpenWorkflow's `/ow:proto` skill, especially prototype aesthetics,
visual direction, and design-quality control.

## Useful Patterns

### 1. Design systems as executable aesthetic constraints

Open Design has a `design-systems/` catalog where each system is a portable
`DESIGN.md`. The common format covers visual theme, color, typography,
components, layout, motion, voice, anti-patterns, and prompt guidance.

Transfer to OpenWorkflow:

- `/ow:proto` should not start from a blank aesthetic.
- A prototype should name either an active design system, a chosen visual
  direction, or a derived reference style before HTML implementation.
- Prototype artifacts should record the visual direction used.

### 2. Token contracts beat vague style prose

Open Design's `_schema/tokens.schema.ts` separates brand identity tokens,
structural tokens, fallback tokens, richer alias slots, and brand-only
extensions. This keeps generated artifacts from inventing missing variables or
silently breaking CSS.

Transfer to OpenWorkflow:

- M16 does not need a full token registry, but `ow-proto` should ask the agent
  to derive a compact token set for visual prototypes: background, surface,
  foreground, muted, border, accent, display font, body font, radius, spacing,
  and motion.
- The token set should be evidence, not hidden prompt state.

### 3. Template seeds improve output more than generic taste rules

Design templates contain a `SKILL.md`, `example.html`, optional `assets/`, and
`references/checklist.md`. Good templates instruct the agent to clone a seed,
preserve its runtime, replace content, and only design missing layouts inside
the template's existing grammar.

Transfer to OpenWorkflow:

- `/ow:proto` should prefer a seed/template path when the prototype category is
  known.
- If no seed exists, the agent should explicitly create a small local design
  system before writing HTML.
- M16 should not add a marketplace; it should add the protocol hook.

### 4. Direction selection makes aesthetics deliberate

Open Design has a direction library with distinct choices such as editorial,
modern minimal, human approachable, tech utility, and brutalist experimental.
Each direction includes references, fonts, palette, and layout posture.

Transfer to OpenWorkflow:

- `/ow:proto` should select or ask for a visual direction before visual work.
- For visual prototypes, the direction should influence the static concept
  prompt and later HTML implementation.
- Direction should be domain-sensitive: dashboards should not receive marketing
  hero treatment; games can be expressive; operational tools should be dense and
  restrained.

### 5. Discovery-first design task flow

Open Design's prompt system forces a short first-turn discovery form for new
design work, branches on brand/reference availability, then plans with a live
todo sequence.

Transfer to OpenWorkflow:

- For `/ow:proto`, the equivalent is not a full form but a classification gate:
  what kind of prototype is this, what risk is being tested, what visual
  direction or reference applies, and whether static concept comes before code.

### 6. Static visual concept before implementation

Open Design separates media generation from HTML artifacts and carries prompt
templates for image mockups. For a visual prototype, this supports quick visual
alignment before spending turns on HTML.

Transfer to OpenWorkflow:

- Visual-first prototypes should default to image generation for a high-fidelity
  static concept.
- HTML implementation should follow after user confirmation or after the static
  concept establishes enough direction.
- The image concept path must be optional for logic-only or technical prototypes.

### 7. Critique as a protocol, not vibes

Critique Theater / Design Jury formalizes review through roles: Designer,
Critic, Brand, A11y, and Copy. It uses scored dimensions, must-fix directives,
round limits, and convergence thresholds.

Transfer to OpenWorkflow:

- M16 should not copy the full multi-panel daemon architecture.
- `/ow:proto` should include a lightweight self-critique checkpoint:
  philosophy, hierarchy, execution, specificity, restraint, accessibility, and
  responsive behavior.
- Any weak dimension should trigger a repair pass before evidence handoff.

### 8. P0/P1/P2 checklists create concrete quality gates

Open Design templates often ship `references/checklist.md` with P0/P1/P2
checks: working tabs, hover tooltips, no external dependencies, responsive
collapse, token-derived chart colors, etc.

Transfer to OpenWorkflow:

- `/ow:proto` should require prototype-specific P0 checks before result
  recording.
- The evidence artifact should record what was checked and what remains a known
  limit.

## M16 Implications

The upgraded `/ow:proto` should have this shape:

1. Classify prototype mode.
2. Identify validation question and success signal.
3. Detect references and extract transferable patterns when present.
4. For visual prototypes, generate a high-fidelity static concept first.
5. Derive a compact design token/direction packet.
6. Implement the smallest runnable artifact that answers the validation question.
7. Verify with browser/screenshot checks when rendered output exists.
8. Self-critique, repair weak areas, and then write evidence.

This should reduce long proto/decision churn by moving aesthetic alignment ahead
of HTML implementation.
