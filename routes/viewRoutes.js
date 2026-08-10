const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleGuard');

// Public Auth Page
router.get('/login', viewController.renderLogin);

// Protected Core Pages
router.get('/', protect, viewController.renderDashboard);
router.get('/dashboard', protect, viewController.renderDashboard);

// Admin Routes
router.get('/admin/users', protect, requireRole('admin'), viewController.renderUsersView);
router.get('/admin/classes', protect, requireRole('admin'), viewController.renderClassesView);
router.get('/admin/at-risk', protect, requireRole('admin', 'teacher'), viewController.renderAtRiskView);

// Teacher Routes
router.get('/teacher/attendance', protect, requireRole('teacher', 'admin'), viewController.renderTeacherAttendanceView);
router.get('/teacher/marks', protect, requireRole('teacher', 'admin'), viewController.renderTeacherMarksView);

// Student Routes
router.get('/student/learning-hub', protect, requireRole('student'), viewController.renderStudentLearningHub);

module.exports = router;
