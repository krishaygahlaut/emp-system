const router = require('express').Router();
const ctrl = require('../controllers/employeeController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, adminOnly, ctrl.getAll);
router.get('/:id', auth, adminOnly, ctrl.getOne);
router.post('/', auth, adminOnly, ctrl.create);
router.put('/:id', auth, adminOnly, ctrl.update);
router.delete('/:id', auth, adminOnly, ctrl.remove);

module.exports = router;
