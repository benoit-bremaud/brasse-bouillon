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

module.exports = {
  getAllRecipes,
};
