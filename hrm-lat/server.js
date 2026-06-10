import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import file kết nối DB (phải có đuôi .js)
import db from './src/config/db.js';

import authRoutes from './src/api_routes/authRoutes.js';

import shiftRoutes from './src/api_routes/shiftRoutes.js';

dotenv.config();

// Tạo biến __dirname cho chuẩn ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Mọi API liên quan đến tài khoản sẽ bắt đầu bằng /api/auth
app.use('/api/auth', authRoutes);

app.use('/api', shiftRoutes);
// API kiểm tra kết nối Database
app.get('/api/check-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users');
        res.json({ 
            success: true, 
            message: "Kết nối MySQL thành công rực rỡ!", 
            data: rows 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi kết nối Database!" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Máy chủ HRM đã khởi động tại link: http://localhost:${PORT}`);
});