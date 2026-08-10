const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_academic_system';

    if (connStr.includes('mongodb.net/') && connStr.includes('?')) {
      if (connStr.match(/mongodb\.net\/\?/)) {
        connStr = connStr.replace('mongodb.net/?', 'mongodb.net/student_system?');
      }
    }

    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[Database] Connected to MongoDB Atlas: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Connection Error]: ${error.message}`);
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('127.0.0.1') && !process.env.MONGODB_URI.includes('localhost')) {
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/student_academic_system', {
          serverSelectionTimeoutMS: 4000,
        });
        return localConn;
      } catch (localErr) {
        console.error(localErr.message);
      }
    }
  }
};

module.exports = connectDB;
