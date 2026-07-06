const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboard.controller');

router.get('/summary', ctrl.getSummary);
router.get('/reports', ctrl.getReports);

module.exports = router;