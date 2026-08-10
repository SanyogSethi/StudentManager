const express = require('express');
const router = express.Router();
const attendanceController = require('../../../controllers/attendanceController');
const { protect } = require('../../../middleware/authMiddleware');
const { requireRole } = require('../../../middleware/roleGuard');

router.use(protect);

router.post('/batch', requireRole('admin', 'teacher'), attendanceController.recordBatchAttendance);
router.get('/session', attendanceController.getSessionAttendance);
router.get('/student/:studentId', attendanceController.getStudentAttendance);

module.exports = router;
