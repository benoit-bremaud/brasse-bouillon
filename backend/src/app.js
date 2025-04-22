// Load environment variables
require('dotenv').config();

// Import CORS
const cors = require('cors');

// Import Express
const express = require('express');
const app = express();


// Middleware (optionnel à ce stade)
app.use(cors({
  origin: '*', // Remplacez '*' par l'URL de votre frontend si nécessaire
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
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
