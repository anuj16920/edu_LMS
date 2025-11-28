const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const auth = require('../middleware/auth');

// Get all tests
router.get('/', async (req, res) => {
  try {
    const tests = await Test.find().sort({ createdAt: -1 });
    res.json(tests);
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single test
router.get('/:id', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    res.json(test);
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new test
router.post('/', auth, async (req, res) => {
  try {
    const { title, course, duration, totalQuestions, questions, isActive } = req.body;

    if (!title || !course || !duration || !totalQuestions) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (questions.length !== totalQuestions) {
      return res.status(400).json({ 
        error: `Number of questions (${questions.length}) doesn't match total questions (${totalQuestions})` 
      });
    }

    const test = new Test({
      title,
      course,
      duration,
      totalQuestions,
      questions,
      isActive: isActive || false,
      createdBy: req.user.userId,
      createdByName: req.user.fullName || req.user.email
    });

    await test.save();

    console.log('✅ Test created:', test._id);
    res.status(201).json({
      message: 'Test created successfully',
      test
    });
  } catch (error) {
    console.error('❌ Error creating test:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update test
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, course, duration, totalQuestions, questions, isActive } = req.body;
    
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    if (title) test.title = title;
    if (course) test.course = course;
    if (duration) test.duration = duration;
    if (totalQuestions) test.totalQuestions = totalQuestions;
    if (questions) test.questions = questions;
    if (isActive !== undefined) test.isActive = isActive;
    test.updatedAt = Date.now();

    await test.save();
    
    res.json({
      message: 'Test updated successfully',
      test
    });
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ error: error.message });
  }
});

// Toggle test active status
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    test.isActive = !test.isActive;
    test.updatedAt = Date.now();
    await test.save();
    
    res.json({
      message: `Test ${test.isActive ? 'activated' : 'deactivated'} successfully`,
      test
    });
  } catch (error) {
    console.error('Error toggling test:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete test
router.delete('/:id', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    await Test.findByIdAndDelete(req.params.id);
    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get test statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalTests = await Test.countDocuments();
    const activeTests = await Test.countDocuments({ isActive: true });
    const tests = await Test.find();
    
    const totalAttempts = tests.reduce((sum, test) => sum + test.attempts, 0);
    const avgScore = tests.length > 0
      ? tests.reduce((sum, test) => sum + test.averageScore, 0) / tests.length
      : 0;

    res.json({
      totalTests,
      activeTests,
      totalAttempts,
      averageScore: Math.round(avgScore)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
