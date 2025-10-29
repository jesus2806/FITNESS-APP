const { Router } = require('express');
const auth = require('../middlewares/auth');
const {
  createActivity,
  listActivities,
  weeklyStats,
  getActivity,
  updateActivity,
  listByDay,
  deleteActivity,
} = require('../controllers/activity.controller');

const router = Router();

router.post('/', auth(true), createActivity);
router.get('/', auth(true), listActivities);
router.get('/stats/weekly', auth(true), weeklyStats);
router.get('/day/:date', auth(true), listByDay);     // 👈 nuevo
router.get('/:id', auth(true), getActivity);         // 👈 nuevo
router.patch('/:id', auth(true), updateActivity);    // 👈 nuevo
router.delete('/:id', auth(true), deleteActivity);

module.exports = router;