# Agent-First Consumer Audit Report

Date: 2026-05-25

Repository: `/Users/archy/Projects/StartUp/openworkflow`

Audit owner: Codex

Audit mode: OpenWorkflow as the only development tool, from the perspective of an AI Agent as the first consumer

## Executive Verdict

OpenWorkflow already has a strong Agent-first foundation. The strongest surfaces are the generated `AGENTS.md`, the repo-local CLI JSON envelope, `handoff`, `inspect`, `context`, `resume`, command read order, and explicit allowed/forbidden output boundaries. These give an Agent much better startup intelligence than a prose-only workflow.

The suite is not yet safe to treat as the only trusted development tool. The core problem is not missing functionality. The core problem is trust coherence. Some commands can mutate outside `--root`, some green trust gates can point to the wrong next action, `resume` knows important queue-local truth that other entrypoints do not surface, and release validation can be red while runtime trust commands still look green. For a low-context Agent, these are product-level trust failures because they can cause unsafe mutation, wrong workflow continuation, or false readiness.

## Audit Scope

This audit used the review dimensions defined for Agent-first consumption:

- Fast orientation.
- Structured consumption.
- Health coherence.
- Lazy creation.
- Non-destructive repair.
- Summary trust.
- Command contracts.
- Handoff quality.
- Safety boundaries.
- Verification and recovery.

The audit intentionally treated OpenWorkflow as the only development tool an Agent should rely on. The central question was: can a fresh Agent orient, decide, act, verify, and hand off safely without recursively reading the repository or guessing workflow state?

## Subagent Assignment

Four subagents were assigned independent slices:

| Subagent | Focus | Output |
| --- | --- | --- |
| Euler | Entrypoints and command contracts | Reviewed `README.md`, `AGENTS.md`, CLI help, command-specific help behavior, and JSON contract clarity. |
| Fermat | Low-context state, generated surfaces, and trust signals | Reviewed `.openworkflow`, `.agents`, state ownership, active queue visibility, summary trust, and lazy creation. |
| Banach | Realistic consumer E2E | Created a temporary fixture and exercised help, init, handoff, inspect, context, validate, doctor, sync repair, and draft preview. |
| Lorentz | Safety, validation, source of truth, and architecture risks | Reviewed mutation safety, root containment, validator architecture, generated-surface drift, and test style. |

The parent agent reconciled all findings, reran the key trust commands locally, and spot-checked the highest-severity code references.

## Local Baseline Commands

Initial audit commands included:

```bash
node dist/cli/src/index.js handoff --root . --json
node dist/cli/src/index.js inspect --root . --strict --json
node dist/cli/src/index.js context --root . --json
node dist/cli/src/index.js validate --root . --json
node dist/cli/src/index.js summaries --root . --strict --json
node dist/cli/src/index.js doctor --root . --tools codex --json
node dist/cli/src/index.js resume --root . --json
node dist/cli/src/index.js status --root . --json
node dist/cli/src/index.js check /ow:select-change --root . --json
node dist/cli/src/dev/validateRepositoryContractsCli.js --root .
git status --short
```

At the time of the first pass, the standard trust commands were mostly green, but `resume` found active queue truth that the other entrypoints did not include. At report landing time, after intervening worktree changes in the same repository, `handoff` and `inspect --strict` became red because M130/C002 implementation completion was missing `LOCAL_COMMIT_EVIDENCE.yaml`. That later red state is itself useful evidence: the strict quality gate is capable of blocking when planning queue evidence is incomplete, but its next-action guidance is still not fully coherent.

During the pre-write landing check, `git status --short` showed pre-existing uncommitted M130 changes:

```text
 M changes/M130-remaining-pr5-pr7-merge-governance/CANDIDATE_CHANGES.md
 M changes/M130-remaining-pr5-pr7-merge-governance/CANDIDATE_CHANGES.yaml
 M changes/M130-remaining-pr5-pr7-merge-governance/SUMMARY.yaml
?? changes/M130-remaining-pr5-pr7-merge-governance/C002-decide-next-pr5-pr7-merge-target/
```

