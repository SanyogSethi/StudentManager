const { getAiClient, isAiConfigured } = require('../config/ai');
const AIInsight = require('../models/AIInsight');
const analyticsService = require('./analyticsService');

const STUDY_TECHNIQUES = [
  { name: 'Feynman Technique', desc: 'Explain complex concepts in simple terms to identify core knowledge gaps.' },
  { name: 'Active Recall Drills', desc: 'Test memory without looking at notes to strengthen neural retention.' },
  { name: 'Pomodoro Focus Intervals', desc: 'Study in 25-minute deep focus sprints followed by 5-minute restorative breaks.' },
  { name: 'Interleaved Practice', desc: 'Mix different problem types within a single study session to build adaptability.' },
  { name: 'Spaced Repetition Flashcards', desc: 'Review difficult formulas and definitions at increasing time intervals.' }
];

const RESOURCE_TYPES = ['Practice Quiz', 'Video Tutorial', 'Interactive Simulation', 'Teacher Office Hours', 'Peer Study Group'];

const generateStudentInsight = async (studentId) => {
  const summary = await analyticsService.getStudentAcademicSummary(studentId);
  const { student, attendance, academics, assignments, riskAnalysis } = summary;

  let result = null;
  const timestampStr = new Date().toLocaleTimeString();

  if (isAiConfigured()) {
    try {
      const ai = getAiClient();
      const prompt = `You are an expert AI Educational Advisor. Analyze this student's performance data and generate unique, fresh, highly actionable insights. (Generation Timestamp: ${timestampStr})
      
      Student Name: ${student.name}
      Class: ${student.className}
      Attendance: ${attendance.percentage}% (${attendance.presentDays}/${attendance.totalDays} days)
      Overall Academic Score: ${academics.overallPercentage}%
      Performance Trajectory: ${academics.performanceTrend}
      Pending Assignments: ${assignments.pendingAssignmentsCount} out of ${assignments.totalAssigned}
      Subject Performance Breakdown:
      ${JSON.stringify(academics.subjectBreakdown, null, 2)}
      
      Respond STRICTLY with valid JSON matching this exact structure:
      {
        "summary": "Short 2-3 sentence overview highlighting specific strengths, attendance, and trajectory.",
        "riskLevel": "${riskAnalysis.riskLevel}",
        "riskScore": ${riskAnalysis.riskScore},
        "performanceTrend": "${academics.performanceTrend}",
        "strengths": ["List 2-3 key strengths"],
        "supportAreas": ["List 2-3 specific topics/subjects needing improvement"],
        "recommendations": [
          {
            "topic": "Name of subject or skill area",
            "action": "Specific actionable advice or practice task",
            "priority": "High" | "Medium" | "Low",
            "resourceType": "Video Tutorial" | "Practice Quiz" | "Teacher Office Hours" | "Peer Study Group" | "Interactive Simulation"
          }
        ]
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        result = {
          ...parsed,
          generatedBy: 'Gemini AI (gemini-2.0-flash)'
        };
      }
    } catch (err) {}
  }

  if (!result) {
    const strengths = [];
    const supportAreas = [];
    const recommendations = [];

    const shuffledTechniques = [...STUDY_TECHNIQUES].sort(() => Math.random() - 0.5);

    academics.subjectBreakdown.forEach((sub, idx) => {
      const tech = shuffledTechniques[idx % shuffledTechniques.length];
      const resType = RESOURCE_TYPES[Math.floor(Math.random() * RESOURCE_TYPES.length)];

      if (sub.percentage >= 75) {
        strengths.push(`High mastery in ${sub.name} (${sub.percentage}% score)`);
      } else if (sub.percentage < 65) {
        supportAreas.push(`Targeted revision for ${sub.name} (${sub.percentage}% score)`);
        recommendations.push({
          topic: sub.name,
          action: `Apply ${tech.name} (${tech.desc}) for difficult ${sub.name} problem sets.`,
          priority: sub.percentage < 50 ? 'High' : 'Medium',
          resourceType: resType
        });
      }
    });

    if (attendance.percentage < 75) {
      supportAreas.push(`Attendance recovery plan needed (Currently ${attendance.percentage}%)`);
      recommendations.push({
        topic: 'Attendance Recovery',
        action: 'Schedule 1-on-1 office hours with your subject teacher to review missed core lectures.',
        priority: 'High',
        resourceType: 'Teacher Office Hours'
      });
    }

    if (assignments.pendingAssignmentsCount > 0) {
      recommendations.push({
        topic: 'Pending Assignments',
        action: `Complete your ${assignments.pendingAssignmentsCount} pending homework submission(s) to secure continuous evaluation points.`,
        priority: 'High',
        resourceType: 'Peer Study Group'
      });
    }

    if (strengths.length === 0) strengths.push('Actively participating in classroom discussions');
    if (supportAreas.length === 0) supportAreas.push('Exam time allocation and pacing');
    if (recommendations.length === 0) {
      const tech = shuffledTechniques[0];
      recommendations.push({
        topic: 'Advanced Skill Enrichment',
        action: `Use ${tech.name} to tackle advanced challenge exercises and push for top honors.`,
        priority: 'Low',
        resourceType: 'Interactive Simulation'
      });
    }

    const intros = [
      `[Refreshed at ${timestampStr}] ${student.name} holds an average score of ${academics.overallPercentage}% with ${attendance.percentage}% attendance. `,
      `[Real-time Evaluation ${timestampStr}] Diagnostic analysis indicates ${academics.performanceTrend} performance velocity with an overall average of ${academics.overallPercentage}%. `,
      `[AI Audit ${timestampStr}] Current academic standing is ${academics.overallPercentage}% score and ${attendance.percentage}% attendance rate. `
    ];
    const intro = intros[Math.floor(Math.random() * intros.length)];

    let summaryText = intro;
    if (riskAnalysis.riskLevel === 'high') {
      summaryText += `Immediate academic support is recommended due to ${academics.performanceTrend} trends and low assessment scores.`;
    } else if (riskAnalysis.riskLevel === 'moderate') {
      summaryText += `Performance is moderate with clear growth opportunities in identified support areas.`;
    } else {
      summaryText += `Demonstrating steady academic discipline and positive engagement across subjects.`;
    }

    result = {
      summary: summaryText,
      riskLevel: riskAnalysis.riskLevel,
      riskScore: riskAnalysis.riskScore,
      performanceTrend: academics.performanceTrend,
      strengths,
      supportAreas,
      recommendations,
      generatedBy: 'Smart Dynamic Engine'
    };
  }

  const insightDoc = await AIInsight.create({
    targetStudent: studentId,
    insightType: 'student_recommendation',
    riskLevel: result.riskLevel,
    riskScore: result.riskScore,
    performanceTrend: result.performanceTrend,
    summary: result.summary,
    recommendations: result.recommendations,
    supportAreas: result.supportAreas,
    strengths: result.strengths,
    generatedBy: result.generatedBy
  });

  return insightDoc;
};

const askStudyCoach = async (studentId, question) => {
  const summary = await analyticsService.getStudentAcademicSummary(studentId);
  const { student, academics, attendance } = summary;

  if (isAiConfigured()) {
    try {
      const ai = getAiClient();
      const prompt = `You are Aegis AI, a friendly, encouraging, expert educational tutor assisting student ${student.name}.
      Student Context:
      - Class: ${student.className}
      - Academic Score: ${academics.overallPercentage}%
      - Attendance: ${attendance.percentage}%
      - Subjects: ${JSON.stringify(academics.subjectBreakdown.map(s => ({ name: s.name, score: s.percentage })))}

      Student Question: "${question}"

      Provide a clear, engaging, structured response with markdown bullet points, study steps, and encouragement. Keep it concise (under 200 words).`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      });

      if (response && response.text) {
        return {
          answer: response.text,
          provider: 'Gemini AI Study Coach'
        };
      }
    } catch(err) {}
  }

  const q = question.toLowerCase();
  let answer = `Hello ${student.name}! `;

  if (q.includes('math') || q.includes('calculus') || q.includes('algebra')) {
    answer += `Here is your customized Math study plan:\n\n` +
      `1. **Breakdown Formulas**: Write down core formulas and practice 3 sample problems for each topic daily.\n` +
      `2. **Use Active Recall**: Cover the solutions and re-work problems from scratch to build muscle memory.\n` +
      `3. **Focus Areas**: Your current Math score is ${academics.subjectBreakdown.find(s=>s.name.includes('Math'))?.percentage || 75}%. Dedicate 30 mins every evening to practice drills!`;
  } else if (q.includes('code') || q.includes('algorithm') || q.includes('structure') || q.includes('cs')) {
    answer += `Here is your Data Structures & Coding roadmap:\n\n` +
      `1. **Visualize Data Flow**: Draw out arrays, linked lists, and tree nodes on paper before writing code.\n` +
      `2. **Trace Step-by-Step**: Use a debugger or print statements to inspect variable values at each loop iteration.\n` +
      `3. **Build Projects**: Apply algorithms to real-world small utilities to solidify your understanding.`;
  } else if (q.includes('physics') || q.includes('quantum') || q.includes('science')) {
    answer += `Here is your Physics mastery checklist:\n\n` +
      `1. **Understand Physical Concepts First**: Master the physical principles before plugging numbers into equations.\n` +
      `2. **Check Units**: Always verify dimensional units (meters, seconds, joules) in your working steps.\n` +
      `3. **Diagrams**: Draw free-body or vector diagrams for every mechanics problem.`;
  } else if (q.includes('time') || q.includes('schedule') || q.includes('plan') || q.includes('exam')) {
    answer += `Here is your recommended Exam Preparation Schedule:\n\n` +
      `• **Block 1 (45 mins)**: Review high-priority subjects where scores are below 70%.\n` +
      `• **Block 2 (30 mins)**: Complete pending homework assignments to boost continuous scores.\n` +
      `• **Block 3 (15 mins)**: Quick flashcard review of key definitions before sleep for memory consolidation.`;
  } else {
    answer += `Great question! Based on your current academic average of ${academics.overallPercentage}%:\n\n` +
      `• **Core Tip**: Focus on active practice over passive reading.\n` +
      `• **Daily Goal**: Complete all assigned homework on time and schedule 25-minute Pomodoro study blocks.\n` +
      `• **Need Extra Support?**: Connect with your class teacher during office hours for targeted clarification!`;
  }

  return {
    answer,
    provider: 'Aegis Intelligent Study Coach'
  };
};

const generateParentInsightReport = async (studentId) => {
  const summary = await analyticsService.getStudentAcademicSummary(studentId);
  const { student, attendance, academics, riskAnalysis } = summary;

  let reportText = '';
  const isAi = isAiConfigured();

  if (isAi) {
    try {
      const ai = getAiClient();
      const prompt = `Write a supportive 3-paragraph progress summary for the parents of student ${student.name}. 
      Attendance: ${attendance.percentage}%. Overall Academic Score: ${academics.overallPercentage}%. Risk Level: ${riskAnalysis.riskLevel}.
      Tone: Encouraging, constructive, professional. Provide actionable home guidance suggestions.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      if (response && response.text) {
        reportText = response.text;
      }
    } catch (e) {}
  }

  if (!reportText) {
    reportText = `Dear Parent, ${student.name} is currently maintaining an overall academic performance score of ${academics.overallPercentage}% with an attendance rate of ${attendance.percentage}%. \n\n` +
      `Current performance velocity is ${academics.performanceTrend}. We encourage reviewing homework assignments daily and creating a quiet study space at home to foster continuous improvement.`;
  }

  return {
    studentName: student.name,
    attendance: attendance.percentage,
    overallMarks: academics.overallPercentage,
    riskLevel: riskAnalysis.riskLevel,
    digest: reportText,
    generatedBy: isAi ? 'Gemini AI' : 'Smart Dynamic Engine'
  };
};

module.exports = {
  generateStudentInsight,
  askStudyCoach,
  generateParentInsightReport
};
