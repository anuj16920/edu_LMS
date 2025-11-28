const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
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

// ✅ GET all communities
router.get('/', async (req, res) => {
  try {
    const communities = await Community.find({ isActive: true })
      .populate('createdBy', 'fullName email role')
      .populate('members', 'fullName email role')
      .sort({ createdAt: -1 });

    console.log(`✅ Fetched ${communities.length} communities`);
    res.json(communities);
  } catch (error) {
    console.error('❌ Error fetching communities:', error);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
});

// ✅ GET single community by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('createdBy', 'fullName email role')
      .populate('members', 'fullName email role');

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    res.json(community);
  } catch (error) {
    console.error('❌ Error fetching community:', error);
    res.status(500).json({ error: 'Failed to fetch community' });
  }
});

// ✅ CREATE new community (only admin & alumni)
router.post('/', authenticate, async (req, res) => {
  try {
    // Check if user is admin or alumni
    if (req.userRole !== 'admin' && req.userRole !== 'alumni') {
      return res.status(403).json({ error: 'Only admin and alumni can create communities' });
    }

    const { title, description, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const community = new Community({
      title,
      description,
      category: category || 'General',
      createdBy: req.userId,
      createdByRole: req.userRole,
      members: [req.userId] // Creator is automatically a member
    });

    await community.save();
    
    const populatedCommunity = await Community.findById(community._id)
      .populate('createdBy', 'fullName email role')
      .populate('members', 'fullName email role');

    console.log('✅ Community created:', community._id);
    res.status(201).json(populatedCommunity);
  } catch (error) {
    console.error('❌ Error creating community:', error);
    res.status(500).json({ error: 'Failed to create community' });
  }
});

// ✅ JOIN community
router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if already a member
    if (community.members.includes(req.userId)) {
      return res.status(400).json({ error: 'Already a member of this community' });
    }

    community.members.push(req.userId);
    await community.save();

    const updatedCommunity = await Community.findById(community._id)
      .populate('createdBy', 'fullName email role')
      .populate('members', 'fullName email role');

    console.log('✅ User joined community:', req.userId, community._id);
    res.json(updatedCommunity);
  } catch (error) {
    console.error('❌ Error joining community:', error);
    res.status(500).json({ error: 'Failed to join community' });
  }
});

// ✅ LEAVE community
router.post('/:id/leave', authenticate, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if user is a member
    if (!community.members.includes(req.userId)) {
      return res.status(400).json({ error: 'Not a member of this community' });
    }

    // Don't allow creator to leave
    if (community.createdBy.toString() === req.userId) {
      return res.status(400).json({ error: 'Community creator cannot leave' });
    }

    community.members = community.members.filter(
      memberId => memberId.toString() !== req.userId
    );
    await community.save();

    console.log('✅ User left community:', req.userId, community._id);
    res.json({ message: 'Left community successfully' });
  } catch (error) {
    console.error('❌ Error leaving community:', error);
    res.status(500).json({ error: 'Failed to leave community' });
  }
});

// ✅ POST message in community
router.post('/:id/message', authenticate, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if user is a member
    if (!community.members.includes(req.userId)) {
      return res.status(403).json({ error: 'You must be a member to post messages' });
    }

    // Get user info
    const user = await User.findById(req.userId).select('fullName role');

    const newMessage = {
      userId: req.userId,
      userName: user.fullName,
      role: user.role,
      message: message.trim(),
      timestamp: new Date()
    };

    community.messages.push(newMessage);
    await community.save();

    console.log('✅ Message posted in community:', community._id);
    res.json(newMessage);
  } catch (error) {
    console.error('❌ Error posting message:', error);
    res.status(500).json({ error: 'Failed to post message' });
  }
});

module.exports = router;
