import app from '../src/app.js';

// Fija runtime/región si quieres
export const config = { runtime: 'nodejs', regions: ['iad1'] };

// Express app es un handler (req,res) válido
export default function handler(req, res) {
  return app(req, res);
}