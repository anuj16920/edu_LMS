const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Get all groups for current user
router.get('/groups', auth, async (req, res) => {
  try {
    console.log('📥 Fetching groups for user:', req.user.email);
    const userId = req.user.userId;
    
    // Find groups where user is a member or it's a public group
    const groups = await Group.find({
      $or: [
        { 'members.userId': userId },
        { isPublic: true }
      ]
    }).sort({ createdAt: -1 });

    console.log('✅ Groups found:', groups.length);
    res.json(groups);
  } catch (error) {
    console.error('❌ Error fetching groups:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single group with messages
router.get('/groups/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member or admin
    const isMember = group.members.some(
      m => m.userId.toString() === req.user.userId
    );
    const isAdmin = req.user.role === 'admin';

    if (!isMember && !isAdmin && !group.isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(group);
  } catch (error) {
    console.error('❌ Error fetching group:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new group (Admin only)
router.post('/groups', auth, async (req, res) => {
  try {
    console.log('📤 Creating group by:', req.user.email);
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create groups' });
    }

    const { name, description, memberIds, facultyManagerIds, isPublic } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    let members = [];

    if (isPublic) {
      // Add all users to the group
      const allUsers = await User.find({});
      console.log('📊 Adding all users:', allUsers.length);
      members = allUsers.map(user => ({
        userId: user._id,
        name: user.fullName || user.email,
        role: user.role
      }));
    } else if (memberIds && memberIds.length > 0) {
      // Add selected users
      const users = await User.find({ _id: { $in: memberIds } });
      members = users.map(user => ({
        userId: user._id,
        name: user.fullName || user.email,
        role: user.role
      }));
    }

    // Always add creator
    const creator = await User.findById(req.user.userId);
    if (!members.some(m => m.userId.toString() === req.user.userId)) {
      members.push({
        userId: creator._id,
        name: creator.fullName || creator.email,
        role: creator.role
      });
    }

    const group = new Group({
      name,
      description: description || '',
      createdBy: req.user.userId,
      members,
      facultyManagers: facultyManagerIds || [],
      isPublic: isPublic || false
    });

    await group.save();

    console.log('✅ Group created:', group.name, 'with', members.length, 'members');
    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    console.error('❌ Error creating group:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send message in group - FIXED VERSION
router.post('/groups/:id/messages', auth, upload.single('file'), async (req, res) => {
  try {
    console.log('📤 Sending message in group:', req.params.id);
    console.log('👤 Sender:', req.user.email);
    console.log('💬 Message:', req.body.message);
    console.log('📎 File:', req.file ? req.file.filename : 'none');

    const { message, replyTo } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      console.log('❌ Group not found:', req.params.id);
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Group not found' });
    }

    console.log('✅ Group found:', group.name);
    console.log('👥 Members:', group.members.length);

    // Check if user is a member
    const isMember = group.members.some(
      m => m.userId && m.userId.toString() === req.user.userId
    );

    console.log('🔍 Is member:', isMember);
    console.log('🌍 Is public:', group.isPublic);

    if (!isMember && !group.isPublic) {
      console.log('❌ Access denied for user:', req.user.email);
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // If public group and user not in members, add them
    if (group.isPublic && !isMember) {
      console.log('➕ Adding user to public group');
      group.members.push({
        userId: req.user.userId,
        name: req.user.fullName || req.user.email,
        role: req.user.role
      });
    }

    const newMessage = {
      senderId: req.user.userId,
      senderName: req.user.fullName || req.user.email || 'User',
      senderRole: req.user.role || 'student',
      message: message || '',
      replyTo: replyTo || null
    };

    if (req.file) {
      newMessage.fileUrl = `/uploads/chat/${req.file.filename}`;
      newMessage.fileName = req.file.originalname;
      newMessage.fileSize = req.file.size;
      console.log('📎 File attached:', req.file.originalname);
    }

    console.log('💾 Saving message...');
    group.messages.push(newMessage);
    await group.save();

    console.log('✅ Message sent successfully!');
    res.status(201).json({
      message: 'Message sent successfully',
      group
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    console.error('Stack:', error.stack);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Error deleting file:', e);
      }
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Add members to group (Admin only)
router.post('/groups/:id/members', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can add members' });
    }

    const { memberIds } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const users = await User.find({ _id: { $in: memberIds } });
    
    users.forEach(user => {
      const exists = group.members.some(
        m => m.userId.toString() === user._id.toString()
      );
      if (!exists) {
        group.members.push({
          userId: user._id,
          name: user.fullName || user.email,
          role: user.role
        });
      }
    });

    await group.save();
    res.json({
      message: 'Members added successfully',
      group
    });
  } catch (error) {
    console.error('❌ Error adding members:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete group (Admin only)
router.delete('/groups/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete groups' });
    }

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Delete all chat files
    group.messages.forEach(msg => {
      if (msg.fileUrl) {
        const filePath = path.join(__dirname, '..', msg.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });

    await Group.findByIdAndDelete(req.params.id);
    console.log('✅ Group deleted:', group.name);
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting group:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users (for adding to groups)
router.get('/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const users = await User.find({}, 'fullName email role').sort({ fullName: 1 });
    res.json(users);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
