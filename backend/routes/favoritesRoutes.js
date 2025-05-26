const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');
const authenticateToken = require('../middleware/authenticateToken');

// Add a recipe to favorites
router.post('/:recipeId', authenticateToken, favoritesController.addFavorite);

// Get all favorites for the current user
router.get('/', authenticateToken, favoritesController.getFavorites);

// Remove a recipe from favorites
router.delete('/:recipeId', authenticateToken, favoritesController.removeFavorite);

module.exports = router;
