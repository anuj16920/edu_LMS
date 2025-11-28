const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Tutorial = require('../models/Tutorial');
const { generateCaptions } = require('../services/captionService');
const authMiddleware = require('../middleware/auth'); // ✅ NEW

// Multer storage configuration for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/videos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|mov|avi|mkv|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video or PDF files are allowed!'));
    }
  }
});

// GET all tutorials
router.get('/', async (req, res) => {
  try {
    const tutorials = await Tutorial.find().sort({ createdAt: -1 });
    res.json(tutorials);
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    res.status(500).json({ error: 'Failed to fetch tutorials' });
  }
});

// GET single tutorial by ID
router.get('/:id', async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }
    res.json(tutorial);
  } catch (error) {
    console.error('Error fetching tutorial:', error);
    res.status(500).json({ error: 'Failed to fetch tutorial' });
  }
});

// POST create new tutorial with file upload
// ✅ Added authMiddleware
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { title, description, course, type } = req.body;

    console.log('📥 Received upload request:');
    console.log('- Title:', title);
    console.log('- Course:', course);
    console.log('- Type:', type);
    console.log('- File:', req.file ? req.file.filename : 'No file');
    console.log('- User:', req.user ? `${req.user.fullName} (${req.user.email})` : 'No user');

    if (!title || !course || !type || !req.file) {
      return res.status(400).json({ error: 'Title, course, type and file are required' });
    }

    const filePath = `/uploads/videos/${req.file.filename}`;
    const fullPath = path.join(__dirname, '../uploads/videos', req.file.filename);

    // ✅ Create tutorial with authenticated user
    const tutorial = new Tutorial({
      title,
      description: description || '',
      course,
      type,
      fileName: req.file.filename,
      filePath,
      fileSize: req.file.size,
      uploadedBy: req.user.id || req.user._id,  // ✅ From authenticated user
      uploadedByName: req.user.fullName || req.user.name || 'Unknown',  // ✅ From authenticated user
      captionsStatus: type === 'video' ? 'generating' : 'not_started'
    });

    await tutorial.save();
    console.log('✅ Tutorial created:', tutorial._id, 'by', tutorial.uploadedByName);

    // ✅ Generate captions only for videos
    if (type === 'video') {
      generateCaptions(fullPath)
        .then(async (result) => {
          console.log('✅ Captions generated successfully for tutorial:', tutorial._id);
          
          // Update tutorial with caption URLs
          tutorial.captionsUrl = filePath.replace(/\.(mp4|mov|avi|mkv)$/i, '.vtt');
          tutorial.captionsStatus = 'completed';
          await tutorial.save();
          
          console.log('✅ Tutorial updated with caption URLs');
        })
        .catch(async (err) => {
          console.error('❌ Caption generation failed for tutorial:', tutorial._id, err.message);
          
          // Update status to failed
          tutorial.captionsStatus = 'failed';
          await tutorial.save();
        });
    }

    res.status(201).json({
      message: 'Tutorial uploaded successfully',
      tutorial,
      captionsGenerating: type === 'video'
    });
  } catch (error) {
    console.error('❌ Error creating tutorial:', error);
    res.status(500).json({ error: 'Failed to create tutorial' });
  }
});

// PUT update tutorial
// ✅ Added authMiddleware
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, course } = req.body;

    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }

    // Update fields
    if (title) tutorial.title = title;
    if (description !== undefined) tutorial.description = description;
    if (course) tutorial.course = course;

    await tutorial.save();
    console.log('✅ Tutorial updated:', tutorial._id);

    res.json({
      message: 'Tutorial updated successfully',
      tutorial
    });
  } catch (error) {
    console.error('❌ Error updating tutorial:', error);
    res.status(500).json({ error: 'Failed to update tutorial' });
  }
});

// DELETE tutorial
// ✅ Added authMiddleware
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }

    // Delete video file
    const videoPath = path.join(__dirname, '../uploads/videos', tutorial.fileName);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
      console.log('🗑️ Video file deleted:', videoPath);
    }

    // Delete caption files if they exist
    const srtPath = videoPath.replace(/\.(mp4|mov|avi|mkv)$/i, '.srt');
    const vttPath = videoPath.replace(/\.(mp4|mov|avi|mkv)$/i, '.vtt');
    
    if (fs.existsSync(srtPath)) {
      fs.unlinkSync(srtPath);
      console.log('🗑️ SRT caption file deleted');
    }
    
    if (fs.existsSync(vttPath)) {
      fs.unlinkSync(vttPath);
      console.log('🗑️ VTT caption file deleted');
    }

    await Tutorial.findByIdAndDelete(req.params.id);
    console.log('✅ Tutorial deleted:', req.params.id);

    res.json({ message: 'Tutorial deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting tutorial:', error);
    res.status(500).json({ error: 'Failed to delete tutorial' });
  }
});

// ✅ Get caption status for a tutorial
router.get('/:id/captions/status', async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }

    res.json({
      status: tutorial.captionsStatus || 'not_started',
      captionsUrl: tutorial.captionsUrl || null
    });
  } catch (error) {
    console.error('❌ Error fetching caption status:', error);
    res.status(500).json({ error: 'Failed to fetch caption status' });
  }
});

// ✅ Manually regenerate captions
// ✅ Added authMiddleware
router.post('/:id/captions/regenerate', authMiddleware, async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }

    if (tutorial.type !== 'video') {
      return res.status(400).json({ error: 'Captions can only be generated for videos' });
    }

    const videoPath = path.join(__dirname, '../uploads/videos', tutorial.fileName);
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: 'Video file not found' });
    }

    // Update status
    tutorial.captionsStatus = 'generating';
    await tutorial.save();

    // Generate captions
    generateCaptions(videoPath)
      .then(async (result) => {
        tutorial.captionsUrl = tutorial.filePath.replace(/\.(mp4|mov|avi|mkv)$/i, '.vtt');
        tutorial.captionsStatus = 'completed';
        await tutorial.save();
        console.log('✅ Captions regenerated for tutorial:', tutorial._id);
      })
      .catch(async (err) => {
        console.error('❌ Caption regeneration failed:', err.message);
        tutorial.captionsStatus = 'failed';
        await tutorial.save();
      });

    res.json({
      message: 'Caption generation started',
      status: 'generating'
    });
  } catch (error) {
    console.error('❌ Error regenerating captions:', error);
    res.status(500).json({ error: 'Failed to regenerate captions' });
  }
});

module.exports = router;
