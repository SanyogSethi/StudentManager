const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

const createAssignment = async (req, res) => {
  try {
    const { title, description, classId, subjectId, dueDate, maxMarks } = req.body;

    const assignment = await Assignment.create({
      title,
      description,
      class: classId,
      subject: subjectId,
      teacher: req.user._id || req.user.id,
      dueDate: new Date(dueDate),
      maxMarks: maxMarks || 100
    });

    res.status(201).json({ success: true, message: 'Assignment published', data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const submitAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { content } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    const submission = await Submission.findOneAndUpdate(
      { assignment: assignmentId, student: req.user._id || req.user.id },
      {
        content,
        submissionDate: new Date(),
        status: new Date() > new Date(assignment.dueDate) ? 'late' : 'submitted'
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: 'Submission uploaded successfully', data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { obtainedMarks, feedback } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    submission.obtainedMarks = Number(obtainedMarks);
    submission.feedback = feedback || '';
    submission.status = 'graded';
    submission.gradedBy = req.user._id || req.user.id;

    await submission.save();

    res.status(200).json({ success: true, message: 'Grade recorded successfully', data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAssignment,
  submitAssignment,
  gradeSubmission
};
