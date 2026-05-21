# G020 Implementation Brief

G020 implements the approved C pilot.

The new `draft-pr` action is safe by default:

- without `--write`, it only previews the draft PR payload
- with `--write`, it still refuses unless `--allow-draft-pr` is present
- it depends on the G019 remote read-only plan checks
- it refuses if the remote branch or target base is not readable

The pilot may create a draft PR or update an existing PR body using a managed
OpenWorkflow section. It does not push, merge, mark ready for review, mutate
Issues, force-push, reset, rebase, or delete branches.
