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
HOMEPAGE_FILES = ("index.html", "en.html")
HOMEPAGE_TITLE_MAX_LENGTH = 60

# Open Graph share images (FR + localized EN card). Social platforms crop to
# the 1.91:1 ratio, so each card must be exactly 1200×630 or it renders
# letter-boxed / cropped.
OG_IMAGE = "og-image.png"
OG_IMAGES = [OG_IMAGE, "og-image-en.png"]
OG_IMAGE_SIZE = (1200, 630)
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"

# URLs: the two landing pages plus the four French legal pages (S2, ADR-0027
# D5 clause 3). The English legal twins are indexable since S2 but stay OUT of
# the sitemap deliberately (secondary pages, paired to their FR twin via
# hreflang); any `.html` URL 308-redirects to its clean form, so neither may
# ever appear here.
SITEMAP_URLS = [
    HOMEPAGE_URL,
    f"{HOMEPAGE_URL}en",
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

    return errors


def check_homepage_seo_metadata(root: Path = ROOT) -> list[str]:
    """Reject verbose titles and obsolete metadata on acquisition pages."""
    errors: list[str] = []
    title_pattern = re.compile(r"<title>(.*?)</title>", flags=REGEX_FLAGS)
    keywords_pattern = re.compile(r'<meta\s+name=["\']keywords["\']', flags=REGEX_FLAGS)
    faq_schema_pattern = re.compile(r'"@type"\s*:\s*"FAQPage"', flags=REGEX_FLAGS)

    for rel_path in HOMEPAGE_FILES:
        full_path = root / rel_path
        if not full_path.exists():
            continue
        content = full_path.read_text(encoding="utf-8")
        title_match = title_pattern.search(content)
        if title_match is not None:
            title = re.sub(r"\s+", " ", title_match.group(1)).strip()
            if len(title) > HOMEPAGE_TITLE_MAX_LENGTH:
                errors.append(
                    f"{rel_path}: homepage title is {len(title)} characters "
                    f"(maximum {HOMEPAGE_TITLE_MAX_LENGTH})"
                )
        if keywords_pattern.search(content):
            errors.append(f"{rel_path}: obsolete meta keywords tag is not allowed")
        if faq_schema_pattern.search(content):
            errors.append(f"{rel_path}: obsolete FAQPage schema is not allowed")

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


def collect_errors(root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    errors.extend(check_required_files(root))
    errors.extend(check_html_files(root))
    errors.extend(check_homepage_seo_metadata(root))
    errors.extend(check_feedback_widget(root))
    errors.extend(check_chat_widget(root))
    errors.extend(check_sitemap_policy(root))
    errors.extend(check_robots_policy(root))
    errors.extend(check_clean_seo_urls(root))
    errors.extend(check_no_external_fonts(root))
    errors.extend(check_no_stale_host(root))
    errors.extend(check_og_image_dimensions(root))
    errors.extend(check_hreflang_reciprocity(root))
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
