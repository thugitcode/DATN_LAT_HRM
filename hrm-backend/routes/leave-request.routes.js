const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/leave-request.controller');

router.patch('/:id/approve',  ctrl.approve);
router.patch('/:id/cancel',   ctrl.cancel);
router.patch('/:id/reject',   ctrl.reject);
router.post('/:id/approve',   ctrl.approve);
router.post('/:id/reject',    ctrl.reject);
router.get('/:id',            ctrl.getById);
router.get('/',               ctrl.getAll);
router.post('/',              ctrl.create);

module.exports = router;