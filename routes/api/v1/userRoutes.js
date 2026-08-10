const express = require('express');
const router = express.Router();
const userController = require('../../../controllers/userController');
const { protect } = require('../../../middleware/authMiddleware');
const { requireRole } = require('../../../middleware/roleGuard');

router.use(protect);

router.get('/', requireRole('admin', 'teacher'), userController.getUsers);
router.post('/', requireRole('admin'), userController.createUser);
router.put('/:id', requireRole('admin'), userController.updateUser);
router.delete('/:id', requireRole('admin'), userController.deleteUser);
router.post('/link-parent', requireRole('admin'), userController.linkParentToStudent);

module.exports = router;
