from pathlib import Path

from scripts.dataset_sanity_check import inspect_dataset


def _create_required_split_dirs(tmp_path: Path) -> tuple[Path, Path]:
    images_train = tmp_path / "images" / "train"
    labels_train = tmp_path / "labels" / "train"
    images_val = tmp_path / "images" / "val"
    labels_val = tmp_path / "labels" / "val"

    for directory in (images_train, labels_train, images_val, labels_val):
        directory.mkdir(parents=True, exist_ok=True)

    return images_train, labels_train


def test_inspect_dataset_reports_missing_root_structure(tmp_path: Path):
    stats, issues = inspect_dataset(tmp_path)

    assert stats == {}
    assert "Missing images/ or labels/ directory." in issues


def test_inspect_dataset_valid_minimal_layout(tmp_path: Path):
    images_train, labels_train = _create_required_split_dirs(tmp_path)

    image_file = images_train / "sample_001.jpg"
    label_file = labels_train / "sample_001.txt"

    image_file.write_bytes(b"fake")
    label_file.write_text("0 0.5 0.5 0.4 0.4\n", encoding="utf-8")

    stats, issues = inspect_dataset(tmp_path)

    assert stats["images_total"] == 1
    assert stats["missing_required_splits"] == 0
    assert stats["missing_labels"] == 0
    assert stats["negative_images"] == 0
    assert stats["invalid_label_lines"] == 0
    assert stats["unreadable_label_files"] == 0
    assert issues == []


def test_inspect_dataset_accepts_empty_label_as_negative_image(tmp_path: Path):
    images_train, labels_train = _create_required_split_dirs(tmp_path)

    image_file = images_train / "sample_001.jpg"
    label_file = labels_train / "sample_001.txt"

    image_file.write_bytes(b"fake")
    label_file.write_text("\n", encoding="utf-8")

    stats, issues = inspect_dataset(tmp_path)

    assert stats["images_total"] == 1
    assert stats["missing_required_splits"] == 0
    assert stats["missing_labels"] == 0
    assert stats["negative_images"] == 1
    assert stats["invalid_label_lines"] == 0
    assert stats["unreadable_label_files"] == 0
    assert issues == []


def test_inspect_dataset_rejects_non_zero_class_id_for_sprint1(tmp_path: Path):
    images_train, labels_train = _create_required_split_dirs(tmp_path)

    image_file = images_train / "sample_001.jpg"
    label_file = labels_train / "sample_001.txt"

    image_file.write_bytes(b"fake")
    label_file.write_text("1 0.5 0.5 0.4 0.4\n", encoding="utf-8")

    stats, issues = inspect_dataset(tmp_path)

    assert stats["images_total"] == 1
    assert stats["missing_required_splits"] == 0
    assert stats["missing_labels"] == 0
    assert stats["negative_images"] == 0
    assert stats["invalid_label_lines"] == 1
    assert stats["unreadable_label_files"] == 0
    assert "Invalid YOLO label lines: 1" in issues


def test_inspect_dataset_reports_missing_label_file(tmp_path: Path):
    images_train, _ = _create_required_split_dirs(tmp_path)

    image_file = images_train / "sample_001.jpg"
    image_file.write_bytes(b"fake")

    stats, issues = inspect_dataset(tmp_path)

    assert stats["images_total"] == 1
    assert stats["missing_required_splits"] == 0
    assert stats["missing_labels"] == 1
    assert stats["negative_images"] == 0
    assert stats["invalid_label_lines"] == 0
    assert stats["unreadable_label_files"] == 0
    assert "Missing label files: 1" in issues


def test_inspect_dataset_reports_invalid_yolo_line(tmp_path: Path):
    images_train, labels_train = _create_required_split_dirs(tmp_path)

    image_file = images_train / "sample_001.jpg"
    label_file = labels_train / "sample_001.txt"

    image_file.write_bytes(b"fake")
    label_file.write_text("not_a_valid_yolo_line\n", encoding="utf-8")

    stats, issues = inspect_dataset(tmp_path)

    assert stats["images_total"] == 1
    assert stats["missing_required_splits"] == 0
    assert stats["missing_labels"] == 0
    assert stats["negative_images"] == 0
    assert stats["invalid_label_lines"] == 1
    assert stats["unreadable_label_files"] == 0
    assert "Invalid YOLO label lines: 1" in issues


def test_inspect_dataset_rejects_zero_width_box(tmp_path: Path):
    images_train, labels_train = _create_required_split_dirs(tmp_path)

    image_file = images_train / "sample_001.jpg"
    label_file = labels_train / "sample_001.txt"

    image_file.write_bytes(b"fake")
    label_file.write_text("0 0.5 0.5 0.0 0.4\n", encoding="utf-8")

    stats, issues = inspect_dataset(tmp_path)

    assert stats["images_total"] == 1
    assert stats["missing_required_splits"] == 0
    assert stats["missing_labels"] == 0
    assert stats["negative_images"] == 0
    assert stats["invalid_label_lines"] == 1
    assert stats["unreadable_label_files"] == 0
    assert "Invalid YOLO label lines: 1" in issues


def test_inspect_dataset_reports_missing_required_split(tmp_path: Path):
    images_train = tmp_path / "images" / "train"
    labels_train = tmp_path / "labels" / "train"
    images_train.mkdir(parents=True, exist_ok=True)
    labels_train.mkdir(parents=True, exist_ok=True)

    image_file = images_train / "sample_001.jpg"
    label_file = labels_train / "sample_001.txt"

    image_file.write_bytes(b"fake")
    label_file.write_text("0 0.5 0.5 0.4 0.4\n", encoding="utf-8")

    stats, issues = inspect_dataset(tmp_path)

    assert stats["images_total"] == 1
    assert stats["missing_required_splits"] == 1
    assert stats["missing_labels"] == 0
    assert stats["negative_images"] == 0
    assert stats["invalid_label_lines"] == 0
    assert stats["unreadable_label_files"] == 0
    assert "Missing required split directories for 'val'" in " ".join(issues)


def test_inspect_dataset_reports_unreadable_label_file(tmp_path: Path):
    images_train, labels_train = _create_required_split_dirs(tmp_path)

    image_file = images_train / "sample_001.jpg"
    label_file = labels_train / "sample_001.txt"

    image_file.write_bytes(b"fake")
    label_file.write_bytes(b"\xff\xfe\xfd")

    stats, issues = inspect_dataset(tmp_path)

    assert stats["images_total"] == 1
    assert stats["missing_required_splits"] == 0
    assert stats["missing_labels"] == 0
    assert stats["negative_images"] == 0
    assert stats["invalid_label_lines"] == 0
    assert stats["unreadable_label_files"] == 1
    assert "Unreadable label files: 1" in issues
