const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema({
  targetStudent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  targetClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    default: null
  },
  insightType: {
    type: String,
    enum: ['student_recommendation', 'risk_assessment', 'class_summary', 'parent_report'],
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    default: 'low'
  },
  riskScore: {
    type: Number,
    default: 0
  },
  performanceTrend: {
    type: String,
    enum: ['improving', 'stagnant', 'declining'],
    default: 'stagnant'
  },
  summary: {
    type: String,
    default: ''
  },
  recommendations: [{
    topic: String,
    action: String,
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    resourceType: String
  }],
  supportAreas: [String],
  strengths: [String],
  generatedBy: {
    type: String,
    default: 'Gemini AI'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AIInsight', aiInsightSchema);
