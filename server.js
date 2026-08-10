require('dotenv').config();
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const connectDB = require('./config/db');
const { initAI } = require('./config/ai');
const { seedDatabase } = require('./services/seedService');
const User = require('./models/User');

const viewRoutes = require('./routes/viewRoutes');
const authRoutes = require('./routes/api/v1/authRoutes');
const userRoutes = require('./routes/api/v1/userRoutes');
const classRoutes = require('./routes/api/v1/classRoutes');
const attendanceRoutes = require('./routes/api/v1/attendanceRoutes');
const markRoutes = require('./routes/api/v1/markRoutes');
const assignmentRoutes = require('./routes/api/v1/assignmentRoutes');
const aiRoutes = require('./routes/api/v1/aiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

initAI();

connectDB().then(async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server Startup] Database empty. Auto-seeding sample dataset...');
      await seedDatabase();
    }
  } catch (err) {
    console.warn('[Server Startup Notice]', err.message);
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'super_secret_student_system_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 }
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.currentPath = req.path;
  next();
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/marks', markRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/ai', aiRoutes);

app.use('/', viewRoutes);

app.use((req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
  }
  res.status(404).render('error', { title: '404 - Page Not Found', message: 'The page you requested could not be located.' });
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`⚡ Aegis Student Academic System Running on Port ${PORT}`);
  console.log(`🌐 Local Web Portal: http://localhost:${PORT}`);
  console.log(`🚀 REST API Base: http://localhost:${PORT}/api/v1`);
  console.log(`===================================================`);
});
