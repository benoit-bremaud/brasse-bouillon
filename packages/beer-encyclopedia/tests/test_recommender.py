from ml.recommender import load_recipes, recommend_recipes, score_recipe
from ml.schemas import ExtractedFields, Recipe


def test_recommender_returns_top_3_sorted():
    recipes = load_recipes("data/recipes.sample.json")
    extracted = ExtractedFields(style="ipa", abv=5.0)

    suggestions = recommend_recipes(extracted=extracted, recipes=recipes, top_n=3)

    assert len(suggestions) == 3
    assert suggestions[0].score >= suggestions[1].score >= suggestions[2].score
    assert suggestions[0].recipe.style in {"ipa", "blonde", "sour"}


def _ipa_recipe(ibu: float | None) -> Recipe:
    return Recipe(id="r1", name="Test IPA", style="ipa", abv=6.0, ibu=ibu)


def test_ibu_no_longer_affects_the_score():
    # Regression: the IBU term was a constant 0.5 fed a missing extracted IBU,
    # so it only diluted the real signals. IBU is now excluded from the blend.
    extracted = ExtractedFields(style="ipa", abv=6.0)
    scores = {score_recipe(extracted, _ipa_recipe(ibu))[0] for ibu in (None, 10.0, 45.0, 90.0)}
    assert len(scores) == 1


def test_no_misleading_ibu_match_reason():
    extracted = ExtractedFields(style="ipa", abv=6.0)
    _, reasons = score_recipe(extracted, _ipa_recipe(ibu=45.0))
    assert not any("IBU" in reason for reason in reasons)


def test_exact_style_and_abv_match_scores_one():
    # 0.70 * 1.0 (exact style) + 0.30 * 1.0 (exact ABV) == 1.0
    extracted = ExtractedFields(style="ipa", abv=6.0)
    score, _ = score_recipe(extracted, _ipa_recipe(ibu=None))
    assert score == 1.0
