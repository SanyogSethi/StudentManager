const express = require('express');
const router = express.Router();
const aiController = require('../../../controllers/aiController');
const { protect } = require('../../../middleware/authMiddleware');
const { requireRole } = require('../../../middleware/roleGuard');

router.use(protect);

router.post('/student-insight/:studentId', aiController.getStudentInsight);
router.get('/student-insight/:studentId', aiController.getLatestStudentInsight);
router.post('/ask-coach', aiController.askCoach);
router.get('/parent-digest/:studentId', aiController.getParentDigest);
router.get('/at-risk-students', requireRole('admin', 'teacher'), aiController.getAtRiskStudents);

module.exports = router;
