const { Router } = require('express');
const auth = require('../middlewares/auth');
const { getMe, listUsers } = require('../controllers/users.controller');

const router = Router();

router.get('/me', auth(true), getMe);
router.get('/', auth(true), listUsers);

module.exports = router;