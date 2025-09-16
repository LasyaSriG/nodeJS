const request = require('supertest');
const app = require('../app');

describe('Node.js App API Tests', () => {
  test('GET / should return Hello message', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Hello from Feature Branch!');
  });

  test('GET /status should return app status', async () => {
    const response = await request(app).get('/status');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });
});
