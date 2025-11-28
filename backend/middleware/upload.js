const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directories
const tutorialsDir = path.join(__dirname, '../uploads/tutorials');
const assignmentsDir = path.join(__dirname, '../uploads/assignments');
const chatDir = path.join(__dirname, '../uploads/chat'); // ✅ ADD THIS

if (!fs.existsSync(tutorialsDir)) {
  fs.mkdirSync(tutorialsDir, { recursive: true });
}

if (!fs.existsSync(assignmentsDir)) {
  fs.mkdirSync(assignmentsDir, { recursive: true });
}

if (!fs.existsSync(chatDir)) { // ✅ ADD THIS
  fs.mkdirSync(chatDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isAssignment = req.baseUrl.includes('assignments');
    const isChat = req.baseUrl.includes('chat'); // ✅ ADD THIS
    const uploadDir = isAssignment 
      ? assignmentsDir 
      : isChat 
      ? chatDir  // ✅ ADD THIS
      : tutorialsDir;
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, nameWithoutExt + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /mp4|mov|avi|mkv|pdf|doc|docx|zip|rar|jpg|jpeg|png|gif/; // ✅ ADD IMAGES
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only video, PDF, DOC, images and ZIP files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: fileFilter
});

module.exports = upload;
