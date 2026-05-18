#!/usr/bin/env python3
"""Initialize OpenWorkflow validation-first artifacts."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


def q(value: str | None) -> str:
    return "null" if value is None else json.dumps(value)


def slugify(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9]+", "-", value.strip().lower()).strip("-") or "validation"


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


def validation_yaml(args: argparse.Namespace, validation_id: str) -> str:
    title = args.title
    vision_ref = args.vision_ref
    source_artifacts = args.source_artifact or []
    return (
        "schema_version: 0.1.0\n"
        f"contract_id: validation:{validation_id}\n"
        "contract_type: validation\n"
        f"title: {q(title)}\n"
        "status: active\n"
        "source_artifacts:\n"
        f"{yaml_list(source_artifacts, 2)}"
        "depends_on:\n"
        f"  - {vision_ref}\n"
        "produces: []\n"
        f"core_question: {q(args.core_question)}\n"
        "feature_classification:\n"
        "  existential:\n"
        f"{yaml_list(args.existential, 4)}"
        "  supporting:\n"
        f"{yaml_list(args.supporting, 4)}"
        "  later:\n"
        f"{yaml_list(args.later, 4)}"
        "  out_of_scope:\n"
        f"{yaml_list(args.out_of_scope, 4)}"
        "critical_assumptions:\n"
        f"{yaml_list(args.assumption, 2)}"
        "prototype_scope:\n"
        "  include:\n"
        f"{yaml_list(args.include, 4)}"
        "  exclude:\n"
        f"{yaml_list(args.exclude, 4)}"
        "acceptance:\n"
        f"{yaml_list(args.acceptance, 2)}"
        "decision_options:\n"
        "  - continue\n"
        "  - pivot\n"
        "  - stop\n"
        "  - needs_more_evidence\n"
        "result_artifact: RESULT.md\n"
        "prototype_brief: PROTOTYPE_BRIEF.md\n"
        "updated_at: null\n"
    )


def prototype_brief(args: argparse.Namespace, validation_id: str) -> str:
    return f"""# Prototype Brief: {args.title}

Validation id: `validation:{validation_id}`

## Core Question

{args.core_question}

## Include

{bullet_list(args.include)}

## Exclude

{bullet_list(args.exclude)}

## Acceptance Evidence

{bullet_list(args.acceptance)}

## Handoff

Build the smallest prototype that can answer the core question. Do not add
production features unless they directly affect the validation result.
"""


def result_doc(args: argparse.Namespace, validation_id: str) -> str:
    return f"""# Validation Result: {args.title}

Validation id: `validation:{validation_id}`

Status: pending

## Evidence

- Pending prototype review.

## Decision

Pending. Choose one: continue, pivot, stop, needs_more_evidence.
"""


def bullet_list(items: list[str]) -> str:
    if not items:
        return "- None."
    return "\n".join(f"- {item}" for item in items)


def init_validation(args: argparse.Namespace) -> None:
    root = Path(args.root).expanduser().resolve()
    validation_id = args.validation_id or slugify(args.title)
    target = root / ".codex" / "validation" / validation_id
    archive = target / "archive"
    ensure_dir(target, args.dry_run)
    ensure_dir(archive, args.dry_run)
    touch_gitkeep(archive, args.dry_run)
    write_file(target / "VALIDATION.yaml", validation_yaml(args, validation_id), args.force, args.dry_run)
    write_file(target / "PROTOTYPE_BRIEF.md", prototype_brief(args, validation_id), args.force, args.dry_run)
    write_file(target / "RESULT.md", result_doc(args, validation_id), args.force, args.dry_run)


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Initialize validation-first artifacts.")
    p.add_argument("--root", default=".", help="Repository root.")
    p.add_argument("--validation-id", default=None, help="Stable validation slug.")
    p.add_argument("--title", required=True, help="Validation title.")
    p.add_argument("--vision-ref", default="vision:default", help="Upstream vision contract id.")
    p.add_argument("--source-artifact", action="append", default=[], help="Source artifact path. Repeatable.")
    p.add_argument("--core-question", required=True, help="The question the prototype must answer.")
    p.add_argument("--existential", action="append", default=[], help="Existential feature. Repeatable.")
    p.add_argument("--supporting", action="append", default=[], help="Supporting feature. Repeatable.")
    p.add_argument("--later", action="append", default=[], help="Later feature. Repeatable.")
    p.add_argument("--out-of-scope", action="append", default=[], help="Out-of-scope feature. Repeatable.")
    p.add_argument("--assumption", action="append", default=[], help="Critical assumption. Repeatable.")
    p.add_argument("--include", action="append", default=[], help="Prototype inclusion. Repeatable.")
    p.add_argument("--exclude", action="append", default=[], help="Prototype exclusion. Repeatable.")
    p.add_argument("--acceptance", action="append", default=[], help="Acceptance evidence. Repeatable.")
    p.add_argument("--force", action="store_true", help="Overwrite existing artifacts.")
    p.add_argument("--dry-run", action="store_true", help="Print writes without changing files.")
    return p


def main() -> int:
    init_validation(parser().parse_args())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

