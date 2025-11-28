// backend/routes/adminUsers.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Helper: ensure admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET all users (for admin management page)
router.get('/', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password') // never send password
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// BAN user
router.post('/:id/ban', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Ban reason is required' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot ban another admin' });
    }

    user.isBanned = true;
    user.banReason = reason.trim();
    user.bannedAt = new Date();
    await user.save();

    res.json({
      message: 'User banned successfully',
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isBanned: user.isBanned,
        banReason: user.banReason,
        bannedAt: user.bannedAt,
      },
    });
  } catch (err) {
    console.error('Error banning user:', err);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

// UNBAN user
router.post('/:id/unban', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isBanned = false;
    user.banReason = '';
    user.bannedAt = null;
    await user.save();

    res.json({
      message: 'User unbanned successfully',
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isBanned: user.isBanned,
      },
    });
  } catch (err) {
    console.error('Error unbanning user:', err);
    res.status(500).json({ error: 'Failed to unban user' });
  }
});

module.exports = router;
