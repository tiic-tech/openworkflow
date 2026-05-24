# M104 Agent Consumer Interview

Date: 2026-05-23

Context: This interview was conducted after the fourth smart city copilot E2E
dogfood run in `/Users/archy/Projects/StartUp/smart_city_copilot`, driven by
the OpenWorkflow main repository dist CLI. The goal is to recover intelligence
that can guide the next OpenWorkflow source-development priorities.

Target repository:

`/Users/archy/Projects/StartUp/smart_city_copilot`

OpenWorkflow main repository:

`/Users/archy/Projects/StartUp/openworkflow`

Relevant final target-repo audit:

`/Users/archy/Projects/StartUp/smart_city_copilot/docs/M104_FOURTH_DISCOVERY_E2E_ARTIFACT_AUDIT_REPORT.md`

## Interview Purpose

Capture the perspective of OW's first consumer: an Agent temporarily pulled
into a partially completed, multi-session, artifact-heavy task.

The interview focuses on:

- first impression of OW before deep source inspection
- where OW materially helped with breakpoint recovery
- what the same task would feel like without OW
- what capabilities would make OW a stronger Agent partner
- concrete source-development solutions suggested by the dogfood experience

## Q1: First Impression Of OW

Question:

As OW's first consumer Agent, before deeply inspecting OW source code, what is
your first impression of OW?

Answer:

OW no longer feels like "a pile of project documents for Agents." It feels like
an early Agent development operating system with state, gates, governance
boundaries, and recoverable artifacts.

The strongest positive signal is that the Agent does not have to start by
randomly reading files. `handoff --json`, `inspect --strict --json`, and
`summaries --strict --json` quickly answer:

- whether current context can be trusted
- what the next workflow command appears to be
- whether a blocker is an artifact-quality problem, a governance problem, or a
  missing evidence problem

In M104, the C004/C005 missing `LOCAL_COMMIT_EVIDENCE.yaml` failures were
especially useful because OW pointed to the exact candidate, exact missing
file, and repair route instead of reporting a vague unhealthy state.

OW also demonstrated real boundary enforcement. It helped prevent:

- entering `/ow:tune` when the M104 queue boundary required stopping at audit
- manually patching generated surfaces
- batching unrelated candidates into one checkpoint
- committing dirty paths outside the selected candidate scope
- switching branches from a dirty target tree

However, OW still feels like a strong protocol with some unstable adapter
edges. Examples from M104:

- `CURRENT_STATE.current_vision` remained `null` even though `VISION_CONTRACT`
  and strict summaries correctly identified `vision-m104` as current.
- `openworkflow summarize --write` generated a prototype summary shape that
  made `validate --json` fail.
- commit evidence was valuable, but the Agent still had to understand how to
  repair missing evidence links.

Overall judgment: OW's direction is correct. It significantly reduces Agent
blindness and task drift. The next stage should focus less on adding process
and more on making trust gates, lineage, commit evidence, and prompt2proto
metadata into lower-friction end-to-end loops.

## Q2: Help During Breakpoint Recovery

Question:

You were temporarily pulled into an interrupted breakpoint task. In what ways
did OW help you? What would the task feel like without OW?

Answer:

OW turned breakpoint recovery from guessing into auditing.

The target repo had:

- previous M97 artifacts
- a current M104 queue
- uncommitted prototype artifacts
- generated images
- commit-evidence gates
- a repo-local state pointing to `/ow:tune`
- a user boundary that explicitly stopped before tune

Without OW, the Agent would have had to infer state from `git status`, file
timestamps, directory names, commit logs, and user prose. It would have been
easy to make a reasonable but wrong decision, such as:

- treating existing `proto-m104` images as enough to mark C004 complete
- entering `/ow:tune` because `CURRENT_STATE.next_command` pointed there
- missing that direct drift images were comparison evidence, not accepted
  evidence
- missing that C004 was blocked only by local commit evidence
- modifying generated or managed surfaces manually

OW's useful surfaces were:

- `handoff --json`: identified the exact trust blocker.
- `CANDIDATE_CHANGES.yaml`: preserved queue boundary, dependencies, status,
  owned paths, acceptance, and next candidate.
- selected-change artifacts: explained why each candidate was selected and what
  it owned.
- `LOCAL_COMMIT_EVIDENCE.yaml`: made implementation checkpoints auditable.
- `git-automation`: enforced dirty-path scope and stopped an out-of-scope
  `.openworkflow/prototypes/proto-m104/SUMMARY.yaml` change during C005 until
  owned paths were reconciled.
- `summaries --strict`: distinguished "files exist" from "handoff can be
  trusted."

