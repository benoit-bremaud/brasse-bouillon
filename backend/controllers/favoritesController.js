/**
 * Favorites Controller
 * Handles the logic for adding and retrieving favorite recipes for a user
 */

const { User, Recipe } = require('../models');

/**
 * @route   POST /favorites/:recipeId
 * @desc    Add a recipe to the authenticated user's favorites
 * @access  Private (requires authMiddleware)
 */
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const recipeId = parseInt(req.params.recipeId, 10);

    // Check if the recipe exists
    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Get the authenticated user
    const user = await User.findByPk(userId);

    // Check if the recipe is already in favorites
    const isAlreadyFavorite = await user.hasFavorite(recipeId);
    if (isAlreadyFavorite) {
      return res.status(409).json({ message: 'Recipe is already in favorites' });
    }

    // Add the recipe to favorites
    await user.addFavorite(recipeId);
    return res.status(201).json({ message: 'Recipe successfully added to favorites' });

  } catch (error) {
    console.error('Error adding recipe to favorites:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @route   GET /favorites
 * @desc    Retrieve all favorite recipes for the authenticated user
 * @access  Private (requires authMiddleware)
 */
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get the user along with their favorite recipes
    const user = await User.findByPk(userId, {
      include: {
        model: Recipe,
        as: 'favorites',
        through: { attributes: [] }, // Exclude join table data from response
      },
    });

    return res.status(200).json(user.favorites);

  } catch (error) {
    console.error('Error retrieving favorite recipes:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
/**
 * @route   DELETE /favorites/:recipeId
 * @desc    Remove a recipe from the authenticated user's favorites
 * @access  Private (requires authMiddleware)
 */
exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const recipeId = parseInt(req.params.recipeId, 10);

    // Check if the recipe exists
    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Get the authenticated user
    const user = await User.findByPk(userId);

    // Check if the recipe is actually in favorites
    const isFavorite = await user.hasFavorite(recipeId);
    if (!isFavorite) {
      return res.status(404).json({ message: 'Recipe is not in favorites' });
    }

    // Remove the recipe from favorites
    await user.removeFavorite(recipeId);
    return res.status(200).json({ message: 'Recipe successfully removed from favorites' });

  } catch (error) {
    console.error('Error removing recipe from favorites:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

