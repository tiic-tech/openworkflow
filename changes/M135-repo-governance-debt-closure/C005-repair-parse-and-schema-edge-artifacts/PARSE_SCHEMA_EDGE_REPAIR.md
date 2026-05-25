# M135 C005 Parse And Schema Edge Repair

## Repairs

- Quoted the M113 acceptance item that starts with `` `openworkflow` `` so the YAML parser accepts
  it as a scalar string.
- Added a mapping-shaped `prototype_system_contract` to the M98 smart city replay prompt pack with
  required fields for stable shell, navigation, data vocabulary, object anatomy, action bar, audit
  trust pattern, copy tone, and allowed screen deltas.

## Preservation

The M98 contract is derived from existing `product_experience_model`, `screen_manifest`, and
`global_design_system_prompt` content. It does not change the replay strategy, claim provider image
generation, or weaken validation.

## Validation

After the repair, C005-owned M113 YAML and M98 schema failures are expected to be removed from
`npm run validate`.
