const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/hospital-lookup', async (req, res) => {
  try {
    // Bốc nhanh danh mục Khoa và Phòng từ Database để phục vụ Dropdown ngoài FE
    const [departments] = await db.query('SELECT code, name FROM cat_departments WHERE status = "ACTIVE"');
    const [rooms] = await db.query('SELECT code, name FROM cat_rooms WHERE status = "ACTIVE"');
    
    res.status(200).json({ success: true, departments, rooms });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;