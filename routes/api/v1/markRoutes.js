const express = require('express');
const router = express.Router();
const markController = require('../../../controllers/markController');
const { protect } = require('../../../middleware/authMiddleware');
const { requireRole } = require('../../../middleware/roleGuard');

router.use(protect);

router.post('/', requireRole('admin', 'teacher'), markController.createMark);
router.get('/student/:studentId', markController.getStudentMarks);

module.exports = router;
