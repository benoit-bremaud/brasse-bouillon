// routes/recipeRoutes.js

const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

// GET /recipes
router.get('/', recipeController.getAllRecipes);

module.exports = router;
