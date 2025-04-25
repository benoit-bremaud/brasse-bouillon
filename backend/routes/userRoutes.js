// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /users
router.get('/', userController.getAllUsers);

module.exports = router;
