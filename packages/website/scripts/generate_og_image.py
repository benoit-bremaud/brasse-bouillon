#!/usr/bin/env python3
"""Regenerate the Open Graph / Twitter Card image (`og-image.png`).

The card is a brand-consistent 1200x630 composition — the transparent mascot
(`logo-hero.webp`) on the left, the wordmark + tagline + domain on the right,
over the paper background — flattened to RGB and colour-quantised so the PNG
stays well under the 100 KB social-card weight budget.

Run from anywhere:

    python3 scripts/generate_og_image.py

Dependencies: Pillow, plus a serif + sans TrueType face available on the
machine (Noto is preferred, DejaVu is the fallback). This is a dev-time asset
utility — it is NOT part of CI; commit the regenerated PNG alongside any change
to the brand tokens or the source art.
"""

from __future__ import annotations

import logging
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger(__name__)

WEBSITE = Path(__file__).resolve().parent.parent
OUTPUT = WEBSITE / "og-image.png"
MASCOT = WEBSITE / "logo-hero.webp"

WIDTH, HEIGHT = 1200, 630
SIZE_BUDGET_BYTES = 100 * 1024

# Brand tokens (mirrors site.css :root).
PAPER = (241, 227, 191)  # --paper #f1e3bf
COPPER = (197, 116, 45)  # --copper #c5742d
COPPER_DEEP = (141, 74, 19)  # --copper-deep #8d4a13
INK_SOFT = (58, 40, 24)  # --ink-soft #3a2818

# Font candidates, most-preferred first. Noto Serif stands in for the brand
# display face (Fraunces); Noto Sans for the body face (Inter).
SERIF_CANDIDATES = [
    "/usr/share/fonts/truetype/noto/NotoSerif-Black.ttf",
    "/usr/share/fonts/truetype/noto/NotoSerif-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
]
SANS_MEDIUM_CANDIDATES = [
    "/usr/share/fonts/truetype/noto/NotoSans-Medium.ttf",
    "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]
SANS_SEMIBOLD_CANDIDATES = [
    "/usr/share/fonts/truetype/noto/NotoSans-SemiBold.ttf",
    "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]

WORDMARK = "Brasse-Bouillon"
TAGLINE = "Application de brassage amateur"
DOMAIN = "brasse-bouillon.com"


def _resolve_font_path(candidates: list[str]) -> str:
    for candidate in candidates:
        if Path(candidate).exists():
            return candidate
    raise FileNotFoundError(
        "No usable TrueType font found. Install the Noto or DejaVu families, "
        f"or edit the candidate lists. Tried: {', '.join(candidates)}"
    )


def _fit_font(
    path: str, text: str, max_width: int, start: int, min_size: int = 20
) -> ImageFont.FreeTypeFont:
    """Largest font (<= ``start`` px) whose ``text`` fits within ``max_width``."""
    size = start
    while size > min_size:
        font = ImageFont.truetype(path, size)
        if font.getlength(text) <= max_width:
            return font
        size -= 2
    return ImageFont.truetype(path, min_size)


def _text_size(
    draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont
) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0], box[3] - box[1]


def build_card() -> Image.Image:
    serif = _resolve_font_path(SERIF_CANDIDATES)
    sans_medium = _resolve_font_path(SANS_MEDIUM_CANDIDATES)
    sans_semibold = _resolve_font_path(SANS_SEMIBOLD_CANDIDATES)

    canvas = Image.new("RGB", (WIDTH, HEIGHT), PAPER)
    draw = ImageDraw.Draw(canvas)
    draw.rectangle([12, 12, WIDTH - 13, HEIGHT - 13], outline=COPPER, width=3)

    # Mascot (left): transparent hero art, trimmed of its margins then scaled.
    mascot = Image.open(MASCOT).convert("RGBA")
    mascot = mascot.crop(mascot.getbbox())
    mascot_h = 360
    mascot_w = round(mascot.width * mascot_h / mascot.height)
    mascot = mascot.resize((mascot_w, mascot_h), Image.LANCZOS)

    gap = 56
    text_max_w = WIDTH - 90 - mascot_w - gap - 90

    font_word = _fit_font(serif, WORDMARK, text_max_w, start=104)
    font_tag = _fit_font(sans_medium, TAGLINE, text_max_w, start=38)
    font_dom = _fit_font(sans_semibold, DOMAIN, text_max_w, start=30)

    word_w, word_h = _text_size(draw, WORDMARK, font_word)
    tag_w, tag_h = _text_size(draw, TAGLINE, font_tag)
    dom_w, dom_h = _text_size(draw, DOMAIN, font_dom)

    rule_h = 5
    gap_word_rule = 26
    gap_rule_tag = 26
    gap_tag_dom = 30
    rule_w = max(140, min(word_w, 260))

    text_block_h = (
        word_h + gap_word_rule + rule_h + gap_rule_tag + tag_h + gap_tag_dom + dom_h
    )
    text_col_w = max(word_w, tag_w, dom_w, rule_w)

    group_w = mascot_w + gap + text_col_w
    group_x = (WIDTH - group_w) // 2
    group_cy = HEIGHT // 2

    canvas.paste(mascot, (group_x, group_cy - mascot_h // 2), mascot)

    tx = group_x + mascot_w + gap
    ty = group_cy - text_block_h // 2
    draw.text((tx, ty), WORDMARK, font=font_word, fill=COPPER_DEEP)
    y = ty + word_h + gap_word_rule
    draw.rectangle([tx, y, tx + rule_w, y + rule_h], fill=COPPER)
    y += rule_h + gap_rule_tag
    draw.text((tx, y), TAGLINE, font=font_tag, fill=INK_SOFT)
    y += tag_h + gap_tag_dom
    draw.text((tx, y), DOMAIN, font=font_dom, fill=COPPER)

    return canvas


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    card = build_card()

    # Quantise progressively until the PNG fits the social-card weight budget.
    for colors in (256, 200, 160, 128, 96):
        card.quantize(colors=colors, method=Image.FASTOCTREE).save(
            OUTPUT, format="PNG", optimize=True
        )
        size = OUTPUT.stat().st_size
        if size <= SIZE_BUDGET_BYTES:
            logger.info(
                "Wrote %s (%dx%d, %d colours, %.1f KB)",
                OUTPUT.name,
                WIDTH,
                HEIGHT,
                colors,
                size / 1024,
            )
            return

    raise RuntimeError(
        f"Could not fit {OUTPUT.name} under {SIZE_BUDGET_BYTES // 1024} KB "
        "even at 96 colours; revisit the composition."
    )


if __name__ == "__main__":
    main()
