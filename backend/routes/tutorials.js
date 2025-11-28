const express = require('express');
const router = express.Router();
const Tutorial = require('../models/Tutorial');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Get all tutorials
router.get('/', async (req, res) => {
  try {
    const tutorials = await Tutorial.find().sort({ createdAt: -1 });
    res.json(tutorials);
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single tutorial
router.get('/:id', async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }
    res.json(tutorial);
  } catch (error) {
    console.error('Error fetching tutorial:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload new tutorial
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, course, type, description } = req.body;

    // Get file type from extension
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let tutorialType = type || 'video';
    if (fileExtension === '.pdf') {
      tutorialType = 'pdf';
    }

    const tutorial = new Tutorial({
      title,
      course,
      type: tutorialType,
      description,
      fileName: req.file.originalname,
      filePath: `/uploads/tutorials/${req.file.filename}`,
      fileSize: req.file.size,
      uploadedBy: req.user.userId,
      uploadedByName: req.user.fullName || req.user.email
    });

    await tutorial.save();

    console.log('✅ Tutorial uploaded:', tutorial._id);
    res.status(201).json({
      message: 'Tutorial uploaded successfully',
      tutorial
    });
  } catch (error) {
    // Delete uploaded file if database save fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('❌ Error uploading tutorial:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update tutorial (metadata only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, course, description, duration } = req.body;
    
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }

    tutorial.title = title || tutorial.title;
    tutorial.course = course || tutorial.course;
    tutorial.description = description || tutorial.description;
    tutorial.duration = duration || tutorial.duration;

    await tutorial.save();
    
    res.json({
      message: 'Tutorial updated successfully',
      tutorial
    });
  } catch (error) {
    console.error('Error updating tutorial:', error);
    res.status(500).json({ error: error.message });
  }
});

// Increment view count
router.post('/:id/view', async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }

    tutorial.views += 1;
    await tutorial.save();
    
    res.json({ views: tutorial.views });
  } catch (error) {
    console.error('Error incrementing views:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete tutorial
router.delete('/:id', auth, async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../uploads/tutorials', path.basename(tutorial.filePath));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Tutorial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tutorial deleted successfully' });
  } catch (error) {
    console.error('Error deleting tutorial:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
