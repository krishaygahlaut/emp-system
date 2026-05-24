const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/monthly', auth, adminOnly, ctrl.monthly);

module.exports = router;
