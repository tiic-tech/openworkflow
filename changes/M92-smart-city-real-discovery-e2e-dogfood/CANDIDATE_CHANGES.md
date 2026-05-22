# M92 Smart City Real Discovery E2E Dogfood

Source of truth: `CANDIDATE_CHANGES.yaml`

Status: active

Target repo: `/Users/archy/Projects/StartUp/smart_city_copilot`

## Scope

Run one real discovery loop from raw concept input to first high-fidelity
prototype image batch. Stop before `/ow:tune` and before M91/proto2html.

## Candidates

| ID | Status | Risk | Title | Dependencies |
| --- | --- | --- | --- | --- |
| C001 | selected | medium | Run smart city discovery E2E dogfood | none |
| C002 | candidate | medium | Audit real discovery loop artifacts | C001 |

## Next Recommendation

`C001` is selected. It creates the target repo workflow artifacts and image batch.

## Deferred

- `M91-proto2html-benchmark-input`
- `M93-discovery-loop-audit-followups`
