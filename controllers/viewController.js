const User = require('../models/User');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Mark = require('../models/Mark');
const AIInsight = require('../models/AIInsight');
const analyticsService = require('../services/analyticsService');
const aiEngine = require('../services/aiEngine');

const renderLogin = (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('auth/login', { title: 'Login - Academic Management System', layout: false });
};

const renderDashboard = async (req, res) => {
  try {
    const role = req.user.role;
    if (role === 'admin') return renderAdminDashboard(req, res);
    if (role === 'teacher') return renderTeacherDashboard(req, res);
    if (role === 'student') return renderStudentDashboard(req, res);
    if (role === 'parent') return renderParentDashboard(req, res);

    res.status(403).send('Unauthorized role');
  } catch (error) {
    res.status(500).render('error', { title: 'Error', message: error.message });
  }
};

const renderAdminDashboard = async (req, res) => {
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalTeachers = await User.countDocuments({ role: 'teacher' });
  const totalParents = await User.countDocuments({ role: 'parent' });
  const totalClasses = await Class.countDocuments();

  const students = await User.find({ role: 'student' });
  const summaries = await Promise.all(students.map(s => analyticsService.getStudentAcademicSummary(s._id)));
  const atRiskList = summaries.filter(s => s.riskAnalysis.riskLevel === 'high' || s.riskAnalysis.riskLevel === 'moderate');

  res.render('admin/dashboard', {
    title: 'Admin Dashboard',
    metrics: {
      totalStudents,
      totalTeachers,
      totalParents,
      totalClasses,
      atRiskCount: atRiskList.length,
      highRiskCount: summaries.filter(s => s.riskAnalysis.riskLevel === 'high').length
    },
    atRiskStudents: atRiskList.slice(0, 5),
    recentUsers: await User.find().sort({ createdAt: -1 }).limit(5)
  });
};

const renderTeacherDashboard = async (req, res) => {
  const teacherId = req.user._id || req.user.id;
  const teacherClasses = await Class.find({ classTeacher: teacherId }).populate('students subjects');
  const assignedAssignments = await Assignment.find({ teacher: teacherId }).populate('class subject').sort({ createdAt: -1 });

  let firstClassSummary = null;
  if (teacherClasses.length > 0) {
    firstClassSummary = await analyticsService.getClassAcademicSummary(teacherClasses[0]._id);
  }

  res.render('teacher/dashboard', {
    title: 'Teacher Dashboard',
    classes: teacherClasses,
    assignments: assignedAssignments,
    classSummary: firstClassSummary
  });
};

const renderStudentDashboard = async (req, res) => {
  const studentId = req.user._id || req.user.id;
  const summary = await analyticsService.getStudentAcademicSummary(studentId);
  const latestInsight = await AIInsight.findOne({ targetStudent: studentId }).sort({ createdAt: -1 });
  const studentUser = await User.findById(studentId).populate('class');

  let classAssignments = [];
  if (studentUser.class) {
    classAssignments = await Assignment.find({ class: studentUser.class._id }).populate('subject teacher').sort({ dueDate: 1 });
  }

  const submissions = await Submission.find({ student: studentId });

  res.render('student/dashboard', {
    title: 'Student Dashboard',
    summary,
    insight: latestInsight,
    assignments: classAssignments,
    submissions
  });
};

const renderParentDashboard = async (req, res) => {
  const parentId = req.user._id || req.user.id;
  const parent = await User.findById(parentId).populate({
    path: 'parentOf',
    populate: { path: 'class' }
  });

  const children = parent.parentOf || [];
  const childrenSummaries = await Promise.all(
    children.map(async (child) => {
      const summary = await analyticsService.getStudentAcademicSummary(child._id);
      const parentReport = await aiEngine.generateParentInsightReport(child._id);
      return {
        child,
        summary,
        report: parentReport
      };
    })
  );

  res.render('parent/dashboard', {
    title: 'Parent Portal',
    childrenSummaries
  });
};

const renderUsersView = async (req, res) => {
  const users = await User.find().populate('class parentOf').sort({ role: 1, name: 1 });
  const classes = await Class.find();
  const students = await User.find({ role: 'student' });
  const parents = await User.find({ role: 'parent' });

  res.render('admin/users', {
    title: 'User Management',
    users,
    classes,
    students,
    parents
  });
};

const renderClassesView = async (req, res) => {
  const classes = await Class.find().populate('classTeacher students subjects');
  const teachers = await User.find({ role: 'teacher' });
  const subjects = await Subject.find().populate('teacher');

  res.render('admin/classes', {
    title: 'Class & Subject Management',
    classes,
    teachers,
    subjects
  });
};

const renderAtRiskView = async (req, res) => {
  const students = await User.find({ role: 'student' }).populate('class');
  const summaries = await Promise.all(students.map(s => analyticsService.getStudentAcademicSummary(s._id)));
  const atRiskStudents = summaries.filter(s => s.riskAnalysis.riskLevel === 'high' || s.riskAnalysis.riskLevel === 'moderate');

  res.render('admin/atRisk', {
    title: 'AI At-Risk Student Monitor',
    atRiskStudents
  });
};

const renderTeacherAttendanceView = async (req, res) => {
  const teacherId = req.user._id || req.user.id;
  const classes = await Class.find().populate('students');
  const selectedClassId = req.query.classId || (classes.length > 0 ? classes[0]._id : null);

  const selectedDateStr = req.query.date || new Date().toISOString().split('T')[0];
  const targetDate = new Date(selectedDateStr);
  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  let selectedClass = null;
  let existingAttendanceMap = {};
  let isAlreadyRecorded = false;

  if (selectedClassId) {
    selectedClass = await Class.findById(selectedClassId).populate('students');
    
    const existingRecords = await Attendance.find({
      class: selectedClassId,
      date: { $gte: targetDate, $lt: nextDay }
    });

    if (existingRecords.length > 0) {
      isAlreadyRecorded = true;
      existingRecords.forEach(r => {
        existingAttendanceMap[r.student.toString()] = {
          status: r.status,
          remarks: r.remarks
        };
      });
    }
  }

  res.render('teacher/attendance', {
    title: 'Attendance Tracker',
    classes,
    selectedClass,
    selectedDateStr,
    existingAttendanceMap,
    isAlreadyRecorded
  });
};

const renderTeacherMarksView = async (req, res) => {
  const classes = await Class.find().populate('students subjects');
  const subjects = await Subject.find();
  const marks = await Mark.find().populate('student class subject').sort({ createdAt: -1 }).limit(20);

  res.render('teacher/marks', {
    title: 'Gradebook & Assessment Marks',
    classes,
    subjects,
    marks
  });
};

const renderStudentLearningHub = async (req, res) => {
  const studentId = req.user._id || req.user.id;
  const summary = await analyticsService.getStudentAcademicSummary(studentId);
  const insight = await aiEngine.generateStudentInsight(studentId);

  res.render('student/learningHub', {
    title: 'AI Learning Hub',
    summary,
    insight
  });
};

module.exports = {
  renderLogin,
  renderDashboard,
  renderUsersView,
  renderClassesView,
  renderAtRiskView,
  renderTeacherAttendanceView,
  renderTeacherMarksView,
  renderStudentLearningHub
};
