const path = require('path');
const fs   = require('fs');
const db   = require('../config/db');

// Thư mục lưu file upload
const UPLOAD_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const uploadController = {

  // POST /upload — Upload 1 file (avatar, document)
  upload: async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ statusCode: 400, message: 'Không có file được gửi lên' });

      const { originalname, mimetype, size, filename } = req.file;
      const filePath = `uploads/${filename}`;

      res.status(200).json({
        statusCode: 200,
        success: true,
        data: {
          url:      `${req.protocol}://${req.get('host')}/${filePath}`,
          fileName: originalname,
          fileType: mimetype,
          filePath: filePath,
          fileSize: size,
        },
        message: 'Upload thành công',
      });
    } catch (e) {
      res.status(500).json({ statusCode: 500, message: 'Lỗi upload', error: e.message });
    }
  },

  // POST /upload/multiple — Upload nhiều file
  uploadMultiple: async (req, res) => {
    try {
      if (!req.files?.length) return res.status(400).json({ statusCode: 400, message: 'Không có file nào được gửi lên' });

      const data = req.files.map(f => ({
        url:      `${req.protocol}://${req.get('host')}/uploads/${f.filename}`,
        fileName: f.originalname,
        fileType: f.mimetype,
        filePath: `uploads/${f.filename}`,
        fileSize: f.size,
      }));

      res.status(200).json({ statusCode: 200, success: true, data, message: 'Upload thành công' });
    } catch (e) {
      res.status(500).json({ statusCode: 500, message: 'Lỗi upload', error: e.message });
    }
  },

  // GET /upload/signed-url?filePath=uploads/xxx
  // Với local storage thì trả thẳng URL public luôn (không cần sign)
  getSignedUrl: async (req, res) => {
    try {
      const { filePath, expiresIn = 3600 } = req.query;
      if (!filePath) return res.status(400).json({ statusCode: 400, message: 'Thiếu filePath' });

      // Với local file server thì trả URL trực tiếp
      const url = filePath.startsWith('http')
        ? filePath
        : `${req.protocol}://${req.get('host')}/${filePath}`;

      res.status(200).json({
        statusCode: 200,
        success: true,
        status: 200,
        data: url,
        message: 'success',
      });
    } catch (e) {
      res.status(500).json({ statusCode: 500, message: 'Lỗi lấy signed URL', error: e.message });
    }
  },

  // DELETE /upload — Xóa file
  delete: async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ statusCode: 400, message: 'Thiếu url' });

      // Xóa file local nếu có
      const filePath = path.join(__dirname, '../', url.replace(/^https?:\/\/[^/]+\//, ''));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      res.status(200).json({ statusCode: 200, success: true, message: 'Đã xóa file' });
    } catch (e) {
      res.status(500).json({ statusCode: 500, message: 'Lỗi xóa file', error: e.message });
    }
  },
};

module.exports = uploadController;