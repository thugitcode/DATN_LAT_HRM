import express from 'express';
import { login } from '../controllers/authController.js';

const router = express.Router();

// Định nghĩa API gọi chức năng đăng nhập (Phương thức POST)
router.post('/login', login);

export default router;