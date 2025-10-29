const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
  res.json({
    ok: true,
    status: 'healthy',
    time: new Date().toISOString()
  });
});

module.exports = router;
