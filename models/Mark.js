const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  examType: {
    type: String,
    enum: ['Quiz', 'Midterm', 'FinalExam', 'AssignmentScore', 'Project'],
    required: true,
    default: 'Quiz'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  obtainedMarks: {
    type: Number,
    required: true,
    min: 0
  },
  totalMarks: {
    type: Number,
    required: true,
    default: 100,
    min: 1
  },
  examDate: {
    type: Date,
    default: Date.now
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

markSchema.index({ student: 1, subject: 1 });

module.exports = mongoose.model('Mark', markSchema);
