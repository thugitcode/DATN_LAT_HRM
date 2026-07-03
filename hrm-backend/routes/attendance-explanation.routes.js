const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/attendance-explanation.controller');

router.post('/bulk-approve',       ctrl.bulkApprove);
router.get('/for-manager/:managerId', ctrl.getForManager);
router.post('/:id/approve',        ctrl.approve);
router.post('/:id/manager-approve',ctrl.managerApprove);
router.post('/:id/reject',         ctrl.reject);
router.patch('/:id',               ctrl.update);
router.get('/:id',                 ctrl.getById);
router.get('/',                    ctrl.getAll);
router.post('/',                   ctrl.create);

module.exports = router;