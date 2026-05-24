const router = require('express').Router();
const ctrl = require('../controllers/employeeAuthController');
const { auth, adminOnly, employeeOnly } = require('../middleware/auth');

router.post('/register', auth, adminOnly, ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', auth, employeeOnly, ctrl.getMyProfile);
router.get('/my-attendance', auth, employeeOnly, ctrl.getMyAttendance);
router.get('/my-leaves', auth, employeeOnly, ctrl.getMyLeaves);
router.get('/my-schedule', auth, employeeOnly, ctrl.getMySchedule);

module.exports = router;
