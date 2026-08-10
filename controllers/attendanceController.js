const Attendance = require('../models/Attendance');
const User = require('../models/User');

const recordBatchAttendance = async (req, res) => {
  try {
    const { classId, date, records } = req.body;

    if (!classId || !records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Class ID and attendance records array required' });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    const ops = records.map(item => ({
      updateOne: {
        filter: {
          student: item.studentId,
          class: classId,
          date: attendanceDate
        },
        update: {
          $set: {
            status: item.status || 'present',
            remarks: item.remarks || '',
            recordedBy: req.user._id || req.user.id
          }
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(ops);

    res.status(200).json({
      success: true,
      message: `Successfully recorded attendance for ${records.length} students on ${attendanceDate.toISOString().split('T')[0]}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSessionAttendance = async (req, res) => {
  try {
    const { classId, date } = req.query;
    if (!classId || !date) {
      return res.status(400).json({ success: false, message: 'Class ID and date parameters required' });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const records = await Attendance.find({
      class: classId,
      date: { $gte: targetDate, $lt: nextDay }
    });

    const attendanceMap = {};
    records.forEach(r => {
      attendanceMap[r.student.toString()] = {
        status: r.status,
        remarks: r.remarks
      };
    });

    res.status(200).json({
      success: true,
      date: date,
      isAlreadyRecorded: records.length > 0,
      records: attendanceMap
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const records = await Attendance.find({ student: studentId })
      .populate('subject class')
      .sort({ date: -1 });

    const total = records.length;
    const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

    res.status(200).json({
      success: true,
      data: {
        totalDays: total,
        presentDays: present,
        percentage,
        history: records
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  recordBatchAttendance,
  getSessionAttendance,
  getStudentAttendance
};