This report did not edit those files. A final status check after writing this report showed only this new report file as an untracked change.

## KANO Summary

| Category | Features | Assessment |
| --- | --- | --- |
| Must-be | Root-contained mutation, coherent trust gate, parseable JSON, safe next actions, clear read order | Present in design, but violated by out-of-root cleanup and conflicting next-action signals. |
| Performance | `resume` recovery cockpit, `context` bounded packet, summary quality gates, active queue discovery | Strong and materially useful, but not consistently connected to `handoff`, `inspect`, and `check`. |
| Attractive | Allowed/forbidden outputs, read-order guidance, lazy creation, preview/write split | These reduce Agent context and risk significantly. |
| Indifferent | Generic README install flow, broad top-level help | Useful for humans, weak as Agent-first entry. |
| Reverse | Stale optional `AGENT.md`, text-substring verifiers, duplicated validator truth | These add noise, drift risk, and false confidence. |

## What Works Well

### Generated Agent Guide

`AGENTS.md` is a strong generated entrypoint. It tells an Agent to prefer JSON, explains the report envelope, distinguishes `handoff`, `resume`, `inspect`, `context`, `brief`, and `status`, and names preview/write boundaries for mutating commands.

Important evidence:

- `AGENTS.md` states that every CLI command supports a JSON report envelope.
- It says `ok:false` should be treated as a failed command and that the JSON still prints to stdout.
- It explains that `doctor` covers managed surface health but is not sufficient proof of artifact handoff quality.
- It tells the Agent to read `.openworkflow/CURRENT_STATE.yaml` and then follow `read_this_first`.

### JSON Report Envelope

The repo-local CLI consistently returns a structured shape:

```text
schema_version
command
ok
root
data
warnings
errors
health_errors
effects
next_actions
```

This is the right design for Agent consumption. It avoids forcing the Agent to parse human prose for command outcomes.

### Bounded Context Packet

`context --json` gives a compact packet with:

- command readiness;
- required context;
- optional context;
- forbidden context;
- allowed outputs;
- forbidden outputs;
- audit checkpoints;
- included/truncated/omitted files;
- summary guidance;
- budget information.

This is a meaningful reduction in context cost.

### Resume Cockpit

`resume --json` is one of the strongest surfaces in OW. It can identify:

- active planning queue;
- branch boundary;
- branch ownership;
- selected/completed/next-ready candidate;
- current work item;
- owned paths;
- forbidden actions;
- validation commands;
- dirty git state;
- stop conditions.

In this audit, `resume` correctly found `M130-remaining-pr5-pr7-merge-governance` and a queue-local next action, while the ordinary workflow state still pointed to `/ow:vision`.

### Lazy Creation

The E2E fixture showed that `init` does not eagerly create stage artifact folders such as `.openworkflow/vision`, `.openworkflow/changes`, or `.openworkflow/runtime`. Summary health correctly reported artifact types as `not_instantiated`.

## Findings

### P0: `init` and `sync` can delete generated-marked files outside `--root`

Severity: P0

Agent risk: destructive out-of-root mutation.

Evidence:

- `packages/adapters/codex/src/generateCodexAdapter.ts` iterates legacy prompt paths and calls `removeGenerated`.
- `legacyCodexPromptPaths()` defaults to `join(homedir(), ".codex")` when `CODEX_HOME` is unset.
- `packages/adapters/codex/src/generatedFiles.ts` removes the path with `rm(path)` when it has a generated marker or force is enabled.

Observed code references:

```text
packages/adapters/codex/src/generateCodexAdapter.ts:72
packages/adapters/codex/src/generateCodexAdapter.ts:83
packages/adapters/codex/src/generatedFiles.ts:61
packages/adapters/codex/src/generatedFiles.ts:84
```

Why this matters:

