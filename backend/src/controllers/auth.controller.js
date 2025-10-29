const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); // respeta tu ruta/nombre

const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
});

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    let { name = '', email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son requeridos.' });
    }

    email = String(email).toLowerCase().trim();

    // ¿ya existe?
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'El email ya está registrado.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    const token = signToken(user);

    return res.status(201).json({
      user: publicUser(user),
      token,
    });
  } catch (err) {
    // Manejo de índice único (E11000) por si viene de la DB
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'El email ya está registrado.' });
    }
    return next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son requeridos.' });
    }

    email = String(email).toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const token = signToken(user);

    return res.json({
      user: publicUser(user),
      token,
    });
  } catch (err) {
    return next(err);
  }
};
