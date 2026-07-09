#!/usr/bin/env python3
"""Basic quality gates for the Brasse-Bouillon static website.

This script is intentionally dependency-free so it can run locally and in CI.
"""

from __future__ import annotations

from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parent.parent
HOMEPAGE_URL = "https://brasse-bouillon.com/"

REQUIRED_FILES = [
    "index.html",
    "index-en.html",
    "404.html",
    "legal.html",
    "legal-en.html",
    "privacy.html",
    "privacy-en.html",
    "cookies.html",
    "cookies-en.html",
    "terms.html",
    "terms-en.html",
    "README.md",
    "CONTRIBUTING.md",
    "favicon.ico",
    "sitemap.xml",
    "robots.txt",
    "feedback-widget.js",
    "chat-widget.js",
]

# Every public HTML page must reference the feedback widget loader (a single
# local module) so the "Report" button is never accidentally dropped from one
# page during a future edit.
WIDGET_HTML_FILES = [
    "index.html",
    "index-en.html",
    "legal.html",
    "legal-en.html",
    "privacy.html",
    "privacy-en.html",
    "cookies.html",
    "cookies-en.html",
    "terms.html",
    "terms-en.html",
]
WIDGET_LOADER = "feedback-widget.js"

# The public FAQ chat widget lives on the two landing pages only (it presents the
# project). Guard both so the loader is never dropped from one language variant.
CHAT_WIDGET_HTML_FILES = [
    "index.html",
    "index-en.html",
]
CHAT_WIDGET_LOADER = "chat-widget.js"

HTML_RULES = {
    "index.html": [
        (r"<!DOCTYPE html>", "doctype HTML5 manquant"),
        (r"<html\s+lang=\"fr\"", 'balise <html lang="fr"> manquante'),
        (r"<title>.+</title>", "balise <title> manquante"),
        (r"id=\"mainContentFr\"", "ancre principale #mainContentFr manquante"),
        (
            r"<link\s+rel=\"canonical\"\s+href=\""
            r"https://brasse-bouillon\.com/\"",
            "canonical FR vers https://brasse-bouillon.com/ manquante",
        ),
        (
            r'"@type"\s*:\s*"Organization"',
            "schema Organization manquant dans index.html",
        ),
        (
            r'<nav[^>]*\bid="headerNav"',
            "id #headerNav manquant sur la nav (cible du menu burger)",
        ),
        (
            r'class="nav-toggle"',
            "bouton burger .nav-toggle manquant dans le header",
        ),
        (
            r'aria-controls="headerNav"',
            'attribut aria-controls="headerNav" manquant sur le bouton burger',
        ),
    ],
    "index-en.html": [
        (r"<!DOCTYPE html>", "doctype HTML5 manquant"),
        (r"<html\s+lang=\"en\"", 'balise <html lang="en"> manquante'),
        (r"<title>.+</title>", "balise <title> manquante"),
        (r"id=\"mainContentEn\"", "ancre principale #mainContentEn manquante"),
        (
            r"<meta\s+name=\"robots\"\s+content=\"noindex,\s*follow\"\s*/?>",
            "meta robots noindex,follow manquant dans index-en.html",
        ),
        (
            r"<link\s+rel=\"canonical\"\s+href=\""
            r"https://brasse-bouillon\.com/\"",
            "canonical EN vers https://brasse-bouillon.com/ manquante",
        ),
    ],
    # The catch-all error page (Cloudflare Pages serves it with a real HTTP
    # 404 for unmatched routes). It is a single locale-agnostic file — no
    # `-en.html` twin — so only the structural invariants are enforced: it
    # must stay noindex and never be indexed as home-page duplicate content.
    "404.html": [
        (r"<!DOCTYPE html>", "doctype HTML5 manquant"),
        (r"<html\s+lang=\"fr\"", 'balise <html lang="fr"> manquante'),
        (r"<title>.+</title>", "balise <title> manquante"),
        (
            r"<meta\s+name=\"robots\"\s+content=\"noindex",
            "meta robots noindex manquant dans 404.html",
        ),
    ],
}

DISALLOWED_HTML_PATTERNS = {
    "index.html": [
        (
            r'"@type"\s*:\s*"SoftwareApplication"',
            "schema SoftwareApplication non autorisé dans index.html "
            "(à déplacer vers app.html)",
        ),
        (
            r'"@type"\s*:\s*"Review"',
            "schema Review non autorisé dans index.html",
        ),
        (
            r'"aggregateRating"\s*:',
            "champ aggregateRating non autorisé dans index.html",
        ),
        (
            r'"ratingValue"\s*:',
            "champ ratingValue non autorisé dans index.html",
        ),
        (
            r'"ratingCount"\s*:',
            "champ ratingCount non autorisé dans index.html",
        ),
    ],
    "index-en.html": [
        (
            r'"@type"\s*:\s*"SoftwareApplication"',
            "schema SoftwareApplication non autorisé dans index-en.html "
            "(à déplacer vers app.html)",
        ),
        (
            r'"@type"\s*:\s*"Review"',
            "schema Review non autorisé dans index-en.html",
        ),
        (
            r'"aggregateRating"\s*:',
            "champ aggregateRating non autorisé dans index-en.html",
        ),
        (
            r'"ratingValue"\s*:',
            "champ ratingValue non autorisé dans index-en.html",
        ),
        (
            r'"ratingCount"\s*:',
            "champ ratingCount non autorisé dans index-en.html",
        ),
    ],
}

