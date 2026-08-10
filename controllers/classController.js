const Class = require('../models/Class');
const Subject = require('../models/Subject');

const getClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('classTeacher students subjects')
      .sort({ gradeLevel: 1, name: 1 });

    res.status(200).json({ success: true, count: classes.length, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createClass = async (req, res) => {
  try {
    const { name, section, gradeLevel, teacherId } = req.body;

    const newClass = await Class.create({
      name,
      section,
      gradeLevel,
      classTeacher: teacherId || null
    });

    res.status(201).json({ success: true, message: 'Class created', data: newClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate('teacher').sort({ name: 1 });
    res.status(200).json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createSubject = async (req, res) => {
  try {
    const { name, code, description, teacherId } = req.body;

    const subject = await Subject.create({
      name,
      code,
      description,
      teacher: teacherId || null
    });

    res.status(201).json({ success: true, message: 'Subject created', data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getClasses,
  createClass,
  getSubjects,
  createSubject
};
