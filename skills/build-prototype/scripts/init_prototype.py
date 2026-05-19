#!/usr/bin/env python3
"""Initialize OpenWorkflow prototype discovery artifacts."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


def q(value: str | None) -> str:
    return "null" if value is None else json.dumps(value)


def slugify(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9]+", "-", value.strip().lower()).strip("-") or "prototype"


def yaml_list(items: list[str], indent: int) -> str:
    prefix = " " * indent
    if not items:
        return f"{prefix}[]\n"
    return "".join(f"{prefix}- {q(item)}\n" for item in items)


def ensure_dir(path: Path, dry_run: bool) -> None:
    if dry_run:
        print(f"DIR  {path}")
        return
    path.mkdir(parents=True, exist_ok=True)


def write_file(path: Path, content: str, force: bool, dry_run: bool) -> None:
    if path.exists() and not force:
        print(f"SKIP {path}")
        return
    if dry_run:
        action = "OVERWRITE" if path.exists() else "WRITE"
        print(f"{action} {path}")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"WRITE {path}")


def touch_gitkeep(path: Path, dry_run: bool) -> None:
    gitkeep = path / ".gitkeep"
    if gitkeep.exists():
        return
    if dry_run:
        print(f"WRITE {gitkeep}")
        return
    gitkeep.write_text("", encoding="utf-8")


def todo_yaml(args: argparse.Namespace, prototype_id: str, artifact_path: str) -> str:
    todo_items = args.todo or [f"Build prototype surface for {item}" for item in args.include]
    lines = [
        "schema_version: 0.1.0",
        f"contract_id: prototype:{prototype_id}",
        "contract_type: prototype",
        f"title: {q(args.title)}",
        "status: planned",
        "source_artifacts:",
    ]
    lines.extend(f"  - {q(source)}" for source in args.source_artifact)
    lines.extend(
        [
            "depends_on:",
            f"  - {args.validation_contract}",
            "produces: []",
            f"validation_contract: {args.validation_contract}",
            f"core_question: {q(args.core_question)}",
            "prototype_scope:",
            "  include:",
        ]
    )
    lines.extend(f"    - {q(item)}" for item in args.include)
    lines.append("  exclude:")
    lines.extend(f"    - {q(item)}" for item in args.exclude)
    lines.append("todo:")
    for index, item in enumerate(todo_items, start=1):
        task_id = f"P{index:03d}"
        lines.extend(
            [
                f"  - task_id: {task_id}",
                f"    title: {q(item)}",
                "    status: planned",
                "    acceptance:",
                f"      - {q('Prototype demonstrates: ' + item)}",
            ]
        )
    lines.extend(
        [
            "acceptance:",
            *[f"  - {q(item)}" for item in args.acceptance],
            "artifact:",
            f"  path: {artifact_path}",
            f"  type: {args.artifact_type}",
            "decision_handoff:",
            "  target: /ow:decision",
            "  requires_user_review: true",
            "result_artifact: RESULT.md",
            "evidence_artifact: EVIDENCE.md",
            "prototype_plan: PROTOTYPE_PLAN.md",
            "updated_at: null",
        ]
    )
    return "\n".join(lines) + "\n"


def prototype_plan(args: argparse.Namespace, prototype_id: str, artifact_path: str) -> str:
    return f"""# Prototype Plan: {args.title}

Prototype id: `prototype:{prototype_id}`

Validation source: `{args.validation_contract}`

## Core Question

{args.core_question}

## Build

{bullet_list(args.include)}

## Do Not Build

{bullet_list(args.exclude)}

## Artifact

- Path: `{artifact_path}`
- Type: `{args.artifact_type}`

## Acceptance

{bullet_list(args.acceptance)}

## Decision Handoff

After local review, use `/ow:decision` to record whether this prototype
supports `continue`, `pivot`, `stop`, or `needs_more_evidence`.
"""


def result_doc(args: argparse.Namespace, prototype_id: str) -> str:
    return f"""# Prototype Result: {args.title}

Prototype id: `prototype:{prototype_id}`

