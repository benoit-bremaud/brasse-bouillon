// controllers/ingredientController.js

const db = require('../models');
const Ingredient = db.Ingredient;

/**
 * GET /ingredients
 * Fetch all ingredients
 */
const getAllIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.findAll();
    res.status(200).json(ingredients);
  } catch (error) {
    console.error('❌ Error fetching ingredients:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getAllIngredients,
};
