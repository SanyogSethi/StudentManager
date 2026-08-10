const aiEngine = require('../services/aiEngine');
const analyticsService = require('../services/analyticsService');
const AIInsight = require('../models/AIInsight');
const User = require('../models/User');

const getStudentInsight = async (req, res) => {
  try {
    const { studentId } = req.params;
    const insight = await aiEngine.generateStudentInsight(studentId);
    res.status(200).json({ success: true, data: insight });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLatestStudentInsight = async (req, res) => {
  try {
    const { studentId } = req.params;
    let insight = await AIInsight.findOne({ targetStudent: studentId }).sort({ createdAt: -1 });

    if (!insight) {
      insight = await aiEngine.generateStudentInsight(studentId);
    }

    res.status(200).json({ success: true, data: insight });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const askCoach = async (req, res) => {
  try {
    const { studentId, question } = req.body;
    const targetStudentId = studentId || (req.user ? req.user._id || req.user.id : null);

    if (!targetStudentId || !question) {
      return res.status(400).json({ success: false, message: 'Student ID and question required' });
    }

    const response = await aiEngine.askStudyCoach(targetStudentId, question);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getParentDigest = async (req, res) => {
  try {
    const { studentId } = req.params;
    const report = await aiEngine.generateParentInsightReport(studentId);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAtRiskStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).populate('class');
    const evaluations = await Promise.all(
      students.map(s => analyticsService.getStudentAcademicSummary(s._id))
    );

    const flagged = evaluations
      .filter(e => e.riskAnalysis.riskLevel === 'high' || e.riskAnalysis.riskLevel === 'moderate')
      .sort((a, b) => b.riskAnalysis.riskScore - a.riskAnalysis.riskScore);

    res.status(200).json({
      success: true,
      count: flagged.length,
      data: flagged
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStudentInsight,
  getLatestStudentInsight,
  askCoach,
  getParentDigest,
  getAtRiskStudents
};
