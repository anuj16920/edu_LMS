const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all students - NO AUTH FOR TESTING
router.get('/', async (req, res) => {
  try {
    console.log('📥 GET /api/students called');
    const students = await User.find({ role: 'student' }).select('-password');
    console.log('✅ Found students:', students.length);
    res.json(students);
  } catch (error) {
    console.error('❌ Error fetching students:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new student - NO AUTH FOR TESTING
router.post('/', async (req, res) => {
  try {
    console.log('📥 POST /api/students called with:', req.body);
    const { fullName, email, rollNo, class: studentClass, year, gpa } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Student with this email already exists' });
    }

    // Create new student with default password
    const defaultPassword = 'Student@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const student = new User({
      fullName,
      email,
      password: hashedPassword,
      role: 'student',
      rollNo,
      class: studentClass,
      year,
      gpa: gpa || 0
    });

    await student.save();
    console.log('✅ Student created:', student._id);
    
    res.status(201).json({
      message: 'Student added successfully',
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        rollNo: student.rollNo,
        class: student.class,
        year: student.year,
        gpa: student.gpa,
        role: student.role
      }
    });
  } catch (error) {
    console.error('❌ Error adding student:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { fullName, email, rollNo, class: studentClass, year, gpa } = req.body;
    
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Student not found' });
    }

    student.fullName = fullName || student.fullName;
    student.email = email || student.email;
    student.rollNo = rollNo || student.rollNo;
    student.class = studentClass !== undefined ? studentClass : student.class;
    student.year = year || student.year;
    student.gpa = gpa !== undefined ? gpa : student.gpa;

    await student.save();
    
    res.json({
      message: 'Student updated successfully',
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        rollNo: student.rollNo,
        class: student.class,
        year: student.year,
        gpa: student.gpa,
        role: student.role
      }
    });
  } catch (error) {
    console.error('❌ Error updating student:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Student not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting student:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
