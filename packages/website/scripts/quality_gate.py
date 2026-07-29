#!/usr/bin/env python3
"""Basic quality gates for the Brasse-Bouillon static website.

This script is intentionally dependency-free so it can run locally and in CI.
"""

from __future__ import annotations

from html import unescape
from html.parser import HTMLParser
from collections import Counter
from pathlib import Path
import json
import re
import sys
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parent.parent
HOMEPAGE_URL = "https://brasse-bouillon.com/"
HOMEPAGE_FILES = ("index.html", "en.html")
GLOSSARY_REL_PATH = "guides/glossaire-brassage/index.html"
GLOSSARY_REL_PATHS = {
    GLOSSARY_REL_PATH,
    "en/guides/homebrewing-glossary/index.html",
}
SERP_METADATA_FILES = (
    *HOMEPAGE_FILES,
    "legal.html",
    "legal-en.html",
    "privacy.html",
    "privacy-en.html",
    "cookies.html",
    "cookies-en.html",
    "terms.html",
    "terms-en.html",
)
HOMEPAGE_TITLE_MAX_LENGTH = 60
META_DESCRIPTION_MIN_LENGTH = 120
META_DESCRIPTION_MAX_LENGTH = 155
KEYWORDS_META_PATTERN = (
    r"<meta\b"
    r"(?=[^>]*\bname\s*=\s*(?:[\"']keywords[\"']|keywords(?=[\s/>])))"
    r"[^>]*>"
)

# Open Graph share images (FR + localized EN card). Social platforms crop to
# the 1.91:1 ratio, so each card must be exactly 1200×630 or it renders
# letter-boxed / cropped.
OG_IMAGE = "og-image.png"
OG_IMAGES = [OG_IMAGE, "og-image-en.png"]
OG_IMAGE_SIZE = (1200, 630)
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"

# URLs: the two landing pages, public French guides, the English guide hub and
# its fully localized guides, plus four French legal pages. English legal twins
# stay out of the sitemap deliberately; any `.html` URL redirects to its clean
# form, so neither may ever appear here.
SITEMAP_URLS = [
    HOMEPAGE_URL,
    f"{HOMEPAGE_URL}en",
    f"{HOMEPAGE_URL}en/guides/",
    f"{HOMEPAGE_URL}en/guides/first-homebrew/",
    f"{HOMEPAGE_URL}en/guides/homebrew-fermentation-time-temperature/",
    f"{HOMEPAGE_URL}en/guides/homebrewing-glossary/",
    f"{HOMEPAGE_URL}en/guides/ibu-hops-bitterness/",
    f"{HOMEPAGE_URL}en/guides/og-fg-attenuation-homebrew/",
    f"{HOMEPAGE_URL}guides/",
    f"{HOMEPAGE_URL}guides/glossaire-brassage/",
    f"{HOMEPAGE_URL}guides/ibu-biere-amertume-houblon/",
    f"{HOMEPAGE_URL}guides/og-fg-attenuation-biere/",
    f"{HOMEPAGE_URL}guides/premier-brassin/",
    f"{HOMEPAGE_URL}guides/fermentation-biere-duree-temperature/",
    f"{HOMEPAGE_URL}legal",
    f"{HOMEPAGE_URL}privacy",
    f"{HOMEPAGE_URL}cookies",
    f"{HOMEPAGE_URL}terms",
]

# hreflang clusters (S2, ADR-0027 D5 clause 2): every FR/EN pair advertises ONE
# identical cluster — fr → FR page, en → EN page, x-default → FR page — on BOTH
# pages. Google ignores non-reciprocal or incomplete clusters.
HREFLANG_PAIRS = [
    ("index.html", "en.html", HOMEPAGE_URL, f"{HOMEPAGE_URL}en"),
    (
        "guides/index.html",
        "en/guides/index.html",
        f"{HOMEPAGE_URL}guides/",
        f"{HOMEPAGE_URL}en/guides/",
    ),
    (
        "guides/premier-brassin/index.html",
        "en/guides/first-homebrew/index.html",
        f"{HOMEPAGE_URL}guides/premier-brassin/",
        f"{HOMEPAGE_URL}en/guides/first-homebrew/",
    ),
    (
        "guides/fermentation-biere-duree-temperature/index.html",
        "en/guides/homebrew-fermentation-time-temperature/index.html",
        f"{HOMEPAGE_URL}guides/fermentation-biere-duree-temperature/",
        f"{HOMEPAGE_URL}en/guides/homebrew-fermentation-time-temperature/",
    ),
    (
        "guides/glossaire-brassage/index.html",
        "en/guides/homebrewing-glossary/index.html",
        f"{HOMEPAGE_URL}guides/glossaire-brassage/",
        f"{HOMEPAGE_URL}en/guides/homebrewing-glossary/",
    ),
    (
        "guides/ibu-biere-amertume-houblon/index.html",
        "en/guides/ibu-hops-bitterness/index.html",
        f"{HOMEPAGE_URL}guides/ibu-biere-amertume-houblon/",
        f"{HOMEPAGE_URL}en/guides/ibu-hops-bitterness/",
    ),
    (
        "guides/og-fg-attenuation-biere/index.html",
        "en/guides/og-fg-attenuation-homebrew/index.html",
        f"{HOMEPAGE_URL}guides/og-fg-attenuation-biere/",
        f"{HOMEPAGE_URL}en/guides/og-fg-attenuation-homebrew/",
    ),
    ("legal.html", "legal-en.html", f"{HOMEPAGE_URL}legal", f"{HOMEPAGE_URL}legal-en"),
    (
        "privacy.html",
        "privacy-en.html",
        f"{HOMEPAGE_URL}privacy",
        f"{HOMEPAGE_URL}privacy-en",
    ),
    (
        "cookies.html",
        "cookies-en.html",
        f"{HOMEPAGE_URL}cookies",
        f"{HOMEPAGE_URL}cookies-en",
    ),
    ("terms.html", "terms-en.html", f"{HOMEPAGE_URL}terms", f"{HOMEPAGE_URL}terms-en"),
]


