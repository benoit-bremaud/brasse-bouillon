// controllers/authController.js

const db = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = db.User;

// Vérification si JWT_SECRET est bien défini dans les variables d'environnement
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set. Please configure it in your environment.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'secret_placeholder'; // à sécuriser dans .env

/**
 * Register a new user
 */
const register = async (req, res) => {
  const { email, password } = req.body;

  // Validation de base
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    const newUser = await User.create({ email, password: hashedPassword });

    res.status(201).json({ message: 'User registered successfully.', userId: newUser.id });
  } catch (error) {
    console.error('❌ Error in register:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Authenticate and return JWT
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Vérifie le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Création du JWT
    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({ message: 'Login successful.', token });
  } catch (error) {
    console.error('❌ Error in login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  register,
  login,
};
