// routes/ingredientRoutes.js

const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');
const authenticateToken = require('../middleware/authenticateToken');

// GET /ingredients
router.get('/', authenticateToken, ingredientController.getAllIngredients);

module.exports = router;
