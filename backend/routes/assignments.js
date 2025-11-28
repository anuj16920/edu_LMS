const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Get all assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new assignment
router.post('/', auth, async (req, res) => {
  try {
    const { title, course, description, deadline, totalMarks } = req.body;

    if (!title || !course || !deadline || !totalMarks) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const assignment = new Assignment({
      title,
      course,
      description,
      deadline,
      totalMarks,
      createdBy: req.user.userId,
      createdByName: req.user.fullName || req.user.email
    });

    await assignment.save();

    console.log('✅ Assignment created:', assignment._id);
    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('❌ Error creating assignment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit assignment (Student)
router.post('/:id/submit', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if student already submitted
    const existingSubmission = assignment.submissions.find(
      s => s.studentId.toString() === req.user.userId
    );

    if (existingSubmission) {
      // Delete old file
      const oldFilePath = path.join(__dirname, '..', existingSubmission.filePath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      // Remove old submission
      assignment.submissions = assignment.submissions.filter(
        s => s.studentId.toString() !== req.user.userId
      );
    }

    // Add new submission
    assignment.submissions.push({
      studentId: req.user.userId,
      studentName: req.user.fullName || req.user.email,
      studentEmail: req.user.email,
      filePath: `/uploads/assignments/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });

    await assignment.save();

    console.log('✅ Assignment submitted by:', req.user.email);
    res.status(201).json({
      message: 'Assignment submitted successfully',
      assignment
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('❌ Error submitting assignment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Grade submission (Faculty/Admin)
router.post('/:assignmentId/grade/:submissionId', auth, async (req, res) => {
  try {
    const { grade, feedback } = req.body;

    if (grade === undefined || grade === null) {
      return res.status(400).json({ error: 'Grade is required' });
    }

    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    submission.grade = grade;
    submission.feedback = feedback || '';
    submission.status = 'graded';

    await assignment.save();

    res.json({
      message: 'Submission graded successfully',
      assignment
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete assignment
router.delete('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Delete all submission files
    assignment.submissions.forEach(sub => {
      const filePath = path.join(__dirname, '..', sub.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get assignment statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const assignments = await Assignment.find();
    
    const totalAssignments = assignments.length;
    const ongoingAssignments = assignments.filter(a => a.status === 'ongoing').length;
    const totalSubmissions = assignments.reduce((sum, a) => sum + a.submissions.length, 0);
    
    const gradedSubmissions = assignments.reduce((acc, a) => {
      return acc + a.submissions.filter(s => s.grade !== null).length;
    }, 0);

    const avgScore = gradedSubmissions > 0
      ? Math.round(assignments.reduce((sum, a) => {
          const graded = a.submissions.filter(s => s.grade !== null);
          const total = graded.reduce((s, sub) => s + sub.grade, 0);
          return sum + total;
        }, 0) / gradedSubmissions)
      : 0;

    res.json({
      totalAssignments,
      ongoingAssignments,
      totalSubmissions,
      averageScore: avgScore
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