The key value was not that OW saved a few file reads. It supplied an executable
source of task truth: state, boundary, blocker, evidence, and commit governance
could be cross-checked.

## Q3: Desired OW Capabilities

Question:

If you could contribute to OW and make it your ultimate weapon and partner,
what would you most want OW to provide?

Answer:

The desired direction is an Agent cockpit: a system that always tells the Agent
"where I am, whether I can trust the state, and what the smallest correct next
action is."

The highest-value capabilities are:

1. Better breakpoint resume.

   OW should directly produce an actionable recovery view: current task
   boundary, previous completed candidate, current gap, what not to do,
   recommended next command, whether commit is allowed, and which artifacts are
   primary evidence versus auxiliary or comparison evidence.

2. Stronger artifact lineage.

   Image existence is not enough. OW should trace `vision_id -> validation_id
   -> prototype_id -> direction_id -> prompt_id -> image_id`, including whether
   an image is a board, accepted page output, auxiliary composite, fallback, or
   drift comparison.

3. Automatic commit-evidence closure.

   Commit evidence should be generated, linked, checked, and repaired by
   `git-automation`, not manually inferred by the Agent.

4. A real prompt2proto strategy engine.

   `/ow:proto` should understand generation modes such as
   `direct_per_page`, `composite_auxiliary`,
   `consistency_first_split_later`, `fallback_static_asset`,
   `metadata_only_fixture`, and `blocked_provider_unavailable`.

5. Stronger "do not do" enforcement.

   OW should make queue boundaries, forbidden outputs, owned paths, and user
   bans operationally visible before the Agent writes files or follows
   `CURRENT_STATE.next_command`.

The desired feeling is: the Agent can move quickly, but it is hard to drift out
of scope.

## Q4: Solid Source-Level Solutions

Question:

What concrete solutions would realize those capabilities?

Answer:

### 1. Add `resume --json`

Create a higher-level read model:

```bash
openworkflow resume --root . --json
```

This should aggregate existing signals from `handoff`, `inspect`, `summaries`,
`check`, queue files, and git state into a directly actionable packet.

The packet should include:

- active queue
- true current work item
- previous completed candidate
- current missing evidence
- whether queue boundary overrides `CURRENT_STATE.next_command`
- allowed actions
- forbidden actions
- recommended next command
- commit readiness
- primary evidence, auxiliary evidence, and comparison evidence

It should explicitly handle cases like M104: the workflow state says
`/ow:tune`, but the active queue says stop at C005 audit.

### 2. Add Artifact Lineage Graph

OW should model artifact lineage explicitly instead of relying on prose and file
names.

Example shape:

```yaml
lineage:
  vision_id: vision-m104
  validation_id: val-m104
  prototype_id: proto-m104
  directions:
    - direction_id: m104-map-ops
      prompts:
        - prompt_id: m104-map-ops-001-planning
          screen_id: m104-screen-planning
          generated_images:
            - image_id: m104-img-planning-approval
              role: accepted_page
              generation_mode: consistency_board_split_upscale
              source_board: m104-img-consistency-board
```

Validators should enforce:

- every page prompt has exactly one accepted page image, or an explicit
  skipped/failed record
- board/composite images cannot satisfy page-level acceptance
- fallback SVG/static assets cannot claim provider-backed generation
- prompt id, screen id, image id, and path resolve consistently
- decision evidence references the same lineage

### 3. Close Commit Evidence Automatically

`git-automation commit --commit-evidence --write` should own the full loop:

1. confirm selected candidate
2. confirm dirty paths are inside owned paths
3. create primary commit
4. write `LOCAL_COMMIT_EVIDENCE.yaml`
5. backfill completion evidence in `CANDIDATE_CHANGES.yaml`
6. backfill completion evidence in `SELECTED_CHANGE.yaml`
7. create evidence commit
8. rerun `validate`, `summaries --strict`, `handoff`, and `git diff --check`
9. report exact remaining blocker if any post-check fails

The Agent should not need to remember the queue fields that must reference the
evidence file.

### 4. Build Prompt2Proto Strategy Engine

`/ow:proto` should not have a single ambiguous "generate images" behavior. It
should select and record a generation strategy:

- `direct_per_page`
- `composite_auxiliary`
- `consistency_first_split_later`
- `fallback_static_asset`
- `metadata_only_fixture`
- `blocked_provider_unavailable`

For `consistency_first_split_later`, the pipeline should:

- consume generation-ready `vision2prompt` direction prompt and page prompts
- assemble a board-generation system prompt
- assemble one split/upscale prompt per target page
- choose board layout based on screen count and aspect ratio
- record board path, page paths, frame coordinates, placeholder policy,
  provider support, and provenance
