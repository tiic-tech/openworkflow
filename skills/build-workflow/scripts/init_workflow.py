#!/usr/bin/env python3
"""Initialize OpenWorkflow upstream contract infrastructure.

The script creates missing repo-local contract folders and seed files. It is
conservative by default: existing files are not overwritten unless --force is
provided.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path


def q(value: str | None) -> str:
    return "null" if value is None else json.dumps(value)


def slugify(value: str) -> str:
    slug = re.sub(r"[^A-Za-z0-9]+", "-", value.strip().lower()).strip("-")
    return slug or "project"


def git_ref(root: Path) -> str | None:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=root,
            check=True,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
    except (OSError, subprocess.CalledProcessError):
        return None
    return result.stdout.strip() or None


def detect_sources(root: Path) -> list[str]:
    candidates = [
        "AGENT.md",
        "README.md",
        "README",
        "build_system_vision.md",
        "ROADMAP.md",
        "SPEC.md",
    ]
    sources = [candidate for candidate in candidates if (root / candidate).exists()]
    if (root / "docs").is_dir():
        sources.append("docs/")
    return sources or ["AGENT.md"]


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


def workflow_index(project_slug: str, project_title: str, sources: list[str], ref: str | None) -> str:
    contract_id = f"workflow:{project_slug}"
    return (
        "schema_version: 0.1.0\n"
        f"contract_id: {contract_id}\n"
        "contract_type: workflow\n"
        f"title: {q(project_title + ' workflow index')}\n"
        "status: active\n"
        "workflow_root: .codex\n"
        "active_change: null\n"
        "source_artifacts:\n"
        f"{yaml_list(sources, 2)}"
        f"base_git_ref: {q(ref)}\n"
        "contracts:\n"
        f"  - contract_id: {contract_id}\n"
        "    contract_type: workflow\n"
        "    path: .codex/workflow/WORKFLOW_INDEX.yaml\n"
        "    status: active\n"
        "  - contract_id: workflow:contract-graph\n"
        "    contract_type: workflow\n"
        "    path: .codex/workflow/CONTRACT_GRAPH.yaml\n"
        "    status: active\n"
        "  - contract_id: context:default\n"
        "    contract_type: context\n"
        "    path: .codex/context/CONTEXT_MAP.yaml\n"
        "    status: draft\n"
        "  - contract_id: vision:default\n"
        "    contract_type: vision\n"
        "    path: .codex/vision/VISION_CONTRACT.yaml\n"
        "    status: draft\n"
        "  - contract_id: decision:index\n"
        "    contract_type: decision\n"
        "    path: .codex/decisions/DECISION_INDEX.yaml\n"
        "    status: active\n"
        "  - contract_id: spec:index\n"
        "    contract_type: spec\n"
        "    path: .codex/spec/SPEC_INDEX.yaml\n"
        "    status: active\n"
    )


def contract_graph(project_slug: str) -> str:
    workflow_id = f"workflow:{project_slug}"
    return (
        "schema_version: 0.1.0\n"
        "contract_id: workflow:contract-graph\n"
        "contract_type: workflow\n"
        "title: OpenWorkflow contract graph\n"
        "status: active\n"
        "nodes:\n"
        f"  - contract_id: {workflow_id}\n"
        "    contract_type: workflow\n"
        "    path: .codex/workflow/WORKFLOW_INDEX.yaml\n"
        "  - contract_id: context:default\n"
        "    contract_type: context\n"
        "    path: .codex/context/CONTEXT_MAP.yaml\n"
        "  - contract_id: vision:default\n"
        "    contract_type: vision\n"
        "    path: .codex/vision/VISION_CONTRACT.yaml\n"
        "  - contract_id: decision:index\n"
        "    contract_type: decision\n"
        "    path: .codex/decisions/DECISION_INDEX.yaml\n"
        "  - contract_id: spec:index\n"
        "    contract_type: spec\n"
        "    path: .codex/spec/SPEC_INDEX.yaml\n"
        "edges:\n"
        f"  - from: {workflow_id}\n"
        "    to: context:default\n"
        "    relation: initializes\n"
        "  - from: context:default\n"
        "    to: vision:default\n"
        "    relation: informs\n"
        "  - from: vision:default\n"
        "    to: decision:index\n"
        "    relation: constrains\n"
        "  - from: decision:index\n"
        "    to: spec:index\n"
        "    relation: constrains\n"
    )


def context_map(project_title: str, sources: list[str]) -> str:
    return (
        "schema_version: 0.1.0\n"
        "contract_id: context:default\n"
        "contract_type: context\n"
        f"title: {q(project_title + ' shared context')}\n"
        "status: draft\n"
        "source_artifacts:\n"
        f"{yaml_list(sources, 2)}"
        "glossary: .codex/context/GLOSSARY.yaml\n"
        "repo_map: []\n"
        "source_references: []\n"
        "depends_on:\n"
        "  - workflow:contract-graph\n"
        "produces:\n"
        "  - vision:default\n"
        "updated_at: null\n"
    )


def glossary(project_title: str) -> str:
    return (
        "schema_version: 0.1.0\n"
        "contract_id: context:glossary\n"
        "contract_type: context\n"
        f"title: {q(project_title + ' glossary')}\n"
        "status: draft\n"
        "terms: []\n"
        "updated_at: null\n"
    )


def vision_contract(project_title: str) -> str:
    return (
        "schema_version: 0.1.0\n"
        "contract_id: vision:default\n"
        "contract_type: vision\n"
        f"title: {q(project_title + ' vision')}\n"
        "status: draft\n"
        "depends_on:\n"
        "  - context:default\n"
        "produces:\n"
        "  - decision:index\n"
        "goals: []\n"
        "non_goals: []\n"
        "users: []\n"
        "quality_bar: []\n"
        "decision_priorities: []\n"
        "updated_at: null\n"
    )


def decision_index(project_title: str) -> str:
    return (
        "schema_version: 0.1.0\n"
        "contract_id: decision:index\n"
        "contract_type: decision\n"
        f"title: {q(project_title + ' decision index')}\n"
        "status: active\n"
        "depends_on:\n"
        "  - vision:default\n"
        "produces:\n"
        "  - spec:index\n"
        "decisions: []\n"
        "updated_at: null\n"
    )


def spec_index(project_title: str) -> str:
    return (
        "schema_version: 0.1.0\n"
        "contract_id: spec:index\n"
        "contract_type: spec\n"
        f"title: {q(project_title + ' spec index')}\n"
        "status: active\n"
        "depends_on:\n"
        "  - decision:index\n"
        "produces: []\n"
        "specs: []\n"
        "updated_at: null\n"
    )


def context_doc(project_title: str) -> str:
    return (
        f"# {project_title} Context\n\n"
        "This file is the human-readable project context surface. Keep durable\n"
        "indexes and machine-readable references in `CONTEXT_MAP.yaml` and\n"
        "`GLOSSARY.yaml`.\n"
    )


def vision_doc(project_title: str) -> str:
    return (
        f"# {project_title} Vision\n\n"
        "This file is the human-readable project direction. Keep machine-readable\n"
        "goals, non-goals, users, quality bars, and priorities in\n"
        "`VISION_CONTRACT.yaml`.\n"
    )


def init_workflow(args: argparse.Namespace) -> None:
    root = Path(args.root).expanduser().resolve()
    project_title = args.project_title or root.name
    project_slug = slugify(args.project_slug or project_title)
    sources = args.source_artifact or detect_sources(root)
    ref = git_ref(root)

    codex = root / ".codex"
    dirs = [
        codex / "workflow",
        codex / "workflow" / "archive",
        codex / "context",
        codex / "context" / "archive",
        codex / "vision",
        codex / "vision" / "archive",
        codex / "decisions",
        codex / "decisions" / "archive",
        codex / "spec",
        codex / "spec" / "archive",
        codex / "changes",
        codex / "changes" / "archive",
    ]
    for directory in dirs:
        ensure_dir(directory, args.dry_run)
    for directory in dirs:
        if directory.name == "archive":
            touch_gitkeep(directory, args.dry_run)

    write_file(
        codex / "workflow" / "WORKFLOW_INDEX.yaml",
        workflow_index(project_slug, project_title, sources, ref),
        args.force,
        args.dry_run,
    )
    write_file(
        codex / "workflow" / "CONTRACT_GRAPH.yaml",
        contract_graph(project_slug),
        args.force,
        args.dry_run,
    )
    write_file(codex / "context" / "CONTEXT.md", context_doc(project_title), args.force, args.dry_run)
    write_file(
        codex / "context" / "CONTEXT_MAP.yaml",
        context_map(project_title, sources),
        args.force,
        args.dry_run,
    )
    write_file(codex / "context" / "GLOSSARY.yaml", glossary(project_title), args.force, args.dry_run)
    write_file(codex / "vision" / "VISION.md", vision_doc(project_title), args.force, args.dry_run)
    write_file(
        codex / "vision" / "VISION_CONTRACT.yaml",
        vision_contract(project_title),
        args.force,
        args.dry_run,
    )
    write_file(
        codex / "decisions" / "DECISION_INDEX.yaml",
        decision_index(project_title),
        args.force,
        args.dry_run,
    )
    write_file(codex / "spec" / "SPEC_INDEX.yaml", spec_index(project_title), args.force, args.dry_run)


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Initialize OpenWorkflow contract infrastructure.")
    p.add_argument("--root", default=".", help="Repository root. Defaults to current directory.")
    p.add_argument("--project-title", default=None, help="Human-readable project title.")
    p.add_argument("--project-slug", default=None, help="Stable contract slug. Defaults to project title.")
    p.add_argument("--source-artifact", action="append", default=[], help="Source artifact path. Repeatable.")
    p.add_argument("--force", action="store_true", help="Overwrite existing files.")
    p.add_argument("--dry-run", action="store_true", help="Print writes without changing files.")
    return p


def main() -> int:
    init_workflow(parser().parse_args())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

