# Prompt-Pack Compiler Protocol

Use this reference when `build-proto-prompt` compiles durable vision and
validation into a `PROTO_PROMPT_PACK`.

## Role Coupling

The Co-Founder lens asks what product should exist and why this prototype is
worth generating. It rejects generic dashboards, card walls, chatbots, report
screens, and visual skins when those forms do not express the product thesis.

The Chief PM lens asks whether the prompt pack will reduce the validation risk.
It protects include/exclude scope, user decision context, success signals,
trust boundaries, and handoff readiness.

## Required Compiler Outputs

The prompt pack should include:

- normalized input;
- strategic core;
- prototype brief;
- product experience model;
- prototype system contract;
- screen manifest;
- global design system prompt;
- direction-level prototype prompts;
- screen-bound prompts;
- quality rubric;
- prompt text manifest;
- prompt-pack integrity gate;
- prototype reality gate;
- post-validate gate;
- image generation state set to `not_started`;
- review plan.

## Readiness Rules

Do not mark the prompt pack ready until:

- prompt paragraphs are dailin-grade long-form prototype-generation briefs;
- `prototype_system_contract` states cross-screen invariants separately from
  screen-specific state deltas;
- every direction has product thesis, user transformation, reason-to-exist,
  differentiated product form, and PM judgment;
- screen prompts resolve to screen manifest ids;
- screen prompts include journey, interaction behavior, system response, trust
  controls, anti-goals, visual direction, desired user feeling, and concrete
  content;
- integrity, prototype reality, prompt executability, paragraph quality, and
  post-validation gates pass.

## Repair Rule

If a gate fails, repair the prompt pack in this compiler stage. Do not route
thin or incoherent prompt text to `prompt2proto`.

## Prototype System Contract

Write this contract before screen prompts so downstream visual translation
knows what must stay stable across screens:

- `stable_app_shell`: persistent frame, navigation, header, workspace regions,
  and canvas behavior.
- `navigation_taxonomy`: sections, routes, tabs, modules, or modes that should
  not drift between screens.
- `data_vocabulary`: domain objects, field names, status labels, metric names,
  and formatting rules.
- `domain_object_anatomy`: what makes each core object recognizable.
- `object_detail_anatomy`: detail drawer, side panel, inspector, or modal
  structure that repeats across states.
- `action_bar_contract`: primary and secondary action placement, labels,
  confirmation patterns, and disabled states.
- `audit_trust_pattern`: provenance, approval, privacy, safety, audit, and
  human-control surfaces.
- `copy_tone`: stable tone for operational text and AI/system copy.
- `allowed_screen_deltas`: what may change by journey stage, selected object,
  viewport, state, or workflow step.

This is a technical consistency contract. Do not use it to claim visual parity.
