from __future__ import annotations

from pathlib import Path
import json
import tempfile
import unittest

from scripts import build_i18n, quality_gate


def _write_file(base: Path, rel_path: str, content: str) -> None:
    target = base / rel_path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")


def _png_header_bytes(width: int, height: int) -> bytes:
    """Minimal 24-byte PNG head (signature + IHDR length/type/width/height) —
    enough for the header-only dimension check, no image body needed."""
    return (
        b"\x89PNG\r\n\x1a\n"
        + (13).to_bytes(4, "big")
        + b"IHDR"
        + width.to_bytes(4, "big")
        + height.to_bytes(4, "big")
    )


def _write_og_image(base: Path, width: int = 1200, height: int = 630) -> None:
    (base / "og-image.png").write_bytes(_png_header_bytes(width, height))
    (base / "og-image-en.png").write_bytes(_png_header_bytes(width, height))


def _serp_description(seed: str) -> str:
    return seed + " " + "x" * (quality_gate.META_DESCRIPTION_MIN_LENGTH - len(seed) - 1)


def _breadcrumb_script(rel_path: str) -> str:
    items = [
        {
            "@type": "ListItem",
            "position": position,
            "name": name,
            "item": url,
        }
        for position, (name, url) in enumerate(
            quality_gate.BREADCRUMB_TRAILS[rel_path], start=1
        )
    ]
    payload = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items,
    }
    return (
        '<script type="application/ld+json">'
        f"{json.dumps(payload, ensure_ascii=False)}"
        "</script>"
    )


def _create_valid_fixture(base: Path) -> None:
    _write_file(base, "README.md", "# readme\n")
    _write_file(base, "CONTRIBUTING.md", "# contributing\n")
    _write_file(base, "favicon.ico", "ico")
    _write_og_image(base)
    _write_file(base, "fonts.css", "/* self-hosted fonts */\n")
    _write_file(base, "feedback-widget.js", "// feedback widget loader\n")
    _write_file(base, "chat-widget.js", "// chat widget loader\n")
    widget_tag = '<script type="module" src="feedback-widget.js"></script>'
    legal_html_template = (
        '<!DOCTYPE html><html lang="{lang}"><head>'
        "<title>{title}</title>"
        '<meta name="description" content="{description}">'
        '<meta property="og:title" content="{title}">'
        '<meta name="twitter:title" content="{title}">'
        '<link rel="alternate" hreflang="fr" href="https://brasse-bouillon.com/{stem}">'
        '<link rel="alternate" hreflang="en" href="https://brasse-bouillon.com/{stem}-en">'
        '<link rel="alternate" hreflang="x-default" href="https://brasse-bouillon.com/{stem}">'
        "{breadcrumb}"
        f"</head><body>{widget_tag}</body></html>"
    )
    legal_pages = [
        ("legal.html", "fr", "legal", "legal"),
        ("legal-en.html", "en", "legal-en", "legal"),
        ("privacy.html", "fr", "privacy", "privacy"),
        ("privacy-en.html", "en", "privacy-en", "privacy"),
        ("cookies.html", "fr", "cookies", "cookies"),
        ("cookies-en.html", "en", "cookies-en", "cookies"),
        ("terms.html", "fr", "terms", "terms"),
        ("terms-en.html", "en", "terms-en", "terms"),
    ]
    for rel_path, lang, title, stem in legal_pages:
        _write_file(
            base,
            rel_path,
            legal_html_template.format(
                lang=lang,
                title=title,
                description=_serp_description(title),
                stem=stem,
                breadcrumb=_breadcrumb_script(rel_path),
            ),
        )

    _write_file(
        base,
        "index.html",
        """<!DOCTYPE html>
<html lang="fr">
<head>
  <title>FR</title>
  <meta name="description" content="FR_DESCRIPTION">
  <meta property="og:title" content="FR">
  <meta name="twitter:title" content="FR">
  <link rel="canonical" href="https://brasse-bouillon.com/">
  <link rel="alternate" hreflang="fr" href="https://brasse-bouillon.com/">
  <link rel="alternate" hreflang="en" href="https://brasse-bouillon.com/en">
  <link rel="alternate" hreflang="x-default" href="https://brasse-bouillon.com/">
  <script type="application/ld+json">{"@type":"Organization"}</script>
</head>
<body>
  <header class="site-header"><div class="header-inner">
    <button class="nav-toggle" id="navToggle" type="button"
      aria-expanded="false" aria-controls="headerNav" aria-label="Ouvrir le menu">
      <span class="nav-toggle__bars"></span>
    </button>
    <nav class="header-nav" id="headerNav"><a href="#features">L'app</a></nav>
  </div></header>
  <main id="mainContentFr"></main>
  <script type="module" src="feedback-widget.js"></script>
  <script type="module" src="chat-widget.js"></script>
</body>
</html>
""".replace("FR_DESCRIPTION", _serp_description("FR")),
    )

    _write_file(
        base,
        "en.html",
        """<!DOCTYPE html>
<html lang="en">
<head>
  <title>EN</title>
  <meta name="description" content="EN_DESCRIPTION">
  <meta property="og:title" content="EN">
  <meta name="twitter:title" content="EN">
  <link rel="canonical" href="https://brasse-bouillon.com/en">
  <link rel="alternate" hreflang="fr" href="https://brasse-bouillon.com/">
  <link rel="alternate" hreflang="en" href="https://brasse-bouillon.com/en">
  <link rel="alternate" hreflang="x-default" href="https://brasse-bouillon.com/">
  <script type="application/ld+json">{"@type":"Organization"}</script>
</head>
<body>
  <main id="mainContentEn"></main>
  <script type="module" src="feedback-widget.js"></script>
  <script type="module" src="chat-widget.js"></script>
</body>
</html>
""".replace("EN_DESCRIPTION", _serp_description("EN")),
    )

    _write_file(base, "_redirects", "/index-en /en 301\n")

    _write_file(
        base,
        "404.html",
        """<!DOCTYPE html>
<html lang="fr">
<head>
  <title>404</title>
  <meta name="robots" content="noindex,follow">
</head>
<body></body>
</html>
""",
    )

    _write_file(
        base,
        "sitemap.xml",
        """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://brasse-bouillon.com/</loc>
  </url>
  <url>
    <loc>https://brasse-bouillon.com/en</loc>
  </url>
  <url>
    <loc>https://brasse-bouillon.com/legal</loc>
  </url>
  <url>
    <loc>https://brasse-bouillon.com/privacy</loc>
  </url>
  <url>
    <loc>https://brasse-bouillon.com/cookies</loc>
  </url>
  <url>
    <loc>https://brasse-bouillon.com/terms</loc>
  </url>
</urlset>
""",
    )

    _write_file(
        base,
        "robots.txt",
        """User-agent: *
Allow: /
Sitemap: https://brasse-bouillon.com/sitemap.xml
""",
    )

    _write_file(base, "llms.txt", "# Brasse-Bouillon\n\n> Test summary.\n")


