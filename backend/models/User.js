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
    enum: ['admin', 'faculty', 'student', 'alumni'],
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
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },

  // ✅ NEW: Ban fields
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String,
    default: '',
    trim: true
  },
  bannedAt: {
    type: Date
  },

  // ✅ Alumni-specific fields
  phoneNumber: {
    type: String,
    default: ''
  },
  graduationYear: {
    type: String,
    default: ''
  },
  currentCompany: {
    type: String,
    default: ''
  },
  designation: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  linkedIn: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  skills: {
    type: [String],
    default: []
  },
  previousCompanies: {
    type: [String],
    default: []
  },
  openToMentorship: {
    type: Boolean,
    default: false
  },
  openToReferrals: {
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
