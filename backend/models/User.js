const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    // Not always required now (Google login users may not have password)
  },
  fullName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'faculty', 'student'],
    required: true,
    default: 'student'
  },
  avatarUrl: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  rollNo: {
    type: String,
    sparse: true
  },
  class: {
    type: String,
    default: null
  },
  year: {
    type: String,
    default: null
  },
  gpa: {
    type: Number,
    default: 0
  },
  department: {
    type: String,
    default: null
  },
  subjects: [{
    type: String
  }],
  courses: [{
    type: String
  }],
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  googleId: { // Added for Google OAuth
    type: String,
    unique: true,
    sparse: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
