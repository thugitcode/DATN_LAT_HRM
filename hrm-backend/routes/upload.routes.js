const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const ctrl     = require('../controllers/upload.controller');

// Cấu hình multer lưu file vào thư mục uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.get('/signed-url',     ctrl.getSignedUrl);          // GET  /upload/signed-url
router.post('/',               upload.single('file'),  ctrl.upload);         // POST /upload
router.post('/multiple',       upload.array('files', 10), ctrl.uploadMultiple); // POST /upload/multiple
router.delete('/',             ctrl.delete);               // DELETE /upload

module.exports = router;