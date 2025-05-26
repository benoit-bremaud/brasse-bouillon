// routes/recipeRoutes.js

const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const authenticateToken = require('../middleware/authenticateToken');

// GET /recipes
router.get('/', authenticateToken, recipeController.getAllRecipes);
// GET /recipes/:id
router.get('/:id', authenticateToken, recipeController.getRecipeById);
// POST /recipes
router.post('/', authenticateToken, recipeController.createRecipe);
/**
 * @route PUT /recipes/:id
 * @desc Update a recipe (only allowed for the creator)
 * @access Private (JWT required)
 */
router.put('/:id', authenticateToken, recipeController.updateRecipe);

/**
 * @route DELETE /recipes/:id
 * @desc Delete a recipe (creator or admin only)
 * @access Private (JWT required)
 */
router.delete('/:id', authenticateToken, recipeController.deleteRecipe);

module.exports = router;