An Agent running `openworkflow init <repo> --tools codex` or `openworkflow sync --root <repo> --tools codex` reasonably assumes writes are scoped to the target repository. Deleting under `~/.codex/prompts` violates that expectation. Even if only generated-marked files are removed, this is still an out-of-root side effect that is not separately authorized.

Recommended fix:

- Make adapter sync root-contained by default.
- Move global legacy prompt cleanup behind an explicit command or flag.
- When out-of-root cleanup is explicitly requested, report it in JSON effects with a separate `out_of_root` or `external_effects` field.
- Refuse global cleanup unless the command name and flag make the operation unambiguous.

### P1: `handoff` / `inspect` and `resume` disagree on the real next action

Severity: P1

Agent risk: wrong workflow continuation despite green trust signals.

Evidence:

- `.openworkflow/CURRENT_STATE.yaml` had `active_stage: workflow`, all active pointers null, and `next_command: /ow:vision`.
- `handoff`, `inspect`, `status`, `brief`, and `check /ow:vision` initially returned green or ready signals pointing to `/ow:vision`.
- `resume --json` found an active M130 queue, current branch ownership, and queue-local next action: select or continue the next candidate.

Why this matters:

`resume` has the richer and more accurate continuation model for the actual dogfood repo. But `handoff` is described as the strict Agent trust gate. A fresh Agent choosing `handoff` instead of `resume` can be routed to product-vision discovery while the branch is actually in a merge-governance queue.

Recommended fix:

- Make `handoff` and `inspect --strict` include the active queue summary already computed by `resume`.
- If queue-local action overrides `CURRENT_STATE.next_command`, top-level `next_actions` should say so explicitly.
- Consider adding a top-level field such as:

```yaml
effective_next_action:
  source: active_queue | current_state | recovery | blocked
  command_or_action: ...
  overrides_current_state_next_command: true
```

### P1: `check /ow:select-change` cannot resolve the active queue

Severity: P1

Agent risk: command readiness cannot use the repository state that another OW command already discovered.

Evidence:

`resume --json` discovered the active queue path:

```text
changes/M130-remaining-pr5-pr7-merge-governance/CANDIDATE_CHANGES.yaml
```

But:

```bash
node dist/cli/src/index.js check /ow:select-change --root . --json
```

failed with:

```text
missing required context: changes/<plan_id>/CANDIDATE_CHANGES.yaml
```

The generated select-change skill still declares a template requirement:

```text
.agents/skills/ow-select-change/SKILL.md:38
```

Why this matters:

The Agent should not have to manually substitute `<plan_id>` after `resume` has already found the active plan. Placeholder paths are useful in documentation but weak as machine-consumable readiness checks.

Recommended fix:

- Teach `check` to resolve placeholder context from active queue discovery.
- Or make `resume` output the exact `check` and `context` commands for the selected candidate.
- Add structured placeholder metadata instead of raw path strings when a path depends on current queue state.

### P1: Blocked `handoff` still recommends starting workflow work

Severity: P1

Agent risk: recovery failure can still route the Agent into normal work.

Evidence from E2E:

After deleting `.agents/openworkflow-adapter.yaml` in a temporary fixture:

- `handoff --json` exited nonzero.
- `ok:false`.
- `handoff_ok:false`.
- `adapter_ok:false`.
- blocker named the missing Codex adapter manifest.
- `next_actions` still included starting `/ow:vision`.

Code reference:

```text
packages/cli/src/commands/handoff.ts:126
```

The failure path includes `brief.agent_guidance.recommended_next_action`, which can reintroduce normal workflow action even when handoff failed.

Recommended fix:

- When `handoff_ok:false`, suppress workflow-start actions.
- Return only recovery actions.
- Separate fields:

```yaml
blocked_recovery_actions:
  - run openworkflow sync ...
deferred_workflow_actions:
  - continue with /ow:vision
```

The Agent should not see deferred workflow actions as executable next steps until the trust gate is green.

### P1: `draft` preview tells the Agent to edit a file that was not written

Severity: P1

Agent risk: impossible next action and false file existence.

Evidence:

