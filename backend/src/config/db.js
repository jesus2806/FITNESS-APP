// config/db.js
const mongoose = require('mongoose');

const { MONGO_URI, MONGO_DB, NODE_ENV } = process.env;
if (!MONGO_URI) throw new Error('Falta MONGO_URI en variables de entorno');

mongoose.set('strictQuery', true);
// Evita colas de operaciones si no hay conexión (falla rápido en vez de “colgarse” 10s)
mongoose.set('bufferCommands', false);

let cached = global._mongooseCached || { conn: null, promise: null };
global._mongooseCached = cached;

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      dbName: MONGO_DB || undefined,
      autoIndex: NODE_ENV !== 'production',
      // tiempos y pool amigables para serverless
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
      minPoolSize: 0,
      family: 4, // fuerza IPv4 si hay problemas con IPv6
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((m) => {
      const c = m.connection;
      c.on('connected',     () => console.log('🟢 MongoDB conectado'));
      c.on('error',         (err) => console.error('🔴 Error MongoDB:', err));
      c.on('disconnected',  () => console.warn('🟠 MongoDB desconectado'));
      return m;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDB };