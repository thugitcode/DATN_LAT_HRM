import db from '../config/db.js';

export const login = async (req, res) => {
    // Nhận dữ liệu tài khoản từ Frontend gửi lên
    const { username, password } = req.body;

    try {
        // Kiểm tra xem có khớp tài khoản trong Database không
        const [users] = await db.query(
            'SELECT * FROM users WHERE username = ? AND password = ? AND status = "active"',
            [username, password]
        );

        if (users.length > 0) {
            const user = users[0];
            delete user.password; // Tuyệt đối không gửi lại mật khẩu về Frontend để bảo mật

            res.json({
                success: true,
                message: 'Đăng nhập thành công!',
                data: user
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Sai tên đăng nhập hoặc mật khẩu!'
            });
        }
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ Backend!' });
    }
};