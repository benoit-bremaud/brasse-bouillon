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
    "fonts.css",
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


def check_clean_seo_urls(root: Path = ROOT) -> list[str]:
    """`rel="canonical"` and `rel="alternate"` (hreflang) targets must be the
    clean, non-redirecting URLs Cloudflare Pages serves — never the `.html`
    form, which 308-redirects to the clean URL and weakens/splits the SEO
    signal. Guards against re-introducing the canonical-to-redirect defect
    fixed in the clean-URL sweep. Attribute-order-independent: a `<link>` is
    flagged when the SAME tag carries both a canonical/alternate `rel` and an
    `href` ending in `.html`, whichever attribute comes first."""
    link_tag = re.compile(r"<link\b[^>]*>", flags=REGEX_FLAGS)
    seo_rel = re.compile(r'rel="(?:canonical|alternate)"', flags=REGEX_FLAGS)
    html_href = re.compile(r'href="[^"]*\.html"', flags=REGEX_FLAGS)
    errors: list[str] = []
    # Flat layout: every HTML page lives at the package root (no nested dirs
    # today), so a non-recursive glob covers the whole site.
    for path in sorted(root.glob("*.html")):
        content = path.read_text(encoding="utf-8")
        for tag in link_tag.findall(content):
            if seo_rel.search(tag) and html_href.search(tag):
                errors.append(
                    f"{path.name}: canonical/hreflang pointe vers une URL .html "
                    "(doit être l'URL propre sans extension)"
                )
                break
    return errors


def check_no_external_fonts(root: Path = ROOT) -> list[str]:
    """Fonts are self-hosted (RGPD: no visitor IP sent to Google before
    consent). No HTML page or CSS file may reference the Google Fonts CDN —
    guards against re-introducing the external font dependency (via a page
    <link>, or a CSS `@import`/`url()`) removed in the self-host change."""
    pattern = re.compile(r"fonts\.(?:googleapis|gstatic)\.com", flags=REGEX_FLAGS)
    errors: list[str] = []
    files = sorted(root.glob("*.html")) + sorted(root.glob("*.css"))
    for path in files:
        if pattern.search(path.read_text(encoding="utf-8")):
            errors.append(
                f"{path.name}: référence à Google Fonts (fonts.googleapis/gstatic.com) "
                "— les polices doivent être auto-hébergées (/fonts.css)"
            )
    return errors


def check_no_stale_host(root: Path = ROOT) -> list[str]:
    """The site is hosted on Cloudflare Pages (ADR-0014), not GitHub Pages.
    The legally-required hosting disclosure in the mentions légales must name
    the real host — guards against re-introducing the stale "GitHub Pages"
    host anywhere in the HTML (a factual/legal inaccuracy fixed in the legal
    pages overhaul)."""
    pattern = re.compile(r"GitHub\s+Pages", flags=REGEX_FLAGS)
    errors: list[str] = []
    for path in sorted(root.glob("*.html")):
        if pattern.search(path.read_text(encoding="utf-8")):
            errors.append(
                f"{path.name}: mention « GitHub Pages » — l'hébergeur est "
                "Cloudflare Pages (ADR-0014) ; corriger la disclosure d'hébergement"
            )
    return errors


def collect_errors(root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    errors.extend(check_required_files(root))
    errors.extend(check_html_files(root))
    errors.extend(check_feedback_widget(root))
    errors.extend(check_chat_widget(root))
    errors.extend(check_sitemap_policy(root))
    errors.extend(check_robots_policy(root))
    errors.extend(check_clean_seo_urls(root))
    errors.extend(check_no_external_fonts(root))
    errors.extend(check_no_stale_host(root))
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
