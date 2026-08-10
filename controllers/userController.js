const User = require('../models/User');
const Class = require('../models/Class');

const getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    
    const users = await User.find(filter)
      .populate('class parentOf subjectsTaught')
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, phone, classId } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = new User({
      name,
      email,
      password: password || 'password123',
      role,
      rollNumber,
      phone,
      class: classId || null
    });

    await user.save();

    if (role === 'student' && classId) {
      await Class.findByIdAndUpdate(classId, { $addToSet: { students: user._id } });
    }

    res.status(201).json({ success: true, message: 'User created successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, role, rollNumber, phone, classId } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.rollNumber = rollNumber !== undefined ? rollNumber : user.rollNumber;
    user.phone = phone !== undefined ? phone : user.phone;
    if (classId !== undefined) user.class = classId;

    await user.save();

    res.status(200).json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const linkParentToStudent = async (req, res) => {
  try {
    const { parentId, studentId } = req.body;

    const parent = await User.findById(parentId);
    if (!parent || parent.role !== 'parent') {
      return res.status(400).json({ success: false, message: 'Invalid parent account' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ success: false, message: 'Invalid student account' });
    }

    if (!parent.parentOf.includes(studentId)) {
      parent.parentOf.push(studentId);
      await parent.save();
    }

    res.status(200).json({ success: true, message: `Successfully linked ${student.name} to parent ${parent.name}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  linkParentToStudent
};