```bash
node dist/cli/src/index.js draft --root . --artifact vision_session --id audit-preview --json
```

returned:

```text
write: false
effects.planned: [".openworkflow/vision/sessions/audit-preview/VISION_SESSION.yaml"]
effects.written: []
next_actions: ["edit .openworkflow/vision/sessions/audit-preview/VISION_SESSION.yaml ..."]
```

The file did not exist afterward.

Code reference:

```text
packages/cli/src/commands/draft.ts:67
```

Recommended fix:

- If `write:false`, next action should be `rerun with --write to create ...` or `copy the preview content into the target only if creation is intended`.
- Only tell the Agent to edit the artifact after `effects.written` or `effects.updated` contains the path.

### P1: Runtime trust validation and repository release validation disagree

Severity: P1

Agent risk: false readiness or unclear validation domain.

Evidence:

Runtime command passed during the initial audit:

```bash
node dist/cli/src/index.js validate --root . --json
```

Repository validator failed:

```bash
node dist/cli/src/dev/validateRepositoryContractsCli.js --root .
```

Failures included:

- invalid YAML in historical `changes/M113.../CANDIDATE_CHANGES.yaml`;
- invalid YAML in `changes/M122.../SELECTED_CHANGE.yaml`;
- missing `ATOM_TASKS.yaml` `title` keys;
- done candidates missing completion evidence;
- local commit evidence missing validation fields;
- high-risk reports missing required sections.

`package.json` defines `npm run validate` as:

```text
npm run build && node dist/cli/src/dev/validateRepositoryContractsCli.js --root .
```

Why this matters:

From an Agent viewpoint, both commands use the word "validate" but they validate different trust domains. One says the runtime project is okay; the other says the repository contract archive is invalid. The difference may be intentional, but it is not yet encoded clearly enough in the top-level trust model.

Recommended fix:

- Split validation domains explicitly:
  - active runtime workflow validation;
  - active handoff validation;
  - historical archive validation;
  - release validation.
- Add `domain` and `scope` fields to validation JSON.
- Surface release/archive red state as a warning in Agent trust commands when working in the OW repository itself.

### P1: Contract truth is duplicated across schemas, validators, and registries

Severity: P1

Agent risk: source-of-truth drift.

Evidence:

- `schemas/*.schema.json` are packaged, but schema validation only checks basic schema object keys.
- `validateOpenWorkflow.ts` hardcodes artifact required keys.
- `validateRepositoryContracts.ts` separately hardcodes overlapping required keys.
- Artifact contract templates also live in `packages/core/src/artifacts/registry.ts`.

Code references:

```text
packages/core/src/validators/validateRepositoryContracts.ts:252
packages/core/src/validators/validateOpenWorkflow.ts:327
packages/core/src/validators/validateRepositoryContracts.ts:1389
packages/core/src/artifacts/registry.ts
```

Why this matters:

OW is a contract-first system. A contract-first system cannot safely maintain several handwritten versions of the same contract. This is the main long-term architecture risk because generated surfaces, runtime validation, release validation, and schemas can drift while tests still pass locally.

Recommended fix:

- Choose one typed artifact contract model as the source of truth.
- Generate JSON schemas and validator rule tables from it.
- Make runtime validators consume generated/typed rule tables instead of re-declaring required fields.

### P1: Stale `AGENT.md` is still consumed as optional context

Severity: P1

Agent risk: stale guidance in bounded context packet.

Evidence:

`/ow:vision` optional context includes `AGENT.md`:

```text
.agents/skills/ow-vision/SKILL.md:43
```

`AGENT.md` still frames M01-M09 as current source of truth and names older build-order concepts, including `/ow:prototype`, while the current generated command surface uses `/ow:proto`.

Code/document references:

```text
AGENT.md:12
AGENT.md:123
.agents/skills/ow-vision/SKILL.md:43
```

Recommended fix:

- Remove `AGENT.md` from default optional context packets.
- Or replace `AGENT.md` with a short redirect to generated `AGENTS.md`.
- If retained, label it as historical design context and require an explicit full-context mode to include it.

