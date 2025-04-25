// routes/ingredientRoutes.js

const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');

// GET /ingredients
router.get('/', ingredientController.getAllIngredients);

module.exports = router;
