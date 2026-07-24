#!/usr/bin/env python3
"""Inject Git-backed lastmod dates into the staged deployment sitemap."""

from __future__ import annotations

from argparse import ArgumentParser
from collections.abc import Callable
from datetime import date
from pathlib import Path
import re
import subprocess
import sys
import xml.etree.ElementTree as ET


WEBSITE_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = WEBSITE_DIR.parent.parent
SITEMAP_TEMPLATE = WEBSITE_DIR / "sitemap.xml"
SITEMAP_NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9"
URL_SOURCE_PATHS = {
    "https://brasse-bouillon.com/": Path("packages/website/index.html"),
    "https://brasse-bouillon.com/en": Path("packages/website/en.html"),
    "https://brasse-bouillon.com/legal": Path("packages/website/legal.html"),
    "https://brasse-bouillon.com/privacy": Path("packages/website/privacy.html"),
    "https://brasse-bouillon.com/cookies": Path("packages/website/cookies.html"),
    "https://brasse-bouillon.com/terms": Path("packages/website/terms.html"),
}

DateProvider = Callable[[Path], str]


class SitemapBuildError(RuntimeError):
    """Raised when the sitemap cannot be generated safely."""


def _validate_lastmod(value: str, source_path: Path) -> str:
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        raise SitemapBuildError(
            f"{source_path}: Git returned invalid lastmod date {value!r}"
        )
    try:
        date.fromisoformat(value)
    except ValueError as error:
        raise SitemapBuildError(
            f"{source_path}: Git returned invalid lastmod date {value!r}"
        ) from error
    return value


def git_lastmod(repo_root: Path, source_path: Path) -> str:
    """Return the latest commit date affecting a source page."""
    result = subprocess.run(
        ["git", "log", "-1", "--format=%cs", "--", source_path.as_posix()],
        cwd=repo_root,
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        detail = result.stderr.strip() or f"git exited with {result.returncode}"
        raise SitemapBuildError(f"{source_path}: cannot read Git history ({detail})")

    value = result.stdout.strip()
    if not value:
        raise SitemapBuildError(
            f"{source_path}: no Git history found; use a full-history checkout"
        )
    return _validate_lastmod(value, source_path)


def build_sitemap(
    template_path: Path,
    output_path: Path,
    date_provider: DateProvider,
) -> None:
    """Generate a sitemap whose lastmod values reflect page-level Git history."""
    try:
        tree = ET.parse(template_path)
    except (OSError, ET.ParseError) as error:
        raise SitemapBuildError(f"cannot parse {template_path}: {error}") from error

    xml_root = tree.getroot()
    url_tag = f"{{{SITEMAP_NAMESPACE}}}url"
    loc_tag = f"{{{SITEMAP_NAMESPACE}}}loc"
    lastmod_tag = f"{{{SITEMAP_NAMESPACE}}}lastmod"
    seen_urls: set[str] = set()

    for url_element in xml_root.findall(url_tag):
        loc_element = url_element.find(loc_tag)
        url = (loc_element.text or "").strip() if loc_element is not None else ""
        if url not in URL_SOURCE_PATHS:
            raise SitemapBuildError(f"unexpected or missing sitemap URL: {url!r}")
        if url in seen_urls:
            raise SitemapBuildError(f"duplicate sitemap URL: {url}")
        seen_urls.add(url)

        lastmod_elements = url_element.findall(lastmod_tag)
        if len(lastmod_elements) > 1:
            raise SitemapBuildError(f"{url}: multiple lastmod elements")
        if lastmod_elements:
            lastmod_element = lastmod_elements[0]
        else:
            lastmod_element = ET.Element(lastmod_tag)
            loc_index = list(url_element).index(loc_element)
            url_element.insert(loc_index + 1, lastmod_element)
        lastmod_element.text = date_provider(URL_SOURCE_PATHS[url])

    missing_urls = URL_SOURCE_PATHS.keys() - seen_urls
    if missing_urls:
        raise SitemapBuildError(
            "missing sitemap URLs: " + ", ".join(sorted(missing_urls))
        )

    ET.register_namespace("", SITEMAP_NAMESPACE)
    ET.indent(tree, space="  ")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    tree.write(output_path, encoding="UTF-8", xml_declaration=True)


def main(argv: list[str] | None = None) -> int:
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--template", type=Path, default=SITEMAP_TEMPLATE)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--repo-root", type=Path, default=REPO_ROOT)
    args = parser.parse_args(argv)

    try:
        build_sitemap(
            args.template,
            args.output,
            lambda source_path: git_lastmod(args.repo_root, source_path),
        )
    except SitemapBuildError as error:
        print(f"build_sitemap: {error}", file=sys.stderr)
        return 1

    print(f"Wrote {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
