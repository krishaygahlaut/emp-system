const router = require('express').Router();
const ctrl = require('../controllers/scheduleController');
const { auth, adminOnly } = require('../middleware/auth');

router.post('/', auth, adminOnly, ctrl.assign);
router.get('/', auth, ctrl.getAll);

module.exports = router;
