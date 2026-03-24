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

/**
 * PUT /users/me
 * Update the current user's profile (email, etc.)
 */
const updateCurrentUser = async (req, res) => {
  const { email } = req.body;

  // Vérification minimale
  if (!email) {
    return res.status(400).json({ error: 'Email is required to update.' });
  }

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Mise à jour des champs autorisés
    user.email = email;
    await user.save();

    // Réponse avec les données à jour (sans password grâce au toJSON())
    res.status(200).json(user);
  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getAllUsers,
  getCurrentUser,
  updateCurrentUser,
};
