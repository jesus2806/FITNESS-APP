require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB();
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`✅ Server escuchando en http://10.31.5.135:${PORT}`);
    });

    // Manejo elegante de cierre
    const shutdown = (signal) => () => {
      console.log(`\nRecibida señal ${signal}. Cerrando servidor...`);
      server.close(() => {
        console.log('Servidor cerrado.');
        process.exit(0);
      });
      // Si en 5s no cerró, forzar
      setTimeout(() => process.exit(1), 5000).unref();
    };
    process.on('SIGINT', shutdown('SIGINT'));
    process.on('SIGTERM', shutdown('SIGTERM'));
  } catch (err) {
    console.error('❌ Error al iniciar:', err);
    process.exit(1);
  }
})();
