const express = require('express');
const router = express.Router();
const masterCtrl = require('../controllers/masterData.controller');

router.get('/hospital-lookup', masterCtrl.getHospitalMasterData);

module.exports = router;