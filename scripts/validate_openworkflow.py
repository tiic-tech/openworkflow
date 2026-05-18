#!/usr/bin/env python3
"""Validate the OpenWorkflow repository contract foundation."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from pathlib import Path
from typing import Any


REQUIRED_FILES = [
    "AGENT.md",
    "build_system_vision.md",
    "references/contract-graph.md",
    "schemas/openworkflow-contract.schema.json",
    "schemas/workflow-index.schema.json",
    "schemas/contract-graph.schema.json",
    "schemas/change.schema.json",
    "schemas/work-items.schema.json",
    "skills/build-workflow/SKILL.md",
    "skills/build-workflow/scripts/init_workflow.py",
    "skills/build-team/SKILL.md",
    "skills/run-team/SKILL.md",
    "changes/M01-contract-foundation/CHANGE.yaml",
    "changes/M01-contract-foundation/WORK_ITEMS.yaml",
]

COMMON_REQUIRED = [
    "schema_version",
    "contract_id",
    "contract_type",
    "title",
    "status",
]


def rel(root: Path, path: Path) -> str:
    try:
        return str(path.relative_to(root))
    except ValueError:
        return str(path)


def load_yaml_with_ruby(path: Path) -> Any:
    if not shutil.which("ruby"):
        raise RuntimeError("Ruby is required for YAML validation on this machine")
    code = (
        "require 'yaml'; require 'json'; "
        "obj = YAML.safe_load(File.read(ARGV[0]), aliases: true); "
        "puts JSON.generate(obj)"
    )
    result = subprocess.run(
        ["ruby", "-e", code, str(path)],
        check=True,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return json.loads(result.stdout)


def validate_required_files(root: Path, errors: list[str]) -> None:
    for item in REQUIRED_FILES:
        if not (root / item).exists():
            errors.append(f"missing required file: {item}")


def validate_json_schemas(root: Path, errors: list[str]) -> None:
    for path in sorted((root / "schemas").glob("*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:  # noqa: BLE001 - validation script reports context
            errors.append(f"{rel(root, path)} is not valid JSON: {exc}")
            continue
        for key in ("$schema", "title", "type"):
            if key not in data:
                errors.append(f"{rel(root, path)} missing JSON schema key {key}")


def yaml_files(root: Path) -> list[Path]:
    ignored_parts = {".git", "node_modules", "dist", "build", "coverage"}
    paths: list[Path] = []
    for path in root.rglob("*.yaml"):
        if ignored_parts.intersection(path.parts):
            continue
        paths.append(path)
    return sorted(paths)


def validate_common_contract(root: Path, path: Path, data: Any, errors: list[str]) -> None:
    if not isinstance(data, dict):
        return
    if "contract_type" not in data and "schema_version" not in data:
        return
    for key in COMMON_REQUIRED:
        if key not in data:
            errors.append(f"{rel(root, path)} missing contract key {key}")
    if data.get("schema_version") != "0.1.0":
        errors.append(f"{rel(root, path)} must use schema_version 0.1.0")
    if isinstance(data.get("depends_on"), list):
        for value in data["depends_on"]:
            if not isinstance(value, str):
                errors.append(f"{rel(root, path)} has non-string depends_on value")
    if isinstance(data.get("produces"), list):
        for value in data["produces"]:
            if not isinstance(value, str):
                errors.append(f"{rel(root, path)} has non-string produces value")


def validate_change(root: Path, path: Path, data: Any, errors: list[str]) -> None:
    if path.name != "CHANGE.yaml":
        return
    required = ["problem", "goals", "non_goals", "affected_paths", "acceptance", "validation"]
    for key in required:
        if key not in data:
            errors.append(f"{rel(root, path)} missing change key {key}")
    if data.get("contract_type") != "change":
        errors.append(f"{rel(root, path)} contract_type must be change")


def contract_root_for(default_root: Path, path: Path) -> Path:
    parts = path.parts
    if ".codex" not in parts:
        return default_root
    index = parts.index(".codex")
    if index == 0:
        return default_root
    return Path(*parts[:index])


def validate_work_items(root: Path, path: Path, data: Any, errors: list[str]) -> None:
    if path.name != "WORK_ITEMS.yaml":
        return
    if data.get("contract_type") != "work_items":
        errors.append(f"{rel(root, path)} contract_type must be work_items")
    change_contract = data.get("change_contract")
    if not isinstance(change_contract, str):
        errors.append(f"{rel(root, path)} missing change_contract")
    elif not ((contract_root_for(root, path) / change_contract).exists() or (root / change_contract).exists()):
        errors.append(f"{rel(root, path)} references missing change_contract {change_contract}")
    items = data.get("items")
    if not isinstance(items, list) or not items:
        errors.append(f"{rel(root, path)} must contain non-empty items")
        return
    seen: set[str] = set()
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            errors.append(f"{rel(root, path)} item {index} is not a mapping")
            continue
        task_id = item.get("task_id")
        if not isinstance(task_id, str) or not task_id:
            errors.append(f"{rel(root, path)} item {index} missing task_id")
            continue
        if task_id in seen:
            errors.append(f"{rel(root, path)} duplicate task_id {task_id}")
        seen.add(task_id)
        for key in ("title", "status", "owned_paths", "acceptance"):
            if key not in item:
                errors.append(f"{rel(root, path)} {task_id} missing {key}")


def workflow_root_for(path: Path) -> Path:
    # <project>/.codex/workflow/WORKFLOW_INDEX.yaml
    return path.parents[2]


def validate_workflow_index(root: Path, path: Path, data: Any, errors: list[str]) -> None:
    if path.name != "WORKFLOW_INDEX.yaml":
        return
    contracts = data.get("contracts")
    if not isinstance(contracts, list) or not contracts:
        errors.append(f"{rel(root, path)} must contain contracts")
        return
    project_root = workflow_root_for(path)
    for entry in contracts:
        if not isinstance(entry, dict):
            errors.append(f"{rel(root, path)} has non-mapping contract entry")
            continue
        entry_path = entry.get("path")
        if isinstance(entry_path, str) and not (project_root / entry_path).exists():
            errors.append(f"{rel(root, path)} references missing contract path {entry_path}")


def validate_contract_graph(root: Path, path: Path, data: Any, errors: list[str]) -> None:
    if path.name != "CONTRACT_GRAPH.yaml":
        return
    nodes = data.get("nodes")
    edges = data.get("edges")
    if not isinstance(nodes, list) or not isinstance(edges, list):
        errors.append(f"{rel(root, path)} must contain nodes and edges lists")
        return
    node_ids = {node.get("contract_id") for node in nodes if isinstance(node, dict)}
    for edge in edges:
        if not isinstance(edge, dict):
            errors.append(f"{rel(root, path)} has non-mapping edge")
            continue
        for key in ("from", "to"):
            value = edge.get(key)
            if value not in node_ids:
                errors.append(f"{rel(root, path)} edge {key} references missing node {value}")


def validate_yaml_contracts(root: Path, errors: list[str]) -> None:
    for path in yaml_files(root):
        try:
            data = load_yaml_with_ruby(path)
        except Exception as exc:  # noqa: BLE001 - validation script reports context
            errors.append(f"{rel(root, path)} is not valid YAML: {exc}")
            continue
        validate_common_contract(root, path, data, errors)
        if isinstance(data, dict):
            validate_change(root, path, data, errors)
            validate_work_items(root, path, data, errors)
            validate_workflow_index(root, path, data, errors)
            validate_contract_graph(root, path, data, errors)


def validate(root: Path) -> list[str]:
    errors: list[str] = []
    validate_required_files(root, errors)
    validate_json_schemas(root, errors)
    validate_yaml_contracts(root, errors)
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate OpenWorkflow project contracts.")
    parser.add_argument("--root", default=".", help="Repository root.")
    args = parser.parse_args()
    root = Path(args.root).expanduser().resolve()
    errors = validate(root)
    if errors:
        print("OpenWorkflow validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1
    print("OpenWorkflow validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
