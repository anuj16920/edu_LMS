const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all faculty members
router.get('/', auth, async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty' }).select('-password');
    res.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new faculty member
router.post('/', auth, async (req, res) => {
  try {
    const { fullName, email, phone, department, courses } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Faculty member with this email already exists' });
    }

    // Create new faculty member with default password
    const defaultPassword = 'Faculty@123'; // They can change it later
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const faculty = new User({
      fullName,
      email,
      password: hashedPassword,
      role: 'faculty',
      phone,
      department,
      courses: courses ? courses.split(',').map(c => c.trim()) : []
    });

    await faculty.save();
    
    res.status(201).json({
      message: 'Faculty member added successfully',
      faculty: {
        id: faculty._id,
        fullName: faculty.fullName,
        email: faculty.email,
        phone: faculty.phone,
        department: faculty.department,
        courses: faculty.courses,
        role: faculty.role
      }
    });
  } catch (error) {
    console.error('Error adding faculty:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update faculty member
router.put('/:id', auth, async (req, res) => {
  try {
    const { fullName, email, phone, department, courses } = req.body;
    
    const faculty = await User.findById(req.params.id);
    if (!faculty || faculty.role !== 'faculty') {
      return res.status(404).json({ error: 'Faculty member not found' });
    }

    faculty.fullName = fullName || faculty.fullName;
    faculty.email = email || faculty.email;
    faculty.phone = phone || faculty.phone;
    faculty.department = department || faculty.department;
    faculty.courses = courses ? courses.split(',').map(c => c.trim()) : faculty.courses;

    await faculty.save();
    
    res.json({
      message: 'Faculty member updated successfully',
      faculty: {
        id: faculty._id,
        fullName: faculty.fullName,
        email: faculty.email,
        phone: faculty.phone,
        department: faculty.department,
        courses: faculty.courses,
        role: faculty.role
      }
    });
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete faculty member
router.delete('/:id', auth, async (req, res) => {
  try {
    const faculty = await User.findById(req.params.id);
    if (!faculty || faculty.role !== 'faculty') {
      return res.status(404).json({ error: 'Faculty member not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Faculty member deleted successfully' });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
