from __future__ import annotations

import json
from collections.abc import Sequence
from pathlib import Path

from ml.schemas import ExtractedFields, Recipe, RecipeSuggestion


def load_recipes(path: str | Path) -> list[Recipe]:
    recipe_file = Path(path)
    if not recipe_file.exists():
        raise FileNotFoundError(f"Recipe file not found: {recipe_file}")

    data = json.loads(recipe_file.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("Recipe file must contain a JSON list.")

    return [Recipe(**item) for item in data]


def _style_score(extracted_style: str | None, recipe_style: str | None) -> float:
    if not recipe_style:
        return 0.0
    if not extracted_style:
        return 0.35

    left = extracted_style.lower().strip()
    right = recipe_style.lower().strip()
    if left == right:
        return 1.0

    close_families = {
        ("ipa", "sour"),
        ("sour", "ipa"),
        ("lager", "amber_ale"),
        ("amber_ale", "lager"),
        ("lager", "wheat"),
        ("wheat", "lager"),
        ("stout", "amber_ale"),
        ("amber_ale", "stout"),
        ("tripel", "saison"),
        ("saison", "tripel"),
    }

    return 0.6 if (left, right) in close_families else 0.15


def _numeric_score(value_a: float | None, value_b: float | None, tolerated_gap: float) -> float:
    if value_a is None or value_b is None:
        return 0.5

    gap = abs(value_a - value_b)
    return max(0.0, 1.0 - min(gap / tolerated_gap, 1.0))


def score_recipe(extracted: ExtractedFields, recipe: Recipe) -> tuple[float, list[str]]:
    """Score how well ``recipe`` matches the ``extracted`` label fields.

    The score blends the style match (0.70) and the ABV proximity (0.30),
    clamped to ``[0, 1]``. IBU is intentionally not scored: the label extractor
    does not produce an IBU value yet, so weighting ``recipe.ibu`` against a
    missing input only added a constant that diluted the real signals. Re-add an
    IBU term here once ``ExtractedFields`` carries a parsed IBU.

    Returns:
        A ``(score, reasons)`` tuple; ``reasons`` explains the match to the user.
    """
    style_score = _style_score(extracted.style, recipe.style)
    abv_score = _numeric_score(extracted.abv, recipe.abv, tolerated_gap=5.0)

    total = 0.70 * style_score + 0.30 * abv_score
    total = max(0.0, min(1.0, total))

    reasons: list[str] = []
    if extracted.style and recipe.style:
        reasons.append(f"Detected style: {extracted.style} vs recipe style: {recipe.style}")
    if extracted.abv is not None and recipe.abv is not None:
        reasons.append(f"ABV proximity ({extracted.abv:.1f}% vs {recipe.abv:.1f}%)")

    return total, reasons


def recommend_recipes(
    extracted: ExtractedFields,
    recipes: Sequence[Recipe],
    top_n: int = 3,
) -> list[RecipeSuggestion]:
    scored: list[RecipeSuggestion] = []
    for recipe in recipes:
        score, reasons = score_recipe(extracted, recipe)
        scored.append(
            RecipeSuggestion(
                recipe=recipe,
                score=round(score, 4),
                match_reasons=reasons,
            )
        )

    scored.sort(key=lambda item: item.score, reverse=True)
    return list(scored[: max(1, top_n)])
