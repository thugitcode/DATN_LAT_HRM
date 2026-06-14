const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/staff-salary.controller');

router.get('/staff/:staffId',   ctrl.getByStaff);
router.patch('/staff/:staffId', ctrl.updateByStaff);

module.exports = router;