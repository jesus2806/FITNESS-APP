const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const activityRoutes = require('./routes/activity.routes');

const app = express();

// Middlewares base
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Rutas
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/activities', activityRoutes);

// 404
app.use((req, res, next) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

// Error handler
// Nota: si lanzas errores con "next(err)" o throw en async, llegan aquí
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Error interno del servidor'
  });
});

module.exports = app;