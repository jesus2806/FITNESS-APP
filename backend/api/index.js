// api/index.js
const serverless = require('serverless-http');
const app = require('../src/app');
const { connectDB } = require('../src/config/db');

// Reutiliza el wrapper serverless entre invocaciones calientes
const appHandler = serverless(app);

module.exports = async (req, res) => {
  // Garantiza conexión antes de manejar la request
  await connectDB();
  return appHandler(req, res);
};
