/**
 * Test basic usage of authController (register & login)
 */

const db = require('../models');
const authController = require('../controllers/authController');

const mockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    console.log(`📤 [${res.statusCode}]`, data);
    return res;
  };
  return res;
};

const runTest = async () => {
  await db.sequelize.sync({ alter: true });

  const reqRegister = {
    body: {
      email: 'test@example.com',
      password: 'test1234',
    },
  };

  const reqLogin = {
    body: {
      email: 'test@example.com',
      password: 'test1234',
    },
  };
  
  const reqWrongPassword = {
    body: {
      email: 'test@example.com',
      password: 'wrongpassword',
    },
  };

  console.log('\n=== 📌 Registering user ===');
  await authController.register(reqRegister, mockRes());

  console.log('\n=== 🔐 Logging in user ===');
  await authController.login(reqLogin, mockRes());

  console.log('\n=== ❌ Attempt login with wrong password ===');
  await authController.login(reqWrongPassword, mockRes());

  await db.sequelize.close();
};

runTest();
