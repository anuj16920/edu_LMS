const express = require('express');
const router = express.Router();
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

// ✅ GET all alumni (public - for directory)
router.get('/', async (req, res) => {
  try {
    const alumni = await User.find({ role: 'alumni' })
      .select('-password -googleId')
      .sort({ createdAt: -1 });

    console.log(`✅ Fetched ${alumni.length} alumni profiles`);
    res.json(alumni);
  } catch (error) {
    console.error('❌ Error fetching alumni:', error);
    res.status(500).json({ error: 'Failed to fetch alumni' });
  }
});

// ✅ GET single alumni profile by ID
router.get('/profile/:id', authenticate, async (req, res) => {
  try {
    const alumni = await User.findById(req.params.id).select('-password -googleId');
    
    if (!alumni) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    res.json(alumni);
  } catch (error) {
    console.error('❌ Error fetching alumni profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ✅ UPDATE alumni profile (only own profile)
router.put('/profile/:id', authenticate, async (req, res) => {
  try {
    // Check if user is updating their own profile
    if (req.userId !== req.params.id) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const {
      fullName,
      phoneNumber,
      graduationYear,
      currentCompany,
      designation,
      location,
      linkedIn,
      bio,
      skills,
      previousCompanies,
      openToMentorship,
      openToReferrals
    } = req.body;

    const updatedAlumni = await User.findByIdAndUpdate(
      req.params.id,
      {
        fullName,
        phoneNumber,
        graduationYear,
        currentCompany,
        designation,
        location,
        linkedIn,
        bio,
        skills,
        previousCompanies,
        openToMentorship,
        openToReferrals,
        updatedAt: Date.now()
      },
      { new: true }
    ).select('-password -googleId');

    console.log('✅ Alumni profile updated:', updatedAlumni._id);
    res.json(updatedAlumni);
  } catch (error) {
    console.error('❌ Error updating alumni profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ✅ GET dashboard stats for alumni
router.get('/dashboard-stats', authenticate, async (req, res) => {
  try {
    const totalAlumni = await User.countDocuments({ role: 'alumni' });
    
    // TODO: Add real community and mentorship counts when those models are ready
    res.json({
      totalAlumni,
      communitiesJoined: 0, // Placeholder
      mentorshipRequests: 0, // Placeholder
      profileCompletion: 75 // Placeholder - can calculate based on filled fields
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ✅ SEARCH alumni by filters
router.post('/search', async (req, res) => {
  try {
    const { query, skills, company, year } = req.body;
    let filter = { role: 'alumni' };

    // Text search in name, company, bio
    if (query) {
      filter.$or = [
        { fullName: { $regex: query, $options: 'i' } },
        { currentCompany: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } }
      ];
    }

    // Filter by skills
    if (skills && skills.length > 0) {
      filter.skills = { $in: skills };
    }

    // Filter by company
    if (company) {
      filter.currentCompany = { $regex: company, $options: 'i' };
    }

    // Filter by graduation year
    if (year) {
      filter.graduationYear = year;
    }

    const alumni = await User.find(filter).select('-password -googleId');
    res.json(alumni);
  } catch (error) {
    console.error('❌ Error searching alumni:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
