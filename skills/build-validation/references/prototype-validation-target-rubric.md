# Prototype Validation Target Rubric

A validation target is useful only if it helps `/ow:proto` design an experiment,
not just a polished interface.

## Required Qualities

- Central uncertainty: one uncertainty that would materially change the product
  direction if disproven.
- Target behavior: the user behavior or reaction the prototype must make
  observable.
- Prototype boundary: the minimum scene, journey, states, and interactions that
  must be shown.
- Evidence criteria: pass, fail, and ambiguous signals expressed as observable
  prototype review evidence.
- Decision rules: how evidence maps to continue, revise, pivot, stop, or
  needs_more_evidence.

## Rejection Signs

- The target is a list of features.
- The target can be satisfied by making the UI attractive.
- The target needs production infrastructure to be meaningful.
- The target asks the prototype to prove several unrelated assumptions.
- The target omits what would count as failure.
- The target requires `/ow:proto` to invent product strategy.

## Strong Target Shape

```text
We need to learn whether [target user], in [context], would [target behavior]
because [core mechanism] solves [pain] better than [current alternative].
The prototype must show [must-show moments] and must avoid [anti-goals].
Pass if [observable signal]. Fail if [observable signal].
```
