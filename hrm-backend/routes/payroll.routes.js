const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/payroll.controller');

router.get('/by-month/status',   ctrl.getStatus);
router.get('/by-month',          ctrl.getByMonth);
router.get('/periods',           ctrl.getPeriods);
router.get('/feedback',          ctrl.getFeedback);
router.get('/staff/:id/history', ctrl.getStaffHistory);

module.exports = router;