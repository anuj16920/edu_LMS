const mongoose = require('mongoose');

const mentorshipRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  // Denormalized fields for faster queries (no need to populate every time)
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  studentClass: {
    type: String,
    default: ''
  },
  studentYear: {
    type: String,
    default: ''
  },
  alumniName: {
    type: String,
    required: true
  },
  alumniCompany: {
    type: String,
    default: ''
  },
  alumniDesignation: {
    type: String,
    default: ''
  },
  respondedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for faster queries
mentorshipRequestSchema.index({ student: 1, status: 1 });
mentorshipRequestSchema.index({ alumni: 1, status: 1 });
mentorshipRequestSchema.index({ createdAt: -1 });

// Prevent duplicate pending requests
mentorshipRequestSchema.index(
  { student: 1, alumni: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

module.exports = mongoose.model('MentorshipRequest', mentorshipRequestSchema);
