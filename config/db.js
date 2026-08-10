const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_academic_system';
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000,
    });
    return conn;
  } catch (error) {
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('127.0.0.1') && !process.env.MONGODB_URI.includes('localhost')) {
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/student_academic_system', {
          serverSelectionTimeoutMS: 3000,
        });
        return localConn;
      } catch (localErr) {
        console.error(localErr.message);
      }
    }
  }
};

module.exports = connectDB;
