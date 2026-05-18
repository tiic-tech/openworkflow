# Validation-First Protocol

Use this reference when deciding what should happen before implementation.

## Priority Means Validation Order

OpenWorkflow priority is not a sorted backlog. It is the order in which the
vision's critical assumptions must be proven.

Ask:

- What feature makes the idea distinct?
- If this feature fails, does the product collapse into a generic app?
- What can be faked, mocked, or hardcoded to test that feature?
- What should be excluded because it does not answer the core question?

## Feature Classes

`existential`:

- The vision fails without it.
- It should usually be validated first.

`supporting`:

- It helps the existential feature become useful.
- It can be mocked if the validation question does not depend on full fidelity.

`later`:

- Valuable after the core experience works.
- Usually includes auth, sharing, import/export, admin, analytics, billing, and
  scale work unless the vision is specifically about those capabilities.

`out_of_scope`:

- Explicitly excluded from this validation loop.

## Prototype Brief Rule

The prototype should include the minimum surface that lets a user, reviewer, or
agent answer the core question. It should exclude production hardening unless
that hardening is the core assumption.

Example:

For an AI-native travel memory globe, the first validation is not login,
database schema, upload flow, or chat orchestration. It is whether an
interactive globe with flags, hover photo previews, and a detail panel can feel
like the product's central experience.

