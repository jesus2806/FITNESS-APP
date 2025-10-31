// backend/api/index.js
const serverless = require('serverless-http');
const app = require('../src/app');
const { connectDB } = require('../src/config/db');

const handler = serverless(app);

module.exports = async (req, res) => {
  try {
    await connectDB();        // garantiza conexión por request
  } catch (err) {
    console.error('DB connect failed:', err);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify({ error: 'DB connection failed' }));
  }
  return handler(req, res);
};