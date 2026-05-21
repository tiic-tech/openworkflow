# M63 Implementation Brief

## Goal

Update `build-prototype` so source-level `/ow:proto` can generate strategic
prototype prompt packs from vision-only or validation-present input.

## Read First

- `changes/M59-proto-redesign-planning-dogfood/CANDIDATE_CHANGES.yaml`
- `references/proto-redesign-artifact-contracts.md`
- `skills/build-prototype/SKILL.md`
- `/Users/archy/Downloads/vision_to_strategic_prototype_prompt_skill.zip`

## Do

- Preserve the M61 validation consumption policy.
- Make image-first strategic prompt packs the preferred source behavior.
- Add hypothesis generation and prompt-pack quality gates.
- Keep local runnable prototypes as a secondary path.
- Update M59 queue operations for P002.

## Do Not

- Do not implement tune/refinement behavior.
- Do not expose runtime command surfaces.
- Do not add validation automation.
- Do not add HTML conversion.
- Do not edit generated `.agents` or `.openworkflow` surfaces.

## Owned Paths

- `skills/build-prototype/`
- `changes/M63-proto-vision-to-strategic-prompt-source/`
- `changes/M59-proto-redesign-planning-dogfood/CANDIDATE_CHANGES.yaml`

## Validation

```bash
python3 /Users/archy/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/build-prototype
npm run validate
```

## Stop Conditions

- Stop if tune behavior becomes necessary.
- Stop if runtime command or adapter exposure is needed.
- Stop if validation automation is needed.
