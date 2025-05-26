// controllers/recipeController.js

const db = require('../models');
const Recipe = db.Recipe; 
const RecipeIngredient = db.RecipeIngredient;
const Ingredient = db.Ingredient;

/**
 * GET /recipes
 * Fetch all recipes
 */
const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll();
    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * GET /recipes/:id
 * Fetch a specific recipe by ID with its associated ingredients
 */
const getRecipeById = async (req, res) => {
  const { id } = req.params;

  try {
    const recipe = await Recipe.findByPk(id, {
      include: {
        model: Ingredient,
        through: { attributes: ['quantity', 'unit'] },
      },
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.status(200).json(recipe);
  } catch (error) {
    console.error('Error fetching recipe by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


/**
 * POST /recipes
 * Create a new recipe (requires authentication)
 */
const createRecipe = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware
    const { name, description, instructions, abv, ibu, ingredients } = req.body;

    // Minimal validation
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required.' });
    }

    // Create the recipe
    const newRecipe = await Recipe.create({
      name,
      description,
      instructions,
      abv,
      ibu,
      userId, // Associate recipe with the user
    });

    // If ingredients are provided, create entries in RecipeIngredient
    if (Array.isArray(ingredients) && ingredients.length > 0) {
      const ingredientEntries = ingredients.map((item) => ({
        recipeId: newRecipe.id,
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        unit: item.unit,
      }));

      await RecipeIngredient.bulkCreate(ingredientEntries);
    }

    res.status(201)
      .location(`/recipes/${newRecipe.id}`)
      .json({
      message: '✅ Recipe successfully created.',
      received: newRecipe
    });
  } catch (error) {
    console.error('Error in createRecipe:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getAllRecipes,
  createRecipe,
  getRecipeById
};