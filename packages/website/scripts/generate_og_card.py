#!/usr/bin/env python3
"""Regenerate the localized EN Open Graph card from the FR master card.

Authoring-time helper, NOT wired to CI (it needs Pillow, and the gate stays
dependency-free — precedent: fetch_fonts.py). The FR card `og-image.png` is
the design master (mascot, gradient, underlined wordmark); this script keeps
everything byte-identical except the tagline zone, which it inpaints from the
surrounding gradient and re-sets in English.

Usage:
    python3 scripts/generate_og_card.py    # rewrites og-image-en.png

After running, bump the `head.ogImage` cache-bust in i18n/home.en.json and
regenerate en.html (`python3 scripts/build_i18n.py`).
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

WEBSITE_DIR = Path(__file__).resolve().parent.parent
SRC = WEBSITE_DIR / "og-image.png"
DST = WEBSITE_DIR / "og-image-en.png"

# Metrics measured on the FR master (2026-07-13): tagline ink is the site's
# --copper-deep token; the two FR tagline lines start at x=517, tops y=321 and
# y=381 (60px leading); the zone below covers both lines incl. descenders.
TAGLINE_INK = (141, 74, 19)
TAGLINE_ZONE = (500, 310, 975, 425)  # x0, y0, x1, y1
X_LEFT, Y1_TOP, Y2_TOP = 517, 321, 381
TITLE_RIGHT_EDGE = 1131  # the underlined wordmark's right edge — do not outrun
# DejaVu Sans Bold matches the FR master's tagline. Overridable for non-Linux
# hosts (`OG_CARD_FONT=/path/to/DejaVuSans-Bold.ttf`), but byte-identical
# reproduction of the committed card requires the same font file.
FONT_PATH = os.environ.get(
    "OG_CARD_FONT", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
)

LINE1 = "The curious homebrewer's"
LINE2 = "companion app"


def main() -> int:
    if not Path(FONT_PATH).exists():
        raise SystemExit(
            f"generate_og_card: font not found: {FONT_PATH} "
            "(point OG_CARD_FONT at a DejaVuSans-Bold.ttf)"
        )

    img = Image.open(SRC).convert("RGB")
    px = img.load()

    # Inpaint the tagline zone: per-row linear interpolation between the
    # untouched gradient just left and right of the zone (the backdrop is a
    # smooth diagonal gradient, so the seam is invisible).
    x0, y0, x1, y1 = TAGLINE_ZONE
    for y in range(y0, y1):
        c_left, c_right = px[x0 - 4, y], px[x1 + 4, y]
        span = x1 - x0
        for x in range(x0, x1):
            t = (x - x0) / span
            px[x, y] = tuple(
                round(c_left[i] + (c_right[i] - c_left[i]) * t) for i in range(3)
            )

    # Largest size whose first line stays within the wordmark's right edge.
    draw = ImageDraw.Draw(img)
    size = 46
    while size > 30:
        font = ImageFont.truetype(FONT_PATH, size)
        if X_LEFT + draw.textlength(LINE1, font=font) <= TITLE_RIGHT_EDGE:
            break
        size -= 1

    draw.text((X_LEFT, Y1_TOP), LINE1, fill=TAGLINE_INK, font=font, anchor="la")
    draw.text((X_LEFT, Y2_TOP), LINE2, fill=TAGLINE_INK, font=font, anchor="la")
    img.save(DST, "PNG", optimize=True)
    print(f"Wrote {DST.relative_to(WEBSITE_DIR)} (tagline size {size})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
