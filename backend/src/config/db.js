const mongoose = require('mongoose');

const { MONGO_URI, MONGO_DB, NODE_ENV } = process.env;
if (!MONGO_URI) throw new Error('Falta MONGO_URI');

mongoose.set('strictQuery', true);
mongoose.set('bufferCommands', false); // no encolar operaciones sin conexión

let cached = global._mongooseCached || { conn: null, promise: null };
global._mongooseCached = cached;

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      dbName: MONGO_DB || undefined,
      autoIndex: NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
      minPoolSize: 0,
      family: 4, // fuerza IPv4 si hay líos con IPv6/DNS
      // ❌ NO poner keepAlive / keepAliveInitialDelay (ya no soportadas)
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((m) => {
      const c = m.connection;
      c.on('connected',    () => console.log('🟢 MongoDB conectado'));
      c.on('error',        (e) => console.error('🔴 MongoDB error:', e));
      c.on('disconnected', () => console.warn('🟠 MongoDB desconectado'));
      return m;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDB };