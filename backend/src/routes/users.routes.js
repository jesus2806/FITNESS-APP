const { Router } = require('express');
const auth = require('../middlewares/auth');
const { getMe,updateMe, listUsers } = require('../controllers/users.controller');

const router = Router();

router.get('/me', auth(true), getMe);
router.patch('/me', auth(true), updateMe);
router.get('/', auth(true), listUsers);

module.exports = router;