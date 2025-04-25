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

module.exports = {
  getAllUsers,
};
