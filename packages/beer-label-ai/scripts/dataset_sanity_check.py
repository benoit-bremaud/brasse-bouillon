from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path
from typing import Iterable


ALLOWED_CLASS_IDS = {0}
REQUIRED_SPLITS = ("train", "val")


def iter_files(path: Path, suffixes: tuple[str, ...]) -> Iterable[Path]:
    for file in path.rglob("*"):
        if file.is_file() and file.suffix.lower() in suffixes:
            yield file


def expected_label_path(
    image_file: Path,
    images_root: Path,
    labels_root: Path,
) -> Path:
    relative = image_file.relative_to(images_root)
    return labels_root / relative.with_suffix(".txt")


def is_valid_yolo_line(
    line: str,
    allowed_class_ids: set[int] | None = None,
) -> bool:
    parts = line.strip().split()
    if len(parts) != 5:
        return False

    try:
        class_id = int(parts[0])
        values = [float(x) for x in parts[1:]]
    except ValueError:
        return False

    if class_id < 0:
        return False

    if allowed_class_ids is not None and class_id not in allowed_class_ids:
        return False

    x_center, y_center, width, height = values

    if not (0.0 <= x_center <= 1.0 and 0.0 <= y_center <= 1.0):
        return False

    if not (0.0 < width <= 1.0 and 0.0 < height <= 1.0):
        return False

    return True


def inspect_dataset(dataset_root: Path) -> tuple[Counter, list[str]]:
    stats: Counter = Counter()
    issues: list[str] = []

    images_root = dataset_root / "images"
    labels_root = dataset_root / "labels"

    if not images_root.exists() or not labels_root.exists():
        issues.append("Missing images/ or labels/ directory.")
        return stats, issues

    image_suffixes = (".jpg", ".jpeg", ".png", ".webp")

    image_files = list(iter_files(images_root, image_suffixes))
    stats["images_total"] = len(image_files)

    missing_required_splits = 0
    for split in REQUIRED_SPLITS:
        image_split_dir = images_root / split
        label_split_dir = labels_root / split
        if not image_split_dir.is_dir() or not label_split_dir.is_dir():
            missing_required_splits += 1
            issues.append(
                "Missing required split directories for "
                f"'{split}' (expected {image_split_dir} and "
                f"{label_split_dir})."
            )

    missing_labels = 0
    negative_images = 0
    invalid_label_lines = 0
    unreadable_label_files = 0

    for image_file in image_files:
        label_file = expected_label_path(image_file, images_root, labels_root)
        if not label_file.exists():
            missing_labels += 1
            continue

        try:
            raw_content = label_file.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            unreadable_label_files += 1
            continue

        content = raw_content.strip().splitlines()
        if not content:
            # Empty annotation file is valid for negative images in YOLO.
            negative_images += 1
            continue

        for line in content:
            if not is_valid_yolo_line(
                line,
                allowed_class_ids=ALLOWED_CLASS_IDS,
            ):
                invalid_label_lines += 1

    stats["missing_required_splits"] = missing_required_splits
    stats["missing_labels"] = missing_labels
    stats["negative_images"] = negative_images
    stats["invalid_label_lines"] = invalid_label_lines
    stats["unreadable_label_files"] = unreadable_label_files

    if stats["images_total"] == 0:
        issues.append("No image files found under images/.")

    if missing_labels > 0:
        issues.append(f"Missing label files: {missing_labels}")

    if invalid_label_lines > 0:
        issues.append(f"Invalid YOLO label lines: {invalid_label_lines}")

    if unreadable_label_files > 0:
        issues.append(f"Unreadable label files: {unreadable_label_files}")

    return stats, issues


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Sprint 1 dataset sanity checker",
    )
    parser.add_argument(
        "--dataset",
        required=True,
        help="Path to dataset root",
    )
    args = parser.parse_args()

    dataset_root = Path(args.dataset).resolve()
    stats, issues = inspect_dataset(dataset_root)

    print("Dataset sanity report")
    print("-" * 40)
    for key in sorted(stats.keys()):
        print(f"{key}: {stats[key]}")

    if issues:
        print("\nIssues:")
        for issue in issues:
            print(f"- {issue}")
        raise SystemExit(1)

    print("\nStatus: OK")


if __name__ == "__main__":
    main()
