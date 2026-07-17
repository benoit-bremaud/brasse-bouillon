from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from scripts import build_i18n


def _catalog(strings: dict, **extra) -> dict:
    catalog: dict = {"strings": strings}
    catalog.update(extra)
    return catalog


def _write_legal_twins(base: Path) -> None:
    """Minimal FR + EN legal twins (all four stems) for the stamp helper."""
    for stem in build_i18n.LEGAL_STEMS:
        (base / f"{stem}.html").write_text(
            f"<!DOCTYPE html><html lang=fr><head><title>{stem} FR</title></head>"
            "<body></body></html>",
            encoding="utf-8",
        )
        (base / f"{stem}-en.html").write_text(
            f"<!DOCTYPE html><html lang=en><head><title>{stem} EN</title></head>"
            "<body></body></html>",
            encoding="utf-8",
        )


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

    def test_untouched_bytes_are_copied_verbatim(self) -> None:
        # The byte-splice promise: everything outside the annotated span —
        # including whitespace quirks and unusual formatting the generator
        # must NOT normalise — survives byte-for-byte.
        source = '<div   class="x"\t>\n  <p data-i18n="k">Salut</p>  \n</div><!-- z -->'
        catalog = _catalog({"k": {"en": "Hi"}})
        out = build_i18n.generate(source, catalog, check_hashes=False)
        self.assertEqual(
            out, '<div   class="x"\t>\n  <p data-i18n="k">Hi</p>  \n</div><!-- z -->'
        )

    def test_regeneration_is_deterministic(self) -> None:
        # Two independent runs over the same inputs must be byte-identical —
        # the CI regen-diff (`--check`) relies on it (no timestamps, no
        # ordering drift).
        source = '<p data-i18n="k">Salut</p><img alt="Chat" data-i18n-attrs="alt:p2">'
        catalog = _catalog({"k": {"en": "Hi"}, "p2": {"en": "Cat"}})
        first = build_i18n.generate(source, catalog, check_hashes=False)
        second = build_i18n.generate(source, catalog, check_hashes=False)
        self.assertEqual(first, second)

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

    def test_self_closing_tag_attr_translation(self) -> None:
        # XHTML-style `<img … />` flows through HTMLParser's default
        # startendtag dispatch; the attribute op must still be collected.
        source = '<img alt="Chat" data-i18n-attrs="alt:pic" />'
        catalog = _catalog({"pic": {"en": "Cat"}})
        out = build_i18n.generate(source, catalog, check_hashes=False)
        self.assertIn('alt="Cat"', out)

    def test_overlapping_annotations_raise(self) -> None:
        # A translatable attribute nested inside a translatable text element
        # would corrupt the enclosing splice — must fail loudly, not garble.
        source = '<p data-i18n="outer">Un <img alt="x" data-i18n-attrs="alt:inner"></p>'
        catalog = _catalog({"outer": {"en": "A"}, "inner": {"en": "y"}})
        with self.assertRaises(build_i18n.BuildError) as ctx:
            build_i18n.generate(source, catalog, check_hashes=False)
        self.assertIn("overlapping", str(ctx.exception))

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

    def test_update_hashes_covers_attribute_ops(self) -> None:
        source = '<img alt="Chat" data-i18n-attrs="alt:pic">'
        catalog = _catalog({"pic": {"en": "Cat"}})
        updated = build_i18n.update_hashes(source, catalog)
        self.assertEqual(updated["strings"]["pic"]["srcHash"], build_i18n.sha1("Chat"))

    def test_transform_head_applies_the_seo_swaps(self) -> None:
        # The head transform carries the SEO-critical rewrites of the whole
        # feature: canonical → /en, og:locale mirroring, localized og:image,
        # hreflang cluster copied verbatim (S2 — indexable, NO robots meta),
        # title/description swap, lang attribute, generated-file marker.
        source = (
            '<html lang="fr"><head>\n'
            "  <title>Titre FR</title>\n"
            '  <meta name="description" content="Desc FR">\n'
            '  <link rel="canonical" href="https://brasse-bouillon.com/">\n'
            '  <link rel="alternate" hreflang="fr" href="https://brasse-bouillon.com/">\n'
            '  <link rel="alternate" hreflang="en" href="https://brasse-bouillon.com/en">\n'
            '  <link rel="alternate" hreflang="x-default" href="https://brasse-bouillon.com/">\n'
            '  <meta property="og:url" content="https://brasse-bouillon.com/">\n'
            '  <meta property="og:image" content="https://brasse-bouillon.com/og-image.png?v=1">\n'
            '  <meta property="og:locale" content="fr_FR">\n'
            '  <meta property="og:locale:alternate" content="en_US">\n'
            "</head><body></body></html>"
        )
        catalog = _catalog(
            {},
            head={
                "title": "Title EN",
                "description": "Desc EN",
                "ogImage": "https://brasse-bouillon.com/og-image-en.png?v=2",
            },
        )
        out = build_i18n.generate(source, catalog, check_hashes=False)
        self.assertIn('<html lang="en">', out)
        self.assertIn("<title>Title EN</title>", out)
        self.assertIn('content="Desc EN"', out)
        self.assertIn('rel="canonical" href="https://brasse-bouillon.com/en"', out)
        # S2: en.html is indexable — the generator must NOT emit a robots meta.
        self.assertNotIn('name="robots"', out)
        # The full hreflang cluster survives byte-for-byte (identical on both
        # pages of the pair by design).
        self.assertIn('hreflang="fr" href="https://brasse-bouillon.com/"', out)
        self.assertIn('hreflang="en" href="https://brasse-bouillon.com/en"', out)
        self.assertIn('hreflang="x-default" href="https://brasse-bouillon.com/"', out)
        self.assertIn(
            'og:image" content="https://brasse-bouillon.com/og-image-en.png?v=2"', out
        )
        self.assertIn('og:locale" content="en_US"', out)
        self.assertIn('og:locale:alternate" content="fr_FR"', out)
        self.assertEqual(out.count("GENERATED FILE"), 1)

    def test_unknown_cli_mode_fails_without_writing(self) -> None:
        # A typo'd flag must error out (exit 2), not silently fall through to
        # write mode and rewrite en.html.
        self.assertEqual(build_i18n.main(["build_i18n.py", "--chek"]), 2)

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


