const express = require('express');
const router = express.Router();
const salaryScaleController = require('../controllers/salaryScale.controller');

// Trỏ các tuyến đường về đúng hàm xử lý trong Controller
router.get('/', salaryScaleController.getScales);
router.post('/', salaryScaleController.createScale);
router.put('/:id', salaryScaleController.updateScale);
router.put('/toggle/:id', salaryScaleController.toggleScaleStatus);
router.delete('/:id', salaryScaleController.deleteScale);

module.exports = router;