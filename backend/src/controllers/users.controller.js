const User = require('../models/user.model');

exports.getMe = async (req, res, next) => {
  try {
    const me = await User.findById(req.user.id)
      .select('_id name email role createdAt');
    if (!me) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    return res.json({ me });
  } catch (err) {
    return next(err);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('_id name email role createdAt');
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
};