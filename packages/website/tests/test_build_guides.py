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


def _glossary_article() -> dict[str, object]:
    return {
        "slug": "glossaire",
        "metadata": {
            "title": "Glossaire du brassage amateur",
            "summary": (
                "Comprenez 22 termes essentiels du brassage amateur : IBU, "
                "malt, moût, fermentation, densité, atténuation, EBC, SRM, "
                "pH et bien plus."
            ),
            "category": "glossary",
            "status": "published",
            "review": {"confidenceLevel": "validated"},
            "webPublication": {
                "status": "published",
                "slug": "glossaire-brassage",
            },
        },
        "body": {"sections": []},
    }


def _glossary_term(
    slug: str, label: str, related_terms: list[str]
) -> dict[str, object]:
    return {
        "slug": slug,
        "label": label,
        "aliases": [f"Alias {label}"],
        "shortDefinition": f"Définition courte de {label}.",
        "detailedDefinition": f"Définition détaillée de {label}.",
        "relatedTerms": related_terms,
        "sources": [
            {
                "title": "How to Brew <script>",
                "url": "https://www.howtobrew.com/",
            }
        ],
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
        self.assertIn('<script src="/site.js?v=20260729"></script>', hub_html)
        self.assertIn('<div class="bubbles" aria-hidden="true"></div>', article_html)
        self.assertIn('<script src="/site.js?v=20260729"></script>', article_html)
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

    def test_generates_public_glossary_and_links_guide_references(self) -> None:
        corpus = {
            "articles": [_article(), _glossary_article()],
            "glossaryTerms": [
                _glossary_term("ibu", "IBU", ["acide-alpha"]),
                _glossary_term("acide-alpha", "Acide alpha", ["ibu"]),
            ],
        }

        files = build_guides.expected_files(corpus)

        glossary_path = Path("glossaire-brassage/index.html")
        self.assertIn(glossary_path, files)
        glossary_html = files[glossary_path]
        guide_html = files[Path("ibu-biere-amertume-houblon/index.html")]
        hub_html = files[Path("index.html")]
        self.assertIn("Glossaire du brassage amateur", glossary_html)
        self.assertIn('<meta property="og:type" content="website">', glossary_html)
        self.assertIn('"@type":"DefinedTermSet"', glossary_html)
        self.assertEqual(glossary_html.count('"@type":"DefinedTerm"'), 2)
        self.assertIn('id="acide-alpha"', glossary_html)
        self.assertIn('id="ibu"', glossary_html)
        self.assertLess(
            glossary_html.index('id="acide-alpha"'),
            glossary_html.index('id="ibu"'),
        )
        self.assertIn("How to Brew &lt;script&gt;", glossary_html)
        self.assertNotIn("How to Brew <script>", glossary_html)
        self.assertIn("/guides/glossaire-brassage/#ibu", guide_html)
        self.assertIn("/guides/glossaire-brassage/", hub_html)

        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            build_guides.write_generated_files(root / "guides", files)
            self.assertEqual(quality_gate.check_html_files(root), [])
            self.assertEqual(quality_gate.check_breadcrumb_schema(root), [])
            self.assertEqual(quality_gate.check_guide_structured_data(root), [])

    def test_rejects_invalid_public_glossary_references(self) -> None:
        glossary = _glossary_article()
        metadata = glossary["metadata"]
        self.assertIsInstance(metadata, dict)
        metadata["review"]["confidenceLevel"] = "reviewed"
        with self.assertRaisesRegex(
            build_guides.GuideBuildError, "validated review confidence"
        ):
            build_guides.expected_files(
                {
                    "articles": [glossary],
                    "glossaryTerms": [_glossary_term("ibu", "IBU", [])],
                }
            )

        metadata["review"]["confidenceLevel"] = "validated"
        with self.assertRaisesRegex(build_guides.GuideBuildError, "unknown term"):
            build_guides.expected_files(
                {
                    "articles": [glossary],
                    "glossaryTerms": [_glossary_term("ibu", "IBU", ["missing-term"])],
                }
            )

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

    def test_published_og_fg_guide_preserves_formulas_and_cluster_links(self) -> None:
        files = build_guides.expected_files(
            build_guides.load_corpus(build_guides.CORPUS_PATH)
        )

        guide_path = Path("og-fg-attenuation-biere/index.html")
        self.assertIn(guide_path, files)
        guide_html = files[guide_path]
        hub_html = files[Path("index.html")]
        fermentation_html = files[
            Path("fermentation-biere-duree-temperature/index.html")
        ]
        first_brew_html = files[Path("premier-brassin/index.html")]

        self.assertIn("OG, FG et atténuation", guide_html)
        self.assertIn("(OG − FG) × 131,25", guide_html)
        self.assertIn("le calcul donne 80 %", guide_html)
        self.assertIn("Une FG stable sur plusieurs mesures", guide_html)
        self.assertIn('"@type":"Article"', guide_html)
        self.assertIn('"@type":"BreadcrumbList"', guide_html)
        self.assertIn("/guides/glossaire-brassage/#densite-initiale", guide_html)
        self.assertIn("/guides/glossaire-brassage/#densite-finale", guide_html)
        self.assertIn("/guides/glossaire-brassage/#attenuation", guide_html)
        self.assertIn("/guides/premier-brassin/", guide_html)
        self.assertIn("/guides/fermentation-biere-duree-temperature/", guide_html)
        self.assertIn("/guides/og-fg-attenuation-biere/", hub_html)
        self.assertIn("/guides/og-fg-attenuation-biere/", fermentation_html)
        self.assertIn("/guides/og-fg-attenuation-biere/", first_brew_html)

    def test_generates_complete_english_guide_with_reciprocal_hreflang(self) -> None:
        corpus = build_guides.load_corpus(build_guides.CORPUS_PATH)
        english_payload = build_guides.load_english_guides(
            build_guides.ENGLISH_GUIDES_PATH
        )

        french_files = build_guides.expected_files(corpus, english_payload)
        english_files = build_guides.expected_english_files(corpus, english_payload)

        english_path = Path("og-fg-attenuation-homebrew/index.html")
        self.assertEqual(
            set(english_files),
            {
                Path("index.html"),
                Path("first-homebrew/index.html"),
                Path("homebrew-fermentation-time-temperature/index.html"),
                Path("homebrewing-glossary/index.html"),
                Path("ibu-hops-bitterness/index.html"),
                english_path,
            },
        )
        english_html = english_files[english_path]
        english_hub_html = english_files[Path("index.html")]
        beginner_html = english_files[Path("first-homebrew/index.html")]
        english_glossary_html = english_files[Path("homebrewing-glossary/index.html")]
        french_html = french_files[Path("og-fg-attenuation-biere/index.html")]
        self.assertIn('<html lang="en"', english_html)
        self.assertIn("Original Gravity, Final Gravity and ABV", english_html)
        self.assertIn("(OG − FG) × 131.25", english_html)
        self.assertIn("reaches 80% apparent attenuation", english_html)
        self.assertIn("alcohol lowers the liquid’s density", english_html)
        self.assertIn("Use a hydrometer and refractometer correctly", english_html)
        self.assertIn('"inLanguage":"en"', english_html)
        self.assertEqual(english_hub_html.count('class="guide-walkthrough__step"'), 12)
        self.assertIn("From Grain to Glass", english_hub_html)
        self.assertIn('id="brewingWalkthroughSteps"', english_hub_html)
        self.assertIn(
            'class="guide-walkthrough__controls" role="group" '
            'aria-label="Walkthrough controls" hidden',
            english_hub_html,
        )
        self.assertIn('data-walkthrough-direction="previous"', english_hub_html)
        self.assertIn('data-walkthrough-direction="next"', english_hub_html)
        self.assertEqual(english_hub_html.count("<details"), 12)
        self.assertTrue(
            all(line == line.rstrip() for line in english_hub_html.splitlines())
        )
        self.assertIn('"@type":"ItemList","numberOfItems":5', english_hub_html)
        self.assertIn('class="guide-procedure"', beginner_html)
        self.assertEqual(beginner_html.count('class="guide-procedure__number"'), 8)
        self.assertEqual(beginner_html.count('"@type":"HowToStep"'), 8)
        self.assertIn('"@type":"HowTo"', beginner_html)
        self.assertIn('"hasPart":{"@id":', beginner_html)
        self.assertEqual(
            beginner_html.count('class="guide-illustration-placeholder"'), 4
        )
        fermentation_html = english_files[
            Path("homebrew-fermentation-time-temperature/index.html")
        ]
        hops_html = english_files[Path("ibu-hops-bitterness/index.html")]
        self.assertIn("at least 48 hours apart", fermentation_html)
        self.assertIn("Normal krausen or warning sign?", fermentation_html)
        self.assertIn("Low-oxygen transfer path", fermentation_html)
        self.assertIn("Bottle-conditioning checklist", fermentation_html)
        self.assertIn("This hop creep can restart fermentation", hops_html)
        site_js = (build_guides.WEBSITE_DIR / "site.js").read_text(encoding="utf-8")
        self.assertIn("function setupGuideWalkthrough()", site_js)
        self.assertIn("event.pointerType !== 'mouse'", site_js)
        self.assertIn("controls.hidden = false", site_js)
        site_css = (build_guides.WEBSITE_DIR / "site.css").read_text(encoding="utf-8")
        self.assertIn("grid-template-rows: auto auto 1fr auto", site_css)
        self.assertIn(
            "min-height: calc(3 * var(--text-lg) * var(--line-height-tight))",
            site_css,
        )
        self.assertIn(".guide-walkthrough__visual-label {", site_css)
        self.assertIn(
            "min-height: calc(2 * var(--text-sm) * var(--line-height-copy))",
            site_css,
        )
        self.assertIn("align-self: end", site_css)
        self.assertIn('"@type":"DefinedTermSet"', english_glossary_html)
        self.assertEqual(english_glossary_html.count('"@type":"DefinedTerm"'), 22)
        self.assertIn(
            '<link rel="alternate" hreflang="fr" '
            'href="https://brasse-bouillon.com/guides/og-fg-attenuation-biere/">',
            english_html,
        )
        self.assertIn(
            '<link rel="alternate" hreflang="en" '
            'href="https://brasse-bouillon.com/en/guides/'
            'og-fg-attenuation-homebrew/">',
            french_html,
        )

        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            build_guides.write_generated_files(root / "guides", french_files)
            build_guides.write_generated_files(root / "en/guides", english_files)
            self.assertEqual(quality_gate.check_html_files(root), [])
            self.assertEqual(quality_gate.check_breadcrumb_schema(root), [])
            self.assertEqual(quality_gate.check_guide_structured_data(root), [])
            self.assertEqual(quality_gate.check_hreflang_reciprocity(root), [])

    def test_quality_gate_rejects_visible_procedure_and_schema_drift(self) -> None:
        corpus = build_guides.load_corpus(build_guides.CORPUS_PATH)
        payload = build_guides.load_english_guides(build_guides.ENGLISH_GUIDES_PATH)
        files = build_guides.expected_english_files(corpus, payload)

        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            build_guides.write_generated_files(root / "en/guides", files)
            beginner_path = root / "en/guides/first-homebrew/index.html"
            beginner_path.write_text(
                beginner_path.read_text(encoding="utf-8").replace(
                    ">Produce the sweet wort</h4>",
                    ">Make the wort</h4>",
                    1,
                ),
                encoding="utf-8",
            )

            errors = quality_gate.check_guide_structured_data(root)
            self.assertTrue(any("schema HowTo incohérent" in error for error in errors))

    def test_quality_gate_rejects_hub_item_list_and_card_drift(self) -> None:
        corpus = build_guides.load_corpus(build_guides.CORPUS_PATH)
        payload = build_guides.load_english_guides(build_guides.ENGLISH_GUIDES_PATH)
        files = build_guides.expected_english_files(corpus, payload)

        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            build_guides.write_generated_files(root / "en/guides", files)
            hub_path = root / "en/guides/index.html"
            hub_path.write_text(
                hub_path.read_text(encoding="utf-8").replace(
                    '"numberOfItems":5',
                    '"numberOfItems":4',
                    1,
                ),
                encoding="utf-8",
            )

            errors = quality_gate.check_guide_structured_data(root)
            self.assertTrue(
                any("schema ItemList incohérent" in error for error in errors)
            )

    def test_rejects_english_guide_without_published_academy_source(self) -> None:
        corpus = build_guides.load_corpus(build_guides.CORPUS_PATH)
        payload = build_guides.load_english_guides(build_guides.ENGLISH_GUIDES_PATH)
        guide = payload["guides"][0]
        self.assertIsInstance(guide, dict)
        guide["academySlug"] = "missing"

        with self.assertRaisesRegex(
            build_guides.GuideBuildError, "unpublished Academy article"
        ):
            build_guides.expected_english_files(corpus, payload)

    def test_supports_future_english_only_guide(self) -> None:
        corpus = build_guides.load_corpus(build_guides.CORPUS_PATH)
        payload = build_guides.load_english_guides(build_guides.ENGLISH_GUIDES_PATH)
        guide = payload["guides"][0]
        self.assertIsInstance(guide, dict)
        del guide["academySlug"]

        files = build_guides.expected_english_files(corpus, payload)
        html = files[Path("first-homebrew/index.html")]

        self.assertNotIn('hreflang="fr"', html)
        self.assertIn(
            '<link rel="alternate" hreflang="x-default" '
            'href="https://brasse-bouillon.com/en/guides/first-homebrew/">',
            html,
        )

    def test_rejects_unsafe_english_guide_slug(self) -> None:
        corpus = build_guides.load_corpus(build_guides.CORPUS_PATH)
        payload = build_guides.load_english_guides(build_guides.ENGLISH_GUIDES_PATH)
        guide = payload["guides"][0]
        self.assertIsInstance(guide, dict)
        guide["slug"] = "../../outside"

        with self.assertRaisesRegex(
            build_guides.GuideBuildError, "lowercase letters, digits, and hyphens"
        ):
            build_guides.expected_english_files(corpus, payload)

    def test_rejects_duplicate_english_procedure_step_id(self) -> None:
        corpus = build_guides.load_corpus(build_guides.CORPUS_PATH)
        payload = build_guides.load_english_guides(build_guides.ENGLISH_GUIDES_PATH)
        procedure = payload["guides"][0]["sections"][1]["blocks"][0]
        procedure["steps"][1]["id"] = procedure["steps"][0]["id"]

        with self.assertRaisesRegex(
            build_guides.GuideBuildError, "duplicate English procedure step id"
        ):
            build_guides.expected_english_files(corpus, payload)

    def test_rejects_external_english_procedure_link(self) -> None:
        corpus = build_guides.load_corpus(build_guides.CORPUS_PATH)
        payload = build_guides.load_english_guides(build_guides.ENGLISH_GUIDES_PATH)
        procedure = payload["guides"][0]["sections"][1]["blocks"][0]
        procedure["steps"][0]["href"] = "https://example.com/unsafe"

        with self.assertRaisesRegex(
            build_guides.GuideBuildError, "local fragment or internal /en/ path"
        ):
            build_guides.expected_english_files(corpus, payload)

    def test_rejects_missing_english_claim_source_ids(self) -> None:
        corpus = build_guides.load_corpus(build_guides.CORPUS_PATH)
        payload = build_guides.load_english_guides(build_guides.ENGLISH_GUIDES_PATH)
        del payload["guides"][0]["sections"][0]["blocks"][0]["sourceIds"]

        with self.assertRaisesRegex(
            build_guides.GuideBuildError, "sourceIds must not be empty"
        ):
            build_guides.expected_english_files(corpus, payload)

    def test_rejects_unknown_english_claim_source_id(self) -> None:
        corpus = build_guides.load_corpus(build_guides.CORPUS_PATH)
        payload = build_guides.load_english_guides(build_guides.ENGLISH_GUIDES_PATH)
        payload["guides"][0]["sections"][0]["blocks"][0]["sourceIds"] = [
            "missing-source"
        ]

        with self.assertRaisesRegex(
            build_guides.GuideBuildError, "unknown source IDs: missing-source"
        ):
            build_guides.expected_english_files(corpus, payload)

    def test_rejects_unsourced_english_walkthrough_step(self) -> None:
        corpus = build_guides.load_corpus(build_guides.CORPUS_PATH)
        payload = build_guides.load_english_guides(build_guides.ENGLISH_GUIDES_PATH)
        payload["walkthrough"]["steps"][0]["sourceIds"] = []

        with self.assertRaisesRegex(
            build_guides.GuideBuildError, "sourceIds must not be empty"
        ):
            build_guides.expected_english_files(corpus, payload)

    def test_rejects_invalid_english_guide_date(self) -> None:
        corpus = build_guides.load_corpus(build_guides.CORPUS_PATH)
        payload = build_guides.load_english_guides(build_guides.ENGLISH_GUIDES_PATH)
        guide = payload["guides"][0]
        self.assertIsInstance(guide, dict)
        guide["updatedAt"] = "2026-99-99"

        with self.assertRaisesRegex(build_guides.GuideBuildError, "ISO date"):
            build_guides.expected_english_files(corpus, payload)

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
