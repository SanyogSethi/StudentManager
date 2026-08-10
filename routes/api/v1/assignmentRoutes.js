const express = require('express');
const router = express.Router();
const assignmentController = require('../../../controllers/assignmentController');
const { protect } = require('../../../middleware/authMiddleware');
const { requireRole } = require('../../../middleware/roleGuard');

router.use(protect);

router.post('/', requireRole('admin', 'teacher'), assignmentController.createAssignment);
router.post('/:id/submit', requireRole('student'), assignmentController.submitAssignment);
router.put('/submission/:submissionId/grade', requireRole('admin', 'teacher'), assignmentController.gradeSubmission);

module.exports = router;
