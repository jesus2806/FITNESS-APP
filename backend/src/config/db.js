const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Falta MONGO_URI en .env');
  }

  const dbName = process.env.MONGO_DB || undefined;

  mongoose.connection.on('connected', () => {
    console.log('🟢 MongoDB conectado');
  });

  mongoose.connection.on('error', (err) => {
    console.error('🔴 Error de MongoDB:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('🟠 MongoDB desconectado');
  });

  // Conexión (dbName es opcional; si tu URI ya trae DB, no es necesario)
  await mongoose.connect(uri, {
    dbName,
    autoIndex: true
  });

  return mongoose.connection;
};

module.exports = { connectDB };