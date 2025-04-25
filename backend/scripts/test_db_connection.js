/**
 * Test script to verify Sequelize can connect to the MySQL container.
 */

const sequelize = require('../src/config/database');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to the MySQL database successful.');
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error.message);
  } finally {
    await sequelize.close();
  }
})();