### P2: `sync.stateReconciliation` is confusing on fresh state

Severity: P2

Agent risk: confusing maintenance diagnostics.

Evidence from E2E:

After repairing a missing adapter, `sync` succeeded but state reconciliation reported:

```text
attempted: true
reconciled: false
reason: no_current_pointers_found
active_stage: null
next_command: null
```

At the same time, `status` before and after reported:

```text
active_stage: workflow
next_command: /ow:vision
```

Code references:

```text
packages/core/src/workflow/syncOpenWorkflow.ts:98
packages/core/src/workflow/syncOpenWorkflow.ts:138
```

Recommended fix:

- Treat no current pointers in a fresh project as `not_applicable`, not failed reconciliation.
- Include the actual current-state `active_stage` and `next_command` when available.

### P2: Root containment is implemented inconsistently

Severity: P2

Agent risk: path safety bugs can reappear in individual commands.

Evidence:

There is a good shared helper:

```text
packages/core/src/fs/index.ts:50
```

But some commands and validators still implement local checks such as `relativePath.startsWith("..")` or raw `join(...).startsWith(root)`.

Examples:

```text
packages/cli/src/commands/register.ts:250
packages/cli/src/commands/draft.ts:95
packages/core/src/validators/validateOpenWorkflow.ts:150
```

Recommended fix:

- Replace local path containment checks with the shared helper.
- Add test cases for sibling-prefix paths such as `/repo-other` versus `/repo`.
- Add a lint or verifier check to reject new raw root-prefix containment checks.

### P2: Command-specific help is missing

Severity: P2

Agent risk: increased reading burden.

Evidence:

Subcommands such as `inspect --help`, `context --help`, `resume --help`, `draft --help`, `register --help`, and `git-automation --help` printed the top-level help instead of focused command help.

Recommended fix:

- Add command-specific help for:
  - `resume`;
  - `handoff`;
  - `inspect`;
  - `context`;
  - `check`;
  - `draft`;
  - `register`;
  - `summarize`;
  - `clean`;
  - `git-automation`.
- Each help page should state:
  - read/write behavior;
  - required inputs;
  - JSON fields to inspect;
  - possible exit statuses;
  - next actions.

### P2: README is not aligned with Agent-first entry

Severity: P2

Agent risk: first-read drift.

Evidence:

`README.md` starts with global install and basic maintenance commands:

```text
README.md:8
README.md:16
```

It does not tell an Agent to read `AGENTS.md`, run `resume`, `handoff`, `inspect`, or prefer JSON.

Recommended fix:

- Add an "Agent entry" section near the top.
- Point to `AGENTS.md`.
- Name the repo-local CLI usage pattern for development:

```bash
node dist/cli/src/index.js resume --root . --json
node dist/cli/src/index.js handoff --root . --json
node dist/cli/src/index.js context --root . --handoff --json
```

### P2: Dev verifiers rely heavily on prose substrings

Severity: P2

Agent risk: brittle tests and weak semantic proof.

Evidence:

`verifyRuntimeSurface.ts` is very large and contains many checks like `content.includes(...)`, section splitting, and prose substring assertions.

References:

```text
packages/cli/src/dev/verifyRuntimeSurface.ts:3315
packages/cli/src/dev/verifyRuntimeSurface.ts:3407
```

Recommended fix:

- Parse YAML/JSON and assert structure.
- Keep prose substring checks only for explicitly user-facing copy.
- Split the 5454-line verifier by domain:
  - managed surface;
  - command audit;
  - artifact contracts;
  - summary health;
  - queue governance;
  - cleanup safety.

## E2E Evidence Summary

Temporary fixture:

```text
/tmp/ow-realistic-consumer-e2e.bE8kRN/consumer-project
```

Commands used the repo-local CLI:

```bash
node /Users/archy/Projects/StartUp/openworkflow/dist/cli/src/index.js ...
```

