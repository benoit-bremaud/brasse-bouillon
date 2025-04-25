// controllers/userController.js

const db = require('../models');
const User = db.User;

/**
 * GET /users
 * Fetch all users
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * GET /users/me
 * Fetch current user information (JWT-protected)
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id); // req.user est défini par authenticateToken
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('❌ Error fetching current user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getAllUsers,
  getCurrentUser,
};