class HeadGuardTests(unittest.TestCase):
    """Per-key srcHash guard on the FR-sourced head overrides (ADR-0027)."""

    source = (
        '<html lang="fr"><head>\n'
        "  <title>Titre FR</title>\n"
        '  <meta name="description" content="Desc FR">\n'
        "</head><body></body></html>"
    )

    def test_correct_head_hashes_pass(self) -> None:
        catalog = _catalog(
            {},
            head={"title": "Title EN", "description": "Desc EN"},
            headSrcHashes={
                "title": build_i18n.sha1("Titre FR"),
                "description": build_i18n.sha1("Desc FR"),
            },
        )
        out = build_i18n.generate(self.source, catalog, check_hashes=True)
        self.assertIn("<title>Title EN</title>", out)
        self.assertIn('content="Desc EN"', out)

    def test_stale_head_hash_reports_the_prefixed_key(self) -> None:
        catalog = _catalog(
            {},
            head={"title": "Title EN"},
            headSrcHashes={"title": "deadbeef"},
        )
        with self.assertRaises(build_i18n.BuildError) as ctx:
            build_i18n.generate(self.source, catalog, check_hashes=True)
        self.assertIn("head.title", str(ctx.exception))

    def test_missing_head_hashes_flag_every_guarded_key(self) -> None:
        # No headSrcHashes block at all: every guarded head key must go red
        # (the pre-guard catalogs regress to this state — CI forces the
        # bootstrap instead of silently skipping the guard).
        catalog = _catalog({}, head={"title": "Title EN", "description": "Desc EN"})
        with self.assertRaises(build_i18n.BuildError) as ctx:
            build_i18n.generate(self.source, catalog, check_hashes=True)
        message = str(ctx.exception)
        self.assertIn("head.title", message)
        self.assertIn("head.description", message)

    def test_unguarded_head_keys_need_no_hash(self) -> None:
        # ogImage / orgDescription / knowsAbout have no 1:1 FR head string to
        # fingerprint (asset URL, JSON-LD rebuilds) — they pass unhashed.
        catalog = _catalog(
            {},
            head={
                "ogImage": "https://example.com/og-en.png",
                "orgDescription": "EN org description",
                "knowsAbout": ["Homebrewing"],
            },
        )
        out = build_i18n.generate(self.source, catalog, check_hashes=True)
        self.assertIn("<title>Titre FR</title>", out)

    def test_guarded_head_key_without_fr_element_raises(self) -> None:
        # An EN keywords override with no FR keywords meta is a structural
        # problem a hash refresh cannot fix — fail loudly, never skip silently.
        catalog = _catalog(
            {},
            head={"keywords": "beer, brewing"},
            headSrcHashes={"keywords": build_i18n.sha1("x")},
        )
        with self.assertRaises(build_i18n.BuildError) as ctx:
            build_i18n.generate(self.source, catalog, check_hashes=True)
        self.assertIn("keywords", str(ctx.exception))
        self.assertIn("no matching FR element", str(ctx.exception))

    def test_orphaned_head_hash_raises(self) -> None:
        # A hash on an unguardable key must fail loudly — otherwise the author
        # believes ogImage is guarded when it cannot be.
        catalog = _catalog(
            {},
            head={"title": "Title EN", "ogImage": "https://example.com/og-en.png"},
            headSrcHashes={
                "title": build_i18n.sha1("Titre FR"),
                "ogImage": "deadbeef",
            },
        )
        with self.assertRaises(build_i18n.BuildError) as ctx:
            build_i18n.generate(self.source, catalog, check_hashes=True)
        self.assertIn("ogImage", str(ctx.exception))

    def test_removed_head_key_with_lingering_hash_raises(self) -> None:
        # The realistic orphan: an author drops a head override but leaves its
        # hash behind — same loud failure as the unguardable-key case.
        catalog = _catalog({}, head={}, headSrcHashes={"title": "deadbeef"})
        with self.assertRaises(build_i18n.BuildError) as ctx:
            build_i18n.generate(self.source, catalog, check_hashes=True)
        self.assertIn("title", str(ctx.exception))
        self.assertIn("guard nothing", str(ctx.exception))

    def test_head_and_string_drift_aggregate_in_one_error(self) -> None:
        # A FR sweep touching body copy AND the <title> reports both stale
        # keys in a single BuildError, not one per CI run.
        source = '<head><title>Titre FR</title></head><p data-i18n="k">Salut</p>'
        catalog = _catalog(
            {"k": {"en": "Hi", "srcHash": "deadbeef"}},
            head={"title": "Title EN"},
            headSrcHashes={"title": "deadbeef"},
        )
        with self.assertRaises(build_i18n.BuildError) as ctx:
            build_i18n.generate(source, catalog, check_hashes=True)
        message = str(ctx.exception)
        self.assertIn("head.title", message)
        self.assertIn("k", message)

    def test_update_hashes_rebuilds_head_hashes(self) -> None:
        # Wholesale rebuild: guarded keys hashed, unguardable keys excluded,
        # stale orphans cleared.
        catalog = _catalog(
            {},
            head={"title": "Title EN", "ogImage": "https://example.com/og-en.png"},
            headSrcHashes={"stale": "deadbeef"},
        )
        updated = build_i18n.update_hashes(self.source, catalog)
        self.assertEqual(
            updated["headSrcHashes"], {"title": build_i18n.sha1("Titre FR")}
        )

    def test_update_hashes_drops_block_without_guarded_keys(self) -> None:
        catalog = _catalog({}, headSrcHashes={"title": "deadbeef"})
        updated = build_i18n.update_hashes(self.source, catalog)
        self.assertNotIn("headSrcHashes", updated)

    def test_update_hashes_raises_when_fr_element_missing(self) -> None:
        catalog = _catalog({}, head={"title": "Title EN"})
        with self.assertRaises(build_i18n.BuildError):
            build_i18n.update_hashes("<p>no head</p>", catalog)


class LegalStampTests(unittest.TestCase):
    def test_stamp_inserts_then_is_idempotent(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            base = Path(tmp_dir)
            _write_legal_twins(base)

            # Returned in LEGAL_STEMS order, one entry per freshly-stamped twin.
            first = build_i18n.stamp_legal_pages(base)
            self.assertEqual(first, [f"{s}-en.html" for s in build_i18n.LEGAL_STEMS])
            # Every EN twin now carries the sha1 of its FR source.
            for stem in build_i18n.LEGAL_STEMS:
                en_html = (base / f"{stem}-en.html").read_text(encoding="utf-8")
                self.assertEqual(
                    build_i18n.read_legal_stamp(en_html),
                    build_i18n.fr_legal_hash(base, stem),
                )
            # A second run changes nothing.
            self.assertEqual(build_i18n.stamp_legal_pages(base), [])

    def test_stamp_refreshes_only_the_changed_twin(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            base = Path(tmp_dir)
            _write_legal_twins(base)
            build_i18n.stamp_legal_pages(base)

            fr = base / "privacy.html"
            fr.write_text(fr.read_text(encoding="utf-8") + "<!-- edit -->", "utf-8")

            changed = build_i18n.stamp_legal_pages(base)
            self.assertEqual(changed, ["privacy-en.html"])
            self.assertEqual(
                build_i18n.read_legal_stamp(
                    (base / "privacy-en.html").read_text(encoding="utf-8")
                ),
                build_i18n.fr_legal_hash(base, "privacy"),
            )

    def test_read_legal_stamp_none_when_absent(self) -> None:
        self.assertIsNone(build_i18n.read_legal_stamp("<head></head>"))

    def test_stamp_raises_on_missing_twin(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            base = Path(tmp_dir)
            (base / "legal.html").write_text("<head></head>", encoding="utf-8")
            with self.assertRaises(build_i18n.BuildError):
                build_i18n.stamp_legal_pages(base)


if __name__ == "__main__":
    unittest.main()
