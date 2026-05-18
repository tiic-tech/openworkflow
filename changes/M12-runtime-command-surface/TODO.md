# M12 TODO

M12 focuses on runtime usability. It should make a freshly initialized repo
small, make Codex commands register on the right command surface, and prevent
interactive commands from exposing internal protocol chatter to the user.

## Plan

1. [x] Capture the OpenSpec research and M12 design decisions.
2. [x] Minimize `openworkflow init` to workflow, audit, and config substrate.
3. [x] Make validators accept lazy stage artifacts.
4. [x] Write Codex slash prompts to `$CODEX_HOME/prompts/ow-*.md`.
5. [x] Refactor generated command content into agent-only protocol blocks and concise user behavior.
6. [x] Add `/ow:design` plus the `product_design` artifact contract and schema.
7. [x] Run full verification.

## Task Decomposition

- `M12-T001`: Write the runtime command surface reference. Done.
- `M12-T002`: Update init and validators for minimal substrate. Done.
- `M12-T003`: Add Codex global prompt generation. Done.
- `M12-T004`: Refactor generated command content format. Done.
- `M12-T005`: Add `/ow:design` and product design artifacts. Done.
- `M12-T006`: Integrate and verify. Done.

## Completion Checklist

- [x] Reference document exists.
- [x] init creates no eager stage directories.
- [x] init creates no eager stage indexes.
- [x] minimal init validates.
- [x] Codex global prompt files are generated.
- [x] Codex prompts include frontmatter.
- [x] repo-local command files are marked as references.
- [x] command content includes agent-only XML/comment blocks.
- [x] interactive commands suppress routine internal chatter.
- [x] `/ow:design` is registered.
- [x] `product_design` artifact contract and schema exist.
- [x] full validation passes.

## Follow-up Fixes

- [x] `P1`: Align `.openworkflow/config.yaml` adapter policy with global Codex prompt delivery.
- [x] `P2`: Split `/ow:design` required outputs from conditional design packets.
- [x] `P3`: Add automated M12 runtime surface assertions for minimal init, prompt frontmatter, and reference-only command files.
