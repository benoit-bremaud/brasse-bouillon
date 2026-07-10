#!/usr/bin/env python3
"""Basic quality gates for the Brasse-Bouillon static website.

This script is intentionally dependency-free so it can run locally and in CI.
"""

from __future__ import annotations

from collections import Counter
from pathlib import Path
import json
import re
import sys
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parent.parent
HOMEPAGE_URL = "https://brasse-bouillon.com/"

# Open Graph share image. Social platforms crop to the 1.91:1 ratio, so the
# card must be exactly 1200×630 or it renders letter-boxed / cropped.
OG_IMAGE = "og-image.png"
OG_IMAGE_SIZE = (1200, 630)
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"

# URLs: the home page plus the four French legal pages. The English legal twins
# and the `-en` stub are `noindex`, and any `.html` URL 308-redirects to its
# clean form, so none of them may ever appear in the sitemap.
SITEMAP_URLS = [
    HOMEPAGE_URL,
    f"{HOMEPAGE_URL}legal",
    f"{HOMEPAGE_URL}privacy",
    f"{HOMEPAGE_URL}cookies",
    f"{HOMEPAGE_URL}terms",
]

REQUIRED_FILES = [
    "index.html",
    "en.html",
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
    "og-image.png",
    "fonts.css",
    "sitemap.xml",
    "robots.txt",
    "_redirects",
    "feedback-widget.js",
    "chat-widget.js",
]

