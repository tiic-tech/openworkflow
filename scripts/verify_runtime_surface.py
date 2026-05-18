#!/usr/bin/env python3
"""Verify OpenWorkflow runtime command surface behavior against the built CLI."""

from __future__ import annotations

import os
import subprocess
import tempfile
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
CLI = REPO_ROOT / "dist" / "cli" / "src" / "index.js"


def run(command: list[str], *, env: dict[str, str], cwd: Path = REPO_ROOT) -> None:
    subprocess.run(command, cwd=cwd, env=env, check=True, text=True)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def assert_file(path: Path) -> None:
    assert_true(path.is_file(), f"missing file: {path}")


def verify_minimal_openworkflow(root: Path) -> None:
    expected_files = {
        ".openworkflow/config.yaml",
        ".openworkflow/workflow/WORKFLOW_INDEX.yaml",
        ".openworkflow/audit/COMMAND_AUDIT_INDEX.yaml",
        ".openworkflow/audit/CONTEXT_PACKETS.yaml",
        ".openworkflow/audit/ARTIFACT_CONTRACTS.yaml",
        ".openworkflow/audit/DISCLOSURE_LEVELS.yaml",
    }
    actual_files = {
        str(path.relative_to(root))
        for path in (root / ".openworkflow").rglob("*")
        if path.is_file()
    }
    assert_true(actual_files == expected_files, f"unexpected .openworkflow files: {sorted(actual_files)}")

    expected_dirs = {
        ".openworkflow",
        ".openworkflow/audit",
        ".openworkflow/workflow",
    }
    actual_dirs = {
        str(path.relative_to(root))
        for path in (root / ".openworkflow").rglob("*")
        if path.is_dir()
    }
    actual_dirs.add(".openworkflow")
    assert_true(actual_dirs == expected_dirs, f"unexpected .openworkflow dirs: {sorted(actual_dirs)}")


def verify_config(root: Path) -> None:
    config = read(root / ".openworkflow" / "config.yaml")
    assert_true("default_command_delivery: codex-repo-skills" in config, "config missing Codex skill delivery")
    assert_true(".agents/skills" in config, "config missing Codex skill surface")
    assert_true("explicit_invocation: $ow-<id>" in config, "config missing explicit skill invocation policy")


def verify_no_default_prompts(codex_home: Path) -> None:
    prompt_dir = codex_home / "prompts"
    for name in ["ow-vision.md", "ow-validation.md", "ow-proto.md", "ow-design.md", "ow-spec.md"]:
        assert_true(not (prompt_dir / name).exists(), f"default global prompt generated unexpectedly: {name}")


def verify_skills(root: Path) -> None:
    for name in ["ow-vision", "ow-validation", "ow-proto", "ow-decision", "ow-design", "ow-spec"]:
        skill = root / ".agents" / "skills" / name / "SKILL.md"
        interface = root / ".agents" / "skills" / name / "agents" / "openai.yaml"
        assert_file(skill)
        assert_file(interface)
        skill_content = read(skill)
        interface_content = read(interface)
        assert_true(skill_content.startswith("---\n"), f"{name} missing SKILL.md frontmatter")
        assert_true(f"name: \"{name}\"" in skill_content, f"{name} missing skill name")
        assert_true("description:" in skill_content, f"{name} missing skill description")
        assert_true("generated-by: openworkflow" in skill_content, f"{name} missing generated marker")
        assert_true("<user_behavior>" in skill_content, f"{name} missing user behavior block")
        assert_true("<agent_protocol>" in skill_content, f"{name} missing agent protocol block")
        assert_true("display_name:" in interface_content, f"{name} missing display name")
        assert_true("default_prompt:" in interface_content, f"{name} missing default prompt")


def verify_design_contract(root: Path) -> None:
    command_index = read(root / ".openworkflow" / "audit" / "COMMAND_AUDIT_INDEX.yaml")
    assert_true("trigger: /ow:design" in command_index, "command audit missing /ow:design")
    design_section = command_index.split("trigger: /ow:design", 1)[1].split("  - id:", 1)[0]
    assert_true("PRODUCT_DESIGN.yaml" in design_section, "design allowed outputs missing PRODUCT_DESIGN")
    assert_true("TECH_SPEC.yaml" not in extract_block(design_section, "allowed_outputs"), "design allowed outputs include TECH_SPEC")
    assert_true("TECH_SPEC.yaml" in extract_block(design_section, "conditional_outputs"), "design conditional outputs missing TECH_SPEC")

    artifacts = read(root / ".openworkflow" / "audit" / "ARTIFACT_CONTRACTS.yaml")
    assert_true("artifact_type: product_design" in artifacts, "artifact contracts missing product_design")
    assert_true("conditional_packets:" in artifacts, "artifact contracts missing conditional packets")


def verify_no_default_codex_commands(root: Path) -> None:
    assert_true(not (root / ".codex" / "commands" / "ow").exists(), ".codex command references generated unexpectedly")
    assert_true(not (root / ".codex" / "skills").exists(), ".codex skills generated unexpectedly")


def extract_block(content: str, key: str) -> str:
    marker = f"{key}:"
    if marker in content:
        lines = content.splitlines()
        block: list[str] = []
        collecting = False
        for line in lines:
            if line.strip() == marker:
                collecting = True
                continue
            if collecting and line.startswith("    ") and not line.startswith("      "):
                break
            if collecting:
                block.append(line)
        return "\n".join(block)
    open_tag = f"<{key}>"
    close_tag = f"</{key}>"
    if open_tag in content and close_tag in content:
        return content.split(open_tag, 1)[1].split(close_tag, 1)[0]
    return ""


def main() -> int:
    assert_file(CLI)
    with tempfile.TemporaryDirectory(prefix="openworkflow-runtime-surface-") as tmp:
        tmp_root = Path(tmp)
        target = tmp_root / "target"
        codex_home = tmp_root / "codex-home"
        env = os.environ.copy()
        env["CODEX_HOME"] = str(codex_home)

        run(["node", str(CLI), "init", str(target), "--tools", "codex", "--force"], env=env)
        run(["node", str(CLI), "sync", "--root", str(target), "--tools", "codex"], env=env)
        run(["node", str(CLI), "doctor", "--root", str(target), "--tools", "codex"], env=env)
        run(["node", str(CLI), "validate", "--root", str(target)], env=env)

        verify_minimal_openworkflow(target)
        verify_config(target)
        verify_skills(target)
        verify_no_default_prompts(codex_home)
        verify_design_contract(target)
        verify_no_default_codex_commands(target)

    print("OpenWorkflow runtime surface verification passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
