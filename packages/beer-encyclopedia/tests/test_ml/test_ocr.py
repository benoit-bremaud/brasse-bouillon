"""Regression tests for ``ml/ocr.py``.

The single most important behavioural property guarded here is that
EasyOCR is called with ``paragraph=False``. Setting it to ``True`` (the
historical state of the file before #861) silently dropped every
result on real-world dispersed beer-label photos. Anyone who later
re-enables ``paragraph=True`` thinking it looks cleaner must trip
these tests immediately, not discover the regression in production by
seeing scans return ``detected_text=""``.

Tests stub ``ml.ocr._get_reader`` with a ``MagicMock`` so the real
EasyOCR model never loads — they verify the ``readtext`` argument
contract, not the ML output.
"""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import numpy as np

from ml.ocr import _read_text


def _make_easyocr_result(text: str, conf: float) -> list:
    """Return a value shaped like EasyOCR's ``readtext`` output."""

    bbox = [[0, 0], [10, 0], [10, 10], [0, 10]]
    return [(bbox, text, conf)]


def _build_crop() -> np.ndarray:
    """Return a small non-empty crop the function will accept."""

    return np.zeros((20, 20, 3), dtype=np.uint8) + 1


def test_read_text_calls_easyocr_with_paragraph_false_on_first_pass() -> None:
    """The raw read must use ``paragraph=False``.

    This is the regression guard that closes the original bug fixed in
    PR #861. Forcing ``paragraph=True`` regroups EasyOCR's per-region
    results into "paragraphs" — a heuristic that fails systematically
    on dispersed beer-label text and silently returns an empty list.
    """

    fake_reader = MagicMock()
    fake_reader.readtext.return_value = _make_easyocr_result("hello", 0.85)

    with patch("ml.ocr._get_reader", return_value=fake_reader):
        text, conf, notes = _read_text(_build_crop(), ("en", "fr"))

    fake_reader.readtext.assert_called_once()
    call_kwargs = fake_reader.readtext.call_args.kwargs
    assert call_kwargs.get("paragraph") is False, (
        "ml/ocr.py must call readtext with paragraph=False — see the "
        "comment in _read_text for the empirical justification."
    )
    assert text == "hello"
    assert conf == 0.85
    assert notes == []


def test_read_text_uses_paragraph_false_in_preprocessed_retry() -> None:
    """The preprocessed retry must also use ``paragraph=False``.

    When the raw read returns no text, the OCR layer falls back to a
    bilateral-filtered + adaptive-thresholded crop and tries again. If
    only one of the two ``readtext`` call sites is fixed to
    ``paragraph=False``, real photos that need preprocessing would
    silently regress.
    """

    fake_reader = MagicMock()
    fake_reader.readtext.side_effect = [
        [],  # raw pass: empty
        _make_easyocr_result("found-after-preprocess", 0.7),  # retry hits
    ]

    with patch("ml.ocr._get_reader", return_value=fake_reader):
        text, conf, notes = _read_text(_build_crop(), ("en", "fr"))

    assert fake_reader.readtext.call_count == 2
    for call in fake_reader.readtext.call_args_list:
        assert call.kwargs.get("paragraph") is False, (
            "Both the raw and preprocessed readtext calls in "
            "ml/ocr.py must use paragraph=False."
        )
    assert text == "found-after-preprocess"
    assert "OCR succeeded after preprocessing." in notes


def test_read_text_returns_empty_when_both_passes_find_nothing() -> None:
    """The two-pass fallback returns a typed empty result, not None.

    Defensive guard so callers can always rely on the
    ``(str, float, list[str])`` shape regardless of what EasyOCR did.
    """

    fake_reader = MagicMock()
    fake_reader.readtext.side_effect = [[], []]

    with patch("ml.ocr._get_reader", return_value=fake_reader):
        text, conf, notes = _read_text(_build_crop(), ("en", "fr"))

    assert text == ""
    assert conf == 0.0
    assert "No OCR text extracted." in notes


def test_read_text_short_circuits_on_empty_crop() -> None:
    """An empty crop bypasses EasyOCR entirely with a recorded note."""

    empty = np.zeros((0, 0, 3), dtype=np.uint8)
    fake_reader = MagicMock()

    with patch("ml.ocr._get_reader", return_value=fake_reader):
        text, conf, notes = _read_text(empty, ("en", "fr"))

    fake_reader.readtext.assert_not_called()
    assert text == ""
    assert conf == 0.0
    assert "Empty crop for OCR." in notes