def _stampable_fixture(base: Path) -> None:
    """Valid fixture + the build_i18n toolchain marker (so `check_legal_freshness`
    actually runs instead of skipping) + freshly stamped EN legal twins."""
    _create_valid_fixture(base)
    _write_file(base, "scripts/build_i18n.py", "# marker\n")
    build_i18n.stamp_legal_pages(base)


class QualityGateTests(unittest.TestCase):
    def test_collect_errors_passes_on_valid_fixture(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            self.assertEqual(quality_gate.collect_errors(root), [])

    def test_legal_freshness_passes_when_stamped(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _stampable_fixture(root)
            self.assertEqual(quality_gate.check_legal_freshness(root), [])

    def test_breadcrumb_schema_accepts_all_secondary_pages(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            self.assertEqual(quality_gate.check_breadcrumb_schema(root), [])

    def test_breadcrumb_schema_accepts_whitespace_in_script_end_tag(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            path = root / "legal.html"
            schema = _breadcrumb_script("legal.html")
            path.write_text(
                path.read_text(encoding="utf-8").replace(
                    schema, schema.replace("</script>", "</script\t\n bar>")
                ),
                encoding="utf-8",
            )

            self.assertEqual(quality_gate.check_breadcrumb_schema(root), [])

    def test_breadcrumb_schema_detects_missing_schema(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            path = root / "legal.html"
            path.write_text(
                path.read_text(encoding="utf-8").replace(
                    _breadcrumb_script("legal.html"), ""
                ),
                encoding="utf-8",
            )

            errors = quality_gate.check_breadcrumb_schema(root)

            self.assertEqual(len(errors), 1)
            self.assertIn("legal.html", errors[0])
            self.assertIn("trouvé: 0", errors[0])

    def test_breadcrumb_schema_detects_malformed_and_wrong_trails(self) -> None:
        variants = {
            "malformed": (
                "privacy.html",
                _breadcrumb_script("privacy.html").replace(
                    '"itemListElement"', '"itemListElement" INVALID', 1
                ),
                "JSON-LD invalide",
            ),
            "wrong URL": (
                "cookies-en.html",
                _breadcrumb_script("cookies-en.html").replace(
                    "https://brasse-bouillon.com/cookies-en",
                    "https://brasse-bouillon.com/cookies",
                    1,
                ),
                "parcours canonique attendu",
            ),
        }
        for label, (rel_path, replacement, expected) in variants.items():
            with self.subTest(label=label), tempfile.TemporaryDirectory() as tmp_dir:
                root = Path(tmp_dir)
                _create_valid_fixture(root)
                path = root / rel_path
                path.write_text(
                    path.read_text(encoding="utf-8").replace(
                        _breadcrumb_script(rel_path), replacement
                    ),
                    encoding="utf-8",
                )

                errors = quality_gate.check_breadcrumb_schema(root)

                self.assertTrue(any(expected in error for error in errors))

    def test_breadcrumb_schema_detects_duplicate_schema(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            path = root / "terms-en.html"
            schema = _breadcrumb_script("terms-en.html")
            path.write_text(
                path.read_text(encoding="utf-8").replace(schema, schema + schema),
                encoding="utf-8",
            )

            errors = quality_gate.check_breadcrumb_schema(root)

            self.assertEqual(len(errors), 1)
            self.assertIn("terms-en.html", errors[0])
            self.assertIn("trouvé: 2", errors[0])

    def test_legal_freshness_detects_stale_stamp(self) -> None:
        # A FR legal edit without re-stamping the EN twin must fail the gate.
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _stampable_fixture(root)
            fr = root / "legal.html"
            fr.write_text(fr.read_text(encoding="utf-8") + "<!-- x -->", "utf-8")

            errors = quality_gate.check_legal_freshness(root)
            self.assertTrue(any("legal-en.html" in e and "périmé" in e for e in errors))

    def test_legal_freshness_detects_missing_stamp(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _stampable_fixture(root)
            en = root / "cookies-en.html"
            en.write_text(
                build_i18n._LEGAL_STAMP_RE.sub("", en.read_text(encoding="utf-8")),
                encoding="utf-8",
            )

            errors = quality_gate.check_legal_freshness(root)
            self.assertTrue(
                any("cookies-en.html" in e and "manquant" in e for e in errors)
            )

    def test_legal_freshness_skipped_without_toolchain(self) -> None:
        # No scripts/build_i18n.py in the tree (unstamped legal pages) -> skip,
        # matching the home i18n check's toolchain gate.
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            self.assertEqual(quality_gate.check_legal_freshness(root), [])

    def test_detects_missing_required_file(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            (root / "terms-en.html").unlink()

            errors = quality_gate.collect_errors(root)
            self.assertIn("Fichier requis manquant: terms-en.html", errors)

    def test_detects_en_page_noindex_reintroduced(self) -> None:
        # S2 flipped the SEO switch: a noindex sneaking back onto an EN page
        # would silently de-index it again — the gate must refuse it.
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            # Two spelling variants: canonical order on en.html, and reversed
            # attribute order + single quotes on legal-en.html — the guard
            # must catch both (Codex review on #1428).
            variants = {
                "en.html": '<meta name="robots" content="noindex,follow">',
                "legal-en.html": "<meta content='noindex,follow' name=robots>",
            }
            for rel_path, meta in variants.items():
                path = root / rel_path
                content = path.read_text(encoding="utf-8")
                path.write_text(
                    content.replace("</title>", "</title>" + meta, 1),
                    encoding="utf-8",
                )

            errors = quality_gate.collect_errors(root)
            self.assertTrue(
                any("noindex interdit dans en.html" in err for err in errors)
            )
            self.assertTrue(
                any("noindex interdit dans legal-en.html" in err for err in errors)
            )

    def test_detects_overlong_homepage_title(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            index_path = root / "index.html"
            content = index_path.read_text(encoding="utf-8")
            overlong_title = "A" * (quality_gate.HOMEPAGE_TITLE_MAX_LENGTH + 1)
            index_path.write_text(
                content.replace(
                    "<title>FR</title>", f"<title>{overlong_title}</title>"
                ).replace('content="FR"', f'content="{overlong_title}"'),
                encoding="utf-8",
            )

            errors = quality_gate.check_serp_metadata(root)
            self.assertEqual(len(errors), 1)
            self.assertIn("index.html", errors[0])
            self.assertIn("61 characters", errors[0])

    def test_detects_obsolete_homepage_metadata(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            index_path = root / "index.html"
            index_content = index_path.read_text(encoding="utf-8")
            index_path.write_text(
                index_content.replace(
                    "</head>",
                    '<meta content="brassage" name=keywords></head>',
                ),
                encoding="utf-8",
            )
            en_path = root / "en.html"
            content = en_path.read_text(encoding="utf-8")
            en_path.write_text(
                content.replace(
                    "</head>",
                    '<meta name="keywords" content="homebrewing">'
                    '<script type="application/ld+json">'
                    '{"@type":"FAQPage"}</script></head>',
                ),
                encoding="utf-8",
            )

            errors = quality_gate.check_homepage_seo_metadata(root)
            keyword_errors = [error for error in errors if "meta keywords" in error]
            self.assertEqual(len(keyword_errors), 2)
            self.assertTrue(any("index.html" in error for error in keyword_errors))
            self.assertTrue(any("en.html" in error for error in keyword_errors))
            self.assertTrue(any("FAQPage" in error for error in errors))

    def test_detects_invalid_description_lengths_and_social_title_drift(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            index_path = root / "index.html"
            index_content = index_path.read_text(encoding="utf-8")
            index_path.write_text(
                index_content.replace(
                    _serp_description("FR"),
                    "S" * (quality_gate.META_DESCRIPTION_MIN_LENGTH - 1),
                    1,
                ).replace(
                    '<meta property="og:title" content="FR">',
                    '<meta property="og:title" content="Different">',
                    1,
                ),
                encoding="utf-8",
            )
            en_path = root / "en.html"
            en_content = en_path.read_text(encoding="utf-8")
            en_path.write_text(
                en_content.replace(
                    _serp_description("EN"),
                    "L" * (quality_gate.META_DESCRIPTION_MAX_LENGTH + 1),
                    1,
                ),
                encoding="utf-8",
            )

            errors = quality_gate.check_serp_metadata(root)

            self.assertTrue(
                any(
                    "index.html: meta description is 119 characters" in error
                    for error in errors
                )
            )
            self.assertTrue(
                any(
                    "en.html: meta description is 156 characters" in error
                    for error in errors
                )
            )
            self.assertIn(
                "index.html: Open Graph title must match the SEO title", errors
            )

    def test_reports_missing_social_titles_and_normalizes_present_values(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            index_path = root / "index.html"
            index_content = index_path.read_text(encoding="utf-8")
            index_path.write_text(
                index_content.replace(
                    '<meta property="og:title" content="FR">', ""
                ).replace(
                    '<meta name="twitter:title" content="FR">',
                    '<meta name="twitter:title" content="  FR  ">',
                ),
                encoding="utf-8",
            )
            en_path = root / "en.html"
            en_content = en_path.read_text(encoding="utf-8")
            en_path.write_text(
                en_content.replace(
                    '<meta name="twitter:title" content="EN">', ""
                ).replace(
                    '<meta property="og:title" content="EN">',
                    '<meta property="og:title" content="  EN  ">',
                ),
                encoding="utf-8",
            )

            errors = quality_gate.check_serp_metadata(root)

            self.assertIn("index.html: Open Graph title is missing", errors)
            self.assertIn("en.html: Twitter title is missing", errors)
            self.assertEqual(len(errors), 2)

    def test_detects_duplicate_serp_titles_and_descriptions(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            terms_en_path = root / "terms-en.html"
            content = terms_en_path.read_text(encoding="utf-8")
            terms_en_path.write_text(
                content.replace(
                    _serp_description("terms-en"), _serp_description("legal")
                ).replace("terms-en", "terms"),
                encoding="utf-8",
            )

            errors = quality_gate.check_serp_metadata(root)

            self.assertIn("duplicate SEO title: terms.html, terms-en.html", errors)
            self.assertIn(
                "duplicate meta description: legal.html, terms-en.html", errors
            )

    def test_hreflang_reciprocity_detects_missing_return_link(self) -> None:
        # Sad path: the FR home loses its `en` alternate. Validation is
        # per-file against the pair's expected cluster, so only the page whose
        # own declaration is now incomplete (index.html) is flagged — en.html
        # still carries a complete cluster of its own and stays green.
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            index_path = root / "index.html"
            content = index_path.read_text(encoding="utf-8")
            index_path.write_text(
                content.replace(
                    '  <link rel="alternate" hreflang="en" '
                    'href="https://brasse-bouillon.com/en">\n',
                    "",
                    1,
                ),
                encoding="utf-8",
            )

            errors = quality_gate.check_hreflang_reciprocity(root)
            self.assertTrue(any("index.html" in err for err in errors))
            self.assertEqual(len(errors), 1)

    def test_hreflang_reciprocity_detects_duplicate_declaration(self) -> None:
        # Edge: two hreflang="fr" links (one wrong, one right) — a plain dict()
        # would keep only the last and let the malformed cluster pass.
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            index_path = root / "index.html"
            content = index_path.read_text(encoding="utf-8")
            index_path.write_text(
                content.replace(
                    '<link rel="alternate" hreflang="fr" '
                    'href="https://brasse-bouillon.com/">',
                    '<link rel="alternate" hreflang="fr" '
                    'href="https://brasse-bouillon.com/wrong">\n'
                    '  <link rel="alternate" hreflang="fr" '
                    'href="https://brasse-bouillon.com/">',
                    1,
                ),
                encoding="utf-8",
            )

            errors = quality_gate.check_hreflang_reciprocity(root)
            self.assertTrue(
                any("dupliquée" in err and "index.html" in err for err in errors)
            )

    def test_hreflang_reciprocity_detects_missing_x_default(self) -> None:
        # Edge: a legal pair without x-default is an incomplete cluster.
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            legal_path = root / "legal-en.html"
            content = legal_path.read_text(encoding="utf-8")
            legal_path.write_text(
                content.replace(
                    '<link rel="alternate" hreflang="x-default" '
                    'href="https://brasse-bouillon.com/legal">',
                    "",
                    1,
                ),
                encoding="utf-8",
            )

            errors = quality_gate.check_hreflang_reciprocity(root)
            self.assertTrue(any("legal-en.html" in err for err in errors))

    def test_detects_404_missing_noindex(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            not_found_path = root / "404.html"
            not_found_path.write_text(
                not_found_path.read_text(encoding="utf-8").replace(
                    '<meta name="robots" content="noindex,follow">',
                    "",
                ),
                encoding="utf-8",
            )

            errors = quality_gate.collect_errors(root)
            self.assertTrue(
                any(
                    "meta robots noindex manquant dans 404.html" in err
                    for err in errors
                )
            )

    def test_detects_external_google_fonts(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            legal_path = root / "legal.html"
            legal_path.write_text(
                legal_path.read_text(encoding="utf-8").replace(
                    "</head>",
                    '<link rel="stylesheet" '
                    'href="https://fonts.googleapis.com/css2?family=Inter"></head>',
                ),
                encoding="utf-8",
            )

            errors = quality_gate.collect_errors(root)
            self.assertTrue(any("Google Fonts" in err for err in errors))

    def test_detects_external_google_fonts_in_css(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            fonts_css = root / "fonts.css"
            fonts_css.write_text(
                "@import url('https://fonts.googleapis.com/css2?family=Inter');\n",
                encoding="utf-8",
            )

            errors = quality_gate.collect_errors(root)
            self.assertTrue(any("Google Fonts" in err for err in errors))

    def test_detects_stale_github_pages_host(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            legal_path = root / "legal.html"
            legal_path.write_text(
                legal_path.read_text(encoding="utf-8").replace(
                    "</body>",
                    "<p>Le site est hébergé par GitHub Pages.</p></body>",
                ),
                encoding="utf-8",
            )

            errors = quality_gate.collect_errors(root)
            self.assertTrue(any("GitHub Pages" in err for err in errors))

    def test_detects_canonical_pointing_to_html(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            legal_path = root / "legal.html"
            legal_path.write_text(
                legal_path.read_text(encoding="utf-8").replace(
                    "</head>",
                    '<link rel="canonical" '
                    'href="https://brasse-bouillon.com/legal.html"></head>',
                ),
                encoding="utf-8",
            )

            errors = quality_gate.collect_errors(root)
            self.assertTrue(
                any(
                    "canonical/hreflang pointe vers une URL .html" in err
                    for err in errors
                )
            )

    def test_detects_hreflang_pointing_to_html(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            legal_path = root / "legal.html"
            legal_path.write_text(
                legal_path.read_text(encoding="utf-8").replace(
                    "</head>",
                    '<link rel="alternate" hreflang="en" '
                    'href="https://brasse-bouillon.com/legal-en.html"></head>',
                ),
                encoding="utf-8",
            )

            errors = quality_gate.collect_errors(root)
            self.assertTrue(
                any(
                    "canonical/hreflang pointe vers une URL .html" in err
                    for err in errors
                )
            )

    def test_detects_canonical_html_href_before_rel(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            legal_path = root / "legal.html"
            legal_path.write_text(
                legal_path.read_text(encoding="utf-8").replace(
                    "</head>",
                    '<link href="https://brasse-bouillon.com/legal.html" '
                    'rel="canonical"></head>',
                ),
                encoding="utf-8",
            )

            errors = quality_gate.collect_errors(root)
            self.assertTrue(
                any(
                    "canonical/hreflang pointe vers une URL .html" in err
                    for err in errors
                )
            )

    def test_detects_disallowed_software_application_schema(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            fr_path = root / "index.html"
            fr_content = fr_path.read_text(encoding="utf-8")
            fr_path.write_text(
                fr_content.replace(
                    '"@type":"Organization"',
                    '"@type":"SoftwareApplication"',
                ),
                encoding="utf-8",
            )

            errors = quality_gate.collect_errors(root)
            expected = "SoftwareApplication non autorisé"
            self.assertTrue(any(expected in err for err in errors))

    def test_detects_disallowed_kofi_embed(self) -> None:
        kofi_script = (
            '<script src="https://storage.ko-fi.com/cdn/scripts/'
            'overlay-widget.js"></script>'
        )
        for page in ("index.html", "en.html"):
            with tempfile.TemporaryDirectory() as tmp_dir:
                root = Path(tmp_dir)
                _create_valid_fixture(root)
                page_path = root / page
                page_content = page_path.read_text(encoding="utf-8")
                page_path.write_text(
                    page_content + "\n" + kofi_script + "\n",
                    encoding="utf-8",
                )

                errors = quality_gate.collect_errors(root)
                expected = f"Ko-fi non autorisé dans {page}"
                self.assertTrue(any(expected in err for err in errors))

    def test_detects_missing_feedback_widget(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            cookies_path = root / "cookies.html"
            cookies_path.write_text(
                cookies_path.read_text(encoding="utf-8").replace(
                    '<script type="module" src="feedback-widget.js"></script>',
                    "",
                ),
                encoding="utf-8",
            )

            errors = quality_gate.collect_errors(root)
            self.assertTrue(any("widget de feedback" in err for err in errors))

    def test_detects_missing_chat_widget(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            en_path = root / "en.html"
            en_path.write_text(
                en_path.read_text(encoding="utf-8").replace(
                    '<script type="module" src="chat-widget.js"></script>',
                    "",
                ),
                encoding="utf-8",
            )

            errors = quality_gate.collect_errors(root)
            self.assertTrue(any("widget de chat FAQ" in err for err in errors))

    def test_detects_missing_burger_toggle(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            fr_path = root / "index.html"
            fr_content = fr_path.read_text(encoding="utf-8")
            # Drop the burger button — header nav becomes inaccessible on mobile.
            fr_path.write_text(
                fr_content.replace('class="nav-toggle"', 'class="removed"'),
                encoding="utf-8",
            )

            errors = quality_gate.collect_errors(root)
            self.assertTrue(
                any("bouton burger .nav-toggle manquant" in err for err in errors)
            )

    def test_detects_sitemap_disallowed_url(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            sitemap_path = root / "sitemap.xml"
            # A noindex EN page and a `.html` form must never be listed.
            sitemap_path.write_text(
                """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://brasse-bouillon.com/</loc></url>
  <url><loc>https://brasse-bouillon.com/legal</loc></url>
  <url><loc>https://brasse-bouillon.com/privacy</loc></url>
  <url><loc>https://brasse-bouillon.com/cookies</loc></url>
  <url><loc>https://brasse-bouillon.com/terms</loc></url>
  <url><loc>https://brasse-bouillon.com/legal-en</loc></url>
  <url><loc>https://brasse-bouillon.com/legal.html</loc></url>
</urlset>
""",
                encoding="utf-8",
            )

            errors = quality_gate.check_sitemap_policy(root)
            forbidden = [err for err in errors if "interdites" in err]
            self.assertTrue(any("legal-en" in err for err in forbidden))
            self.assertTrue(any("legal.html" in err for err in forbidden))

    def test_sitemap_allows_home_and_fr_legal_pages(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            sitemap_path = root / "sitemap.xml"
            sitemap_path.write_text(
                """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://brasse-bouillon.com/</loc></url>
  <url><loc>https://brasse-bouillon.com/en</loc></url>
  <url><loc>https://brasse-bouillon.com/legal</loc></url>
  <url><loc>https://brasse-bouillon.com/privacy</loc></url>
  <url><loc>https://brasse-bouillon.com/cookies</loc></url>
  <url><loc>https://brasse-bouillon.com/terms</loc></url>
</urlset>
""",
                encoding="utf-8",
            )

            errors = quality_gate.check_sitemap_policy(root)
            self.assertEqual(errors, [])

    def test_detects_handwritten_sitemap_lastmod(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            sitemap_path = root / "sitemap.xml"
            content = sitemap_path.read_text(encoding="utf-8")
            sitemap_path.write_text(
                content.replace(
                    "<loc>https://brasse-bouillon.com/</loc>",
                    "<loc>https://brasse-bouillon.com/</loc>"
                    "<lastmod>2026-07-24</lastmod>",
                    1,
                ),
                encoding="utf-8",
            )

            errors = quality_gate.check_sitemap_policy(root)

            self.assertEqual(len(errors), 1)
            self.assertIn("lastmod doit être généré au déploiement", errors[0])

    def test_detects_sitemap_missing_home(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            sitemap_path = root / "sitemap.xml"
            # Everything but the home page → the home URL is reported missing.
            sitemap_path.write_text(
                """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://brasse-bouillon.com/legal</loc></url>
  <url><loc>https://brasse-bouillon.com/privacy</loc></url>
  <url><loc>https://brasse-bouillon.com/cookies</loc></url>
  <url><loc>https://brasse-bouillon.com/terms</loc></url>
</urlset>
""",
                encoding="utf-8",
            )

            errors = quality_gate.check_sitemap_policy(root)
            self.assertTrue(
                any("manquantes: https://brasse-bouillon.com/" in err for err in errors)
            )

    def test_detects_sitemap_missing_legal_page(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            sitemap_path = root / "sitemap.xml"
            # /terms omitted → the exact-set policy flags it missing. The former
            # "allowed subset" gate would have wrongly passed this sitemap.
            sitemap_path.write_text(
                """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://brasse-bouillon.com/</loc></url>
  <url><loc>https://brasse-bouillon.com/legal</loc></url>
  <url><loc>https://brasse-bouillon.com/privacy</loc></url>
  <url><loc>https://brasse-bouillon.com/cookies</loc></url>
</urlset>
""",
                encoding="utf-8",
            )

            errors = quality_gate.check_sitemap_policy(root)
            self.assertTrue(
                any("manquantes" in err and "terms" in err for err in errors)
            )

    def test_detects_sitemap_renamed_page(self) -> None:
        # A renamed/typo'd legal page is missing AND forbidden at once — the
        # realistic mistake the exact-set policy exists to catch.
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            sitemap_path = root / "sitemap.xml"
            sitemap_path.write_text(
                """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://brasse-bouillon.com/</loc></url>
  <url><loc>https://brasse-bouillon.com/legal</loc></url>
  <url><loc>https://brasse-bouillon.com/privacy</loc></url>
  <url><loc>https://brasse-bouillon.com/cookies</loc></url>
  <url><loc>https://brasse-bouillon.com/terms-en</loc></url>
</urlset>
""",
                encoding="utf-8",
            )

            errors = quality_gate.check_sitemap_policy(root)
            self.assertTrue(
                any(
                    "manquantes" in err
                    and "https://brasse-bouillon.com/terms" in err
                    and "interdites" in err
                    and "terms-en" in err
                    for err in errors
                )
            )

    def test_detects_sitemap_duplicate_url(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            sitemap_path = root / "sitemap.xml"
            # Full valid set, but /legal is listed twice.
            sitemap_path.write_text(
                """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://brasse-bouillon.com/</loc></url>
  <url><loc>https://brasse-bouillon.com/legal</loc></url>
  <url><loc>https://brasse-bouillon.com/legal</loc></url>
  <url><loc>https://brasse-bouillon.com/privacy</loc></url>
  <url><loc>https://brasse-bouillon.com/cookies</loc></url>
  <url><loc>https://brasse-bouillon.com/terms</loc></url>
</urlset>
""",
                encoding="utf-8",
            )

            errors = quality_gate.check_sitemap_policy(root)
            self.assertTrue(
                any("dupliquées" in err and "legal" in err for err in errors)
            )

    def test_detects_missing_robots_directive(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            robots_path = root / "robots.txt"
            robots_path.write_text(
                """User-agent: *
Sitemap: https://brasse-bouillon.com/sitemap.xml
""",
                encoding="utf-8",
            )

            errors = quality_gate.collect_errors(root)
            self.assertTrue(
                any("directive requise manquante: Allow: /" in err for err in errors)
            )

    def test_detects_disallowed_aggregate_rating_fields(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            fr_path = root / "index.html"
            fr_content = fr_path.read_text(encoding="utf-8")
            fr_path.write_text(
                fr_content.replace(
                    '{"@type":"Organization"}',
                    '{"@type":"Organization","aggregateRating":'
                    '{"ratingValue":"5","ratingCount":"12"}}',
                ),
                encoding="utf-8",
            )

            errors = quality_gate.collect_errors(root)
            self.assertTrue(
                any("aggregateRating non autorisé" in err for err in errors)
            )
            self.assertTrue(any("ratingValue non autorisé" in err for err in errors))
            self.assertTrue(any("ratingCount non autorisé" in err for err in errors))

    def test_detects_wrong_og_image_dimensions(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            _write_og_image(root, width=600, height=600)

            errors = quality_gate.collect_errors(root)
            self.assertTrue(
                any("og-image.png: dimensions 600×600" in err for err in errors)
            )

    def test_detects_non_png_og_image(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            (root / "og-image.png").write_bytes(b"not a png at all, just junk bytes")

            errors = quality_gate.collect_errors(root)
            self.assertTrue(
                any("og-image.png: en-tête PNG invalide" in err for err in errors)
            )


class I18nGateTests(unittest.TestCase):
    """Cover check_i18n_home_generated at the gate layer (the generator internals
    are covered separately in test_build_i18n)."""

    @staticmethod
    def _build_tree(root: Path, source: str, catalog: dict) -> None:
        # The guard only checks that scripts/build_i18n.py exists; generation
        # itself uses the imported real module against files under `root`.
        _write_file(root, "scripts/build_i18n.py", "# marker\n")
        _write_file(root, "index.html", source)
        _write_file(root, "i18n/home.en.json", json.dumps(catalog))
        _write_file(root, "en.html", build_i18n.generate(source, catalog))

    def test_passes_when_en_html_in_sync(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            source = '<p data-i18n="k">Bonjour</p>\n'
            catalog = {
                "strings": {"k": {"en": "Hi", "srcHash": build_i18n.sha1("Bonjour")}}
            }
            self._build_tree(root, source, catalog)
            self.assertEqual(quality_gate.check_i18n_home_generated(root), [])

    def test_fails_on_src_hash_drift(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            source = '<p data-i18n="k">Bonjour</p>\n'
            catalog = {
                "strings": {"k": {"en": "Hi", "srcHash": build_i18n.sha1("Bonjour")}}
            }
            self._build_tree(root, source, catalog)
            # FR source changes without its EN translation/hash being updated.
            _write_file(root, "index.html", '<p data-i18n="k">Salut</p>\n')
            errors = quality_gate.check_i18n_home_generated(root)
            self.assertTrue(any("i18n" in err for err in errors))

    def test_fails_when_en_html_stale(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            source = '<p data-i18n="k">Bonjour</p>\n'
            catalog = {
                "strings": {"k": {"en": "Hi", "srcHash": build_i18n.sha1("Bonjour")}}
            }
            self._build_tree(root, source, catalog)
            _write_file(root, "en.html", "<p>stale hand edit</p>\n")
            errors = quality_gate.check_i18n_home_generated(root)
            self.assertTrue(any("périmé" in err for err in errors))

    def test_skips_without_i18n_toolchain(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            self.assertEqual(quality_gate.check_i18n_home_generated(Path(tmp_dir)), [])


if __name__ == "__main__":
    unittest.main()
