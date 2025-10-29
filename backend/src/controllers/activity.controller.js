const Activity = require('../models/activity.model');
const User = require('../models/user.model');
const { Types } = require('mongoose');

const METS = {
  walk:      { light: 2.5, moderate: 3.5, vigorous: 4.5 },
  run:       { light: 7.0, moderate: 9.8, vigorous: 11.5 },
  cycle:     { light: 5.5, moderate: 7.5, vigorous: 10.0 },
  strength:  { light: 3.5, moderate: 6.0, vigorous: 8.0 },
  yoga:      { light: 2.5, moderate: 3.0, vigorous: 4.0 },
  swim:      { light: 5.8, moderate: 6.8, vigorous: 9.8 },
  other:     { light: 3.0, moderate: 4.0, vigorous: 6.0 },
};

// kcal = MET * 3.5 * weightKg / 200 * minutes
const calcCalories = ({ type, intensity, durationMin, weightKg }) => {
  const table = METS[type] || METS.other;
  const met = table[intensity] ?? table.moderate;
  const w = Math.max(30, Math.min(Number(weightKg) || 70, 200));
  const mins = Math.max(1, Number(durationMin) || 0);
  return Math.round((met * 3.5 * w / 200) * mins);
};

exports.createActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let {
      date,
      type,
      intensity = 'moderate',
      durationMin,
      distanceKm = 0,
      calories,
      notes = '',
      weightKg,
      autoCalcCalories = true,
    } = req.body || {};

    if (!type || !durationMin) return res.status(400).json({ error: 'type y durationMin son requeridos.' });

    let cals = Number(calories) || 0;
    let caloriesSource = 'manual';

    if (autoCalcCalories || !cals) {
      let w = Number(weightKg);
      if (!w) {
        try {
          const me = await User.findById(userId).select('weightKg');
          if (me?.weightKg) w = Number(me.weightKg);
        } catch {}
      }
      cals = calcCalories({ type, intensity, durationMin, weightKg: w });
      caloriesSource = 'auto';
    }

    const activity = await Activity.create({
      user: userId,
      date: date ? new Date(date) : new Date(),
      type,
      intensity,
      durationMin,
      distanceKm,
      calories: cals,
      caloriesSource,
      notes,
    });

    return res.status(201).json({ activity });
  } catch (err) {
    return next(err);
  }
};

exports.listActivities = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { from, to, limit = 100 } = req.query;

    const q = { user: userId };
    if (from || to) {
      q.date = {};
      if (from) q.date.$gte = new Date(from);
      if (to) q.date.$lte = new Date(to);
    }

    const activities = await Activity.find(q).sort({ date: -1 }).limit(Math.min(Number(limit) || 100, 500));
    return res.json({ activities });
  } catch (err) {
    return next(err);
  }
};

// 🔧 Weekly con TZ para que la gráfica no quede en cero cuando cambie la zona horaria
exports.weeklyStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tz = req.query.tz || 'America/Mexico_City';

    const end = new Date();                // ahora
    const start = new Date(end);
    start.setDate(end.getDate() - 6);      // últimos 7 días

    const rows = await Activity.aggregate([
      { $match: { user: new Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
      { $addFields: { day: { $dateTrunc: { date: '$date', unit: 'day', timezone: tz } } } },
      { $group: { _id: '$day', calories: { $sum: '$calories' }, durationMin: { $sum: '$durationMin' } } },
      { $project: { _id: 0, day: { $dateToString: { date: '$day', format: '%Y-%m-%d', timezone: tz } }, calories: 1, durationMin: 1 } },
      { $sort: { day: 1 } },
    ]);

    // normalizar 7 días
    const days = [];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(start);
      cur.setDate(start.getDate() + i);
      const yyyy = cur.getFullYear();
      const mm = String(cur.getMonth() + 1).padStart(2, '0');
      const dd = String(cur.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      const hit = rows.find(r => r.day === key);
      days.push({ date: key, calories: hit?.calories || 0, durationMin: hit?.durationMin || 0 });
    }

    return res.json({ days });
  } catch (err) {
    return next(err);
  }
};

// 👇 Nuevos endpoints para “ver detalle” y editar
exports.getActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const activity = await Activity.findOne({ _id: id, user: userId });
    if (!activity) return res.status(404).json({ error: 'Actividad no encontrada' });
    return res.json({ activity });
  } catch (err) {
    return next(err);
  }
};

exports.updateActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const payload = req.body || {};

    // recalcular calorías si cambian tipo/intensidad/duración y autoCalc=true
    if (payload.autoCalcCalories || payload.autoCalcCalories === undefined) {
      const merged = await Activity.findOne({ _id: id, user: userId }).lean();
      if (!merged) return res.status(404).json({ error: 'Actividad no encontrada' });

      const type = payload.type || merged.type;
      const intensity = payload.intensity || merged.intensity;
      const durationMin = payload.durationMin || merged.durationMin;

      let w = payload.weightKg;
      if (!w) {
        try {
          const me = await User.findById(userId).select('weightKg');
          if (me?.weightKg) w = Number(me.weightKg);
        } catch {}
      }
      payload.calories = calcCalories({ type, intensity, durationMin, weightKg: w });
      payload.caloriesSource = 'auto';
    }

    const updated = await Activity.findOneAndUpdate({ _id: id, user: userId }, { $set: payload }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Actividad no encontrada' });
    return res.json({ activity: updated });
  } catch (err) {
    return next(err);
  }
};

// listar por un día concreto (YYYY-MM-DD) respetando TZ
exports.listByDay = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tz = req.query.tz || 'America/Mexico_City';
    const { date } = req.params; // 'YYYY-MM-DD'

    // construye rango [día 00:00, 23:59:59] en TZ deseado usando $dateTrunc en find no aplica,
    // así que calculamos en JS asumiendo que el servidor está en UTC.
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    const activities = await Activity.find({
      user: userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    return res.json({ activities });
  } catch (err) {
    return next(err);
  }
};

exports.deleteActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const removed = await Activity.findOneAndDelete({ _id: id, user: userId });
    if (!removed) return res.status(404).json({ error: 'Actividad no encontrada' });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
};