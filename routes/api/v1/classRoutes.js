const express = require('express');
const router = express.Router();
const classController = require('../../../controllers/classController');
const { protect } = require('../../../middleware/authMiddleware');
const { requireRole } = require('../../../middleware/roleGuard');

router.use(protect);

router.get('/', classController.getClasses);
router.post('/', requireRole('admin'), classController.createClass);
router.get('/subjects', classController.getSubjects);
router.post('/subjects', requireRole('admin'), classController.createSubject);

module.exports = router;
