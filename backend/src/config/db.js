// src/db.js (ESM)
import mongoose from 'mongoose';

mongoose.set('bufferCommands', false);
mongoose.set('strictQuery', true);

let cached = global._mongooseCached;
if (!cached) {
  cached = global._mongooseCached = { conn: null, promise: null };
}

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('⚠️ MONGO_URI no está definida.');
    return null;
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: process.env.MONGO_DB || undefined,
      serverSelectionTimeoutMS: 8000,   // falla más rápido si no hay acceso
      connectTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,                   // evita pools grandes en serverless
      family: 4,
    }).then(m => {
      const c = m.connection;
      c.on('connected',    () => console.log('🟢 Mongo conectado'));
      c.on('error',        (e) => console.error('🔴 Mongo error:', e));
      c.on('disconnected', () => console.warn('🟠 Mongo desconectado'));
      return c;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}