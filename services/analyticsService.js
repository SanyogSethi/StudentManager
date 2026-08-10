const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Class = require('../models/Class');

const getStudentAcademicSummary = async (studentId) => {
  const student = await User.findById(studentId).populate('class');
  if (!student) throw new Error('Student not found');

  const attendanceRecords = await Attendance.find({ student: studentId });
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length;
  const absentDays = attendanceRecords.filter(r => r.status === 'absent').length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  const marksRecords = await Mark.find({ student: studentId }).populate('subject');
  
  const subjectMap = {};
  let totalScoreSum = 0;
  let totalMaxSum = 0;

  marksRecords.forEach(m => {
    const subName = m.subject ? m.subject.name : 'General';
    const subCode = m.subject ? m.subject.code : 'GEN';
    
    if (!subjectMap[subName]) {
      subjectMap[subName] = {
        name: subName,
        code: subCode,
        obtained: 0,
        total: 0,
        percentage: 0,
        testsCount: 0,
        history: []
      };
    }
    subjectMap[subName].obtained += m.obtainedMarks;
    subjectMap[subName].total += m.totalMarks;
    subjectMap[subName].testsCount += 1;
    subjectMap[subName].history.push({
      title: m.title,
      type: m.examType,
      score: Math.round((m.obtainedMarks / m.totalMarks) * 100),
      date: m.examDate
    });

    totalScoreSum += m.obtainedMarks;
    totalMaxSum += m.totalMarks;
  });

  const subjectBreakdown = Object.values(subjectMap).map(s => ({
    ...s,
    percentage: s.total > 0 ? Math.round((s.obtained / s.total) * 100) : 0
  }));

  const overallPercentage = totalMaxSum > 0 ? Math.round((totalScoreSum / totalMaxSum) * 100) : 0;

  const sortedMarks = [...marksRecords].sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
  let performanceTrend = 'stagnant';
  if (sortedMarks.length >= 4) {
    const half = Math.floor(sortedMarks.length / 2);
    const older = sortedMarks.slice(0, half);
    const recent = sortedMarks.slice(half);

    const oldAvg = older.reduce((acc, curr) => acc + (curr.obtainedMarks / curr.totalMarks), 0) / older.length;
    const recAvg = recent.reduce((acc, curr) => acc + (curr.obtainedMarks / curr.totalMarks), 0) / recent.length;

    const diff = recAvg - oldAvg;
    if (diff > 0.05) performanceTrend = 'improving';
    else if (diff < -0.05) performanceTrend = 'declining';
  }

  let pendingAssignmentsCount = 0;
  let totalAssigned = 0;
  let completedSubmissions = 0;
  if (student.class) {
    const classAssignments = await Assignment.find({ class: student.class._id });
    totalAssigned = classAssignments.length;

    const submissions = await Submission.find({ student: studentId });
    completedSubmissions = submissions.length;
    pendingAssignmentsCount = Math.max(0, totalAssigned - completedSubmissions);
  }

  let riskScore = 0;
  if (attendancePercentage < 75) riskScore += 35;
  else if (attendancePercentage < 85) riskScore += 15;

  if (overallPercentage < 50) riskScore += 40;
  else if (overallPercentage < 65) riskScore += 25;
  else if (overallPercentage < 75) riskScore += 10;

  if (performanceTrend === 'declining') riskScore += 15;

  if (totalAssigned > 0) {
    const completionRate = completedSubmissions / totalAssigned;
    if (completionRate < 0.5) riskScore += 15;
  }

  riskScore = Math.min(100, Math.max(0, riskScore));
  let riskLevel = 'low';
  if (riskScore >= 60) riskLevel = 'high';
  else if (riskScore >= 35) riskLevel = 'moderate';

  return {
    student: {
      id: student._id,
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
      avatar: student.avatar,
      className: student.class ? student.class.name : 'Unassigned'
    },
    attendance: {
      totalDays,
      presentDays,
      absentDays,
      percentage: attendancePercentage
    },
    academics: {
      overallPercentage,
      subjectBreakdown,
      performanceTrend
    },
    assignments: {
      totalAssigned,
      completedSubmissions,
      pendingAssignmentsCount
    },
    riskAnalysis: {
      riskScore,
      riskLevel
    }
  };
};

const getClassAcademicSummary = async (classId) => {
  const classObj = await Class.findById(classId).populate('students classTeacher subjects');
  if (!classObj) throw new Error('Class not found');

  const studentSummaries = await Promise.all(
    classObj.students.map(s => getStudentAcademicSummary(s._id))
  );

  const totalStudents = studentSummaries.length;
  const avgAttendance = totalStudents > 0 
    ? Math.round(studentSummaries.reduce((acc, s) => acc + s.attendance.percentage, 0) / totalStudents)
    : 100;

  const avgMarks = totalStudents > 0
    ? Math.round(studentSummaries.reduce((acc, s) => acc + s.academics.overallPercentage, 0) / totalStudents)
    : 0;

  const atRiskStudents = studentSummaries.filter(s => s.riskAnalysis.riskLevel === 'high' || s.riskAnalysis.riskLevel === 'moderate');

  return {
    classInfo: {
      id: classObj._id,
      name: classObj.name,
      teacherName: classObj.classTeacher ? classObj.classTeacher.name : 'Unassigned',
      totalStudents
    },
    metrics: {
      avgAttendance,
      avgMarks,
      atRiskCount: atRiskStudents.length,
      highRiskCount: studentSummaries.filter(s => s.riskAnalysis.riskLevel === 'high').length
    },
    atRiskList: atRiskStudents.map(s => ({
      studentId: s.student.id,
      name: s.student.name,
      rollNumber: s.student.rollNumber,
      avatar: s.student.avatar,
      attendance: s.attendance.percentage,
      marks: s.academics.overallPercentage,
      riskLevel: s.riskAnalysis.riskLevel,
      riskScore: s.riskAnalysis.riskScore,
      trend: s.academics.performanceTrend
    }))
  };
};

module.exports = {
  getStudentAcademicSummary,
  getClassAcademicSummary
};
