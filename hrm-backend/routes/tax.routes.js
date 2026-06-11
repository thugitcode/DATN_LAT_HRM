const express = require('express');
const router = express.Router();
const taxController = require('../controllers/tax.controller');

// 1. Lấy dữ liệu cấu hình (GET http://localhost:5000/api/v1/tax-configs)
router.get('/', taxController.getConfig);

// 2. Đồng bộ dữ liệu (PUT http://localhost:5000/api/v1/tax-configs)
router.put('/', taxController.updateConfig); // 🌟 ĐẢM BẢO ĐỂ DẤU '/' VÀ PHƯƠNG THỨC LÀ router.put

// 🌟 ĐỒNG THỜI: Check kỹ xem cuối file đã có dòng xuất bản này chưa:
module.exports = router;