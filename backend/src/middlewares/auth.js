const jwt = require('jsonwebtoken');

module.exports = function auth(required = true) {
  return (req, res, next) => {
    try {
      const header = req.header('Authorization') || '';
      const token = header.startsWith('Bearer ') ? header.slice(7) : null;

      if (!token) {
        if (!required) return next(); // ruta pública opcional
        return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { id, email, role }
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
  };
};