BLOCKED_PATTERNS = [
    (r"<<<<<<<", "marqueur de conflit Git détecté (<<<<<<<)"),
    (r"=======", "marqueur de conflit Git détecté (=======)"),
    (r">>>>>>>", "marqueur de conflit Git détecté (>>>>>>>)"),
]

ROBOTS_REQUIRED_DIRECTIVES = [
    "User-agent: *",
    "Allow: /",
    f"Sitemap: {HOMEPAGE_URL}sitemap.xml",
]

REGEX_FLAGS = re.IGNORECASE | re.DOTALL


def check_required_files(root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    for rel_path in REQUIRED_FILES:
        full_path = root / rel_path
        if not full_path.exists():
            errors.append(f"Fichier requis manquant: {rel_path}")
    return errors


def check_html_files(root: Path = ROOT) -> list[str]:
    errors: list[str] = []

    for rel_path, rules in HTML_RULES.items():
        full_path = root / rel_path
        if not full_path.exists():
            continue

        content = full_path.read_text(encoding="utf-8")

        for pattern, message in BLOCKED_PATTERNS:
            if re.search(pattern, content):
                errors.append(f"{rel_path}: {message}")

        for pattern, message in rules:
            if not re.search(pattern, content, flags=REGEX_FLAGS):
                errors.append(f"{rel_path}: {message}")

        for pattern, message in DISALLOWED_HTML_PATTERNS.get(rel_path, []):
            if re.search(pattern, content, flags=REGEX_FLAGS):
                errors.append(f"{rel_path}: {message}")

    return errors


def check_feedback_widget(root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    for rel_path in WIDGET_HTML_FILES:
        full_path = root / rel_path
        if not full_path.exists():
            continue
        content = full_path.read_text(encoding="utf-8")
        if WIDGET_LOADER not in content:
            errors.append(
                f"{rel_path}: référence au widget de feedback "
                f"({WIDGET_LOADER}) manquante"
            )
    return errors


def check_chat_widget(root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    for rel_path in CHAT_WIDGET_HTML_FILES:
        full_path = root / rel_path
        if not full_path.exists():
            continue
        content = full_path.read_text(encoding="utf-8")
        if CHAT_WIDGET_LOADER not in content:
            errors.append(
                f"{rel_path}: référence au widget de chat FAQ "
                f"({CHAT_WIDGET_LOADER}) manquante"
            )
    return errors


def check_sitemap_policy(root: Path = ROOT) -> list[str]:
    sitemap_path = root / "sitemap.xml"
    if not sitemap_path.exists():
        return []

    errors: list[str] = []

    try:
        xml_root = ET.parse(sitemap_path).getroot()
    except ET.ParseError as exc:
        return [f"sitemap.xml: XML invalide ({exc})"]

    loc_values = [
        (loc.text or "").strip()
        for loc in xml_root.findall(".//{*}loc")
        if (loc.text or "").strip()
    ]

    if loc_values != [HOMEPAGE_URL]:
        found = ", ".join(loc_values) if loc_values else "aucune URL"
        errors.append(
            f"sitemap.xml: doit contenir uniquement {HOMEPAGE_URL} (trouvé: {found})"
        )

    return errors


def check_robots_policy(root: Path = ROOT) -> list[str]:
    robots_path = root / "robots.txt"
    if not robots_path.exists():
        return []

    content = robots_path.read_text(encoding="utf-8")
    directives = []

    for raw_line in content.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        directives.append(re.sub(r"\s+", " ", line).lower())

    errors: list[str] = []
    known_directives = set(directives)

    for directive in ROBOTS_REQUIRED_DIRECTIVES:
        if directive.lower() not in known_directives:
            errors.append(f"robots.txt: directive requise manquante: {directive}")

    return errors


def collect_errors(root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    errors.extend(check_required_files(root))
    errors.extend(check_html_files(root))
    errors.extend(check_feedback_widget(root))
    errors.extend(check_chat_widget(root))
    errors.extend(check_sitemap_policy(root))
    errors.extend(check_robots_policy(root))
    return errors


def main() -> int:
    errors = collect_errors(ROOT)

    if errors:
        print("❌ Quality gate failed:")
        for err in errors:
            print(f" - {err}")
        return 1

    print("✅ Quality gate passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