- fail closed or mark fallback when image-to-image split/upscale is unavailable

### 5. Compile Boundaries Into Preflight Checks

Extract a reusable boundary engine from the current git-automation behavior.

Potential commands:

```bash
openworkflow check-write --root . --candidate C005 --paths ...
openworkflow check-commit --root . --queue ... --candidate C005 --json
```

The engine should answer:

- whether a path belongs to the current candidate
- whether the candidate may modify `.openworkflow`
- whether a generated or managed surface is being hand-edited
- whether queue boundary allows the next workflow command
- whether a user ban is still active
- whether a change is actually source work that needs a new queue

## Q5: Two-Step Image Prompt Recovery

Question:

The previous session lost the exact system prompts for the successful two-step
image strategy. What should OW preserve from that learning?

Answer:

The two-step strategy should be captured as a reusable template, not merely a
one-off observation.

Step 1 creates a consistency board. Step 2 extracts and upscales each
sub-screen while preserving UI content.

The key detail is board geometry. The board must preserve same-size,
same-ratio sub-screen frames. If the screen count creates an awkward grid,
OW should either:

- add blank placeholder frames so every occupied frame remains equal, or
- choose a dynamic board aspect ratio that exactly fits the count.

Examples:

- Three `16:9` screens can use a `2 x 2` board with a fourth blank placeholder.
- Three vertical screens can use a `16:27` board.
- Three horizontal screens can use a `48:9` board.
- A general grid can use `(16 * columns):(9 * rows)`.

This should be generated from the prompt pack after `vision2prompt` produces
the direction-level product prompt and page-level prompt paragraphs.

### Step 1 Board Prompt Template

```text
You are generating a consistency board for a multi-screen product prototype.
Use the supplied product prompt and page prompts as the only source of product
content. Create one large board image containing {screen_count} product screens
plus {placeholder_count} reserved blank placeholders if needed.

Layout contract:
- Target sub-screen aspect ratio: {screen_aspect_ratio}, default 16:9.
- Board layout: {layout_rows} rows x {layout_columns} columns.
- Board aspect ratio: {board_aspect_ratio}.
- Every occupied sub-screen frame must be exactly the same size and same
  aspect ratio.
- Do not stretch, crop, or resize any one sub-screen differently.
- Keep consistent app shell, navigation, typography, map/panel treatment,
  spacing, colors, density, component vocabulary, and interaction language
  across all occupied sub-screens.
- Reserved placeholder frames must remain blank framed spaces labeled only as
  reserved placeholders; they must not contain UI content.

Product system prompt:
{direction_prototype_prompt}

Occupied sub-screens:
{ordered_page_prompt_blocks}

Output requirement:
Generate one board image only. Each occupied frame must look like a complete
high-fidelity page of the same product. Preserve each page's scenario-specific
state, but solve the visual system globally across the whole board.
```

### Step 2 Split/Upscale Prompt Template

```text
You are extracting one page from an existing consistency board.
Use the provided board image as the source of truth. Do not redesign,
reinterpret, add, remove, or rewrite UI content.

Extraction contract:
- Target page: {target_prompt_id} / {target_screen_name}.
- Target frame position in board: row {row_index}, column {column_index}.
- Source board layout: {layout_rows} rows x {layout_columns} columns.
- Source sub-screen aspect ratio: {screen_aspect_ratio}, default 16:9.
- Output one independent high-resolution page image at the same aspect ratio.
- Crop only the target frame, remove board gutters and placeholder frames, and
  upscale/clarify the target page.
- Preserve the app shell, navigation, selected object, map geometry, panel
  hierarchy, copy placement, colors, density, and interaction controls from the
  board.
- Do not improve the design, change labels, invent new components, alter the
  selected object, or harmonize it beyond what is already present in the board.

Page prompt reference:
{target_page_prompt}

Output requirement:
Return exactly one standalone page image for {target_prompt_id}. The result
must be a faithful high-resolution extraction of the board sub-screen, not a
new design.
```

Source recommendation:

`vision2prompt` should emit stable direction and page prompt paragraphs.
`prompt2proto` should assemble these templates, calculate board layout, record
frame coordinates, and verify provider support for image-to-image split/upscale
before claiming `consistency_first_split_later` success.

## Development Priority Proposal

Recommended order:

1. `resume --json`
2. commit evidence automatic closure
3. artifact lineage graph
4. prompt2proto strategy engine with `consistency_first_split_later`
5. reusable boundary compiler

MVP recommendation:

Start with `resume --json` and commit evidence automatic closure. They do not
change OW's product direction, but they immediately make temporary Agent
handoff faster and safer.
