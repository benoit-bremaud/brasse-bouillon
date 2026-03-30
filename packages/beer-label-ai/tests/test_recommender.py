from ml.recommender import load_recipes, recommend_recipes
from ml.schemas import ExtractedFields


def test_recommender_returns_top_3_sorted():
    recipes = load_recipes("data/recipes.sample.json")
    extracted = ExtractedFields(style="ipa", abv=5.0)

    suggestions = recommend_recipes(extracted=extracted, recipes=recipes, top_n=3)

    assert len(suggestions) == 3
    assert suggestions[0].score >= suggestions[1].score >= suggestions[2].score
    assert suggestions[0].recipe.style in {"ipa", "blonde", "sour"}
