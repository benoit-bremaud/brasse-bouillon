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


def extract_abv(text: str) -> float | None:
    match = re.search(r"(\d{1,2}(?:[\.,]\d)?)\s*%", text)
    if not match:
        return None

    try:
        return float(match.group(1).replace(",", "."))
    except ValueError:
        return None


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


def extract_name(text: str, style: str | None, brewery: str | None) -> str | None:
    lines = [line.strip(" -|\t") for line in text.splitlines() if line.strip()]
    for line in lines:
        normalized_line = _normalize(line)
        if len(line) < 3:
            continue
        if "%" in line:
            continue
        if brewery and brewery.lower() in normalized_line:
            continue
        if style and any(keyword in normalized_line for keyword in STYLE_KEYWORDS.get(style, [])):
            continue
        if re.search(r"\d", line) and len(line) < 6:
            continue
        return line
    return lines[0] if lines else None


def extract_fields_from_text(text: str) -> ExtractedFields:
    style = infer_style(text)
    brewery = extract_brewery(text)
    abv = extract_abv(text)
    name = extract_name(text, style=style, brewery=brewery)
    return ExtractedFields(name=name, style=style, abv=abv, brewery=brewery)
