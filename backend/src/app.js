// Load environment variables
require('dotenv').config();

// Import CORS
const cors = require('cors');

// Import Express
const express = require('express');
const app = express();

// Import Sequelize models
const db = require('../models');

// Import routes
const recipeRoutes = require('../routes/recipeRoutes');
const userRoutes = require('../routes/userRoutes');
const ingredientRoutes = require('../routes/ingredientRoutes');

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// Function to retry DB connection
async function connectWithRetry(retries = 5, delay = 2000) {
  while (retries > 0) {
    try {
      await db.sequelize.authenticate();
      console.log('✅ Database connection established with Sequelize');
      await db.sequelize.sync({ alter: true });
      console.log('🛠️ Models synchronized with the database');
      break;
    } catch (error) {
      console.error(`❌ DB connection failed. Retrying in ${delay / 1000}s... (${retries} retries left)`, error);
      retries--;
      await new Promise(res => global.setTimeout(res, delay));
    }
  }

  if (retries === 0) {
    console.error('💥 All retries failed. Could not connect to the database.');
    process.exit(1);
  }
}
connectWithRetry();

// Test endpoint
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong' });
});

// Mount user routes
app.use('/users', userRoutes);

// Mount recipe routes
app.use('/recipes', recipeRoutes);

// Mount ingredient routes
app.use('/ingredients', ingredientRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