# Every public HTML page must reference the feedback widget loader (a single
# local module) so the "Report" button is never accidentally dropped from one
# page during a future edit.
WIDGET_HTML_FILES = [
    "index.html",
    "en.html",
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
    "en.html",
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
    "en.html": [
        (r"<!DOCTYPE html>", "doctype HTML5 manquant"),
        (r"<html\s+lang=\"en\"", 'balise <html lang="en"> manquante'),
        (r"<title>.+</title>", "balise <title> manquante"),
        (r"id=\"mainContentEn\"", "ancre principale #mainContentEn manquante"),
        # S1 ships en.html "dark": noindex is required now; S2 removes this rule
        # when it flips the page to indexable (ADR-0027 D5 clause 1).
        (
            r"<meta\s+name=\"robots\"\s+content=\"noindex,\s*follow\"\s*/?>",
            "meta robots noindex,follow manquant dans en.html",
        ),
        # The EN home is self-canonical to /en (not the FR master). This is the
        # SEO defect the epic corrects; the generator must never emit canonical=/.
        (
            r"<link\s+rel=\"canonical\"\s+href=\""
            r"https://brasse-bouillon\.com/en\"",
            "canonical EN vers https://brasse-bouillon.com/en manquante",
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
    "en.html": [
        (
            r'"@type"\s*:\s*"SoftwareApplication"',
            "schema SoftwareApplication non autorisé dans en.html "
            "(à déplacer vers app.html)",
        ),
        (
            r'"@type"\s*:\s*"Review"',
            "schema Review non autorisé dans en.html",
        ),
        (
            r'"aggregateRating"\s*:',
            "champ aggregateRating non autorisé dans en.html",
        ),
        (
            r'"ratingValue"\s*:',
            "champ ratingValue non autorisé dans en.html",
        ),
        (
            r'"ratingCount"\s*:',
            "champ ratingCount non autorisé dans en.html",
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
    """The sitemap must advertise EXACTLY the indexable clean URLs (`SITEMAP_URLS`)
    — nothing missing, nothing extra, no duplicate. This blocks re-adding a
    `noindex` twin/stub or a `.html` (308-redirecting) URL, which would send
    crawlers a contradictory signal. Order-independent (sitemap order is
    irrelevant to search engines)."""
    sitemap_path = root / "sitemap.xml"
    if not sitemap_path.exists():
        return []

    try:
        xml_root = ET.parse(sitemap_path).getroot()
    except ET.ParseError as exc:
        return [f"sitemap.xml: XML invalide ({exc})"]

    loc_values = [
        (loc.text or "").strip()
        for loc in xml_root.findall(".//{*}loc")
        if (loc.text or "").strip()
    ]

    if sorted(loc_values) == sorted(SITEMAP_URLS):
        return []

    counts = Counter(loc_values)
    expected = set(SITEMAP_URLS)
    missing = [url for url in SITEMAP_URLS if url not in counts]
    forbidden = sorted(url for url in counts if url not in expected)
    duplicates = sorted(url for url, count in counts.items() if count > 1)

    # At least one category is always non-empty here: the early return above
    # already handled the exact-match case.
    problems: list[str] = []
    if missing:
        problems.append("manquantes: " + ", ".join(missing))
    if forbidden:
        problems.append("interdites: " + ", ".join(forbidden))
    if duplicates:
        problems.append("dupliquées: " + ", ".join(duplicates))

    detail = " ; ".join(problems)
    return [f"sitemap.xml: doit lister exactement les URL indexables ({detail})"]


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


def check_i18n_home_generated(root: Path = ROOT) -> list[str]:
    """The English home is generated from index.html + i18n/home.en.json by
    scripts/build_i18n.py (ADR-0027). This runs the generator in-process and
    checks that en.html is up to date and that no French source drifted from
    its translation — covering key parity, srcHash freshness and the
    regeneration diff in one shot. Skipped for trees without the i18n toolchain
    (e.g. minimal test fixtures)."""
    catalog_path = root / "i18n" / "home.en.json"
    build_script = root / "scripts" / "build_i18n.py"
    if not (catalog_path.exists() and build_script.exists()):
        return []

    try:
        from scripts import build_i18n  # pytest / package context
    except ImportError:  # direct `python3 scripts/quality_gate.py` run
        import build_i18n  # type: ignore[no-redef]

    try:
        source = (root / "index.html").read_text(encoding="utf-8")
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
        generated = build_i18n.generate(source, catalog, check_hashes=True)
    except (build_i18n.BuildError, OSError, json.JSONDecodeError) as exc:
        # Unreadable index.html / malformed catalog must surface as a normal
        # gate failure, not an unhandled crash (parity with check_sitemap_policy).
        return [f"i18n (en.html): {exc}"]

    output_path = root / "en.html"
    current = output_path.read_text(encoding="utf-8") if output_path.exists() else ""
    if current != generated:
        return [
            "en.html est périmé — lancer `python scripts/build_i18n.py` "
            "puis committer le résultat"
        ]
    return []


def check_og_image_dimensions(root: Path = ROOT) -> list[str]:
    """The Open Graph share image must be exactly 1200×630 (the 1.91:1 ratio
    social platforms crop to); a wrong-sized image silently renders a cropped
    or letter-boxed card. The width/height live in the PNG IHDR chunk (bytes
    16–24), read directly to keep this gate dependency-free (no Pillow)."""
    path = root / OG_IMAGE
    if not path.exists():
        # Presence is already enforced by check_required_files; avoid a
        # duplicate error here.
        return []

    header = path.read_bytes()[:24]
    if len(header) < 24 or header[:8] != PNG_SIGNATURE or header[12:16] != b"IHDR":
        return [
            f"{OG_IMAGE}: en-tête PNG invalide (l'image Open Graph doit être un PNG)"
        ]

    width = int.from_bytes(header[16:20], "big")
    height = int.from_bytes(header[20:24], "big")
    if (width, height) != OG_IMAGE_SIZE:
        expected = f"{OG_IMAGE_SIZE[0]}×{OG_IMAGE_SIZE[1]}"
        return [
            f"{OG_IMAGE}: dimensions {width}×{height} — l'image Open Graph doit "
            f"être {expected} (ratio 1.91:1)"
        ]
    return []


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
    errors.extend(check_og_image_dimensions(root))
    errors.extend(check_i18n_home_generated(root))
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
