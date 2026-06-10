const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shift.controller');

// Khai báo các đường dẫn API tương ứng với các hàm trong controller
router.get('/', shiftController.getAllShifts);
router.post('/', shiftController.createShift);
router.delete('/:id', shiftController.deleteShift);
router.put('/:id', shiftController.updateShift);

module.exports = router;