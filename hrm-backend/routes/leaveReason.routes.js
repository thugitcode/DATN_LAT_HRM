const express = require('express');
const router = express.Router();
const leaveReasonController = require('../controllers/leaveReason.controller');

router.get('/', leaveReasonController.getAll);
router.get('/funds', leaveReasonController.getFunds); // Cổng lấy quỹ nghỉ đổ vào dropdown
router.post('/', leaveReasonController.create);
router.put('/:id', leaveReasonController.update);
router.delete('/:id', leaveReasonController.delete);

module.exports = router;