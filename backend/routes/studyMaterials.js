// backend/routes/studyMaterials.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const StudyMaterial = require('../models/StudyMaterial');
const authMiddleware = require('../middleware/auth');

// Storage for study material files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/materials');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'material-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
});

// GET all materials (for students/admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { role } = req.user;

    const query = {};
    if (role !== 'admin') {
      query.status = 'active';
    }

    const materials = await StudyMaterial.find(query)
      .sort({ isPinned: -1, createdAt: -1 });

    res.json(materials);
  } catch (err) {
    console.error('Error fetching study materials:', err);
    res.status(500).json({ error: 'Failed to fetch study materials' });
  }
});

// GET materials uploaded by current faculty
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const materials = await StudyMaterial.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (err) {
    console.error('Error fetching my materials:', err);
    res.status(500).json({ error: 'Failed to fetch your materials' });
  }
});

// CREATE new material (faculty only)
router.post(
  '/',
  authMiddleware,
  upload.array('files', 10),
  async (req, res) => {
    try {
      if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only faculty or admin can upload materials' });
      }

      const { title, description, subject, course } = req.body;

      if (!title || !subject || !course) {
        return res.status(400).json({ error: 'Title, subject and course are required' });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'At least one file is required' });
      }

      const files = req.files.map((file) => ({
        filename: file.originalname,
        url: `/uploads/materials/${file.filename}`,
        size: file.size,
      }));

      const material = new StudyMaterial({
        title,
        description: description || '',
        subject,
        course,
        files,
        uploadedBy: req.user._id,
        uploadedByName: req.user.fullName || req.user.name || req.user.email,
      });

      await material.save();

      res.status(201).json({
        message: 'Study material uploaded successfully',
        material,
      });
    } catch (err) {
      console.error('Error creating study material:', err);
      res.status(500).json({ error: 'Failed to create study material' });
    }
  },
);

// UPDATE material (only owner or admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    if (
      req.user.role !== 'admin' &&
      String(material.uploadedBy) !== String(req.user._id)
    ) {
      return res.status(403).json({ error: 'Not allowed to edit this material' });
    }

    const { title, description, subject, course, isPinned, status } = req.body;

    if (title !== undefined) material.title = title;
    if (description !== undefined) material.description = description;
    if (subject !== undefined) material.subject = subject;
    if (course !== undefined) material.course = course;
    if (isPinned !== undefined) material.isPinned = isPinned;

    // Only admin can change status
    if (status && req.user.role === 'admin') {
      material.status = status;
    }

    await material.save();

    res.json({ message: 'Material updated', material });
  } catch (err) {
    console.error('Error updating material:', err);
    res.status(500).json({ error: 'Failed to update material' });
  }
});

// DELETE material (only owner or admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    if (
      req.user.role !== 'admin' &&
      String(material.uploadedBy) !== String(req.user._id)
    ) {
      return res.status(403).json({ error: 'Not allowed to delete this material' });
    }

    // Remove files from disk
    material.files.forEach((file) => {
      const filePath = path.join(__dirname, '..', file.url.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await StudyMaterial.findByIdAndDelete(req.params.id);

    res.json({ message: 'Material deleted successfully' });
  } catch (err) {
    console.error('Error deleting material:', err);
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

// INCREMENT downloads
router.post('/:id/download', authMiddleware, async (req, res) => {
  try {
    const material = await StudyMaterial.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true },
    );
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json({ downloads: material.downloads });
  } catch (err) {
    console.error('Error incrementing downloads:', err);
    res.status(500).json({ error: 'Failed to update downloads' });
  }
});

// LIKE / UNLIKE material
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const { direction } = req.body; // 'up' | 'down'
    const inc = direction === 'down' ? -1 : 1;

    const material = await StudyMaterial.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: inc } },
      { new: true },
    );
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json({ likes: material.likes });
  } catch (err) {
    console.error('Error updating likes:', err);
    res.status(500).json({ error: 'Failed to update likes' });
  }
});

// ADMIN: change status (active/flagged/removed)
router.post('/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can change status' });
    }
    const { status } = req.body;
    if (!['active', 'flagged', 'removed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const material = await StudyMaterial.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json({ message: 'Status updated', material });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
