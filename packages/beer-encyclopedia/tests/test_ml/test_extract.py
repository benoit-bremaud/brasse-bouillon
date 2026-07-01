"""Unit tests for the label field extractors (``ml/extract.py``).

These lock the two regressions found by the scan-pipeline audit: ``extract_abv``
mis-parsing multi-decimal percentages, and ``extract_name`` falling back to a
line the guard loop had already rejected.
"""

from __future__ import annotations

import pytest

from ml.extract import extract_abv, extract_name, infer_style


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("Alc. 6,5% vol", 6.5),
        ("5.0 %", 5.0),
        ("ABV 12.75%", 12.75),  # regression: previously mis-parsed as 75.0
        ("100%", None),  # mis-tokenised / implausible -> rejected
        ("IPA 75%", None),  # above the plausibility ceiling (0 < abv <= 30)
        ("no abv here", None),
    ],
)
def test_extract_abv(text: str, expected: float | None) -> None:
    assert extract_abv(text) == expected


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("A hoppy IPA", "ipa"),
        ("Blanche de blé", "wheat"),
        ("Imperial Stout", "stout"),
        ("just a drink", None),
    ],
)
def test_infer_style(text: str, expected: str | None) -> None:
    assert infer_style(text) == expected


def test_extract_name_prefers_the_beer_name_over_brewery_and_abv() -> None:
    text = "Brasserie Dupont\nMoinette\n8.5 %"
    assert extract_name(text, style=None, brewery="Brasserie Dupont") == "Moinette"


@pytest.mark.parametrize(
    ("text", "style", "brewery"),
    [
        ("5.5%\nIPA", "ipa", None),  # regression: used to return "5.5%"
        ("7.2%", None, None),  # regression: used to return "7.2%"
    ],
)
def test_extract_name_returns_none_when_all_lines_filtered(
    text: str, style: str | None, brewery: str | None
) -> None:
    assert extract_name(text, style=style, brewery=brewery) is None


def test_extract_name_filters_brewery_with_irregular_whitespace() -> None:
    # The brewery's OCR spacing differs from the line's; normalising both (not a
    # bare ``.lower()``) keeps the brewery line from being read as the name.
    text = "La  Brasserie\nMoinette\n8 %"
    assert extract_name(text, style=None, brewery="La  Brasserie") == "Moinette"


def test_extract_name_keeps_a_style_bearing_name() -> None:
    # A name that carries a style word ("Punk IPA") must be preserved via the
    # fallback rather than filtered as if it were the bare style ("IPA" -> None).
    text = "Punk IPA\n5.6 %"
    assert extract_name(text, style="ipa", brewery=None) == "Punk IPA"
