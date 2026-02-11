/* eslint-env jest */

const path = require('path');
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

// Load dedicated test env before importing middleware (JWT_SECRET is read at import time)
require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') });

const authenticateToken = require('../middleware/authenticateToken');

describe('GET /auth/protected', () => {
  let app;
  let consoleErrorSpy;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    app.get('/auth/protected', authenticateToken, (req, res) => {
      return res.status(200).json({
        message: 'Access granted to protected route.',
        user: req.user,
      });
    });
  });

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('✅ should allow access with a valid token', async () => {
    const validToken = jwt.sign(
      { id: 1, email: 'test@example.com', role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const response = await request(app)
      .get('/auth/protected')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Access granted to protected route.');
    expect(response.body.user).toMatchObject({
      id: 1,
      email: 'test@example.com',
      role: 'user',
    });
  });

  test('❌ should deny access with an invalid token', async () => {
    const response = await request(app)
      .get('/auth/protected')
      .set('Authorization', 'Bearer invalid.token.value');

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Invalid or expired token.');
  });

  test('❌ should deny access with an expired token', async () => {
    const expiredToken = jwt.sign(
      { id: 2, email: 'expired@example.com', role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: -10 }
    );

    const response = await request(app)
      .get('/auth/protected')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Invalid or expired token.');
  });

  test('❌ should deny access when token is missing', async () => {
    const response = await request(app).get('/auth/protected');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Token missing or malformed.');
  });
});
