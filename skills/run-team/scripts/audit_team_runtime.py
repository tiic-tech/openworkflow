#!/usr/bin/env python3
"""Audit a repo-local Agent Team runtime before /ow:team execution."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path
from typing import Any


def run_git(root: Path, args: list[str]) -> str:
    try:
        result = subprocess.run(
            ["git", *args],
            cwd=root,
            check=True,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
    except (OSError, subprocess.CalledProcessError):
        return ""
    return result.stdout.strip()


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except OSError:
        return ""


def first_match(text: str, pattern: str) -> str | None:
    match = re.search(pattern, text, flags=re.MULTILINE)
    return match.group(1).strip() if match else None


def normalize_optional_scalar(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip().strip("\"'")
    if cleaned.lower() in {"", "null", "none", "~"}:
        return None
    return cleaned


def count_values(text: str, key: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    for value in re.findall(rf"^\s*{re.escape(key)}:\s*([A-Za-z0-9_-]+)\s*$", text, flags=re.MULTILINE):
        counts[value] = counts.get(value, 0) + 1
    return counts


def list_files(path: Path, pattern: str) -> list[str]:
    if not path.exists():
        return []
    return [str(p) for p in sorted(path.glob(pattern))]


def audit(root: Path) -> dict[str, Any]:
    runtime = root / ".codex" / "runtime"
    runtime_index = runtime / "RUNTIME_INDEX.yaml"
    runtime_text = read_text(runtime_index)
    active_scope = normalize_optional_scalar(first_match(runtime_text, r"^active_scope:\s*(.+?)\s*$"))
    scope_root = runtime / "scopes" / active_scope if active_scope else None
    implement_index = scope_root / "IMPLEMENT_INDEX.yaml" if scope_root else None
    implement_text = read_text(implement_index) if implement_index else ""
    active_milestone = first_match(implement_text, r"^active_milestone:\s*([A-Za-z0-9_-]+)\s*$")

    scope_dirs = [p.name for p in sorted((runtime / "scopes").iterdir()) if p.is_dir()] if (runtime / "scopes").exists() else []
    milestone_root = scope_root / "milestones" if scope_root else None
    milestone_dirs = [p.name for p in sorted(milestone_root.iterdir()) if p.is_dir()] if milestone_root and milestone_root.exists() else []

    task_file = milestone_root / active_milestone / "IMPLEMENT_TASKS.yaml" if milestone_root and active_milestone else None
    issue_file = milestone_root / active_milestone / "IMPLEMENT_ISSUES.yaml" if milestone_root and active_milestone else None
    task_text = read_text(task_file) if task_file else ""
    issue_text = read_text(issue_file) if issue_file else ""

    archive_dirs_missing: list[str] = []
    for path in [runtime, scope_root, *(milestone_root / m for m in milestone_dirs)] if scope_root and milestone_root else [runtime]:
        if path and path.exists() and not (path / "archive").is_dir():
            archive_dirs_missing.append(str(path / "archive"))

    roster = scope_root / "AGENT_ROSTER.yaml" if scope_root else None
    roster_text = read_text(roster) if roster else ""
    active_agent_ids = re.findall(r"^\s*agent_id:\s*(?!null$)([A-Za-z0-9_.:-]+)\s*$", roster_text, flags=re.MULTILINE)

    return {
        "root": str(root),
        "git": {
            "branch": run_git(root, ["branch", "--show-current"]),
            "head": run_git(root, ["log", "--oneline", "-1"]),
            "status_short": run_git(root, ["status", "--short"]).splitlines(),
        },
        "runtime": {
            "exists": runtime.exists(),
            "active_scope": active_scope,
            "scopes": scope_dirs,
            "active_milestone": active_milestone,
            "milestones": milestone_dirs,
            "runtime_index": str(runtime_index),
            "scope_root": str(scope_root) if scope_root else None,
            "agent_roster": str(roster) if roster else None,
            "active_agent_ids": active_agent_ids,
            "task_file": str(task_file) if task_file else None,
            "task_status_counts": count_values(task_text, "status"),
            "task_agent_null_count": len(re.findall(r"^\s*agent_id:\s*null\s*$", task_text, flags=re.MULTILINE)),
            "issue_file": str(issue_file) if issue_file else None,
            "issue_status_counts": count_values(issue_text, "status"),
            "archive_dirs_missing": archive_dirs_missing,
        },
        "source_files": {
            "agent_guide": (root / "AGENT.md").exists(),
            "agent_protocol": (root / ".codex" / "agents" / "README.md").exists(),
            "orchestrator": (root / ".codex" / "agents" / "orchestrator.md").exists(),
            "design_spec": (root / "DESIGN_SPEC").is_dir(),
            "launch_checklist": (root / "LAUNCH_CHECKLIST.md").exists(),
        },
    }


def to_markdown(data: dict[str, Any]) -> str:
    git = data["git"]
    runtime = data["runtime"]
    lines = [
        "# Agent Team Runtime Audit",
        "",
        f"- Root: `{data['root']}`",
        f"- Branch: `{git['branch'] or 'unknown'}`",
        f"- HEAD: `{git['head'] or 'unknown'}`",
        f"- Dirty entries: {len(git['status_short'])}",
        f"- Runtime exists: {runtime['exists']}",
        f"- Active scope: `{runtime['active_scope'] or 'none'}`",
        f"- Active milestone: `{runtime['active_milestone'] or 'none'}`",
        f"- Scopes: {', '.join(runtime['scopes']) or 'none'}",
        f"- Milestones: {', '.join(runtime['milestones']) or 'none'}",
        f"- Task statuses: `{runtime['task_status_counts']}`",
        f"- Active task `agent_id: null` count: {runtime['task_agent_null_count']}",
        f"- Issue statuses: `{runtime['issue_status_counts']}`",
        f"- Roster ids tracked: {len(runtime['active_agent_ids'])}",
        f"- Missing archive dirs: {len(runtime['archive_dirs_missing'])}",
        "",
    ]
    if git["status_short"]:
        lines.append("## Dirty Worktree")
        lines.extend(f"- `{entry}`" for entry in git["status_short"])
        lines.append("")
    if runtime["archive_dirs_missing"]:
        lines.append("## Missing Archive Dirs")
        lines.extend(f"- `{entry}`" for entry in runtime["archive_dirs_missing"])
        lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit Agent Team runtime state.")
    parser.add_argument("--root", default=".", help="Repository root.")
    parser.add_argument("--format", choices=["json", "markdown"], default="json")
    args = parser.parse_args()

    data = audit(Path(args.root).expanduser().resolve())
    if args.format == "markdown":
        print(to_markdown(data))
    else:
        print(json.dumps(data, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
