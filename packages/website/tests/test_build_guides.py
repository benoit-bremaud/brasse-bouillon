from __future__ import annotations

from copy import deepcopy
from pathlib import Path
import tempfile
import unittest

from scripts import build_guides, quality_gate


def _article() -> dict[str, object]:
    return {
        "slug": "houblons",
        "metadata": {
            "title": "IBU et houblon : comprendre l'amertume d'une bière",
            "summary": (
                "Comprendre ce que mesure l'IBU, pourquoi l'amertume perçue "
                "varie et comment le moment des ajouts transforme une bière."
            ),
            "status": "published",
            "updatedAt": "2026-07-27",
            "estimatedReadTimeMinutes": 11,
            "learningObjectives": ["Comprendre les IBU."],
            "sources": [
                {
                    "title": "How to Brew",
                    "authors": ["John J. Palmer"],
                    "year": 2017,
                    "url": "https://www.howtobrew.com/",
                }
            ],
            "review": {"confidenceLevel": "validated"},
            "webPublication": {
                "status": "published",
                "slug": "ibu-biere-amertume-houblon",
            },
        },
        "body": {
            "sections": [
                {
                    "id": "comprendre-ibu",
                    "title": "Comprendre les IBU",
                    "blocks": [
                        {
                            "id": "intro",
                            "type": "paragraph",
                            "text": "Une valeur <script>alert('x')</script>.",
                            "sourceIds": [],
                        },
                        {
                            "id": "definition",
                            "type": "definition",
                            "term": "IBU",
                            "definition": "Une unité d'amertume.",
                            "sourceIds": ["palmer-2017"],
                        },
                        {
                            "id": "example",
                            "type": "example",
                            "title": "Exemple",
                            "body": "Deux bières peuvent sembler différentes.",
                            "sourceIds": ["palmer-2017"],
                        },
                        {
                            "id": "glossary",
                            "type": "glossaryReference",
                            "termSlug": "ibu",
                            "label": "IBU",
                            "sourceIds": [],
                        },
                        {
                            "id": "calculator",
                            "type": "calculatorCta",
                            "calculatorSlug": "houblons",
                            "title": "Préparer une cible",
                            "description": "Comparer plusieurs scénarios.",
                            "sourceIds": [],
                        },
                        {
                            "id": "related",
                            "type": "relatedArticle",
                            "articleSlug": "not-public",
                            "sectionId": None,
                            "sourceIds": [],
                        },
                    ],
                }
            ]
        },
    }


def _corpus(article: dict[str, object] | None = None) -> dict[str, object]:
    return {"articles": [article or _article()]}


