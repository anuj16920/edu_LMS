const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for video/PDF/chat files serving)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/students', require('./routes/students'));
app.use('/api/tutorials', require('./routes/tutorials'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/chatbot', require('./routes/chatbot')); // ✅ AI CHATBOT ROUTE ADDED

// Test Route
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ Education Portal Backend is Running!',
    database: 'MongoDB Connected',
    status: 'Active',
    routes: {
      auth: '/api/auth/register, /api/auth/login, /api/auth/google/url, /api/auth/google/callback',
      faculty: '/api/faculty (GET, POST, PUT, DELETE)',
      students: '/api/students (GET, POST, PUT, DELETE)',
      tutorials: '/api/tutorials (GET, POST, PUT, DELETE)',
      tests: '/api/tests (GET, POST, PUT, DELETE)',
      assignments: '/api/assignments (GET, POST, PUT, DELETE)',
      chat: '/api/chat (GET, POST, DELETE)',
      chatbot: '/api/chatbot/ask (POST), /api/chatbot/suggestions (GET)' // ✅ ADDED
    }
  });
});

// Test Database Connection Route
app.get('/api/test-db', async (req, res) => {
  try {
    const User = require('./models/User');
    const count = await User.countDocuments();
    res.json({ 
      message: 'Database connected successfully!',
      usersCount: count 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database error',
      error: error.message 
    });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth`);
  console.log(`👨‍🏫 Faculty routes: http://localhost:${PORT}/api/faculty`);
  console.log(`🎓 Student routes: http://localhost:${PORT}/api/students`);
  console.log(`📚 Tutorial routes: http://localhost:${PORT}/api/tutorials`);
  console.log(`📝 Test routes: http://localhost:${PORT}/api/tests`);
  console.log(`📋 Assignment routes: http://localhost:${PORT}/api/assignments`);
  console.log(`💬 Chat routes: http://localhost:${PORT}/api/chat`);
  console.log(`🤖 Chatbot routes: http://localhost:${PORT}/api/chatbot`);
  console.log(`🔑 Google auth URL: http://localhost:${PORT}/api/auth/google/url`);
});
