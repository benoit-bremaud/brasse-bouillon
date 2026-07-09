from __future__ import annotations

from pathlib import Path
import tempfile
import unittest

from scripts import quality_gate


def _write_file(base: Path, rel_path: str, content: str) -> None:
    target = base / rel_path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")


def _create_valid_fixture(base: Path) -> None:
    _write_file(base, "README.md", "# readme\n")
    _write_file(base, "CONTRIBUTING.md", "# contributing\n")
    _write_file(base, "favicon.ico", "ico")
    _write_file(base, "feedback-widget.js", "// feedback widget loader\n")
    _write_file(base, "chat-widget.js", "// chat widget loader\n")
    widget_tag = '<script type="module" src="feedback-widget.js"></script>'
    legal_html_template = (
        '<!DOCTYPE html><html lang="{lang}"><head>'
        f"<title>{{title}}</title></head><body>{widget_tag}</body></html>"
    )
    legal_pages = [
        ("legal.html", "fr", "legal"),
        ("legal-en.html", "en", "legal-en"),
        ("privacy.html", "fr", "privacy"),
        ("privacy-en.html", "en", "privacy-en"),
        ("cookies.html", "fr", "cookies"),
        ("cookies-en.html", "en", "cookies-en"),
        ("terms.html", "fr", "terms"),
        ("terms-en.html", "en", "terms-en"),
    ]
    for rel_path, lang, title in legal_pages:
        _write_file(
            base,
            rel_path,
            legal_html_template.format(lang=lang, title=title),
        )

    _write_file(
        base,
        "index.html",
        """<!DOCTYPE html>
<html lang="fr">
<head>
  <title>FR</title>
  <link rel="canonical" href="https://brasse-bouillon.com/">
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
""",
    )

    _write_file(
        base,
        "index-en.html",
        """<!DOCTYPE html>
<html lang="en">
<head>
  <title>EN</title>
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="https://brasse-bouillon.com/">
  <script type="application/ld+json">{"@type":"Organization"}</script>
</head>
<body>
  <main id="mainContentEn"></main>
  <script type="module" src="feedback-widget.js"></script>
  <script type="module" src="chat-widget.js"></script>
</body>
</html>
""",
    )

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


class QualityGateTests(unittest.TestCase):
    def test_collect_errors_passes_on_valid_fixture(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            self.assertEqual(quality_gate.collect_errors(root), [])

    def test_detects_missing_required_file(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            (root / "terms-en.html").unlink()

            errors = quality_gate.collect_errors(root)
            self.assertIn("Fichier requis manquant: terms-en.html", errors)

    def test_detects_en_page_missing_noindex(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            en_path = root / "index-en.html"
            en_content = en_path.read_text(encoding="utf-8")
            en_path.write_text(
                en_content.replace(
                    '<meta name="robots" content="noindex,follow">',
                    '<meta name="robots" content="index,follow">',
                ),
                encoding="utf-8",
            )

            errors = quality_gate.collect_errors(root)
            self.assertTrue(any("meta robots noindex,follow" in err for err in errors))

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
            en_path = root / "index-en.html"
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

    def test_detects_sitemap_not_fr_only(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            _create_valid_fixture(root)
            sitemap_path = root / "sitemap.xml"
            sitemap_path.write_text(
                """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://brasse-bouillon.com/</loc></url>
  <url><loc>https://brasse-bouillon.com/index-en.html</loc></url>
</urlset>
""",
                encoding="utf-8",
            )

            errors = quality_gate.collect_errors(root)
            expected = "sitemap.xml: doit contenir uniquement"
            self.assertTrue(any(expected in err for err in errors))

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


if __name__ == "__main__":
    unittest.main()