# Breadcrumb structured data mirrors the visible legal navigation. Each
# secondary page has one two-step, locale-specific trail: locale home → page.
BREADCRUMB_TRAILS = {
    "legal.html": (
        ("Accueil", HOMEPAGE_URL),
        ("Mentions légales", f"{HOMEPAGE_URL}legal"),
    ),
    "legal-en.html": (
        ("Home", f"{HOMEPAGE_URL}en"),
        ("Legal Notice", f"{HOMEPAGE_URL}legal-en"),
    ),
    "privacy.html": (
        ("Accueil", HOMEPAGE_URL),
        ("Politique de confidentialité", f"{HOMEPAGE_URL}privacy"),
    ),
    "privacy-en.html": (
        ("Home", f"{HOMEPAGE_URL}en"),
        ("Privacy Policy", f"{HOMEPAGE_URL}privacy-en"),
    ),
    "cookies.html": (
        ("Accueil", HOMEPAGE_URL),
        ("Politique cookies", f"{HOMEPAGE_URL}cookies"),
    ),
    "cookies-en.html": (
        ("Home", f"{HOMEPAGE_URL}en"),
        ("Cookie Policy", f"{HOMEPAGE_URL}cookies-en"),
    ),
    "terms.html": (
        ("Accueil", HOMEPAGE_URL),
        ("Conditions d’utilisation", f"{HOMEPAGE_URL}terms"),
    ),
    "terms-en.html": (
        ("Home", f"{HOMEPAGE_URL}en"),
        ("Terms of Use", f"{HOMEPAGE_URL}terms-en"),
    ),
}

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
    OG_IMAGE,
    "fonts.css",
    "sitemap.xml",
    "robots.txt",
    "llms.txt",
    ".well-known/security.txt",
    "_redirects",
    "feedback-widget.js",
    "chat-widget.js",
    "og-image-en.png",
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
            r'<a\s+href="/guides/"\s+hreflang="fr"',
            "lien interne vers les guides manquant sur la page FR",
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
        # The EN home is self-canonical to /en (not the FR master). This is the
        # SEO defect the epic corrects; the generator must never emit canonical=/.
        (
            r"<link\s+rel=\"canonical\"\s+href=\""
            r"https://brasse-bouillon\.com/en\"",
            "canonical EN vers https://brasse-bouillon.com/en manquante",
        ),
        (
            r'<a\b(?=[^>]*\bhref="/en/guides/")(?=[^>]*\bhreflang="en")[^>]*>',
            "lien interne vers les guides anglais manquant sur la page EN",
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

# Any robots meta carrying a noindex, regardless of attribute order or quote
# style (`<meta content='noindex' name=robots>` must not slip past the guard).
NOINDEX_META_PATTERN = r"<meta\b(?=[^>]*\brobots\b)(?=[^>]*\bnoindex\b)[^>]*>"

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
        (
            r"<(script|iframe)[^>]*ko-fi",
            "script/iframe Ko-fi non autorisé dans index.html "
            "(ADR-0028 clause 2 : lien sortant simple uniquement)",
        ),
    ],
    "en.html": [
        # S2 (ADR-0027 D5): the EN pages are indexed — a reintroduced noindex
        # would silently undo the SEO switch.
        (
            NOINDEX_META_PATTERN,
            "meta robots noindex interdit dans en.html depuis la bascule SEO S2",
        ),
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
        (
            r"<(script|iframe)[^>]*ko-fi",
            "script/iframe Ko-fi non autorisé dans en.html "
            "(ADR-0028 clause 2 : lien sortant simple uniquement)",
        ),
    ],
    # Same S2 guard for the four EN legal twins (de-noindexed with the switch).
    **{
        rel_path: [
            (
                NOINDEX_META_PATTERN,
                f"meta robots noindex interdit dans {rel_path} depuis la "
                "bascule SEO S2",
            )
        ]
        for rel_path in (
            "legal-en.html",
            "privacy-en.html",
            "cookies-en.html",
            "terms-en.html",
        )
    },
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