Status: pending user review

## Outcome

Pending. Do not create production specs or changes until `/ow:decision`
records the outcome.
"""


def evidence_doc(args: argparse.Namespace, prototype_id: str, artifact_path: str) -> str:
    return f"""# Prototype Evidence: {args.title}

Prototype id: `prototype:{prototype_id}`

## Artifact

- `{artifact_path}`

## Review Notes

- Pending local review.

## Known Constraints

- Prototype scope excludes production hardening unless explicitly listed in
  `TODO.yaml`.
"""


def artifact_placeholder(args: argparse.Namespace, prototype_id: str) -> str:
    return f"""<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
  <title>{args.title}</title>
  <style>
    body {{ font-family: system-ui, sans-serif; margin: 2rem; line-height: 1.5; }}
    main {{ max-width: 760px; }}
    code {{ background: #f4f4f4; padding: 0.1rem 0.25rem; }}
  </style>
</head>
<body>
  <main>
    <h1>{args.title}</h1>
    <p><strong>Prototype id:</strong> <code>prototype:{prototype_id}</code></p>
    <p><strong>Core question:</strong> {args.core_question}</p>
    <p>Replace this placeholder with the smallest local artifact that can answer the validation question.</p>
  </main>
</body>
</html>
"""


def bullet_list(items: list[str]) -> str:
    if not items:
        return "- None."
    return "\n".join(f"- {item}" for item in items)


def init_prototype(args: argparse.Namespace) -> None:
    root = Path(args.root).expanduser().resolve()
    prototype_id = args.prototype_id or slugify(args.title)
    target = root / ".codex" / "prototypes" / prototype_id
    artifact_dir = target / "artifact"
    archive_dir = target / "archive"
    artifact_path = f".codex/prototypes/{prototype_id}/artifact/{args.artifact_name}"

    for directory in [target, artifact_dir, archive_dir]:
        ensure_dir(directory, args.dry_run)
    touch_gitkeep(archive_dir, args.dry_run)

    write_file(target / "TODO.yaml", todo_yaml(args, prototype_id, artifact_path), args.force, args.dry_run)
    write_file(target / "PROTOTYPE_PLAN.md", prototype_plan(args, prototype_id, artifact_path), args.force, args.dry_run)
    write_file(target / "RESULT.md", result_doc(args, prototype_id), args.force, args.dry_run)
    write_file(target / "EVIDENCE.md", evidence_doc(args, prototype_id, artifact_path), args.force, args.dry_run)
    if args.artifact_type == "single_html":
        write_file(artifact_dir / args.artifact_name, artifact_placeholder(args, prototype_id), args.force, args.dry_run)
    else:
        touch_gitkeep(artifact_dir, args.dry_run)


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Initialize prototype discovery artifacts.")
    p.add_argument("--root", default=".", help="Repository root.")
    p.add_argument("--prototype-id", default=None, help="Stable prototype slug.")
    p.add_argument("--title", required=True, help="Prototype title.")
    p.add_argument("--validation-contract", required=True, help="Upstream validation contract id.")
    p.add_argument("--source-artifact", action="append", default=[], help="Source artifact path. Repeatable.")
    p.add_argument("--core-question", required=True, help="The validation question this prototype answers.")
    p.add_argument("--include", action="append", default=[], help="Prototype inclusion. Repeatable.")
    p.add_argument("--exclude", action="append", default=[], help="Prototype exclusion. Repeatable.")
    p.add_argument("--todo", action="append", default=[], help="Prototype todo. Repeatable.")
    p.add_argument("--acceptance", action="append", default=[], help="Acceptance evidence. Repeatable.")
    p.add_argument("--artifact-type", default="single_html", help="Artifact type, default single_html.")
    p.add_argument("--artifact-name", default="index.html", help="Artifact filename.")
    p.add_argument("--force", action="store_true", help="Overwrite existing artifacts.")
    p.add_argument("--dry-run", action="store_true", help="Print writes without changing files.")
    return p


def main() -> int:
    init_prototype(parser().parse_args())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
