// api/index.js (ESM)
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

export const config = { runtime: 'nodejs', regions: ['iad1'] };

export default async function handler(req, res) {
  try {
    await connectDB();           // ⬅️ Espera conexión aquí
  } catch (e) {
    console.error('DB connect failed:', e);
    res.status(500).json({ error: 'No se pudo conectar a la base de datos' });
    return;
  }
  return app(req, res);
}
