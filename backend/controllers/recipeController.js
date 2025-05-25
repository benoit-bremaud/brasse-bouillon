// controllers/recipeController.js

const db = require('../models');
const Recipe = db.Recipe;

/**
 * GET /recipes
 * Fetch all recipes
 */
const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll();
    res.status(200).json(recipes);
  } catch (error) {
    console.error('❌ Error fetching recipes:', error);
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
    const { name, description, instructions, abv, ibu } = req.body;

    // Minimal validation
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required.' });
    }

    const newRecipe = await Recipe.create({
      name,
      description,
      instructions,
      abv,
      ibu,
      userId, // Associate recipe with the user
    });
    
    res.status(200).json({
      message: '✅ Recipe successfully created.',
      received: newRecipe
    });
  } catch (error) {
    console.error('❌ Error in createRecipe:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getAllRecipes,
  createRecipe,
};