from __future__ import annotations

from pathlib import Path
from subprocess import CompletedProcess
import tempfile
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET

from scripts import build_sitemap


def _template(urls: list[str] | None = None) -> str:
    sitemap_urls = urls or list(build_sitemap.URL_SOURCE_PATHS)
    entries = "\n".join(
        "  <url>\n"
        f"    <loc>{url}</loc>\n"
        "    <changefreq>monthly</changefreq>\n"
        "    <priority>0.5</priority>\n"
        "  </url>"
        for url in sitemap_urls
    )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<urlset xmlns="{build_sitemap.SITEMAP_NAMESPACE}">\n'
        f"{entries}\n"
        "</urlset>\n"
    )


class BuildSitemapTests(unittest.TestCase):
    def test_injects_page_dates_and_preserves_other_metadata(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            template_path = root / "sitemap.xml"
            output_path = root / "_site" / "sitemap.xml"
            template_path.write_text(_template(), encoding="utf-8")
            source_dates = {
                source_path: f"2026-07-{index:02d}"
                for index, source_path in enumerate(
                    build_sitemap.URL_SOURCE_PATHS.values(), start=1
                )
            }

            build_sitemap.build_sitemap(
                template_path,
                output_path,
                source_dates.__getitem__,
            )

            xml_root = ET.parse(output_path).getroot()
            generated = {
                (element.findtext("{*}loc") or ""): (
                    element.findtext("{*}lastmod"),
                    element.findtext("{*}changefreq"),
                    element.findtext("{*}priority"),
                )
                for element in xml_root.findall("{*}url")
            }
            expected = {
                url: (source_dates[source_path], "monthly", "0.5")
                for url, source_path in build_sitemap.URL_SOURCE_PATHS.items()
            }
            self.assertEqual(generated, expected)

    def test_rejects_missing_unexpected_and_duplicate_urls(self) -> None:
        valid_urls = list(build_sitemap.URL_SOURCE_PATHS)
        variants = {
            "missing": valid_urls[:-1],
            "unexpected": [*valid_urls[:-1], "https://brasse-bouillon.com/unknown"],
            "duplicate": [*valid_urls, valid_urls[0]],
        }
        for label, urls in variants.items():
            with self.subTest(label=label), tempfile.TemporaryDirectory() as tmp_dir:
                root = Path(tmp_dir)
                template_path = root / "sitemap.xml"
                template_path.write_text(_template(urls), encoding="utf-8")

                with self.assertRaises(build_sitemap.SitemapBuildError):
                    build_sitemap.build_sitemap(
                        template_path,
                        root / "output.xml",
                        lambda _source_path: "2026-07-24",
                    )

    @patch("scripts.build_sitemap.subprocess.run")
    def test_git_lastmod_uses_fixed_arguments(self, run_mock) -> None:
        run_mock.return_value = CompletedProcess(
            args=[],
            returncode=0,
            stdout="2026-07-24\n",
            stderr="",
        )
        repo_root = Path("/repo")
        source_path = Path("packages/website/index.html")

        result = build_sitemap.git_lastmod(repo_root, source_path)

        self.assertEqual(result, "2026-07-24")
        run_mock.assert_called_once_with(
            ["git", "log", "-1", "--format=%cs", "--", source_path.as_posix()],
            cwd=repo_root,
            check=False,
            capture_output=True,
            text=True,
        )

    @patch("scripts.build_sitemap.subprocess.run")
    def test_git_lastmod_rejects_missing_and_invalid_dates(self, run_mock) -> None:
        for value in ("", "24-07-2026", "2026-02-30"):
            with self.subTest(value=value):
                run_mock.return_value = CompletedProcess(
                    args=[],
                    returncode=0,
                    stdout=value,
                    stderr="",
                )
                with self.assertRaises(build_sitemap.SitemapBuildError):
                    build_sitemap.git_lastmod(
                        Path("/repo"), Path("packages/website/index.html")
                    )

    @patch("scripts.build_sitemap.subprocess.run")
    def test_git_lastmod_surfaces_git_failure(self, run_mock) -> None:
        run_mock.return_value = CompletedProcess(
            args=[],
            returncode=128,
            stdout="",
            stderr="fatal: not a git repository",
        )

        with self.assertRaisesRegex(
            build_sitemap.SitemapBuildError, "not a git repository"
        ):
            build_sitemap.git_lastmod(
                Path("/repo"), Path("packages/website/index.html")
            )


if __name__ == "__main__":
    unittest.main()