def _guide_html_paths(root: Path) -> list[Path]:
    guide_roots = (root / "guides", root / "en/guides")
    return sorted(
        path
        for guides_root in guide_roots
        if guides_root.exists()
        for path in guides_root.rglob("*.html")
    )


def _all_html_paths(root: Path) -> list[Path]:
    return sorted(root.glob("*.html")) + _guide_html_paths(root)


def _guide_url(root: Path, path: Path) -> str:
    relative_directory = path.relative_to(root).parent.as_posix()
    return f"{HOMEPAGE_URL}{relative_directory}/"


def _guide_h1(content: str) -> str:
    match = re.search(r"<h1\b[^>]*>(.*?)</h1>", content, flags=REGEX_FLAGS)
    if match is None:
        return ""
    return unescape(re.sub(r"<[^>]+>", "", match.group(1))).strip()


def _guide_primary_schema_type(root: Path, path: Path) -> str:
    rel_path = path.relative_to(root).as_posix()
    if rel_path in {"guides/index.html", "en/guides/index.html"}:
        return "CollectionPage"
    if rel_path in GLOSSARY_REL_PATHS:
        return "DefinedTermSet"
    return "Article"


def _guide_og_type(root: Path, path: Path) -> str:
    primary_type = _guide_primary_schema_type(root, path)
    return "website" if primary_type != "Article" else "article"


