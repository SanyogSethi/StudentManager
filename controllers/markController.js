const Mark = require('../models/Mark');

const createMark = async (req, res) => {
  try {
    const { studentId, classId, subjectId, examType, title, obtainedMarks, totalMarks, examDate } = req.body;

    if (!studentId || !classId || !subjectId || obtainedMarks === undefined) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const obtained = Number(obtainedMarks);
    const total = Number(totalMarks) || 100;

    if (obtained > total) {
      return res.status(400).json({
        success: false,
        message: `Obtained marks (${obtained}) cannot exceed total marks (${total}).`
      });
    }

    const mark = await Mark.create({
      student: studentId,
      class: classId,
      subject: subjectId,
      examType: examType || 'Quiz',
      title: title || `${examType || 'Quiz'} Assessment`,
      obtainedMarks: obtained,
      totalMarks: total,
      examDate: examDate ? new Date(examDate) : new Date(),
      recordedBy: req.user._id || req.user.id
    });

    res.status(201).json({ success: true, message: 'Mark recorded successfully', data: mark });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentMarks = async (req, res) => {
  try {
    const { studentId } = req.params;
    const marks = await Mark.find({ student: studentId })
      .populate('subject class')
      .sort({ examDate: -1 });

    res.status(200).json({ success: true, count: marks.length, data: marks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createMark,
  getStudentMarks
};
