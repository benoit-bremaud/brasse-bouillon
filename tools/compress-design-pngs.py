#!/usr/bin/env python3
"""Compress PNGs in place using Pillow adaptive palette (256 colors).

Walks a folder for *.png files, quantizes each to a 256-color adaptive
palette, and rewrites the file in place. Reports per-file before/after
sizes and a summary.

By default the run fails (exit code 1) when any file is still above the
documented policy threshold (4 MB) after compression, so the helper can
be wired into a pre-commit hook or CI check.

Requires Pillow:
    python3 -m pip install --user pillow

Usage:
    python3 tools/compress-design-pngs.py docs/design
    python3 tools/compress-design-pngs.py docs/design --max-mb 2
    python3 tools/compress-design-pngs.py docs/design --sample-top-n 3
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image

DEFAULT_MAX_MB = 4.0


def compress_png(path: Path) -> tuple[int, int]:
    before = path.stat().st_size
    with Image.open(path) as img:
        mode = img.mode
        if mode == "RGBA":
            quantized = img.quantize(
                colors=256,
                method=Image.Quantize.FASTOCTREE,
                dither=Image.Dither.FLOYDSTEINBERG,
            )
        elif mode == "P":
            quantized = img.quantize(colors=256)
        else:
            quantized = img.convert("RGB").quantize(
                colors=256, method=Image.Quantize.FASTOCTREE
            )
        quantized.save(path, optimize=True)
    return before, path.stat().st_size


def run(root: Path, max_mb: float, sample_top_n: int) -> int:
    pngs = sorted(root.rglob("*.png"))
    if sample_top_n > 0:
        pngs = sorted(pngs, key=lambda p: p.stat().st_size, reverse=True)[
            :sample_top_n
        ]

    max_bytes = int(max_mb * 1024 * 1024)
    total_before = 0
    total_after = 0
    errors: list[tuple[Path, str]] = []
    violators: list[tuple[Path, int]] = []

    for png in pngs:
        try:
            before, after = compress_png(png)
        except Exception as exc:
            errors.append((png, str(exc)))
            print(f"ERROR {png}: {exc}", file=sys.stderr)
            continue
        total_before += before
        total_after += after
        gain = 100 * (before - after) / before if before else 0
        print(
            f"{png}: {before / 1024 / 1024:.2f}MB -> "
            f"{after / 1024 / 1024:.2f}MB ({gain:.0f}%)"
        )
        if after > max_bytes:
            violators.append((png, after))

    print("\n=== SUMMARY ===")
    print(f"Files processed: {len(pngs) - len(errors)}/{len(pngs)}")
    print(f"Before: {total_before / 1024 / 1024:.1f} MB")
    print(f"After:  {total_after / 1024 / 1024:.1f} MB")
    if total_before:
        pct = 100 * (total_before - total_after) / total_before
        saved = (total_before - total_after) / 1024 / 1024
        print(f"Saved:  {saved:.1f} MB ({pct:.1f}%)")

    if errors:
        print(f"\n{len(errors)} error(s):")
        for path, msg in errors:
            print(f"  {path}: {msg}")

    if violators:
        print(f"\n{len(violators)} file(s) exceed the {max_mb} MB policy:")
        for path, size in sorted(violators, key=lambda x: x[1], reverse=True):
            print(f"  {size / 1024 / 1024:.2f} MB  {path}")
        print(
            "Tighten compression manually (e.g. fewer palette colors, "
            "downscale dimensions) or override with --max-mb."
        )

    return 1 if errors or violators else 0


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Compress PNGs in place under a folder.",
    )
    parser.add_argument(
        "root",
        nargs="?",
        type=Path,
        default=Path("docs/design"),
        help="Folder to walk (default: docs/design).",
    )
    parser.add_argument(
        "--max-mb",
        type=float,
        default=DEFAULT_MAX_MB,
        help=(
            f"Maximum allowed size in MB per PNG after compression "
            f"(default: {DEFAULT_MAX_MB}). Files above this threshold are "
            "reported and the run exits non-zero."
        ),
    )
    parser.add_argument(
        "--sample-top-n",
        type=int,
        default=0,
        help=(
            "If >0, restrict processing to the N largest PNGs in the folder. "
            "Useful for testing compression settings on the worst cases first. "
            "Files are still rewritten in place; this is not a dry run."
        ),
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv if argv is not None else sys.argv[1:])
    return run(args.root, args.max_mb, args.sample_top_n)


if __name__ == "__main__":
    sys.exit(main())
