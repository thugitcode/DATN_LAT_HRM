const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/attendance-explanation.controller');

router.post('/seed-mock',          ctrl.seedMock);
router.post('/bulk-approve',       ctrl.bulkApprove);
router.post('/:id/approve',        ctrl.approve);
router.post('/:id/manager-approve',ctrl.managerApprove);
router.post('/:id/reject',         ctrl.reject);
router.get('/:id',                 ctrl.getById);
router.get('/',                    ctrl.getAll);

module.exports = router;