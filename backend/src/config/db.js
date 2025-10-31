const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
mongoose.set('strictQuery', true);

let cached = global._mongooseCached || { conn: null, promise: null };
global._mongooseCached = cached;

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('⚠️ MONGO_URI no está definida. Saltando conexión a Mongo.');
    return null;
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: process.env.MONGO_DB || undefined,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
      family: 4
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

module.exports = { connectDB };