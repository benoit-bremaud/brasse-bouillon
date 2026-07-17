#!/usr/bin/env python3
"""Generate the English home page from the annotated French source.

ADR-0027 (website i18n). `index.html` is the single authored source for the home
page. Translatable body content is annotated with `data-i18n` / `data-i18n-attrs`
/ `data-i18n-en-only`; the English strings live in `i18n/home.en.json`. This
script produces `en.html` by **splicing the original bytes in place** — it never
re-serialises the document, so everything the annotations do not touch stays
byte-for-byte identical (a hard requirement for the CI regeneration-diff check).

Usage:
    python3 scripts/build_i18n.py              # generate en.html (default)
    python3 scripts/build_i18n.py --check      # generate in memory, fail if en.html is stale
    python3 scripts/build_i18n.py --update-hashes
                                              # rewrite catalog srcHash fields after a FR edit
    python3 scripts/build_i18n.py --stamp      # refresh the EN legal twins' i18n-src freshness stamp

The drift guard: each catalog entry stores `srcHash`, the sha1 of the French
source (element inner HTML or attribute value) it translates. On generate/check,
a mismatch is a hard error — a FR copy change without its EN update fails CI. The
author updates the EN value, runs --update-hashes, and commits deliberately.

The legal twins (`legal`, `privacy`, `cookies`, `terms`) are hand-maintained,
not generated; the same idea guards them via `--stamp`: each EN twin embeds a
sha1 of its FR source, and the quality gate fails when a FR legal edit skipped
the EN re-review + re-stamp (ADR-0027 D1 clause 5).
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
from dataclasses import dataclass
from html.parser import HTMLParser
from itertools import pairwise
from pathlib import Path

WEBSITE_DIR = Path(__file__).resolve().parent.parent
INDEX_PATH = WEBSITE_DIR / "index.html"
CATALOG_PATH = WEBSITE_DIR / "i18n" / "home.en.json"
OUTPUT_PATH = WEBSITE_DIR / "en.html"

# Hand-maintained legal twins (S4, ADR-0027 D1 clause 5). Unlike the home, they
# are NOT generated; instead each `{stem}-en.html` embeds a sha1 of its FR
# source so the gate can flag a FR legal edit that skipped the EN re-review.
# `--stamp` refreshes the marker once the twin has been re-reviewed.
LEGAL_STEMS = ("legal", "privacy", "cookies", "terms")
_LEGAL_STAMP_RE = re.compile(r"<!-- i18n-src: sha1:([0-9a-f]{40}) -->")

# Void elements never hold inner content, so they must not be pushed on the
# element stack (they have no end tag). They may still carry translatable
# attributes (img@alt, input@placeholder), handled as attribute ops.
VOID_TAGS = frozenset(
    "area base br col embed hr img input link meta param source track wbr".split()
)

CANONICAL_EN = "https://brasse-bouillon.com/en"
GENERATED_MARKER = (
    "<!-- GENERATED FILE — edit index.html + i18n/home.en.json instead. "
    "Regenerate with: python3 scripts/build_i18n.py -->"
)


class BuildError(Exception):
    """A recoverable, user-facing generation error (prints then exits 1)."""


def sha1(text: str) -> str:
    """Fingerprint a French source string for the srcHash drift guard."""
    # Non-cryptographic use: a content fingerprint, not a security control.
    return hashlib.sha1(text.encode("utf-8"), usedforsecurity=False).hexdigest()


# --------------------------------------------------------------------------- #
# Parsing: locate annotated spans by byte offset (no re-serialisation).       #
# --------------------------------------------------------------------------- #


@dataclass(slots=True)
class _TextOp:
    key: str
    start: int
    end: int


@dataclass(slots=True)
class _AttrOp:
    tag_start: int
    tag_text: str
    specs: list[tuple[str, str]]  # (attribute-name, catalog-key) pairs


class _AnnotationParser(HTMLParser):
    """Collects text and attribute annotation ops with absolute char offsets."""

    def __init__(self, source: str) -> None:
        super().__init__(convert_charrefs=False)
        self._source = source
        self._line_offsets = _line_offsets(source)
        self._stack: list[dict] = []
        self.text_ops: list[_TextOp] = []
        self.attr_ops: list[_AttrOp] = []
        self.enonly_keys: set[str] = set()
        self.text_keys: set[str] = set()
        self.attr_keys: set[str] = set()

    def _abs(self) -> int:
        line, col = self.getpos()
        return self._line_offsets[line - 1] + col

    def handle_starttag(self, tag: str, attrs) -> None:  # noqa: ANN001
        adict = {name: (value or "") for name, value in attrs}
        tag_start = self._abs()
        tag_text = self.get_starttag_text() or ""
        inner_start = tag_start + len(tag_text)

        # Attribute translations (works on void and non-void elements alike).
        spec = adict.get("data-i18n-attrs")
        if spec:
            specs = _parse_attr_spec(spec, adict)
            for _, key in specs:
                self.attr_keys.add(key)
            self.attr_ops.append(_AttrOp(tag_start, tag_text, specs))

        key = adict.get("data-i18n")
        enonly = adict.get("data-i18n-en-only")

        if tag in VOID_TAGS:
            # A void element cannot own text content; a data-i18n on it is a
            # mistake worth surfacing rather than silently dropping.
            if key or enonly:
                raise BuildError(
                    f"void <{tag}> carries data-i18n; use data-i18n-attrs instead"
                )
            return

        self._stack.append(
            {"tag": tag, "key": key or enonly, "inner_start": inner_start}
        )
        if key:
            self.text_keys.add(key)
        if enonly:
            self.enonly_keys.add(enonly)

    # XHTML self-closing tags (`<img … />`) need no dedicated handler:
    # HTMLParser's default handle_startendtag dispatches to handle_starttag
    # (which collects the attribute ops) then handle_endtag (a no-op for void
    # tags), so the annotation handling above covers them already.

    def handle_endtag(self, tag: str) -> None:
        if tag in VOID_TAGS or not self._stack:
            return
        end_abs = self._abs()
        # Pop to the nearest matching open tag (defensive against odd nesting).
        while self._stack:
            frame = self._stack.pop()
            if frame["tag"] == tag:
                if frame["key"]:
                    self.text_ops.append(
                        _TextOp(frame["key"], frame["inner_start"], end_abs)
                    )
                return


def _line_offsets(source: str) -> list[int]:
    offsets = [0]
    for line in source.splitlines(keepends=True):
        offsets.append(offsets[-1] + len(line))
    return offsets


def _parse_attr_spec(spec: str, adict: dict) -> list[tuple[str, str]]:
    """Parse `data-i18n-attrs="alt:key,title:other"`.

    A bare `attr` (no `:key`) derives the key from `data-i18n` as `<base>@<attr>`.
    """
    pairs: list[tuple[str, str]] = []
    for item in spec.split(","):
        item = item.strip()
        if not item:
            continue
        if ":" in item:
            attr, key = (part.strip() for part in item.split(":", 1))
        else:
            attr = item
            base = adict.get("data-i18n") or adict.get("data-i18n-en-only")
            if not base:
                raise BuildError(
                    f"data-i18n-attrs='{spec}' needs an explicit key (attr:key) "
                    "when the element has no data-i18n base"
                )
            key = f"{base}@{attr}"
        pairs.append((attr, key))
    return pairs


# --------------------------------------------------------------------------- #
# Catalog                                                                       #
# --------------------------------------------------------------------------- #


def load_catalog() -> dict:
    """Read `i18n/home.en.json`.

    Schema: `strings` maps catalog key → `{"en": <EN HTML fragment>,
    "srcHash": <sha1 of the FR source>}`; `insertions` maps EN-only keys →
    fragments (no FR source, so no hash); `idStems` lists the DOM id stems
    rewritten `…Fr` → `…En`; `head` holds the EN head-override values.
    """
    if not CATALOG_PATH.exists():
        raise BuildError(f"catalog not found: {CATALOG_PATH}")
    with CATALOG_PATH.open(encoding="utf-8") as handle:
        return json.load(handle)


def _catalog_entry(catalog: dict, key: str) -> dict:
    entry = catalog.get("strings", {}).get(key)
    if entry is None:
        raise BuildError(f"catalog is missing key '{key}'")
    if "en" not in entry:
        raise BuildError(f"catalog key '{key}' has no 'en' value")
    return entry


def _fr_source(source: str, op: _TextOp) -> str:
    return source[op.start : op.end]


# Attributes are whitespace-separated inside a tag, so anchor on the leading
# whitespace rather than a bare \b — otherwise `value` would false-match inside
# a hypothetical `data-value="…"` on the same tag.
_ATTR_RE = r'\s{name}="([^"]*)"'


def _fr_attr_value(tag_text: str, attr: str) -> str:
    match = re.search(_ATTR_RE.format(name=re.escape(attr)), tag_text)
    if not match:
        raise BuildError(f"attribute '{attr}' not found on tag: {tag_text[:60]}…")
    return match.group(1)


# --------------------------------------------------------------------------- #
# Generation                                                                    #
# --------------------------------------------------------------------------- #


def generate(source: str, catalog: dict, *, check_hashes: bool = True) -> str:
    """Produce the EN page from the annotated FR `source` and the catalog.

    Deterministic byte-splice: only annotated spans/attributes and the
    enumerated head/bootstrap transforms change; everything else is copied
    byte-for-byte (the CI regeneration diff relies on this). Raises
    `BuildError` on key-parity failure, on any srcHash mismatch (a FR edit
    whose EN translation was not updated — pass `check_hashes=False` to skip,
    e.g. for fixtures without hashes), and on overlapping annotation ranges.
    """
    parser = _AnnotationParser(source)
    parser.feed(source)
    parser.close()

    _assert_key_parity(parser, catalog)

    ops: list[tuple[int, int, str]] = []  # (start, end, replacement)
    hash_errors: list[str] = []
    insertions = catalog.get("insertions", {})

    for op in parser.text_ops:
        # data-i18n-en-only elements render empty in FR; their EN content lives
        # under `insertions` and has no FR source to hash.
        if op.key in insertions:
            ops.append((op.start, op.end, insertions[op.key]))
            continue
        entry = _catalog_entry(catalog, op.key)
        fr = _fr_source(source, op)
        if check_hashes and entry.get("srcHash") != sha1(fr):
            hash_errors.append(op.key)
        ops.append((op.start, op.end, entry["en"]))

    for attr_op in parser.attr_ops:
        new_tag = attr_op.tag_text
        for attr, key in attr_op.specs:
            entry = _catalog_entry(catalog, key)
            fr = _fr_attr_value(attr_op.tag_text, attr)
            if check_hashes and entry.get("srcHash") != sha1(fr):
                hash_errors.append(key)
            new_tag = re.sub(
                rf'(\s{re.escape(attr)}=")[^"]*(")',
                lambda m, v=entry["en"]: m.group(1) + v + m.group(2),
                new_tag,
                count=1,
            )
        ops.append(
            (attr_op.tag_start, attr_op.tag_start + len(attr_op.tag_text), new_tag)
        )

    if hash_errors:
        keys = ", ".join(sorted(set(hash_errors)))
        raise BuildError(
            "French source changed for: "
            f"{keys}\n  → update the EN translation in i18n/home.en.json, then run "
            "`python3 scripts/build_i18n.py --update-hashes`."
        )

    out = _apply_ops(source, ops)
    out = _transform_head(out, catalog)
    out = _transform_body_structure(out, catalog)
    return out


def _apply_ops(source: str, ops: list[tuple[int, int, str]]) -> str:
    # Guard the core invariant: replacement ranges must not overlap, otherwise a
    # back-to-front splice would corrupt an enclosing op (e.g. a translatable
    # attribute on an element nested inside a translatable text element). This
    # keeps the "never silently drop/garble content" promise honest.
    ordered = sorted(ops, key=lambda op: op[0])
    for (_prev_start, prev_end, _), (next_start, _next_end, _r) in pairwise(ordered):
        if prev_end > next_start:
            raise BuildError(
                "overlapping i18n replacement ranges "
                f"(one op ends at {prev_end}, the next starts at {next_start}); "
                "a data-i18n-attrs element nested inside a data-i18n element is "
                "not supported"
            )
    # Apply from the last offset backwards so earlier offsets stay valid.
    for start, end, replacement in reversed(ordered):
        source = source[:start] + replacement + source[end:]
    return source


def _assert_key_parity(parser: _AnnotationParser, catalog: dict) -> None:
    used = parser.text_keys | parser.attr_keys
    used_enonly = parser.enonly_keys
    strings = set(catalog.get("strings", {}))
    insertions = set(catalog.get("insertions", {}))

    missing = used - strings
    orphaned = strings - used
    missing_ins = used_enonly - insertions
    orphaned_ins = insertions - used_enonly

    problems = []
    if missing:
        problems.append(f"annotated but absent from catalog.strings: {sorted(missing)}")
    if orphaned:
        problems.append(
            f"in catalog.strings but unused in index.html: {sorted(orphaned)}"
        )
    if missing_ins:
        problems.append(
            f"data-i18n-en-only without catalog.insertions: {sorted(missing_ins)}"
        )
    if orphaned_ins:
        problems.append(
            f"catalog.insertions but no data-i18n-en-only: {sorted(orphaned_ins)}"
        )
    if problems:
        raise BuildError("key parity failed:\n  - " + "\n  - ".join(problems))


def _transform_head(html: str, catalog: dict) -> str:
    head = catalog.get("head", {})

    html = html.replace('<html lang="fr"', '<html lang="en"', 1)

    # The hreflang cluster (fr / en / x-default) is copied verbatim from the FR
    # source: a cluster is identical on every page of the pair by design (S2 —
    # the S1 ship-dark strip is gone, en.html is indexable).

    replacements = [
        (r"(<title>).*?(</title>)", head.get("title")),
        (r'(<meta name="description" content=").*?(">)', head.get("description")),
    ]
    for pattern, value in replacements:
        if value is not None:
            html = re.sub(
                pattern,
                lambda m, v=value: m.group(1) + v + m.group(2),
                html,
                count=1,
                flags=re.DOTALL,
            )

    keywords = head.get("keywords")
    if keywords is not None:
        html = re.sub(
            r'(<meta name="keywords" content=").*?(">)',
            lambda m: m.group(1) + keywords + m.group(2),
            html,
            count=1,
        )

    # URL/meta swaps to the EN locale.
    url_meta = {
        r'(<link rel="canonical" href=")[^"]*(">)': CANONICAL_EN,
        r'(<meta property="og:url" content=")[^"]*(">)': CANONICAL_EN,
        r'(<meta name="twitter:url" content=")[^"]*(">)': CANONICAL_EN,
        r'(<meta property="og:title" content=")[^"]*(">)': head.get("ogTitle"),
        r'(<meta property="og:description" content=")[^"]*(">)': head.get(
            "ogDescription"
        ),
        r'(<meta name="twitter:title" content=")[^"]*(">)': head.get("twitterTitle"),
        r'(<meta name="twitter:description" content=")[^"]*(">)': head.get(
            "twitterDescription"
        ),
        r'(<meta property="og:image:alt" content=")[^"]*(">)': head.get("ogImageAlt"),
        r'(<meta name="twitter:image:alt" content=")[^"]*(">)': head.get("ogImageAlt"),
        # Localized share card (the FR card has a French tagline baked in).
        r'(<meta property="og:image" content=")[^"]*(">)': head.get("ogImage"),
        r'(<meta name="twitter:image" content=")[^"]*(">)': head.get("ogImage"),
    }
    for pattern, value in url_meta.items():
        if value is not None:
            html = re.sub(
                pattern, lambda m, v=value: m.group(1) + v + m.group(2), html, count=1
            )

    # Mirror the FR page's Open Graph locale pair for the EN page. Ordered so
    # the freshly written `en_US` og:locale cannot be re-matched: the alternate
    # swap targets the distinct `og:locale:alternate` property.
    html = html.replace(
        '<meta property="og:locale" content="fr_FR">',
        '<meta property="og:locale" content="en_US">',
        1,
    )
    html = html.replace(
        '<meta property="og:locale:alternate" content="en_US">',
        '<meta property="og:locale:alternate" content="fr_FR">',
        1,
    )

    # S2 (ADR-0027 D5): en.html is indexable — no robots meta is inserted (the
    # S1 ship-dark noindex insertion was removed here; the gate now FORBIDS a
    # noindex on the EN pages so the SEO switch cannot silently regress).

    html = _rebuild_org_schema(html, catalog)
    html = _rebuild_faq_schema(html, catalog)

    # Generated-file marker right after <head>.
    html = html.replace("<head>", f"<head>\n  {GENERATED_MARKER}", 1)
    return html


def _rebuild_org_schema(html: str, catalog: dict) -> str:
    head = catalog.get("head", {})
    description = head.get("orgDescription")
    if description:
        html = re.sub(
            r'("@type": "Organization",.*?"description": ").*?(",)',
            lambda m: m.group(1) + description + m.group(2),
            html,
            count=1,
            flags=re.DOTALL,
        )
    topics = head.get("knowsAbout")
    if topics:
        items = ",\n".join(f'      "{topic}"' for topic in topics)
        html = re.sub(
            r'("knowsAbout": \[).*?(\s*\])',
            lambda m: m.group(1) + "\n" + items + "\n    ]",
            html,
            count=1,
            flags=re.DOTALL,
        )
    return html


def _rebuild_faq_schema(html: str, catalog: dict) -> str:
    # Single source of truth: the FAQ structured data is built from the SAME
    # catalog keys as the visible <details> FAQ (faq.qN.summary / faq.qN.answer),
    # so the JSON-LD can never drift from the rendered copy (ADR-0027 D1.3).
    strings = catalog.get("strings", {})
    entities = []
    index = 1
    while f"faq.q{index}.summary" in strings:
        question = strings[f"faq.q{index}.summary"]["en"]
        answer_key = f"faq.q{index}.answer"
        if answer_key not in strings:
            raise BuildError(f"FAQ key '{answer_key}' missing for the JSON-LD rebuild")
        entities.append(
            {
                "@type": "Question",
                "name": question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": strings[answer_key]["en"],
                },
            }
        )
        index += 1
    if not entities:
        return html
    payload = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": entities,
    }
    block = json.dumps(payload, ensure_ascii=False, indent=2)
    return re.sub(
        r'(<script type="application/ld\+json">\s*\{\s*"@context": "https://schema\.org",\s*"@type": "FAQPage".*?</script>)',
        f'<script type="application/ld+json">\n{block}\n  </script>',
        html,
        count=1,
        flags=re.DOTALL,
    )


def _transform_body_structure(html: str, catalog: dict) -> str:
    # DOM id suffixes: BBShared derives `…En` ids for the EN page.
    for stem in catalog.get("idStems", []):
        html = re.sub(rf"\b{re.escape(stem)}Fr\b", f"{stem}En", html)

    # Hidden form language field.
    html = html.replace('name="lang" value="fr"', 'name="lang" value="en"')

    # Inline bootstrap: swap the language argument.
    html = html.replace("toggleQuestionnaire('fr')", "toggleQuestionnaire('en')")
    html = html.replace(
        "BBShared.initHome({ lang: 'fr' })", "BBShared.initHome({ lang: 'en' })"
    )

    # Language switcher: the active-language marker moves from the FR link to the
    # EN link (ADR-0027 D4). The pair of <a> links is otherwise identical on both
    # pages (autonyms, fixed hrefs), so only aria-current changes.
    html = html.replace(
        ' aria-current="page" data-lang-link="fr"', ' data-lang-link="fr"'
    )
    html = html.replace(
        ' data-lang-link="en"', ' aria-current="page" data-lang-link="en"'
    )
    return html


# --------------------------------------------------------------------------- #
# Hash maintenance                                                              #
# --------------------------------------------------------------------------- #


def update_hashes(source: str, catalog: dict) -> dict:
    """Refresh every `srcHash` from the current FR source.

    Mutates `catalog` in place AND returns it (callers may chain either).
    Covers both text ops and attribute ops. Run after deliberately updating
    the EN translations for a FR copy change (`--update-hashes`).
    """
    parser = _AnnotationParser(source)
    parser.feed(source)
    parser.close()
    _assert_key_parity(parser, catalog)

    for op in parser.text_ops:
        if op.key in catalog.get("strings", {}):
            catalog["strings"][op.key]["srcHash"] = sha1(_fr_source(source, op))
    for attr_op in parser.attr_ops:
        for attr, key in attr_op.specs:
            if key in catalog.get("strings", {}):
                catalog["strings"][key]["srcHash"] = sha1(
                    _fr_attr_value(attr_op.tag_text, attr)
                )
    return catalog


# --------------------------------------------------------------------------- #
# CLI                                                                           #
# --------------------------------------------------------------------------- #


def read_legal_stamp(en_html: str) -> str | None:
    """Return the sha1 embedded in an EN legal page, or None if unstamped."""
    match = _LEGAL_STAMP_RE.search(en_html)
    return match.group(1) if match else None


def fr_legal_hash(website_dir: Path, stem: str) -> str:
    """sha1 of the FR legal source `{stem}.html` (the twin the EN page tracks).

    Hashes the WHOLE file, not just `<body>` prose, on purpose: the `<head>`
    metadata (title, description, og:*) is itself translatable content that must
    stay in sync between twins, so a FR head edit should also demand an EN
    re-review. A sitewide, legal-neutral sweep (e.g. an `og-image` cache-bust)
    does touch this hash, but such sweeps touch the EN twin in the same PR — so
    re-running `--stamp` there is a legitimate, one-command acknowledgment, not
    a false positive.
    """
    return sha1((website_dir / f"{stem}.html").read_text(encoding="utf-8"))


def stamp_legal_pages(website_dir: Path = WEBSITE_DIR) -> list[str]:
    """Refresh the `i18n-src` freshness stamp on every EN legal twin.

    Embeds `<!-- i18n-src: sha1:<hash of the FR twin> -->` in each
    `{stem}-en.html` (inserted right after `<head>` on first run, replaced in
    place afterwards). Returns the EN files that changed. Run after re-reviewing
    an EN twin against a FR legal edit; the gate (`check_legal_freshness`) stays
    red until the stamp matches. Idempotent when everything is already current.
    """
    changed: list[str] = []
    for stem in LEGAL_STEMS:
        fr_path = website_dir / f"{stem}.html"
        en_path = website_dir / f"{stem}-en.html"
        if not fr_path.exists() or not en_path.exists():
            raise BuildError(f"legal twin missing for stem '{stem}'")
        marker = f"<!-- i18n-src: sha1:{fr_legal_hash(website_dir, stem)} -->"
        en_html = en_path.read_text(encoding="utf-8")
        if _LEGAL_STAMP_RE.search(en_html):
            new_html = _LEGAL_STAMP_RE.sub(marker, en_html, count=1)
        elif "<head>" in en_html:
            new_html = en_html.replace("<head>", f"<head>\n  {marker}", 1)
        else:
            raise BuildError(f"{en_path.name}: no <head> to stamp")
        if new_html != en_html:
            en_path.write_text(new_html, encoding="utf-8")
            changed.append(en_path.name)
    return changed


def main(argv: list[str]) -> int:
    """CLI: `--write` (default), `--check`, `--update-hashes`, or `--stamp`."""
    mode = argv[1] if len(argv) > 1 else "--write"
    if mode not in ("--write", "--check", "--update-hashes", "--stamp"):
        # Fail loudly on typos: silently falling through to write mode would
        # rewrite en.html when the author meant e.g. `--chek`.
        print(
            f"build_i18n: unknown mode '{mode}' "
            "(expected --write, --check, --update-hashes or --stamp)",
            file=sys.stderr,
        )
        return 2

    if mode == "--stamp":
        try:
            changed = stamp_legal_pages()
        except BuildError as error:
            print(f"build_i18n: {error}", file=sys.stderr)
            return 1
        if changed:
            print("Refreshed legal stamps: " + ", ".join(changed))
        else:
            print("Legal stamps already up to date.")
        return 0

    source = INDEX_PATH.read_text(encoding="utf-8")
    catalog = load_catalog()

    try:
        if mode == "--update-hashes":
            updated = update_hashes(source, catalog)
            CATALOG_PATH.write_text(
                json.dumps(updated, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            print("Updated srcHash fields in i18n/home.en.json")
            return 0

        generated = generate(source, catalog)

        if mode == "--check":
            current = (
                OUTPUT_PATH.read_text(encoding="utf-8") if OUTPUT_PATH.exists() else ""
            )
            if current != generated:
                print(
                    "en.html is stale — run `python3 scripts/build_i18n.py` and commit.",
                    file=sys.stderr,
                )
                return 1
            print("en.html is up to date.")
            return 0

        OUTPUT_PATH.write_text(generated, encoding="utf-8")
        print(f"Wrote {OUTPUT_PATH.relative_to(WEBSITE_DIR)}")
        return 0
    except BuildError as error:
        print(f"build_i18n: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
