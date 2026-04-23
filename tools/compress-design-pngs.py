#!/usr/bin/env python3
"""Compress PNGs in place using Pillow adaptive palette (256 colors)."""
import sys
from pathlib import Path
from PIL import Image


def compress_png(path: Path) -> tuple[int, int]:
    before = path.stat().st_size
    img = Image.open(path)
    mode = img.mode
    if mode == "RGBA":
        img = img.quantize(
            colors=256,
            method=Image.Quantize.FASTOCTREE,
            dither=Image.Dither.FLOYDSTEINBERG,
        )
    elif mode == "P":
        img = img.quantize(colors=256)
    else:
        img = img.convert("RGB").quantize(
            colors=256, method=Image.Quantize.FASTOCTREE
        )
    img.save(path, optimize=True)
    return before, path.stat().st_size


def main(root: Path, dry_run_sample: int = 0) -> int:
    pngs = sorted(root.rglob("*.png"))
    if dry_run_sample > 0:
        pngs = sorted(pngs, key=lambda p: p.stat().st_size, reverse=True)[
            :dry_run_sample
        ]
    total_before = 0
    total_after = 0
    errors: list[tuple[Path, str]] = []
    for png in pngs:
        try:
            before, after = compress_png(png)
            total_before += before
            total_after += after
            gain = 100 * (before - after) / before if before else 0
            print(
                f"{png}: {before / 1024 / 1024:.2f}MB -> "
                f"{after / 1024 / 1024:.2f}MB ({gain:.0f}%)"
            )
        except Exception as exc:
            errors.append((png, str(exc)))
            print(f"ERROR {png}: {exc}", file=sys.stderr)
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
        for p, e in errors:
            print(f"  {p}: {e}")
        return 1
    return 0


if __name__ == "__main__":
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("docs/design")
    sample = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    sys.exit(main(root, sample))
