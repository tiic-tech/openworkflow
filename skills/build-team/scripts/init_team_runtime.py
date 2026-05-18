#!/usr/bin/env python3
"""Initialize a repo-local Agent Team runtime skeleton.

The script is intentionally conservative: it creates missing directories and
files, but it does not overwrite existing runtime state unless --force is set.
"""

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
    if value is None:
        return "null"
    return json.dumps(value)


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    return slug or "milestone"


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
    ref = result.stdout.strip()
    return ref or None


def parse_milestone(raw: str) -> Milestone:
    for separator in (":", "=", "|"):
        if separator in raw:
            left, right = raw.split(separator, 1)
            milestone_id = left.strip()
            title = right.strip()
            if milestone_id and title:
                return Milestone(milestone_id=milestone_id, title=title)
    cleaned = raw.strip()
    if not cleaned:
        raise ValueError("milestone cannot be empty")
    match = re.match(r"^(M\d+)\s+(.+)$", cleaned, flags=re.IGNORECASE)
    if match:
        return Milestone(milestone_id=match.group(1).upper(), title=match.group(2).strip())
    raise ValueError(f"milestone must look like M01:Title, got {raw!r}")


def detect_source_artifacts(root: Path) -> list[str]:
    candidates = [
        "AGENT.md",
        "README.md",
        "README",
        "ROADMAP.md",
        "SPEC.md",
        "LAUNCH_CHECKLIST.md",
    ]
    found = [candidate for candidate in candidates if (root / candidate).exists()]
    if (root / "DESIGN_SPEC").is_dir():
        found.append("DESIGN_SPEC/")
    if (root / "docs").is_dir():
        found.append("docs/")
    return found or ["AGENT.md"]


def detect_application_roots(root: Path) -> list[str]:
    roots: list[str] = []
    for candidate in ("frontend", "app", "src", "packages", "backend", "server", "api"):
        if (root / candidate).exists():
            roots.append(f"{candidate}/")
    for manifest in ("package.json", "pyproject.toml", "Cargo.toml", "go.mod"):
        if (root / manifest).exists():
            roots.append(manifest)
    return roots


def list_yaml(items: list[str], indent: int = 0) -> str:
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


def runtime_index(scope_id: str, scope_title: str, source: str, ref: str | None) -> str:
    return (
        f"active_scope: {scope_id}\n"
        "scopes:\n"
        f"  - scope_id: {scope_id}\n"
        f"    title: {q(scope_title)}\n"
        "    status: active\n"
        f"    source: {q(source)}\n"
        f"    path: .codex/runtime/scopes/{scope_id}/\n"
        f"    base_git_ref: {q(ref) if ref else 'null'}\n"
    )


