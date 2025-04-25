// routes/recipeRoutes.js

const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const authenticateToken = require('../middleware/authenticateToken');

// GET /recipes
router.get('/', authenticateToken,  recipeController.getAllRecipes);

module.exports = router;