def check_required_files(root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    for rel_path in REQUIRED_FILES:
        full_path = root / rel_path
        if not full_path.exists():
            errors.append(f"Fichier requis manquant: {rel_path}")
    return errors


def check_html_files(root: Path = ROOT) -> list[str]:
    errors: list[str] = []

    # Union of both rule tables: a file may carry only disallowed patterns
    # (e.g. the EN legal twins' noindex ban) without any required-pattern rule.
    for rel_path in sorted(HTML_RULES.keys() | DISALLOWED_HTML_PATTERNS.keys()):
        rules = HTML_RULES.get(rel_path, [])
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

    for path in _guide_html_paths(root):
        rel_path = path.relative_to(root).as_posix()
        content = path.read_text(encoding="utf-8")
        for pattern, message in BLOCKED_PATTERNS:
            if re.search(pattern, content):
                errors.append(f"{rel_path}: {message}")
        expected_language = "en" if rel_path.startswith("en/guides/") else "fr"
        for pattern, message in (
            (r"<!DOCTYPE html>", "doctype HTML5 manquant"),
            (
                rf'<html\s+lang="{expected_language}"',
                f'balise <html lang="{expected_language}"> manquante',
            ),
        ):
            if not re.search(pattern, content, flags=REGEX_FLAGS):
                errors.append(f"{rel_path}: {message}")

        expected_url = re.escape(_guide_url(root, path))
        canonical_pattern = rf'<link\s+rel="canonical"\s+href="{expected_url}"'
        if not re.search(canonical_pattern, content, flags=REGEX_FLAGS):
            errors.append(f"{rel_path}: canonical guide incorrecte")

        expected_og_type = re.escape(_guide_og_type(root, path))
        og_type_pattern = rf'<meta\s+property="og:type"\s+content="{expected_og_type}"'
        if not re.search(og_type_pattern, content, flags=REGEX_FLAGS):
            errors.append(f"{rel_path}: og:type guide incorrect")

        h1_count = len(re.findall(r"<h1\b", content, flags=REGEX_FLAGS))
        if h1_count != 1:
            errors.append(
                f"{rel_path}: doit contenir exactement un h1 (trouvé: {h1_count})"
            )
        if re.search(r'<[^>]+\sstyle\s*=\s*["\']', content, flags=REGEX_FLAGS):
            errors.append(f"{rel_path}: style inline interdit")
        if re.search(NOINDEX_META_PATTERN, content, flags=REGEX_FLAGS):
            errors.append(f"{rel_path}: meta robots noindex interdit")

    return errors


def check_homepage_seo_metadata(root: Path = ROOT) -> list[str]:
    """Reject obsolete metadata on acquisition pages."""
    errors: list[str] = []
    keywords_pattern = re.compile(KEYWORDS_META_PATTERN, flags=REGEX_FLAGS)
    faq_schema_pattern = re.compile(r'"@type"\s*:\s*"FAQPage"', flags=REGEX_FLAGS)

    for rel_path in HOMEPAGE_FILES:
        full_path = root / rel_path
        if not full_path.exists():
            continue
        content = full_path.read_text(encoding="utf-8")
        if keywords_pattern.search(content):
            errors.append(f"{rel_path}: obsolete meta keywords tag is not allowed")
        if faq_schema_pattern.search(content):
            errors.append(f"{rel_path}: obsolete FAQPage schema is not allowed")

    return errors


def _guide_breadcrumb_trails(
    root: Path,
) -> dict[str, tuple[tuple[str, str], ...]]:
    trails: dict[str, tuple[tuple[str, str], ...]] = {}
    for path in _guide_html_paths(root):
        rel_path = path.relative_to(root).as_posix()
        guide_url = _guide_url(root, path)
        is_english = rel_path.startswith("en/guides/")
        home = (
            ("Home", f"{HOMEPAGE_URL}en") if is_english else ("Accueil", HOMEPAGE_URL)
        )
        hub_url = (
            f"{HOMEPAGE_URL}en/guides/" if is_english else f"{HOMEPAGE_URL}guides/"
        )
        if rel_path in {"guides/index.html", "en/guides/index.html"}:
            trail = (home, ("Guides", guide_url))
        else:
            content = path.read_text(encoding="utf-8")
            trail = (home, ("Guides", hub_url), (_guide_h1(content), guide_url))
        trails[rel_path] = trail
    return trails


def check_breadcrumb_schema(root: Path = ROOT) -> list[str]:
    """Require one valid, canonical BreadcrumbList per secondary page."""
    script_pattern = re.compile(
        r"<script\b"
        r"(?=[^>]*\btype\s*=\s*[\"']application/ld\+json[\"'])"
        r"[^>]*>(.*?)</script\b[^>]*>",
        flags=REGEX_FLAGS,
    )
    errors: list[str] = []

    trails = {**BREADCRUMB_TRAILS, **_guide_breadcrumb_trails(root)}
    for rel_path, trail in trails.items():
        full_path = root / rel_path
        if not full_path.exists():
            continue

        breadcrumbs: list[dict[str, object]] = []
        has_malformed_json_ld = False
        content = full_path.read_text(encoding="utf-8")
        for raw_payload in script_pattern.findall(content):
            try:
                payload = json.loads(raw_payload)
            except json.JSONDecodeError as exc:
                errors.append(f"{rel_path}: JSON-LD invalide ({exc.msg})")
                has_malformed_json_ld = True
                continue
            if isinstance(payload, dict) and payload.get("@type") == "BreadcrumbList":
                breadcrumbs.append(payload)

        if not breadcrumbs and has_malformed_json_ld:
            continue

        if len(breadcrumbs) != 1:
            errors.append(
                f"{rel_path}: doit contenir exactement un schema BreadcrumbList "
                f"(trouvé: {len(breadcrumbs)})"
            )
            continue

        expected_items = [
            {
                "@type": "ListItem",
                "position": position,
                "name": name,
                "item": url,
            }
            for position, (name, url) in enumerate(trail, start=1)
        ]
        breadcrumb = breadcrumbs[0]
        if (
            breadcrumb.get("@context") != "https://schema.org"
            or breadcrumb.get("itemListElement") != expected_items
        ):
            errors.append(
                f"{rel_path}: BreadcrumbList ne correspond pas au parcours "
                "canonique attendu"
            )

    return errors


def check_guide_structured_data(root: Path = ROOT) -> list[str]:
    """Validate each guide page's primary structured-data type."""
    script_pattern = re.compile(
        r"<script\b"
        r"(?=[^>]*\btype\s*=\s*[\"']application/ld\+json[\"'])"
        r"[^>]*>(.*?)</script\b[^>]*>",
        flags=REGEX_FLAGS,
    )
    errors: list[str] = []

    for path in _guide_html_paths(root):
        rel_path = path.relative_to(root).as_posix()
        content = path.read_text(encoding="utf-8")
        payloads: list[dict[str, object]] = []
        for raw_payload in script_pattern.findall(content):
            try:
                payload = json.loads(raw_payload)
            except json.JSONDecodeError:
                continue
            if isinstance(payload, dict):
                payloads.append(payload)

        expected_type = _guide_primary_schema_type(root, path)
        matching = [
            payload for payload in payloads if payload.get("@type") == expected_type
        ]
        if len(matching) != 1:
            errors.append(
                f"{rel_path}: doit contenir exactement un schema {expected_type} "
                f"(trouvé: {len(matching)})"
            )
            continue

        schema = matching[0]
        canonical = _guide_url(root, path)
        title_key = "headline" if expected_type == "Article" else "name"
        expected_language = "en" if rel_path.startswith("en/guides/") else "fr-FR"
        if (
            schema.get("@context") != "https://schema.org"
            or schema.get("url") != canonical
            or schema.get("inLanguage") != expected_language
            or schema.get(title_key) != _guide_h1(content)
        ):
            errors.append(f"{rel_path}: schema {expected_type} incohérent avec la page")
            continue

        if expected_type == "Article" and (
            schema.get("mainEntityOfPage") != canonical
            or not schema.get("datePublished")
            or not schema.get("dateModified")
        ):
            errors.append(f"{rel_path}: schema Article incomplet")
        elif expected_type == "CollectionPage" and schema.get("isPartOf") != {
            "@type": "WebSite",
            "url": HOMEPAGE_URL,
        }:
            errors.append(f"{rel_path}: schema CollectionPage incomplet")
        elif expected_type == "DefinedTermSet":
            terms = schema.get("hasDefinedTerm")
            term_ids: list[str] = []
            terms_are_valid = isinstance(terms, list) and bool(terms)
            if terms_are_valid:
                for term in terms:
                    if not isinstance(term, dict):
                        terms_are_valid = False
                        break
                    term_id = term.get("@id")
                    if not isinstance(term_id, str):
                        terms_are_valid = False
                        break
                    term_ids.append(term_id)
                    if (
                        term.get("@type") != "DefinedTerm"
                        or not term_id.startswith(f"{canonical}#")
                        or not term.get("name")
                        or not term.get("description")
                        or term.get("inDefinedTermSet") != canonical
                        or not isinstance(term.get("alternateName"), list)
                    ):
                        terms_are_valid = False
                        break
            if (
                schema.get("@id") != canonical
                or schema.get("isPartOf") != {"@type": "WebSite", "url": HOMEPAGE_URL}
                or not terms_are_valid
                or len(term_ids) != len(set(term_ids))
            ):
                errors.append(f"{rel_path}: schema DefinedTermSet incomplet")

        if rel_path == "en/guides/index.html":
            card_matches = re.findall(
                r'<article\s+class="guide-card".*?<h2><a\s+href="([^"]+)">'
                r"(.*?)</a></h2>",
                content,
                flags=REGEX_FLAGS,
            )
            expected_resources = [
                {
                    "@type": "ListItem",
                    "position": position,
                    "name": unescape(re.sub(r"<[^>]+>", "", name)).strip(),
                    "url": f"{HOMEPAGE_URL.rstrip('/')}{href}",
                }
                for position, (href, name) in enumerate(card_matches, start=1)
            ]
            item_list = schema.get("mainEntity")
            if not isinstance(item_list, dict) or (
                item_list.get("@type") != "ItemList"
                or item_list.get("numberOfItems") != len(expected_resources)
                or item_list.get("itemListElement") != expected_resources
            ):
                errors.append(
                    f"{rel_path}: schema ItemList incohérent avec les cartes visibles"
                )

        procedure_match = re.search(
            # Tag-agnostic on purpose: this check asserts the HowTo schema is
            # backed by VISIBLE content, which the class identifies — not the
            # element name. It matched `div` only, so switching the block to a
            # `section` (required for its `aria-labelledby` to be valid) silently
            # broke it.
            r'<(?:section|div)\s+class="guide-procedure"\s+id="([^"]+)".*?'
            r"<h3[^>]*>(.*?)</h3>.*?<ol>(.*?)</ol>",
            content,
            flags=REGEX_FLAGS,
        )
        how_tos = [payload for payload in payloads if payload.get("@type") == "HowTo"]
        if procedure_match is None and how_tos:
            errors.append(f"{rel_path}: schema HowTo sans procédure visible")
        elif procedure_match is not None:
            if len(how_tos) != 1:
                errors.append(
                    f"{rel_path}: doit contenir exactement un schema HowTo "
                    f"pour la procédure visible (trouvé: {len(how_tos)})"
                )
            else:
                procedure_id, procedure_title, procedure_markup = (
                    procedure_match.groups()
                )
                visible_steps = re.findall(
                    r'<li\s+id="([^"]+)">.*?<h4>(.*?)</h4>\s*<p>(.*?)</p>',
                    procedure_markup,
                    flags=REGEX_FLAGS,
                )
                expected_steps = [
                    {
                        "@type": "HowToStep",
                        "position": position,
                        "name": unescape(re.sub(r"<[^>]+>", "", name)).strip(),
                        "text": unescape(re.sub(r"<[^>]+>", "", text)).strip(),
                        "url": f"{canonical}#{step_id}",
                    }
                    for position, (step_id, name, text) in enumerate(
                        visible_steps, start=1
                    )
                ]
                how_to = how_tos[0]
                expected_id = f"{canonical}#{procedure_id}"
                if (
                    how_to.get("@context") != "https://schema.org"
                    or how_to.get("@id") != expected_id
                    or how_to.get("url") != expected_id
                    or how_to.get("mainEntityOfPage") != canonical
                    or how_to.get("inLanguage") != "en"
                    or how_to.get("name")
                    != unescape(re.sub(r"<[^>]+>", "", procedure_title)).strip()
                    or how_to.get("step") != expected_steps
                    or schema.get("hasPart") != {"@id": expected_id}
                ):
                    errors.append(
                        f"{rel_path}: schema HowTo incohérent avec la procédure visible"
                    )

    return errors


def _meta_content(
    content: str, selector_attribute: str, selector_value: str
) -> str | None:
    """Return meta content regardless of attribute order or quote style."""
    meta_pattern = re.compile(r"<meta\b[^>]*>", flags=REGEX_FLAGS)
    attribute_pattern = re.compile(
        r"""([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))""",
        flags=re.DOTALL,
    )
    expected_attribute = selector_attribute.casefold()
    expected_value = selector_value.casefold()

    for meta_match in meta_pattern.finditer(content):
        attributes: dict[str, str] = {}
        for attribute_match in attribute_pattern.finditer(meta_match.group(0)):
            value = next(
                candidate
                for candidate in attribute_match.groups()[1:]
                if candidate is not None
            )
            attributes[attribute_match.group(1).casefold()] = value
        if attributes.get(expected_attribute, "").casefold() == expected_value:
            return attributes.get("content")

    return None


def check_serp_metadata(root: Path = ROOT) -> list[str]:
    """Keep indexable-page search snippets concise, unique, and synchronized."""
    errors: list[str] = []
    title_pattern = re.compile(r"<title>(.*?)</title>", flags=REGEX_FLAGS)
    titles: dict[str, list[str]] = {}
    descriptions: dict[str, list[str]] = {}

    guide_files = tuple(
        path.relative_to(root).as_posix() for path in _guide_html_paths(root)
    )
    for rel_path in (*SERP_METADATA_FILES, *guide_files):
        full_path = root / rel_path
        if not full_path.exists():
            continue
        content = full_path.read_text(encoding="utf-8")
        title_match = title_pattern.search(content)
        if title_match is None:
            errors.append(f"{rel_path}: SEO title is missing")
            continue

        title = re.sub(r"\s+", " ", title_match.group(1)).strip()
        titles.setdefault(title, []).append(rel_path)
        if len(title) > HOMEPAGE_TITLE_MAX_LENGTH:
            errors.append(
                f"{rel_path}: SEO title is {len(title)} characters "
                f"(maximum {HOMEPAGE_TITLE_MAX_LENGTH})"
            )

        description = _meta_content(content, "name", "description")
        if description is None:
            errors.append(f"{rel_path}: meta description is missing")
        else:
            normalized_description = re.sub(r"\s+", " ", description).strip()
            descriptions.setdefault(normalized_description, []).append(rel_path)
            description_length = len(normalized_description)
            if not (
                META_DESCRIPTION_MIN_LENGTH
                <= description_length
                <= META_DESCRIPTION_MAX_LENGTH
            ):
                errors.append(
                    f"{rel_path}: meta description is {description_length} characters "
                    f"(expected {META_DESCRIPTION_MIN_LENGTH}–"
                    f"{META_DESCRIPTION_MAX_LENGTH})"
                )

        for selector_attribute, selector_value, label in (
            ("property", "og:title", "Open Graph title"),
            ("name", "twitter:title", "Twitter title"),
        ):
            social_title = _meta_content(content, selector_attribute, selector_value)
            if social_title is None:
                errors.append(f"{rel_path}: {label} is missing")
                continue
            normalized_social_title = re.sub(r"\s+", " ", social_title).strip()
            if normalized_social_title != title:
                errors.append(f"{rel_path}: {label} must match the SEO title")

    for label, values in (("SEO title", titles), ("meta description", descriptions)):
        for paths in values.values():
            if len(paths) > 1:
                errors.append(f"duplicate {label}: {', '.join(paths)}")

    return errors


def check_feedback_widget(root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    guide_files = tuple(
        path.relative_to(root).as_posix() for path in _guide_html_paths(root)
    )
    for rel_path in (*WIDGET_HTML_FILES, *guide_files):
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
    errors: list[str] = []
    if xml_root.findall(".//{*}lastmod"):
        errors.append(
            "sitemap.xml: lastmod doit être généré au déploiement, "
            "jamais enregistré dans le modèle source"
        )

    if sorted(loc_values) == sorted(SITEMAP_URLS):
        return errors

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
    errors.append(f"sitemap.xml: doit lister exactement les URL indexables ({detail})")
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
    for path in _all_html_paths(root):
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
    files = _all_html_paths(root) + sorted(root.glob("*.css"))
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
    for path in _all_html_paths(root):
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
        # no-redef is a false positive: exactly one of the two import forms
        # runs and both bind the same module object.
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
            "en.html est périmé — lancer `python3 scripts/build_i18n.py` "
            "puis committer le résultat"
        ]
    return []


def check_legal_freshness(root: Path = ROOT) -> list[str]:
    """Freshness guard for the hand-maintained EN legal twins (S4, ADR-0027 D1
    clause 5). Each `{stem}-en.html` embeds a sha1 of its FR source; a FR legal
    edit that skips the EN re-review leaves the stamp stale — a hard failure.
    The author reviews the EN twin, runs `build_i18n.py --stamp`, and commits.
    Skipped for trees without the i18n toolchain (minimal test fixtures)."""
    if not (root / "scripts" / "build_i18n.py").exists():
        return []

    try:
        from scripts import build_i18n  # pytest / package context
    except ImportError:  # direct `python3 scripts/quality_gate.py` run
        # no-redef: exactly one import form runs; both bind the same module.
        import build_i18n  # type: ignore[no-redef]

    errors: list[str] = []
    for stem in build_i18n.LEGAL_STEMS:
        fr_path = root / f"{stem}.html"
        en_path = root / f"{stem}-en.html"
        if not fr_path.exists() or not en_path.exists():
            continue
        stamped = build_i18n.read_legal_stamp(en_path.read_text(encoding="utf-8"))
        # Reuse the generator's helper so the hashing policy stays single-source.
        expected = build_i18n.fr_legal_hash(root, stem)
        if stamped is None:
            errors.append(
                f"{stem}-en.html: tampon i18n-src manquant "
                "(lancer `python3 scripts/build_i18n.py --stamp`)"
            )
        elif stamped != expected:
            errors.append(
                f"{stem}-en.html: tampon i18n-src périmé — {stem}.html a changé "
                "sans re-relecture EN (lancer `python3 scripts/build_i18n.py --stamp`)"
            )
    return errors


def check_og_image_dimensions(root: Path = ROOT) -> list[str]:
    """Every Open Graph share image (FR + localized EN card) must be exactly
    1200×630 (the 1.91:1 ratio social platforms crop to); a wrong-sized image
    silently renders a cropped or letter-boxed card. The width/height live in
    the PNG IHDR chunk (bytes 16–24), read directly to keep this gate
    dependency-free (no Pillow)."""
    errors: list[str] = []
    for rel_path in OG_IMAGES:
        path = root / rel_path
        if not path.exists():
            # Presence is already enforced by check_required_files; avoid a
            # duplicate error here.
            continue

        with path.open("rb") as image_file:
            header = image_file.read(24)
        if len(header) < 24 or header[:8] != PNG_SIGNATURE or header[12:16] != b"IHDR":
            errors.append(
                f"{rel_path}: en-tête PNG invalide (l'image Open Graph doit "
                "être un PNG)"
            )
            continue

        width = int.from_bytes(header[16:20], "big")
        height = int.from_bytes(header[20:24], "big")
        if (width, height) != OG_IMAGE_SIZE:
            expected = f"{OG_IMAGE_SIZE[0]}×{OG_IMAGE_SIZE[1]}"
            errors.append(
                f"{rel_path}: dimensions {width}×{height} — l'image Open Graph "
                f"doit être {expected} (ratio 1.91:1)"
            )
    return errors


def check_hreflang_reciprocity(root: Path = ROOT) -> list[str]:
    """Every FR/EN page pair must advertise ONE identical, complete hreflang
    cluster on BOTH pages: `fr` → the FR page, `en` → the EN page, `x-default`
    → the FR page (S2, ADR-0027 D5 clause 2). Google ignores clusters that are
    non-reciprocal, that lack the self-reference, or that diverge between the
    two pages — so any drift here silently kills the whole cluster."""
    errors: list[str] = []
    link_re = re.compile(
        r'<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"'
    )
    for fr_file, en_file, fr_url, en_url in HREFLANG_PAIRS:
        expected = {"fr": fr_url, "en": en_url, "x-default": fr_url}
        for rel_path in (fr_file, en_file):
            full_path = root / rel_path
            if not full_path.exists():
                continue
            pairs = link_re.findall(full_path.read_text(encoding="utf-8"))
            # A dict() would silently keep only the LAST duplicate, letting a
            # malformed double declaration pass — surface it explicitly.
            langs = [lang for lang, _href in pairs]
            duplicates = sorted({lang for lang in langs if langs.count(lang) > 1})
            if duplicates:
                errors.append(
                    f"{rel_path}: déclaration(s) hreflang dupliquée(s): "
                    f"{', '.join(duplicates)}"
                )
                continue
            found = dict(pairs)
            if found != expected:
                errors.append(
                    f"{rel_path}: cluster hreflang incomplet ou non réciproque — "
                    f"attendu {expected}, trouvé {found or '{}'}"
                )
    return errors


#: Elements that map to ARIA `role=generic`. Generic roles do not support an
#: accessible name, so `aria-label` / `aria-labelledby` on them is invalid HTML
#: and is discarded by assistive technology — the label silently does nothing.
#:
#: Known limitation, deliberate: HTML-AAM maps more elements to `generic`
#: (`b`, `i`, `u`, `bdi`, `bdo`, `hgroup`, and a nameless `section`/`a`). Only the
#: two that actually occurred in production are listed, rather than reimplementing
#: a full role resolver for markup this generator never emits (ADR-0001: build for
#: today). Extend the set if a guide author ever labels one of the others.
GENERIC_NAMEABLE_TAGS = frozenset({"div", "span"})

#: Naming attributes that require a name-supporting role to have any effect.
ARIA_NAMING_ATTRIBUTES = ("aria-label", "aria-labelledby")

#: ARIA roles that BOTH support an accessible name and are actually assigned to
#: generic containers in this project — an inventory of the committed pages
#: returns exactly these three.
#:
#: Deliberately a **fail-closed allowlist** rather than a full ARIA registry.
#: Merely requiring a non-empty `role` is not enough: `generic`, `presentation`
#: and `none` *prohibit* naming, and an unrecognized token such as
#: `role="bogus"` falls back to the implicit `generic` role. In all three cases
#: the naming attribute is silently dropped, which is the exact defect this
#: check exists to catch. A false positive here costs one word (add the role
#: below); a silent bypass costs an accessibility regression in production.
NAME_SUPPORTING_ROLES = frozenset({"group", "img", "status"})


def _resolved_role(attrs: list[tuple[str, str | None]]) -> str:
    """The element's effective `role` token, lowercased, or `""` when the
    attribute is absent, empty or whitespace-only.

    `role` accepts a space-separated fallback list in which the first token
    wins, so only that token is resolved."""
    for name, value in attrs:
        if name != "role":
            continue
        tokens = (value or "").split()
        return tokens[0].lower() if tokens else ""
    return ""


class _AriaNamingAuditor(HTMLParser):
    """Collects the two HTML-ARIA naming violations that shipped undetected in
    the English guide renderer (19 W3C errors across 5 pages, audit 2026-07-29):

    1. a `figure` holding a `figcaption` must not carry `role` — the caption is
       already the figure's accessible name, and overriding the role discards
       the caption's semantics;
    2. `aria-label` / `aria-labelledby` on a roleless `div` / `span`.

    Both are invalid markup that *looks* like an accessibility improvement while
    doing nothing, which is why a human reviewer and the existing gate both
    missed them. Kept as a parser rather than a regex because rule 1 depends on
    element nesting, which a regex cannot see reliably.
    """

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.violations: list[tuple[int, str]] = []
        # Stack, because a figure may legitimately nest inside another figure.
        self._open_figures: list[dict[str, object]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = {name for name, _value in attrs}
        role = _resolved_role(attrs)
        line = self.getpos()[0]

        if tag == "figure":
            self._open_figures.append(
                {"has_role": bool(role), "has_caption": False, "line": line}
            )
        elif tag == "figcaption" and self._open_figures:
            self._open_figures[-1]["has_caption"] = True

        if tag in GENERIC_NAMEABLE_TAGS and role not in NAME_SUPPORTING_ROLES:
            for naming_attribute in ARIA_NAMING_ATTRIBUTES:
                if naming_attribute in attributes:
                    detail = (
                        f'role="{role}" n\'accepte pas de nom accessible'
                        if role
                        else "aucun role (role=generic implicite)"
                    )
                    self.violations.append(
                        (
                            line,
                            f"<{tag}> porte {naming_attribute} mais {detail} — "
                            "l'étiquette est ignorée par les lecteurs d'écran ; "
                            "utiliser un élément de sectionnement "
                            "(section/nav/aside) ou un role de "
                            f"{sorted(NAME_SUPPORTING_ROLES)}",
                        )
                    )

    def handle_endtag(self, tag: str) -> None:
        if tag != "figure" or not self._open_figures:
            return
        figure = self._open_figures.pop()
        if figure["has_role"] and figure["has_caption"]:
            self.violations.append(
                (
                    int(figure["line"]),
                    "<figure> contenant un <figcaption> ne doit pas porter "
                    "role — la légende fournit déjà le nom accessible",
                )
            )


def check_aria_naming_validity(root: Path = ROOT) -> list[str]:
    """Every committed HTML page must be free of the invalid-ARIA naming
    patterns described in `_AriaNamingAuditor`.

    Deliberately an offline, stdlib-only structural check rather than a call to
    the W3C validator in CI: no network dependency, no rate limit, no flake, and
    it fails on the precise class of defect that reached production instead of
    on generic markup noise. A full validator pass stays a manual audit step."""
    errors: list[str] = []
    for path in _all_html_paths(root):
        auditor = _AriaNamingAuditor()
        auditor.feed(path.read_text(encoding="utf-8"))
        auditor.close()
        relative_path = path.relative_to(root)
        for line, message in auditor.violations:
            errors.append(f"{relative_path}:{line}: {message}")
    return errors


def collect_errors(root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    errors.extend(check_required_files(root))
    errors.extend(check_html_files(root))
    errors.extend(check_homepage_seo_metadata(root))
    errors.extend(check_breadcrumb_schema(root))
    errors.extend(check_guide_structured_data(root))
    errors.extend(check_serp_metadata(root))
    errors.extend(check_feedback_widget(root))
    errors.extend(check_chat_widget(root))
    errors.extend(check_sitemap_policy(root))
    errors.extend(check_robots_policy(root))
    errors.extend(check_clean_seo_urls(root))
    errors.extend(check_no_external_fonts(root))
    errors.extend(check_no_stale_host(root))
    errors.extend(check_og_image_dimensions(root))
    errors.extend(check_hreflang_reciprocity(root))
    errors.extend(check_aria_naming_validity(root))
    errors.extend(check_legal_freshness(root))
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
