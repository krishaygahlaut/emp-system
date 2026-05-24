const router = require('express').Router();
const ctrl = require('../controllers/attendanceController');
const { auth, adminOnly, employeeOnly } = require('../middleware/auth');

router.post('/', auth, adminOnly, ctrl.mark);
router.post('/selfie', auth, employeeOnly, ctrl.markSelfie);
router.get('/', auth, ctrl.getAll);

module.exports = router;
