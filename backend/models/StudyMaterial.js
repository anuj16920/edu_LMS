// backend/models/StudyMaterial.js
const mongoose = require('mongoose');

const StudyFileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number, required: true }, // bytes
}, { _id: false });

const StudyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  subject: { type: String, required: true, trim: true },
  course: { type: String, required: true, trim: true }, // e.g. CSE, ECE
  files: {
    type: [StudyFileSchema],
    validate: v => Array.isArray(v) && v.length > 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uploadedByName: { type: String, required: true },
  downloads: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  isPinned: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['active', 'flagged', 'removed'],
    default: 'active',
  },
}, { timestamps: true });

module.exports = mongoose.model('StudyMaterial', StudyMaterialSchema);
