#!/usr/bin/env python3
"""Validate LM-native genre skills against the genre schema.

Usage:
    python validate_genres.py [skills_root]

Defaults to the LM Studio skills root that contains genre-compiler/:
    <root>/genre-compiler/scripts/ -> <root> = parent of genre-compiler.

Exit code 0 = all pass; 1 = at least one hard failure. Print a per-skill report.
"""
import json
import re
import sys
from pathlib import Path

DESC_MAX = 500
FILE_MAX = 102_400
REQUIRED_SECTIONS = [
    "## Style reference block",
    "## Trait schema",
    "## Exclusions",
    "## Example",
]


def load_report():
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else (
        Path(__file__).resolve().parent.parent.parent
    )
    TOOL_SKILLS = {"genre-compiler", "genre-orchestrator"}
    report = {"root": str(root), "skills": [], "ok": True}
    for entry in sorted(root.iterdir()):
        if not entry.is_dir() or not entry.name.startswith("genre-"):
            continue
        if entry.name in TOOL_SKILLS:
            continue
        report["skills"].append(validate_skill(entry))
    return report


def validate_skill(dirpath):
    slug = dirpath.name
    res = {"skill": slug, "issues": [], "errors": []}

    manifest = dirpath / "skill.json"
    if not manifest.exists():
        res["errors"].append("missing skill.json")
    else:
        try:
            data = json.loads(manifest.read_text(encoding="utf-8"))
        except Exception as exc:  # noqa: BLE001
            res["errors"].append(f"skill.json invalid: {exc}")
            data = {}
        if data.get("name") != slug:
            res["errors"].append(f"name != slug ({data.get('name')!r})")
        desc = data.get("description", "")
        if not desc:
            res["errors"].append("description missing")
        elif not desc.startswith("Use when"):
            res["issues"].append("description should start 'Use when'")
        if len(desc) > DESC_MAX:
            res["errors"].append(f"description > {DESC_MAX} chars ({len(desc)})")
        tags = data.get("tags")
        if not isinstance(tags, list) or len(tags) == 0:
            res["errors"].append("tags missing/empty (kills BM25 routing)")
        elif not all(isinstance(t, str) for t in tags):
            res["errors"].append("tags must be strings")

    skill_md = dirpath / "SKILL.md"
    if not skill_md.exists():
        res["errors"].append("missing SKILL.md")
        return finish(res)
    text = skill_md.read_text(encoding="utf-8")
    if len(text.encode("utf-8")) > FILE_MAX:
        res["errors"].append(f"SKILL.md > {FILE_MAX} bytes")
    first = text.lstrip().splitlines()[0] if text.strip() else ""
    if not first.startswith("# "):
        res["errors"].append("SKILL.md must start with '# <name>' (no YAML frontmatter)")
    elif slug not in first:
        res["issues"].append(f"H1 {first!r} does not contain slug {slug}")
    if "Use when " not in text[:1200]:
        res["issues"].append("no 'Use when' trigger line near top")

    body = text.split("---", 1)[-1] if "---" in text else text
    for sec in REQUIRED_SECTIONS:
        if sec not in body:
            res["issues"].append(f"missing required section: {sec}")

    source = dirpath / "references" / f"{slug}-source.md"
    if not source.exists():
        res["issues"].append("missing references/<slug>-source.md")
    elif source.stat().st_size > FILE_MAX:
        res["issues"].append("references source > 100 KB (truncated on read)")

    return finish(res)


def finish(res):
    res["ok"] = not res["errors"]
    return res


def main():
    report = load_report()
    worst = 0
    for skill in report["skills"]:
        status = "OK" if skill["ok"] else "FAIL"
        print(f"[{status}] {skill['skill']}")
        for e in skill["errors"]:
            print(f"    ERR  {e}")
        for i in skill["issues"]:
            print(f"    WARN {i}")
        if not skill["ok"]:
            worst = 1
    print(f"\n{len([s for s in report['skills'] if s['ok']])}/{len(report['skills'])} genre skills valid at {report['root']}")
    return worst


if __name__ == "__main__":
    sys.exit(main())
