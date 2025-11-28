const express = require('express');
const router = express.Router();
const MentorshipRequest = require('../models/MentorshipRequest');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticate = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ✅ POST - Send mentorship request (Student only)
router.post('/request', authenticate, async (req, res) => {
  try {
    // Check if user is a student
    if (req.userRole !== 'student') {
      return res.status(403).json({ error: 'Only students can send mentorship requests' });
    }

    const { alumniId, message } = req.body;

    if (!alumniId || !message) {
      return res.status(400).json({ error: 'Alumni ID and message are required' });
    }

    if (message.length > 500) {
      return res.status(400).json({ error: 'Message too long (max 500 characters)' });
    }

    // Get student details
    const student = await User.findById(req.userId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get alumni details
    const alumni = await User.findById(alumniId);
    if (!alumni) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    if (alumni.role !== 'alumni') {
      return res.status(400).json({ error: 'Selected user is not an alumni' });
    }

    if (!alumni.openToMentorship) {
      return res.status(400).json({ error: 'This alumni is not accepting mentorship requests' });
    }

    // Check if there's already a pending request
    const existingRequest = await MentorshipRequest.findOne({
      student: req.userId,
      alumni: alumniId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'You already have a pending request to this alumni' });
    }

    // Create mentorship request
    const mentorshipRequest = new MentorshipRequest({
      student: req.userId,
      alumni: alumniId,
      message: message.trim(),
      studentName: student.fullName,
      studentEmail: student.email,
      studentClass: student.class || '',
      studentYear: student.year || '',
      alumniName: alumni.fullName,
      alumniCompany: alumni.currentCompany || '',
      alumniDesignation: alumni.designation || ''
    });

    await mentorshipRequest.save();

    console.log('✅ Mentorship request created:', mentorshipRequest._id);
    res.status(201).json({
      message: 'Mentorship request sent successfully',
      request: mentorshipRequest
    });
  } catch (error) {
    console.error('❌ Error creating mentorship request:', error);
    res.status(500).json({ error: 'Failed to send mentorship request' });
  }
});

// ✅ GET - Get all my sent requests (Student only)
router.get('/my-requests', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'student') {
      return res.status(403).json({ error: 'Only students can access this' });
    }

    const requests = await MentorshipRequest.find({ student: req.userId })
      .populate('alumni', 'fullName email currentCompany designation')
      .sort({ createdAt: -1 });

    console.log(`✅ Fetched ${requests.length} mentorship requests for student`);
    res.json(requests);
  } catch (error) {
    console.error('❌ Error fetching student requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// ✅ GET - Get all incoming requests (Alumni only)
router.get('/incoming', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'alumni') {
      return res.status(403).json({ error: 'Only alumni can access this' });
    }

    const requests = await MentorshipRequest.find({ alumni: req.userId })
      .populate('student', 'fullName email class year')
      .sort({ status: 1, createdAt: -1 }); // Pending first, then by date

    console.log(`✅ Fetched ${requests.length} incoming mentorship requests for alumni`);
    res.json(requests);
  } catch (error) {
    console.error('❌ Error fetching alumni requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// ✅ PUT - Accept mentorship request (Alumni only)
router.put('/:id/accept', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'alumni') {
      return res.status(403).json({ error: 'Only alumni can accept requests' });
    }

    const request = await MentorshipRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check if this alumni owns this request
    if (request.alumni.toString() !== req.userId) {
      return res.status(403).json({ error: 'You can only respond to your own requests' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already responded to' });
    }

    request.status = 'accepted';
    request.respondedAt = new Date();
    await request.save();

    const populatedRequest = await MentorshipRequest.findById(request._id)
      .populate('student', 'fullName email class year');

    console.log('✅ Mentorship request accepted:', request._id);
    res.json({
      message: 'Mentorship request accepted',
      request: populatedRequest
    });
  } catch (error) {
    console.error('❌ Error accepting request:', error);
    res.status(500).json({ error: 'Failed to accept request' });
  }
});

// ✅ PUT - Reject mentorship request (Alumni only)
router.put('/:id/reject', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'alumni') {
      return res.status(403).json({ error: 'Only alumni can reject requests' });
    }

    const { reason } = req.body;

    const request = await MentorshipRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check if this alumni owns this request
    if (request.alumni.toString() !== req.userId) {
      return res.status(403).json({ error: 'You can only respond to your own requests' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already responded to' });
    }

    request.status = 'rejected';
    request.respondedAt = new Date();
    request.rejectionReason = reason || 'No reason provided';
    await request.save();

    const populatedRequest = await MentorshipRequest.findById(request._id)
      .populate('student', 'fullName email class year');

    console.log('✅ Mentorship request rejected:', request._id);
    res.json({
      message: 'Mentorship request rejected',
      request: populatedRequest
    });
  } catch (error) {
    console.error('❌ Error rejecting request:', error);
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

// ✅ GET - Get my mentees (Alumni only - accepted requests)
router.get('/my-mentees', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'alumni') {
      return res.status(403).json({ error: 'Only alumni can access this' });
    }

    const mentees = await MentorshipRequest.find({
      alumni: req.userId,
      status: 'accepted'
    })
      .populate('student', 'fullName email class year')
      .sort({ respondedAt: -1 });

    console.log(`✅ Fetched ${mentees.length} mentees for alumni`);
    res.json(mentees);
  } catch (error) {
    console.error('❌ Error fetching mentees:', error);
    res.status(500).json({ error: 'Failed to fetch mentees' });
  }
});

// ✅ GET - Get mentorship stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    let stats = {};

    if (req.userRole === 'student') {
      const total = await MentorshipRequest.countDocuments({ student: req.userId });
      const pending = await MentorshipRequest.countDocuments({ student: req.userId, status: 'pending' });
      const accepted = await MentorshipRequest.countDocuments({ student: req.userId, status: 'accepted' });
      const rejected = await MentorshipRequest.countDocuments({ student: req.userId, status: 'rejected' });

      stats = { total, pending, accepted, rejected };
    } else if (req.userRole === 'alumni') {
      const total = await MentorshipRequest.countDocuments({ alumni: req.userId });
      const pending = await MentorshipRequest.countDocuments({ alumni: req.userId, status: 'pending' });
      const accepted = await MentorshipRequest.countDocuments({ alumni: req.userId, status: 'accepted' });
      const rejected = await MentorshipRequest.countDocuments({ alumni: req.userId, status: 'rejected' });

      stats = { total, pending, accepted, rejected };
    }

    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
