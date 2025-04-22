// Load environment variables
require('dotenv').config();

// Import Express
const express = require('express');
const app = express();

// Middleware (optionnel à ce stade)
app.use(express.json());

// Test endpoint
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