class BuildGuidesTests(unittest.TestCase):
    def test_generates_hub_and_article_for_eligible_content(self) -> None:
        files = build_guides.expected_files(_corpus())

        self.assertEqual(
            set(files),
            {
                Path("index.html"),
                Path("ibu-biere-amertume-houblon/index.html"),
            },
        )
        article_html = files[Path("ibu-biere-amertume-houblon/index.html")]
        hub_html = files[Path("index.html")]
        self.assertIn("&lt;script&gt;alert(&#x27;x&#x27;)&lt;/script&gt;", article_html)
        self.assertNotIn("<script>alert('x')</script>", article_html)
        self.assertIn('<meta property="og:type" content="website">', hub_html)
        self.assertIn('<meta property="og:type" content="article">', article_html)
        self.assertIn('"@type":"CollectionPage"', hub_html)
        self.assertIn('"@type":"Article"', article_html)
        self.assertIn('"@type":"BreadcrumbList"', article_html)
        self.assertIn('<div class="bubbles" aria-hidden="true"></div>', hub_html)
        self.assertIn('<script src="/site.js?v=20260727"></script>', hub_html)
        self.assertIn('<div class="bubbles" aria-hidden="true"></div>', article_html)
        self.assertIn('<script src="/site.js?v=20260727"></script>', article_html)
        self.assertIn(
            '<a href="/guides/" aria-current="page">Guides</a>',
            hub_html,
        )
        self.assertIn('<a href="/guides/">Guides</a>', article_html)
        self.assertNotIn(
            '<a href="/guides/" aria-current="page">Guides</a>',
            article_html,
        )
        self.assertNotIn("not-public", article_html)
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            build_guides.write_generated_files(root / "guides", files)
            self.assertEqual(quality_gate.check_html_files(root), [])
            self.assertEqual(quality_gate.check_breadcrumb_schema(root), [])
            self.assertEqual(quality_gate.check_guide_structured_data(root), [])

    def test_generates_multiple_public_guides_with_internal_links(self) -> None:
        first_brew = deepcopy(_article())
        first_brew["slug"] = "introduction"
        metadata = first_brew["metadata"]
        metadata["webPublication"] = {
            "status": "published",
            "slug": "premier-brassin",
        }
        related_block = first_brew["body"]["sections"][0]["blocks"][-1]
        related_block["articleSlug"] = "houblons"
        related_block["sectionId"] = "comprendre-ibu"
        files = build_guides.expected_files({"articles": [_article(), first_brew]})

        self.assertEqual(
            set(files),
            {
                Path("index.html"),
                Path("ibu-biere-amertume-houblon/index.html"),
                Path("premier-brassin/index.html"),
            },
        )
        hub_html = files[Path("index.html")]
        first_brew_html = files[Path("premier-brassin/index.html")]
        self.assertIn("/guides/premier-brassin/", hub_html)
        self.assertIn("/guides/ibu-biere-amertume-houblon/", first_brew_html)

    def test_published_fermentation_guide_preserves_safety_signals(self) -> None:
        files = build_guides.expected_files(
            build_guides.load_corpus(build_guides.CORPUS_PATH)
        )

        fermentation_html = files[
            Path("fermentation-biere-duree-temperature/index.html")
        ]
        first_brew_html = files[Path("premier-brassin/index.html")]
        self.assertIn("Fermentation bière maison", fermentation_html)
        self.assertIn("Une absence de bulles ne prouve pas", fermentation_html)
        self.assertIn(
            "deux mesures identiques espacées d&#x27;environ 24 heures",
            fermentation_html,
        )
        self.assertIn(
            "N&#x27;embouteille pas parce que le barboteur", fermentation_html
        )
        self.assertIn('"@type":"Article"', fermentation_html)
        self.assertIn('"@type":"BreadcrumbList"', fermentation_html)
        self.assertIn("/guides/premier-brassin/", fermentation_html)
        self.assertIn("/guides/fermentation-biere-duree-temperature/", first_brew_html)

    def test_excludes_content_still_in_web_review(self) -> None:
        article = _article()
        metadata = article["metadata"]
        self.assertIsInstance(metadata, dict)
        metadata["webPublication"]["status"] = "review"

        self.assertEqual(build_guides.expected_files(_corpus(article)), {})

    def test_rejects_public_content_without_validated_review(self) -> None:
        article = _article()
        metadata = article["metadata"]
        self.assertIsInstance(metadata, dict)
        metadata["review"]["confidenceLevel"] = "reviewed"

        with self.assertRaisesRegex(
            build_guides.GuideBuildError, "validated review confidence"
        ):
            build_guides.expected_files(_corpus(article))

    def test_rejects_duplicate_public_slugs(self) -> None:
        duplicate = deepcopy(_article())
        duplicate["slug"] = "duplicate"

        with self.assertRaisesRegex(build_guides.GuideBuildError, "duplicate"):
            build_guides.expected_files({"articles": [_article(), duplicate]})

    def test_rejects_unsupported_public_block(self) -> None:
        article = _article()
        article["body"]["sections"][0]["blocks"] = [
            {"id": "unsafe", "type": "diagram", "sourceIds": []}
        ]

        with self.assertRaisesRegex(build_guides.GuideBuildError, "diagram"):
            build_guides.expected_files(_corpus(article))

    def test_write_and_check_detect_missing_stale_and_obsolete_files(self) -> None:
        files = build_guides.expected_files(_corpus())
        with tempfile.TemporaryDirectory() as tmp_dir:
            output = Path(tmp_dir) / "guides"

            self.assertTrue(build_guides.check_generated_files(output, files))
            build_guides.write_generated_files(output, files)
            self.assertEqual(build_guides.check_generated_files(output, files), [])

            article_path = output / "ibu-biere-amertume-houblon/index.html"
            article_path.write_text("stale", encoding="utf-8")
            errors = build_guides.check_generated_files(output, files)
            self.assertTrue(any("stale generated guide" in error for error in errors))

            article_path.write_text(
                files[Path("ibu-biere-amertume-houblon/index.html")],
                encoding="utf-8",
            )
            obsolete = output / "old-guide/index.html"
            obsolete.parent.mkdir(parents=True)
            obsolete.write_text(
                f"{build_guides.GENERATED_MARKER}\n",
                encoding="utf-8",
            )
            errors = build_guides.check_generated_files(output, files)
            self.assertTrue(
                any("obsolete generated guide" in error for error in errors)
            )


if __name__ == "__main__":
    unittest.main()
