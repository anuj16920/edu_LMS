const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['class', 'exam', 'meeting', 'deadline', 'event', 'holiday'],
    default: 'event'
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    default: '09:00'
  },
  duration: {
    type: String,
    default: '1 hour'
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
