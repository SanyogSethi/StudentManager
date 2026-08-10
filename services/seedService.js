const User = require('../models/User');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Mark = require('../models/Mark');
const AIInsight = require('../models/AIInsight');
const aiEngine = require('./aiEngine');

const seedDatabase = async () => {
  console.log('[Seeder] Clearing old collection records...');
  await User.deleteMany({});
  await Class.deleteMany({});
  await Subject.deleteMany({});
  await Attendance.deleteMany({});
  await Assignment.deleteMany({});
  await Submission.deleteMany({});
  await Mark.deleteMany({});
  await AIInsight.deleteMany({});

  console.log('[Seeder] Creating Default Admin...');
  const admin = await User.create({
    name: 'System Administrator',
    email: 'admin@tpc.edu',
    password: 'password123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  });

  console.log('[Seeder] Creating Faculty Teachers...');
  const tShashi = await User.create({
    name: 'Shashi Bala',
    email: 'shashibala@tpc.edu',
    password: 'password123',
    role: 'teacher',
    phone: '+91-98765-00001',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  });

  const tAshita = await User.create({
    name: 'Ashita Sharma',
    email: 'ashita@tpc.edu',
    password: 'password123',
    role: 'teacher',
    phone: '+91-98765-00002',
    avatar: 'https://images.unsplash.com/photo-1580894732413-80d0d5718df7?w=150&auto=format&fit=crop&q=80'
  });

  const tAnkur = await User.create({
    name: 'Ankur Thakur',
    email: 'ankur@tpc.edu',
    password: 'password123',
    role: 'teacher',
    phone: '+91-98765-00003',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  });

  const tGagan = await User.create({
    name: 'Gagandeep Singh',
    email: 'gagandeep@tpc.edu',
    password: 'password123',
    role: 'teacher',
    phone: '+91-98765-00004',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  });

  const tRavina = await User.create({
    name: 'Ravina Sharma',
    email: 'ravina@tpc.edu',
    password: 'password123',
    role: 'teacher',
    phone: '+91-98765-00005',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  });

  const tTaran = await User.create({
    name: 'Tarandeep Kaur',
    email: 'tarandeep@tpc.edu',
    password: 'password123',
    role: 'teacher',
    phone: '+91-98765-00006',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80'
  });

  console.log('[Seeder] Creating CS Subjects...');
  const subDSA = await Subject.create({
    name: 'Data Structures & Algorithms',
    code: 'CS201',
    description: 'Arrays, Trees, Graphs, Sorting & Searching',
    teacher: tShashi._id
  });

  const subDBMS = await Subject.create({
    name: 'Database Management Systems',
    code: 'CS202',
    description: 'Relational Model, SQL, Normalization & Transactions',
    teacher: tAshita._id
  });

  const subOS = await Subject.create({
    name: 'Operating Systems & Networks',
    code: 'CS203',
    description: 'Process Synchronization, Memory Management & Protocols',
    teacher: tAnkur._id
  });

  const subSE = await Subject.create({
    name: 'Software Engineering',
    code: 'CS204',
    description: 'SDLC, Agile Methods & System Design',
    teacher: tGagan._id
  });

  const subWeb = await Subject.create({
    name: 'Web Technologies',
    code: 'CS205',
    description: 'Full Stack Development, Node.js & REST APIs',
    teacher: tRavina._id
  });

  const subAI = await Subject.create({
    name: 'Artificial Intelligence & ML',
    code: 'CS206',
    description: 'Neural Networks, Decision Trees & Model Evaluation',
    teacher: tTaran._id
  });

  console.log('[Seeder] Creating Students and Parents...');
  
  const pAshish = await User.create({ name: 'ASHISH NAGPAL', email: 'ashish@tpc.edu', password: 'password123', role: 'parent', phone: '+91-98111-10010', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' });
  const sMishthi = await User.create({ name: 'MISHTHI', email: 'mishthi@tpc.edu', password: 'password123', role: 'student', rollNumber: '10', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' });
  pAshish.parentOf = [sMishthi._id]; await pAshish.save();

  const pRohit = await User.create({ name: 'ROHIT KUMAR', email: 'rohit@tpc.edu', password: 'password123', role: 'parent', phone: '+91-98111-10011', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' });
  const sNaina = await User.create({ name: 'NAINA', email: 'naina@tpc.edu', password: 'password123', role: 'student', rollNumber: '11', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80' });
  pRohit.parentOf = [sNaina._id]; await pRohit.save();

  const pKala = await User.create({ name: 'KALA RAM', email: 'kalaram@tpc.edu', password: 'password123', role: 'parent', phone: '+91-98111-10012', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' });
  const sNatik = await User.create({ name: 'NATIK MEHTA', email: 'natik@tpc.edu', password: 'password123', role: 'student', rollNumber: '12', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' });
  pKala.parentOf = [sNatik._id]; await pKala.save();

  const pPrem = await User.create({ name: 'PREM CHAND', email: 'premchand@tpc.edu', password: 'password123', role: 'parent', phone: '+91-98111-10013', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' });
  const sNandani = await User.create({ name: 'NANDANI', email: 'nandani@tpc.edu', password: 'password123', role: 'student', rollNumber: '13', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' });
  pPrem.parentOf = [sNandani._id]; await pPrem.save();

  const pNitinC = await User.create({ name: 'NITIN CHUGH', email: 'nitinchugh@tpc.edu', password: 'password123', role: 'parent', phone: '+91-98111-10014', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80' });
  const sNirav = await User.create({ name: 'NIRAV CHUGH', email: 'nirav@tpc.edu', password: 'password123', role: 'student', rollNumber: '14', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' });
  pNitinC.parentOf = [sNirav._id]; await pNitinC.save();

  const pSuresh = await User.create({ name: 'SURESH KUMAR', email: 'suresh@tpc.edu', password: 'password123', role: 'parent', phone: '+91-98111-10015', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' });
  const sNitinK = await User.create({ name: 'NITIN KUMAR', email: 'nitinkumar@tpc.edu', password: 'password123', role: 'student', rollNumber: '15', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' });
  pSuresh.parentOf = [sNitinK._id]; await pSuresh.save();

  const pAmit = await User.create({ name: 'AMIT MONGA', email: 'amitmonga@tpc.edu', password: 'password123', role: 'parent', phone: '+91-98111-10016', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' });
  const sParth = await User.create({ name: 'PARTH MONGA', email: 'parth@tpc.edu', password: 'password123', role: 'student', rollNumber: '16', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' });
  pAmit.parentOf = [sParth._id]; await pAmit.save();

  const allStudents = [sMishthi, sNaina, sNatik, sNandani, sNirav, sNitinK, sParth];

  console.log('[Seeder] Creating CS Class...');
  const csClass = await Class.create({
    name: 'CS & AI Department (Section A)',
    section: 'A',
    gradeLevel: '3rd Year',
    classTeacher: tShashi._id,
    students: allStudents.map(s => s._id),
    subjects: [subDSA._id, subDBMS._id, subOS._id, subSE._id, subWeb._id, subAI._id]
  });

  for (const st of allStudents) {
    st.class = csClass._id;
    await st.save();
  }

  console.log('[Seeder] Seeding attendance for past 4 days...');
  const today = new Date();
  for (let dayOffset = 3; dayOffset >= 0; dayOffset--) {
    const d = new Date(today);
    d.setDate(d.getDate() - dayOffset);
    d.setHours(0, 0, 0, 0);

    for (const student of allStudents) {
      let status = 'present';
      let remarks = 'Regular attendance';

      if (student.rollNumber === '16' && (dayOffset === 1 || dayOffset === 2)) {
        status = 'absent';
        remarks = 'Unexcused Absence';
      } else if (student.rollNumber === '12' && dayOffset === 2) {
        status = 'late';
        remarks = 'Arrived 20 mins late';
      }

      await Attendance.create({
        student: student._id,
        class: csClass._id,
        subject: subDSA._id,
        date: d,
        status,
        remarks,
        recordedBy: tShashi._id
      });
    }
  }

  console.log('[Seeder] Creating CS assessment marks...');
  for (const student of allStudents) {
    let dsaScore = 88;
    let dbmsScore = 92;
    let osScore = 85;

    if (student.rollNumber === '16') {
      dsaScore = 48; dbmsScore = 52; osScore = 42;
    } else if (student.rollNumber === '10') {
      dsaScore = 96; dbmsScore = 94; osScore = 98;
    } else if (student.rollNumber === '11') {
      dsaScore = 90; dbmsScore = 88; osScore = 92;
    }

    await Mark.create({ student: student._id, class: csClass._id, subject: subDSA._id, examType: 'Midterm', title: 'DSA Midterm Assessment', obtainedMarks: dsaScore, totalMarks: 100, recordedBy: tShashi._id });
    await Mark.create({ student: student._id, class: csClass._id, subject: subDBMS._id, examType: 'Quiz', title: 'SQL & Normalization Quiz', obtainedMarks: dbmsScore, totalMarks: 100, recordedBy: tAshita._id });
    await Mark.create({ student: student._id, class: csClass._id, subject: subOS._id, examType: 'Midterm', title: 'OS Process Management', obtainedMarks: osScore, totalMarks: 100, recordedBy: tAnkur._id });
  }

  console.log('[Seeder] Creating CS Assignments & Submissions...');
  const assignment1 = await Assignment.create({
    title: 'Data Structures Trees & Graphs Project',
    description: 'Build a BST and Graph traversal visualizer in JavaScript',
    class: csClass._id,
    subject: subDSA._id,
    teacher: tShashi._id,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    maxMarks: 100
  });

  await Submission.create({
    assignment: assignment1._id,
    student: sMishthi._id,
    content: 'https://github.com/mishthi/bst-graph-visualizer',
    status: 'graded',
    obtainedMarks: 98,
    feedback: 'Outstanding implementation and visualizer UI!',
    gradedBy: tShashi._id
  });

  console.log('[Seeder] Triggering initial AI Insights...');
  await aiEngine.generateStudentInsight(sMishthi._id);
  await aiEngine.generateStudentInsight(sParth._id);

  console.log('[Seeder] Database seeding with updated student & teacher records completed!');
};

module.exports = { seedDatabase };
