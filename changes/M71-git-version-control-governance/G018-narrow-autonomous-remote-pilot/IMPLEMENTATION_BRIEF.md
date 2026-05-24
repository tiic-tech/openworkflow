# G018 Implementation Brief

G018 is a planning-only high-risk change. It does not implement push, PR
creation, PR update, merge, Issue mutation, or any destructive git operation.

Approved path:

1. **B - Remote read-only plus PR-ready remote plan**
   Add a non-mutating command path that reads remote/base/PR state and produces
   a PR-ready execution plan. This becomes `G019`.
2. **C - Narrow draft PR remote mutation pilot**
   After G019 proves evidence quality, implement the first mutation pilot as
   draft PR creation or update only. This becomes `G020`.

The first mutation pilot must remain narrower than full autonomous lifecycle:
no merge, no Issue mutation, no ready-for-review PR transition, no force-push,
and no destructive branch operation.

The recommended first mutation class is draft PR creation/update because it is
visible, reviewable, reversible by closing/editing the PR, and lower blast
radius than merge.
