const serverless = require('serverless-http');
const app = require('../src/app');
const { connectDB } = require('../src/config/db');

let isReady = false;

module.exports = async (req, res) => {
  try {
    if (!isReady) {
      await connectDB(); 
      isReady = true;
    }
    const handler = serverless(app);
    return handler(req, res);
  } catch (err) {
    console.error('Boot/DB failed:', err);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'FUNCTION_BOOT_FAILED', detail: String(err?.message || err) }));
  }
};