Passing happy-path commands in the fixture:

- help;
- init;
- status;
- handoff;
- resume;
- inspect;
- context;
- validate;
- doctor;
- sync repair;
- check;
- draft preview.

Good signals observed:

- `handoff_ok:true` on clean fixture;
- `managed_surface_ok:true`;
- `adapter_ok:true`;
- `summary_quality_ok:true`;
- `next_command_ready:true`;
- `next_command:"/ow:vision"`;
- summary counts with `not_instantiated:8`;
- no stage artifacts created by `init`.

Failure-path evidence:

- deleting the Codex adapter made `doctor` and `handoff` fail as expected;
- `sync` repaired the missing adapter;
- blocked `handoff` still included workflow-start next actions;
- `draft` preview emitted an edit action for a file that was not written.

## Recommended Remediation Order

### 1. Fix root-contained mutation first

Remove or explicitly gate global `~/.codex/prompts` cleanup in `init` and `sync`.

Acceptance:

- `init` and `sync` with `--root <repo>` never remove files outside `<repo>` by default.
- JSON effects report all writes/removals.
- Any external cleanup requires an explicit command or flag and labels external paths separately.

### 2. Unify effective next action

Make `handoff`, `inspect --strict`, `context --handoff`, and `resume` agree on the effective next action.

Acceptance:

- If an active queue exists, ordinary entrypoints surface it.
- If `CURRENT_STATE.next_command` is overridden, the JSON says so.
- `next_actions` has one ranked primary action, not conflicting workflow and recovery actions.

### 3. Make blocked states fail closed

When `handoff_ok:false`, only recovery actions should be executable next actions.

Acceptance:

- Missing adapter case does not recommend `/ow:vision`.
- Missing evidence case does not recommend normal workflow continuation until the blocker is resolved.

### 4. Make preview next actions truthful

Preview commands must not tell the Agent to edit files that do not exist.

Acceptance:

- `draft --json` without `--write` says to rerun with `--write`.
- `draft --write --json` says to edit the written path.
- Tests assert `effects.planned`, `effects.written`, and `next_actions` consistency.

### 5. Split validation domains

Clarify and expose the difference between runtime validation, active handoff validation, historical archive validation, and release validation.

Acceptance:

- `validate --json` includes `domain` and `scope`.
- `npm run validate` failure is explainable from an Agent entrypoint.
- OW dogfood repo does not show "trusted" without acknowledging red release/archive validation when relevant.

### 6. Collapse contract truth

Create one typed source for artifact contracts and derive schemas, validators, and generated audit surfaces from it.

Acceptance:

- `artifactRequiredKeys` exists in one source only.
- Runtime and repo validators consume the same generated rule table.
- JSON schemas are either generated from the typed contract model or validated against the model with a real JSON Schema validator.

### 7. Quarantine stale guidance

Remove stale `AGENT.md` from default context packets or replace it with a redirect.

Acceptance:

- `context --json` no longer includes old M01-M09 guidance by default.
- `AGENTS.md` remains the generated primary Agent guide.
- Historical guidance is accessible only when explicitly requested.

## Product-Level Conclusion

OW is close to a genuinely useful Agent-first workflow substrate. Its strongest idea is that workflow state, command contracts, summaries, and recovery data should be machine-readable and bounded. That is exactly what Agents need.

The next step is to treat trust coherence as the product contract. If one command says "trusted" and another says "blocked", the system must explain the domain boundary. If one command finds the active queue, every entrypoint that claims to route the Agent must either use that queue or explicitly defer to the command that does. If a command mutates, the mutation boundary must be root-contained unless the user explicitly asks for a broader operation.

The work should not start with more documentation. It should start with failing closed:

1. no out-of-root mutation by default;
2. no conflicting next actions;
3. no green handoff when queue-local truth is missing or contradictory;
4. no preview action that assumes a file exists;
5. no duplicated contract truth without a retirement path.

Once those are fixed, OW can credibly become the single trusted development interface for low-context Agent work.
