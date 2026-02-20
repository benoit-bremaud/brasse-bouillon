#!/usr/bin/env python3
"""Basic quality gates for the Brasse-Bouillon static website.

This script is intentionally dependency-free so it can run locally and in CI.
"""

from __future__ import annotations

from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parent.parent
REQUIRED_FILES = [
    "index.html",
    "index-en.html",
    "README.md",
    "CONTRIBUTING.md",
    "favicon.ico",
]

HTML_RULES = {
    "index.html": [
        (r"<!DOCTYPE html>", "doctype HTML5 manquant"),
        (r"<html\s+lang=\"fr\"", "balise <html lang=\"fr\"> manquante"),
        (r"<title>.+</title>", "balise <title> manquante"),
        (r"id=\"mainContentFr\"", "ancre principale #mainContentFr manquante"),
    ],
    "index-en.html": [
        (r"<!DOCTYPE html>", "doctype HTML5 manquant"),
        (r"<html\s+lang=\"en\"", "balise <html lang=\"en\"> manquante"),
        (r"<title>.+</title>", "balise <title> manquante"),
        (r"id=\"mainContentEn\"", "ancre principale #mainContentEn manquante"),
    ],
}

BLOCKED_PATTERNS = [
    (r"<<<<<<<", "marqueur de conflit Git détecté (<<<<<<<)"),
    (r"=======", "marqueur de conflit Git détecté (=======)"),
    (r">>>>>>>", "marqueur de conflit Git détecté (>>>>>>>)"),
]


def main() -> int:
    errors: list[str] = []

    for rel_path in REQUIRED_FILES:
        full_path = ROOT / rel_path
        if not full_path.exists():
            errors.append(f"Fichier requis manquant: {rel_path}")

    for rel_path, rules in HTML_RULES.items():
        full_path = ROOT / rel_path
        if not full_path.exists():
            continue

        content = full_path.read_text(encoding="utf-8")

        for pattern, message in BLOCKED_PATTERNS:
            if re.search(pattern, content):
                errors.append(f"{rel_path}: {message}")

        for pattern, message in rules:
            if not re.search(pattern, content, flags=re.IGNORECASE | re.DOTALL):
                errors.append(f"{rel_path}: {message}")

    if errors:
        print("❌ Quality gate failed:")
        for err in errors:
            print(f" - {err}")
        return 1

    print("✅ Quality gate passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
