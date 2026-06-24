const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Thử bảng users trước
    let user = null;
    try {
      const [rows] = await db.query(
        `SELECT * FROM users WHERE username=? AND password=? AND status='active' LIMIT 1`,
        [username, password]
      );
      if (rows.length) user = rows[0];
    } catch(e) {}

    // Fallback: thử hr_employees
    if (!user) {
      const [rows] = await db.query(
        `SELECT id, employee_code as username, full_name, 'hr' as role FROM hr_employees 
         WHERE employee_code=? AND status='ACTIVE' LIMIT 1`,
        [username]
      );
      if (rows.length) user = rows[0];
    }

    // Tài khoản admin mặc định
    if (!user && username === 'admin' && password === '123456') {
      user = { id: 0, username: 'admin', full_name: 'Quản trị viên', role: 'admin' };
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu!' });
    }

    delete user.password;
    res.json({ success: true, message: 'Đăng nhập thành công!', data: user });
  } catch(e) {
    console.error('[auth] login error:', e.message);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ!' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Đăng xuất thành công!' });
});

module.exports = router;