const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');

// ✅ Mở song song cả 2 cổng để tương thích tuyệt đối với FE có sẵn trên máy bạn
router.get('/', employeeController.getEmployeesByTab);

router.get('/tabs', employeeController.getEmployeesByTab);
router.get('/:id', employeeController.getEmployeeById);

router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.patch('/:id/status', employeeController.toggleStatus);
router.put('/:id/reset-faceid', employeeController.resetFaceID);

module.exports = router;