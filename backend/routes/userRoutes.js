// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');

// GET /users
router.get('/', authenticateToken, userController.getAllUsers);

// GET /users/me pour obtenir l'utilisateur connecté
router.get('/me', authenticateToken, userController.getCurrentUser);

module.exports = router;
