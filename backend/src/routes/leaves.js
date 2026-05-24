const router = require('express').Router();
const ctrl = require('../controllers/leaveController');
const { auth, adminOnly, employeeOnly } = require('../middleware/auth');

router.post('/', auth, adminOnly, ctrl.apply);
router.post('/apply', auth, employeeOnly, ctrl.applyOwn);
router.get('/', auth, ctrl.getAll);
router.put('/:id/status', auth, adminOnly, ctrl.updateStatus);

module.exports = router;
