from __future__ import annotations

import re

from ml.schemas import ExtractedFields

STYLE_KEYWORDS: dict[str, list[str]] = {
    "ipa": ["ipa", "india pale ale"],
    "lager": ["lager", "pils", "pilsner", "helles", "blonde"],
    "wheat": ["wheat", "witbier", "weiss", "blanche"],
    "stout": ["stout", "porter", "imperial stout"],
    "amber_ale": ["amber", "ambrée", "ambree", "red ale"],
    "sour": ["sour", "gose", "lambic", "berliner weisse"],
    "saison": ["saison", "farmhouse"],
    "tripel": ["tripel", "triple"],
}


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


# Plausible ABV ceiling for a beer label; readings above it are almost always
# OCR misreads (e.g. "12.75%" mis-tokenised as "75"), so we discard them.
_MAX_PLAUSIBLE_ABV = 30.0


def extract_abv(text: str) -> float | None:
    """Parse the alcohol-by-volume percentage from OCR label text.

    Returns the ABV as a float (percent by volume), or ``None`` when no
    plausible value is found. The number is anchored (no leading digit) so that
    ``"12.75%"`` reads as ``12.75`` rather than ``75``; values outside
    ``0 < abv <= 30`` are treated as misreads and discarded.
    """
    match = re.search(r"(?<!\d)(\d{1,2}(?:[.,]\d+)?)\s*%", text)
    if not match:
        return None

    try:
        abv = float(match.group(1).replace(",", "."))
    except ValueError:
        return None

    return abv if 0 < abv <= _MAX_PLAUSIBLE_ABV else None


def infer_style(text: str) -> str | None:
    normalized = _normalize(text)
    for style, keywords in STYLE_KEYWORDS.items():
        if any(keyword in normalized for keyword in keywords):
            return style
    return None


def extract_brewery(text: str) -> str | None:
    pattern = re.compile(r"(?:brewery|brewer|brasserie)\s*[:\-]?\s*([\w\-\s]{3,40})", re.IGNORECASE)
    match = pattern.search(text)
    if match:
        return match.group(1).strip()
    return None


def _is_name_candidate(
    line: str, style: str | None, brewery: str | None, *, allow_style: bool = False
) -> bool:
    """Whether an OCR line could be the beer name (not the ABV, brewery, or style).

    ``allow_style`` relaxes the style-keyword exclusion so a style-bearing name
    (e.g. "Punk IPA") is not rejected outright — used only by the fallback pass.
    """
    normalized_line = _normalize(line)
    if len(line) < 3:
        return False
    if "%" in line:
        return False
    # Compare the brewery with the same normalisation as the line (lowercase +
    # collapsed whitespace); ``brewery.lower()`` alone would miss a brewery whose
    # OCR spacing differs from the line's.
    if brewery and _normalize(brewery) in normalized_line:
        return False
    if (
        not allow_style
        and style
        and any(keyword in normalized_line for keyword in STYLE_KEYWORDS.get(style, []))
    ):
        return False
    if re.search(r"\d", line) and len(line) < 6:
        return False
    return True


def _carries_content_beyond_style(line: str, style: str | None) -> bool:
    """True when the line has name content besides the style word itself.

    Distinguishes a style-bearing name ("Punk IPA" -> keep) from a bare style
    label ("IPA" -> drop) once the matched style keyword(s) are removed.
    """
    if not style:
        return True
    remainder = _normalize(line)
    for keyword in STYLE_KEYWORDS.get(style, []):
        remainder = remainder.replace(keyword, " ")
    return len(remainder.strip()) >= 3


def extract_name(text: str, style: str | None, brewery: str | None) -> str | None:
    """Pick the beer name from OCR text.

    Returns the first line that is not the ABV, the brewery, or the style, or
    ``None`` when no line qualifies. Unlike a naive first-line fallback, this
    never returns a ``%``-line or the brewery as the name. When no style-free
    line qualifies, it falls back to a style-*bearing* line ("Punk IPA") that
    still carries content beyond the style word — rather than losing the name.
    """
    lines = [line.strip(" -|\t") for line in text.splitlines() if line.strip()]
    for line in lines:
        if _is_name_candidate(line, style, brewery):
            return line
    for line in lines:
        if _is_name_candidate(
            line, style, brewery, allow_style=True
        ) and _carries_content_beyond_style(line, style):
            return line
    return None


def extract_fields_from_text(text: str) -> ExtractedFields:
    style = infer_style(text)
    brewery = extract_brewery(text)
    abv = extract_abv(text)
    name = extract_name(text, style=style, brewery=brewery)
    return ExtractedFields(name=name, style=style, abv=abv, brewery=brewery)