def scope_yaml(
    scope_id: str,
    scope_title: str,
    sources: list[str],
    app_roots: list[str],
    ref: str | None,
) -> str:
    return (
        f"scope_id: {scope_id}\n"
        f"title: {q(scope_title)}\n"
        "status: active\n"
        "source_artifacts:\n"
        f"{list_yaml(sources, 2)}"
        f"base_git_ref: {q(ref) if ref else 'null'}\n"
        "runtime_protocol:\n"
        "  agent_team_protocol: .codex/agents/README.md\n"
        "  orchestrator_role: .codex/agents/orchestrator.md\n"
        f"  agent_roster: .codex/runtime/scopes/{scope_id}/AGENT_ROSTER.yaml\n"
        "boundary:\n"
        "  application_roots:\n"
        f"{list_yaml(app_roots, 4)}"
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
                f"    scope: {q('Define and deliver ' + milestone.title + '.')}",
                f"    target: {q('Complete the milestone artifacts and checks.')}",
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
    active = milestones[0].milestone_id if milestones else "M01"
    lines = [f"scope_id: {scope_id}", f"active_milestone: {active}", "milestones:"]
    for index, milestone in enumerate(milestones):
        status = "active" if index == 0 else "planned"
        branch = f"feat/{milestone.milestone_id.lower()}-{slugify(milestone.title)}"
        lines.extend(
            [
                f"  - milestone_id: {milestone.milestone_id}",
                f"    status: {status}",
                f"    title: {q(milestone.title)}",
                f"    task_file: .codex/runtime/scopes/{scope_id}/milestones/{milestone.milestone_id}/IMPLEMENT_TASKS.yaml",
                f"    issue_file: .codex/runtime/scopes/{scope_id}/milestones/{milestone.milestone_id}/IMPLEMENT_ISSUES.yaml",
                "    qa_report: null",
                f"    branch: {branch}",
                "    last_checkpoint: null",
            ]
        )
    return "\n".join(lines) + "\n"


def agent_roster(scope_id: str, app_roots: list[str]) -> str:
    owns_frontend = ["frontend/src/app/", "frontend/src/components/", "frontend/src/systems/", "frontend/tests/"]
    if not any(root.startswith("frontend") for root in app_roots):
        owns_frontend = ["src/", "tests/"]
    return "\n".join(
        [
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
            "    notes: Spawn once for planning work, then resume for related task prompt creation.",
            "  - agent_name: frontend-agent",
            "    agent_id: null",
            "    lifecycle_status: available",
            "    session_policy: persistent",
            "    owns:",
            *(f"      - {path}" for path in owns_frontend),
            "    current_task: null",
            "    last_completed_task: null",
            "    active_milestone: null",
            "    notes: Use only when this repo has frontend or browser-facing work; otherwise replace with a domain implementation agent.",
            "event_agents:",
            "  - agent_name: code-review-agent",
            "    agent_id: null",
            "    lifecycle_status: available",
            "    session_policy: event",
            "    trigger: artifact_ready",
            "    closes_after_handoff: true",
            "    notes: Writes review artifacts and issue logs, then closes.",
            "  - agent_name: security-review-agent",
            "    agent_id: null",
            "    lifecycle_status: available",
            "    session_policy: event",
            "    trigger: security_sensitive_change",
            "    closes_after_handoff: true",
            "    notes: Spawn for auth, secrets, external input, APIs, dependencies, deployment, analytics, or infrastructure.",
            "  - agent_name: tdd-qa-agent",
            "    agent_id: null",
            "    lifecycle_status: available",
            "    session_policy: event",
            "    trigger: qa_gate",
            "    closes_after_handoff: true",
            "    notes: Keep event-driven unless it is actively authoring a long test suite across tasks.",
            "  - agent_name: git-release-agent",
            "    agent_id: null",
            "    lifecycle_status: available",
            "    session_policy: event",
            "    trigger: checkpoint_or_release",
            "    closes_after_handoff: true",
            "    notes: Drafts branch, commit, PR, and release text only; Orchestrator performs git actions.",
            "legacy_tracking:",
            "  task_agent_ids_before_roster: legacy_untracked",
            "  note: Do not invent ids for historical null task agent_id values.",
        ]
    ) + "\n"


def state_machine_doc(scope_id: str) -> str:
    return f"""# Agent Team Runtime State Machine

Active scope: `{scope_id}`

Flow:

```txt
repo_scan
  -> user_parameter_question
  -> scope_design
  -> runtime_bootstrap
  -> milestone_plan
  -> atom_task_plan
  -> delegation_boundary_check
  -> persistent_or_event_agent_selection
  -> prompt_preparation
  -> spawn_or_resume_agent
  -> record_agent_id_in_roster_and_task
  -> implementation_or_event_work
  -> artifact_ready
  -> async_review
  -> issue_fix_loop
  -> resume_original_persistent_agent_for_fix
  -> milestone_qa
  -> git_checkpoint_decision
  -> archive_or_freeze
  -> next_milestone
```

Task status values:

```txt
planned, prompted, claimed, in_progress, artifact_ready, review_pending,
reviewed, fix_required, qa_ready, done, blocked, archived
```

Runtime maintenance rules:

- Update runtime state when task reality changes.
- Update AGENT_ROSTER.yaml when agent lifecycle changes.
- New delegated tasks must not leave agent_id null.
- Orchestrator direct execution requires an orchestrator_exception note.
- Keep detailed reasoning in prompts and reviews, not YAML indexes.
- Preserve stale plans and superseded evidence in `archive/`.
- Do not infer completion from file existence alone.
"""


def build_runtime(args: argparse.Namespace) -> None:
    root = Path(args.root).expanduser().resolve()
    scope_id = args.scope_id.upper()
    sources = args.source_artifact or detect_source_artifacts(root)
    app_roots = args.application_root or detect_application_roots(root)
    milestones = [parse_milestone(raw) for raw in args.milestone]
    if not milestones:
        milestones = [Milestone("M01", "Workflow baseline")]

    runtime_root = root / ".codex" / "runtime"
    scope_root = runtime_root / "scopes" / scope_id
    base_ref = git_ref(root)

    for directory in [
        runtime_root,
        runtime_root / "archive",
        runtime_root / "scopes",
        scope_root,
        scope_root / "archive",
        scope_root / "milestones",
    ]:
        ensure_dir(directory, args.dry_run)

    for directory in [runtime_root / "archive", scope_root / "archive"]:
        touch_gitkeep(directory, args.dry_run)

    write_file(
        runtime_root / "RUNTIME_INDEX.yaml",
        runtime_index(scope_id, args.scope_title, sources[0], base_ref),
        args.force,
        args.dry_run,
    )
    write_file(runtime_root / "STATE_MACHINE.md", state_machine_doc(scope_id), args.force, args.dry_run)
    write_file(scope_root / "SCOPE.yaml", scope_yaml(scope_id, args.scope_title, sources, app_roots, base_ref), args.force, args.dry_run)
    write_file(scope_root / "MILESTONES.yaml", milestones_yaml(scope_id, sources, milestones), args.force, args.dry_run)
    write_file(scope_root / "IMPLEMENT_INDEX.yaml", implement_index(scope_id, milestones), args.force, args.dry_run)
    write_file(scope_root / "IMPLEMENT_ISSUE_INDEX.yaml", f"scope_id: {scope_id}\nissues: []\n", args.force, args.dry_run)
    write_file(scope_root / "AGENT_ROSTER.yaml", agent_roster(scope_id, app_roots), args.force, args.dry_run)

    for milestone in milestones:
        milestone_root = scope_root / "milestones" / milestone.milestone_id
        for directory in [
            milestone_root,
            milestone_root / "prompts",
            milestone_root / "reviews",
            milestone_root / "archive",
        ]:
            ensure_dir(directory, args.dry_run)
        for directory in [milestone_root / "prompts", milestone_root / "reviews", milestone_root / "archive"]:
            touch_gitkeep(directory, args.dry_run)
        write_file(milestone_root / "IMPLEMENT_TASKS.yaml", "tasks: []\n", args.force, args.dry_run)
        write_file(milestone_root / "IMPLEMENT_ISSUES.yaml", "issues: []\n", args.force, args.dry_run)


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Initialize .codex/runtime for an Agent Team workflow.")
    p.add_argument("--root", default=".", help="Repository root. Defaults to current directory.")
    p.add_argument("--scope-id", default="MVP", help="Scope id, for example MVP or V1.")
    p.add_argument("--scope-title", default="MVP implementation", help="Human-readable scope title.")
    p.add_argument("--source-artifact", action="append", default=[], help="Source-of-truth artifact path. Repeatable.")
    p.add_argument("--application-root", action="append", default=[], help="Application root path. Repeatable.")
    p.add_argument("--milestone", action="append", default=[], help="Milestone as M01:Title. Repeatable.")
    p.add_argument("--force", action="store_true", help="Overwrite existing runtime files.")
    p.add_argument("--dry-run", action="store_true", help="Print planned writes without changing files.")
    return p


def main() -> int:
    args = parser().parse_args()
    build_runtime(args)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
