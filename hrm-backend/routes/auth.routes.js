const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    let user = null;

    const [rows] = await db.query(
      `SELECT u.id AS userId, u.username, u.role, u.employee_id, u.status,
              e.full_name, e.email, e.avatar
       FROM users u
       LEFT JOIN hr_employees e ON e.id = u.employee_id
       WHERE u.username = ? AND u.password = ? AND u.status = 'active'
       LIMIT 1`,
      [username, password]
    );

    if (rows.length) {
      const row = rows[0];
      user = {
        id: row.employee_id || row.userId,
        userId: row.userId,
        username: row.username,
        role: row.role,
        employee_id: row.employee_id,
        full_name: row.full_name,
        email: row.email,
        avatar: row.avatar,
      };
    }

    // Tài khoản admin mặc định
    if (!user && username === 'admin' && password === '123456') {
      user = { id: 0, userId: 0, username: 'admin', full_name: 'Quản trị viên', role: 'admin' };
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu!' });
    }

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

// POST /api/auth/change-password
router.post('/change-password', async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    // Kiểm tra mật khẩu cũ
    const [rows] = await db.query(
      `SELECT id FROM users WHERE id = ? AND password = ? AND status = 'active' LIMIT 1`,
      [userId, oldPassword]
    );
    if (!rows.length) {
      return res.status(400).json({ success: false, message: 'Mật khẩu cũ không chính xác' });
    }

    // Cập nhật mật khẩu mới
    await db.query(`UPDATE users SET password = ? WHERE id = ?`, [newPassword, userId]);
    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch(e) {
    console.error('[auth] change-password error:', e.message);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

module.exports = router;