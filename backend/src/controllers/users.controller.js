const User = require('../models/user.model');

exports.getMe = async (req, res, next) => {
  try {
    const me = await User.findById(req.user.id)
      .select('_id name email role createdAt weightKg weeklyGoalKcal')
      .lean();

    if (!me) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Compatibilidad: añade "id" además de "_id"
    me.id = (me._id || '').toString();

    return res.json({ me });
  } catch (err) {
    return next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const patch = {};
    if (req.body.weightKg !== undefined) patch.weightKg = Number(req.body.weightKg);
    if (req.body.weeklyGoalKcal !== undefined) patch.weeklyGoalKcal = Number(req.body.weeklyGoalKcal);

    const me = await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: patch },
      { new: true, runValidators: true, context: 'query' }
    )
      .select('_id name email role createdAt weightKg weeklyGoalKcal')
      .lean();

    if (!me) return res.status(404).json({ error: 'Usuario no encontrado' });

    me.id = (me._id || '').toString();

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