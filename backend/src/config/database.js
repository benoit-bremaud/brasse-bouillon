/**
 * Sequelize configuration file
 * Connects to the Docker-based MySQL container.
 */

const { Sequelize } = require('sequelize');
require('dotenv').config(); // Load .env variables

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,  // "db" (le nom du service docker-compose)
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Disable logging
  }
);

module.exports = sequelize;
