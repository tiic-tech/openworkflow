#!/usr/bin/env python3
"""Initialize a next Agent Team scope for /ow:team execution."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Milestone:
    milestone_id: str
    title: str


def q(value: str | None) -> str:
    return "null" if value is None else json.dumps(value)


def slugify(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9]+", "-", value.strip().lower()).strip("-") or "milestone"


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


def parse_milestone(raw: str) -> Milestone:
    for sep in (":", "=", "|"):
        if sep in raw:
            left, right = raw.split(sep, 1)
            return Milestone(left.strip().upper(), right.strip())
    match = re.match(r"^(M\d+)\s+(.+)$", raw.strip(), flags=re.IGNORECASE)
    if match:
        return Milestone(match.group(1).upper(), match.group(2).strip())
    raise ValueError(f"milestone must look like M01:Title, got {raw!r}")


def write_file(path: Path, content: str, force: bool) -> None:
    if path.exists() and not force:
        print(f"SKIP {path}")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"WRITE {path}")


def touch(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_text("", encoding="utf-8")
        print(f"WRITE {path}")


def yaml_list(items: list[str], indent: int) -> str:
    prefix = " " * indent
    if not items:
        return f"{prefix}[]\n"
    return "".join(f"{prefix}- {q(item)}\n" for item in items)


def scope_yaml(scope_id: str, title: str, sources: list[str], app_roots: list[str], ref: str | None) -> str:
    return (
        f"scope_id: {scope_id}\n"
        f"title: {q(title)}\n"
        "status: active\n"
        "source_artifacts:\n"
        f"{yaml_list(sources, 2)}"
        f"base_git_ref: {q(ref)}\n"
        "runtime_protocol:\n"
        "  agent_team_protocol: .codex/agents/README.md\n"
        "  orchestrator_role: .codex/agents/orchestrator.md\n"
        f"  agent_roster: .codex/runtime/scopes/{scope_id}/AGENT_ROSTER.yaml\n"
        "boundary:\n"
        "  application_roots:\n"
        f"{yaml_list(app_roots, 4)}"
        "  protected_roots:\n"
        "    - .git/\n"
        "    - .codex/runtime/\n"
    )


def milestones_yaml(scope_id: str, sources: list[str], milestones: list[Milestone]) -> str:
    lines = [f"scope_id: {scope_id}", "source_artifacts:"]
    lines.extend(f"  - {q(source)}" for source in sources)
    lines.append("milestones:")
    for index, milestone in enumerate(milestones):
        status = "active" if index == 0 else "planned"
        lines.extend(
            [
                f"  - milestone_id: {milestone.milestone_id}",
                f"    title: {q(milestone.title)}",
                f"    status: {status}",
                f"    scope: {q('Deliver ' + milestone.title + '.')}",
                "    target: Complete expected artifacts and pass QA gate.",
                "    dependencies: []",
                "    required_specs:",
            ]
        )
        lines.extend(f"      - {q(source)}" for source in sources)
        lines.extend(
            [
                "    expected_artifacts: []",
                "    estimated_atom_tasks: 3-8",
                f"    task_file: .codex/runtime/scopes/{scope_id}/milestones/{milestone.milestone_id}/IMPLEMENT_TASKS.yaml",
                f"    issue_file: .codex/runtime/scopes/{scope_id}/milestones/{milestone.milestone_id}/IMPLEMENT_ISSUES.yaml",
                "    qa_gate:",
                "      - required checks pass or skipped checks are documented",
                "    acceptance:",
                "      - runtime state matches implementation reality",
            ]
        )
    return "\n".join(lines) + "\n"


def implement_index(scope_id: str, milestones: list[Milestone]) -> str:
    active = milestones[0].milestone_id
    lines = [f"scope_id: {scope_id}", f"active_milestone: {active}", "milestones:"]
    for index, milestone in enumerate(milestones):
        status = "active" if index == 0 else "planned"
        lines.extend(
            [
                f"  - milestone_id: {milestone.milestone_id}",
                f"    status: {status}",
                f"    title: {q(milestone.title)}",
                f"    task_file: .codex/runtime/scopes/{scope_id}/milestones/{milestone.milestone_id}/IMPLEMENT_TASKS.yaml",
                f"    issue_file: .codex/runtime/scopes/{scope_id}/milestones/{milestone.milestone_id}/IMPLEMENT_ISSUES.yaml",
                "    qa_report: null",
                f"    branch: feat/{milestone.milestone_id.lower()}-{slugify(milestone.title)}",
                "    last_checkpoint: null",
            ]
        )
    return "\n".join(lines) + "\n"


def agent_roster(scope_id: str, app_roots: list[str]) -> str:
    impl_owns = ["frontend/src/app/", "frontend/src/components/", "frontend/src/systems/", "frontend/tests/"]
    if not any(root.startswith("frontend") for root in app_roots):
        impl_owns = app_roots or ["src/", "tests/"]
    lines = [
        f"scope_id: {scope_id}",
        "roster_version: 1",
        "updated_at: null",
        "lifecycle_status_values:",
        "  - available",
        "  - active",
        "  - idle",
        "  - blocked",
        "  - closed",
        "  - archived",
        "  - legacy_untracked",
        "session_policies:",
        "  persistent:",
        "    purpose: Keep domain agents mounted across related atom tasks and issue-fix loops.",
        "    reuse_rule: Resume the existing matching agent_id before spawning a replacement.",
        "  event:",
        "    purpose: Run async or one-off review, security, QA, and git drafting work.",
        "    reuse_rule: Close after handoff unless the Orchestrator records a reason to keep it idle.",
        "persistent_agents:",
        "  - agent_name: tech-prompt-agent",
        "    agent_id: null",
        "    lifecycle_status: available",
        "    session_policy: persistent",
        "    owns:",
        f"      - .codex/runtime/scopes/{scope_id}/milestones/*/prompts/",
        "    current_task: null",
        "    last_completed_task: null",
        "    active_milestone: null",
        "    notes: Spawn once for prompt planning, then resume for related prompts.",
        "  - agent_name: implementation-agent",
        "    agent_id: null",
        "    lifecycle_status: available",
        "    session_policy: persistent",
        "    owns:",
    ]
    lines.extend(f"      - {path}" for path in impl_owns)
    lines.extend(
        [
            "    current_task: null",
            "    last_completed_task: null",
            "    active_milestone: null",
            "    notes: Rename to the repo domain agent before assignment, such as frontend-agent, backend-agent, or content-schema-agent.",
            "event_agents:",
            "  - agent_name: code-review-agent",
            "    agent_id: null",
            "    lifecycle_status: available",
            "    session_policy: event",
            "    trigger: artifact_ready",
            "    closes_after_handoff: true",
            "  - agent_name: tdd-qa-agent",
            "    agent_id: null",
            "    lifecycle_status: available",
            "    session_policy: event",
            "    trigger: qa_gate",
            "    closes_after_handoff: true",
            "  - agent_name: security-review-agent",
            "    agent_id: null",
            "    lifecycle_status: available",
            "    session_policy: event",
            "    trigger: security_sensitive_change",
            "    closes_after_handoff: true",
            "  - agent_name: git-release-agent",
            "    agent_id: null",
            "    lifecycle_status: available",
            "    session_policy: event",
            "    trigger: checkpoint_or_release",
            "    closes_after_handoff: true",
            "legacy_tracking:",
            "  task_agent_ids_before_roster: legacy_untracked",
            "  note: Do not invent ids for historical null task agent_id values.",
        ]
    )
    return "\n".join(lines) + "\n"


def update_runtime_index(runtime_index: Path, scope_id: str, title: str, source: str, ref: str | None, activate: bool) -> None:
    block = (
        f"  - scope_id: {scope_id}\n"
        f"    title: {q(title)}\n"
        "    status: active\n"
        f"    source: {q(source)}\n"
        f"    path: .codex/runtime/scopes/{scope_id}/\n"
        f"    base_git_ref: {q(ref)}\n"
    )
    if not runtime_index.exists():
        active = scope_id if activate else "null"
        write_file(runtime_index, f"active_scope: {active}\nscopes:\n{block}", False)
        return
    text = runtime_index.read_text(encoding="utf-8")
    if activate:
        text = re.sub(r"^active_scope:\s*.*$", f"active_scope: {scope_id}", text, flags=re.MULTILINE)
    if not re.search(rf"^\s*-\s*scope_id:\s*{re.escape(scope_id)}\s*$", text, flags=re.MULTILINE):
        if re.search(r"^scopes:\s*\[\]\s*$", text, flags=re.MULTILINE):
            text = re.sub(r"^scopes:\s*\[\]\s*$", f"scopes:\n{block.rstrip()}", text, flags=re.MULTILINE)
        else:
            if not text.endswith("\n"):
                text += "\n"
            text += block
    runtime_index.write_text(text, encoding="utf-8")
    print(f"WRITE {runtime_index}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Initialize a next Agent Team scope.")
    parser.add_argument("--root", default=".", help="Repository root.")
    parser.add_argument("--scope-id", required=True, help="New scope id, for example V1 or POST_MVP.")
    parser.add_argument("--scope-title", required=True, help="Human-readable scope title.")
    parser.add_argument("--source-artifact", action="append", default=[], help="Source-of-truth artifact. Repeatable.")
    parser.add_argument("--application-root", action="append", default=[], help="Application root. Repeatable.")
    parser.add_argument("--milestone", action="append", required=True, help="Milestone as M01:Title. Repeatable.")
    parser.add_argument("--activate", action="store_true", help="Set active_scope to this scope in RUNTIME_INDEX.yaml.")
    parser.add_argument("--force", action="store_true", help="Overwrite scope-local files if they exist.")
    args = parser.parse_args()

    root = Path(args.root).expanduser().resolve()
    scope_id = args.scope_id.upper()
    sources = args.source_artifact or ["AGENT.md"]
    app_roots = args.application_root or ["frontend/"]
    milestones = [parse_milestone(raw) for raw in args.milestone]
    ref = git_ref(root)

    runtime = root / ".codex" / "runtime"
    scope_root = runtime / "scopes" / scope_id
    for directory in [runtime, runtime / "archive", runtime / "scopes", scope_root, scope_root / "archive", scope_root / "milestones"]:
        directory.mkdir(parents=True, exist_ok=True)
    touch(runtime / "archive" / ".gitkeep")
    touch(scope_root / "archive" / ".gitkeep")

    update_runtime_index(runtime / "RUNTIME_INDEX.yaml", scope_id, args.scope_title, sources[0], ref, args.activate)
    write_file(scope_root / "SCOPE.yaml", scope_yaml(scope_id, args.scope_title, sources, app_roots, ref), args.force)
    write_file(scope_root / "MILESTONES.yaml", milestones_yaml(scope_id, sources, milestones), args.force)
    write_file(scope_root / "IMPLEMENT_INDEX.yaml", implement_index(scope_id, milestones), args.force)
    write_file(scope_root / "IMPLEMENT_ISSUE_INDEX.yaml", f"scope_id: {scope_id}\nissues: []\n", args.force)
    write_file(scope_root / "AGENT_ROSTER.yaml", agent_roster(scope_id, app_roots), args.force)

    for milestone in milestones:
        milestone_root = scope_root / "milestones" / milestone.milestone_id
        for directory in [milestone_root, milestone_root / "prompts", milestone_root / "reviews", milestone_root / "archive"]:
            directory.mkdir(parents=True, exist_ok=True)
        touch(milestone_root / "prompts" / ".gitkeep")
        touch(milestone_root / "reviews" / ".gitkeep")
        touch(milestone_root / "archive" / ".gitkeep")
        write_file(milestone_root / "IMPLEMENT_TASKS.yaml", "tasks: []\n", args.force)
        write_file(milestone_root / "IMPLEMENT_ISSUES.yaml", "issues: []\n", args.force)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
