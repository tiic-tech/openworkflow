# Evidence Notes

## Scope

Focused devlog package about one dogfood finding in the OpenWorkflow repository on 2026-05-22:

- The globally installed `openworkflow` binary exposed an older command surface.
- The repo-built dist CLI exposed the current dogfood command surface.
- The correct Agent entrypoint for current repo capabilities is `node dist/cli/src/index.js`.

This evidence supports the devlog only. It does not attempt to summarize all 2026-05-22 OpenWorkflow development.

## Evidence Map

| Evidence | Pointer | Why it matters |
| --- | --- | --- |
| Global CLI help | `artifacts/command_outputs/global-cli-help.txt` | Shows the old installed command surface: `init`, `validate`, `sync`, `doctor`, `clean`. |
| Dist CLI help | `artifacts/command_outputs/dist-cli-help.txt` | Shows the current repo command surface: `handoff`, `inspect`, `context`, `draft`, `register`, `summaries`, `git-automation`, etc. |
| Package bin | `package.json:22-24` | Confirms the package entrypoint maps `openworkflow` to `dist/cli/src/index.js`. |
| AGENTS dogfood instruction | `AGENTS.md:4-12` | Establishes the repo's Agent startup and dogfood read-model rules. |
| CLI dispatcher source | `packages/cli/src/index.ts:1-220` | Confirms current source dispatches the expanded command set and prints the expanded help text. |
| Dist status | `artifacts/command_outputs/dist-status.json` | Confirms repo health and current branch state through the dist CLI. |
| Git scope | `artifacts/command_outputs/git-log-scope.txt` | Shows the wider same-day development context, which this devlog intentionally does not fully narrate. |

## Synthesis Notes

The interesting point is not just that two commands returned different help text. The product lesson is that OpenWorkflow needs a reliable ability-discovery boundary for Agents. In a normal downstream repo, the installed `openworkflow` binary may be the right semantic entry. In the OpenWorkflow repo itself, the current source of truth for latest behavior is the built dist CLI.

This means Agent guidance should distinguish:

- command semantics: `openworkflow handoff --root . --json`
- version source: global installed package vs repo dist build
- managed surface: generated `.openworkflow`, `.agents`, and `AGENTS.md` files
- product source: registry, templates, schemas, and TypeScript implementation

## Privacy Notes

No secrets or private business details were found or included. The devlog avoids publishing absolute local user paths in the narrative. Command snippets are trimmed to relevant lines.

