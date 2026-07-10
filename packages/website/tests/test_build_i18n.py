from __future__ import annotations

import unittest

from scripts import build_i18n


def _catalog(strings: dict, **extra) -> dict:
    catalog: dict = {"strings": strings}
    catalog.update(extra)
    return catalog


class GenerateTests(unittest.TestCase):
    def test_translates_text_and_attributes(self) -> None:
        source = (
            '<h1 data-i18n="hero.title">Bonjour <em>toi</em></h1>'
            '<img alt="Chat" data-i18n-attrs="alt:hero.img">'
        )
        catalog = _catalog(
            {
                "hero.title": {"en": "Hello <em>you</em>"},
                "hero.img": {"en": "Cat"},
            }
        )
        out = build_i18n.generate(source, catalog, check_hashes=False)
        self.assertIn("Hello <em>you</em>", out)
        self.assertNotIn("Bonjour", out)
        self.assertIn('alt="Cat"', out)

    def test_generation_is_idempotent(self) -> None:
        source = '<p data-i18n="k">Salut</p>'
        catalog = _catalog({"k": {"en": "Hi"}})
        first = build_i18n.generate(source, catalog, check_hashes=False)
        second = build_i18n.generate(first, catalog, check_hashes=False)
        # A second pass over already-translated output leaves it unchanged for
        # the parts it does not own; the translated span stays translated.
        self.assertEqual(
            build_i18n.generate(source, catalog, check_hashes=False), first
        )
        self.assertIn("Hi", second)

    def test_en_only_insertion_fills_empty_element(self) -> None:
        source = '<p data-i18n-en-only="note"></p>'
        catalog = _catalog({}, insertions={"note": "English-only note"})
        out = build_i18n.generate(source, catalog, check_hashes=False)
        self.assertIn(">English-only note<", out)

    def test_id_suffix_and_lang_and_bootstrap_swap(self) -> None:
        source = (
            '<main id="mainContentFr"></main>'
            '<input type="hidden" name="lang" value="fr">'
            "<script>BBShared.initHome({ lang: 'fr' });"
            "onclick=\"toggleQuestionnaire('fr')\"</script>"
        )
        catalog = _catalog({}, idStems=["mainContent"])
        out = build_i18n.generate(source, catalog, check_hashes=False)
        self.assertIn('id="mainContentEn"', out)
        self.assertNotIn("mainContentFr", out)
        self.assertIn('name="lang" value="en"', out)
        self.assertIn("BBShared.initHome({ lang: 'en' })", out)
        self.assertIn("toggleQuestionnaire('en')", out)

    def test_lang_switcher_active_marker_moves_to_en(self) -> None:
        source = (
            '<a href="/" aria-current="page" data-lang-link="fr">FR</a>'
            '<a href="/en" data-lang-link="en">EN</a>'
        )
        out = build_i18n.generate(source, _catalog({}), check_hashes=False)
        # The EN link gains the active marker; the FR link loses it.
        self.assertIn('aria-current="page" data-lang-link="en"', out)
        self.assertNotIn('aria-current="page" data-lang-link="fr"', out)

    def test_missing_catalog_key_raises(self) -> None:
        source = '<p data-i18n="absent">x</p>'
        with self.assertRaises(build_i18n.BuildError):
            build_i18n.generate(source, _catalog({}), check_hashes=False)

    def test_orphaned_catalog_key_raises(self) -> None:
        source = "<p>no annotations</p>"
        catalog = _catalog({"unused": {"en": "x"}})
        with self.assertRaises(build_i18n.BuildError):
            build_i18n.generate(source, catalog, check_hashes=False)

    def test_void_element_with_data_i18n_raises(self) -> None:
        source = '<img data-i18n="bad">'
        with self.assertRaises(build_i18n.BuildError):
            build_i18n.generate(
                source, _catalog({"bad": {"en": "x"}}), check_hashes=False
            )

    def test_stale_src_hash_raises_with_key(self) -> None:
        source = '<p data-i18n="k">Salut</p>'
        catalog = _catalog({"k": {"en": "Hi", "srcHash": "deadbeef"}})
        with self.assertRaises(build_i18n.BuildError) as ctx:
            build_i18n.generate(source, catalog, check_hashes=True)
        self.assertIn("k", str(ctx.exception))

    def test_correct_src_hash_passes(self) -> None:
        source = '<p data-i18n="k">Salut</p>'
        catalog = _catalog({"k": {"en": "Hi", "srcHash": build_i18n.sha1("Salut")}})
        out = build_i18n.generate(source, catalog, check_hashes=True)
        self.assertIn("Hi", out)

    def test_update_hashes_populates_source_hash(self) -> None:
        source = '<p data-i18n="k">Salut</p>'
        catalog = _catalog({"k": {"en": "Hi"}})
        updated = build_i18n.update_hashes(source, catalog)
        self.assertEqual(updated["strings"]["k"]["srcHash"], build_i18n.sha1("Salut"))

    def test_faq_jsonld_rebuilt_from_visible_keys(self) -> None:
        source = (
            "<head>"
            '<script type="application/ld+json">\n'
            '  {\n    "@context": "https://schema.org",\n'
            '    "@type": "FAQPage",\n    "mainEntity": []\n  }\n'
            "  </script>"
            "</head>"
            '<summary data-i18n="faq.q1.summary">Q FR</summary>'
            '<p data-i18n="faq.q1.answer">A FR</p>'
        )
        catalog = _catalog(
            {
                "faq.q1.summary": {"en": "Q EN"},
                "faq.q1.answer": {"en": "A EN"},
            }
        )
        out = build_i18n.generate(source, catalog, check_hashes=False)
        self.assertIn('"name": "Q EN"', out)
        self.assertIn('"text": "A EN"', out)


if __name__ == "__main__":
    unittest.main()
