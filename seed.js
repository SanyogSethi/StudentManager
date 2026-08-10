require('dotenv').config();
const connectDB = require('./config/db');
const { initAI } = require('./config/ai');
const { seedDatabase } = require('./services/seedService');

const run = async () => {
  try {
    initAI();
    await connectDB();
    await seedDatabase();
    process.exit(0);
  } catch (err) {
    console.error('[Seeder Error]', err);
    process.exit(1);
  }
};

run();
