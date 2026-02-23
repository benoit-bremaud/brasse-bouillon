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
  <main id="mainContentFr"></main>
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
</body>
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
            (root / "robots.txt").unlink()

            errors = quality_gate.collect_errors(root)
            self.assertIn("Fichier requis manquant: robots.txt", errors)

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
            self.assertTrue(
                any("meta robots noindex,follow" in err for err in errors)
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
            self.assertTrue(
                any(expected in err for err in errors)
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
            self.assertTrue(
                any(expected in err for err in errors)
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
                any(
                    "directive requise manquante: Allow: /" in err
                    for err in errors
                )
            )


if __name__ == "__main__":
    unittest.main()
