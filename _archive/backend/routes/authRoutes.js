// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authenticateToken');

// POST /auth/register
router.post('/register', authController.register);

// POST /auth/login
router.post('/login', authController.login);

// GET /auth/protected
router.get('/protected', authenticateToken, (req, res) => {
    res.status(200).json({
      message: 'Access granted to protected route.',
      user: req.user,
    });
  });

module.exports = router;
